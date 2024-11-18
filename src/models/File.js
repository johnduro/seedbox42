import fs from 'fs';
import pathS from 'path';
import mongoose from 'mongoose';
import { rimraf } from 'rimraf';
import mime from 'mime';
import ft from '../utils/ft.js'
import format from '../utils/format.js';



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
			.populate([{ path: 'creator', select: populateSelect }, { path: 'comments.user', select: populateSelect }, { path: 'grades.user', select: populateSelect }])
			.exec(function (err, file) {
				if (err)
					return cb(err);
				for (var i = 0; i < file.comments.length; i++)
				{
					if (file.comments[i].user == null)
						file.comments[i].user = { login: "unknown user", avatar: "undefined", role: 'user' };
				}
				return cb(null, file);
			});
	},

/* 	getFileList: function (match, sort, limit, user, cb) {
		var populateSelect = 'login role avatar';
		match.isFinished = true;
		var query = this.find(match);
		query.select('-path -hashString -isFinished -privacy -torrentAddedAt -grades -comments');
		query.populate([{ path: 'creator', select: populateSelect }]);
		query.sort(sort);
		if (limit > 0)
			query.limit(limit);
		query.exec(function (err, files) {
			if (err)
				return cb(err);
			var formatFiles = format.fileList(files, user);
			return cb(null, formatFiles);
		});
	}, */

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

	createFile: async function (torrentAdded, userId) {
		try {
			const file = await this.create({ name: torrentAdded['name'], creator: userId, hashString: torrentAdded['hashString'] });
			return file;
		} catch (err) {
			throw err;
		}
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
};

FileSchema.statics.insertTorrent = async function (torrentId, torrentName, transmission) {
	try {
		const res = await transmission.torrentGet(transmission.requestFormat.infosFinished, torrentId);
		if (!res.torrents || !res.torrents[0]) {
			throw new Error('No torrents found');
		}
		const torrent = res.torrents[0];
		const path = torrent['downloadDir'] + '/' + torrentName;
		fs.stat(path, async (err, stat) => {
			if (err) {
				throw new Error(err);
			}
			const fileType = stat.isDirectory() ? 'folder' : mime.lookup(path);
			const newFile = await this.findOneAndUpdate(
				{ hashString: torrent.hashString, isFinished: false },
				{ $set: { name: torrentName, path: path, size: torrent.totalSize, isFinished: true, fileType: fileType, createdAt: Date.now() } },
				{ new: true },
			);
		});
	} catch (err) {
	  console.error('Error in insertTorrent:', err);
	  throw err;
	}
  };

FileSchema.statics.getFileList = async function (match, sort, limit, user) {
	const populateSelect = 'login role avatar';
	match.isFinished = true;

	try {
		const query = this.find(match)
			.select('-path -hashString -isFinished -privacy -torrentAddedAt -grades -comments')
			.populate([{ path: 'creator', select: populateSelect }])
			.sort(sort);

		if (limit > 0) query.limit(limit);

		const files = await query.exec();
		const formatFiles = format.fileList(files, user);
		return formatFiles;
	} catch (err) {
		throw new Error(`Error getting file list: ${err.message}`);
	}
};

/**
 * Methods
 */

FileSchema.methods.deleteFile = async function (transmission) {
	try {
		if (this.fileType === 'folder') {
			await rimraf(this.path);
		} else {
			await fs.promises.unlink(this.path);
		}
		await transmission.torrentRemove(this.hashString, true);
		await this.remove();
		return { success: true, message: 'File deleted successfully' };
	} catch (err) {
		console.error('Error in deleteFile:', err);
		throw err;
	}
};

FileSchema.methods = {
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
		var index = ft.indexOfByIdKey(this.locked, 'user', user._id);
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

export default mongoose.model('File', FileSchema);
