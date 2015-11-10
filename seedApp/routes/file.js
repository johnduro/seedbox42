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
			res.json({ success: true, data: file });

	});
});


router.post('/add-grade/:id', function (req, res, next) {
	File.findById(req.params.id, function (err, file) {
		if (err)
			return next(err);
		file.addGrade(req.user, req.body.grade, function (err) {
			if (err)
				return next(err);
			res.json({ success: true, message: 'grade added' });
		});
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
			return next(err);
		file.removeLock(req.user, function (err) {
			if (err)
				return next(err);
			res.json({ success: true, message: 'file successfully unlocked' });
		});
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
	File.findById(req.params.id, function (err, file) {
		if (err)
			return next(err);
		file.addComment(req.user, req.body.text, function (err) {
			if (err)
				return next(err);
			res.json({ success: true, message: 'comment successfully added' });
		});
	});
});

router.delete('/remove-comment/:id', function (req, res, next) {
	File.findById(req.params.id, function (err, file) {
		if (err)
			return next(err);
		file.removeComment(req.body.commentId, function (err) {
			if (err)
				return next(err);
			res.json({ success: true, message: 'comment successfully removed' });
		});
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
	var query = File.findById(req.params.id);// faire une methode pour recuperer ces infos !
	query.select('-hashString -isFinished -privacy -torrentAddedAt');
	query.exec(function (err, file) {
		if (err)
			return next(err);
		fileInfos.getFileInfosRecurs(file.path, file.name, function (err, data) {
			var rawFile = file.toObject();
			rawFile.commentsNbr = file.countComments();
			rawFile.isLocked = file.getIsLocked();
			rawFile.isLockedByUser = file.getIsLockedByUser(req.user);
			rawFile.averageGrade = file.getAverageGrade();
			delete rawFile.path;
			if (err)
				res.json({ success: false, error: err, file: rawFile });
			else
				res.json({ success: true, data: data, file: rawFile });
		});
	});
});


router.get('/download/:id/:path/:name', function (req, res, next) {
	var query = File.findById(req.params.id);
	query.select('path downloads');
	query.exec(function (err, file) {
		if (err)
			return next(err);
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
				res.setHeader('Accept-Ranges', "bytes");
				var fileStream = fs.createReadStream(filePath);
				fileStream.pipe(res);
			}
		});
		file.incDownloads();
	});
});

module.exports = router;
