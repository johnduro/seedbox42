import chalk from 'chalk';
import commands from '../commands.js';

export default function (configFileName, args, commandLineArg, done) {
	for (var command in commands)
	{
		console.log(chalk.green(command + ':'));
		console.log('Usage: ' + commands[command].usage);
		console.log('Description: ' + commands[command].help + '\n');
	}
	return done();
};
