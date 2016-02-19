var jwt = require('jsonwebtoken');
var WallSockets = require('./wallSockets');
var TorrentSockets = require('./torrentSockets');
var UsersManager = require('../utils/usersConnection');

/**
 * Sockets
 */

module.exports = function (io, transmission, app) {

	var second = 1000;
	var torrentSocket = new TorrentSockets(io, transmission, app);
	var wallSocket = new WallSockets(io, app.get('config'));
	var usersManager = new UsersManager();

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
		/**
		 * Connected users infos
		 */
		usersManager.newConnection(socket.handshake.address, socket.appUser);
		io.sockets.emit('connectedUsers', { connectedUsers: usersManager.getUsersCount(), logins: usersManager.getList() });
		socket.on('connectedUsers', function (data, callback) {
			callback({ connectedUsers: usersManager.getUsersCount(), logins: usersManager.getList() });
		});

		socket.on('connectedUsers:details', function (ph, callback) {
			usersManager.getDetails(function (err, data) {
				callback(data);
			});
		});

		/**
		 * Torrents management through sockets
		 */
		torrentSocket.newConnection(socket);

		/**
		 * Wall messages management through sockets
		 */
		wallSocket.newConnection(socket);

		socket.on('disconnect', function () {

			usersManager.disconnect(socket.handshake.address, socket.appUser);
			if (io.engine.clientsCount == 0)
				usersManager.clean();
			else if (io.engine.clientsCount > 0)
				io.sockets.emit('connectedUsers', { connectedUsers: usersManager.getUsersCount(), logins: usersManager.getList() });
		});
	});

	/**
	 * Make the connected users update their config when modified
	 */
	app.on('config:reload', function () {
		io.sockets.emit('update:config');
	});
};
