import inquirer from 'inquirer';
import chalk from 'chalk';
import User from '../../models/User.js';

export default async function (configFileName, args, commandLineArg, done) {
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
			choices: ['admin', 'user']
		}

	];

	try {
		const answers = await inquirer.prompt(questions);
		answers.avatar = args.config.users['default-avatar'];
		await User.createNew(answers);
		console.log(chalk.green("User successfully created"));
	} catch (err) {
		console.log(chalk.red("An error occurred while creating the user: "), err);
	} finally {
		done();
	}
};
