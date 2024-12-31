
import mongoose from 'mongoose';
import format from '../utils/format.js';

const { Schema } = mongoose

/**
 * WallMessage Schema
 */

var WallMessageSchema = new Schema({
	message: {
		type: String,
		required: true,
		validate: [
			function (message) {
				if (message.length > 0)
					return true;
			}
		]
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User'
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});


/**
 * Methods statics
 */

WallMessageSchema.statics = {
	async deleteXOldMessages(nb) {
		try {
			const messages = await this.find({}).sort({ createdAt: 1 }).limit(nb).exec();
			if (!messages) {
				console.log('No messages found to delete');
				return;
			}
			for (const message of messages) {
				await message.remove();
			}
		} catch (err) {
			console.log('Error in delete messages', err);
		}
	},

	async addMessage(user, message, limit) {
		try {
			const newMessage = await this.create({ message: message, user: user });
			const count = await this.countDocuments({});
			if (count > limit) {
				await this.deleteXOldMessages(count - limit);
			}
			const formattedMessage = await format.wallMessageList([newMessage]);
			return formattedMessage[0];
		} catch (err) {
			throw err;
		}
	},

	async getMessages() {
		try {
			const messages = await this.find({}).sort({ createdAt: -1 }).populate('user').exec();
			const formattedMessages = await format.wallMessageList(messages);
			return formattedMessages;
		} catch (err) {
			throw err;
		}
	},
};

export default mongoose.model('WallMessage', WallMessageSchema);
