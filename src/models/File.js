import fs from 'fs';
import pathS from 'path';
import mongoose from 'mongoose';
import { rimraf } from 'rimraf';
import mime from 'mime';
import path from 'path';
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
			const fileType = stat.isDirectory() ? 'folder' : mime.getType(path);
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

FileSchema.statics.getFinishedFileList = async function (match, sort, limit, user) {
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

FileSchema.statics.getFileById = async function (id) {
	try {
		const populateSelect = 'login role avatar';
		const file = await this.findOne({ _id: id, isFinished: true })
			.select('-isFinished -hashString -torrentAddedAt')
			.populate([{ path: 'creator', select: populateSelect }, { path: 'comments.user', select: populateSelect }, { path: 'grades.user', select: populateSelect }])
			.exec();

		if (!file) {
			throw new Error('File not found');
		}

		for (let i = 0; i < file.comments.length; i++) {
			if (file.comments[i].user == null) {
				file.comments[i].user = { login: "unknown user", avatar: "undefined", role: 'user' };
			}
		}

		return file;
	} catch (err) {
		throw new Error(`Error getting file by ID: ${err.message}`);
	}
}

FileSchema.statics.getCommentsById = async function (id) {
	try {
		const file = await this.findOne({ _id: id })
			.select('comments')
			.populate('comments.user', 'login avatar role')
			.exec();

		if (!file) {
			throw new Error('File not found');
		}

		const comments = await format.commentList(file.comments);
		return comments;
	} catch (err) {
		throw new Error(`Error getting comments by ID: ${err.message}`);
	}
}

/**
 * Methods
 */

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

	modComment: function (commentId, comment, cb) {
		var index = ft.indexOfByIdKey(this.comments, '_id', commentId);
		if (index > -1)
			this.comments[index].text = comment;
		else
			return cb('comment not found');
		this.save(cb);
	},

	countComments: function () {
		return this.comments.length;
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
};

FileSchema.methods.deleteFileFromDb = async function (transmission) {
	try {
		await transmission.torrentRemove(this.hashString, false);
		await this.deleteOne();
		return { message: 'File deleted successfully from database' };
	} catch (err) {
		console.error('Error in deleteFileFromDb:', err);
		throw err;
	}
}

FileSchema.methods.deleteFile = async function (transmission) {
	try {
		if (this.fileType === 'folder') {
			await rimraf(this.path);
		} else {
			await fs.promises.unlink(this.path);
		}
		await transmission.torrentRemove(this.hashString, true);
		await this.deleteOne();
		return { message: 'File deleted successfully' };
	} catch (err) {
		console.error('Error in deleteFile:', err);
		throw err;
	}
};

FileSchema.methods.addGrade = async function (userId, grade) {
	if (!Number.isInteger(grade) || grade < 1 || grade > 5) {
		throw new Error('Grade must be an integer between 1 and 5');
	}

	const userGrade = this.grades.find(g => g.user.equals(userId));
	if (userGrade) {
		userGrade.grade = grade;
	} else {
		this.grades.push({ user: userId, grade });
	}

	this.averageGrade = this.grades.reduce((sum, g) => sum + g.grade, 0) / this.grades.length;
	await this.save();
	return this;
};

FileSchema.methods.removeGrade = async function (userId) {
	const index = this.grades.findIndex(g => g.user.equals(userId));
	if (index === -1) {
		throw new Error('Grade not found for this user');
	}

	this.grades.splice(index, 1);

	if (this.grades.length > 0) {
		this.averageGrade = this.grades.reduce((sum, g) => sum + g.grade, 0) / this.grades.length;
	} else {
		this.averageGrade = 0;
	}

	await this.save();
	return this;
};

FileSchema.methods.addLock = async function (userId) {
	const lock = this.locked.find(l => l.user.equals(userId));
	if (lock) {
		return this;
	}

	const date = Date.now();

	this.locked.push({ user: userId, createdAt: date });

	this.lastupdatedLocked = date;

	if (!this.oldestLocked || this.oldestLocked > date) {
		this.oldestLocked = date;
	}

	await this.save();
	return this;
};

FileSchema.methods.removeLock = async function (userId) {
	const index = this.locked.findIndex(l => l.user.equals(userId));
	if (index === -1) {
		throw new Error('Lock not found for this user');
	}

	this.locked.splice(index, 1);

	if (this.locked.length > 0) {
		this.oldestLocked = this.locked.reduce((oldest, lock) => {
			return lock.createdAt < oldest ? lock.createdAt : oldest;
		}, this.locked[0].createdAt);
	} else {
		this.oldestLocked = null;
	}

	await this.save();
	return this;
};

FileSchema.methods.removeAllLock = async function () {
	this.lastupdatedLocked = null;
	this.oldestLocked = null;
	this.locked = [];
	await this.save();
	return this;
};

FileSchema.methods.addComment = async function (user, comment) {
	this.comments.push({ text: comment, user: user._id });
	this.commentsNbr++;
	this.lastupdatedComment = Date.now();
	await this.save();
	return this;
};

FileSchema.methods.removeComment = async function (commentId) {
	const index = this.comments.findIndex(comment => comment._id.equals(commentId));
	if (index === -1) {
		throw new Error('Comment not found');
	}

	this.comments.splice(index, 1);
	this.commentsNbr--;
	await this.save();
	return this;
};

FileSchema.methods.isDirectory = function () {
	return this.fileType === 'folder';
}

FileSchema.methods.isDownloadFinished = function () {
	return this.isFinished;
}

FileSchema.methods.getPath = function () {
	return this.path;
}

FileSchema.methods.isPathInDirectory = function (targetPath) {
	const relative = path.relative(this.path, targetPath);

	return !relative.startsWith('..') && !path.isAbsolute(relative);
}

FileSchema.methods.addSize = async function (size) {
	this.size += size;

	await this.save();
}

export default mongoose.model('File', FileSchema);
