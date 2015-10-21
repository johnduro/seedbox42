
var mongoose = require('mongoose');
var ft = require('../utils/ft');

// var indexOfByKey = function (arr, key, value) {
// 	var arrayLength = arr.length;
// 	for (var i = 0; i < arrayLength; i++) {
// 		if (arr[i][key] === value)
// 			return i;
// 	}
// 	return -1;
// };

// ====================================
// FILE SCHEMA
// ====================================

var FileSchema = new mongoose.Schema({
	name: String,
	path: { type: String, default: "" },
	size: { type: Number, default: 0 },
	creator: { type: mongoose.Schema.ObjectId, ref: 'User' },
	hashString: { type: String, unique: true },
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

	modComment: function (commentId, comment, cb) {
		var index = ft.indexOfByKey(this.comments, '_id', commentId);
		if (index > -1)
			this.comments[index].text = comment;
		else
			return cb('comment not found');
		this.save(cb);
	},

	removeComment: function (commentId, cb) {
		// var index = indexOfByKey(this.comments, '_id', commentId);
		var index = ft.indexOfByKey(this.comments, '_id', commentId);
		if (index > -1)
			this.comments.splice(index, 1);
		else
			return cb('comment not found');
		this.save(cb);
	},

	countComments: function () {
		return this.comments.length;
	},

	addGrade: function (user, grade, cb) {
		var index = ft.indexOfByKey(this.grades, 'user', user._id);
		if (index === -1)
			this.grades.push({ user: user._id, grade: grade });
		else
			return cb('already graded');
		this.save(cb);
	},

	modGrade: function (user, newGrade, cb) {
		var index = ft.indexOfByKey(this.grades, 'user', user._id);
		if (index > -1)
			this.grades[index].grade = newGrade;
		else
			return cb('this user have not graded this file yet');
		this.save(cb);
	},

	removeGrade: function (user, cb) {
		var index = ft.indexOfByKey(this.grades, 'user', user._id);
		if (index > -1)
			this.grades.splice(index, 1);
		else
			return cb('grade not found');
		this.save(cb);
	},

	getAverageGrade: function () {
		var total = 0;
		if (this.grades.length === 0)
			return (0);
		this.grades.forEach(function (grade) {
			total += grade.grade;
		});
		return (total / this.grades.length);
	},

	addLock: function (user, cb) {
		var index = ft.indexOfByKey(this.locked, 'user', user._id);
		if (index === -1)
			this.locked.push({ user: user._id });
		else
			return cb('already locked by this user');
		this.save(cb);
	},

	removeLock: function (user, cb) {
		var index = ft.indexOfByKey(this.locked, 'user', user._id);
		if (index > -1 )
			this.locked.splice(index, 1);
		else
			return cb('this file is not locked by this user');
		this.save(cb);
	},

	getIsLocked: function () {
		if (this.locked.length > 0)
			return true;
		return false;
	},

	incDownloads: function () {
		this.downloads += 1;
		this.save();
	}
};

module.exports = mongoose.model('File', FileSchema);
