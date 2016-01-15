var jwt = require('jsonwebtoken');
var User = require("../models/User.js");


/**
 * Authentification middleware
 * Check token validity and if user decoded from it exist
 */
var auth = function (req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.token;
	if (token)
	{
		jwt.verify(token, req.app.locals.ttConfig.secret, function (err, decoded) {
			if (err)
				return res.status(403).json({ success: false, message: 'Failed to authenticate token.', err: err });
			else
			{
				User.findById(decoded._id, function (err, user) {
					if (err || user == null)
						return res.status(403).json({ success: false, message: 'Failed to authenticate token.', err: err });
					req.user = user.toObject();
					next();
				});
			}
		});
	}
	else
		return res.status(403).send({ success: false, message: 'No token provided.' });
};


module.exports = auth;
