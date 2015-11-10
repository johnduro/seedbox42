var express = require('express');
var router = express.Router();
var btoa = require('btoa');
var multer = require('multer');
var fs = require('fs');
var User = require("../models/User.js");
var rights = require('../middlewares/rights');
var upload = require('../middlewares/upload');


/* GET users listing. */
router.get('/', function (req, res, next) {
	// check role si besoin
	User.find(function (err, users) {
		if (err)
			return next(err);
		res.json(users);
	});
});

router.post('/', rights.admin, upload.avatar.single('avatar'), function (req, res, next) {
	if ("file" in req && 'filename' in req.file)
		req.body.avatar = req.file.filename;
	else
		req.body.avatar = req.app.locals.ttConfig.users["default-avatar"];
	User.create(req.body, function (err, post) {
		if (err)
			res.json({ success: false, message: err });
		else
			res.json({ success: true, message: 'user successfully created', data: post });
	});
});

router.get('/profile', function (req, res, next) {
	User.findById(req.user._id, function (err, post) {
		if (err)
			res.json({ success: false, message: err });
		else
			res.json({ success: true, data: post });
	});
});

router.get('/:id', function (req, res, next) {
	User.findById(req.params.id, function (err, post) {
		if (err)
			return next(err);
		res.json(post);
	});
});

router.put('/:id', rights.adminOrUserParam, upload.avatar.single('avatar'), function (req, res, next) {
	if ("file" in req && 'filename' in req.file)
		req.body.avatar = req.file.filename;
	User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }, function (err, post) {
		if (err)
			res.json({ success: false, message: err });
		else
			res.json({ success: true, data: post });
	});
});

router.delete('/:id', rights.adminOrUserParam, function (req, res, next) {
	User.findByIdAndRemove(req.params.id, req.body, function (err, post) {
		if (err)
			return next(err);
		if (post.avatar != req.app.locals.ttConfig.users["default-avatar"])
		{
			fs.unlink('public/assets/avatar/' + post.avatar, function (err) {
				if (err)
					console.log(err);
			});
		}
		User.find(function (err, users) {
			if (err)
				return next(err);
			res.json({ success: true, message: 'user successfully deleted', data: users });
		});
	});
});

module.exports = router;
