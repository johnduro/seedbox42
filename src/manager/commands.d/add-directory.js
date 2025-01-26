import chalk from 'chalk';
import inquirer from 'inquirer';
import util from 'util';
import btoa from 'btoa';
import File from '../../models/File.js';
import filesInfos from '../../utils/filesInfos.js';
import ft from '../../utils/ft.js';
import format from '../../utils/format.js';

export default async function (configFileName, args, commandLineArg, done) {
	if (commandLineArg.slice(-1) === '/') {
		commandLineArg = commandLineArg.slice(0, -1);
	}

	try {
		const data = await filesInfos.getDirInfos(commandLineArg);
		const result = await ft.checkExistentFiles(data);

		const formated = format.managerAddDirectory(result);
		const allFilesChoice = 'ALL FILES - ' + chalk.yellow('/!\\ add all files but selected /!\\');
		formated.choices.unshift({ name: allFilesChoice });

		const answers = await inquirer.prompt([
			{
				type: 'checkbox',
				message: "Select files you want to add to your database or 'ALL FILES' to add all files but selected",
				name: 'files',
				choices: formated.choices,
			},
		]);

		let allFiles = false;
		let filesToAdd = [];
		if (answers.files[0] === allFilesChoice) {
			allFiles = true;
			filesToAdd = Object.keys(formated.filesObj);
		} else {
			filesToAdd = answers.files;
		}


		for (const file of filesToAdd) {
			if (allFiles && answers.files.includes(file)) {
				continue;
			}

			await File.insertFile(formated.filesObj[file], args.user._id, btoa(formated.filesObj[file].path));
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