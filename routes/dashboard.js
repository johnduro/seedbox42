
var fs = require('fs');
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

router.get('/:panel/:all?', function (req, res, next) {
	panels[req.params.panel](req, function (ret) {
		res.json(ret);
	});
});


var panels = {
	'recent-file': function (req, done) {
		var dashConf = req.app.locals.ttConfig.dashboard;
		var user = req.user;
		var limit = (req.params.all ? 0 : dashConf['file-number-exhibit']);
		File.getFileList({}, { createdAt: -1 }, limit, user, function (err, files) {
			if (err)
				done({ success: false, message: err });
			else
				done({ success: true, data: files });
		});
	},
	'recent-user-file': function (req, done) {
		var dashConf = req.app.locals.ttConfig.dashboard;
		var user = req.user;
		var limit = (req.params.all ? 0 : dashConf['file-number-exhibit']);
		File.getFileList({ creator: user._id }, { createdAt: -1 }, limit, user, function (err, files) {
			if (err)
				done({ success: false, message: err });
			else
				done({ success: true, data: files });
		});
	},
	'oldest-user-locked-file': function (req, done) {
		var dashConf = req.app.locals.ttConfig.dashboard;
		var user = req.user;
		var limit = (req.params.all ? 0 : dashConf['file-number-exhibit']);
		File.getFileList({ "locked.user": user._id }, { "locked.createdAt": 1 }, limit, user, function (err, files) {
			if (err)
				done({ success: false, message: err });
			else
				done({ success: true, data: files });
		});
	},
	'oldest-locked-file': function (req, done) {
		var dashConf = req.app.locals.ttConfig.dashboard;
		var user = req.user;
		var limit = (req.params.all ? 0 : dashConf['file-number-exhibit']);
		File.getFileList({ 'locked': { $exists: true, $not: { $size: 0 } } }, { "locked.createdAt": 1 }, limit, user, function (err, files) {
			if (err)
				done({ success: false, message: err });
			else
				done({ success: true, data: files });
		});
	},
	'disk-space': function (req, done) {
		var downloadDir = req.app.locals.ttConfig["transmission-settings"]["download-dir"];
		fs.access(downloadDir, fs.F_OK, function (errAccess) {
			if (errAccess)
				done({ success: false, message: 'download-dir in transmission-settings is not a valid path' });
			else
			{
				getTotalDiskSpace(downloadDir, function (err, diskInfos) {
					if (err)
						done({ success: false, message: err });
					else
						done({ success: true, data: diskInfos });
				});
			}
		});
	},
	'best-rated-file': function (req, done) {
		var dashConf = req.app.locals.ttConfig.dashboard;
		var user = req.user;
		var limit = (req.params.all ? 0 : dashConf['file-number-exhibit']);
		File.getFileList({}, { averageGrade: -1 }, limit, user, function (err, files) {
			if (err)
				done({ success: false, message: err });
			else
				done({ success: true, data: files });
		});
	},
	'most-commented-file': function (req, done) {
		var dashConf = req.app.locals.ttConfig.dashboard;
		var user = req.user;
		var limit = (req.params.all ? 0 : dashConf['file-number-exhibit']);
		File.getFileList({}, { commentsNbr: -1 }, limit, user, function (err, files) {
			if (err)
				done({ success: false, message: err });
			else
				done({ success: true, data: files });
		});
	},
	'most-downloaded-file': function (req, done) {
		var dashConf = req.app.locals.ttConfig.dashboard;
		var user = req.user;
		var limit = (req.params.all ? 0 : dashConf['file-number-exhibit']);
		File.getFileList({}, { downloads: -1 }, limit, user, function (err, files) {
			if (err)
				done({ success: false, message: err });
			else
				done({ success: true, data: files });
		});
	}
};

module.exports = router;
