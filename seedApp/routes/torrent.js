var express = require('express');
var multer = require('multer');
var router = express.Router();
var io = require('socket.io');

// ====================================
// TORRENT UPLOADS
// ====================================
var torrentStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './files/torrents');
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
});

var torrentUpldHandler = multer({
	storage: torrentStorage,
	limits: {
		files: 10,
		fileSize: 3 * 1000 * 1000 //3 MB
	}});
// ************************************

var tmp = "";

router.post('/', function(req, res, next) {
	req.app.torrentClient.add(req.body.magnet, function(torrent) {
		if (tmp != torrent.received) {
			tmp = torrent.received;
			io.emit('{size: ' + torrent.length + ', down: ' + torrent.received + '}', { for: 'everyone' });
		};
	});
});

router.post('/add-torrents', torrentUpldHandler.array('torrent', 10), function(req, res, next) {
	// array de torrent dans req.files
	req.files.forEach(function(file) {
		req.app.torrentClient.add(file, function(torrent) {
			if (tmp != torrent.received) {
				tmp = torrent.received;
				io.emit('{size: ' + torrent.length + ', down: ' + torrent.received + '}', { for: 'everyone' });
			};
		});
	});
});

module.exports = router;
