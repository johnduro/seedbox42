import inquirer from 'inquirer';
import chalk from 'chalk';
import User from '../../models/User.js';
import ft from '../../utils/ft.js';

module.exports = async function (configFileName, args, commandLineArg, done) {
	try {
		const user = await User.findOne({ login: commandLineArg }).exec();
		if (!user) {
			console.log(chalk.red("User not found"));
			return done();
		}

		const questions = [
			{
				type: 'input',
				name: 'login',
				message: 'Login:\n >',
				default: () => user.login,
				validate: (value) => value === '' ? chalk.red('Please enter a login') : true
			},
			{
				type: 'password',
				name: 'password',
				message: "Password:\n > ",
				validate: (value) => value === '' ? chalk.red('Please enter a password') : true
			},
			{
				type: 'input',
				name: "mail",
				message: "Email:\n > ",
				default: () => user.mail,
				validate: (value) => value === '' ? chalk.red('Please enter a valid email') : true
			},
			{
				type: 'list',
				name: 'role',
				message: 'Choose the rights of this user:',
				choices: ['admin', 'user'],
				default: () => user.role === 'admin' ? 'admin' : 'user'
			}
		];

		console.log(chalk.yellow('Enter new values for this user detail or press enter to keep the old ones: '));
		const answers = await inquirer.prompt(questions);

		user.login = answers.login;
		user.mail = answers.mail;
		user.role = answers.role;

		const hash = await ft.getUserPwHash(answers.password);
		user.password = hash;

		await user.save();
		console.log(chalk.green("User updated successfully"));
		done();
	} catch (err) {
		console.log(chalk.red("An error occurred: "), err);
		done();
	}
};
