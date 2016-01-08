var mongoose = require('mongoose');
var ft = require('../utils/ft');

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
	},

	createNew: function (infos, cb) {
		var self = this;
		if (infos.password.length < 5)
			return cb('The password must 5 characters at least');
		ft.getUserPwHash(infos.password, function (err, hash) {
				self.create(infos, function (err, post) {
					if (err)
						return cb(err);
					else
						return cb(null, post);
				});
		});
	},

	updateUserById: function (id, infos, cb) {
		var self = this;
		if (infos.password === "")
		{
			delete infos.password;
			self.findByIdAndUpdate(id, { $set: infos }, { new: true }, function (err, post) {
				if (err)
					return cb(err);
				else
					return cb(null, post);
			});
		}
		else
		{
			ft.getUserPwHash(infos.password, function (err, hash) {
				if (err)
					return cb(err);
				infos.password = hash;
				self.findByIdAndUpdate(id, { $set: infos }, { new: true }, function (err, post) {
					if (err)
						return cb(err);
					else
						return cb(null, post);
				});
			});
		}
	}
};

module.exports = mongoose.model('User', UserSchema);
