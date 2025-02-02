import authentication from '../utils/authentication.js';

const getTokenFromRequest = (req) => {
	const authHeader = req.headers['authorization'];
	if (authHeader && authHeader.startsWith('Bearer ')) {
		return authHeader.split(' ')[1];
	}

	return null;
};

var auth = async (req, res, next) => {
	try {
		const token = getTokenFromRequest(req);
		if (!token) {
			return res.status(403).json({ message: 'Unauthorized: No token' });
		}

		const user = await authentication.getUserFromToken(token, req.app.locals.ttConfig.secret);

		req.user = user.toObject();
		next();
	} catch (err) {
		if (err.name === 'TokenExpiredError') {
			return res.status(401).json({ message: 'Unauthorized: Token has expired', expiredAt: err.expiredAt });
		}
		return res.status(403).json({ message: 'Unauthorized: Invalid token', error: err.message });
	}
};


export default auth;
