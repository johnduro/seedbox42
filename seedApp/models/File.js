
var mongoose = require('mongoose');

var indexOfByKey = function (arr, key, value) {
	var arrayLength = arr.length;
	for (var i = 0; i < arrayLength; i++) {
		if (arr[i][key] === value)
			return i;
	}
	return -1;
};

// ====================================
// FILE SCHEMA
// ====================================

var FileSchema = new mongoose.Schema({
	name: String,
	path: { type: String, default: "" },
	size: { type: Number, default: 0 },
	creator: { type: mongoose.Schema.ObjectId, ref: 'User' },
	hashString: String,
	isFinished: { type: Boolean, default: false },
	fileType: { type: String, default: '' },
	downloads: { type: Number, default: 0 },
	privacy : { type: Number, default: 1 },
	// torrent: String, //utile ?
	comments: [{
		text: { type: String, default: '' },
		user: { type: mongoose.Schema.ObjectId, ref: 'User' },
		createdAt: { type: Date, default: Date.now }
	}],
	locked: [{
		user: { type: mongoose.Schema.ObjectId, ref: 'User' },
		createdAt: { type: Date, default: Date.now }
	}],
	grades: [{
		user: { type: mongoose.Schema.ObjectId, ref: 'User' },
		grade: Number
	}],
	createdAt : Date,
	torrentAddedAt : { type: Date, default: Date.now }
});


// ====================================
// METHODS
// ====================================

FileSchema.methods = {
	addComment: function (user, comment, cb) {
		this.comments.push({ text: comment, user: user._id });
		this.save(cb);
	},

	removeComment: function (commentId, cb) {
		var index = indexOfByKey(this.comments, '_id', commentId);
		if (index > -1)
			this.comments.splice(index, 1);
		else
			return cb('not found');
		this.save(cb);
	},

	addGrade: function (user, grade, cb) {
		var index = indexOfByKey(this.grades, 'user', user._id);
		if (index === -1)
			this.grades.push({ user: user._id, grade: grade });
		else
			return cb('already graded');
		this.save(cb);
	}
};

module.exports = mongoose.model('File', FileSchema);
