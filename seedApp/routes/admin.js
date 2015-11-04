var express = require('express');
var router = express.Router();
var fs = require('fs');
var TransmissionNode = require('../utils/transmissionNode');
var ft = require('../utils/ft');
var atob = require('atob');
var filesInfos = require('../utils/filesInfos');

router.get('/settings', function (req, res, next) {
	var config = req.app.get('config');
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

router.put('/settings/transmission', function (req, res, next) {
	if (req.user.role == 0 && Object.keys(req.body).length)
	{
		var transmissionConfig = req.app.get('config').transmission;
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
			newTransmission.sessionGet(function (err, res) {
				if (err)
					res.json({ success: false, message: "could not change transmission settings" });
				else
				{
					req.app.get('config').transmission = transmissionConfig;
					req.app.set('transmission', newTransmission);
					// WRITE TO FILE
					res.json({ success: true, message: "transmission infos were successfuly updated" });
				}
			});
		}
		else
			res.json({ success: false, message: "no changes were made" });
	}
	else
		res.json({ success: false, message: "You don't have enought rights for this action" });
});

router.put('/settings/transmission-settings', function (req, res, next) {
	if (req.user.role == 0)
	{
		var tSettings = req.app.get('config')["transmission-settings"];
		var tMod = {};
		var transmission = req.app.get('transmission');
		for (var key in req.body)
		{
			if (tSettings.hasOwnProperty(key))
			{
				if (tSettings[key] != req.body[key])
					tMod[key] = req.body[key];
			}
		}
		// ft.updateSettings(req.body, tSettings);
		transmission.sessionSet(tMod, function (err, res) {
			if (err)
				res.json({ success: false, message: err });
			else
			{
				transmission.sessionGet(function (err, res) {
					if (err)
						res.json({ success: true, message: "transmission settings succesfully updated, but could not get session infos from transmission", data: null });
					else
					{
						for (var key in tSettings)
						{
							if (res.hasOwnProperty(key))
							{
								if (tSettings[key] != res[key])
									tSettings[key] = res[key];
							}
						}
						req.app.get('config')["transmission-settings"] = tSettings;
						// WRITE TO FILE
						res.json({ success: true, message: "transmission settings succesfully updated", data: tSettings });
					}
				});
			}
				res.json({ success: true, message: "transmission settings succesfully updated", data: res });
		});
	}
	else
		res.json({ success: false, message: "You don't have enought rights for this action" });
});

router.put('/settings/torrents', function (req, res, next) {
	if (req.user.role == 0)
	{
		req.app.get('config').torrents = ft.updateSettings(req.body, req.app.get('config').torrents);
		// WRITE TO FILE
		res.json({ success: true, message: "torrents settings succesfully updated" });
	}
	else
		res.json({ success: false, message: "You don't have enought rights for this action" });
});

router.put('/settings/files', function (req, res, next) {
	if (req.user.role == 0)
	{
		req.app.get('config').files = ft.updateSettings(req.body, req.app.get('config').files);
		// WRITE TO FILE
		res.json({ success: true, message: "files settings succesfully updated", data: req.app.get('config').files });
	}
	else
		res.json({ success: false, message: "You don't have enought rights for this action" });
});

router.put('/settings/dashboard', function (req, res, next) {
	if (req.user.role == 0)
	{
		req.app.get('config').dashboard = ft.updateSettings(req.body, req.app.get('config').dashboard);
		// WRITE TO FILE
		res.json({ success: true, message: "dashboard settings succesfully updated", data: req.app.get('config').dashboard });
	}
	else
		res.json({ success: false, message: "You don't have enought rights for this action" });
});

router.put('/settings/users', function (req, res, next) {
	if (req.user.role == 0)
	{
		req.app.get('config').users = ft.updateSettings(req.body, req.app.get('config').users);
		// WRITE TO FILE
		res.json({ success: true, message: "users settings succesfully updated", data: req.app.get('config').users });
	}
	else
		res.json({ success: false, message: "You don't have enought rights for this action" });
});

router.get('/new-directory/:path', function (req, res, next) {
	if (req.user.role == 0)
	{
		var path = atob(req.params.path);
		filesInfos.getDirInfos(path, function (err, data) {
			if (err)
				res.json({ success: false, message: err });
			else
				res.json({ success: true, data: data });
		});
	}
	else
		res.json({ success: false, message: "You don't have enought rights for this action" });
});

module.exports = router;
