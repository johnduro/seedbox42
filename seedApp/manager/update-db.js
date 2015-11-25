var File = require('../models/File');
var chalk = require('chalk');

module.exports = function (configFileName, args) {
	File.find({}, function (err, files) {
		if (err)
			console.log(chalk.red('Error gettting data from db'));
		else
		{
			files.forEach(function (file) {
				file.commentsNbr = file.comments.length;
				file.averageGrade = file.getAverageGrade();
				file.save();
			});
		}
	});
};
