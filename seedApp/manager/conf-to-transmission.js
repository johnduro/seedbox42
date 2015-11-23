var chalk = require('chalk');
var tSettings = require('../config/transmission');

module.exports = function (configFileName, args) {
	tSettings.configToTransmissionSettings(args.transmission, args.config['transmission-settings'], function (err) {
		if (err)
		{
			console.log(chalk.red("Could not set transmission settings, please check configuration and/or transmission"));
			process.exit();
		}
		else
			console.log(chalk.green("Transmission was successfully updated from configuration file"));
	});
};
