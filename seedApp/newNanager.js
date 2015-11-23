var fs = require('fs');
var mongoose = require('mongoose');
var mini = require('minimist');
var chalk = require('chalk');
var TransmissionNode = require('./transmission/transmissionNode');
var User = require('./models/User');
var commands = require('./manager/commands');

// var configFileName = './config.json';
var configFileName = './toto.json';

var scriptArguments = {
	string: ['user'],
	boolean: []
};

var functionArgs = {
	config: null,
	mongo: null,
	transmission: null,
	user: null
};
//make options for minimist

for (var command in commands)
	scriptArguments[commands[command].type].push(command);

var argvOg = mini(process.argv.slice(2));
var argvParsed = mini(process.argv.slice(2), scriptArguments);

console.log('arguments: ', scriptArguments);
console.log('original: ', argvOg);
console.log('parsed: ', argvParsed);


var getConfig = function (done) {
	try {
		var data = fs.readFileSync(configFileName, 'utf8');
		var config = JSON.parse(data);
		return done(config);
	} catch (e) {
		if (e.code == 'ENOENT')
		{
			console.log(chalk.yellow('The file ' + configFileName + ' does not exist\n') + chalk.green('Use --generate-conf to create a new configuration file'));
			process.exit();
		}
		else if (e.code == 'EACCES')
		{
			console.log(chalk.yellow('You does not have right to access "' + configFileName + '"\n') + chalk.green('Please change rights to grant access to the file'));
			process.exit();
		}
		return done(null);
	}
};

var getTransmission = function (done) {
	var transmission = null;
	if (functionArgs['config'] === null)
	{
		getConfig(function (config) {
			functionArgs.config = config;
			transmission = new TransmissionNode(config.transmission);
			done(transmission);
		});
	}
	else
	{
		transmission = new TransmissionNode(functionArgs.config.transmission);
		done(transmission);
	}
};

var getMongo = function (done) {
	var getConnect = function (mongoConf, cb) {
		var ret = mongoose.connect("mongodb://" + mongoConf.address + '/' + mongoConf.name, function (err) {
			if (err)
			{
				console.log(chalk.red("Could not connect to database, please check your configuration file or your database"));
				process.exit();
			}
			else
				cb(ret);
		});
	};
	if (functionArgs['config'] === null)
	{
		getConfig(function (config) {
			functionArgs.config = config;
			getConnect(functionArgs['config'].mongodb, function (connect) {
				done(connect);
			});
		});
	}
	else
	{
		getConnect(functionArgs['config'].mongodb, function (connect) {
			done(connect);
		});
	}
};

var getUser = function (done) {
	var userQuery = function (cb) {
		var query = {};
		if (argvOg['user'] && argvParsed['user'] != '')
			query.login = argvParsed['user'];
		else
			query.role = 0;
		User.findOne(query).sort({ createdAt: -1 }).exec( function (err, user) {
			if (err)
			{
				console.log(chalk.red("There was an error retreiving the user, please your database configuration"));
				process.exit();
			}
			else if (user == null)
			{
				console.log(chalk.red('No admin in database, please create one using "--create-user" command'));
				process.exit();
			}
			else
				cb(user);
		});
	};
	if (functionArgs['mongo'] === null)
	{
		getMongo(function (mongo) {
			functionArgs.mongo = mongo;
			userQuery(function (user) {
				done(user);
			});
		});
	}
	else
	{
		userQuery(function (user) {
			done(user);
		});
	}
};

//METTRE DANS MANAGER/UTIL !!!!!!!!!!!!!!! OUPA
var getArg = {
	config: getConfig,
	mongo: getMongo,
	transmission: getTransmission,
	user: getUser
};




var getFunctionArg = function (arg, done) {
	if (functionArgs[arg] === null)
	{
		getArg[arg](function (ret) {
			functionArgs[arg] = ret;
			done(ret);
		});
	}
	else
		done(functionArgs[arg]);
};

var callCommand = function (name, command, commandLineArg) {
	var fnArgs = Object.keys(command.functionArg);
	var i = 0;
	(function loop() {
		var arg = fnArgs[i++];
		if (!arg)
		{
			console.log('calling : ', name);
			console.log('with: ', command.functionArg);
			console.log('arg: ', arg);
			require('./manager/' + name)(configFileName, command.functionArg, commandLineArg);
			return ;
		}
		getFunctionArg(arg, function (ret) {
			command.functionArg[arg] = ret;
			loop();
		});
	})();
};

for (var name in commands)
{
	if (commands[name].type == 'string' && argvOg[name] && (argvParsed[name] != '' || commands[command].mandatoryStr == false ))
		callCommand(name, commands[name], argvParsed[name]);
	else if (commands[name].type == 'string' && argvOg[name] && argvParsed[name] == '')
		console.log('Usage: ' + commands[name].usage);
		//ajouter message erreur si pas d'arg
	else if (commands[name].type == 'boolean' && argvParsed[name] == true)
		callCommand(name, commands[name]);
}
