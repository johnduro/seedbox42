import chalk from 'chalk';
import inquirer from 'inquirer';
import util from 'util';
import File from '../../models/File.js';
import filesInfos from '../../utils/filesInfos.js';
import ft from '../../utils/ft.js';
import format from '../../utils/format.js';

export default async function (configFileName, args, commandLineArg, done) {
	if (!commandLineArg || commandLineArg === '') {
		commandLineArg = '/downloads/complete';
	}

	if (commandLineArg.slice(-1) === '/') {
		commandLineArg = commandLineArg.slice(0, -1);
	}

	try {
		const data = await filesInfos.getDirInfos(commandLineArg);
		const result = await ft.checkExistentFiles(data);

		const formated = format.managerAddDirectory(result);
		const allFilesChoice = 'ALL FILES - ' + chalk.yellow('/!\\ add all files but selected /!\\');
		const cancelChoice = chalk.red('CANCEL');
		formated.choices.unshift({ name: allFilesChoice, value: 'ALL_FILES' });
		formated.choices.unshift({ name: cancelChoice, value: 'CANCEL' });

		const answers = await inquirer.prompt([
			{
				type: 'checkbox',
				message: "Select files you want to add to your database (Press <space> to select, <a> to toggle all, <i> to invert selection) or 'ALL FILES' to add all files but selected",
				name: 'files',
				choices: formated.choices,
				pageSize: 20
			},
		]);

		if (answers.files.includes('CANCEL')) {
			console.log(chalk.yellow('Operation cancelled'));
			done();
			return;
		}

		let allFiles = false;
		let filesToAdd = [];
		if (answers.files.includes('ALL_FILES')) {
			allFiles = true;
			filesToAdd = Object.keys(formated.filesObj);
		} else {
			filesToAdd = answers.files;
		}

		console.log('Files to add:', filesToAdd.length);

		for (const file of filesToAdd) {
			if (allFiles && answers.files.includes(file)) {
				continue;
			}

			console.log('Inserting file:', file);
			try {
				const fileObj = formated.filesObj[file];
				if (!fileObj) {
					console.error('File object not found for:', file);
					continue;
				}
				const hash = Buffer.from(fileObj.path).toString('base64');
				await File.insertFile(fileObj, args.user._id, hash);
				console.log('Successfully inserted:', fileObj.path);
			} catch (e) {
				console.error('Error inserting file:', file, e.message);
			}
		}

		done();
	} catch (err) {
		if (err.message.includes('invalid directory')) {
			console.log(chalk.red(util.format('"%s" is an invalid directory, please choose another, error:', commandLineArg)), err);
		} else if (err.message.includes('database')) {
			console.log(chalk.red('An error occurred while accessing the database'));
		} else {
			console.log(chalk.red('An unexpected error occurred'), err);
		}
		done(err);
	}
};