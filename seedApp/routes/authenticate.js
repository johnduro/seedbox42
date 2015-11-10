var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var User = require('../models/User.js');

router.post('/', function(req, res, next) {
	console.log("authenticate::body:: ", req.body);
	User.findOne({ login: req.body.login }, function(err, user) {
		if (err)
			return next(err);
		if (!user)
		{
			res.json({ success: false, message: 'Authentification failed, user not found' });
		}
		else if (user)
		{
			if (user.password != req.body.password) //refaire !
			{
				res.json({ success: false, message: 'Authentification failed, wrong password'});
			}
			else
			{
				user.password = "";
				var token = jwt.sign(user, req.app.locals.ttConfig.secret, {
					expiresInMinutes: 60 //marche ??
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
