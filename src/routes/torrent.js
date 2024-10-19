import express from "express";
var router = express.Router();
import multer from "multer";
import File from "../models/File.js";
import upload from "../middlewares/upload.js";
import rights from "../middlewares/rights.js";
import format from "../utils/format.js";

router.post('/add-url', function (req, res, next) {
	req.app.locals.transmission.torrentAdd({filename: req.body.url}, function (err, resp) {
		if (err)
			res.json({ success: false, message: 'torrent not added, wrong url' });
		else
		{
			if ('torrent-duplicate' in resp)
				res.json({ success: false, message: 'duplicate, torrent already present' });
			else if ('torrent-added' in resp)
			{
				File.createFile(resp['torrent-added'], req.user._id, function (err, file) {
					if (err)
						res.json({ success: false, message: 'Torrent was successfully added but there was an issuewhen adding it to the database', error: err, id: resp['torrent-added']['id'], name: resp['torrent-added']['name'] });
					else
						res.json({ success: true, message: 'torrent successfully added', id: resp['torrent-added']['id'], name: file.name });
				});
			}
			else
				res.json({ success: false, message: 'unexpected error' });
		}
	});
});

router.post('/add-torrents', upload.torrent.array('torrent', 10), function (req, res, next) {
	var resAll = [];
	var i = 0;
	(function next() {
		var file = req.files[i++];
		if (!file)
			return res.json(resAll);
		req.app.locals.transmission.torrentAdd({ filename: process.cwd() + '/' + file.path }, function (err, resp) {
			if (err)
			{
				resAll.push({ torrent: file.filename, success: false });
				next();
			}
			else
			{
				if ('torrent-duplicate' in resp)
				{
					resAll.push({ success: false, message: 'Duplicate, torrent already present', torrent: file.filename });
					next();
				}
				else if ('torrent-added' in resp)
				{
					File.createFile(resp['torrent-added'], req.user._id, function (err, fileAd) {
						var name = fileAd ? fileAd.name : "";
						if (err)
							resAll.push({ success: false, message: 'Torrent was successfully added but there was an issue when adding it to the database', error: err, id: resp['torrent-added']['id'], name: resp['torrent-added']['name'] });
						else
							resAll.push({ success: true, message: 'Torrent successfully added', torrent: name });
						req.app.io.sockets.emit('post:torrent', { success: true, message: 'torrent successfully added', id: resp['torrent-added']['id'], name: name });
						next();
					});
				}
				else
				{
					resAll.push({ success: false, message: 'unexpected error', torrent: file.filename });
					next();
				}
			}
		});
	})();
});

router.get('/refresh/:id', function (req, res, next) {
	var transmission = req.app.locals.transmission;
	transmission.torrentGet(transmission.requestFormat.refreshAll, parseInt(req.params.id, 10), function (err, resp) {
		if (err)
			throw err;
		else
			res.json({ success: true, data: resp });
	});
});

router.delete('/', function (req, res, next) {
	var removeLocalData = (req.body.removeLocalData === "true");
	var ids = format.torrentIds(req.body.ids);
	if (removeLocalData)
	{
		req.app.locals.transmission.torrentGet(['hashString'], ids, function (err, resp) {
			if (err)
				throw err;
			else
			{
				var toFind = [];
				resp['torrents'].forEach(function (torrent) {
					toFind.push(torrent.hashString);
				});
				File.remove({ 'hashString': { $in: toFind } }, function (err, removed) {
					if (err)
						return next(err);
				});
			}
		});
	}
	req.app.locals.transmission.torrentRemove(ids, removeLocalData, function (err, resp) {
		if (err)
			res.json({ success: false, message: "Could not remove torrent(s)" });
		else
			res.json({ success: true, message: 'Torrent(s) successfuly removed' });
	});
});

router.post('/move/:direction', function (req, res, next) {
	var ids = format.torrentsIds(req.body.ids);
	req.app.locals.transmission.queueMovementRequest('queue-move-' + req.params.direction, ids, function (err, resp) {
		if (err)
			res.json({ success: false, message: "Could not move torrent(s) " + req.params.direction });
		else
			res.json({ success: true, message: 'Torrent(s) successfuly moved ' + req.params.direction });
	});
});

router.post('/action/:action', function (req, res, next) {
	var ids = format.torrentsIds(req.body.ids);
	req.app.locals.transmission.torrentActionRequest('torrent-' + req.params.action, ids, function (err, resp) {
		if (err)
			res.json({ success: false, message: "Action: " + req.params.action + " failed" });
		else
			res.json({ success: true, message: "Action: " + req.params.action + " was a success" });
	});
});

router.put('/rename/:id', function (req, res , next) {
	var newName = req.body.newName;
	var id = format.torrentsIds(req.params.id);
	var transmission = req.app.locals.transmission;
	transmission.torrentGet(['hashString', 'downloadDir'], id, function (err, respGet) {
		if (respGet.torrents.length > 0)
		{
			File.findOne({ hashString: respGet.torrents[0].hashString }, { path: 1, name: 1 }, function (err, file) {
				if (err)
					res.json({ success: false, message: 'Database error', error: err });
				else if (file == null)
					res.json({ success: false, message: 'Could not find file' });
				else
				{
					console.log('id: ', id);
					console.log('path: ', file.path);
					console.log('newName: ', (respGet.torrents[0].downloadDir + '/' +newName));
					transmission.torrentRenamePath(id, file.name,  newName, function (err, resp) {
						if (err)
							res.json({ success: false, message: 'An error occured while renaming the file', error: err });
						else
						{
							file.renamePath(respGet.torrents[0].downloadDir + '/' + resp.name, resp.name, function (err) {
								if (err)
									res.json({ success: false, message: 'Transmission succesfully changed torrent name but update in database failed' });
								else
								{
									res.json({ success: true, message: 'Torrent successfully renamed', data: resp });
									req.app.io.sockets.emit('put:torrent:rename', { success: true, message: 'A torrent was renamed', id: req.params.id, newName: newName });
								}
							});
						}
					});
				}
			});
		}
	});
});


router.get('/session-stats', function (req, res, next) {
	req.app.locals.transmission.sessionStats(function (err, resp) {
		if (err)
			res.json({ success: false, message: "Could not get session stats" });
		else
			res.json({ success: true, data: resp });
	});
});

router.get('/session-get', function (req, res, next) {
	req.app.locals.transmission.sessionGet(function (err, resp) {
		if (err)
			res.json({ success: false, message: "Could not get session detailled infos" });
		else
			res.json({ success: true, data: resp });
	});
});

//http://john.bitsurge.net/public/biglist.p2p.gz
router.post('/blocklist-update', function (req, res, next) {
	req.app.locals.transmission.blocklistUpdate(function (err, resp) {
		if (err)
			res.json({ success: false, message: "Could not update blocklist"} );
		else
			res.json({ success: true, message: "Blocklist successfully updated", data: resp} );
	});
});

router.get('/port-test', function (req, res, next) {
	req.app.locals.transmission.portTest(function (err, resp) {
		if (err)
			res.json({ success: false, message: "Could not check port" } );
		else
			res.json({ success: true, message: "Port checked", "port-is-open": resp["port-is-open"] });
	});
});

router.post('/session-shutdown', rights.admin, function (req, res, next) {
	req.app.locals.transmission.sessionClose(function (err, resp) {
		if (err)
			res.json({ success: false, message: "Could not close session" });
		else
			res.json({ success: true, message: "Session successfully closed" });
	});
});

router.get('/get-all-torrents', function (req, res, next) {
	var fields = req.app.locals.transmission.requestFormat.allTorrents;
	req.app.locals.transmission.torrentGet(fields, {}, function (err, resp) {
		if (err)
			res.json({ success: false, message: "Could not get all torrents infos" });
		else
			res.json({ success: true, message: "Torrent infos ok", data: resp });
	});
});

export default router;
