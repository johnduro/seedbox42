module.exports = WebConn

var BitField = require('bitfield')
var debug = require('debug')('bittorrent-swarm:webconn')
var get = require('simple-get')
var inherits = require('inherits')
var Wire = require('bittorrent-protocol')

inherits(WebConn, Wire)

/**
 * Converts requests for torrent blocks into http range requests.
 * @param {string} url web seed url
 * @param {Object} parsedTorrent
 */
function WebConn (url, parsedTorrent) {
  var self = this
  Wire.call(this)

  self.url = url
  self.parsedTorrent = parsedTorrent

  self.setKeepAlive(true)

  self.on('handshake', function (infoHash, peerId) {
    self.handshake(infoHash, new Buffer(20).fill(url))
    var numPieces = self.parsedTorrent.pieces.length
    var bitfield = new BitField(numPieces)
    for (var i = 0; i <= numPieces; i++) {
      bitfield.set(i, true)
    }
    self.bitfield(bitfield)
  })

  self.on('choke', function () { debug('choke') })
  self.on('unchoke', function () { debug('unchoke') })

  self.once('interested', function () {
    debug('interested')
    self.unchoke()
  })
  self.on('uninterested', function () { debug('uninterested') })

  self.on('bitfield', function () { debug('bitfield') })

  self.on('request', function (pieceIndex, offset, length, callback) {
    debug('request pieceIndex=%d offset=%d length=%d', pieceIndex, offset, length)
    self.httpRequest(pieceIndex, offset, length, callback)
  })
}

WebConn.prototype.httpRequest = function (pieceIndex, offset, length, cb) {
  var self = this
  var pieceOffset = pieceIndex * self.parsedTorrent.pieceLength
  var start = pieceOffset + offset
  var end = start + length - 1

  debug('Requesting pieceIndex=%d offset=%d length=%d start=%d end=%d', pieceIndex, offset, length, start, end)

  var opts = {
    url: self.url,
    method: 'GET',
    headers: {
      'user-agent': 'WebTorrent (http://webtorrent.io)',
      'range': 'bytes=' + start + '-' + end
    }
  }

  get.concat(opts, function (err, data, res) {
    if (err) return cb(err)
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return cb(new Error('Unexpected HTTP status code ' + res.statusCode))
    }
    debug('Got data of length %d', data.length)
    cb(null, data)
  })
}
