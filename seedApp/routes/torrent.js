var express = require('express');
var multer = require('multer');
var router = express.Router();
var io = require('socket.io');
var File = require("../models/File.js");

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


// ====================================
// CREATE FILE
// ====================================
var createFile = function (torrentAdded, userId) {
	File.create({ name: torrentAdded['name'], creator: userId, hashString: torrentAdded['hashString']}, function (err, file) {
		if (err)
			throw err;
	});
};
// ************************************

// var tmp = "";

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
			res.json({ success: false, message: 'torrent not added, wrong url' });
		else
		{
			if ('torrent-duplicate' in resp)
				res.json({ success: false, message: 'duplicate, torrent already present' });
			else if ('torrent-added' in resp)
			{
				createFile(resp['torrent-added'], req.user._id);
				res.json({ success: true, message: 'torrent successfully added', id: resp['torrent-added']['id'], name: resp['torrent-added']['name'] });
			}
			else
				res.json({ success: false, message: 'unexpected error' });
		}
	});
});

router.post('/add-torrents', torrentUpldHandler.array('torrent', 10), function(req, res, next) {
	// array de torrent dans req.files
	var resAll = [];
	var counter = 0;
	req.files.forEach(function (file) {
		counter++;
		req.app.get('transmission').torrentAdd({ filename: process.cwd() + '/' + file.path }, function (err, resp) {
			counter--;
			if (err)
				resAll.push({ torrent: file.filename, success: false });
			else
			{
				if ('torrent-duplicate' in resp)
					resAll.push({ success: false, message: 'duplicate, torrent already present', torrent: file.filename });
				else if ('torrent-added' in resp)
				{
					createFile(resp['torrent-added'], req.user._id);
					resAll.push({ success: true, message: 'torrent successfully added', torrent: file.filename });
				}
				else
					resAll.push({ success: false, message: 'unexpected error', torrent: file.filename });
			}
			if (counter == 0)
				res.json(resAll);
		});
	});
});

router.get('/refresh/:id', function (req, res, next) {
	req.app.get('transmission').torrentGet(["id", "addedDate", "name", "totalSize",  "error", "errorString", "eta", "isFinished", "isStalled", "leftUntilDone", "metadataPercentComplete", "peersConnected", "peersGettingFromUs", "peersSendingToUs", "percentDone", "queuePosition", "rateDownload", "rateUpload", "recheckProgress", "seedRatioMode", "seedRatioLimit", "sizeWhenDone", "status", "trackers", "downloadDir", "uploadedEver", "uploadRatio", "Webseedssendingtous"], parseInt(req.params.id, 10), function (err, resp) {
		if (err)
			throw err;
		else
			res.json({ success: true, data: resp });
	});
});

router.delete('/:id', function (req, res, next) {
	var removeLocalData = (req.body.removeLocalData === "true");
	var id = parseInt(req.params.id, 10);
	if (removeLocalData)
	{
		req.app.get('transmission').torrentGet(['hashString'], id, function (err, resp) {
			if (err)
				throw err;
			else
			{
				if (resp['torrents'].length > 0)
				{
					File.findOneAndRemove({ hashString: resp['torrents'][0]['hashString'] }, function (err, file) {
						if (err)
							return next(err);
					});
				}
			}
		});
	}
	req.app.get('transmission').torrentRemove(id, removeLocalData, function (err, resp) {
		if (err)
			res.json({ success: false, message: "Could not remove torrent" });
		else
			res.json({ success: true, message: 'Torrent successfuly removed' });
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
			res.json({ success: false, message: "Could not move torrent " + req.params.direction });
		else
			res.json({ success: true, message: 'Torrent successfuly moved ' + req.params.direction });
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
			res.json({ success: false, message: "Action: " + req.params.action + " failed" });
		else
			res.json({ success: true, message: "Action: " + req.params.action + " was a success" });
	});
});

router.get('/session-stats', function (req, res, next) {
	req.app.get('transmission').sessionStats(function (err, resp) {
		if (err)
			res.json({ success: false, message: "Could not get session stats" });
		else
			res.json({ success: true, data: resp });
	});
});

router.get('/session-get', function (req, res, next) {
	req.app.get('transmission').sessionGet(function (err, resp) {
		if (err)
			res.json({ success: false, message: "Could not get session detailled infos" });
		else
			res.json({ success: true, data: resp });
	});
});

//http://john.bitsurge.net/public/biglist.p2p.gz
router.post('/blocklist-update', function (req, res, next) {
	req.app.get('transmission').blocklistUpdate(function (err, resp) {
		if (err)
			res.json({ success: false, message: "Could not update blocklist"} );
		else
			res.json({ success: true, message: "Blocklist successfully updated", data: resp} );
	});
});

router.get('/port-test', function (req, res, next) {
	req.app.get('transmission').portTest(function (err, resp) {
		if (err)
			res.json({ success: false, message: "Could not check port" } );
		else
			res.json({ success: true, message: "Port checked", "port-is-open": resp["port-is-open"] });
	});
});

router.post('/session-shutdown', function (req, res, next) {
	if (req.user.role === 0)
	{
		req.app.get('transmission').sessionClose(function (err, resp) {
			if (err)
				res.json({ success: false, message: "Could not close session" });
			else
				res.json({ success: true, message: "Session successfully closed" });
		});
	}
	else
		res.json("You must be admin to close the session");
});

router.get('/get-all-torrents', function (req, res, next) {
	var fields = ['uploadRatio', 'id', 'addedDate', 'isFinished', 'leftUntilDone', 'name', 'rateDownload', 'rateUpload', 'queuePosition', 'downloadDir', 'eta', 'peerConnected', 'percentDone', 'startDate', 'status', 'totalSize', 'torrentFile'];
	req.app.get('transmission').torrentGet(fields, {}, function (err, resp) {
		if (err)
			res.json({ success: false, message: "Could not get all torrents infos" });
		else
			res.json({ success: true, message: "Torrent infos ok", data: resp });
	});
});

module.exports = router;
