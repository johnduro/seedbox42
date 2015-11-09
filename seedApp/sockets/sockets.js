var jwt = require('jsonwebtoken');
var torrents = require('./torrentSockets');
var wall = require('./wallSockets');

/**
 * Sockets
 */

module.exports = function (io, transmission, app) {

	var second = 1000;

	/**
	 * Socket auth
	 */
	io.use(function (socket, next) {
		console.log('SOCK AUTH --> ', socket.request._query['token']);
		if ('_query' in socket.request && 'token' in socket.request._query)
		{
			var token = socket.request._query['token'];
			jwt.verify(token, app.get('secret'), function (err, decoded) {
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
		console.log('new user connection', socket.appUser);
		console.log('number of users currently connected :', io.engine.clientsCount);

		io.sockets.emit('connectedUsers', { connectedUsers: io.engine.clientsCount });

		/**
		 * Torrents management through sockets
		 */
		torrents(socket, io, transmission);

		/**
		 * Wall messages management through sockets
		 */
		wall(socket, io, app.get('config'));

		socket.on('disconnect', function () {
			console.log('users still online : ', io.engine.clientsCount);
			if (io.engine.clientsCount > 0)
				io.sockets.emit('connectedUsers', { connectedUsers: io.engine.clientsCount });
		});
	});
};
