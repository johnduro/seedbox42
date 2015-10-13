
// **********************************************
// OUTIL DE DEBUG -- NE PAS UTILISER DANS L'APPLI
// **********************************************


var http = require('http');


var Transmission = module.exports = function (options) {
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

Transmission.prototype.torrentGet = function (fields, ids, callback) {
	var args = {"fields" : fields};
	if (ids)
		args["ids"] = ids;
	var query = this.makeStringJsonQuery(args, "torrent-get");
	this.sendQuery(query, callback);
};


Transmission.prototype.torrentRemove = function (ids, deleteLocalData, callback) {
	var args = {'delete-local-data': deleteLocalData};
	if (ids)
		args['ids'] = ids;
	var query = this.makeStringJsonQuery(args, "torrent-remove");
	this.sendQuery(query, callback);
};

Transmission.prototype.sessionStats = function (callback) {
	var query = this.makeStringJsonQuery({}, "session-stats");
	this.sendQuery(query, callback);
};

Transmission.prototype.sessionGet = function (callback) {
	var query = this.makeStringJsonQuery({}, "session-get");
	this.sendQuery(query, callback);
};

var t = new Transmission ();


var cb = function (err, res) {
	if (err)
	{
		console.log('ERROR : ', err);
	}
	else
	{
		console.log('SUCCESS !!!');
		console.log(res);
		console.log('**************************************');
	}
};

t.torrentGet(["id", "error", "errorString", "eta", "isFinished", "isStalled", "leftUntilDone", "metadataPercentComplete", "peersConnected", "peersGettingFromUs", "peersSendingToUs", "percentDone", "queuePosition", "rateDownload", "rateUpload", "recheckProgress", "seedRatioMode", "seedRatioLimit", "sizeWhenDone", "status", "trackers", "downloadDir", "uploadedEver", "uploadRatio", "Webseedssendingtous", "name"], 'recently-active', cb);
// t.torrentGet(["id", "name", "eta", "isFinished", "isStalled", "leftUntilDone", "metadataPercentComplete", "percentDone", "rateDownload", "sizeWhenDone", "status"], "recently-active", cb);
// console.log("*************************************************************");
// t.torrentGet(["id", "name", "eta", "isFinished", "isStalled", "leftUntilDone", "metadataPercentComplete", "percentDone", "rateDownload", "sizeWhenDone", "status"], {}, cb);
t.torrentGet(["hashString", "downloadDir", "totalSize"], 40, cb);
// t.torrentGet(['downloadDir', 'name', 'totalSize', 'torrentFile', 'creator'], {}, cb);

// t.torrentGet(["id", "error", "errorString", "eta", "isFinished", "isStalled", "leftUntilDone", "metadataPercentComplete", "peersConnected", "peersGettingFromUs", "peersSendingToUs", "percentDone", "queuePosition", "rateDownload", "rateUpload", "recheckProgress", "seedRatioMode", "seedRatioLimit", "sizeWhenDone", "status", "trackers", "downloadDir", "uploadedEver", "uploadRatio", "Webseedssendingtous"], {}, cb);

// t.torrentGet(['id', 'hashString',  'name'], {}, cb);
// console.log('****************************************');
// t.torrentGet(['name'], 'bfcf6f5505a1c9e962bb5c3f0b6d66a841dda51e', cb);

// t.torrentGet(['uploadRatio', 'id', 'addedDate', 'isFinished', 'leftUntilDone', 'name', 'rateDownload', 'rateUpload', 'files', 'queuePosition', 'downloadDir', 'percentDone', 'status'], {}, cb);
// t.torrentRemove(2, false, cb);
// t.sessionStats(cb);
// t.sessionGet(cb);
