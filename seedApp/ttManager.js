
/**
 * + verification de la conformite de la bdd
 * + verification de la conformite du fichier de config
 * + mise a jour du fichier de config depuis transmission
 * + mise a jour de transmission depuis le fichier de config
 * + generation du fichier de config
 * + ajout d'un dossier de film deja present (+ path)
 * + ajout des torrents non suivis dans la db
 * + creation d'utilisateur
 * - modification d'utilisateur
 * ????
 */

var fs = require('fs');
var mongoose = require('mongoose');
var mini = require('minimist');
var chalk = require('chalk');
var inquirer = require('inquirer');
var util = require('util');
var btoa = require('btoa');
var mime = require('mime');
var validity = require('./config/validity');
var generate = require('./config/generate');
var tSettings = require('./config/transmission');
var TransmissionNode = require('./transmission/transmissionNode');
var File = require('./models/File');
var User = require('./models/User');
var ft = require('./utils/ft');
var format = require('./utils/format');
var filesInfos = require('./utils/filesInfos');

var miniOpt = {
	string: ['add-directory'],
	boolean: ['check-database', 'check-conf-file', 'transmission-to-conf', 'conf-to-transmission', 'generate-conf', 'add-existing-torrents', 'create-user']
};

// var configFileName = './config.json';
var configFileName = './toto.json';
var argvOg = mini(process.argv.slice(2));
var argvParsed = mini(process.argv.slice(2), miniOpt);
// console.log('og> ', argvOg);
// console.log('1> ', argvParsed);


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


if (argvParsed['conf-to-transmission'] || argvParsed['transmission-to-conf'] || argvParsed['check-database'] || (argvOg['add-directory'] && argvParsed['add-directory'] != '') || argvParsed['add-existing-torrents'] || argvParsed['create-user'])
{
	var config = getConfigFile();
	var transmission = new TransmissionNode(config.transmission);
}

/**
 *  CONFIGURATION FILE TO TRANSMISSION SETTINGS
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


/**
 *  CHECK DATABASE VALIDITY
 */
if (argvParsed['check-database'])
{
	mongoose.connect("mongodb://" + config.mongodb.address + '/' + config.mongodb.name, function (err) { //faire un fichier mongo, dans config, de connexion >?
		if (err)
		{
			console.log(chalk.red("Could not connect to database, please check your configuration file"));
			process.exit();
		}
		else
		{
			File.find({ isFinished: true })
				.select('-name -size -creator -hashstring -isFinished -downloads -privacy -comments -locked -grades -createdAt -torrentAddedAt')
				.exec(function (err, files) {
					if (err)
						console.log(chalk.red('An error occured while fetching the files from database:\n'), err);
					else
					{
						console.log(chalk.green(util.format('Currently %d files are in the database', files.length)));
						var errors = [];
						files.forEach(function (file) {
							try {
								fs.accessSync(file.path, fs.F_OK | fs.R_OK | fs.W_OK);
							} catch (e) {
								var err  = { path: file.path };
								if (e.code == 'ENOENT')
									err.error = chalk.red("This file does not exist anymore:");
								else if (e.code == 'EACCES')
									err.error = chalk.yellow("You may not have the rights to access this file:");
								errors.push(err);
							}
						});
						if (errors.length <= 0)
							console.log(chalk.green("No errors were found in the database"));
						else
						{
							console.log(chalk.yellow(util.format('%d errors were found in the database:', errors.length)));
							errors.forEach(function (err) {
								console.log(' - ', err.error);
								console.log('    ', err.path);
							});
						}
					}
					process.exit();
				});
		}
	});
}


if (argvOg['add-directory'] && argvParsed['add-directory'] != '')
{
	mongoose.connect("mongodb://" + config.mongodb.address + '/' + config.mongodb.name, function (err) { //faire un fichier mongo, dans config, de connexion >?
		User.findOne({ role: 0 }).sort({ createdAt: -1 }).exec( function (err, user) {
			if (err)
			{
				console.log(chalk.red("Could not connect to database, please check your configuration file"));
				process.exit();
			}
			else if (user == null)
			{
				console.log(chalk.red('No admin in database, please create one using "--create-user" command'));
				process.exit();
			}
			else
			{
				if (argvParsed['add-directory'].slice(-1) == '/')
					argvParsed['add-directory'] = argvParsed['add-directory'].slice(0, -1);
				filesInfos.getDirInfos(argvParsed['add-directory'], function (err, data) {
					if (err)
					{
						console.log(chalk.red(util.format('"%s" is an invalid directory, please choose another, error:')));
						console.log(err);
					}
					else
					{
						ft.checkExistentFiles(data, function (err, result) {
							if (err)
								console.log(chalk.red('An error occured while accessing the database'));
							else
							{
								var formated = format.managerAddDirectory(result);
								inquirer.prompt([
									{
										type: "checkbox",
										message: "Select files you want to add to your database",
										name: "files",
										choices: formated.choices
									}
								], function (answers) {
									var i = 0;
									(function next () {
										var file = answers.files[i++];
										if (!file)
											process.exit();
										File.insertFile(formated.filesObj[file], user._id, btoa(formated.filesObj[file].path),function (err, fileAd) {
											if (err)
												console.log(chalk.red(util.format('An error occured while adding "%s" to the database', file.name)));
											else
												console.log(chalk.green(util.format('File "%s" was successfully added to the database', fileAd.name)));
											next();
										});
									})();
								});
							}
						});
					}
				});
			}
		});
	});
}
else if (argvOg['add-directory'] && argvParsed['add-directory'] == '')
{
	console.log(util.format('Usage: "./ttManager --add-directory path/to/directory"'));
}


if (argvParsed['add-existing-torrents'])
{
	mongoose.connect("mongodb://" + config.mongodb.address + '/' + config.mongodb.name, function (err) { //faire un fichier mongo, dans config, de connexion >?
		User.findOne({ role: 0 }).sort({ createdAt: -1 }).exec( function (err, user) {
			if (err)
			{
				console.log(chalk.red("Could not connect to database, please check your configuration file"));
				process.exit();
			}
			else if (user == null)
			{
				console.log(chalk.red('No admin in database, please create one using "--create-user" command'));
				process.exit();
			}
			else
			{
				transmission.torrentGet(['hashString', 'name', 'downloadDir', 'totalSize', "status", "leftUntilDone", "percentDone"], {}, function (err, resp) {
					if (err)
						console.log(chalk.red("An error occured while retreiving torrents from transmission, check your configuration, error : "), err);
					else
					{
						console.log(chalk.green(util.format("%d torrent(s) found in transmission", resp.torrents.length)));
						var i = 0;
						var counter = 0;
						(function next() {
							var torrent = resp.torrents[i++];
							if (!torrent)
							{
								console.log(chalk.green(util.format("%d torrent(s) were added to the database", counter)));
								process.exit();
							}
							var path = torrent.downloadDir + '/' + torrent.name;
							File.findOne({ $or: [ { hashString: torrent.hashString }, { path: path } ] }, function (err, file) {
								if (err)
								{
									console.log(chalk.red("There was an issue with the database, error: "), err);
									process.exit();
								}
								else if (file == null)
								{
									if (torrent['leftUntilDone'] === 0 && torrent["percentDone"] === 1.0 && (torrent["status"] > 4 || torrent['status'] == 0))
									{
										var fileToInsert = {
											path: path,
											size: torrent.totalSize,
											fileType: filesInfos.fileTypeSync(path)
										};
										File.insertFile(fileToInsert, user._id, torrent.hashString, function (err, file) {
											if (err)
												console.log(chalk.red(util.format("There was an issue inserting %s to the database, error: ", torrent.name)), err);
											else
											{
												console.log(chalk.green(util.format("%s successfully added to the database", file.name)));
												counter++;
											}
											next();
										});
									}
									else
									{
										File.createFile(torrent, user._id, function (err, file) {
											if (err)
												console.log(chalk.red(util.format("There was an issue inserting %s to the database, error: ", torrent.name)), err);
											else
											{
												console.log(chalk.green(util.format("%s successfully added to the database", file.name)));
												counter++;
											}
											next();
										});
									}
								}
								else
									next();
							});
						})();
					}
				});
			}
		});
	});
}


if (argvParsed['create-user'])
{
	mongoose.connect("mongodb://" + config.mongodb.address + '/' + config.mongodb.name, function (err) { //faire un fichier mongo, dans config, de connexion >?
		if (err)
			console.log(chalk.red('Could not connect to database, please check your configuration'));
		else
		{
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
					process.exit();
				});
			});
		}
	});
}
