var CronJob = require('cron').CronJob;
var File = require('../models/File');

/**
 * Scheluded jobs :
 * - Auto-delete files :: check every day at 2 oclock
 * - Auto-remove lock :: check every day at 2 oclock
 * - Refresh torrents & check finished :: check every 5 minutes
 */
module.exports = function (config, transmission) {
	var finishedTorrents = [];

	var checkFileJob = new CronJob('0 3 * * * *', function () {
		if (config.files['auto-remove-lock-enabled'])
		{
			File.removeDayLock(config.files['auto-remove-lock'], function (err, files) {
				if (err)
					console.log("error::checkFileSettings::removeDayLock:: ", err);
			});
		}
		if (config.files["auto-delete-enabled"])
		{
			File.removeOldFile(config.files["auto-delete"], transmission, function (err, files) {
				if (err)
					console.log("error::checkFileSettings::removeOldFile:: ", err);
			});
		}
	}, null, true);

	var checkTorrents = new CronJob('*/5 * * * * *', function () {
		var checkFinished = transmission.requestFormat.checkFinished;
		transmission.torrentGet(checkFinished, {}, function (err, res) {
			if (!err)
			{
				res['torrents'].forEach(function (torrent) {
					if (finishedTorrents.indexOf(torrent['name']) < 0)
					{
						if (torrent['leftUntilDone'] === 0 && torrent["percentDone"] === 1.0 && torrent["status"] > 4)
						{
							finishedTorrents.push(torrent["name"]);
							File.insertTorrent(torrent['id'], torrent['name'], transmission, function (err, newFile) {
								if (err)
									console.log('cron:error:', err);
								else if (newFile != null)
									console.log('cron:success:newfile:', newFile.name);
							});
						}
					}
				});
			}
		});
	}, null, true);


	var clearFinishedTorrent = new CronJob('0 5 * * * *', function () {
		finishedTorrents = [];
	}, null, true);
};
