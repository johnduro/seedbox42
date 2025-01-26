import express from "express";
import atob from "atob";
import File from "../models/File.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import fileUpload from "express-fileupload";
import fileInfos from "../utils/filesInfos.js";
import rights from "../middlewares/rights.js";

const router = express.Router();

router.use(fileUpload({
	limits: { fileSize: 10 * 1024 * 1024 },
}));

/**
 * Files
 */
router.get('/all', async function (req, res, next) {
	try {
		const match = {}; // Define your match criteria
		const sort = { createdAt: -1 }; // Define your sort criteria
		const limit = parseInt(req.query.limit, 10) || 0; // Get limit from query params or default to 0
		const user = req.user; // Assuming user is available in req.user

		const files = await File.getFinishedFileList(match, sort, limit, user);
		res.json({ data: files });
	} catch (err) {
		console.error('Error getting file list:', err);
		res.status(500).json({ message: 'Could not get file list', error: err.message });
	}
});

router.get('/finished', async function (req, res, next) {
	try {
		const match = {}; // Define your match criteria
		const sort = { createdAt: -1 }; // Define your sort criteria
		const limit = parseInt(req.query.limit, 10) || 0; // Get limit from query params or default to 0
		const user = req.user; // Assuming user is available in req.user

		const files = await File.getFinishedFileList(match, sort, limit, user);
		res.json({ data: files });
	} catch (err) {
		console.error('Error getting file list:', err);
		res.status(500).json({ message: 'Could not get file list', error: err.message });
	}
});

router.get('/user-locked', async (req, res, next) => {
	try {
		const user = await User.findById(req.user._id.toString());
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const files = await File.getFinishedFileList({ "locked.user": user._id }, { "createdAt": -1 }, 0, user);

		res.json({ data: files });
	} catch (err) {
		console.error('Error checking if user has locked file:', err);
		res.status(500).json({ message: 'Error checking if user has locked file', error: err.message });
	}
});

router.get('/:id', async (req, res) => {
	try {
		const user = req.user;
		const fileId = req.params.id;
		let file = await File.findById(fileId)
			.select('-path -hashString -isFinished -privacy -torrentAddedAt -grades -comments')
			.populate('creator', 'login role avatar');

		if (!file) {
			return res.status(404).json({ message: 'File not found' });
		}

		const updatedFile = {
			...file.toObject(),
			isLocked: file.getIsLocked(),
			isLockedByUser: file.getIsLockedByUser(user),
		};

		res.json(updatedFile);
	} catch (err) {
		console.error('Error getting file:', err);
		res.status(500).json({ message: 'Error getting file', error: err.message });
	}
});

router.post('/add-grade/:id', async (req, res) => {
	try {
		const fileId = req.params.id;
		const { grade } = req.body;

		const file = await File.findById(fileId);
		if (!file) {
			return res.status(404).json({ message: 'File not found' });
		}

		await file.addGrade(req.user._id.toString(), grade);
		res.json({ file });
	} catch (err) {
		console.error('Error adding grade:', err);
		res.status(500).json({ message: 'Error adding grade', error: err.message });
	}
});

router.delete('/remove-grade/:id', async function (req, res, next) {
	try {
		const fileId = req.params.id;

		const file = await File.findById(fileId);
		if (!file) {
			return res.status(404).json({ message: 'File not found' });
		}

		await file.removeGrade(req.user._id.toString());
		res.json({ file });
	} catch (err) {
		console.error('Error removing grade:', err);
		res.status(500).json({ message: 'Error removing grade', error: err.message });
	}
});

router.post('/add-lock/:id', async function (req, res, next) {
	try {
		const fileId = req.params.id;

		const file = await File.findById(fileId);
		if (!file) {
			return res.status(404).json({ message: 'File not found' });
		}

		await file.addLock(req.user._id.toString());
		res.json({ file });
	} catch (err) {
		console.error('Error adding lock:', err);
		res.status(500).json({ message: 'Error adding lock', error: err.message });
	}
});

router.delete('/remove-lock/:id', async function (req, res) {
	try {
		const fileId = req.params.id;

		const file = await File.findById(fileId);
		if (!file) {
			return res.status(404).json({ message: 'File not found' });
		}

		await file.removeLock(req.user._id.toString());
		res.json({ file });
	} catch (err) {
		console.error('Error removing lock:', err);
		res.status(500).json({ message: 'Error removing lock', error: err.message });
	}
});

router.put('/remove-all-user-lock', async (req, res, next) => {
	try {
		const files = await File.find({ '_id': { $in: req.body.toUnlock } });
		const unlocked = [];

		for (const file of files) {
			try {
				await file.removeLock(req.user._id.toString());
				unlocked.push(file._id);
			} catch (err) {
				console.error(`Error removing lock for file ${file._id}:`, err);
			}
		}

		res.json({ message: 'Files successfully unlocked', data: unlocked });
	} catch (err) {
		console.error('Error removing all user locks:', err);
		res.status(500).json({ message: 'Error removing all user locks', error: err.message });
	}
});


router.put('/hard-remove-all-lock', async (req, res, next) => {
	try {
		const files = await File.find({ '_id': { $in: req.body.toUnlock } });
		const unlocked = [];

		for (const file of files) {
			try {
				await file.removeAllLock();
				unlocked.push(file._id);
			} catch (err) {
				console.error(`Error removing all locks for file ${file._id}:`, err);
			}
		}

		res.json({ message: 'All locks successfully removed', data: unlocked });
	} catch (err) {
		console.error('Error removing all locks:', err);
		res.status(500).json({ message: 'Error removing all locks', error: err.message });
	}
});

router.get("/comments/:id", async (req, res, next) => {
	try {
		const comments = await File.getCommentsById(req.params.id);
		res.json({ data: comments });
	} catch (err) {
		console.error('Error getting comments:', err);
		res.status(500).json({ success: false, message: err.message });
	}
});

router.post('/add-comment/:id', async (req, res, next) => {
	try {
		const fileId = req.params.id;
		const { comment } = req.body;

		if (!comment || comment.trim() === '') {
			return res.status(400).json({ message: 'Comment cannot be empty' });
		}

		const file = await File.findById(fileId);
		if (!file) {
			return res.status(404).json({ message: 'File not found' });
		}

		await file.addComment(req.user, comment);
		res.json({ file });
	} catch (err) {
		console.error('Error adding comment:', err);
		res.status(500).json({ message: 'Error adding comment', error: err.message });
	}
});

router.delete('/remove-comment/:id', async (req, res, next) => {
	try {
		const fileId = req.params.id;
		const { commentId } = req.body;

		const file = await File.findById(fileId);
		if (!file) {
			return res.status(404).json({ message: 'File not found' });
		}

		await file.removeComment(commentId);
		res.json({ message: 'Comment successfully removed' });
	} catch (err) {
		console.error('Error removing comment:', err);
		res.status(500).json({ message: 'Error removing comment', error: err.message });
	}
});

router.put('/delete-all', rights.admin, async (req, res, next) => {
	try {
		const files = await File.find({ '_id': { $in: req.body.toDelete } });
		const deleted = [];
		const errors = [];

		for (const file of files) {
			try {
				await file.deleteFile(req.app.locals.transmission);
				deleted.push(file._id);
			} catch (err) {
				console.error(`Error deleting file ${file._id}:`, err);
				errors.push({ file: file._id, error: err.message });
			}
		}

		if (errors.length > 0) {
			return res.status(500).json({ message: 'Error deleting files', errors });
		}

		res.json({ message: 'Files successfully removed from database and server', data: deleted });
	} catch (err) {
		console.error('Error deleting files:', err);
		res.status(500).json({ message: 'Error deleting files', error: err.message });
	}
});


router.put('/delete-all-from-db', rights.admin, async (req, res, next) => {
	try {
		const files = await File.find({ '_id': { $in: req.body.toDelete } });
		const deleted = [];
		const errors = [];

		for (const file of files) {
			try {
				await file.deleteFileFromDb(req.app.locals.transmission);
				deleted.push(file._id);
			} catch (err) {
				console.error(`Error deleting file ${file._id}:`, err);
				errors.push({ file: file._id, error: err.message });
			}
		}

		if (errors.length > 0) {
			return res.status(500).json({ message: 'Error deleting files', errors });
		}

		res.json({ message: 'Files successfully removed from database', data: deleted });
	} catch (err) {
		console.error('Error deleting files:', err);
		res.status(500).json({ message: 'Error deleting files', error: err.message });
	}
});

router.put('/:id', rights.admin, async (req, res, next) => {
	try {
		const fileId = req.params.id;
		if (req.body.name === undefined) {
			return res.status(500).json({ message: 'Name is required' });
		}

		const updateName = {
			"name": req.body.name
		};

		const file = await File.findByIdAndUpdate(fileId, { $set: updateName }, { new: true }).exec();
		if (!file) {
			return res.status(404).json({ message: 'File not found' });
		}

		res.json({ message: 'File updated successfully', data: file });
	} catch (err) {
		console.error('Error updating file:', err);
		res.status(500).json({ message: 'Error updating file', error: err.message });
	}
});



router.delete('/:id', rights.admin, async (req, res, next) => {
	try {
		const fileId = req.params.id;

		const file = await File.findById(fileId);
		if (!file) {
			return res.status(404).json({ message: 'File not found' });
		}

		await file.deleteFile(req.app.locals.transmission);
		res.json({ message: 'File deleted successfully' });
	} catch (err) {
		console.error('Error deleting file:', err);
		res.status(500).json({ message: 'Error deleting file', error: err.message });
	}
});

router.get('/show/:id', async (req, res) => {
	try {
		const fileId = req.params.id;
		const file = await File.getFileById(fileId);

		if (!file) {
			return res.status(404).json({ message: 'File not found' });
		}

		try {
			const data = await fileInfos.getFileInfosRecurs(file.path, file.name);
			const rawFile = file.toObject();
			rawFile.isLocked = file.getIsLocked();
			rawFile.isLockedByUser = file.getIsLockedByUser(req.user);
			rawFile.rateByUser = file.getUserGrade(req.user);
			delete rawFile.path;
			res.json({ data: data, file: rawFile });
		} catch (err) {
			res.status(500).json({ error: err.message, file: file.toObject() });
		}

	} catch (err) {
		console.error('Error getting file:', err);
		res.status(500).json({ message: 'Error getting file', error: err.message });
	}
});

router.get('/detail/:id', async (req, res) => {
	try {
		const fileId = req.params.id;
		const file = await File.getFileById(fileId);

		if (!file) {
			return res.status(404).json({ message: 'File not found' });
		}

		try {
			const data = await fileInfos.getFileInfosRecurs(file.path, file.name);
			const rawFile = file.toObject();
			rawFile.isLocked = file.getIsLocked();
			rawFile.isLockedByUser = file.getIsLockedByUser(req.user);
			rawFile.rateByUser = file.getUserGrade(req.user);
			delete rawFile.path;
			res.json({ data: data, file: rawFile });
		} catch (err) {
			console.log(err);
			res.status(500).json({ error: err.message, file: file.toObject() });
		}

	} catch (err) {
		console.error('Error getting file:', err);
		res.status(500).json({ message: 'Error getting file', error: err.message });
	}
});

router.post('/upload/:id/:pathInDirectory', async (req, res, next) => {
	try {
		const fileId = req.params.id;
		const uploadPath = atob(req.params.pathInDirectory);
		let files = req.files.files;

		const dbFile = await File.findById(fileId);
		if (!dbFile) {
			return res.status(404).json({ message: 'File not found' });
		}

		if (dbFile.isDownloadFinished() === false) {
			return res.status(400).json({ message: 'File is not finished' });
		}

		if (dbFile.isDirectory() === false) {
			return res.status(400).json({ message: 'File is not a folder' });
		}

		const targetPath = path.join(dbFile.getPath(), uploadPath);
		console.log('targetPath:', targetPath);
		if (dbFile.isPathInDirectory(targetPath) === false) {
			return res.status(400).json({ message: 'Invalid path' });
		}

		let totalSize = 0;
		const fileList = [];

		if (!Array.isArray(files)) {
			files = [files];
		}

		for (const file of files) {
			const filePath = path.join(targetPath, file.name);
			if (dbFile.isPathInDirectory(filePath) === false) {
				return res.status(400).json({ message: 'Invalid path for file' });
			}
			await file.mv(filePath);

			fileList.push({
				fileType: file.mimetype,
				isDirectory: false,
				name: file.originalname,
				path: filePath,
				size: file.size
			});

			totalSize += file.size;
		}

		await dbFile.addSize(totalSize);

		res.json({ data: fileList, size: dbFile.size });
	} catch (err) {
		console.error('Error uploading files:', err);
		res.status(500).json({ message: 'Error uploading files', error: err.message });
	}
});

function removeTrailingSlash(filePath) {
	return filePath.endsWith('/') ? filePath.slice(0, -1) : filePath;
}

router.get('/download/:id/:pathInDirectory/:name', async (req, res, next) => {
	try {
		const fileId = req.params.id;
		const pathInDirectory = atob(req.params.pathInDirectory);
		const decodedName = atob(req.params.name);

		const file = await File.findById(fileId).select('path downloads');
		if (!file) {
			return res.status(404).json({ message: 'File not found' });
		}

		let filePath = path.join(file.getPath(), pathInDirectory);
		filePath = path.normalize(filePath);
		filePath = removeTrailingSlash(filePath);

		if (!file.isPathInDirectory(filePath)) {
			return res.status(400).json({ message: 'Invalid path' });
		}

		const stats = await fs.promises.stat(filePath);

		if (stats.isDirectory()) {
			const zipPath = path.join('/tmp', decodedName + '.zip');
			var output = fs.createWriteStream(zipPath);
			var archive = archiver('zip', {
				zlib: { level: 9 } // Sets the compression level.
			});

			output.on('close', function () {
				res.download(zipPath, decodedName + '.zip', (err) => {
					if (err) {
						console.error('Error downloading file:', err);
						return next(err);
					}
				});
			});

			res.on('finish', () => {
				fs.unlink(zipPath, (err) => {
					if (err) {
						console.error('Error deleting the zip file:', err);
					} else {
						console.log('Zip file deleted successfully');
					}
				});

				file.incDownloads();
			});

			archive.on('warning', function (err) {
				if (err.code === 'ENOENT') {
					console.warn(err);
				} else {
					throw err;
				}
			});

			archive.on('error', function (err) {
				throw err;
			});

			archive.pipe(output);
			archive.directory(filePath, false);

			archive.finalize();
		} else {
			res.download(filePath, decodedName, (err) => {
				if (err) {
					console.error('Error downloading file:', err);
					return next(err);
				}

				file.incDownloads();
			});
		}

	} catch (err) {
		console.error('Error getting file:', err);
		res.status(500).json({ message: 'Error getting file', error: err.message });
	}
});

export default router;
