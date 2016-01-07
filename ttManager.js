var fs = require('fs');
var util = require('util');
var mini = require('minimist');
var chalk = require('chalk');
var commands = require('./manager/commands');
var Arguments = require('./manager/arguments');

var configFileName = './config.json';
// var configFileName = './toto.json';

var scriptArguments = {
	string: ['user'],
	boolean: []
};

for (var command in commands)
	scriptArguments[commands[command].type].push(command);

var argvOg = mini(process.argv.slice(2));
var argvParsed = mini(process.argv.slice(2), scriptArguments);

var functionArgs = null;

var callCommand = function (name, command, commandLineArg, done) {
	var fnArgs = Object.keys(command.functionArg);
	var i = 0;
	(function loop() {
		var arg = fnArgs[i++];
		if (!arg)
		{
			console.log(chalk.green(util.format('-- %s :', name)));
			require('./manager/commands.d/' + name)(configFileName, command.functionArg, commandLineArg, done);
			return ;
		}
		if (functionArgs === null)
		{
			functionArgs = new Arguments(configFileName, argvOg, argvParsed);
		}
		functionArgs.getArgument(arg, function (ret) {
			command.functionArg[arg] = ret;
			loop();
		});
	})();
};

var checkCommand = function (name, done) {
	if (commands[name].type == 'string' && argvOg[name] && (argvParsed[name] != '' || commands[command].mandatoryStr == false ))
		callCommand(name, commands[name], argvParsed[name], done);
	else if (commands[name].type == 'string' && argvOg[name] && argvParsed[name] == '')
	{
		console.log('Usage: ' + commands[name].usage);
		done();
		//ajouter message erreur si pas d'arg
	}
	else if (commands[name].type == 'boolean' && argvParsed[name] == true)
		callCommand(name, commands[name], '', done);
	else
		done();
};

var commandNames = Object.keys(commands);
var i = 0;
(function next () {
	var name = commandNames[i++];
	if (!name)
		process.exit();
	else
		checkCommand(name, function () {
			next();
		});
})();
