var fs = require('fs');
var chalk = require('chalk');
var configDefault = require('../config/default-config');
var ft = require('../utils/ft');

var addExtra = function (config, newConf) {
	for (var key in config)
	{
		if (!(newConf.hasOwnProperty(key)))
			newConf[key] = config[key];
	}
	return (newConf);
};

var updateConfigFile = function updateConfigFile (config, defaultConf) {
	var newConf = {};
	for (var key in defaultConf)
	{
		if (typeof defaultConf[key] == 'object' && defaultConf[key].hasOwnProperty('type'))
			newConf[key] = config.hasOwnProperty(key) ? config[key] : defaultConf[key].default;
		else if (typeof defaultConf[key] == 'object')
			newConf[key] = config.hasOwnProperty(key) ? updateConfigFile(config[key], defaultConf[key]) : updateConfigFile({}, defaultConf[key]);
	}
	return (addExtra(config, newConf));
};

module.exports = function (configFileName, args) {
	try {
		fs.accessSync(configFileName, fs.F_OK | fs.W_OK);
		var newConfig = updateConfigFile(args.config, configDefault);
		ft.jsonToFile(configFileName, newConfig, function (err) {
			if (err)
				console.log(chalk.red('Could not write to configuration file: "' + configFileName + '"'));
			else
				console.log(chalk.green('Configuration file: "' + configFileName + '" was successfully updated'));

		});
	} catch (e) {
		if (e.code == 'EACCES')
			console.log(chalk.red('You have no rights to write on ' + configFileName + ', please change rights of the file before updating it'));
	}
};
