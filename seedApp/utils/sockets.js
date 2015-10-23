var File = require('../models/File.js');
var WallMessage = require('../models/Wall.js');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var mime = require('mime');
var ft = require('../utils/ft');

/**
 * Sockets
 */



module.exports = function (io, transmission, secret) {

	var second = 1000;
	var torrentRefreshCounter = 0;
	var torrentRefreshIntervalId = null;
	var finishRefreshTorrentIntervalId = null;
	var finishedTorrents = [];

	/**
	 * Socket - Emit - torrentRefreshRes
	 * Permet d'envoyer un event a tous les utilisateurs avec les nouvelles donnees des torrents actifs
	 */
	var refreshTorrent = function () {
		transmission.torrentGet(["id", "error", "errorString", "eta", "isFinished", "isStalled", "leftUntilDone", "metadataPercentComplete", "peersConnected", "peersGettingFromUs", "peersSendingToUs", "percentDone", "queuePosition", "rateDownload", "rateUpload", "recheckProgress", "seedRatioMode", "seedRatioLimit", "sizeWhenDone", "status", "trackers", "downloadDir", "uploadedEver", "uploadRatio", "Webseedssendingtous"], "recently-active", function (err, res) {
		if (err)
			io.sockets.emit('torrentErrorRefresh', { error: err });
		else if (res['removed'].length > 0 || res['torrents'].length > 0)
			io.sockets.emit('torrentRefreshRes', { result: res });
		});
	};

	/**
	 * Socket - Emit - torrentRefreshRes
	 * Ajout en db le nouveau fichier telecharger et fini
	 * Envois un event a tout les utilisateurs avec les nouvelles donnees des torrents actifs
	 */
	var addFinishedTorrentToDB = function (id, name) {
		transmission.torrentGet(["hashString", "downloadDir", "totalSize", "isFinished"], id, function (err, resp) {
			console.log("ajout in DB");
			if (err)
				console.log("add finish torrent error: ", err);
				// throw err;
			else
			{
				console.log(resp['torrents'].length);
				if (resp['torrents'].length > 0)
				{
					var torrent = resp['torrents'][0];
					var path = torrent['downloadDir'] + '/' + name;
					fs.stat(path, function (err, stat) {
						var fileType = '';
						if (stat.isDirectory())
							fileType = 'folder';
						else
							fileType = mime.lookup(path);
						File.findOneAndUpdate(
							{ hashString: torrent['hashString'], isFinished: false },
							{ name: name, path: path, size: torrent['totalSize'], hashString: torrent['hashString'], isFinished: true, fileType: fileType, createdAt: Date.now() },
							// { new: true, upsert: true, setDefaultsOnInsert: true },
							{ new: true },
							function (err, newFile) {
								if (err)
									console.log("add finish torrent error: ", err);
								else
								{
									// console.log("update res > ", newFile);
									if (newFile != null)
										io.sockets.emit("newFile", { name: torrent["name"], data: newFile });
								}
							}
						);
					});
				}
			}
		});
	};

	/**
	 * Mets a jour le tableau finishedTorrents si il y a des torrents fini et met a jour la DB
	 */
	var finishRefreshTorrent = function () {
		transmission.torrentGet(["id", "status", "leftUntilDone", "percentDone", "name", "doneDate"], "recently-active", function (err, res) {
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
						if (torrent['leftUntilDone'] === 0 && torrent["percentDone"] === 1.0 && torrent["status"] > 4)
						{
							console.log("Un nouveau fichier est telecharge : ", torrent["name"]);
							finishedTorrents.push(torrent["name"]);
							addFinishedTorrentToDB(torrent['id'], torrent['name']);
							//envoyer l'objet de la db direct ???
							//io.sockets.emit("new-torrent", {name: torrent["name"]});
						}
					}
				});
			}
		});
	};

	/**
	 * Create File
	 */
	var createFile = function (torrentAdded, userId) {
		File.create({ name: torrentAdded['name'], creator: userId, hashString: torrentAdded['hashString']}, function (err, file) {
			if (err)
				throw err;
		});
	};

	/**
	 * Socket auth
	 */
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


	/**
	 * Socket connection
	 */
	io.on('connection', function (socket) {
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

		/**
		 * Socket - On - Event
		 * Permet de supprimer un torrent via une url
		 * @param {removeLocalData: true/false, id:idTorrent}
		 * Retroune un event 'post:torrent:url' true ou false
		 */
		socket.on('delete:torrent', function (data) {
			var removeLocalData = data.removeLocalData;
			var id = parseInt(data.id, 10);
			transmission.torrentGet(['hashString', 'name'], id, function (err, respGet) {
				if (err)
					console.log('Socket - On - delete:torrent: ', err);
				else
				{
					transmission.torrentRemove(id, removeLocalData, function (err, respRemove) {
						if (err)
							socket.emit('delete:torrent', { success: false, message: "Could not remove torrent" });
						else
						{
							io.sockets.emit('delete:torrent', { success: true, id: id, message: 'Torrent removed' });
							if (respGet['torrents'].length > 0)
							{
								if (removeLocalData)
								{
									File.findOneAndRemove({ hashString: respGet['torrents'][0]['hashString'] }, function (err, file) {
										if (err)
											console.log('Socket - On - delete:torrent: ', err);
									});
								}
								var index = finishedTorrents.indexOf(respGet['torrents'][0]['name']);
								if (index > 0)
									finishedTorrents.splice(index, 1);
							}
						}
					});
				}
			});
		});


		/**
		 * Socket - On - Event
		 * Permet d'ajouter un torrent via une url
		 * Retourne un event 'post:torrent:url' true ou false
		 */
		socket.on('post:torrent:url',  function (data) {
			console.log('DATA >', data);
			transmission.torrentAdd({ filename: data.url }, function (err, resp) {
				if (err)
					socket.emit('post:torrent:url', { success: false, message: "torrent not added, wrong url" });
				else
				{
					if ('torrent-duplicate' in resp)
						socket.emit('post:torrent', { success: false, message: 'duplicate, torrent already present' });
					else if ('torrent-added' in resp)
					{
						createFile(resp['torrent-added'], data.id);
						io.sockets.emit('post:torrent', { success: true, message: 'torrent successfully added', id: resp['torrent-added']['id'], name: resp['torrent-added']['name'] });
					}
					else
						socket.emit('post:torrent', { success: false, message: 'unexpected error' });
				}
			});
		});

		/**
		 * Socket - On - Event
		 * Add a message on the dashboard
		 */
		socket.on('chat:post:message', function (data) {
			console.log(data);
			WallMessage.addMessage(data.id, data.message, function (err, message) {
				if (err)
					socket.emit('chat:post:message', { success: false, message: 'could not record message' });
				else
					io.sockets.emit('chat:post:message', { success: true, message: 'new message', newmessage: message });
			});
		});

		/**
		 * Socket - On - Event
		 * Get all message from the dashboard
		 */
		socket.on('chat:get:message', function (data, callback) {
			WallMessage.find({}, function (err, messages) {
				ft.formatMessageList(messages, function (err, formatMess) {
					if (err)
						callback({ success: false, message: 'could not get messages' });
					else
						callback({ success: true, message: formatMess });
				});
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
