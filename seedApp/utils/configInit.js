var mongoose = require('mongoose');
var TransmissionNode = require('../utils/transmissionNode');
var File = require('../models/File.js');


var configFileError = function (message) {
	console.log(message);
	process.exit();
};

var cfPropertys = {
	'mongodb': ['address', 'name'],
	'transmission': ['address', 'port', 'url'],
	'transmission-settings': ["download-dir", "incomplete-dir-enabled", "incomplete-dir", "rename-partial-files", "start-added-torrents", "seedRatioLimited", "seedRatioLimit", "peer-limit-global", "peer-limit-per-torrent", "blocklist-enabled", "blocklist-url", "speed-limit-down-enabled", "speed-limit-down", "speed-limit-up-enabled", "speed-limit-up", "alt-speed-enabled", "alt-speed-down", "alt-speed-up", "alt-speed-time-enabled", "alt-speed-time-begin", "alt-speed-time-day", "alt-speed-time-end", "peer-port", "peer-port-random-on-start", "speed-limit-down", "speed-limit-down-enabled", "speed-limit-up", "speed-limit-up-enabled", "seed-queue-enabled", "seed-queue-size", "download-queue-enabled", "download-queue-size", "cache-size-mb", "dht-enabled", "encryption", "idle-seeding-limit", "idle-seeding-limit-enabled", "lpd-enabled", "pex-enabled", "queue-stalled-enabled", "queue-stalled-minutes", "script-torrent-done-enabled", "script-torrent-done-filename", "trash-original-torrent-files", "utp-enabled", "port-forwarding-enabled"],
	'torrents': ['add-torrent-enabled', 'delete-torrent-enabled', 'settings-access-enabled'],
	'files': ['show-creator', 'lock-enabled', 'comments-enabled', 'grades-enabled', 'auto-remove-lock-enabled', 'auto-remove-lock', 'auto-delete-enabled', 'auto-delete'],
	'dashboard': ["recent-file-enabled", "recent-user-file-enabled", "recent-user-locked-file-enabled", "file-number-exhibit", "disk-space-enabled", "disk-space-user-enabled", "mini-chat-enabled", "mini-chat-message-limit"]
};

var checkCatValidity = function (cf, propertys, cat) {
	propertys.map(function (property) {
		if (!(cf.hasOwnProperty(property)))
			configFileError("config file has no property '" + property + "' in category: '" + cat + "'");
	});
};

var checkFileValidity = function (cf) {
	var categories = ['mongodb', 'transmission', 'transmission-settings', 'torrents', 'files', 'dashboard'];
	categories.map(function (categorie) {
		if (cf.hasOwnProperty(categorie))
			checkCatValidity(cf[categorie], cfPropertys[categorie], categorie);
		else
			configFileError("config file has no property '" + categorie + "'");
	});
};

var getMongoConnex = function (mongoConfig) {
	var connex = mongoose("mongodb://" + mongoConfig.address + '/' + mongoConfig.name, function (err) {
		if (err)
		{
			console.log('database: connection error', err);
			configFileError("Could not connect to database, exiting process");
		}
		else
			console.log('database: connection successful');
	});
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
						configFileError("could not set session for transmission");
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
				console.log("ERROR > ", err);
			else
				console.log("SUCCESS AUTO LOCK > ", files);
		});
	}
	if (fSettings["auto-delete-enabled"])
	{
		File.removeOldFile(fSettings["auto-delete"], transmission, function (err, files) {
			if (err)
				console.log("ERROR > ", err);
			else
				console.log("SUCCESS REMOVE FILE");
		});
	}
	//FAIRE L AUTO DELETE // REVOIR LE REMOVE LOCK POUR QU IL N ENLEVE QU UN LOCK
};

var configInit = function (configFile) {
	checkFileValidity(configFile);
	// var connexionDB = getMongoConnex(configFile.mongodb); //OK??
	var transmission = new TransmissionNode(configFile.transmission);
	checkTransmissionSettings(transmission, configFile['transmission-settings']);
	checkFileSettings(configFile.files, transmission);
	// si problemes :
	// process.exit();
	var ret = {
		// 'connexionDB': connexionDB,
		'transmission': transmission
	};
	return configFile;
};


module.exports = configInit;
