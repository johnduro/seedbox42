
var express = require('express');
var router = express.Router();
var File = require('../models/File.js');
var diskSpace = require('../utils/diskSpaceNode');
var ft = require('../utils/ft');


var getTotalDiskSpace = function (downloadDir, done) {
	diskSpace.drives(downloadDir, function (err, drives) {
		if (err)
			return done(err);
		else
			diskSpace.drivesDetail(drives, function (err, data) {
				if (data.length == 1)
					return done(null, { used: data[0].used, freePer: parseInt(data[0].freePer, 10), usedPer: parseInt(data[0].usedPer, 10), total: data[0].total});
				return done('Could not find any data');
			});
	});
};

router.get('/oldest-locked-file', function (req, res, next) {
	File.getUserLockedFiles(req.user, 1, 5, function (err, files) {
		if (err)
			res.json({ success: false, message: err });
		else
			res.json({ success: true, data: files });
	});
});

router.get('/recent-user-file', function (req, res, next) {
	File.getFileList({ creator: req.user._id }, { createdAt: -1 }, 5, req.user, function (err, files) {
		if (err)
			res.json({ success: false, message: err });
		else
			res.json({ success: true, data: files });
	});
});

router.get('/recent-file', function (req, res, next) {
	File.getFileList({}, { createdAt: -1 }, 5, req.user, function (err, files) {
		if (err)
			res.json({ success: false, message: err });
		else
			res.json({ success: true, data: files });
	});
});

router.get('/disk-space', function (req, res, next) {
	getTotalDiskSpace(req.app.locals.ttConfig["transmission-settings"]["download-dir"], function (err, diskInfos) {
		if (err)
			res.json({ success: false, message: err });
		else
			res.json({ success: true, data: diskInfos });
	});
});

module.exports = router;
