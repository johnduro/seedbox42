
var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	login: { type: String, unique: true },
	password: String,
	mail: String, //?? garder ??
	avatar: String,
	role: { type: Number, default: 1 },
	createdAt: { type: Date, default: Date.now }
});


/**
 * Methods statics
 */

UserSchema.statics = {
	getByIdFormatShow: function (id, cb) {
		this.findOne({ _id: id })
			.select('-password -mail')
			.exec(function (err, user) {
				if (err)
					return cb(err);
				console.log('USER >> ', user);
				return cb(null, user.toObject());
			});
	}
};

module.exports = mongoose.model('User', UserSchema);
