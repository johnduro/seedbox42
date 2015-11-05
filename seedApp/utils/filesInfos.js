var fs = require('fs');
var mime = require('mime');



var getFileRights = function (path, done) {
	// fs.access(path, fs.F_OK, function (err) {
		// console.log("FILE > ", file);
		// if (err)
		// 	console.log("ERROR F > ", err);
	var rights = {
		read: true,
		write: true
	};
	fs.access(path, fs.R_OK, function (err) {
		if (err)
			rights.read = false;
			// console.log("ERROR R > ", err);
		fs.access(path, fs.W_OK, function (err) {
			if (err)
				rights.write = false;
			// console.log("ERROR W > ", err);
			done(rights);
		});
	});
	// });

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
	// var rights = {
	// 	read: true,
	// 	write: true
	// };
	fs.stat(path, function (err, fStat) {
		if (err)
			done(err);
		getFileRights(path, function (pRights) {
			// rights.read = pRights.read ? rights.read : pRights.read; //refaire ternaire inutile
			// rights.write = pRights.write ? rights.write : pRights.write; //refaire ternaire inutile
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
							// return done(null, rights);
						var filePath = path + '/' + file;
						// self(filePath, function (err, fRights) {
						self(filePath, function (err, fInfos) {
							if (err)
								done(err);
							// rights.read = fRights.read ? rights.read : fRights.read;
							// rights.write = fRights.write ? rights.write : fRights.write;
							infos.rights.read = fInfos.rights.read ? infos.rights.read : fInfos.rights.read;
							infos.rights.write = fInfos.rights.write ? infos.rights.write : fInfos.rights.write;
							infos.size += fInfos.size;
							next();
						});
					})();
				});
			}
			else
				// done(null, pRights);
				done(null, infos);
		});
	});
};


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
		var fileInfos = { name: name, path: path, isDirectory: false, size: 0, fileList: [] }; //isDirectory utile ?
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
		// var dirInfos = {};
		var result = [];
		// console.log('Current uid: ' + process.getuid());
		// console.log('effective > ', process.geteuid());
		// console.log('Current gid: ' + process.getgid());
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
						// getFileRightsRecurs(path + '/' + file, function (err, rights) {
						getFileRightsRecurs(path + '/' + file, function (err, infos) {
							if (err)
								done(err);

								// console.log(err);
							// console.log('FILE > ', file);
							// console.log('RIGHTS > ', rights);
							result.push(infos);
							next();
						});
					})();
					console.log("DIR INFOS > ", files);
				});
				// done(null, fStat);
			}
			else
			{
				// getFileRightsRecurs(path, function (err, rights) {
				getFileRightsRecurs(path, function (err, infos) {
					if (err)
						done(err);
						// console.log(err);
					// console.log('IS NOT DIR > ', fStat);
					done(null, infos);
					// done(null, [{ size: fStat.size, rights: rights, path: path }]);
				});
				// done(null, fStat);
			}
		});
	}

};
