var express = require('express');
var WebTorrent = require('webtorrent');
var router = express.Router();

router.post('/', function(req, res, next) {
	var client = new WebTorrent();
	var magnet = req.body.magnet;
	client.add(magnet, function(torrent) {
		client.destroy()
	});
});

module.exports = router;
