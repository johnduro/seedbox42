var express = require('express');
var router = express.Router();

var multer = require('multer');
//var mongoose = require('mongoose'); // UTILE ?
var User = require("../models/User.js");
// var validateAvatar = require('../utils/validateAvatar');


// ====================================
// UPLOADS
// ====================================
var avatarStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './files/avatars');
	},
	filename: function (req, file, cb) {
		var filename = file.originalname.replace(/\W+/g, '-').toLowerCase();
		cb(null, Date.now() + '_' + filename);
	}
});
var avatarUpldHandler = multer({
	storage: avatarStorage,
	limits: {
		files: 1,
		fileSize: 1 * 1000 * 1000 //1 MB
	}});
// ************************************

/* GET users listing. */
router.get('/', function(req, res, next) {
	// check role si besoin
	User.find(function (err, users) {
		if (err) return next(err);
		res.json(users);
	});
});

// router.post('/', avatarUpldHandler.single('avatar'), validateAvatar, function(req, res, next) {
router.post('/', avatarUpldHandler.single('avatar'), function(req, res, next) {
	if (req.user.role == 0 || req.user.login == req.body.login) {
		req.body.avatar = req.file.path;
		User.create(req.body, function(err, post) {
			if (err) return next(err);
			res.json({ success: true, message: 'user successfully created'});
			// res.json(post);
		});
	} else {
		res.json({ success: false, message: "You don't have enought rights for this action"});
	}
});

router.get('/:id', function(req, res, next) {
	User.findById(req.params.id, function (err, post) {
		if (err) return next(err);
		res.json(post);
	});
});

router.put('/:id', function(req, res, next) {
	if (req.user.login == req.body.login || req.user.role == 0) {
		User.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
			if (err) return next(err);
			res.json(post);
		});
	} else {
		res.json({ success: false, message: "You don't have enought rights for this action"});
	}
});

router.delete('/:id', function(req, res, next) {
	if (req.user.login == req.body.login || req.user.role == 0) {
		User.findByIdAndRemove(req.params.id, req.body, function (err, post) {
			if (err) return next(err);
			res.json(post);
		});
	} else {
		res.json({ success: false, message: "You don't have enought rights for this action"});
	}
});

module.exports = router;
