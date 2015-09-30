var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();

var User = require('../models/User.js');

router.post('/', function(req, res, next) {
	console.log(req.body);
	User.findOne({
		login: req.body.login
	}, function(err, user) {

		if (err) return next(err);

		if (!user)
		{
			res.json({ success: false, message: 'Authentification failed, user not found' });
		}
		else if (user)
		{
			if (user.password != req.body.password)
			{
				res.json({ success: false, message: 'Authentification failed, wrong password'});
			}
			else
			{
				user.password = "";
				var token = jwt.sign(user, req.app.get('secret'), {
					expiresInMinutes: 60
				});
				res.json({
					success: true,
					data: user,
					message: 'enjoy your token !',
					token: token
				});
			}
		}
	});
});

module.exports = router;
