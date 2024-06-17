var util = require('util');
var chalk = require('chalk');

var keyValidityError = function (key, arborescence, configFileName) {
	return (chalk.red(util.format('%s configuration file has no property %s', configFileName, arborescence) + chalk.underline(key)) + '(try to update config with ttManager)');
};

var errorMessage = function (key, value, arborescence, configFileName) {
	var error = chalk.red(util.format("Value '%s' for key: %s%s is wrong", value, arborescence, chalk.underline(key)));
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

var checkArrayError = function checkArrayError(toMatch, arr, arborescence, configFileName) {
	var errors = [];
	for (var item in arr)
	{
		for (var key in toMatch)
		{
			if (toMatch[key].hasOwnProperty('type') && item.hasOwnProperty(key))
			{
				if (toMatch[key].type != typeof item[key])
					errors.push(typeValidityError(key, item[key], toMatch[key].type, arborescence, configFileName));
				else if (toMatch[key].switch == true)
				{
					if (toMatch[key].values.indexOf(item[key]) == -1)
						errors.push(switchValidityError(key, item[key], toMatch[key].values, arborescence, configFileName));
				}
				if (toMatch[key].type == "number" && toMatch[key].range == true)
				{
					if (item[key] < toMatch[key].rangeValues.min || item[key] > toMatch[key].rangeValues.max)
						errors.push(rangeValidityError(key, item[key], toMatch[key].rangeValues, arborescence, configFileName));
				}
			}
		}
	}
	return errors;
};

module.exports = {
	checkConfig: function checkConfig (config, defaultConfig, arborescence, configFileName) {
		var errors = [];
		for (var key in defaultConfig)
		{
			if (typeof defaultConfig[key] == 'object')
			{
				if (defaultConfig[key].hasOwnProperty('type') && config.hasOwnProperty(key))
				{
					if (defaultConfig[key].type != typeof config[key] && defaultConfig[key].type != 'array')
						errors.push(typeValidityError(key, config[key], defaultConfig[key].type, arborescence, configFileName));
					else if (defaultConfig[key].type == 'array' && Array.isArray(config[key]))
					{
						var arrayError = checkArrayError(defaultConfig[key].match, config[key], arborescence, configFileName);
						if (arrayError.length > 0)
							errors = errors.concat(arrayError);
					}
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
					errors = errors.concat(checkConfig(config[key], defaultConfig[key], arborescence + key + " -> ", configFileName));
				else
					errors.push(keyValidityError(key, arborescence, configFileName));
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
