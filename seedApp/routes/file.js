var express = require('express');
var router = express.Router();
// var io = require('socket.io');
var File = require("../models/File.js");
var fs = require('fs');
var mime = require('mime');
var mongoose = require('mongoose');

// *****************************************
// FILES
// *****************************************

router.get('/all', function (req, res, next) {
	// var query = File.find({ isFinished: true }).select({ 'name': 1, 'size': 1, 'downloads': 1, 'createdAt': 1, 'fileType': 1 });
	var query = File.find({ isFinished: true });
	query.exec(function (err, files) {
		if (err)
			return next(err);
		res.json({ success: true, data: files });
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


var getDirectoryInfos = function (path, dirInfos, done) {
	var result = [];
	var size = 0;
	fs.readdir(path, function (err, files) {
		if (err)
			return done(err);
		var i = 0;
		(function next () {
			var file = files[i++];
			if (!file)
			{
				dirInfos.fileList = result;
				dirInfos.size = size;
				return done(null, dirInfos);
			}
			var fileInfos = { name: file, path: path + '/' + file };
			fs.stat(fileInfos.path, function (err, stat) {
				if (stat && stat.isDirectory())
				{
					fileInfos.isDirectory = true;
					fileInfos.fileType = "folder";
					getDirectoryInfos(fileInfos.path, fileInfos, function (err, res) {
						result.push(res);
						size += res.size;
						next();
					});
				}
				else
				{
					fileInfos.isDirectory = false;
					fileInfos.fileType = mime.lookup(fileInfos.path);
					fileInfos.size = stat.size;
					size += stat.size;
					result.push(fileInfos);
					next();
				}
			});
		})();
	});
};

router.get('/show/:id', function (req, res, next) {
	File.findById(req.params.id, function (err, file) {
		if (err)
			return next(err);
		var fileInfos = { name: file.name, path: file.path, size: file.size };
		if (file.fileType === 'folder')
		{
			fileInfos.isDirectory = true;
			fileInfos.fileType = "folder";
			getDirectoryInfos(file.path, fileInfos, function (err, data) {
				if (err)
					res.json({ success: false, error: err });
				else
					res.json({ success: true, data: data });
			});
		}
		else
		{
			fileInfos.isDirectory = false;
			fileInfos.fileType = mime.lookup(fileInfos.path);
			res.json({ success: true, data: fileInfos });
		}
	});
});

router.post('/download/:id', function (req, res, next) {
	File.findById(req.params.id, function (err, file) {
		if (err)
			return next(err);
		var filePath = file.path + req.body.path;
		console.log("body > ", req.body);
		console.log("1 > ", filePath);
		console.log("2 > ", typeof filePath);
		// return next();
		var fileName = req.body.fileName;
		var mimeType = mime.lookup(filePath);
		res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
		res.setHeader('Content-type', mimeType);
		var fileStream = fs.createReadStream(filePath);
		fileStream.pipe(res);
	});
});

module.exports = router;
