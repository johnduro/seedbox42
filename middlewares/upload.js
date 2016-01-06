var multer = require('multer');
var btoa = require('btoa');
var atob = require('atob');
var File = require("../models/File.js");

var avatarStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './public/assets/avatar');
	},
	filename: function (req, file, cb) {
		var filename = btoa(file.originalname);
		cb(null, Date.now() + '_' + filename);
	}
});

var torrentStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		// cb(null, './files/torrents');
		cb(null, './public/assets/torrents');
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
});


var fileStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		var query = File.findById(req.params.id);
		query.select('path');
		query.exec(function (err, dbFile) {
			if (err)
				return cb(err);
			else if (dbFile == null)
				return cb('Could not find file in db');
			var pathDecode = atob(req.params.path);
			var filePath = dbFile.path + pathDecode;
			cb(null, filePath);
		});
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
});

/**
 * Upload management for the app:
 */
module.exports = {
	/**
	 * Avatar upload for the users
	 */
	avatar: multer({
		storage: avatarStorage,
		limits: {
			files: 1,
			fileSize: 1 * 1000 * 1000 //1 MB
		}
	}),

	/**
	 * Torrent upload
	 */
	torrent: multer({
		storage: torrentStorage,
		limits: {
			files: 10,
			fileSize: 3 * 1000 * 1000 //3 MB
		}
	}),

	/**
	 * File upload
	 */
	file: multer({
		storage: fileStorage,
		limits: {
			files: 10,
			fileSize: 100 * 1000 * 1000 //100 MB
		}
	})
};
