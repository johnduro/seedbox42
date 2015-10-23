
var mongoose = require('mongoose');
var ft = require('../utils/ft');

/**
 * WallMessage Schema
 */

var WallMessageSchema = new mongoose.Schema({
	message: String,
	user: { type: mongoose.Schema.ObjectId, ref: 'User' },
	createdAt: { type: Date, default: Date.now }
});


/**
 * Methods statics
 */

WallMessageSchema.statics = {
	addMessage: function (user, message, cb) {
		this.create({ message: message, user: user }, function (err, file) {
			if (err)
				return cb(err);
				// throw err;
			this.count({}, function (err, count) {
				if (count > 100)
				{
					this.findOneAndRemove({}).sort({ createdAt: 1 }).exec(function (err, message) {
						if (err)
							return cb(err);
							// throw err;
					});
				}
			});
			ft.formatMessageList([file], function (err, formatFile) {
				if (err)
					return cb(err);
				return cb(null, formatFile[0]);
			});
			// return cb(null, file);
		});
	}
};

module.exports = mongoose.model('WallMessage', WallMessageSchema);
