
var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	login: String,
	password: String,
	mail: String, //?? garder ??
	role: { type: Number, default: 1 }
});

module.exports = mongoose.model('User', UserSchema);
