var fs = require('fs');
var mongoose = require('mongoose');
var TransmissionNode = require('../transmission/transmissionNode');
var File = require('../models/File.js');
var Wall = require('../models/Wall.js');
var validity = require('./validity');

var getMongoConnex = function (mongoConfig) {
	var connex = mongoose.connect("mongodb://" + mongoConfig.address + '/' + mongoConfig.name, function (err) {
		if (err)
		{
			console.log('database: connection error', err);
			console.log("Could not connect to database, exiting process");
			process.exit();
		}
		else
			console.log('database: connection successful');
	});
	return connex;
};

var checkTransmissionSettings = function (t, tSettings) {
	t.sessionGet(function (err, res) {
		if (err)
		{
			console.log("Could not retreive 'transmission' session infos");
			process.exit();
		}
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
						console.log("Could not set session for transmission");
						process.exit();
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
		config: null,
		configDefault: null,
		connexionDb: null,
		transmission: null
	};

	infos.config = JSON.parse(fs.readFileSync(infos.configFileName, 'utf8'));
	infos.configDefault = require('./default-config');
	var validityError = validity.checkConfig(infos.config, infos.configDefault, "", infos.configFileName);
	if (validity.checkConfigErrors(validityError, infos.configFileName))
		process.exit();
	infos.connexionDb = getMongoConnex(infos.config.mongodb);
	infos.transmission = new TransmissionNode(infos.config.transmission);
	checkTransmissionSettings(infos.transmission, infos.config['transmission-settings']);
	checkFileSettings(infos.config.files, infos.transmission);
	checkDashboardSettings(infos.config.dashboard);
	return infos;
};
