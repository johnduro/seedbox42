
var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	login: {
		type: String,
		unique: true,
		required: true,
		minlength: 2
	},
	password: {
		type: String,
		required: true,
		minlength: 5
	},
	mail: {
		type: String,
		match: /[^\s@]+@[^\s@]+\.[^\s@]+/
	},
	avatar: {
		type: String
	},
	role: {
		type: Number,
		default: 1
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
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
