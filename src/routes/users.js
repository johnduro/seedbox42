import express from "express";
import fs from "fs";
import User from "../models/User.js";
import rights from "../middlewares/rights.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get('/', async (req, res, next) => {
	try {
		const users = await User.find({}, { password: 0 }).exec();
		res.json(users);
	} catch (err) {
		next(err);
	}
});

router.post('/', rights.admin, upload.avatar.single('avatar'), async function (req, res, next) {
	try {
		if ("file" in req && 'filename' in req.file) {
			req.body.avatar = req.file.filename;
		} else {
			req.body.avatar = req.app.locals.ttConfig.users["default-avatar"];
		}

		// Check if the user already exists
		const existingUser = await User.findOne({ login: req.body.login }).exec();
		if (existingUser) {
			return res.status(409).json({ message: 'User with this login already exists' });
		}

		const post = await User.createNew(req.body);
		const rawUser = post.toObject();
		rawUser.password = "";
		res.json({ message: 'User successfully created', data: rawUser });
	} catch (err) {
		if (err.code === 11000) {
			res.status(409).json({ message: 'Duplicate key error: User with this login already exists' });
		} else {
			res.status(500).json({ message: err.message });
		}
	}
});

router.get('/profile', async function (req, res, next) {
	try {
		const post = await User.findById(req.user._id, { password: 0 }).exec();
		res.json({ data: post });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.get('/:id', async function (req, res, next) {
	try {
		const post = await User.findById(req.params.id, { password: 0 }).exec();
		res.json(post);
	} catch (err) {
		next(err);
	}
});

router.put('/:id', rights.adminOrUserParam, upload.avatar.single('avatar'), async (req, res, next) => {
	try {
		var infos = req.body;
		if ("file" in req && 'filename' in req.file) {
			infos.avatar = req.file.filename;
		} else {
			delete infos.avatar;
		}

		if ('_id' in infos) {
			delete req.body._id;
		}

		const connectedUser = req.user;
		if (connectedUser.role === 'user' || connectedUser._id === req.params.id) {
			delete infos.role;
		}

		const updatedUser = await User.updateUserById(req.params.id, infos);
		const rawUser = updatedUser.toObject();
		rawUser.password = "";
		res.json({ data: rawUser });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.delete('/:id', rights.adminOrUserParam, async (req, res, next) => {
	try {
		const post = await User.findByIdAndDelete(req.params.id).exec();
		if (post.avatar != req.app.locals.ttConfig.users["default-avatar"]) {
			fs.unlink('public/assets/avatar/' + post.avatar, function (err) {
				if (err) {
					return next(err);
				}
			});
		}

		res.json({ message: 'User successfully deleted' });
	} catch (err) {
		next(err);
	}
});

export default router;