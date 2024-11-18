import mongoose from 'mongoose';
import ft from '../utils/ft.js';

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
		type: String,
		enum: ['admin', 'user'],
		default: 'user'
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
					return cb(null, { login: "unknown user", avatar: "undefined", role: 'user' });
				else
					return cb(null, user.toObject());
			});
	},

	createNew: async function (infos) {
		return new Promise((resolve, reject) => {
			var self = this;
			if (infos.password.length < 5) {
				return reject('The password must 5 characters at least');
			}
			ft.getUserPwHash(infos.password, async function (err, hash) {
				if (err) {
					return reject(err);
				}
				infos.password = hash;
				try {
					infos.password = hash;
					const post = await self.create(infos);
					return resolve(post);
				  } catch (err) {
					return reject(err);
				  }
			});
		});
	},

	updateUserById: function (id, infos, cb) {
		var self = this;
		if (!('password' in infos) || infos.password === "" || infos.password == 'undefined')
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

export default mongoose.model('User', UserSchema);
