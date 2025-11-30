import File from "../models/File.js";
import format from "../utils/format.js";

class TorrentSockets {
	constructor(io, transmission, app) {
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

		this.app.on('torrents:clearFinishedTorrents', () => {
			this.finishedTorrents = [];
		});
	}


	/**
	 * Socket - Emit - torrentRefreshRes
	 * Mets a jour le tableau finishedTorrents si il y a des torrents fini et met a jour la DB
	 * Ajout en db le nouveau fichier telecharger et fini
	 * Envois un event a tout les utilisateurs avec les nouvelles donnees des torrents actifs
	 */
	async finishRefreshTorrent() {
		try {
			const res = await this.transmission.torrentGet(this.checkFinished, "recently-active");
			res["torrents"].forEach(async (torrent) => {
				if (this.finishedTorrents.indexOf(torrent['name']) < 0) {
					if (torrent['leftUntilDone'] === 0 && torrent["percentDone"] === 1.0) {
						this.finishedTorrents.push(torrent["name"]);
						const newFile = await File.insertTorrent(torrent.id, torrent.name, this.transmission);
						if (newFile != null) {
							this.io.sockets.emit("newFile", { name: torrent.name, data: newFile });
						}
					}
				}
			});
		} catch (err) {
			clearInterval(this.finishRefreshTorrentIntervalId);
			this.finishRefreshTorrentIntervalId = null;
			console.error('Error in finishRefreshTorrent:', err);
		}
	}

	/**
	 * Socket - Emit - torrentRefreshRes
	 * Permet d'envoyer un event a tous les utilisateurs avec les nouvelles donnees des torrents actifs
	 */

	async refreshTorrent() {
		try {
			const res = await this.transmission.torrentGet(this.refreshActive, "recently-active");
			if (res.removed.length > 0 || res.torrents.length > 0) {
				this.io.sockets.emit('torrentRefreshRes', res);
			}
		} catch (err) {
			this.io.sockets.emit('torrentErrorRefresh', { error: err });
		}
	}

	async newConnection(socket) {
		if (this.io.engine.clientsCount === 1) {
			this.finishRefreshTorrentIntervalId = setInterval(() => this.finishRefreshTorrent(), this.second);
		}

		socket.on('torrentRefresh', async () => {
			this.torrentRefreshCounter++;

			if (this.torrentRefreshCounter === 1) {
				this.torrentRefreshIntervalId = setInterval(() => this.refreshTorrent(), this.second);
			}
		});

		socket.on('torrentStopRefresh', () => {
			this.torrentRefreshCounter--;

			if (this.torrentRefreshCounter <= 0) {
				clearInterval(this.torrentRefreshIntervalId);
				this.torrentRefreshIntervalId = null;
			}
		});

		/**
		 * Socket - On - Event
		 * Permet de supprimer un torrent via une url
		 * @param {removeLocalData: true/false, id:idTorrent}
		 * Retroune un event 'post:torrent:url' true ou false
		 */
		socket.on('delete:torrent', async (data) => {
			console.log('+++>>> SOCKET : delete:torrent');
			var removeLocalData = data.removeLocalData;
			var ids = format.torrentsIds(data.ids);

			try {
				const respGet = await this.transmission.torrentGet(['hashString', 'name'], ids);
				await this.transmission.torrentRemove(ids, removeLocalData);
				this.io.sockets.emit('delete:torrent', { success: true, ids: ids, message: 'Torrent removed' });
				if (respGet.torrents.length > 0) {
					if (removeLocalData) {
						const toFind = respGet.torrents.map(torrent => torrent.hashString);
						const files = await File.find({ hashString: { $in: toFind } });
						for (const file of files) {
							await file.deleteFile(this.transmission);
						}
					}
					for (const torrent of respGet.torrents) {
						const index = this.finishedTorrents.indexOf(torrent.name);
						if (index > -1) {
							this.finishedTorrents.splice(index, 1);
						}
					}
				}
			} catch (err) {
				socket.emit('delete:torrent', { success: false, message: 'Could not remove torrent', error: err });
			}
		});


		/**
		 * Socket - On - Event
		 * Permet d'ajouter un torrent via une url
		 * Retourne un event 'post:torrent:url' true ou false
		 */
		socket.on('post:torrent:url', async (data) => {
			console.log('+++>>> SOCKET : post:torrent:url');
			try {
				const resp = await this.transmission.torrentAdd({ filename: data.url });
				if ('torrent-duplicate' in resp) {
					socket.emit('post:torrent', { success: false, message: 'duplicate, torrent already present' });
				} else if ('torrent-added' in resp) {
					const file = await File.createFile(resp['torrent-added'], data.id);
					this.io.sockets.emit('post:torrent', { success: true, message: 'torrent successfully added', id: resp['torrent-added'].id, name: file.name });
				} else {
					socket.emit('post:torrent', { success: false, message: 'unexpected error' });
				}
			} catch (err) {
				socket.emit('post:torrent:url', { success: false, message: 'torrent not added, wrong url', error: err });
			}
		});

		socket.on('disconnect', () => {
			if (this.io.engine.clientsCount === 0) {
				clearInterval(this.finishRefreshTorrentIntervalId);
				this.finishRefreshTorrentIntervalId = null;
				clearInterval(this.torrentRefreshIntervalId);
				this.torrentRefreshIntervalId = null;
				this.torrentRefreshCounter = 0;
			}
		});
	};
}

export default TorrentSockets;