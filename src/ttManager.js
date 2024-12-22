import util from 'util';
import mini from 'minimist';
import chalk from 'chalk';
import commands from './manager/commands.js'
import Arguments from './manager/arguments.js';

var configFileName = './config.json';

var scriptArguments = {
	string: ['user'],
	boolean: []
};

for (var command in commands)
	scriptArguments[commands[command].type].push(command);

var commandNames = Object.keys(commands);

var argvOg = mini(process.argv.slice(2));
var argvParsed = mini(process.argv.slice(2), scriptArguments);

var isCommand = false;

for (var i = 0; i < commandNames.length; i++) {
	if (argvParsed[commandNames[i]])
		isCommand = true;
}

if (!isCommand) {
	console.log('Usage : node ttManager [[--help] ...]');
	process.exit();
}

var functionArgs = null;

var initializeArgument = function (command) {
	var fnArgs = Object.keys(command.functionArg);
	var i = 0;
	(function loop() {
		var arg = fnArgs[i++];
		if (!arg) {
			return;
		}
		if (functionArgs === null) {
			functionArgs = new Arguments(configFileName, argvOg, argvParsed);
		}
		functionArgs.getArgument(arg, function (ret) {
			command.functionArg[arg] = ret;
			loop();
		});
	})();
}

var callCommand = function (name, command, commandLineArg, done) {
	initializeArgument(command);
	console.log(chalk.green(util.format('-- %s :', name)));
	import('./manager/commands.d/' + name + '.js')
		.then(module => {
			module.default(configFileName, command.functionArg, commandLineArg, done)
		})
		.catch(err => {
			console.error('Error loading module:', err)
		})
};

var checkCommand = function (name, done) {
	if (commands[name].type == 'string' && argvOg[name] && (argvParsed[name] != '' || commands[command].mandatoryStr == false))
		callCommand(name, commands[name], argvParsed[name], done);
	else if (commands[name].type == 'string' && argvOg[name] && argvParsed[name] == '') {
		console.log('Usage: ' + commands[name].usage);
		done();
	}
	else if (commands[name].type == 'boolean' && argvParsed[name] == true)
		callCommand(name, commands[name], '', done);
	else
		done();
};

var commandNames = Object.keys(commands);
var i = 0;
(function next() {
	var name = commandNames[i++];
	if (!name)
		process.exit();
	else
		checkCommand(name, function () {
			next();
		});
})();
