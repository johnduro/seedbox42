var File = require('../models/File.js');
var format = require('../utils/format');

var TorrentSockets = module.exports = function (io, transmission, app) {
	this.io = io;
	this.transmission = transmission;
	this.app = app;

	this.second = 1000;
	this.torrentRefreshCounter = 0;
	this.torrentRefreshIntervalId = null;
	this.finishRefreshTorrentIntervalId = null;
	this.finishedTorrents = [];

	this.infosFinished = transmission.requestFormat.infosFinished;
	this.checkFinished = transmission.requestFormat.checkFinished;
	this.refreshActive = transmission.requestFormat.refreshActive;
	this.refreshAll = transmission.requestFormat.refreshAll;

	var self = this;

	this.app.on('torrents:clearFinishedTorrents', function () {
		self.finishedTorrents = [];
	});


	/**
	 * Socket - Emit - torrentRefreshRes
	 * Mets a jour le tableau finishedTorrents si il y a des torrents fini et met a jour la DB
	 * Ajout en db le nouveau fichier telecharger et fini
	 * Envois un event a tout les utilisateurs avec les nouvelles donnees des torrents actifs
	 */
	this.finishRefreshTorrent = function () {
		self.transmission.torrentGet(self.checkFinished, "recently-active", function (err, res) {
			if (err)
			{
				clearInterval(self.finishRefreshTorrentIntervalId);
				self.finishRefreshTorrentIntervalId = null;
			}
			else
			{
				res["torrents"].forEach(function (torrent) {
					if (self.finishedTorrents.indexOf(torrent['name']) < 0)
					{
						if (torrent['leftUntilDone'] === 0 && torrent["percentDone"] === 1.0)
						{
							self.finishedTorrents.push(torrent["name"]);
							File.insertTorrent(torrent['id'], torrent['name'], self.transmission, function (err, newFile) {
								if (newFile != null)
									self.io.sockets.emit("newFile", { name: torrent["name"], data: newFile });
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
	this.refreshTorrent = function () {
		self.transmission.torrentGet(self.refreshActive, "recently-active", function (err, res) {
		if (err)
			self.io.sockets.emit('torrentErrorRefresh', { error: err });
		else if (res['removed'].length > 0 || res['torrents'].length > 0)
			self.io.sockets.emit('torrentRefreshRes', { result: res });
		});
	};

	this.newConnection = function (socket) {
		if (self.io.engine.clientsCount === 1)
		{
			self.finishRefreshTorrentIntervalId = setInterval(self.finishRefreshTorrent, self.second);
		}

		socket.on('torrentRefresh', function () {
			self.torrentRefreshCounter++;
			self.transmission.torrentGet(self.refreshAll, {}, function (err, res) {
				if (err)
					socket.emit("torrentErrorRefresh", { error: err });
				else
				{
					socket.emit("torrentFirstRefresh", { torrents: res });
				}
			});
			if (self.torrentRefreshCounter === 1)
			{
				self.torrentRefreshIntervalId = setInterval(self.refreshTorrent, self.second);
			}
		});

		socket.on('torrentStopRefresh', function () {
			self.torrentRefreshCounter--;
			if (self.torrentRefreshCounter === 0)
			{
				clearInterval(self.torrentRefreshIntervalId);
				self.torrentRefreshIntervalId = null;
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
			self.transmission.torrentGet(['hashString', 'name'], ids, function (err, respGet) {
				if (err)
					socket.emit('delete:torrent', { success: false, message: 'Could not remove torrent', error: err });
				else
				{
					self.transmission.torrentRemove(ids, removeLocalData, function (err, respRemove) {
						if (err)
							socket.emit('delete:torrent', { success: false, message: "Could not remove torrent" });
						else
						{
							self.io.sockets.emit('delete:torrent', { success: true, ids: ids, message: 'Torrent removed' });
							if (respGet['torrents'].length > 0)
							{
								if (removeLocalData)
								{
									var toFind = [];
									respGet['torrents'].forEach(function (torrent) {
										toFind.push(torrent.hashString);
									});
									File.find({ hashString:  { $in: toFind } }, function (err, files) {
										if (!err)
										{
											files.forEach(function (file) {
												file.deleteFile(self.transmission, function (err, msg) {
												});
											});
										}
									});
								}
								respGet['torrents'].forEach(function (torrent) {
									var index = self.finishedTorrents.indexOf(torrent.name);
									if (index > -1)
										self.finishedTorrents.splice(index, 1);
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
			self.transmission.torrentAdd({ filename: data.url }, function (err, resp) {
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
								self.io.sockets.emit('post:torrent', { success: false, message: 'torrent successfully added but adding it in db failed', id: resp['torrent-added']['id'], name: resp['torrent-added']['name'], error: err });
							else
								self.io.sockets.emit('post:torrent', { success: true, message: 'torrent successfully added', id: resp['torrent-added']['id'], name: file.name });
						});
					}
					else
						socket.emit('post:torrent', { success: false, message: 'unexpected error' });
				}
			});
		});

		socket.on('disconnect', function () {
			if (self.io.engine.clientsCount === 0)
			{
				if (self.torrentRefreshIntervalId !== null)
				{
					self.torrentRefreshCounter = 0;
					clearInterval(self.torrentRefreshIntervalId);
					self.torrentRefreshIntervalId = null;
				}
				if (self.finishRefreshTorrentIntervalId !== null)
				{
					clearInterval(self.finishRefreshTorrentIntervalId);
					self.finishRefreshTorrentIntervalId = null;
				}
			}
		});
	};
};
