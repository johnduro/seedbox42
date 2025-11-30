import chalk from 'chalk';
import ft from '../../utils/ft.js';
import tSettings from '../../config/transmission.js';

export default function (configFileName, args, commandLineArg, done) {
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
