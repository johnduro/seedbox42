var inquirer = require('inquirer');
var chalk = require('chalk');
var User = require('../../models/User');

module.exports = function (configFileName, args, commandLineArg, done) {
	User.findOne({ login: commandLineArg }, function (err, user) {
		if (err)
		{
			console.log(chalk.red("An error occured while getting the user : "), err);
			return done();
		}
		else
		{
			// console.log('USER > ', user);
			var questions = [
				{
					type: 'input',
					name: 'login',
					message: 'Login:\n >',
					default: function () { return (user.login); },
					validate: function (value) {
						if (value === '')
							return chalk.red('Please enter a login');
						else
							return true;
					}
				},
				{
					type: 'password',
					name: 'password',
					message: "Password:\n > ",
					default: function () { return (user.password); },
					validate: function (value) {
						if (value === '')
							return chalk.red('Please enter a password');
						else
							return true;
					}
				},
				{
					type: 'input',
					name: "mail",
					message: "Email:\n > ",
					default: function () { return (user.mail); },
					validate: function (value) {
						if (value === '')
							return chalk.red('Please enter a valid email');
						else
							return true;
					}
				},
				{
					type: 'list',
					name: 'role',
					message: 'Choose the rights of this user:',
					choices: ['admin', 'user'],
					default: function () { return ((user.role === 0) ? 'admin' : 'user'); },
					filter: function (value) {
						return ((value === 'admin') ? 0 : 1);
					}
				}
			];
			console.log(chalk.yellow('Enter new values for this user detail or press enter to keep the olds one: '));
			inquirer.prompt(questions, function (answers) {
				user.login = answers.login;
				user.password = answers.password;
				user.mail = answers.mail;
				user.role = answers.role;
				user.save(function (err) {
					if (err)
						console.log(chalk.red("An error happened wile saving the user"));
					return done();
				});
			});
		}
	});
};
