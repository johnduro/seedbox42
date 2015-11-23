var inquirer = require('inquirer');
var chalk = require('chalk');
var User = require('../models/User');

module.exports = function (configFileName, args) {
	var questions = [
		{
			type: 'input',
			name: "login",
			message: "Choose a login for this user:\n > ",
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
			message: "Choose a password:\n > ",
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
			message: "Enter this user email:\n > ",
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
			filter: function (value) {
				return ((value === 'admin') ? 0 : 1);
			}
		}

	];
	inquirer.prompt(questions, function (answers) {
		User.create(answers, function (err, newUser) {
			if (err)
				console.log(chalk.red("An error occured while creating the user"));
			else
				console.log(chalk.green("User successfully created"));
			// process.exit();
		});
	});
};
