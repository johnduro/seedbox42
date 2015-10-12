
var mongoose = require('mongoose');

var FileSchema = new mongoose.Schema({
	name: String,
	path: String,
	size: Number,
	user: { type: mongoose.Schema.ObjectId, ref: 'User' },
	isFinished: { type: Boolean, default: false },
	torrent: String, //utile ?
	comments: [{
		text: { type: String, default: '' },
		user: { type: mongoose.Schema.ObjectId, ref: 'User' },
		createdAt: { type: Date, default: Date.now }
	}],
	locked: [{
		user: { type: mongoose.Schema.ObjectId, ref: 'User' },
		createdAt: { type: Date, default: Date.now }
	}],
	grade: [{
		user: { type: mongoose.Schema.ObjectId, ref: 'User' },
		grade: Number
	}],
	createdAt : { type: Date, default: Date.now }
});


module.exports = mongoose.model('File', FileSchema);
