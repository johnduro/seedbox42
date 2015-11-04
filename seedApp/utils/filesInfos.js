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
	},

	getDirInfos: function (path, done) {
		var dirInfos = {};
		var result = [];
		console.log('Current uid: ' + process.getuid());
		console.log('effective > ', process.geteuid());
		console.log('Current gid: ' + process.getgid());
		fs.stat(path, function (err, fStat) {
			if (err)
				done(err);
			if (fStat.isDirectory())
			{
				console.log('IS DIR > ', fStat);
				fs.readdir(path, function (err, files) {
					if (err)
						done(err);
					var i = 0;
					(function next () {
						var file = files[i++];
						if (!file)
							return done(null, result);
						fs.open(path + '/' + file, 'a', function (err, fd) {
							console.log("FILE > ", file);
							if (err)
							{
								console.log('ERR OPEN >> ', err);
								if (err.code == 'EACCES')
									console.log("PAS LES DROIITS !!!!");
							}
							next();
						});
						// fs.stat(path + '/' + file, function (err, stats) {
						// 	console.log('NAME > ', file);
						// 	console.log('    owner eXecute:  ' + (stats["mode"] & 100 ? 'x' : '-'));
						// 	console.log('    owner Write:    ' + (stats["mode"] & 200 ? 'w' : '-'));
						// 	console.log('    owner Read:     ' + (stats["mode"] & 400 ? 'r' : '-'));
						// 	console.log('    group eXecute:  ' + (stats["mode"] & 10 ? 'x' : '-'));
						// 	console.log('    group Write:    ' + (stats["mode"] & 20 ? 'w' : '-'));
						// 	console.log('    group Read:     ' + (stats["mode"] & 40 ? 'r' : '-'));
						// 	console.log('    others eXecute: ' + (stats["mode"] & 1 ? 'x' : '-'));
						// 	console.log('    others Write:   ' + (stats["mode"] & 2 ? 'w' : '-'));
						// 	console.log('    others Read:    ' + (stats["mode"] & 4 ? 'r' : '-'));
						// });
					})();
					console.log("DIR INFOS > ", files);
				});
				// done(null, fStat);
			}
			else
			{
				console.log('IS NOT DIR > ', fStat);
				// done(null, fStat);
			}
		});
	}

};
