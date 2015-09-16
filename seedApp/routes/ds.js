var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = require("../models/User.js");

router.get('/admin-setup', function(req, res, next) {
	var adm = new User({
		login: 'admin',
		password: 'passwd',
		mail: 'yolo@duro.lif',
		role: 0
	});
	adm.save(function(err) {
		// if (err) throw err;
		console.log('user admin saved successfully');
		res.json({ success: true });
	});
});

router.get('/users-setup', function(req, res, next) {
	var fakeUsers =
			[{ login: 'lambda1', password: 'passwd1', mail: 'a@b.com' },
			 { login: 'lambda2', password: 'passwd2', mail: 'a@g.com' },
			 { login: 'lambda3', password: 'passwd3', mail: 't@b.com' }];
	User.create(fakeUsers, function(err, post) {
		if (err) return next(err);
		res.json(post);
	});
});

router.get('/drop-database', function(req, res, next) {
	console.log('dropping database');
	req.app.get('connexionDB').connection.db.dropDatabase();
	res.json({ success: true });
});

module.exports = router;
