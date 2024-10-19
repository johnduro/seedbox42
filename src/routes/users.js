import express from "express";
var router = express.Router();
import btoa from "btoa";
import multer from "multer";
import fs from "fs";
import User from "../models/User.js";
import rights from "../middlewares/rights.js";
import upload from "../middlewares/upload.js";


router.get('/', function (req, res, next) {
	// check role si besoin
	User.find({}, { password: 0 }, function (err, users) {
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
	User.createNew(req.body, function (err, post) {
		if (err)
			res.json({ success: false, message: err });
		else
		{
			var rawUser = post.toObject();
			rawUser.password = "";
			res.json({ success: true, message: 'user successfully created', data: rawUser });
		}
	});
});

router.get('/profile', function (req, res, next) {
	User.findById(req.user._id, { password: 0 }, function (err, post) {
		if (err)
			res.json({ success: false, message: err });
		else
			res.json({ success: true, data: post });
	});
});

router.get('/:id', function (req, res, next) {
	User.findById(req.params.id, { password: 0 }, function (err, post) {
		if (err)
			return next(err);
		res.json(post);
	});
});

router.put('/:id', rights.adminOrUserParam, upload.avatar.single('avatar'), function (req, res, next) {
	var infos = req.body;
	if ("file" in req && 'filename' in req.file)
		infos.avatar = req.file.filename;
	else
		delete infos.avatar;
	if ('_id' in infos)
		delete req.body._id;
	User.updateUserById(req.params.id, infos, function (err, post) {
		if (err)
			res.json({ success: false, message: err });
		else
		{
			var newUser = post.toObject();
			delete newUser.password;
			res.json({ success: true, data: newUser });
		}
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
		User.find({}, { password : 0 }, function (err, users) {
			if (err)
				return next(err);
			res.json({ success: true, message: 'user successfully deleted', data: users });
		});
	});
});

export default router;