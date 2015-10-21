var express = require('express');
var router = express.Router();
// var io = require('socket.io');
var File = require("../models/File.js");
var fs = require('fs');
var mime = require('mime');
var mongoose = require('mongoose');
var fileInfos = require('../utils/filesInfos');

// *****************************************
// FILES
// *****************************************

router.get('/all', function (req, res, next) {
	var data = [];
	var query = File.find({ isFinished: true });
	query.select('-path -creator -hashString -isFinished -privacy -torrentAddedAt');
	query.exec(function (err, files) {
		if (err)
			return next(err);
		files.forEach(function (file) {
			var infos = file.toObject();
			infos.commentsNbr = file.countComments();
			infos.isLocked = file.getIsLocked();
			infos.averageGrade = file.getAverageGrade();
			delete infos.comments;
			delete infos.locked;
			delete infos.grades;
			data.push(infos);
		});
		res.json({ success: true, data: data });
	});
});

router.get('/:id', function (req, res, next) {
	File.find({ _id: req.params.id, isFinished: true }, function (err, file) {
		if (err)
			return next(err);
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
		File.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, file) {
			if (err)
				return next(err);
			res.json(file);
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
			File.findByIdAndRemove(file._id, function (err, deletedFile) {
				if (err)
					return next(err);
				//TRANSMISSION
				req.app.get('transmission').torrentRemove(deletedFile.hashString, function (err, resp) {
					if (err)
					{
						console.log(err);
						res.json({ success: false, message: err });
					}
					else
						res.json({ success: true, message: 'File successfuly removed' });;
				});
				//delete le fichier sur le serveur
				//attention aux droits !
				fs.unlink(file.path, function (err) {
					if (err)
					{
						console.log(err);
						res.json({ success: false, message: err });
					}
					else
						res.json({ success: true, message: 'File successfuly removed' });;
				});
			});
		}
		else
			res.json({ success: false, message: "You don't have enought rights for this action" });
	});
});

router.get('/show/:id', function (req, res, next) {
	var query = File.findById(req.params.id);
	query.select('-hashString -isFinished -privacy -torrentAddedAt');
	query.exec(function (err, file) {
		if (err)
			return next(err);
		fileInfos.getFileInfosRecurs(file.path, file.name, function (err, data) {
			var rawFile = file.toObject();
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
	query.select('path');
	query.exec(function (err, file) {
		if (err)
			return next(err);
		var filePath = file.path + (req.params.path).replace("+-2F-+", "/");
		var fileName = req.params.name;
		var mimeType = mime.lookup(filePath);
		res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
		res.setHeader('Content-type', mimeType);
		var fileStream = fs.createReadStream(filePath);
		fileStream.pipe(res);
	});
});

module.exports = router;
