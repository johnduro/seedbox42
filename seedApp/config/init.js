var mongoose = require('mongoose');
var TransmissionNode = require('../transmission/transmissionNode');
var File = require('../models/File.js');
var Wall = require('../models/Wall.js');
var fs = require('fs');

var configFileError = function (message) {
	console.log(message);
	process.exit();
};

var errorMessage = function (key, value, arborescence, configFileName) {
	console.log("Error in config file: %s", configFileName);
	console.log("Value '%s' for key: %s%s is wrong", value, arborescence, key);
};

var typeValidityError = function (key, value, typeWanted, arborescence, configFileName) {
	errorMessage(key, value, arborescence, configFileName);
	console.log("%s type is %s when it should be %s", key, typeof value, typeWanted);
	process.exit();
};

var switchValidityError = function (key, value, possibleValues, arborescence, configFileName) {
	errorMessage(key, value, arborescence, configFileName);
	console.log("%s is a switch, only possible values are : ", key, possibleValues);
	process.exit();
};

var rangeValidityError = function (key, value, rangeValues, arborescence, configFileName) {
	errorMessage(key, value, arborescence, configFileName);
	console.log("%s must be between %s and %s included", key, rangeValues.min, rangeValues.max);
	process.exit();
};

var checkConfigValidity = function self (config, defaultConfig, arborescence, configFileName) {
	for (var key in defaultConfig)
	{
		if (typeof defaultConfig[key] == 'object')
		{
			if (defaultConfig[key].hasOwnProperty('type') && config.hasOwnProperty(key))
			{
				if (defaultConfig[key].type != typeof config[key])
					typeValidityError(key, config[key], defaultConfig[key].type, arborescence, configFileName);
				else
				{
					if (defaultConfig[key].switch == true)
					{
						if (defaultConfig[key].values.indexOf(config[key]) == -1)
							switchValidityError(key, config[key], defaultConfig[key].values, arborescence, configFileName);
					}
					if (defaultConfig[key].type == "number" && defaultConfig[key].range == true)
					{
						if (config[key] < defaultConfig[key].rangeValues.min || config[key] > defaultConfig[key].rangeValues.max)
							rangeValidityError(key, config[key], defaultConfig[key].rangeValues, arborescence, configFileName);
					}
				}
			}
			else if (config.hasOwnProperty(key) && typeof config[key] == 'object')
				self(config[key], defaultConfig[key], arborescence + key + " -> ", configFileName);
			else
				configFileError("Config file has no property: " + key);
		}
	}
};

var getMongoConnex = function (mongoConfig) {
	var connex = mongoose.connect("mongodb://" + mongoConfig.address + '/' + mongoConfig.name, function (err) {
		if (err)
		{
			console.log('database: connection error', err);
			configFileError("Could not connect to database, exiting process");
		}
		else
			console.log('database: connection successful');
	});
	return connex;
};

var checkTransmissionSettings = function (t, tSettings) {
	t.sessionGet(function (err, res) {
		if (err)
			configFileError("Could not retreive 'transmission' session infos");
		else
		{
			var tMod = {};
			for (var key in tSettings)
			{
				if (res.hasOwnProperty(key))
				{
					if (res[key] != tSettings[key])
						tMod[key] = tSettings[key];
				}
			}
			if (Object.keys(tMod).length > 0)
			{
				t.sessionSet(tMod, function (err, res) {
					if (err)
					{
						console.log("session set error: ", err);
						configFileError("Could not set session for transmission");
					}
				});
			}
		}
	});
};

var checkFileSettings = function (fSettings, transmission) {
	if (fSettings['auto-remove-lock-enabled'])
	{
		File.removeDayLock(fSettings['auto-remove-lock'], function (err, files) {
			if (err)
				console.log("error::checkFileSettings::removeDayLock:: ", err);
		});
	}
	if (fSettings["auto-delete-enabled"])
	{
		File.removeOldFile(fSettings["auto-delete"], transmission, function (err, files) {
			if (err)
				console.log("error::checkFileSettings::removeOldFile:: ", err);
		});
	}
};

var checkDashboardSettings = function (dSettings) {
	Wall.count({}, function (err, count) {
		if (err)
			console.log("error::checkDashboardSettings:: ", err);
		else
		{
			if (count > dSettings["mini-chat-message-limit"])
				Wall.deleteXOldMessages(count - dSettings["mini-chat-message-limit"]);
		}
	});

};

module.exports = function () {
	var infos = {
		configFileName: './config.json',
		configDefaultName: './config/default-config.json',
		config: null,
		configDefault: null,
		connexionDB: null,
		transmission: null
	};

	infos.config = JSON.parse(fs.readFileSync(infos.configFileName, 'utf8'));
	infos.configDefault = JSON.parse(fs.readFileSync(infos.configDefaultName, 'utf8'));
	checkConfigValidity(infos.config, infos.configDefault, "", infos.configFileName);
	infos.connexionDB = getMongoConnex(infos.config.mongodb);
	infos.transmission = new TransmissionNode(infos.config.transmission);
	checkTransmissionSettings(infos.transmission, infos.config['transmission-settings']);
	checkFileSettings(infos.config.files, infos.transmission);
	checkDashboardSettings(infos.config.dashboard);
	return infos;
};
