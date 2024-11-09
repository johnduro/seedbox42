/**
** TRANSMISSION NODE
** Module used to connect a nodejs server to transmission's API
** RPC version 15 release 2.80
**
** Followings methods are implemented :
** 		- torrentActionRequest (method, ids, callback)
** 		- torrentSet (args, ids, callback)
** 		- torrentGet (fields, ids, callback)
** 		- torrentAdd (args, callback)
** 		- torrentRemove (ids, deleteLocalData, callback)
** 		- torrentSetLocation (ids, location, move, callback)
** 		- torrentRenamePath (ids, path, name, callback)
** 		- sessionSet (args, callback)
** 		- sessionGet (callback)
** 		- sessionStats (callback)
** 		- blocklistUpdate (callback)
** 		- portTest (callback)
** 		- sessionClose (callback)
** 		- queueMovementRequest (method, ids, callback)
** 		- freeSpace (path, callback)
**
** Implementation fo these functions are more detailled in commentary above them
**/


import http from 'http';

class Transmission {
	constructor(config = {}) {
		this.address = config.address || 'localhost';
		this.port = config.port || 9091;
		this.url = config.url || '/transmission/rpc';
		this.sessionId = '',
		this.postOptions = {
			host: this.address,
			port: this.port,
			path: this.url,
			method: 'POST',
			headers: {}
		};
	}
}

Transmission.prototype.makeStringJsonQuery = function (args, method) {
	var query = {
		"arguments": args,
		"method": method,
		"tag": 0 //a modifier
	};
	return (JSON.stringify(query));
};

Transmission.prototype.sendQuery = function (query) {
	return new Promise((resolve, reject) => {
		var self = this;
		var postOpt = this.postOptions;

		postOpt.headers = {
			'Content-Type': 'application/json',
			'X-Transmission-Session-Id': this.sessionId || '',
			'Content-Length': Buffer.byteLength(query, 'utf8')
		};

		var req = http.request(postOpt, function (res) {
			var dataReceive = '';

			function onData(chunk) {
				dataReceive += chunk;
			}

			function onEnd() {
				if (res.statusCode == 409) {
					self.sessionId = res.headers['x-transmission-session-id'];
					return self.sendQuery(query).then(resolve).catch(reject);
				}

				try {
					var jsonData = JSON.parse(dataReceive);
					if (jsonData.result == 'success') {
						resolve(jsonData.arguments);
					} else {
						reject(new Error(jsonData.result));
					}
				} catch (err) {
					reject(err);
				}
			}

			res.on('data', onData);
			res.on('end', onEnd);
		});

		req.on('error', (err) => {
			reject(err);
		});

		req.write(query);
		req.end();
	});
};

/**
 * torrentActionRequest method possibility (response argument: none) :
 * ---------------------+
 * "torrent-start"      |
 * "torrent-start-now"  |
 * "torrent-stop"       |
 * "torrent-verify"     |
 * "torrent-reannounce" | // ("ask trackers for more peers")
 * ---------------------+
 */
Transmission.prototype.torrentActionRequest = function (method, ids) {
	return new Promise((resolve, reject) => {
		const validMethods = [
			"torrent-start",
			"torrent-start-now",
			"torrent-stop",
			"torrent-verify",
			"torrent-reannounce"
		];

		if (!validMethods.includes(method)) {
			return reject(new Error("Invalid method"));
		}

		const args = { ids: ids };
		const query = this.makeStringJsonQuery(args, method);
		this.sendQuery(query)
			.then(resolve)
			.catch(reject);
	});
};
  


/**
 * torrentSet request arguments :
 * ----------------------+-------------------------------------------------
 * "bandwidthPriority"   | number     this torrent's bandwidth tr_priority_t
 * "downloadLimit"       | number     maximum download speed (KBps)
 * "downloadLimited"     | boolean    true if "downloadLimit" is honored
 * "files-wanted"        | array      indices of file(s) to download
 * "files-unwanted"      | array      indices of file(s) to not download
 * "honorsSessionLimits" | boolean    true if session upload limits are honored
 * "ids"                 | array      torrent list, as described in 3.1
 * "location"            | string     new location of the torrent's content
 * "peer-limit"          | number     maximum number of peers
 * "priority-high"       | array      indices of high-priority file(s)
 * "priority-low"        | array      indices of low-priority file(s)
 * "priority-normal"     | array      indices of normal-priority file(s)
 * "queuePosition"       | number     position of this torrent in its queue [0...n)
 * "seedIdleLimit"       | number     torrent-level number of minutes of seeding inactivity
 * "seedIdleMode"        | number     which seeding inactivity to use.  See tr_idlelimit
 * "seedRatioLimit"      | double     torrent-level seeding ratio
 * "seedRatioMode"       | number     which ratio to use.  See tr_ratiolimit
 * "trackerAdd"          | array      strings of announce URLs to add
 * "trackerRemove"       | array      ids of trackers to remove
 * "trackerReplace"      | array      pairs of <trackerId/new announce URLs>
 * "uploadLimit"         | number     maximum upload speed (KBps)
 * "uploadLimited"       | boolean    true if "uploadLimit" is honored
 * ----------------------+-------------------------------------------------
 * using an empty array for "files-wanted", "files-unwanted", "priority-high",
 * "priority-low", or "priority-normal" is shorthand for saying "all files"
 */
// Not used
Transmission.prototype.torrentSet = function (args, ids, callback) {
	//check si args est bien un {}
	if (ids)
		args['ids'] = ids;
	var query = this.makeStringJsonQuery(args, "torrent-set");
	this.sendQuery(query, callback);
};


/**
 * torrentGet response on success and fields possibility :
 * ----------------------------+-----------------------------+
 * activityDate                | number                      |
 * addedDate                   | number                      |
 * bandwidthPriority           | number                      |
 * comment                     | string                      |
 * corruptEver                 | number                      |
 * creator                     | string                      |
 * dateCreated                 | number                      |
 * desiredAvailable            | number                      |
 * doneDate                    | number                      |
 * downloadDir                 | string                      |
 * downloadedEver              | number                      |
 * downloadLimit               | number                      |
 * downloadLimited             | boolean                     |
 * error                       | number                      |
 * errorString                 | string                      |
 * eta                         | number                      |
 * etaIdle                     | number                      |
 * files                       | array (see below)           |
 * fileStats                   | array (see below)           |
 * hashString                  | string                      |
 * haveUnchecked               | number                      |
 * haveValid                   | number                      |
 * honorsSessionLimits         | boolean                     |
 * id                          | number                      |
 * isFinished                  | boolean                     |
 * isPrivate                   | boolean                     |
 * isStalled                   | boolean                     |
 * leftUntilDone               | number                      |
 * magnetLink                  | string                      |
 * manualAnnounceTime          | number                      |
 * maxConnectedPeers           | number                      |
 * metadataPercentComplete     | double                      |
 * name                        | string                      |
 * peer-limit                  | number                      |
 * peers                       | array (see below)           |
 * peersConnected              | number                      |
 * peersFrom                   | object (see below)          |
 * peersGettingFromUs          | number                      |
 * peersSendingToUs            | number                      |
 * percentDone                 | double                      |
 * pieces                      | string (see below)          |
 * pieceCount                  | number                      |
 * pieceSize                   | number                      |
 * priorities                  | array (see below)           |
 * queuePosition               | number                      |
 * rateDownload (B/s)          | number                      |
 * rateUpload (B/s)            | number                      |
 * recheckProgress             | double                      |
 * secondsDownloading          | number                      |
 * secondsSeeding              | number                      |
 * seedIdleLimit               | number                      |
 * seedIdleMode                | number                      |
 * seedRatioLimit              | double                      |
 * seedRatioMode               | number                      |
 * sizeWhenDone                | number                      |
 * startDate                   | number                      |
 * status                      | number                      |
 * trackers                    | array (see below)           |
 * trackerStats                | array (see below)           |
 * totalSize                   | number                      |
 * torrentFile                 | string                      |
 * uploadedEver                | number                      |
 * uploadLimit                 | number                      |
 * uploadLimited               | boolean                     |
 * uploadRatio                 | double                      |
 * wanted                      | array (see below)           |
 * webseeds                    | array (see below)           |
 * webseedsSendingToUs         | number                      |
 *                             |                             |
 *                             |                             |
 * -------------------+--------+-----------------------------+
 * files              | array of objects, each containing:   |
 *                    +-------------------------+------------+
 *                    | bytesCompleted          | number     |
 *                    | length                  | number     |
 *                    | name                    | string     |
 * -------------------+--------------------------------------+
 * fileStats          | a file's non-constant properties.    |
 *                    | array of tr_info.filecount objects,  |
 *                    | each containing:                     |
 *                    +-------------------------+------------+
 *                    | bytesCompleted          | number     |
 *                    | wanted                  | boolean    |
 *                    | priority                | number     |
 * -------------------+--------------------------------------+
 * peers              | array of objects, each containing:   |
 *                    +-------------------------+------------+
 *                    | address                 | string     |
 *                    | clientName              | string     |
 *                    | clientIsChoked          | boolean    |
 *                    | clientIsInterested      | boolean    |
 *                    | flagStr                 | string     |
 *                    | isDownloadingFrom       | boolean    |
 *                    | isEncrypted             | boolean    |
 *                    | isIncoming              | boolean    |
 *                    | isUploadingTo           | boolean    |
 *                    | isUTP                   | boolean    |
 *                    | peerIsChoked            | boolean    |
 *                    | peerIsInterested        | boolean    |
 *                    | port                    | number     |
 *                    | progress                | double     |
 *                    | rateToClient (B/s)      | number     |
 *                    | rateToPeer (B/s)        | number     |
 * -------------------+--------------------------------------+
 * peersFrom          | an object containing:                |
 *                    +-------------------------+------------+
 *                    | fromCache               | number     |
 *                    | fromDht                 | number     |
 *                    | fromIncoming            | number     |
 *                    | fromLpd                 | number     |
 *                    | fromLtep                | number     |
 *                    | fromPex                 | number     |
 *                    | fromTracker             | number     |
 * -------------------+--------------------------------------+
 * pieces             | A bitfield holding pieceCount flags  |
 *                    | which are set to 'true' if we have   |
 *                    | the piece matching that position.    |
 *                    | JSON doesn't allow raw binary data,  |
 *                    | so this is a base64-encoded string.  |
 * -------------------+--------------------------------------+
 * priorities         | an array of tr_info.filecount        |
 *                    | numbers. each is the tr_priority_t   |
 *                    | mode for the corresponding file.     |
 * -------------------+--------------------------------------+
 * trackers           | array of objects, each containing:   |
 *                    +-------------------------+------------+
 *                    | announce                | string     |
 *                    | id                      | number     |
 *                    | scrape                  | string     |
 *                    | tier                    | number     |
 * -------------------+--------------------------------------+
 * trackerStats       | array of objects, each containing:   |
 *                    +-------------------------+------------+
 *                    | announce                | string     |
 *                    | announceState           | number     |
 *                    | downloadCount           | number     |
 *                    | hasAnnounced            | boolean    |
 *                    | hasScraped              | boolean    |
 *                    | host                    | string     |
 *                    | id                      | number     |
 *                    | isBackup                | boolean    |
 *                    | lastAnnouncePeerCount   | number     |
 *                    | lastAnnounceResult      | string     |
 *                    | lastAnnounceStartTime   | number     |
 *                    | lastAnnounceSucceeded   | boolean    |
 *                    | lastAnnounceTime        | number     |
 *                    | lastAnnounceTimedOut    | boolean    |
 *                    | lastScrapeResult        | string     |
 *                    | lastScrapeStartTime     | number     |
 *                    | lastScrapeSucceeded     | boolean    |
 *                    | lastScrapeTime          | number     |
 *                    | lastScrapeTimedOut      | boolean    |
 *                    | leecherCount            | number     |
 *                    | nextAnnounceTime        | number     |
 *                    | nextScrapeTime          | number     |
 *                    | scrape                  | string     |
 *                    | scrapeState             | number     |
 *                    | seederCount             | number     |
 *                    | tier                    | number     |
 * -------------------+-------------------------+------------+
 * wanted             | an array of tr_info.fileCount        |
 *                    | 'booleans' true if the corresponding |
 *                    | file is to be downloaded.            |
 * -------------------+--------------------------------------+
 * webseeds           | an array of strings:                 |
 *                    +-------------------------+------------+
 *                    | webseed                 | string     |
 * -------------------+-------------------------+------------+
 */
Transmission.prototype.torrentGet = function (fields, ids) {
	return new Promise((resolve, reject) => {
		var args = { "fields": fields };
		if (ids) args["ids"] = ids;
		var query = this.makeStringJsonQuery(args, "torrent-get");
		this.sendQuery(query)
			.then(resolve)
			.catch(reject);
	});
};

/**
 * torrentAdd request arguments :
 * ---------------------+-------------------------------------------------
 * "cookies"            | string      pointer to a string of one or more cookies.
 * "download-dir"       | string      path to download the torrent to
 * "filename"           | string      filename or URL of the .torrent file
 * "metainfo"           | string      base64-encoded .torrent content
 * "paused"             | boolean     if true, don't start the torrent
 * "peer-limit"         | number      maximum number of peers
 * "bandwidthPriority"  | number      torrent's bandwidth tr_priority_t
 * "files-wanted"       | array       indices of file(s) to download
 * "files-unwanted"     | array       indices of file(s) to not download
 * "priority-high"      | array       indices of high-priority file(s)
 * "priority-low"       | array       indices of low-priority file(s)
 * "priority-normal"    | array       indices of normal-priority file(s)
 * ---------------------+-------------------------------------------------
 * Either "filename" OR "metainfo" MUST be included. All other arguments are optional.
 */
Transmission.prototype.torrentAdd = function (args) {
	return new Promise((resolve, reject) => {
		if (args['filename'] === null && args['metainfo'] === null) {
			return reject(new Error("Missing argument for torrentAdd, 'filename' or 'metainfo' is needed"));
		}

		const query = this.makeStringJsonQuery(args, "torrent-add");
		this.sendQuery(query)
			.then(resolve)
			.catch(reject);
	});
};


/**
 * torrentRemove request arguments :
 * ---------------------------+-------------------------------------------------
 * "ids"                      | array      torrent list, as described in 3.1
 * "delete-local-data"        | boolean    delete local data. (default: false)
 * ---------------------------+-------------------------------------------------
 */
Transmission.prototype.torrentRemove = function (ids, deleteLocalData) {
	return new Promise((resolve, reject) => {
	  const args = { 'delete-local-data': deleteLocalData };
	  if (ids) args['ids'] = ids;
	  const query = this.makeStringJsonQuery(args, "torrent-remove");
	  this.sendQuery(query)
		.then(resolve)
		.catch(reject);
	});
  };


/**
 * torrentSetLocation request arguments :
 * ---------------------------------+-------------------------------------------------
 * "ids"                            | array      torrent list, as described in 3.1
 * "location"                       | string     the new torrent location
 * "move"                           | boolean    if true, move from previous location.
 *                                  |            otherwise, search "location" for files
 *                                  |            (default: false)
 * ---------------------------------+-------------------------------------------------
 */
// Not used
Transmission.prototype.torrentSetLocation = function (ids, location, move, callback) {
	var args = {
		'location': location,
		'move': false
	};
	if (ids)
		args['ids'] = ids;
	if (move == true)
		args['move'] = true;
	var query = this.makeStringJsonQuery(args, "torrent-set-location");
	this.sendQuery(query, callback);
};


/**
 * torrentRenamePath request arguments :
 * ---------------------------------+-------------------------------------------------
 * "ids"                            | array      the torrent torrent list, as described in 3.1
 *                                  |            (must only be 1 torrent)
 * "path"                           | string     the path to the file or folder that will be renamed
 * "name"                           | string     the file or folder's new name
 * ---------------------------------+-------------------------------------------------
 * Response arguments: "path", "name", and "id", holding the torrent ID integer
 * path is the current name of the file and name is the new name
 */
Transmission.prototype.torrentRenamePath = function (id, path, name) {
	return new Promise((resolve, reject) => {
		const args = {
			ids: [id],
			path: path,
			name: name
		};
		const query = this.makeStringJsonQuery(args, "torrent-rename-path");
		this.sendQuery(query)
			.then(resolve)
			.catch(reject);
	});
};


/**
 * SESSION ARGUMENTS :
 * ---------------------------------+------------+-------------------------------------
 * "alt-speed-down"                 | number     | max global download speed (KBps)
 * "alt-speed-enabled"              | boolean    | true means use the alt speeds
 * "alt-speed-time-begin"           | number     | when to turn on alt speeds (units: minutes after midnight)
 * "alt-speed-time-enabled"         | boolean    | true means the scheduled on/off times are used
 * "alt-speed-time-end"             | number     | when to turn off alt speeds (units: same)
 * "alt-speed-time-day"             | number     | what day(s) to turn on alt speeds (look at tr_sched_day)
 * "alt-speed-up"                   | number     | max global upload speed (KBps)
 * "blocklist-url"                  | string     | location of the blocklist to use for "blocklist-update"
 * "blocklist-enabled"              | boolean    | true means enabled
 * "blocklist-size"                 | number     | number of rules in the blocklist
 * "cache-size-mb"                  | number     | maximum size of the disk cache (MB)
 * "config-dir"                     | string     | location of transmission's configuration directory
 * "download-dir"                   | string     | default path to download torrents
 * "download-queue-size"            | number     | max number of torrents to download at once (see download-queue-enabled)
 * "download-queue-enabled"         | boolean    | if true, limit how many torrents can be downloaded at once
 * "dht-enabled"                    | boolean    | true means allow dht in public torrents
 * "encryption"                     | string     | "required", "preferred", "tolerated"
 * "idle-seeding-limit"             | number     | torrents we're seeding will be stopped if they're idle for this long
 * "idle-seeding-limit-enabled"     | boolean    | true if the seeding inactivity limit is honored by default
 * "incomplete-dir"                 | string     | path for incomplete torrents, when enabled
 * "incomplete-dir-enabled"         | boolean    | true means keep torrents in incomplete-dir until done
 * "lpd-enabled"                    | boolean    | true means allow Local Peer Discovery in public torrents
 * "peer-limit-global"              | number     | maximum global number of peers
 * "peer-limit-per-torrent"         | number     | maximum global number of peers
 * "pex-enabled"                    | boolean    | true means allow pex in public torrents
 * "peer-port"                      | number     | port number
 * "peer-port-random-on-start"      | boolean    | true means pick a random peer port on launch
 * "port-forwarding-enabled"        | boolean    | true means enabled
 * "queue-stalled-enabled"          | boolean    | whether or not to consider idle torrents as stalled
 * "queue-stalled-minutes"          | number     | torrents that are idle for N minuets aren't counted toward seed-queue-size or download-queue-size
 * "rename-partial-files"           | boolean    | true means append ".part" to incomplete files
 * "rpc-version"                    | number     | the current RPC API version
 * "rpc-version-minimum"            | number     | the minimum RPC API version supported
 * "script-torrent-done-filename"   | string     | filename of the script to run
 * "script-torrent-done-enabled"    | boolean    | whether or not to call the "done" script
 * "seedRatioLimit"                 | double     | the default seed ratio for torrents to use
 * "seedRatioLimited"               | boolean    | true if seedRatioLimit is honored by default
 * "seed-queue-size"                | number     | max number of torrents to uploaded at once (see seed-queue-enabled)
 * "seed-queue-enabled"             | boolean    | if true, limit how many torrents can be uploaded at once
 * "speed-limit-down"               | number     | max global download speed (KBps)
 * "speed-limit-down-enabled"       | boolean    | true means enabled
 * "speed-limit-up"                 | number     | max global upload speed (KBps)
 * "speed-limit-up-enabled"         | boolean    | true means enabled
 * "start-added-torrents"           | boolean    | true means added torrents will be started right away
 * "trash-original-torrent-files"   | boolean    | true means the .torrent file of added torrents will be deleted
 * "units"                          | object     | see below
 * "utp-enabled"                    | boolean    | true means allow utp
 * "version"                        | string     | long version string "$version ($revision)"
 * ---------------------------------+------------+-----------------------------+
 * units                            | object containing:                       |
 *                                  +--------------+--------+------------------+
 *                                  | speed-units  | array  | 4 strings: KB/s, MB/s, GB/s, TB/s
 *                                  | speed-bytes  | number | number of bytes in a KB (1000 for kB; 1024 for KiB)
 *                                  | size-units   | array  | 4 strings: KB/s, MB/s, GB/s, TB/s
 *                                  | size-bytes   | number | number of bytes in a KB (1000 for kB; 1024 for KiB)
 *                                  | memory-units | array  | 4 strings: KB/s, MB/s, GB/s, TB/s
 *                                  | memory-bytes | number | number of bytes in a KB (1000 for kB; 1024 for KiB)
 * ---------------------------------+--------------+--------+------------------+
 */

/**
 * sessionSet request arguments :
 * one or more of session arguments, except: "blocklist-size", "config-dir",
 * "rpc-version", "rpc-version-minimum", and "version"
 */
Transmission.prototype.sessionSet = function (args, callback) {
	var query = this.makeStringJsonQuery(args, "session-set");
	this.sendQuery(query, callback);
};

/**
 * sessionGet response arguments :
 * all of session arguments
 */
Transmission.prototype.sessionGet = function () {
	return new Promise((resolve, reject) => {
	  const query = this.makeStringJsonQuery({}, "session-get");
	  this.sendQuery(query)
		.then(resolve)
		.catch(reject);
	});
  };

/**
 * sessionStats response on success :
 * ---------------------------+--------------------------------
 * "activeTorrentCount"       | number
 * "downloadSpeed"            | number
 * "pausedTorrentCount"       | number
 * "torrentCount"             | number
 * "uploadSpeed"              | number
 * ---------------------------+-------------------------------+
 * "cumulative-stats"         | object, containing:           |
 *                            +------------------+------------+
 *                            | uploadedBytes    | number     |
 *                            | downloadedBytes  | number     |
 *                            | filesAdded       | number     |
 *                            | sessionCount     | number     |
 *                            | secondsActive    | number     |
 * ---------------------------+-------------------------------+
 * "current-stats"            | object, containing:           |
 *                            +------------------+------------+
 *                            | uploadedBytes    | number     |
 *                            | downloadedBytes  | number     |
 *                            | filesAdded       | number     |
 *                            | sessionCount     | number     |
 *                            | secondsActive    | number     |
 * ---------------------------+--------------------------------
 */
Transmission.prototype.sessionStats = function () {
	return new Promise((resolve, reject) => {
	  const query = this.makeStringJsonQuery({}, "session-stats");
	  this.sendQuery(query)
		.then(resolve)
		.catch(reject);
	});
  };


/**
 * blocklistUpdate response :
 * a number "blocklist-size"
 */
Transmission.prototype.blocklistUpdate = function () {
	return new Promise((resolve, reject) => {
	  const query = this.makeStringJsonQuery({}, "blocklist-update");
	  this.sendQuery(query)
		.then(resolve)
		.catch(reject);
	});
  };


/**
 * portTest response :
 * a bool, "port-is-open"
 */
Transmission.prototype.portTest = function () {
	return new Promise((resolve, reject) => {
	  const query = this.makeStringJsonQuery({}, "port-test");
	  this.sendQuery(query)
		.then(resolve)
		.catch(reject);
	});
  };


/**
 * sessionClose :
 */
/* Transmission.prototype.sessionClose = function (callback) {
	var query = this.makeStringJsonQuery({}, "session-close");
	this.sendQuery(query, callback);
}; */
Transmission.prototype.sessionClose = function () {
	return new Promise((resolve, reject) => {
	  const query = this.makeStringJsonQuery({}, "session-close");
	  this.sendQuery(query)
		.then(resolve)
		.catch(reject);
	});
  };


/**
 * queueMovementRequest method possibility :
 * ---------------------+
 * "queue-move-top"     |
 * "queue-move-up"      |
 * "queue-move-down"    |
 * "queue-move-bottom"  |
 * ---------------------+
 */
Transmission.prototype.queueMovementRequest = function (method, ids) {
	return new Promise((resolve, reject) => {
		const validMethods = [
			"queue-move-up",
			"queue-move-down",
			"queue-move-top",
			"queue-move-bottom"
		];

		if (!validMethods.includes(method)) {
			return reject(new Error("Invalid method"));
		}

		const args = { ids: ids };
		const query = this.makeStringJsonQuery(args, method);
		this.sendQuery(query)
			.then(resolve)
			.catch(reject);
	});
};


/**
 * freeSpace response on success :
 * ------------+----------------------------------------------------------
 * "path"      | string  same as the Request argument
 * "size-bytes"| number  the size, in bytes, of the free space in that directory
 * ------------+----------------------------------------------------------
 */
// Not used
Transmission.prototype.freeSpace = function (path, callback) {
	var query = this.makeStringJsonQuery({"path": path}, "free-space");
	this.sendQuery(query, callback);
}


/**
 * Torrent status array :
 */
Transmission.prototype.statusArray = ['STOPPED', 'CHECK_WAIT', 'CHECK', 'DOWNLOAD_WAIT', 'DOWNLOAD', 'SEED_WAIT', 'SEED'];


/**
 * Transmission request format :
 */

Transmission.prototype.requestFormat = {
	infosFinished: ["hashString", "downloadDir", "totalSize", "isFinished"],
	checkFinished: ["id", "status", "leftUntilDone", "percentDone", "name", "doneDate"],
	refreshActive: ["id", "error", "errorString", "eta", "isFinished", "isStalled", "leftUntilDone", "metadataPercentComplete", "peersConnected", "peersGettingFromUs", "peersSendingToUs", "percentDone", "queuePosition", "rateDownload", "rateUpload", "recheckProgress", "seedRatioMode", "seedRatioLimit", "sizeWhenDone", "status", "trackers", "downloadDir", "uploadedEver", "uploadRatio", "Webseedssendingtous"],
	refreshAll: ["id", "addedDate", "name", "totalSize",  "error", "errorString", "eta", "isFinished", "isStalled", "leftUntilDone", "metadataPercentComplete", "peersConnected", "peersGettingFromUs", "peersSendingToUs", "percentDone", "queuePosition", "rateDownload", "rateUpload", "recheckProgress", "seedRatioMode", "seedRatioLimit", "sizeWhenDone", "status", "trackers", "downloadDir", "uploadedEver", "uploadRatio", "Webseedssendingtous"],
	allTorrents: ['uploadRatio', 'id', 'addedDate', 'isFinished', 'leftUntilDone', 'name', 'rateDownload', 'rateUpload', 'queuePosition', 'downloadDir', 'eta', 'peerConnected', 'percentDone', 'startDate', 'status', 'totalSize', 'torrentFile']
};

export default Transmission;