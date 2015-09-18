var express = require('express');
var webTorrent = require('webtorrent');
var multer = require('multer');
var router = express.Router();

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


router.post('/', function(req, res, next) {
	var client = new WebTorrent();
	var magnet = req.body.magnet;
	client.add(magnet, function(torrent) {
		client.destroy()
	});
});

router.post('/add-torrents', torrentUpldHandler.array('torrent', 10), function(req, res, next) {
	// array de torrent dans req.files
	console.log(req.files);
	res.json({success: false});
});

module.exports = router;
