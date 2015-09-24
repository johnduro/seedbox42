
var http = require('http');

var testOptions = {
	// adress: '127.0.0.1',
	port: 9091,
	url: '/transmission/rpc'
};


function Transmission (options) {
	options = options || {};
	this.adress = options.adress || 'localhost';
	this.port = options.port || 9091;
	this.url = options.url || '/transmission/rpc';
	this.sessionId = '',
	this.postOptions = {
		host: this.adress,
		port: this.port,
		path: this.url,
		method: 'POST',
		headers: {}
	};
}
Transmission.prototype.makeStringJsonQuery = function (args, method) {
	var query = {
		"arguments": args,
		"method": method,
		"tag": 0 //a modifier
	};
	return (JSON.stringify(query));
};

Transmission.prototype.sendQuery = function (query, callback) {
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
			if (res.statusCode == 409)
			{
				self.sessionId = res.headers['x-transmission-session-id'];
				return self.sendQuery(query, callback);
			}

			var jsonData = JSON.parse(dataReceive);
			if (jsonData.result == 'success')
			{
				callback(null, jsonData.arguments);
			}
			else
			{
				callback(jsonData.result);
			}
		}

		res.on('end', onEnd);
		res.on('data', onData);
	});
	req.on('error', function (e) {
		console.log('ERROR !!');
		console.log(e);
	});
	req.write(query);
	req.end();
};

/*
torrentGet response on success and fields possibility
----------------------------+-----------------------------+
activityDate                | number                      |
addedDate                   | number                      |
bandwidthPriority           | number                      |
comment                     | string                      |
corruptEver                 | number                      |
creator                     | string                      |
dateCreated                 | number                      |
desiredAvailable            | number                      |
doneDate                    | number                      |
downloadDir                 | string                      |
downloadedEver              | number                      |
downloadLimit               | number                      |
downloadLimited             | boolean                     |
error                       | number                      |
errorString                 | string                      |
eta                         | number                      |
etaIdle                     | number                      |
files                       | array (see below)           |
fileStats                   | array (see below)           |
hashString                  | string                      |
haveUnchecked               | number                      |
haveValid                   | number                      |
honorsSessionLimits         | boolean                     |
id                          | number                      |
isFinished                  | boolean                     |
isPrivate                   | boolean                     |
isStalled                   | boolean                     |
leftUntilDone               | number                      |
magnetLink                  | string                      |
manualAnnounceTime          | number                      |
maxConnectedPeers           | number                      |
metadataPercentComplete     | double                      |
name                        | string                      |
peer-limit                  | number                      |
peers                       | array (see below)           |
peersConnected              | number                      |
peersFrom                   | object (see below)          |
peersGettingFromUs          | number                      |
peersSendingToUs            | number                      |
percentDone                 | double                      |
pieces                      | string (see below)          |
pieceCount                  | number                      |
pieceSize                   | number                      |
priorities                  | array (see below)           |
queuePosition               | number                      |
rateDownload (B/s)          | number                      |
rateUpload (B/s)            | number                      |
recheckProgress             | double                      |
secondsDownloading          | number                      |
secondsSeeding              | number                      |
seedIdleLimit               | number                      |
seedIdleMode                | number                      |
seedRatioLimit              | double                      |
seedRatioMode               | number                      |
sizeWhenDone                | number                      |
startDate                   | number                      |
status                      | number                      |
trackers                    | array (see below)           |
trackerStats                | array (see below)           |
totalSize                   | number                      |
torrentFile                 | string                      |
uploadedEver                | number                      |
uploadLimit                 | number                      |
uploadLimited               | boolean                     |
uploadRatio                 | double                      |
wanted                      | array (see below)           |
webseeds                    | array (see below)           |
webseedsSendingToUs         | number                      |
                            |                             |
                            |                             |
-------------------+--------+-----------------------------+
files              | array of objects, each containing:   |
                   +-------------------------+------------+
                   | bytesCompleted          | number     |
                   | length                  | number     |
                   | name                    | string     |
-------------------+--------------------------------------+
fileStats          | a file's non-constant properties.    |
                   | array of tr_info.filecount objects,  |
                   | each containing:                     |
                   +-------------------------+------------+
                   | bytesCompleted          | number     |
                   | wanted                  | boolean    |
                   | priority                | number     |
-------------------+--------------------------------------+
peers              | array of objects, each containing:   |
                   +-------------------------+------------+
                   | address                 | string     |
                   | clientName              | string     |
                   | clientIsChoked          | boolean    |
                   | clientIsInterested      | boolean    |
                   | flagStr                 | string     |
                   | isDownloadingFrom       | boolean    |
                   | isEncrypted             | boolean    |
                   | isIncoming              | boolean    |
                   | isUploadingTo           | boolean    |
                   | isUTP                   | boolean    |
                   | peerIsChoked            | boolean    |
                   | peerIsInterested        | boolean    |
                   | port                    | number     |
                   | progress                | double     |
                   | rateToClient (B/s)      | number     |
                   | rateToPeer (B/s)        | number     |
-------------------+--------------------------------------+
peersFrom          | an object containing:                |
                   +-------------------------+------------+
                   | fromCache               | number     |
                   | fromDht                 | number     |
                   | fromIncoming            | number     |
                   | fromLpd                 | number     |
                   | fromLtep                | number     |
                   | fromPex                 | number     |
                   | fromTracker             | number     |
-------------------+--------------------------------------+
pieces             | A bitfield holding pieceCount flags  |
                   | which are set to 'true' if we have   |
                   | the piece matching that position.    |
                   | JSON doesn't allow raw binary data,  |
                   | so this is a base64-encoded string.  |
-------------------+--------------------------------------+
priorities         | an array of tr_info.filecount        |
                   | numbers. each is the tr_priority_t   |
                   | mode for the corresponding file.     |
-------------------+--------------------------------------+
trackers           | array of objects, each containing:   |
                   +-------------------------+------------+
                   | announce                | string     |
                   | id                      | number     |
                   | scrape                  | string     |
                   | tier                    | number     |
-------------------+--------------------------------------+
trackerStats       | array of objects, each containing:   |
                   +-------------------------+------------+
                   | announce                | string     |
                   | announceState           | number     |
                   | downloadCount           | number     |
                   | hasAnnounced            | boolean    |
                   | hasScraped              | boolean    |
                   | host                    | string     |
                   | id                      | number     |
                   | isBackup                | boolean    |
                   | lastAnnouncePeerCount   | number     |
                   | lastAnnounceResult      | string     |
                   | lastAnnounceStartTime   | number     |
                   | lastAnnounceSucceeded   | boolean    |
                   | lastAnnounceTime        | number     |
                   | lastAnnounceTimedOut    | boolean    |
                   | lastScrapeResult        | string     |
                   | lastScrapeStartTime     | number     |
                   | lastScrapeSucceeded     | boolean    |
                   | lastScrapeTime          | number     |
                   | lastScrapeTimedOut      | boolean    |
                   | leecherCount            | number     |
                   | nextAnnounceTime        | number     |
                   | nextScrapeTime          | number     |
                   | scrape                  | string     |
                   | scrapeState             | number     |
                   | seederCount             | number     |
                   | tier                    | number     |
-------------------+-------------------------+------------+
wanted             | an array of tr_info.fileCount        |
                   | 'booleans' true if the corresponding |
                   | file is to be downloaded.            |
-------------------+--------------------------------------+
webseeds           | an array of strings:                 |
                   +-------------------------+------------+
                   | webseed                 | string     |
-------------------+-------------------------+------------+
*/
Transmission.prototype.torrentGet = function (fields, ids, callback) {
	var args = {"fieds" : fields};
	if (ids)
		args["ids"] = ids;
	var query = this.makeStringJsonQuery(args, "torrent-get");
	this.sendQuery(query, callback);
};


/*
sessionStats response on success :
---------------------------+--------------------------------
"activeTorrentCount"       | number
"downloadSpeed"            | number
"pausedTorrentCount"       | number
"torrentCount"             | number
"uploadSpeed"              | number
---------------------------+-------------------------------+
"cumulative-stats"         | object, containing:           |
                           +------------------+------------+
                           | uploadedBytes    | number     |
                           | downloadedBytes  | number     |
                           | filesAdded       | number     |
                           | sessionCount     | number     |
                           | secondsActive    | number     |
---------------------------+-------------------------------+
"current-stats"            | object, containing:           |
                           +------------------+------------+
                           | uploadedBytes    | number     |
                           | downloadedBytes  | number     |
                           | filesAdded       | number     |
                           | sessionCount     | number     |
                           | secondsActive    | number     |
---------------------------+--------------------------------
*/
Transmission.prototype.sessionStats = function (callback) {
	var query = this.makeStringJsonQuery({}, "session-stats");
	this.sendQuery(query, callback);
};


/*
freeSpace response on success :
------------+----------------------------------------------------------
"path"      | string  same as the Request argument
"size-bytes"| number  the size, in bytes, of the free space in that directory
------------+----------------------------------------------------------
*/
Transmission.prototype.freeSpace = function (path, callback) {
	var query = this.makeStringJsonQuery({"path": path}, "free-space");
	this.sendQuery(query, callback);
}

Transmission.prototype.getInfos = function () {
	console.log(this.adress + ' -- ' + this.port + ' -- ' + this.url);
};

/* ********************************************************************** */

var t = new Transmission ();


t.getInfos();

cb = function (err, res) {
	if (err)
	{
		console.log('ERROR : ', err);
	}
	else
	{
		console.log('SUCCESS !!!');
		console.log(res);
	}
};

t.sessionStats(cb);
t.freeSpace("/home/downloader/", cb);
