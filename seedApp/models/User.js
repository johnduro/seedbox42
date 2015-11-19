
var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	login: { type: String, unique: true },
	password: String,
	mail: String, //?? garder ??
	avatar: String,
	role: { type: String, default: 'user' },
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
				else if (user == null)
					return cb(null, { login: "unknown user", avatar: "undefined", role: 1 });
				else
					return cb(null, user.toObject());
			});
	}
};

module.exports = mongoose.model('User', UserSchema);
