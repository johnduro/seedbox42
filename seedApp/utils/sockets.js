// ****************************************
// SOCKETS
// ****************************************



module.exports = function (io, transmission) {

	var second = 1000;
	var torrentRefreshCounter = 0;
	var torrentRefreshIntervalId = null;
	var finishRefreshTorrentIntervalId = null;
	var finishedTorrents = [];

	var refreshTorrent = function () {
		transmission.torrentGet(["id", "error", "errorString", "eta", "isFinished", "isStalled", "leftUntilDone", "metadataPercentComplete", "peersConnected", "peersGettingFromUs", "peersSendingToUs", "percentDone", "queuePosition", "rateDownload", "rateUpload", "recheckProgress", "seedRatioMode", "seedRatioLimit", "sizeWhenDone", "status", "trackers", "downloadDir", "uploadedEver", "uploadRatio", "Webseedssendingtous"], "recently-active", function (err, res) {
		if (err)
			io.sockets.emit('torrent-error-refresh', {error: err});
		else
			io.sockets.emit('torrent-refresh-res', {result: res});
	});
	// console.log('yolo je refresh les diez et j emmit');
};

	var finishRefreshTorrent = function () {
		transmission.torrentGet(["id", "isFinished", "leftUntilDone", "status", "percentDone", "name"], "recently-active", function (err, res) {
			if (err)
			{
				clearInterval(finishRefreshTorrentIntervalId);
				finishRefreshTorrentIntervalId = null;
			}
			else
			{
				res["torrents"].forEach(function (torrent) {
					if (finishedTorrents.indexOf(torrent['name']) < 0)
					{
						if (torrent['leftUntilDone'] === 0 && torrent["percentDone"] === 1.0 && torrent["status"] > 4)
						{
							console.log("nouveau film ! : ", torrent["name"]);
							finishedTorrents.push(torrent["name"]);
							//ajout dans la database !
							io.sockets.emit("new-torrent", {name: torrent["name"]});
						}
					}
				});
			}
		});
	};


	io.on('torrent-refresh', function (socket) {
		torrentRefreshCounter++;
		transmission.torrentGet(["id", "error", "errorString", "eta", "isFinished", "isStalled", "leftUntilDone", "metadataPercentComplete", "peersConnected", "peersGettingFromUs", "peersSendingToUs", "percentDone", "queuePosition", "rateDownload", "rateUpload", "recheckProgress", "seedRatioMode", "seedRatioLimit", "sizeWhenDone", "status", "trackers", "downloadDir", "uploadedEver", "uploadRatio", "Webseedssendingtous"], "recently-active", function (err, res) {
			if (err)
				socket.emit("torrent-error-refresh", {error: err});
			else
				socket.emit("torrent-first-refresh", {torrents: res});
		});
		if (torrentRefreshCounter === 1)
			torrentRefreshIntervalId = setInterval(refreshTorrent, second);
		// if (io.engine.clientsCount === 1)
		// 	torrentIntervalId = setInterval(refreshTorrent, 1000);
	});

	io.on('torrent-stop-refresh', function (socket) {
		torrentRefreshCounter--;
		if (torrentRefreshCounter === 0)
		{
			clearInterval(torrentRefreshIntervalId);
			torrentRefreshIntervalId = null;
		}
	});

	io.on('connection', function (socket) {
		// connectedUsers++;
		console.log('new user connection');
		console.log('number of users currently connected :', io.engine.clientsCount);
		io.sockets.emit('connected-users', {connectedUsers: io.engine.clientsCount});
		if (io.engine.clientsCount === 1)
			finishRefreshTorrentIntervalId = setInterval(finishRefreshTorrent, second);
		// 	torrentIntervalId = setInterval(refreshTorrent, 1000);
		// socket.emit('connection', {
		//     connectedUsers: connectedUsers
		//   });
		// socket.broadcast.emit('connection', {
		//     connectedUsers: connectedUsers
		//   });
		// console.log('NB USERS : ',connectedUsers);
		// socket.on('disconnect', function (socket) {
		// 	console.log('disconnect ON !!');
		// });
		socket.once('disconnect', function (socket) {
			console.log('users still online : ', io.engine.clientsCount);
			if (io.engine.clientsCount > 0)
				io.sockets.emit('connected-users', {connectedUsers: io.engine.clientsCount});
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
