import fsBase from 'fs';
const fs = fsBase.promises;

import mime from "mime";
import path from 'path';

var getFileRights = async (path, done) => {
	const rights = {
		read: true,
		write: true,
	};

	try {
		await fs.access(path, fs.constants.R_OK);
	} catch (err) {
		rights.read = false;
	}

	try {
		await fs.access(path, fs.constants.W_OK);
	} catch (err) {
		rights.write = false;
	}

	return rights;
};

var getFileRightsRecurs = async function self(path) {
	const infos = {
		fileType: '',
		rights: {
			read: true,
			write: true,
		},
		size: 0,
		path: path,
	};

	try {
		const fStat = await fs.stat(path);
		if (fStat == null) {
			throw new Error('File does not exist');
		}

		const pRights = await getFileRights(path);
		infos.rights.read = pRights.read;
		infos.rights.write = pRights.write;
		infos.fileType = mime.getType(path);
		infos.size += fStat.size;

		if (fStat.isDirectory() && infos.rights.read) {
			infos.fileType = 'folder';
			const files = await fs.readdir(path);
			for (const file of files) {
				if (file.length > 0 && file[0] === '.') {
					continue;
				}
				const filePath = `${path}/${file}`;
				try {
					const fInfos = await getFileRightsRecurs(filePath);
					infos.rights.read = fInfos.rights.read ? infos.rights.read : fInfos.rights.read;
					infos.rights.write = fInfos.rights.write ? infos.rights.write : fInfos.rights.write;
					infos.size += fInfos.size;
				} catch (err) {
					infos.rights.read = false;
				}
			}
		}

		return infos;
	} catch (err) {
		throw new Error(`Error getting file rights: ${err.message}`);
	}
};


/**
 * Files Infos
 */

export default {
	isDirectory: function (path, done) {
		fs.stat(path, function (err, stats) {
			if (err)
				return done(err);
			if (stats.isDirectory())
				return done(null, true, stats.size);
			return done(null, false, stats.size);
		});
	},

	getFileInfosRecurs: async function (filePath, fileName) {
		try {
			const stats = await fs.stat(filePath);
			const fileInfo = {
				name: fileName,
				size: stats.size,
				isDirectory: stats.isDirectory(),
				createdAt: stats.birthtime,
				updatedAt: stats.mtime,
				type: stats.isDirectory() ? 'folder' : mime.getType(filePath)
			};

			if (stats.isDirectory()) {
				const files = await fs.readdir(filePath);
				fileInfo.children = await Promise.all(files.map(async (file) => {
					const childPath = path.join(filePath, file);
					return await this.getFileInfosRecurs(childPath, file);
				}));
			}

			return fileInfo;
		} catch (err) {
			throw new Error(`Error getting file info: ${err.message}`);
		}
	},

	getFilesStreams: function self(fileDetail, pathInDir, done) {
		var fileStream = [];
		var zipSize = 0;
		if (fileDetail.isDirectory) {
			var i = 0;
			(function next() {
				var file = fileDetail.fileList[i++];
				if (!file)
					return done(null, { streams: fileStream, size: zipSize });
				var filePathInDir = pathInDir;
				if (filePathInDir != '')
					filePathInDir += '/';
				filePathInDir += file.name;
				self(file, filePathInDir, function (err, data) {
					if (err)
						return done(err);
					fileStream = fileStream.concat(data.streams);
					zipSize += data.size;
					next();
				});
			})();
		}
		else {
			var pathInDirByteLength = Buffer.byteLength(pathInDir, 'utf8');
			fileStream.push({ stream: fs.createReadStream(fileDetail.path), name: pathInDir });
			return done(null, { streams: fileStream, size: (fileDetail.size + 30 + (pathInDirByteLength * 2) + 16 + 46) });
		}
	},

	getDirInfos: async (path) => {
		const result = [];
		try {
			const fStat = await fs.stat(path);
			if (fStat == null) {
				throw new Error("File does not exist");
			}
			if (fStat.isDirectory()) {
				const files = await fs.readdir(path);
				for (const file of files) {
					if (file.length > 0 && file[0] === '.') {
						continue;
					}
					const infos = await getFileRightsRecurs(`${path}/${file}`);
					result.push(infos);
				}
			} else {
				const infos = await getFileRightsRecurs(path);
				result.push(infos);
			}
			return result;
		} catch (err) {
			throw new Error(`Error getting directory info: ${err.message}`);
		}
	},

	fileTypeSync: function (path) {
		try {
			var stat = fs.statSync(path);
			if (stat.isDirectory())
				return "folder";
			else
				return mime.lookup(path);
		} catch (e) {
			return 'error';
		}
	}

};
