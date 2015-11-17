/**
 * ajout d'un dossier de film deja present (+ path)
 * verification de la conformite de la bdd
 * verification de la conformite du fichier de config
 * mise a jour du fichier de config depuis transmission
 * mise a jour de transmission depuis le fichier de config
 * generation du fichier de config
 * ????
 *
 */
var fs = require('fs');
// var accessSync = require('fs').accessSync;
var mini = require('minimist');
var chalk = require('chalk');
var inquirer = require('inquirer');
var validity = require('./config/validity');
var generate = require('./config/generate');

var miniOpt = {
	string: ['add-directory'],
	boolean: ['check-database', 'check-conf-file', 'transmission-to-conf', 'conf-to-transmission', 'generate-conf']
};

var configFileName = './config.json';
var argvOg = mini(process.argv.slice(2));
var argvParsed = mini(process.argv.slice(2), miniOpt);
console.log('og> ', argvOg);
console.log('1> ', argvParsed);



/**
 * CONFIGURATION VALIDATION
 */
if (argvParsed['check-conf-file'])
{
	// var configFileName = './config.json';
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


/**
 * CONFIGURATION GENERATION
 */
if (argvParsed['generate-conf'])
{
	var configDefault = JSON.parse(fs.readFileSync('./config/default-config.json', 'utf8'));
	var newConfig = generate.configFromDefault(configDefault);

	var questions = [
		{
			type: "input",
			name: "appPort",
			message: "Choose a port for this application:\n > ",
			default: function () { return (newConfig['appPort']); },
			validate: function (value) { //check if number
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
			name: "download-dir",
			message: "Choose a download directory for your files:\n " + chalk.yellow('if you want to use transmission download-dir, leave this field blank and run this script with "--transmission-to-conf" after generating this configuration file') + "\n > ",
			validate: function (value) {
				if (value !== '')
				{
					try {
						var stats = fs.statSync(value);
						if (stats.isDirectory())
							return true;
							// console.log('YOLO');
						// console.log(stats);
					}
					catch (err) {
						return chalk.red('Invalid directory, check the rights of the directory "' + value + '"') + err;
					}
				}
					// return ;
				else
					return true;
			}
		},


	];

	inquirer.prompt(questions, function (answers) {
		console.log('ANS > ', answers);
	});
	// if (newConfig.hasOwnProperty('transmission-settings') && newConfig['transmission-settings'].hasOwnProperty('download-dir'))
	// {

	// }
	// console.log('?>>', newConfig);
	// for (var key in configDefault)
}
