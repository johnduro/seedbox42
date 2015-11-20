var express = require('express');
var router = express.Router();
var fs = require('fs');
var atob = require('atob');
var btoa = require('btoa');
var rimraf = require('rimraf');
var pathS = require('path');
var mongoose = require('mongoose');
var TransmissionNode = require('../transmission/transmissionNode');
var ft = require('../utils/ft');
var filesInfos = require('../utils/filesInfos');
var File = require('../models/File.js');
var rightsMW = require('../middlewares/rights');
var tSettings = require('../config/transmission');

router.get('/settings', function (req, res, next) {
	var config = req.app.locals.ttConfig;
	var ret = {
		"transmission": config.transmission,
		"transmission-settings": config["transmission-settings"],
		"torrents": config.torrents,
		"files": config.files,
		"dashboard": config.dashboard,
		"users": config.users
	};
	res.json({ success: true, data: ret });
});

router.get('/settings-default', function (req, res, next) {
	res.json({ success: true, data: req.app.locals.ttConfigDefault });
});

router.put('/settings/transmission', rightsMW.admin, function (req, res, next) {
	if (Object.keys(req.body).length)
	{
		var transmissionConfig = req.app.locals.ttConfig.transmission;
		var mod = false;
		for (var key in req.body)
		{
			if (transmissionConfig.hasOwnProperty(key) && transmissionConfig[key] != req.body[key])
			{
				transmissionConfig[key] = req.body[key];
				mod = true;
			}
		}
		if (mod)
		{
			var newTransmission = new TransmissionNode(transmission);
			newTransmission.sessionGet(function (err, resp) {
				if (err)
					res.json({ success: false, message: "could not change transmission settings" });
				else
				{
					req.app.locals.ttConfig.transmission = transmissionConfig;
					req.app.locals.transmission = newTransmission;
					ft.jsonToFile(req.app.locals.ttConfigFileName, req.app.locals.ttConfig, function (err) {
						if (err)
							res.json({ success: false, message: "Could not update config file", err: err });
						else
							res.json({ success: true, message: "transmission infos were successfuly updated" });
					});
				}
			});
		}
		else
			res.json({ success: false, message: "no changes were made" });
	}
	else
		res.json({ success: false, message: "no changes were made" });
});

router.put('/settings/transmission-settings', rightsMW.admin, function (req, res, next) {
	var t = req.app.locals.transmission;
	tSettings.configToTransmissionSettings(t, req.body, function (err) {
		if (err)
			res.json({ success: false, message: err });
		else
		{
			tSettings.transmissionSettingsToConfig(t, req.app.locals.ttConfig["transmission-settings"], function (err, newConf) {
				if (err)
					res.json({ success: true, message: "transmission settings succesfully updated, but could not get session infos from transmission", data: null });
				else
				{
					req.app.locals.ttConfig["transmission-settings"] = newConf;
					ft.jsonToFile(req.app.locals.ttConfigFileName, req.app.locals.ttConfig, function (err) {
						if (err)
							res.json({ success: false, message: "Could not update config file", err: err });
						else
							res.json({ success: true, message: "transmission settings succesfully updated", data: tSettings });
					});
				}
			});
		}
	});
});

router.put('/settings/torrents', rightsMW.admin, function (req, res, next) {
	req.app.locals.ttConfig.torrents = ft.updateSettings(req.body, req.app.locals.ttConfig.torrents);
	ft.jsonToFile(req.app.locals.ttConfigFileName, req.app.locals.ttConfig, function (err) {
		if (err)
			res.json({ success: false, message: "Could not update config file", err: err });
		else
			res.json({ success: true, message: "torrents settings succesfully updated", data: req.app.locals.ttConfig.torrents });
	});
});

router.put('/settings/files', rightsMW.admin, function (req, res, next) {
	req.app.locals.ttConfig.files = ft.updateSettings(req.body, req.app.locals.ttConfig.files);
	ft.jsonToFile(req.app.locals.ttConfigFileName, req.app.locals.ttConfig, function (err) {
		if (err)
			res.json({ success: false, message: "Could not update config file", err: err });
		else
			res.json({ success: true, message: "files settings succesfully updated", data: req.app.locals.ttConfig.files });
	});
});

router.put('/settings/dashboard', rightsMW.admin, function (req, res, next) {
	req.app.locals.ttConfig.dashboard = ft.updateSettings(req.body, req.app.locals.ttConfig.dashboard);
	ft.jsonToFile(req.app.locals.ttConfigFileName, req.app.locals.ttConfig, function (err) {
		if (err)
			res.json({ success: false, message: "Could not update config file", err: err });
		else
			res.json({ success: true, message: "dashboard settings succesfully updated", data: req.app.locals.ttConfig.dashboard });
	});
});

router.put('/settings/users', rightsMW.admin, function (req, res, next) {
	req.app.locals.ttConfig.users = ft.updateSettings(req.body, req.app.locals.ttConfig.users);
	ft.jsonToFile(req.app.locals.ttConfigFileName, req.app.locals.ttConfig, function (err) {
		if (err)
			res.json({ success: false, message: "Could not update config file", err: err });
		else
			res.json({ success: true, message: "users settings succesfully updated", data: req.app.locals.ttConfig.users });
	});
});

router.get('/new-directory/:path', rightsMW.admin, function (req, res, next) {
	var path = atob(req.params.path);
	filesInfos.getDirInfos(path, function (err, data) {
		if (err)
			res.json({ success: false, message: err });
		else
		{
			ft.checkExistentFiles(data, function (err, result) {
				if (err)
					res.json({ success: false, message: err });
				else
					res.json({ success: true, data: result });
			});
		}
	});
});

router.put('/new-directory', rightsMW.admin, function (req, res, next) {
	var i = 0;
	var error = false;
	var result = [];
	(function loop () {
		var file = req.body[i++];
		if (!file)
		{
			if (error)
				return res.json({ success: false, message: "An error occured while adding files", data: result });
			else
				return res.json({ success: true, message: "File(s) successfully added", data: result });
		}
		File.insertFile(file, req.user._id, function (err, newFile) {
			if (err)
			{
				error = true;
				result.push({ error: err, path: file.path });
			}
			else
				result.push(newFile);
			loop();
		});
		// var fileToInsert = {
		// 	name: pathS.basename(file.path),
		// 	path: file.path,
		// 	size: file.size,
		// 	creator:  mongoose.mongo.ObjectID(req.user._id),
		// 	hashString: btoa(file.path),
		// 	isFinished: true,
		// 	fileType: file.fileType,
		// 	createdAt: Date.now()
		// };
		// File.create(fileToInsert, function (err, newFile) {
		// 	if (err)
		// 	{
		// 		error = true;
		// 		result.push({ error: err, path: fileToInsert.path });
		// 	}
		// 	else
		// 		result.push(newFile);
		// 	loop();
		// });
	})();
});

module.exports = router;
