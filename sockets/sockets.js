var jwt = require('jsonwebtoken');
var wall = require('./wallSockets');
var TorrentSockets = require('./torrentSockets');

/**
 * Sockets
 */

module.exports = function (io, transmission, app) {

	var second = 1000;
	var torrentSocket = new TorrentSockets(io, transmission, app);

	/**
	 * Socket auth
	 */
	io.use(function (socket, next) {
		if ('_query' in socket.request && 'token' in socket.request._query)
		{
			var token = socket.request._query['token'];
			jwt.verify(token, app.locals.ttConfig.secret, function (err, decoded) {
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
			next(new Error('not authorized'));
	});

	/**
	 * Socket connection
	 */
	io.on('connection', function (socket) {
		io.sockets.emit('connectedUsers', { connectedUsers: io.engine.clientsCount });

		/**
		 * Torrents management through sockets
		 */
		torrentSocket.newConnection(socket);

		/**
		 * Wall messages management through sockets
		 */
		wall(socket, io, app.get('config'));

		socket.on('disconnect', function () {
			if (io.engine.clientsCount > 0)
				io.sockets.emit('connectedUsers', { connectedUsers: io.engine.clientsCount });
		});
	});
};
