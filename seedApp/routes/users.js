var express = require('express');
var router = express.Router();
var btoa = require('btoa');
var multer = require('multer');
var fs = require('fs');
//var mongoose = require('mongoose'); // UTILE ?
var User = require("../models/User.js");
// var validateAvatar = require('../utils/validateAvatar');


/**
 * Uploads
 */
var avatarStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		// cb(null, './files/avatars');
		cb(null, './public/assets/avatar');
	},
	filename: function (req, file, cb) {
		// var filename = file.originalname.replace(/\W+/g, '-').toLowerCase();
		var filename = btoa(file.originalname);
		// cb(null, Date.now() + '_' + filename);
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
router.get('/', function (req, res, next) {
	// check role si besoin
	User.find(function (err, users) {
		if (err) return next(err);
		res.json(users);
	});
});

// router.post('/', avatarUpldHandler.single('avatar'), validateAvatar, function(req, res, next) {
router.post('/', avatarUpldHandler.single('avatar'), function (req, res, next) {
	// if (req.user.role === 0 || req.user.login === req.body.login) //a modifier 111
	if (req.user.role === 0 || req.user._id === req.body._id) //a modifier 111
	{
		// console.log("FILE >> ", req.file);
		if ("file" in req && 'filename' in req.file)
			req.body.avatar = req.file.filename;
		else
			req.body.avatar = req.app.get("config").users["default-avatar"];
		// console.log("AVATAR > ", req.body.avatar);
		User.create(req.body, function (err, post) {
			if (err)
				res.json({ success: false, message: err });
			// return next(err);
			else
				res.json({ success: true, message: 'user successfully created', data: post });
			// User.find(function (err, users) {
			// 	if (err)
			// 		return next(err);
			// 	res.json({ success: true, message: 'user successfully created', data: users});
			// });
			// res.json(post);
		});
	}
	else
		res.json({ success: false, message: "You don't have enought rights for this action"});
});

router.get('/:id', function (req, res, next) {
	User.findById(req.params.id, function (err, post) {
		if (err)
			return next(err);
		res.json(post);
	});
});

router.put('/:id', avatarUpldHandler.single('avatar'), function (req, res, next) {
	// console.log("ID > ", req.params.id);
	// console.log("PUT >> ", req.body);
	// if (req.user.login == req.body.login || req.user.role == 0) //a modifier 111
	console.log("USER ID > ", req.user._id);
	console.log("BODY ID > ", req.params.id);
	if (req.user._id == req.params.id || req.user.role == 0) //a modifier 111
	{
		delete req.body._id;
		// console.log("PUT AVAT > ", req.file);
		if ("file" in req && 'filename' in req.file)
			req.body.avatar = req.file.filename;
		// User.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
		User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }, function (err, post) {
			if (err)
				res.json({ success: false, message: err });
			else
				res.json({ success: true, data: post });
				// res.json(post);
				// return next(err);
		});
	}
	else
		res.json({ success: false, message: "You don't have enought rights for this action"});
});

router.delete('/:id', function (req, res, next) {
	// if (req.user.login == req.body.login || req.user.role == 0) //a modifier 111
	if (req.user._id == req.body._id || req.user.role == 0) //a modifier 111
	{
		//req.body ??? sert a quoi ???
		User.findByIdAndRemove(req.params.id, req.body, function (err, post) {
			if (err)
				return next(err);
			if (post.avatar != req.app.get("config").users["default-avatar"])
			{
				fs.unlink('public/assets/avatar/' + post.avatar, function (err) {
					if (err)
						console.log(err);
				});
			}
			// res.json({ success: true, message: 'user successfully deleted', data: post });
			User.find(function (err, users) {
				if (err)
					return next(err);
				res.json({ success: true, message: 'user successfully deleted', data: users });
			});
			//res.json(post);
		});
	}
	else
		res.json({ success: false, message: "You don't have enought rights for this action"});
});

module.exports = router;
