import Wall from "../models/Wall.js";

class WallSockets {
	constructor (io, appConfig) {
		this.io = io;
		this.appConfig = appConfig;	
	}

	newConnection(socket) {
		socket.on('chat:post:message', async (data) => {
			try {
				console.log('in post message', data);
				const message = await Wall.addMessage(data.id, data.message, this.appConfig.dashboard['mini-chat-message-limit']);
				this.io.sockets.emit('chat:new:message', { message: message });
			} catch (err) {
				console.log('error in post message', err);
				socket.emit('chat:post:message', { message: 'could not record message' });
			}
		});

		socket.on('chat:get:message', async (data, callback) => {
			console.log('chat:get:message');
			try {
				const messages = await Wall.getMessages();
				if (typeof callback === 'function') {
					console.log('messages is function', messages);
					callback({ message: messages });
				}
			} catch (err) {
				console.log('error in get messages', err);
				if (typeof callback === 'function') {
					callback({ message: 'could not get messages' });
				}
			}
		});
	}
}

export default WallSockets;
