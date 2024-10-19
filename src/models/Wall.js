
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
	deleteXOldMessages: function (nb) {
		this.find({}).sort({"createdAt": 1 }).limit(nb).exec(function (err, messages) {
			if (err || messages == null)
				console.log("error in delete messages", err);
			else
				messages.map(function (message) {
					message.remove();
				});
		});
	},

	addMessage: function (user, message, limit, cb) {
		this.create({ message: message, user: user }, function (err, file) {
			if (err)
				return cb(err);
			this.count({}, function (err, count) {
				if (count > limit)
				{
					this.findOneAndRemove({}).sort({ createdAt: 1 }).exec(function (err, message) {
						if (err)
							return cb(err);
					});
				}
			});
			format.wallMessageList([file], function (err, formatFile) {
				if (err)
					return cb(err);
				return cb(null, formatFile[0]);
			});
		});
	},

	getMessages: function (cb) {
		this.find({}, null, { sort: { createdAt: 1 } }, function (err, messages) {
			if (err)
				return cb(err);
			else
				format.wallMessageList(messages, function (err, formatFiles) {
					if (err)
						return cb(err);
					return cb(null, formatFiles);
				});
		});
	}
};

export default mongoose.model('WallMessage', WallMessageSchema);
