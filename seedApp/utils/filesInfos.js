var fs = require('fs');
var mime = require('mime');

/**
 * Files Infos
 */

module.exports = {
	isDirectory: function (path, done) {
		fs.stat(path, function (err, stats) {
			if (err)
				return done(err);
			if (stats.isDirectory())
				return done(null, true, stats.size);
				// return done(null, true);
			return done(null, false, stats.size);
			// return done(null, false);
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
		if (fileDetail.isDirectory)
		{
			var i = 0;
			(function next () {
				var file = fileDetail.fileList[i++];
				if (!file)
					return done(null, fileStream);
				var filePathInDir = pathInDir + '/' + file.name;
				self(file, filePathInDir, function (err, data) {
					if (err)
						return done(err);
					fileStream = fileStream.concat(data);
					next();
				});
			})();
		}
		else
		{
			fileStream.push({ stream: fs.createReadStream(fileDetail.path), name: pathInDir });
			return done(null, fileStream);
		}
	}

};
