import fs from 'fs';
// import mongoose from 'mongoose';
import TransmissionNode from '../transmission/transmissionNode.js';
import File from '../models/File.js';
import Wall from '../models/Wall.js';
import validity from './validity.js';
import defaultConfig from './default-config.js';
import connectDb from '../database/database.js';

/* var getMongoConnex = async function (mongoConfig) {
    try {
//        await mongoose.connect("mongodb://" + mongoConfig.address + '/' + mongoConfig.name);
        await mongoose.connect("mongodb://mongouser:mongopass@mongodb:27017/seedapp"); // todo variabilize
        console.log('Connected to the database!');
        return mongoose.connection; // You can return the connection or any other value
    } catch (err) {
        console.log('Connection to the database failed!', err);
        process.exit();
    }
}; */

var checkTransmissionSettings = function (t, tSettings) {
	t.sessionGet(function (err, res) {
		if (err)
		{
			console.log("Could not retrieve 'transmission' session infos");
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

var checkDashboardSettings = async function (dSettings) {
	try {
		var wallCount = await Wall.countDocuments({});
		if (wallCount > dSettings["mini-chat-message-limit"])
			Wall.deleteXOldMessages(wallCount - dSettings["mini-chat-message-limit"]); //todo not tested yet
	} catch (err) {
		console.log("error::checkDashboardSettings:: ", err);
	}
};

export default async function () {
	var infos = {
		configFileName: './config.json',
		config: null,
		configDefault: null,
		connexionDb: null,
		transmission: null
	};

	infos.config = JSON.parse(fs.readFileSync(infos.configFileName, 'utf8'));
	infos.configDefault = defaultConfig;
	var validityError = validity.checkConfig(infos.config, infos.configDefault, "", infos.configFileName);
	if (validity.checkConfigErrors(validityError, infos.configFileName))
		process.exit();
	infos.connexionDb = await connectDb(infos.config.mongodb);
	infos.transmission = new TransmissionNode(infos.config.transmission);
	checkTransmissionSettings(infos.transmission, infos.config['transmission-settings']);
	checkFileSettings(infos.config.files, infos.transmission);
	await checkDashboardSettings(infos.config.dashboard);
	
	return infos;
};
