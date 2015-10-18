var File = require('../models/File.js');
var jwt = require('jsonwebtoken');

// ****************************************
// SOCKETS
// ****************************************



module.exports = function (io, transmission, secret) {

	var second = 1000;
	var torrentRefreshCounter = 0;
	var torrentRefreshIntervalId = null;
	var finishRefreshTorrentIntervalId = null;
	var finishedTorrents = [];

	var refreshTorrent = function () {
		transmission.torrentGet(["id", "error", "errorString", "eta", "isFinished", "isStalled", "leftUntilDone", "metadataPercentComplete", "peersConnected", "peersGettingFromUs", "peersSendingToUs", "percentDone", "queuePosition", "rateDownload", "rateUpload", "recheckProgress", "seedRatioMode", "seedRatioLimit", "sizeWhenDone", "status", "trackers", "downloadDir", "uploadedEver", "uploadRatio", "Webseedssendingtous"], "recently-active", function (err, res) {
		if (err)
			io.sockets.emit('torrentErrorRefresh', { error: err });
		else if (res['removed'].length > 0 || res['torrents'].length > 0)
			io.sockets.emit('torrentRefreshRes', { result: res });
	});
	// console.log('yolo je refresh les diez et j emmit');
};

	var addFinishedTorrentToDB = function (id, name) {
		transmission.torrentGet(["hashString", "downloadDir", "totalSize"], id, function (err, resp) {
			if (err)
				console.log(err);
				// throw err;
			else
			{
				if (resp['torrents'].length > 0)
				{
					var torrent = resp['torrents'][0];
					File.findOneAndUpdate(
						{ hashString: torrent['hashString'] },
						{ name: name, path: torrent['downloadDir'] + '/' + name, size: torrent['totalSize'], hashString: torrent['hashString'], isFinished: true, createdAt: Date.now() },
						{ new: true, upsert: true, setDefaultsOnInsert: true },
						function (err, newFile) {
							if (err)
								console.log(err);
							else
								io.sockets.emit("newFile", { name: torrent["name"], data: newFile });
						}
					);
				}
			}
		});
	};

	var finishRefreshTorrent = function () {
		transmission.torrentGet(["id", "status", "leftUntilDone", "percentDone", "name"], "recently-active", function (err, res) {
			if (err)
			{
				clearInterval(finishRefreshTorrentIntervalId);
				finishRefreshTorrentIntervalId = null;
			}
			else
			{
				res["torrents"].forEach(function (torrent) {
					// console.log('finishedTorrent --> ', finishedTorrents);
					if (finishedTorrents.indexOf(torrent['name']) < 0)
					{
						// console.log('torrent -> ', torrent);
						if (torrent['leftUntilDone'] === 0 && torrent["percentDone"] === 1.0 && torrent["status"] > 4)
						{
							console.log("nouveau film ! : ", torrent["name"]);
							finishedTorrents.push(torrent["name"]);
							//ajout dans la database !
							addFinishedTorrentToDB(torrent['id'], torrent['name']);
							//envoyer l'objet de la db direct ???
							io.sockets.emit("new-torrent", {name: torrent["name"]});
						}
					}
				});
			}
		});
	};

	// ====================================
	// CREATE FILE
	// ====================================
	var createFile = function (torrentAdded, userId) {
		File.create({ name: torrentAdded['name'], creator: userId, hashString: torrentAdded['hashString']}, function (err, file) {
			if (err)
				throw err;
		});
	};

	// ====================================
	// SOCKET AUTH
	// ====================================
	io.use(function (socket, next) {
		console.log('SOCK --> ', socket.request._query['token']);
		if ('_query' in socket.request && 'token' in socket.request._query)
		{
			var token = socket.request._query['token'];
			jwt.verify(token, secret, function (err, decoded) {
				if (err)
					next (new Error('not authorized'));
				else
				{
					socket.appUser = decoded;
					next();
				}
			});
		}
		else
			next (new Error('not authorized'));
	});


	// ====================================
	// SOCKET CONNECTION
	// ====================================
	io.on('connection', function (socket) {
		// connectedUsers++;
		console.log('new user connection', socket.appUser);
		console.log('number of users currently connected :', io.engine.clientsCount);
		io.sockets.emit('connectedUsers', { connectedUsers: io.engine.clientsCount });

		if (io.engine.clientsCount === 1)
			finishRefreshTorrentIntervalId = setInterval(finishRefreshTorrent, second);

		// io.on('torrent-refresh', function (socket) {
		socket.on('torrentRefresh', function () {
			torrentRefreshCounter++;
			transmission.torrentGet(["id", "addedDate", "name", "totalSize",  "error", "errorString", "eta", "isFinished", "isStalled", "leftUntilDone", "metadataPercentComplete", "peersConnected", "peersGettingFromUs", "peersSendingToUs", "percentDone", "queuePosition", "rateDownload", "rateUpload", "recheckProgress", "seedRatioMode", "seedRatioLimit", "sizeWhenDone", "status", "trackers", "downloadDir", "uploadedEver", "uploadRatio", "Webseedssendingtous"], {}, function (err, res) {
				if (err)
					socket.emit("torrentErrorRefresh", { error: err });
				else
					socket.emit("torrentFirstRefresh", { torrents: res });
			});
			if (torrentRefreshCounter === 1)
				torrentRefreshIntervalId = setInterval(refreshTorrent, second);
			// if (io.engine.clientsCount === 1)
			// 	torrentIntervalId = setInterval(refreshTorrent, 1000);
		});

		// io.on('torrent-stop-refresh', function (socket) {
		socket.on('torrentStopRefresh', function () {
			torrentRefreshCounter--;
			if (torrentRefreshCounter === 0)
			{
				clearInterval(torrentRefreshIntervalId);
				torrentRefreshIntervalId = null;
			}
		});

		socket.on('delete:torrent', function (data) {
			var removeLocalData = data.removeLocalData;
			var id = parseInt(data.id, 10);
			if (removeLocalData)
			{
				transmission.torrentGet(['hashString'], id, function (err, resp) {
					if (err)
						throw err;
					else
					{
						if (resp['torrents'].length > 0)
						{
							File.findOneAndRemove({ hashString: resp['torrents'][0]['hashString'] }, function (err, file) {
								if (err)
									console.log(err);
									// return next(err);
							});
						}
					}
				});
			}
			transmission.torrentRemove(id, removeLocalData, function (err, resp) {
				if (err)
					socket.emit('delete:torrent', { success: false, message: "Could not remove torrent" });
				else
					io.sockets.emit('delete:torrent', { success: true, id: id, message: 'Torrent removed' });
			});
		});

		socket.on('post:torrent:url',  function(data){
			transmission.torrentAdd({filename: data.url}, function (err, resp) {
				if (err)
					socket.emit('post:torrent:url', { success: false, message: "torrent not added, wrong url" });
				else
				{
					if ('torrent-duplicate' in resp)
						socket.emit('post:torrent:url', { success: false, message: 'duplicate, torrent already present' });
					else if ('torrent-added' in resp)
					{
						createFile(resp['torrent-added'], data.id);
						io.sockets.emit('post:torrent:url', { success: true, message: 'torrent successfully added', id: resp['torrent-added']['id'], name: resp['torrent-added']['name'] });
					}
					else
						socket.emit('post:torrent:url', { success: false, message: 'unexpected error' });
				}
			});
		});

		socket.once('disconnect', function () {
			console.log('users still online : ', io.engine.clientsCount);
			if (io.engine.clientsCount > 0)
				io.sockets.emit('connectedUsers', { connectedUsers: io.engine.clientsCount });
			else if (io.engine.clientsCount === 0)
			{
				if (torrentRefreshIntervalId !== null)
				{
					torrentRefreshCounter = 0;
					clearInterval(torrentRefreshIntervalId);
					torrentRefreshIntervalId = null;
				}
				if (finishRefreshTorrentIntervalId !== null)
				{
					clearInterval(finishRefreshTorrentIntervalId);
					finishRefreshTorrentIntervalId = null;
				}
			}
		});
	});
};
