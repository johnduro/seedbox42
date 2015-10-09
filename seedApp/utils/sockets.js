// ****************************************
// SOCKETS
// ****************************************



module.exports = function (io, transmission) {

	var second = 1000;
	var torrentRefreshCounter = 0;
	var torrentRefreshIntervalId = null;

	var refreshTorrent = function () {
		transmission.torrentGet(["id", "error", "errorString", "eta", "isFinished", "isStalled", "leftUntilDone", "metadataPercentComplete", "peersConnected", "peersGettingFromUs", "peersSendingToUs", "percentDone", "queuePosition", "rateDownload", "rateUpload", "recheckProgress", "seedRatioMode", "seedRatioLimit", "sizeWhenDone", "status", "trackers", "downloadDir", "uploadedEver", "uploadRatio", "Webseedssendingtous"], "recently-active", function (err, res) {
		if (err)
			io.sockets.emit('torrent-error-refresh', {error: err});
		else
			io.sockets.emit('torrent-refresh-res', {result: res});
	});
	// console.log('yolo je refresh les diez et j emmit');
};

	var finishTorrent = function () {
		transmission.torrentGet([// check les trucs finish
								], "recently-active", function (err, res) {

		});
	};


	io.on('torrent-refresh', function (socket) {
		torrentRefreshCounter++;
		if (torrentRefreshCounter === 1)
			torrentRefreshIntervalId = setInterval(refreshTorrent, second, io, transmission);
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
		// if (io.engine.clientsCount === 1)
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
				}
			}
		});
	});
};
