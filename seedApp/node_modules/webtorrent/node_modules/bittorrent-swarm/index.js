module.exports = Swarm

var addrToIPPort = require('addr-to-ip-port') // browser exclude
var debug = require('debug')('bittorrent-swarm')
var dezalgo = require('dezalgo')
var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var net = require('net') // browser exclude
var Peer = require('./lib/peer')
var speedometer = require('speedometer')
var TCPPool = require('./lib/tcp-pool')

var MAX_CONNS = 55
var RECONNECT_WAIT = [ 1000, 5000, 15000 ]

inherits(Swarm, EventEmitter)

/**
 * BitTorrent Swarm
 *
 * Abstraction of a BitTorrent "swarm", which is handy for managing all peer
 * connections for a given torrent download. This handles connecting to peers,
 * listening for incoming connections, and doing the initial peer wire protocol
 * handshake with peers. It also tracks total data uploaded/downloaded to/from
 * the swarm.
 *
 * @param {Buffer|string} infoHash
 * @param {Buffer|string} peerId
 * @param {Object} opts
 * @param {Object} opts.handshake handshake options (passed to bittorrent-protocol)
 * @param {number} opts.maxConns maximum number of connections in swarm
 */
function Swarm (infoHash, peerId, opts) {
  var self = this
  if (!(self instanceof Swarm)) return new Swarm(infoHash, peerId, opts)
  EventEmitter.call(self)

  self.infoHash = typeof infoHash === 'string'
    ? new Buffer(infoHash, 'hex')
    : infoHash
  self.infoHashHex = self.infoHash.toString('hex')

  self.peerId = typeof peerId === 'string'
    ? new Buffer(peerId, 'hex')
    : peerId
  self.peerIdHex = self.peerId.toString('hex')

  if (!opts) opts = {}

  debug('new swarm (i %s p %s)', self.infoHashHex, self.peerIdHex)

  self.handshakeOpts = opts.handshake // handshake extensions (optional)
  self.maxConns = opts.maxConns !== undefined ? opts.maxConns : MAX_CONNS

  self.destroyed = false
  self.listening = false
  self.paused = false

  self.server = null // tcp listening socket
  self.wires = [] // open wires (added *after* handshake)

  self._queue = [] // queue of outgoing tcp peers to connect to
  self._peers = {} // connected peers (addr/peerId -> Peer)
  self._peersLength = 0 // number of elements in `self._peers` (cache, for perf)
  self._port = 0 // tcp listening port (cache, for perf)

  // track stats
  self.downloaded = 0
  self.uploaded = 0
  self.downloadSpeed = speedometer()
  self.uploadSpeed = speedometer()
}

Object.defineProperty(Swarm.prototype, 'ratio', {
  get: function () {
    var self = this
    return (self.uploaded / self.downloaded) || 0
  }
})

Object.defineProperty(Swarm.prototype, 'numQueued', {
  get: function () {
    var self = this
    return self._queue.length + (self._peersLength - self.numConns)
  }
})

Object.defineProperty(Swarm.prototype, 'numConns', {
  get: function () {
    var self = this
    var numConns = 0
    for (var id in self._peers) {
      var peer = self._peers[id]
      if (peer && peer.connected) numConns += 1
    }
    return numConns
  }
})

Object.defineProperty(Swarm.prototype, 'numPeers', {
  get: function () {
    var self = this
    return self.wires.length
  }
})

/**
 * Add a peer to the swarm.
 * @param {string|simple-peer} peer    "ip:port" string or simple-peer instance
 * @param {string}             peer.id bittorrent peer id (when `peer` is simple-peer)
 */
Swarm.prototype.addPeer = function (peer) {
  var self = this
  self._addPeer(peer) // don't expose private Peer instance in return value
}

Swarm.prototype._addPeer = function (peer) {
  var self = this
  if (self.destroyed) {
    if (peer && peer.destroy) peer.destroy(new Error('swarm already destroyed'))
    return null
  }
  if (typeof peer === 'string' && !self._validAddr(peer)) {
    debug('ignoring invalid peer %s (from swarm.addPeer)', peer)
    return null
  }

  var id = (peer && peer.id) || peer
  if (self._peers[id]) return

  debug('addPeer %s', id)

  var newPeer
  if (typeof peer === 'string') {
    // `peer` is an addr ("ip:port" string)
    newPeer = Peer.createOutgoingTCPPeer(peer, self)
  } else {
    // `peer` is a WebRTC connection (simple-peer)
    if (self.paused) {
      peer.destroy(new Error('swarm paused'))
      return null
    }
    newPeer = Peer.createWebRTCPeer(peer, self)
  }

  self._peers[newPeer.id] = newPeer
  self._peersLength += 1

  if (typeof peer === 'string') {
    // `peer` is an addr ("ip:port" string)
    self._queue.push(newPeer)
    self._drain()
  }

  return newPeer
}

/**
 * Add a web seed to the swarm.
 * @param {string} url web seed url
 * @param {Object} parsedTorrent
 */
Swarm.prototype.addWebSeed = function (url, parsedTorrent) {
  var self = this
  if (self.destroyed) return

  if (!/^https?:\/\/.+/.test(url)) {
    debug('ignoring invalid web seed %s (from swarm.addWebSeed)', url)
    return
  }

  if (self._peers[url]) return

  debug('addWebSeed %s', url)

  var newPeer = Peer.createWebPeer(url, parsedTorrent, self)
  self._peers[newPeer.id] = newPeer
  self._peersLength += 1
}

/**
 * Called whenever a new incoming TCP peer connects to this swarm. Called with a peer
 * that has already sent a handshake.
 * @param {Peer} peer
 */
Swarm.prototype._addIncomingPeer = function (peer) {
  var self = this
  if (self.destroyed) return peer.destroy(new Error('swarm already destroyed'))
  if (self.paused) return peer.destroy(new Error('swarm paused'))

  if (!self._validAddr(peer.addr)) {
    return peer.destroy(new Error('invalid addr ' + peer.addr + ' (from incoming)'))
  }
  debug('_addIncomingPeer %s', peer.id)

  self._peers[peer.id] = peer
  self._peersLength += 1
}

/**
 * Remove a peer from the swarm.
 * @param  {string} id for tcp peers, "ip:port" string; for webrtc peers, peerId
 */
Swarm.prototype.removePeer = function (id) {
  var self = this
  var peer = self._peers[id]
  if (!peer) return

  debug('removePeer %s', id)

  self._peers[id] = null
  self._peersLength -= 1

  peer.destroy()

  // If swarm was at capacity before, try to open a new connection now
  self._drain()
}

/**
 * Temporarily stop connecting to new peers. Note that this does not pause new
 * incoming connections, nor does it pause the streams of existing connections
 * or their wires.
 */
Swarm.prototype.pause = function () {
  var self = this
  if (self.destroyed) return
  debug('pause')
  self.paused = true
}

/**
 * Resume connecting to new peers.
 */
Swarm.prototype.resume = function () {
  var self = this
  if (self.destroyed) return
  debug('resume')
  self.paused = false
  self._drain()
}

/**
 * Listen on the given port for peer connections.
 * @param {number} port
 * @param {string=} hostname
 * @param {function=} onlistening
 */
Swarm.prototype.listen = function (port, hostname, onlistening) {
  var self = this
  if (typeof hostname === 'function') {
    onlistening = hostname
    hostname = undefined
  }
  if (onlistening) onlistening = dezalgo(onlistening)

  if (self.listening) throw new Error('swarm already listening')

  if (process.browser && onlistening) {
    onlistening()
  } else {
    self._port = port || TCPPool.getDefaultListenPort(self.infoHashHex)
    self._hostname = hostname
    if (onlistening) self.once('listening', onlistening)

    debug('listen %s', port)

    var pool = TCPPool.addSwarm(self)
    self.server = pool.server
  }
}

Swarm.prototype._onListening = function (port) {
  var self = this
  self._port = port
  self.listening = true
  self.emit('listening')
}

Swarm.prototype.address = function () {
  var self = this
  return self.server.address()
}

/**
 * Destroy the swarm, close all open peer connections, and do cleanup.
 * @param {function} onclose
 */
Swarm.prototype.destroy = function (onclose) {
  var self = this
  if (self.destroyed) return

  self.destroyed = true
  self.listening = false
  self.paused = false

  if (onclose) self.once('close', onclose)

  debug('destroy')

  for (var id in self._peers) {
    self.removePeer(id)
  }

  TCPPool.removeSwarm(self, function () {
    // TODO: only emit when all peers are destroyed
    self.emit('close')
  })
}

/**
 * Pop a peer off the FIFO queue and connect to it. When _drain() gets called,
 * the queue will usually have only one peer in it, except when there are too
 * many peers (over `this.maxConns`) in which case they will just sit in the
 * queue until another connection closes.
 */
Swarm.prototype._drain = function () {
  var self = this
  debug('_drain numConns %s maxConns %s', self.numConns, self.maxConns)
  if (typeof net.connect !== 'function' || self.destroyed || self.paused ||
      self.numConns >= self.maxConns) {
    return
  }
  debug('drain (%s queued, %s/%s peers)', self.numQueued, self.numPeers, self.maxConns)

  var peer = self._queue.shift()
  if (!peer) return // queue could be empty

  debug('tcp connect attempt to %s', peer.addr)

  var parts = addrToIPPort(peer.addr)
  var opts = {
    host: parts[0],
    port: parts[1]
  }
  if (self._hostname) opts.localAddress = self._hostname

  var conn = peer.conn = net.connect(opts)

  conn.once('connect', function () { peer.onConnect() })
  conn.once('error', function (err) { peer.destroy(err) })
  peer.setConnectTimeout()

  // When connection closes, attempt reconnect after timeout (with exponential backoff)
  conn.on('close', function () {
    if (self.destroyed) return

    if (peer.retries >= RECONNECT_WAIT.length) {
      debug(
        'conn %s closed: will not re-add (max %s attempts)',
        peer.addr, RECONNECT_WAIT.length
      )
      return
    }

    var ms = RECONNECT_WAIT[peer.retries]
    debug(
      'conn %s closed: will re-add to queue in %sms (attempt %s)',
      peer.addr, ms, peer.retries + 1
    )

    var reconnectTimeout = setTimeout(function reconnectTimeout () {
      var newPeer = self._addPeer(peer.addr)
      if (newPeer) newPeer.retries = peer.retries + 1
    }, ms)
    if (reconnectTimeout.unref) reconnectTimeout.unref()
  })
}

Swarm.prototype._onError = function (err) {
  var self = this
  self.emit('error', err)
  self.destroy()
}

/**
 * Returns `true` if string is valid IPv4/6 address, and is not the address of this swarm.
 * @param {string} addr
 * @return {boolean}
 */
Swarm.prototype._validAddr = function (addr) {
  var self = this
  var parts = addrToIPPort(addr)
  var host = parts[0]
  var port = parts[1]
  return port > 0 && port < 65535 && !(host === '127.0.0.1' && port === self._port)
}
