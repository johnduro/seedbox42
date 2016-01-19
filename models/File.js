var fs = require('fs');
var pathS = require('path');
var mongoose = require('mongoose');
var rimraf = require('rimraf');
var mime = require('mime');
var User = require('../models/User.js');
var ft = require('../utils/ft');
var format = require('../utils/format');


/**
 * File Schema
 */

var FileSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	path: {
		type: String,
		default: ""
	},
	size: {
		type: Number,
		default: 0
	},
	creator: {
		type: mongoose.Schema.ObjectId,
		ref: 'User'
	},
	hashString: {
		type: String,
		unique: true,
		required: true
	},
	isFinished: {
		type: Boolean,
		default: false
	},
	fileType: {
		type: String,
		default: ''
	},
	downloads: {
		type: Number,
		default: 0
	},
	privacy : {
		type: Number,
		default: 1
	},
	commentsNbr: {
		type: Number,
		default: 0
	},
	lastupdatedComment : {
		type: Date,
		default: null
	},
	comments: [{
		text: { type: String, default: '' },
		user: { type: mongoose.Schema.ObjectId, ref: 'User' },
		createdAt: { type: Date, default: Date.now }
	}],
	lastupdatedLocked : {
		type: Date,
		default: null
	},
	oldestLocked : {
		type: Date,
		default: null
	},
	locked: [{
		user: { type: mongoose.Schema.ObjectId, ref: 'User' },
		createdAt: { type: Date, default: Date.now }
	}],
	averageGrade: {
		type: Number,
		default: 0
	},
	grades: [{
		user: { type: mongoose.Schema.ObjectId, ref: 'User' },
		grade: Number
	}],
	createdAt : Date,
	torrentAddedAt : {
		type: Date,
		default: Date.now
	}
});


/**
 * Methods statics
 */
FileSchema.statics = {
	getFileById: function (id, cb) {
		var populateSelect = 'login role avatar';
		this.findOne({ _id: id, isFinished: true })
			.select('-isFinished -hashString -torrentAddedAt')
			.populate([{ path: 'creator', select: populateSelect }, { path: 'comments.user', select: populateSelect }, { path: 'locked.user', select: populateSelect }, { path: 'grades.user', select: populateSelect }])
			.exec(function (err, file) {
				if (err)
					return cb(err);
				for (var i = 0; i < file.comments.length; i++)
				{
					if (file.comments[i].user == null)
						file.comments[i].user = { login: "unknown user", avatar: "undefined", role: 1 };
				}
				return cb(null, file);
			});
	},

	getFileList: function (match, sort, limit, user, cb) {
		var populateSelect = 'login role avatar';
		match.isFinished = true;
		var query = this.find(match);
		query.select('-path -hashString -isFinished -privacy -torrentAddedAt');
		query.populate([{ path: 'creator', select: populateSelect }, { path: 'comments.user', select: populateSelect }, { path: 'locked.user', select: populateSelect }, { path: 'grades.user', select: populateSelect }]);
		query.sort(sort);
		if (limit > 0)
			query.limit(limit);
		query.exec(function (err, files) {
			if (err)
				return cb(err);
			var formatFiles = format.fileList(files, user);
			return cb(null, formatFiles);
		});
	},

	getCommentsById: function (id, cb) {
		this.findById(id, function (err, file) {
			if (err)
				return cb(err);
			format.commentList(file.comments, function (err, comments) {
				if (err)
					return cb(err);
				return cb(null, comments);
			});
		});
	},

	getUserLockedFiles: function (user, sortOrder, limit, cb) {
		var query = this.find({ "locked.user": user._id })
				.select('-path -creator -hashString -isFinished -privacy -torrentAddedAt')
				.sort({ "locked.createdAt": sortOrder });
		if (limit > 0)
			query.limit(limit);
		query.exec(function (err, files) {
			if (err)
				return cb(err);
			var formatFiles = format.fileList(files, user);
			return cb(null, formatFiles);
		});
	},

	removeDayLock: function (days, cb) {
		var dateDelete = new Date();
		dateDelete.setDate(dateDelete.getDate() - days);
		this.find({ "locked.createdAt": { $lt: dateDelete } }, function (err, files) {
			if (err)
				cb(err);
			else
			{
				files.map(function (file) {
					file.removeDayLockInFile(dateDelete);
				});
				cb(null, files);
			}
		});
	},

	removeOldFile: function (days, transmission, cb) {
		var dateDelete = new Date();
		dateDelete.setDate(dateDelete.getDate() - days);
		this.find({ "createdAt": { $lt: dateDelete }, "locked": { $size: 0 } }).exec(function (err, files) {
			if (err)
				cb(err);
			else
			{
				files.map(function (file) {
					file.deleteFile(transmission, function (err, message) {
						if (err)
							console.log("delete:file:unlink:message: ", message);
					});
				});
				cb(null, files);
			}
		});
	},

	createFile: function (torrentAdded, userId, cb) {
		this.create({ name: torrentAdded['name'], creator: userId, hashString: torrentAdded['hashString']}, function (err, file) {
			if (err)
				cb(err);
			else
				cb(null, file);
		});
	},

	insertFile: function (file, userId, hashString, cb) {
		var fileToInsert = {
			name: pathS.basename(file.path),
			path: file.path,
			size: file.size,
			creator:  mongoose.mongo.ObjectID(userId),
			hashString: hashString,
			isFinished: true,
			fileType: file.fileType,
			createdAt: Date.now()
		};
		this.create(fileToInsert, function (err, file) {
			if (err)
				cb(err);
			else
				cb(null, file);
		});
	},

	insertTorrent: function (torrentId, name, transmission, done) {
		var self = this;
		transmission.torrentGet(transmission.requestFormat.infosFinished, torrentId, function (err, resp) {
			console.log("ajout in DB");
			if (err)
				done(err);
			else
			{
				console.log(resp['torrents'].length);
				if (resp['torrents'].length > 0)
				{
					var torrent = resp['torrents'][0];
					var path = torrent['downloadDir'] + '/' + name;
					fs.stat(path, function (err, stat) {
						if (err)
							return done(err);
						var fileType = '';
						if (stat.isDirectory())
							fileType = 'folder';
						else
							fileType = mime.lookup(path);
						self.findOneAndUpdate(
							{ hashString: torrent['hashString'], isFinished: false },
							{ $set: { name: name, path: path, size: torrent['totalSize'], isFinished: true, fileType: fileType, createdAt: Date.now() } },
							{ new: true },
							function (err, newFile) {
								if (err)
									done(err);
								else
									done(null, newFile);
							}
						);
					});
				}
			}
		});
	}
};

/**
 * Methods
 */

FileSchema.methods = {
	deleteFile: function (transmission, cb) {
		var self = this;
		transmission.torrentRemove(self.hashString, false, function (err, resp) {
			if (err)
				console.log("delete:file:torrent-remove:err: ", err);
			else
				console.log('delete:file:torrent-remove:success: ', resp);
			rimraf(self.path, function (err) {
				if (err)
					console.log("delete:file:unlink:err: ", err);
				self.remove();
				if (err)
					cb(err, "File removed from database but there was an issue while deleting from the server");
				else
					cb(null, "File successfuly removed");
			});
		});
	},

	deleteFileFromDb: function (transmission, cb) {
		var self = this;
		transmission.torrentRemove(self.hashString, false, function (err, resp) {
			if (err)
				console.log("delete:file:torrent-remove:err: ", err);
			else
				console.log('delete:file:torrent-remove:success: ', resp);
			self.remove(cb);
		});
	},

	addComment: function (user, comment, cb) {
		this.comments.push({ text: comment, user: user._id });
		this.commentsNbr++;
		this.lastupdatedComment = Date.now();
		this.save(cb);
	},

	modComment: function (commentId, comment, cb) {
		var index = ft.indexOfByIdKey(this.comments, '_id', commentId);
		if (index > -1)
			this.comments[index].text = comment;
		else
			return cb('comment not found');
		this.save(cb);
	},

	removeComment: function (commentId, cb) {
		var index = ft.indexOfByIdKey(this.comments, '_id', commentId);
		if (index > -1)
		{
			this.comments.splice(index, 1);
			this.commentsNbr--;
		}
		else
			return cb('comment not found');
		this.save(cb);
	},

	countComments: function () {
		return this.comments.length;
	},

	addGrade: function (user, grade, cb) {
		var index = ft.indexOfByIdKey(this.grades, 'user', user._id.toString());
		if (index === -1)
		{
			this.grades.push({ user: user._id, grade: grade });
			this.averageGrade = this.getAverageGrade();
		}
		else
		{
			this.grades.splice(index, 1);
			this.grades.push({ user: user._id, grade: grade });
			this.averageGrade = this.getAverageGrade();
		}
		this.save(cb);
	},

	removeGrade: function (user, cb) {
		var index = ft.indexOfByIdKey(this.grades, 'user', user._id.toString());
		if (index > -1)
			this.grades.splice(index, 1);
		else
			return cb('grade not found');
		this.averageGrade = this.getAverageGrade();
		this.save(cb);
	},

	getAverageGrade: function getAverageGrade () {
		var total = 0;
		if (this.grades.length === 0)
			return (0);
		this.grades.forEach(function (grade) {
			total += grade.grade;
		});
		return (total / this.grades.length);
	},

	addLock: function (user, cb) {
		var index = ft.indexOfByIdKey(this.locked, 'user', user._id.toString());
		if (index === -1)
		{
			this.locked.push({ user: user._id });
			this.lastupdatedLocked = Date.now();
			if (this.oldestLocked == null)
				this.oldestLocked = this.lastupdatedLocked;
		}
		else
			return cb('already locked by this user');
		this.save(cb);
	},

	removeLock: function (user, cb) {
		var index = ft.indexOfByIdKey(this.locked, 'user', user._id.toString());
		if (index > -1 )
		{
			var removed = this.locked.splice(index, 1);
			var lockedLenght = this.locked.length;
			if (lockedLenght == 0)
			{
				this.lastupdatedLocked = null;
				this.oldestLocked = null;
			}
			else if ((removed.createdAt == this.lastupdatedLocked) || (removed.createdAt == this.oldestLocked))
			{
				var newest = Date(0);
				var oldest = Date.now();
				for (var i = 0; i < lockedLenght; i++)
				{
					if (this.locked[i].createdAt > newest)
						newest = this.locked[i].createdAt;
					if (this.locked[i].createdAt < oldest)
						oldest = this.locked[i].createdAt;
				}
				this.lastupdatedLocked = newest;
				this.oldestLocked = oldest;
			}
		}
		else
			return cb('this file is not locked by this user');
		this.save(cb);
	},

	removeAllLock: function (cb) {
		console.log('HERE UNLOCK ALL :: ', this.name);
		this.lastupdatedLocked = null;
		this.oldestLocked = null;
		this.locked = [];
		this.save(cb);
	},

	removeDayLockInFile: function (dateDelete) {
		for (var i = (this.locked.length - 1); i >= 0; i--)
		{
			if (this.locked[i].createdAt.getTime() < dateDelete.getTime())
				this.locked.splice(i, 1);
		}
		this.save();
	},

	getIsLocked: function () {
		if (this.locked.length > 0)
			return true;
		return false;
	},

	getIsLockedByUser: function (user) {
		var index = ft.indexOfByUserId(this.locked, user._id);
		if (index > -1)
			return true;
		return false;
	},

	getUserGrade: function (user) {
		var index = ft.indexOfByUserId(this.grades, user._id);
		if (index < 0)
			return (0);
		else
			return (this.grades[index].grade);
	},

	incDownloads: function () {
		this.downloads += 1;
		this.save(function (err) {
			if (err)
				console.log("Download increment error: ", err);
		});
	},

	renamePath: function (path, name, cb) {
		this.path = path;
		this.name = name;
		this.save(cb);
	},

	addSize: function (size) {
		this.size += size;
		this.save();
	}
};

module.exports = mongoose.model('File', FileSchema);
