var express = require('express');
var router = express.Router();
// var io = require('socket.io');
var File = require("../models/File.js");
var fs = require('fs');


router.get('/:id?', function (req, res, next) {
	if (!(req.params.id))
	{
		File.find({}, function (err, files) {
			if (err)
				return next(err);
			res.json({ success: true, data: files });
		});
	}
	else
	{
		File.findById(req.params.id, function (err, file) {
			if (err)
				return next(err);
			res.json({ success: true, data: file });
		});
	}
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
		// File.findById(req.params.id, function (err, file) {
		// 	if (err)
		// 		return next(err);
		// 	console.log(file);
		// });
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



var walk = function(dir, done) {
	var results = [];
	fs.readdir(dir, function(err, list) {
		if (err)
			return done(err);
		var i = 0;
		(function next() {
			var file = list[i++];
			if (!file)
				return done(null, results);
			file = dir + '/' + file;
			fs.stat(file, function(err, stat) {
				if (stat && stat.isDirectory()) {
					walk(file, function(err, res) {
						results = results.concat(res);
						next();
					});
				} else {
					results.push(file);
					next();
				}
			});
		})();
	});
};

var getDirectoryInfos = function (path, dirStat, done) {
	var result = [];
	fs.readdir(path, function (err, files) {
		files.forEach(function (file) {
			var filePath = path + '/' + file;
			fs.stat(filePath, function (err, stat) {
				if (stat && stat.isDirectory())
					getDirectoryInfos(filePath, {});
			});
		});
	});
};

router.get('/show/:id', function (req, res, next) {
	File.findById(req.params.id, function (err, file) {
		if (err)
			return next(err);
		var fileStat = { name: file.name, path: file.path };
		fs.stat(file.path, function (err, stat) {
			if (stat.isDirectory())
			{
				fileStat.isDirectory = true;
				getDirectoryInfos(file.path, fileStat, function (err, data) {
					if (err)
						res.json({ success: false, error: err});
					else
						res.json({ success: true, data: data });
				});
			}
			else
			{
				// res.json({ name: file.name, path: file.path, size: file.size, isDirectory: false });
				fileStat.isDirectory = false;
				fileStat.size = file.size;
				res.json(fileStat);
			}
		});




		console.log('SIZE : ', file.size);
		fs.stat(file.path, function (err, stat) {
			console.log('---- stat ----');
			if (err)
				console.log('ERROR STAT', err);
			if (stat.isDirectory())
				console.log('yep directory !!!!!');
			console.log(stat);
			console.log('*****************************************');
		});
		fs.readdir(file.path, function (err, files) {
			if (err)
				console.log('ERROR RDIR', err);
			else
				console.log(files);
		});
	});
});

module.exports = router;
