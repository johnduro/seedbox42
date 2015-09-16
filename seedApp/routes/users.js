var express = require('express');
var router = express.Router();

//var mongoose = require('mongoose'); // UTILE ?
var User = require("../models/User.js");

/* GET users listing. */
router.get('/', function(req, res, next) {
	// check role si besoin
	User.find(function (err, users) {
		if (err) return next(err);
		res.json(users);
	});
});

router.post('/', function(req, res, next) {
	if (req.user.role == 0) {
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
