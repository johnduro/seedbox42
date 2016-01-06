var chalk = require('chalk');
var commands = require('../commands');

module.exports = function (configFileName, args, commandLineArg, done) {
	for (var command in commands)
	{
		console.log(chalk.green(command + ':'));
		console.log('Usage: ' + commands[command].usage);
		console.log('Description: ' + commands[command].help + '\n');
	}
	return done();
};
