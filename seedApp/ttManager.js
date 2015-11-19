
/**
 * - ajout d'un dossier de film deja present (+ path)
 * - verification de la conformite de la bdd
 * + verification de la conformite du fichier de config
 * + mise a jour du fichier de config depuis transmission
 * + mise a jour de transmission depuis le fichier de config
 * + generation du fichier de config
 * - ajout des torrents non suivis dans la db
 * ????
 *
 */

var fs = require('fs');
var mini = require('minimist');
var chalk = require('chalk');
var inquirer = require('inquirer');
var validity = require('./config/validity');
var generate = require('./config/generate');
var tSettings = require('./config/transmission');
var TransmissionNode = require('./transmission/transmissionNode');
var ft = require('./utils/ft');

var miniOpt = {
	string: ['add-directory'],
	boolean: ['check-database', 'check-conf-file', 'transmission-to-conf', 'conf-to-transmission', 'generate-conf']
};

var configFileName = './config.json';
// var configFileName = './toto.json';
var argvOg = mini(process.argv.slice(2));
var argvParsed = mini(process.argv.slice(2), miniOpt);
console.log('og> ', argvOg);
console.log('1> ', argvParsed);


var getConfigFile = function () {
	try {
		var data = fs.readFileSync(configFileName, 'utf8');
		var config = JSON.parse(data);
		return (config);
	} catch (e) {
		if (e.code == 'ENOENT')
		{
			console.log(chalk.yellow('The file ' + configFileName + ' does not exist\n') + chalk.green('Use --generate-conf to create a new configuration file'));
		}
		else if (e.code == 'EACCES')
		{
			console.log(chalk.yellow('You does not have right to access "' + configFileName + '"\n') + chalk.green('Please change rights to grant access to the file'));
		}
		return (null);
	}
};


var writeToConfigFile = function (newConfig, action) {
	ft.jsonToFile(configFileName, newConfig, function (err) {
		if (err)
			console.log(chalk.red('Could not write to configuration file: "' + configFileName + '"'));
		else
			console.log(chalk.green('Configuration file: "' + configFileName + '" was successfully ' + action));
	});

};



/**
 * CONFIGURATION VALIDATION
 */
if (argvParsed['check-conf-file'])
{
	fs.readFile(configFileName, 'utf8', function (err, data) {
		if (err)
		{
			if (err.code == 'ENOENT')
			{
				console.log(chalk.yellow('The file ' + configFileName + ' does not exist\n') + chalk.green('Use --generate-conf to create a new configuration file'));
			}
			else if (err.code == 'EACCES')
			{
				console.log(chalk.yellow('You does not have right to access "' + configFileName + '"\n') + chalk.green('Please change rights to grant access to the file'));
			}
		}
		else
		{
			var config = JSON.parse(data);
			var configDefault = JSON.parse(fs.readFileSync('./config/default-config.json', 'utf8'));
			var valErr = validity.checkConfig(config, configDefault, '', configFileName);
			validity.checkConfigErrors(valErr, configFileName);
		}
	});
}


var generateConfigurationFile = function () {
	var configDefault = JSON.parse(fs.readFileSync('./config/default-config.json', 'utf8'));
	var newConfig = generate.configFromDefault(configDefault);

	var questions = [
		{
			type: "input",
			name: "appPort",
			message: "Choose a port for this application:\n > ",
			default: function () { return (newConfig['appPort']); },
			validate: function (value) {
				if (value < configDefault['appPort']['rangeValues']['min'] || value > configDefault['appPort']['rangeValues']['max'])
					return ("Port must be between " + configDefault['appPort']['rangeValues']['min'] + " and " + configDefault['appPort']['rangeValues']['max']);
				return true;
			}
		},
		{
			type: "input",
			name: "secret",
			message: "Choose a secret for this application, it will be use to encode the passwords, don't tell it to anyone !:\n > ",
			validate: function (value) {
				if (value === '')
					return chalk.red('Please enter a secret');
				else
					return true;
			}
		},
		{
			type: 'input',
			name: 'mongodb:address',
			message: "Enter the address of your mongo database:\n > ",
			default: function () { return newConfig['mongodb']['address']; }
		},
		{
			type: 'input',
			name: 'mongodb:name',
			message: "Enter the name of your database:\n > ",
			default: function () { return newConfig['mongodb']['name']; }
		},
		{
			type: 'input',
			name: 'transmission:address',
			message: "Enter the address of your transmission client:\n > ",
			default: function () { return newConfig['transmission']['address']; }
		},
		{
			type: 'input',
			name: 'transmission:port',
			message: "Enter the port of your transmission client:\n > ",
			default: function () { return newConfig['transmission']['port']; }
		},
		{
			type: 'input',
			name: 'transmission:url',
			message: "Enter the url to access to transmission rpc:\n > ",
			default: function () { return newConfig['transmission']['url']; }
		},
		{
			type: "input",
			name: "transmission-settings:download-dir",
			message: "Choose a download directory for your files:\n " + chalk.yellow('if you want to use transmission download-dir, leave this field blank and run this script with "--transmission-to-conf" after generating this configuration file') + "\n > ",
			validate: function (value) {
				if (value !== '')
				{
					try {
						fs.accessSync(value, fs.F_OK | fs.R_OK | fs.W_OK);
						var stats = fs.statSync(value);
						if (stats.isDirectory())
							return true;
						else
							return chalk.red(value + ' is not a directory, please enter a valid directory');
					}
					catch (err) {
						return chalk.red('Invalid directory, check the rights of the directory "' + value + '", this process must have read and write rights on the directory') + err;
					}
				}
				else
					return true;
			}
		}
	];
	console.log(chalk.green('Please select the settings for your applications:\n') + "Leaving the field blank and pressing enter will use default value");
	inquirer.prompt(questions, function (answers) {
		for (var key in answers)
		{
			var split = key.split(':');
			var conf = newConfig;
			var len = split.length;
			for (var i = 0; i < (len - 1); i++)
				conf = conf[split[i]];
			conf[split[len - 1]] = answers[key];
		}
		writeToConfigFile(newConfig, 'created');
	});
};

/**
 * CONFIGURATION GENERATION
 */
if (argvParsed['generate-conf'])
{
	var genConf = true;
	try {
		fs.accessSync(configFileName, fs.F_OK | fs.W_OK);
		inquirer.prompt([
			{	type: 'confirm',
			 	name: 'overwrite',
			 	message: configFileName + ' already exist, do you want to overwrite it ?'
			}], function (answers) {
				if (answers.overwrite)
					generateConfigurationFile();
			 });
	}
	catch (e) {
		if (e.code == 'EACCES')
			console.log(chalk.red('File already exist and you have no rights to access it, please change rights of "' + configFileName + '" to perform this action'));
		else
			generateConfigurationFile();
	}
}


if (argvParsed['conf-to-transmission'] || argvParsed['transmission-to-conf'])
{
	var config = getConfigFile();
	var transmission = new TransmissionNode(config.transmission);
}

/**
 * CONFIGURATION FILE TO TRANSMISSION SETTINGS
 */
if (argvParsed['conf-to-transmission'])
{
	tSettings.configToTransmissionSettings(transmission, config['transmission-settings'], function (err) {
		if (err)
			process.exit();
		console.log(chalk.green("Transmission was successfully updated from configuration file"));
	});
}


/**
 *  TRANSMISSION SETTINGS TO CONFIGURATION FILE
 */
if (argvParsed['transmission-to-conf'])
{
	tSettings.transmissionSettingsToConfig(transmission, config['transmission-settings'], function (err, tConf) {
		if (err)
			process.exit();
		config['transmission-settings'] = tConf;
		writeToConfigFile(config, 'updated');
	});
}
