var fs = require('fs');
var util = require('util');
var chalk = require('chalk');
var File = require('../models/File');


module.exports = function (configFileName, args) {
	File.find({ isFinished: true })
		.select('-name -size -creator -hashstring -isFinished -downloads -privacy -comments -locked -grades -createdAt -torrentAddedAt')
		.exec(function (err, files) {
			if (err)
				console.log(chalk.red('An error occured while fetching the files from database:\n'), err);
			else
			{
				console.log(chalk.green(util.format('Currently %d files are in the database', files.length)));
				var errors = [];
				files.forEach(function (file) {
					try {
						fs.accessSync(file.path, fs.F_OK | fs.R_OK | fs.W_OK);
					} catch (e) {
						var err  = { path: file.path };
						if (e.code == 'ENOENT')
							err.error = chalk.red("This file does not exist anymore:");
						else if (e.code == 'EACCES')
							err.error = chalk.yellow("You may not have the rights to access this file:");
						errors.push(err);
					}
				});
				if (errors.length <= 0)
					console.log(chalk.green("No errors were found in the database"));
				else
				{
					console.log(chalk.yellow(util.format('%d errors were found in the database:', errors.length)));
					errors.forEach(function (err) {
						console.log(' - ', err.error);
						console.log('    ', err.path);
					});
				}
			}
			return ;
			// process.exit();
		});
};
