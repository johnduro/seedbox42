var chalk = require('chalk');
var inquirer = require('inquirer');
var util = require('util');
var btoa = require('btoa');
var File = require('../../models/File');
var filesInfos = require('../../utils/filesInfos');
var ft = require('../../utils/ft');
var format = require('../../utils/format');

module.exports = function (configFileName, args, commandLineArg, done) {
	if (commandLineArg.slice(-1) == '/')
		 commandLineArg = commandLineArg.slice(0, -1);
	filesInfos.getDirInfos(commandLineArg, function (err, data) {
		if (err)
		{
			console.log(chalk.red(util.format('"%s" is an invalid directory, please choose another, error:', commandLineArg)), err);
			console.log(err);
			return done();
		}
		else
		{
			ft.checkExistentFiles(data, function (err, result) {
				if (err)
				{
					console.log(chalk.red('An error occured while accessing the database'));
					return done();
				}
				else
				{
					var formated = format.managerAddDirectory(result);
					var allFilesChoice = ('ALL FILES - ' + chalk.yellow('/!\\ add all files but selected /!\\'));
					formated.choices.unshift({ name: allFilesChoice });
					inquirer.prompt([
						{
							type: "checkbox",
							message: "Select files you want to add to your database or 'ALL FILES' to add all files but selected",
							name: "files",
							choices: formated.choices
						}
					], function (answers) {
						var allFiles = false;
						var filesToAdd = [];
						var i = 0;
						if (answers.files[0] === allFilesChoice)
						{
							allFiles = true;
							filesToAdd = Object.keys(formated.filesObj);
						}
						else
							filesToAdd = answers.files;
						(function next () {
							var file = filesToAdd[i++];
							if (!file)
								return done();
							if (allFiles && answers.files.indexOf(file) > -1)
								next();
							else
							{
								File.insertFile(formated.filesObj[file], args.user._id, btoa(formated.filesObj[file].path), function (err, fileAd) {
									if (err)
										console.log(chalk.red(util.format('An error occured while adding "%s" to the database', file.name)));
									else
										console.log(chalk.green(util.format('File "%s" was successfully added to the database', fileAd.name)));
									next();
								});
							}
						})();
					});
				}
			});
		}
	});

};
