var multer = require('multer');
var btoa = require('btoa');

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
		cb(null, './files/torrents');
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
	})
};
