var CronJob = require('cron').CronJob;
var File = require('../models/File');

/**
 * Scheluded jobs :
 * - Auto-delete files :: check every day at 3 oclock
 * - Auto-remove lock :: check every day at 3 oclock
 * - Refresh torrents & check finished :: check every 5 minutes
 * - Clear finished torrents :: clear the array used to record finished torrents
 * Infos :
	*		*		*		*		*		*
	sec		min		hour 	day/mon	month	day/week
 */
module.exports = function (config, transmission, app) {
	var finishedTorrents = [];

	var checkFileJob = new CronJob('00 00 3 * * *', function () {
		console.log('CHECK-FILEJOB :: ', new Date());
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

	var checkTorrents = new CronJob('* */5 * * * *', function () {
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


	var clearFinishedTorrent = new CronJob('00 00 5 * * *', function () {
		console.log('CHECK-CLEARFINISHEDTORRENTS :: ', new Date());
		finishedTorrents = [];
		app.emit('torrents:clearFinishedTorrents');
	}, null, true);

};
