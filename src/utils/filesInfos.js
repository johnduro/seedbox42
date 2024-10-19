import fs from "fs";
import mime from "mime";



var getFileRights = function (path, done) {
	var rights = {
		read: true,
		write: true
	};
	fs.access(path, fs.R_OK, function (err) {
		if (err)
			rights.read = false;
		fs.access(path, fs.W_OK, function (err) {
			if (err)
				rights.write = false;
			done(rights);
		});
	});
};

var getFileRightsRecurs = function self (path, done) {
	var infos = {
		fileType: '',
		rights : {
			read: true,
			write: true
		},
		size: 0,
		path: path
	};
	fs.stat(path, function (err, fStat) {
		if (err)
			return done(err);
		if (fStat == null)
			return done('File does not exist');
		getFileRights(path, function (pRights) {
			infos.rights.read = pRights.read;
			infos.rights.write = pRights.write;
			infos.fileType = mime.lookup(path);
			infos.size += fStat.size;
			if (fStat.isDirectory() && infos.rights.read)
			{
				infos.fileType = 'folder';
				fs.readdir(path, function (err, files) {
					if (err)
						return done(err);
					var i = 0;
					(function next () {
						var file = files[i++];
						if (!file)
							return done(null, infos);
						var filePath = path + '/' + file;
						self(filePath, function (err, fInfos) {
							if (err)
								infos.rights.read = false;
							else
							{
								infos.rights.read = fInfos.rights.read ? infos.rights.read : fInfos.rights.read;
								infos.rights.write = fInfos.rights.write ? infos.rights.write : fInfos.rights.write;
								infos.size += fInfos.size;
							}
							next();
						});
					})();
				});
			}
			else
				return done(null, infos);
		});
	});
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

	getFileInfosRecurs: function self (path, name, done) {
		var fileInfos = { name: name, path: path, isDirectory: false, size: 0, fileList: [] };
		fs.stat(path, function (err, fileStats) {
			if (err)
				return done(err);
			else if (fileStats.isDirectory())
			{
				fileInfos.isDirectory = true;
				fileInfos.fileType = "folder";
				fs.readdir(path, function (err, files) {
					if (err)
						return done(err);
					var i = 0;
					(function next () {
						var file = files[i++];
						if (!file)
							return done(null, fileInfos);
						var filePath = path + '/' + file;
						self(filePath, file, function (err, data) {
							if (err)
								done(err);
							fileInfos.fileList.push(data);
							fileInfos.size += data.size;
							next();
						});
					})();
				});
			}
			else
			{
				fileInfos.fileType = mime.lookup(path);
				fileInfos.size = fileStats.size;
				return done(null, fileInfos);
			}
		});
	},

	getFilesStreams: function self (fileDetail, pathInDir, done) {
		var fileStream = [];
		var zipSize = 0;
		if (fileDetail.isDirectory)
		{
			var i = 0;
			(function next () {
				var file = fileDetail.fileList[i++];
				if (!file)
					return done(null, { streams: fileStream, size: zipSize });
				// var filePathInDir = pathInDir + '/' + file.name;
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
		else
		{
			var pathInDirByteLength = Buffer.byteLength(pathInDir, 'utf8');
			fileStream.push({ stream: fs.createReadStream(fileDetail.path), name: pathInDir });
			// return done(null, { streams: fileStream, size: (fileDetail.size + 30 + (pathInDir.length * 2) + 16 + 46) });
			return done(null, { streams: fileStream, size: (fileDetail.size + 30 + (pathInDirByteLength * 2) + 16 + 46) });
		}
	},

	getDirInfos: function (path, done) {
		var result = [];
		fs.stat(path, function (err, fStat) {
			if (err)
				return done(err);
			if (fStat == null)
				return done("File does not exist");
			if (fStat.isDirectory())
			{
				fs.readdir(path, function (err, files) {
					if (err)
						return done(err);
					var i = 0;
					(function next () {
						var file = files[i++];
						if (!file)
							return done(null, result);
						if (file.length > 0 && file[0] == '.')
							return next();
						getFileRightsRecurs(path + '/' + file, function (err, infos) {
							if (err)
								return done(err);
							result.push(infos);
							next();
						});
					})();
				});
			}
			else
			{
				getFileRightsRecurs(path, function (err, infos) {
					if (err)
						return done(err);
					return done(null, [infos]);
				});
			}
		});
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
