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
	// var connectedUsersLogin = [];

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
		// console.log('SOCKET :: ', socket.handshake.address);
		/**
		 * Connected users infos
		 */
		usersManager.newConnection(socket.handshake.address, socket.appUser);//new
		// console.log('MANGER :: ', usersManager.getList());

		// connectedUsersLogin.push(socket.appUser.login);
		// io.sockets.emit('connectedUsers', { connectedUsers: io.engine.clientsCount, logins: connectedUsersLogin });
		// io.sockets.emit('connectedUsers', { connectedUsers: io.engine.clientsCount, logins: usersManager.getList() });
		io.sockets.emit('connectedUsers', { connectedUsers: usersManager.getUsersCount(), logins: usersManager.getList() });
		socket.on('connectedUsers', function (data, callback) {
			callback({ connectedUsers: usersManager.getUsersCount(), logins: usersManager.getList() });
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

			usersManager.disconnect(socket.handshake.address, socket.appUser);//new
			if (io.engine.clientsCount == 0)
				usersManager.clean();
			// if (io.engine.clientsCount == 0)
			// 	connectedUsersLogin = [];
			// else
			// {
			// 	var index = connectedUsersLogin.indexOf(socket.appUser.login);
			// 	if (index > -1)
			// 		connectedUsersLogin.splice(index, 1);
			// }

			if (io.engine.clientsCount > 0)
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
