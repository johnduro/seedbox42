var Wall = require('../models/Wall.js');


module.exports = function (socket, io, appConfig) {
	/**
	 * Socket - On - Event
	 * Add a message on the dashboard
	 */
	socket.on('chat:post:message', function (data) {
		Wall.addMessage(data.id, data.message, appConfig.dashboard["mini-chat-message-limit"], function (err, message) {
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
		Wall.getMessages(function (err, messages) {
			if (err)
				callback({ success: false, message: 'could not get messages' });
			else
				callback({ success: true, message: messages });
		});
	});
};
