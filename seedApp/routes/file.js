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

//method put , attention au path !

router.delete('/:id', function (req, res, next) {
	File.findById(req.params.id, function (err, file) {
		if (err)
			return next(err);
		//rajouter un check de config pour voir si tout le monde peut delete ???
		if (req.user.role === 0 || (file.privacy === 0 && req.user._id === file.creator))
		{
			File.findByIdAndRemove(file._id, function (err, deletedFile) {
				if (err)
					return next(err);
				//TRANSMISSION
				req.app.get('transmission').torrentRemove(deletedFile.hashString, function (err, resp) {
					if (err)
						console.log(err);
				});
				//delete le fichier sur le serveur
				//attention aux droits !
				fs.unlink(file.path, function (err) {
					if (err)
						throw err;
				});
			});
		}
	});
});



module.exports = router;
