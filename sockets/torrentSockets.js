var fs = require('fs');
var mime = require('mime');
var File = require('../models/File.js');
var format = require('../utils/format');

module.exports = function (socket, io, transmission) {

	var second = 1000;
	var torrentRefreshCounter = 0;
	var torrentRefreshIntervalId = null;
	var finishRefreshTorrentIntervalId = null;
	var finishedTorrents = [];

	var infosFinished = transmission.requestFormat.infosFinished;
	var checkFinished = transmission.requestFormat.checkFinished;
	var refreshActive = transmission.requestFormat.refreshActive;
	var refreshAll = transmission.requestFormat.refreshAll;

	/**
	 * Socket - Emit - torrentRefreshRes
	 * Mets a jour le tableau finishedTorrents si il y a des torrents fini et met a jour la DB
	 * Ajout en db le nouveau fichier telecharger et fini
	 * Envois un event a tout les utilisateurs avec les nouvelles donnees des torrents actifs
	 */
	var finishRefreshTorrent = function () {
		transmission.torrentGet(checkFinished, "recently-active", function (err, res) {
			if (err)
			{
				clearInterval(finishRefreshTorrentIntervalId);
				finishRefreshTorrentIntervalId = null;
			}
			else
			{
				res["torrents"].forEach(function (torrent) {
					if (finishedTorrents.indexOf(torrent['name']) < 0)
					{
						if (torrent['leftUntilDone'] === 0 && torrent["percentDone"] === 1.0)
						{
							finishedTorrents.push(torrent["name"]);
							File.insertTorrent(torrent['id'], torrent['name'], transmission, function (err, newFile) {
								if (newFile != null)
									io.sockets.emit("newFile", { name: torrent["name"], data: newFile });
							});
						}
					}
				});
			}
		});
	};

	/**
	 * Socket - Emit - torrentRefreshRes
	 * Permet d'envoyer un event a tous les utilisateurs avec les nouvelles donnees des torrents actifs
	 */
	var refreshTorrent = function () {
		transmission.torrentGet(refreshActive, "recently-active", function (err, res) {
		if (err)
			io.sockets.emit('torrentErrorRefresh', { error: err });
		else if (res['removed'].length > 0 || res['torrents'].length > 0)
			io.sockets.emit('torrentRefreshRes', { result: res });
		});
	};

	if (io.engine.clientsCount === 1)
		finishRefreshTorrentIntervalId = setInterval(finishRefreshTorrent, second);

	socket.on('torrentRefresh', function () {
		torrentRefreshCounter++;
		transmission.torrentGet(refreshAll, {}, function (err, res) {
			if (err)
				socket.emit("torrentErrorRefresh", { error: err });
			else
				socket.emit("torrentFirstRefresh", { torrents: res });
		});
		if (torrentRefreshCounter === 1)
			torrentRefreshIntervalId = setInterval(refreshTorrent, second);
	});

	socket.on('torrentStopRefresh', function () {
		torrentRefreshCounter--;
		if (torrentRefreshCounter === 0)
		{
			clearInterval(torrentRefreshIntervalId);
			torrentRefreshIntervalId = null;
		}
	});

	/**
	 * Socket - On - Event
	 * Permet de supprimer un torrent via une url
	 * @param {removeLocalData: true/false, id:idTorrent}
	 * Retroune un event 'post:torrent:url' true ou false
	 */
	socket.on('delete:torrent', function (data) {
		var removeLocalData = data.removeLocalData;
		var ids = format.torrentsIds(data.ids);
		transmission.torrentGet(['hashString', 'name'], ids, function (err, respGet) {
			if (err)
				socket.emit('delete:torrent', { success: false, message: 'Could not remove torrent', error: err });
			else
			{
				transmission.torrentRemove(ids, removeLocalData, function (err, respRemove) {
					if (err)
						socket.emit('delete:torrent', { success: false, message: "Could not remove torrent" });
					else
					{
						io.sockets.emit('delete:torrent', { success: true, ids: ids, message: 'Torrent removed' });
						if (respGet['torrents'].length > 0)
						{
							if (removeLocalData)
							{
								var toFind = [];
								respGet['torrents'].forEach(function (torrent) {
									toFind.push(torrent.hashString);
								});
								File.remove({ hashString:  { $in: toFind } }, function (err, file) {
									if (err)
										console.log('Socket - On - delete:torrent: ', err);
								});
							}
							respGet['torrents'].forEach(function (torrent) {
								var index = finishedTorrents.indexOf(torrent.name);
								if (index > 0)
									finishedTorrents.splice(index, 1);
							});
						}
					}
				});
			}
		});
	});


	/**
	 * Socket - On - Event
	 * Permet d'ajouter un torrent via une url
	 * Retourne un event 'post:torrent:url' true ou false
	 */
	socket.on('post:torrent:url',  function (data) {
		transmission.torrentAdd({ filename: data.url }, function (err, resp) {
			if (err)
				socket.emit('post:torrent:url', { success: false, message: "torrent not added, wrong url" });
			else
			{
				if ('torrent-duplicate' in resp)
					socket.emit('post:torrent', { success: false, message: 'duplicate, torrent already present' });
				else if ('torrent-added' in resp)
				{
					File.createFile(resp['torrent-added'], data.id, function (err, file) {
						if (err)
							io.sockets.emit('post:torrent', { success: false, message: 'torrent successfully added but adding it in db failed', id: resp['torrent-added']['id'], name: resp['torrent-added']['name'], error: err });
						else
							io.sockets.emit('post:torrent', { success: true, message: 'torrent successfully added', id: resp['torrent-added']['id'], name: file.name });
					});
				}
				else
					socket.emit('post:torrent', { success: false, message: 'unexpected error' });
			}
		});
	});

	socket.on('disconnect', function () {
		if (io.engine.clientsCount === 0)
		{
			if (torrentRefreshIntervalId !== null)
			{
				torrentRefreshCounter = 0;
				clearInterval(torrentRefreshIntervalId);
				torrentRefreshIntervalId = null;
			}
			if (finishRefreshTorrentIntervalId !== null)
			{
				clearInterval(finishRefreshTorrentIntervalId);
				finishRefreshTorrentIntervalId = null;
			}
		}
	});
};
