var chalk = require('chalk');
var ft = require('../../utils/ft');
var tSettings = require('../../config/transmission');

module.exports = function (configFileName, args, commandLineArg, done) {
	tSettings.transmissionSettingsToConfig(args.transmission, args.config['transmission-settings'], function (err, tConf) {
		if (err)
		{
			console.log(chalk.red('Could not get transmission settings, error : '), err);
			return done();
		}
		args.config['transmission-settings'] = tConf;
		ft.jsonToFile(configFileName, args.config, function (err) {
			if (err)
				console.log(chalk.red('Could not write to configuration file: "' + configFileName + '"'));
			else
				console.log(chalk.green('Configuration file: "' + configFileName + '" was successfully updated'));
			return done();
		});
	});
};
