import jwt from "jsonwebtoken";
import WallSockets from "./wallSockets.js";
import TorrentSockets from "./torrentSockets.js";

/**
 * Sockets
 */

export default function (io, transmission, app) {

	var second = 1000;
	var torrentSocket = new TorrentSockets(io, transmission, app);
	var wallSocket = new WallSockets(io, app.get('config'));
	var connectedUsersLogin = [];

	/**
	 * Socket auth
	 */
	io.use(function (socket, next) {
		const token = socket.handshake.auth.token;

		if (!token) {
			console.log('Authentication error: No token provided');
			return next(new Error('Authentication error: No token provided'));
		}

		jwt.verify(token, app.locals.ttConfig.secret, (err, decoded) => {
			if (err) {
				console.log('Authentication error: Invalid token');
				return next(new Error('Authentication error: Invalid token'));
			}
			socket.appUser = decoded;
			next();
		});
	});

	/**
	 * Socket connection
	 */
	io.on('connection', function (socket) {
		/**
		 * Connected users infos
		 */
		connectedUsersLogin.push(socket.appUser.login);
		io.sockets.emit('connectedUsers', { connectedUsers: io.engine.clientsCount, logins: connectedUsersLogin });
		socket.on('connectedUsers', function (data) {
			io.sockets.emit('connectedUsers', { connectedUsers: io.engine.clientsCount, logins: connectedUsersLogin });
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

			if (io.engine.clientsCount == 0) {
				connectedUsersLogin = [];
			} else {
				var index = connectedUsersLogin.indexOf(socket.appUser.login);
				if (index > -1) {
					connectedUsersLogin.splice(index, 1);
				}
			}

			if (io.engine.clientsCount > 0) {
				io.sockets.emit('connectedUsers', { connectedUsers: io.engine.clientsCount, logins: connectedUsersLogin });
			}
		});
	});

	/**
	 * Make the connected users update their config when modified
	 */
	app.on('config:reload', function () {
		io.sockets.emit('update:config');
	});
};
