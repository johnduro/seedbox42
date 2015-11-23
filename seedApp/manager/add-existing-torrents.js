var chalk = require('chalk');
var util = require('util');
var File = require('../models/File');

module.exports = function (configFileName, args) {
	args.transmission.torrentGet(['hashString', 'name', 'downloadDir', 'totalSize', "status", "leftUntilDone", "percentDone"], {}, function (err, resp) {
		if (err)
			console.log(chalk.red("An error occured while retreiving torrents from transmission, check your configuration, error : "), err);
		else
		{
			console.log(chalk.green(util.format("%d torrent(s) found in transmission", resp.torrents.length)));
			var i = 0;
			var counter = 0;
			(function next() {
				var torrent = resp.torrents[i++];
				if (!torrent)
				{
					console.log(chalk.green(util.format("%d torrent(s) were added to the database", counter)));
					return ; //ok ?
					// process.exit();
				}
				var path = torrent.downloadDir + '/' + torrent.name;
				File.findOne({ $or: [ { hashString: torrent.hashString }, { path: path } ] }, function (err, file) {
					if (err)
					{
						console.log(chalk.red("There was an issue with the database, error: "), err);
						process.exit();
					}
					else if (file == null)
					{
						if (torrent['leftUntilDone'] === 0 && torrent["percentDone"] === 1.0 && (torrent["status"] > 4 || torrent['status'] == 0))
						{
							var fileToInsert = {
								path: path,
								size: torrent.totalSize,
								fileType: filesInfos.fileTypeSync(path)
							};
							File.insertFile(fileToInsert, args.user._id, torrent.hashString, function (err, file) {
								if (err)
									console.log(chalk.red(util.format("There was an issue inserting %s to the database, error: ", torrent.name)), err);
								else
								{
									console.log(chalk.green(util.format("%s successfully added to the database", file.name)));
									counter++;
								}
								next();
							});
						}
						else
						{
							File.createFile(torrent, args.user._id, function (err, file) {
								if (err)
									console.log(chalk.red(util.format("There was an issue inserting %s to the database, error: ", torrent.name)), err);
								else
								{
									console.log(chalk.green(util.format("%s successfully added to the database", file.name)));
									counter++;
								}
								next();
							});
						}
					}
					else
						next();
				});
			})();
		}
	});
};
