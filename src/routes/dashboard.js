
import fs from "fs";
import fsPromise from "fs/promises"
import express from "express";
import File from "../models/File.js";
import { getDiskUsage } from "../utils/diskSpaceNode.js";

const router = express.Router();

var getTotalDiskSpace = async function(downloadDir) {
	const data = await getDiskUsage(downloadDir);

	return { used: data.used, freePer: data.freePer, usedPer: data.usedPer, total: data.total};
}

router.get('/recent-file', async (req, res) => {
	try {
		const dashConf = req.app.locals.ttConfig.dashboard;
		const user = req.user;
		const limit = (req.params.all ? 0 : dashConf['file-number-exhibit']);
		const files = await File.getFinishedFileList({}, { createdAt: -1 }, limit, user);

		res.json({ data: files });
	} catch (err) {
		console.error('Error getting recent files:', err);
		res.status(500).json({ message: 'Error getting recent files', error: err.message });
	}
});

router.get('/recent-user-file', async (req, res) => {
	try {
		const dashConf = req.app.locals.ttConfig.dashboard;
		const user = req.user;
		const limit = (req.params.all ? 0 : dashConf['file-number-exhibit']);
		const files = await File.getFinishedFileList({ creator: user._id }, { createdAt: -1 }, limit, user);

		res.json({ data: files });
	} catch (err) {
		console.error('Error getting recent files:', err);
		res.status(500).json({ message: 'Error getting recent files', error: err.message });
	}
});

router.get('/oldest-user-locked-file', async (req, res) => {
	try {
		const dashConf = req.app.locals.ttConfig.dashboard;
		const user = req.user;
		const limit = (req.params.all ? 0 : dashConf['file-number-exhibit']);
		const files = await File.getFinishedFileList({ "locked.user": user._id }, { "locked.createdAt": 1 }, limit, user);

		res.json({ data: files });
	} catch (err) {
		console.error('Error getting recent files:', err);
		res.status(500).json({ message: 'Error getting recent files', error: err.message });
	}
});

router.get('/oldest-locked-file', async (req, res) => {
	try {
		const dashConf = req.app.locals.ttConfig.dashboard;
		const user = req.user;
		const limit = (req.params.all ? 0 : dashConf['file-number-exhibit']);
		const files = await File.getFinishedFileList({ 'locked': { $exists: true, $not: { $size: 0 } } }, { "locked.createdAt": 1 }, limit, user);

		res.json({ data: files });
	} catch (err) {
		console.error('Error getting recent files:', err);
		res.status(500).json({ message: 'Error getting recent files', error: err.message });
	}
});

router.get('/best-rated-file', async (req, res) => {
	try {
		const dashConf = req.app.locals.ttConfig.dashboard;
		const user = req.user;
		const limit = (req.params.all ? 0 : dashConf['file-number-exhibit']);
		const files = await File.getFinishedFileList({}, { averageGrade: -1 }, limit, user);

		res.json({ data: files });
	} catch (err) {
		console.error('Error getting recent files:', err);
		res.status(500).json({ message: 'Error getting recent files', error: err.message });
	}
});

router.get('/most-commented-file', async (req, res) => {
	try {
		const dashConf = req.app.locals.ttConfig.dashboard;
		const user = req.user;
		const limit = (req.params.all ? 0 : dashConf['file-number-exhibit']);
		const files = await File.getFinishedFileList({}, { commentsNbr: -1 }, limit, user);

		res.json({ data: files });
	} catch (err) {
		console.error('Error getting recent files:', err);
		res.status(500).json({ message: 'Error getting recent files', error: err.message });
	}
});

router.get('/most-downloaded-file', async (req, res) => {
	try {
		const dashConf = req.app.locals.ttConfig.dashboard;
		const user = req.user;
		const limit = (req.params.all ? 0 : dashConf['file-number-exhibit']);
		const files = await File.getFinishedFileList({}, { downloads: -1 }, limit, user);

		res.json({ data: files });
	} catch (err) {
		console.error('Error getting recent files:', err);
		res.status(500).json({ message: 'Error getting recent files', error: err.message });
	}
});

router.get('/disk-space', async (req, res) => {
	try {
		const downloadDir = "/downloads";
		await fsPromise.access(downloadDir, fs.constants.R_OK);
		let data = await getTotalDiskSpace(downloadDir);

		res.json({ data: data });
	} catch (err) {
		console.error('Error getting recent files:', err);
		res.status(500).json({ message: 'Error getting recent files', error: err.message });
	}
});

export default router;