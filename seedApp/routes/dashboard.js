
var express = require('express');
var router = express.Router();
// var WallMessage = require('../models/Wall.js');
var File = require('../models/File.js');
var njds = require('nodejs-disks');

var getTotalDiskSpace = function (done) {
	var total = 0;
	njds.drives(function (err, drives) {
		if (err)
			return done(err);
		else
			njds.drivesDetail(drives, function (err, data) {
				console.log(data);
				for (var i = 0; i < data.length; i++)
					total += data[i].total;
				return done(null, total);
			});
	});
};

router.get('/', function (req, res, next) {
	var userLastFiles = null;
	var lastFiles = null;
	var diskSpace = null;
	var sortRule = { createdAt: -1 };
	var errors = {
		userFilesError: { happened: false },
		filesError: { happened: false },
		diskSpaceError: { happened: false }
	};
	File.find({ creator: req.user._id }).sort(sortRule).limit(5).exec(function (err, userFiles) {
		if (err)
		{
			errors.userFilesError.happened = true;
			errors.userFilesError.err = err;
		}
		else
			userLastFiles = userFiles;
		File.find({}).sort(sortRule).limit(5).exec(function (err, files) {
			if (err)
			{
				errors.filesError.happened = true;
				errors.filesError.err = err;
			}
			else
				lastFiles = files;
			getTotalDiskSpace(function (err, totalDiskSpace) {
				if (err)
				{
					errors.diskSpaceError.happened = true;
					errors.diskSpaceError.err = err;
				}
				else
					req.app.get('transmission').freeSpace(req.app.get('config').transmissionFolder, function (err, data) {
						if (err)
						{
							errors.diskSpaceError.happened = true;
							errors.diskSpaceError.err = err;
						}
						else
						{
							var freeSpace = parseInt(data['size-bytes'], 10);
							diskSpace = { total: totalDiskSpace, free: freeSpace, percent: ((freeSpace * 100) / diskSpace) };
						}
						res.json({ userLastFiles: userLastFiles, lastFiles: lastFiles, diskSpace: diskSpace, errors: errors });
					});
			});
		});
	});
});

module.exports = router;
