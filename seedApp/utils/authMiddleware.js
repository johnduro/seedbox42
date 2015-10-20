var jwt = require('jsonwebtoken');


var authMiddleware = function (req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.token;
	if (token)
	{
		console.log("token:  ", token);
		jwt.verify(token, req.app.get('secret'), function (err, decoded) {
			if (err)
				return res.json({ success: false, message: 'Failed to authenticate token.' });
			else
			{
				req.user = decoded;
				next();
			}
		});
	}
	else
		return res.status(403).send({ success: false, message: 'No token provided.' });
};


module.exports = authMiddleware;
