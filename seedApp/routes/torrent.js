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

router.post('/', function (req, res, next) {
	// req.app.torrentClient.add(req.body.magnet, function(torrent) {
	// 	if (tmp != torrent.received) {
	// 		tmp = torrent.received;
	// 		io.emit('{size: ' + torrent.length + ', down: ' + torrent.received + '}', { for: 'everyone' });
	// 	};
	// });
});

router.post('/add-url', function (req, res, next) {
	req.app.get('transmission').torrentAdd({filename: req.body.url}, function (err, resp) {
		if (err)
			res.json({success: false, message: 'torrent not added, wrong url'});
		else
			res.json({success: true, message: 'torrent successfully added'});
	});
});

router.post('/add-torrents', torrentUpldHandler.array('torrent', 10), function(req, res, next) {
	// array de torrent dans req.files
	var resAll = [];
	var counter = 0;
	req.files.forEach(function (file) {
		counter++;
		req.app.get('transmission').torrentAdd({filename: process.cwd() + '/' + file.path}, function (err, resp) {
			counter--;
			if (err)
				resAll.push({torrent: file.filename, success: false});
			else
				resAll.push({torrent: file.filename, success: true});
			if (counter == 0)
				res.json(resAll);
		});
	});
});

router.delete('/:id', function (req, res, next) {
	var removeLocalData = (req.body.removeLocalData === "true");
	req.app.get('transmission').torrentRemove(parseInt(req.params.id, 10), removeLocalData, function (err, resp) {
		if (err)
			res.json({success: false, message: "could not remove torrent"});
		else
			res.json({success: true, message: 'torrent successfuly removed'});
	});
});

router.post('/move/:direction/:id', function (req, res, next) {
	req.app.get('transmission').queueMovementRequest('queue-move-' + req.params.direction, parseInt(req.params.id, 10), function (err, resp) {
		if (err)
			res.json({success: false, message: "could not move torrent " + req.params.direction});
		else
			res.json({success: true, message: 'torrent successfuly moved ' + req.params.direction});
	});
});

module.exports = router;
