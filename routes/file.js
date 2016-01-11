var express = require('express');
var atob = require('atob');
var router = express.Router();
var File = require("../models/File.js");
var User = require("../models/User.js");
var fs = require('fs');
var mime = require('mime');
var mongoose = require('mongoose');
var fileInfos = require('../utils/filesInfos');
var zipstream = require('../utils/zipstream/zipstream');
var upload = require("../middlewares/upload");
var ft = require('../utils/ft');

/**
 * Files
 */

router.get('/all', function (req, res, next) {
	File.getFileList({}, {}, 0, req.user, function (err, files) {
		if (err)
			res.json({ success: false, message: err });
		else
			res.json({ success: true, data: files });
	});
});

router.get('/:id', function (req, res, next) {
	File.getFileById(req.params.id, function (err, file) {
		if (err)
			res.json({ success: false, message: err });
		else
		{
			var fileRaw = file.toObject();
			delete fileRaw.path;
			res.json({ success: true, data: fileRaw });
		}
	});
});


router.post('/add-grade/:id', function (req, res, next) {
	File.findById(req.params.id, function (err, file) {
		if (err)
			// return next(err);
			res.json({ success: false, message: err });
		else
		{
			file.addGrade(req.user, req.body.grade, function (err) {
				if (err)
					// return next(err);
					res.json({ success: false, message: err });
				else
					res.json({ success: true, message: 'grade added' });
			});
		}
	});
});

router.delete('/remove-grade/:id', function (req, res, next) {
	File.findById(req.params.id, function (err, file) {
		if (err)
			return next(err);
		file.removeGrade(req.user, function (err) {
			if (err)
				return next(err);
			res.json({ success: true, message: 'grade successfully removed' });
		});
	});
});

// router.put('/mod-grade/:id');

router.post('/add-lock/:id', function (req, res, next) {
	File.findById(req.params.id, function (err, file) {
		if (err)
			return next(err);
		file.addLock(req.user, function (err) {
			if (err)
				return next(err);
			res.json({ success: true, message: 'file successfuly locked' });
		});
	});
});

router.delete('/remove-lock/:id', function (req, res, next) {
	File.findById(req.params.id, function (err, file) {
		if (err)
			res.json({ success: false, message: err });
		else if (file != null)
		{
			file.removeLock(req.user, function (err) {
				if (err)
					res.json({ success: false, message: err });
				else
					res.json({ success: true, message: 'file successfully unlocked' });
			});
		}
		else
			res.json({ success: false, message: 'Could not find the file asked for' });
	});
});

router.get("/comments/:id", function (req, res, next) {
	File.getCommentsById(req.params.id, function (err, comments) {
		if (err)
			res.json({ success: false, message: err });
		else
			res.json({ success: true, data: comments });
	});
});

router.post('/add-comment/:id', function (req, res, next) {
	if (req.body.text != null && req.body.text != '')
	{
		File.findById(req.params.id, function (err, file) {
			if (err)
				return next(err);
			file.addComment(req.user, req.body.text, function (err) {
				if (err)
					return next(err);
				res.json({ success: true, message: 'comment successfully added' });
			});
		});
	}
	else
		res.json({ success: false, message: 'could not add empty comment' });
});

router.delete('/remove-comment/:id', function (req, res, next) {
	File.findById(req.params.id, function (err, file) {
		if (err)
			res.json({ success: false, message: err });
		else if (file == null)
			res.json({ success: false, message: "file not found" });
		else
		{
			file.removeComment(req.body.commentId, function (err) {
				if (err)
					return next(err);
				res.json({ success: true, message: 'comment successfully removed' });
			});
		}
		// if (err)
		// 	return next(err);
	});
});


// db.files.aggregate([ {"$match": {"comments.user":  ObjectId("561286ad881dd9a9727b2313")} }, {"$unwind": "$comments"}, {"$match": {"comments.user":  ObjectId("561286ad881dd9a9727b2313")}}, {"$group": {"_id": "$_id", "comments": {"$push": "$comments"}}} ])

router.get('/user-comment/:id', function (req, res, next) {
	var id = mongoose.mongo.ObjectID(req.params.id);
	File.aggregate(
		[
			{ "$match": { "comments.user": id } },
		 	{ "$unwind": "$comments" },
			{ "$match": { "comments.user": id } },
			// { "$project": { "fileName": "$name" } },
			{ "$group": { "_id": "$_id", "comments": { "$push": "$comments" } } }
			// { "$group": { "_id": "$_id", "name": "$name", "comments": { "$push": "$comments" } } }
		],
		function (err, resp) {
			if (err)
			{
				console.log("EROR ",err);
				next(err);
			}
			res.json({ success: true, data: resp});
	});
});

router.get('/user-locked/:id' ,function (req, res, next) {
	var id = mongoose.mongo.ObjectID(req.params.id);
	File.aggregate(
		[
			{ "$match": { "locked.user": id } },
		 	{ "$unwind": "$locked" },
			{ "$match": { "locked.user": id } },
			{ "$group": { "_id": "$_id" } }
		],
		function (err, resp) {
			if (err)
			{
				console.log("EROR ",err);
				next(err);
			}
			res.json({ success: true, data: resp});
	});
});

// method put , attention au path !
router.put('/:id', function (req, res, next) {
	console.log(req.body);
	//rajouter un check de config pour voir si tout le monde peut delete ???
	if (req.user.role === 0 || (req.body.privacy === 0 && req.user._id === req.body.creator))
	{
		if ('path' in req.body)
			delete req.body.path;
		if ('size' in req.body)
			delete req.body.size;
		if ('hashString' in req.body)
			delete req.body.hashString;
		if ('createdAt' in req.body)
			delete req.body.createdAt;
		if ('torrentAddedAt' in req.body)
			delete req.body.torrentAddedAt;
		delete req.body._id;
		// File.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, file) {
		File.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }, function (err, file) {
			if (err)
				res.json({ success: false, message: err });
			else
				res.json({ success: true, data: file });
				// return next(err);
			// res.json(file);
		});
	}
	else
		res.json({ success: false, message: "You don't have enought rights for this action" });
});


router.delete('/:id', function (req, res, next) {
	//rajouter un check de config pour voir si tout le monde peut delete ???
	File.findById(req.params.id, function (err, file) {
		if (err)
			return next(err);
		if (req.user.role === 0 || (file.privacy === 0 && req.user._id === file.creator))
		{
			File.findById(file._id, function (err, file) {
				if (err)
					return next(err);
				file.deleteFile(req.app.locals.transmission, function (err, message) {
					if (err)
						res.json({ success: false, err: err, message: message });
					else
						res.json({ success: true, message: message });
				});
			});
		}
		else
			res.json({ success: false, message: "You don't have enought rights for this action" });
	});
});

router.get('/show/:id', function (req, res, next) {
	File.getFileById(req.params.id, function (err, file) {
		if (err)
			res.json({ success: false, error: err, message: 'Could not get infos from database' });
		else
		{
			fileInfos.getFileInfosRecurs(file.path, file.name, function (err, data) {
				if (err)
					res.json({ success: false, error: err, file: rawFile });
				else
				{
					var rawFile = file.toObject();
					rawFile.isLocked = file.getIsLocked();
					rawFile.isLockedByUser = file.getIsLockedByUser(req.user);
					rawFile.rateByUser = file.getUserGrade(req.user);
					delete rawFile.path;
					res.json({ success: true, data: data, file: rawFile });
				}
			});
		}
	});
});

router.post('/upload/:id/:path', upload.file.array('files', 10), function (req, res, next) {
	var fileList = [];
	var size = 0;
	var i = 0;
	File.findById(req.params.id, function (err, dbFile) {
		if (err)
			return res.json({ success: false, err: err });
		else if (dbFile == null)
			return res.json({ success: false, err: 'Could not find the file' });
		(function next () {
			var file = req.files[i++];
			if (!file)
			{
				dbFile.addSize(size);
				return res.json({ success: true, data: fileList, size: dbFile.size });
			}
			fileList.push({
				fileList: [],
				fileType: file.mimetype,
				isDirectory: false,
				name: file.filename,
				path: file.path,
				size: file.size
			});
			size += file.size;
			next();
		})();
	});
});

router.get('/download/:id/:path/:name', function (req, res, next) {
	var query = File.findById(req.params.id);
	query.select('path downloads');
	query.exec(function (err, file) {
		if (err)
			return next(err);
		else if (file == null)
			return next('Could not find file');
		var pathDecode = atob(req.params.path);
		var fileName = atob(req.params.name);
		var filePath = file.path + pathDecode;
		if (filePath.slice(-1) === '/')
			filePath = filePath.slice(0, -1);
		fileInfos.isDirectory(filePath, function (err, isDirectory, fileSize) {
			if (err)
				return next(err);
			if (isDirectory)
			{
				res.setHeader('Content-disposition', 'attachment; filename=' + fileName + '.zip');
				res.setHeader('Content-type', 'application/zip');
				fileInfos.getFileInfosRecurs(filePath, fileName, function (err, data) {
					if (err)
						return next(err);
					res.setHeader('Content-Length', data.size);
					fileInfos.getFilesStreams(data, '', function (err, streams) {
						var zip = new zipstream();
						zip.pipe(res);
						var i = 0;
						streams.forEach(function (s) {
							zip.addFile(s.stream, { name : s.name }, function () {
							});
						});
						zip.finalize(function (size) {
						});
					});
				});
			}
			else
			{
				var mimeType = mime.lookup(filePath);
				res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
				res.setHeader('Content-type', mimeType);
				res.setHeader('Content-Length', fileSize);
				//res.setHeader('Accept-Ranges', "bytes");
				var fileStream = fs.createReadStream(filePath);
				fileStream.pipe(res);
			}
		});
		file.incDownloads();
	});
});

module.exports = router;
