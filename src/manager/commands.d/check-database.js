var fs = require('fs');
var util = require('util');
var chalk = require('chalk');
var File = require('../../models/File');


module.exports = function (configFileName, args, commandLineArg, done) {
	var checkUnfinishedFiles = function () {
		var unfinishedErrors = [];
		File.find({ isFinished: false })
			.select('-size -creator -isFinished -downloads -privacy -comments -locked -grades -createdAt -torrentAddedAt')
			.exec(function (err, files) {
				if (err)
					console.log(chalk.red('An error occured while fetching the files from database:\n'), err);
				else
				{
					console.log(chalk.green(util.format('Currently %d files are incomplete in the database', files.length)));
					var i = 0;
					var filesLength = files.length;
					(function loop () {
						var file = files[i++];
						if (!file)
						{
							if (unfinishedErrors.length <= 0)
								console.log(chalk.green("No errors were found in the database"));
							else
							{
								console.log(chalk.yellow(util.format('%d unfinished files were found in the database and not in transmission:', unfinishedErrors.length)));
								unfinishedErrors.forEach(function (err) {
									console.log('    ', err);
								});
							}
							return done();
						}
						args.transmission.torrentGet(['name'], file.hashString, function (err, infos) {
							if (infos.torrents.length == 0)
								unfinishedErrors.push(file.name);
							loop();
						});
					})();
				}
			});
	};

	File.find({ isFinished: true })
		.select('-name -size -creator -hashString -isFinished -downloads -privacy -comments -locked -grades -createdAt -torrentAddedAt')
		.exec(function (err, files) {
			if (err)
				console.log(chalk.red('An error occured while fetching the files from database:\n'), err);
			else
			{
				console.log(chalk.green(util.format('Currently %d files are complete in the database', files.length)));
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
			checkUnfinishedFiles();
			// return done();
		});
};
