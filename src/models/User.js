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

	getByIdFormatShow: async function (id) {
		try {
			const user = await this.findOne({ _id: id })
				.select('-password -mail')
				.exec();

			if (!user) {
				return { login: "unknown user", avatar: "undefined", role: 'user' };
			}

			return user.toObject();
		} catch (err) {
			throw new Error(`Error getting user by ID: ${err.message}`);
		}
	},

	createNew: async function (infos) {
		if (infos.password.length < 5) {
			throw new Error('The password must be at least 5 characters long');
		}

		try {
			const hash = await ft.getUserPwHash(infos.password);
			infos.password = hash;
			const post = await this.create(infos);
			return post;
		} catch (err) {
			throw new Error(`Error creating new user: ${err.message}`);
		}
	},

	updateUserById: async function (id, infos) {
		try {
			if (!('password' in infos) || infos.password === "" || infos.password == 'undefined') {
				delete infos.password;
			} else {
				const hash = await ft.getUserPwHash(infos.password);
				infos.password = hash;
			}

			const updatedUser = await this.findByIdAndUpdate(id, { $set: infos }, { new: true }).exec();
			return updatedUser;
		} catch (err) {
			throw new Error(`Error updating user: ${err.message}`);
		}
	}
};

export default mongoose.model('User', UserSchema);
