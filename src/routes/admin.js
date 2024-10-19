import express from "express";
var router = express.Router();
import fs from "fs";
import atob from "atob";
import btoa from "btoa";
import { rimraf } from 'rimraf';
import pathS from "path";
import mongoose from "mongoose"
import TransmissionNode from "../transmission/transmissionNode.js"
import ft from "../utils/ft.js";
import filesInfos from "../utils/filesInfos.js";
import File from "../models/File.js";
import rightsMW from "../middlewares/rights.js";
import tSettings from "../config/transmission.js";
import pjson from "../package.json" with { type: 'json' };

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
	res.json({ success: true, data: ret, version: pjson.version });
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
						{
							req.app.emit('config:reload');
							res.json({ success: true, message: "transmission infos were successfuly updated" });
						}
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
			req.app.emit('config:reload');
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

router.put('/settings/:part', rightsMW.admin, function (req, res, next) {
	req.app.locals.ttConfig[req.params.part] = ft.updateSettings(req.body, req.app.locals.ttConfig[req.params.part]);
	ft.jsonToFile(req.app.locals.ttConfigFileName, req.app.locals.ttConfig, function (err) {
		if (err)
			res.json({ success: false, message: "Could not update config file", err: err });
		else
		{
			req.app.emit('config:reload');
			res.json({ success: true, message: req.params.part + " settings succesfully updated", data: req.app.locals.ttConfig[req.params.part] });
		}
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
		File.insertFile(file, req.user._id, btoa(file.path), function (err, newFile) {
			if (err)
			{
				error = true;
				result.push({ error: err, path: file.path });
			}
			else
				result.push(newFile);
			loop();
		});
	})();
});

export default router;
