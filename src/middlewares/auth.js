import jwt from 'jsonwebtoken';
import User from "../models/User.js";


/**
 * Authentification middleware
 * Check token validity and if user decoded from it exist
 */
const verifyToken = (token, secret) => {
	return new Promise((resolve, reject) => {
		jwt.verify(token, secret, (err, decoded) => {
			if (err) {
				return reject(err);
			}
			resolve(decoded);
		});
	});
};

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

		const decoded = await verifyToken(token, req.app.locals.ttConfig.secret);
		if (!decoded) {
			return res.status(403).json({ message: 'Unauthorized' });
		}

		const user = await User.findById(decoded._id).exec();
		if (!user) {
			return res.status(403).json({ message: 'Unauthorized' });
		}

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
