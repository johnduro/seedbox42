import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

router.post('/', async (req, res, next) => {
	try {
	  const user = await User.findOne({ login: req.body.login }).exec();
	  if (!user) {
		return res.status(403).json({ message: 'Unauthorized' });
	  }
  
	  const isMatch = await bcrypt.compare(req.body.password, user.password);
	  if (!isMatch) {
		return res.status(403).json({ message: 'Unauthorized' });
	  }
  
	  user.password = "";
	  const token = jwt.sign(user.toObject(), req.app.locals.ttConfig.secret, {
		expiresIn: 86400 // 1 day
	  });
  
	  res.status(200).json({
		data: user,
		message: 'Enjoy your token!',
		token: token
	  });
	} catch (err) {
	  next(err);
	}
  });

export default router;
