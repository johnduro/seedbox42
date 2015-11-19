var util = require('util');
var chalk = require('chalk');

var configFileError = function (message) {
	return (chalk.red(message));
};

var errorMessage = function (key, value, arborescence, configFileName) {
	var error = chalk.red(util.format("Value '%s' for key: %s%s is wrong", value, arborescence, key));
	return (error + "\n");
};

var typeValidityError = function (key, value, typeWanted, arborescence, configFileName) {
	var ret = errorMessage(key, value, arborescence, configFileName);
	ret += chalk.green(util.format("%s type is %s when it should be %s", key, typeof value, typeWanted));
	return ret;
};

var switchValidityError = function (key, value, possibleValues, arborescence, configFileName) {
	var ret = errorMessage(key, value, arborescence, configFileName);
	ret += chalk.green(util.format("%s is a switch, only possible values are : ", key, possibleValues));
	return ret;
};

var rangeValidityError = function (key, value, rangeValues, arborescence, configFileName) {
	var ret = errorMessage(key, value, arborescence, configFileName);
	ret += chalk.green(util.format("%s must be between %s and %s included", key, rangeValues.min, rangeValues.max));
	return ret;
};

module.exports = {
	checkConfig: function self (config, defaultConfig, arborescence, configFileName) {
		var errors = [];
		for (var key in defaultConfig)
		{
			if (typeof defaultConfig[key] == 'object')
			{
				if (defaultConfig[key].hasOwnProperty('type') && config.hasOwnProperty(key))
				{
					if (defaultConfig[key].type != typeof config[key])
						errors.push(typeValidityError(key, config[key], defaultConfig[key].type, arborescence, configFileName));
					else
					{
						if (defaultConfig[key].switch == true)
						{
							if (defaultConfig[key].values.indexOf(config[key]) == -1)
								errors.push(switchValidityError(key, config[key], defaultConfig[key].values, arborescence, configFileName));
						}
						if (defaultConfig[key].type == "number" && defaultConfig[key].range == true)
						{
							if (config[key] < defaultConfig[key].rangeValues.min || config[key] > defaultConfig[key].rangeValues.max)
								errors.push(rangeValidityError(key, config[key], defaultConfig[key].rangeValues, arborescence, configFileName));
						}
					}
				}
				else if (config.hasOwnProperty(key) && typeof config[key] == 'object')
					errors = errors.concat(self(config[key], defaultConfig[key], arborescence + key + " -> ", configFileName));
				else
					configFileError("Config file has no property: " + key);
			}
		}
		return errors;
	},

	checkConfigErrors: function (errors, configFileName) {
		if (errors.length > 0)
		{
			console.log(chalk.yellow(util.format("Error in config file: %s", configFileName)));
			for (var i = 0; i < errors.length; i++)
				console.log(errors[i]);
			return true;
		}
		console.log(chalk.green(util.format("No errors in config file: %s", configFileName)));
		return false;
	}
}
