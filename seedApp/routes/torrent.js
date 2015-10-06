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
			res.json({success: false, message: "Could not remove torrent"});
		else
			res.json({success: true, message: 'Torrent successfuly removed'});
	});
});

router.post('/move/:direction/:id?', function (req, res, next) {
	var ids;
	if (!(req.params.id))
		ids = {};
	else
		ids = parseInt(req.params.id, 10);
	req.app.get('transmission').queueMovementRequest('queue-move-' + req.params.direction, ids, function (err, resp) {
		if (err)
			res.json({success: false, message: "Could not move torrent " + req.params.direction});
		else
			res.json({success: true, message: 'Torrent successfuly moved ' + req.params.direction});
	});
});

router.post('/action/:action/:id?', function (req, res, next) {
	var ids;
	if (!(req.params.id))
		ids = {};
	else
		ids = parseInt(req.params.id, 10);
	req.app.get('transmission').torrentActionRequest('torrent-' + req.params.action, ids, function (err, resp) {
		if (err)
			res.json({success: false, message: "Action: " + req.params.action + " failed"});
		else
			res.json({success: true, message: "Action: " + req.params.action + " was a success"});
	});
});

router.get('/session-stats', function (req, res, next) {
	req.app.get('transmission').sessionStats(function (err, resp) {
		if (err)
			res.json({success: false, message: "Could not get session stats"});
		else
			res.json({success: true, data: resp});
	});
});

router.get('/session-get', function (req, res, next) {
	req.app.get('transmission').sessionGet(function (err, resp) {
		if (err)
			res.json({success: false, message: "Could not get session detailled infos"});
		else
			res.json({success: true, data: resp});
	});
});

//http://john.bitsurge.net/public/biglist.p2p.gz
router.post('/blocklist-update', function (req, res, next) {
	req.app.get('transmission').blocklistUpdate(function (err, resp) {
		if (err)
			res.json({success: false, message: "Could not update blocklist"});
		else
			res.json({success: true, message: "Blocklist successfully updated", data: resp});
	});
});

router.get('/port-test', function (req, res, next) {
	req.app.get('transmission').portTest(function (err, resp) {
		if (err)
			res.json({success: false, message: "Could not check port"});
		else
			res.json({success: true, message: "Port checked", "port-is-open": resp["port-is-open"]});
	});
});

router.post('/session-shutdown', function (req, res, next) {
	if (req.user.role === 0)
	{
		req.app.get('transmission').sessionClose(function (err, resp) {
			if (err)
				res.json({success: false, message: "Could not close session"});
			else
				res.json({success: true, message: "Session successfully closed"});
		});
	}
	else
		res.json("You must be admin to close the session");
});

module.exports = router;
