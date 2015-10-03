var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = require("../models/User.js");


router.get('/users-reset', function (req, res, next) {
	var usersBase =
			[{ login: 'admin', password: 'admin', mail: 'yolo@duro.lif', role: 0},
			 { login: 'lambda1', password: 'lambda1', mail: 'a@b.com', role: 1 },
			 { login: 'lambda2', password: 'lambda2', mail: 'a@g.com', role: 1 },
			 { login: 'lambda3', password: 'lambda3', mail: 't@b.com', role: 1 }];
	console.log('dropping users database');
	req.app.get('connexionDB').connection.db.collection('users', function (err, collection) {
		if (err)
			res.json({ success: false, message: 'err1' });
		collection.remove({}, function (err, removed) {
			if (err)
				res.json({ success: false, message: 'err2' });
		});
	});
	console.log('setting fresh user base');
	User.create(usersBase, function (err, post) {
		if (err)
			return next(err);
		res.json({ success: true });
	});
	// req.app.get('connexionDB').connection.db.users.drop();
});

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
