var File = require('../../models/File');
var User = require('../../models/User');
var ft = require('../../utils/ft');
var chalk = require('chalk');

module.exports = function (configFileName, args, commandLineArg, done) {
	User.find({}, function (err, users) {
		if (err)
		{
			console.log(chalk.red('Error gettting data from db'));
			return done();
		}
		else
		{
			var i = 0;
			(function loop () {
				var user = users[i++];
				if (!user)
					return done();
				ft.getUserPwHash(user.password, function (err, hash) {
					if (err)
					{
						console.log(chalk.red('Error getting hash : '), err);
						loop();
					}
					else
					{
						user.password = hash;
						user.save(function (err) {
							if (err)
								console.log(chalk.red('Error saving document'), user);
							loop();
						});
					}
				});
			})();
		}
	});
	// File.find({}, function (err, files) {
	// 	if (err)
	// 		console.log(chalk.red('Error gettting data from db'));
	// 	else
	// 	{
	// 		files.forEach(function (file) {
	// 			file.commentsNbr = file.comments.length;
	// 			file.averageGrade = file.getAverageGrade();
	// 			file.save();
	// 		});
	// 	}
	// 	return done();
	// });
};
