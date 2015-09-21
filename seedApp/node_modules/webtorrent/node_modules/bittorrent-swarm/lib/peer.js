var debug = require('debug')('bittorrent-swarm:peer')
var WebConn = require('./webconn')
var Wire = require('bittorrent-protocol')

var CONNECT_TIMEOUT = 25000
var HANDSHAKE_TIMEOUT = 25000

/**
 * WebRTC peer connections start out connected, because WebRTC peers require an
 * "introduction" (i.e. WebRTC signaling), and there's no equivalent to an IP address
 * that lets you refer to a WebRTC endpoint.
 */
exports.createWebRTCPeer = function (conn, swarm) {
  var peer = new Peer(conn.id)
  peer.conn = conn
  peer.swarm = swarm

  if (peer.conn.connected) {
    peer.onConnect()
  } else {
    peer.conn.once('connect', function () { peer.onConnect() })
    peer.conn.once('error', function (err) { peer.destroy(err) })
    peer.setConnectTimeout()
  }

  return peer
}

/**
 * Incoming TCP peers start out connected, because the remote peer connected to the
 * listening port of the TCP server. Until the remote peer sends a handshake, we don't
 * know what swarm the connection is intended for.
 */
exports.createIncomingTCPPeer = function (conn) {
  var addr = conn.remoteAddress + ':' + conn.remotePort
  var peer = new Peer(addr)
  peer.conn = conn
  peer.addr = addr

  peer.onConnect()

  return peer
}

/**
 * Outgoing TCP peers start out with just an IP address. At some point (when there is an
 * available connection), the client can attempt to connect to the address.
 */
exports.createOutgoingTCPPeer = function (addr, swarm) {
  var peer = new Peer(addr)
  peer.addr = addr
  peer.swarm = swarm

  return peer
}

/**
 * Peer that represents a Web Seed (BEP17 / BEP19).
 */
exports.createWebPeer = function (url, parsedTorrent, swarm) {
  var peer = new Peer(url)
  peer.swarm = swarm
  peer.conn = new WebConn(url, parsedTorrent)

  peer.onConnect()

  return peer
}

/**
 * Peer. Represents a peer in the Swarm.
 *
 * @param {string} id "ip:port" string or peer id (for WebRTC peers)
 */
function Peer (id) {
  var self = this
  self.id = id

  debug('new Peer %s', id)

  self.addr = null
  self.conn = null
  self.swarm = null
  self.wire = null

  self.connected = false
  self.destroyed = false
  self.timeout = null // handshake timeout
  self.retries = 0 // outgoing TCP connection retry count

  self.sentHandshake = false
}

/**
 * Called once the peer is connected (i.e. fired 'connect' event)
 * @param {Socket} conn
 */
Peer.prototype.onConnect = function () {
  var self = this
  if (self.destroyed) return
  self.connected = true

  debug('Peer %s connected', self.id)

  clearTimeout(self.connectTimeout)

  var conn = self.conn
  conn.once('end', function () {
    self.destroy()
  })
  conn.once('close', function () {
    self.destroy()
  })
  conn.once('finish', function () {
    self.destroy()
  })
  conn.once('error', function (err) {
    self.destroy(err)
  })

  var wire = self.wire = new Wire()
  wire.once('end', function () {
    self.destroy()
  })
  wire.once('close', function () {
    self.destroy()
  })
  wire.once('finish', function () {
    self.destroy()
  })
  wire.once('error', function (err) {
    self.destroy(err)
  })

  wire.once('handshake', function (infoHash, peerId) {
    self.onHandshake(infoHash, peerId)
  })
  self.setHandshakeTimeout()

  conn.pipe(wire).pipe(conn)
  if (self.swarm && !self.sentHandshake) self.handshake()
}

/**
 * Called when handshake is received from remote peer.
 * @param {string} infoHash
 */
Peer.prototype.onHandshake = function (infoHash, peerId) {
  var self = this
  if (!self.swarm) return // `self.swarm` not set yet, so do nothing
  var infoHashHex = infoHash.toString('hex')
  var peerIdHex = peerId.toString('hex')

  if (self.swarm.destroyed) return self.destroy(new Error('swarm already destroyed'))
  if (infoHashHex !== self.swarm.infoHashHex) {
    return self.destroy(new Error('unexpected handshake info hash for this swarm'))
  }
  if (peerIdHex === self.swarm.peerIdHex) {
    return self.destroy(new Error('refusing to handshake with self'))
  }

  debug('Peer %s got handshake %s', self.id, infoHashHex)

  clearTimeout(self.handshakeTimeout)

  self.retries = 0

  self.wire.on('download', function (downloaded) {
    if (self.destroyed) return
    self.swarm.downloaded += downloaded
    self.swarm.downloadSpeed(downloaded)
    self.swarm.emit('download', downloaded)
  })

  self.wire.on('upload', function (uploaded) {
    if (self.destroyed) return
    self.swarm.uploaded += uploaded
    self.swarm.uploadSpeed(uploaded)
    self.swarm.emit('upload', uploaded)
  })

  if (!self.sentHandshake) self.handshake()

  self.swarm.wires.push(self.wire)

  var addr = self.addr
  if (!addr && self.conn.remoteAddress) {
    addr = self.conn.remoteAddress + ':' + self.conn.remotePort
  }
  self.swarm.emit('wire', self.wire, addr)
}

Peer.prototype.handshake = function () {
  var self = this
  self.wire.handshake(self.swarm.infoHash, self.swarm.peerId, self.swarm.handshakeOpts)
  self.sentHandshake = true
}

Peer.prototype.setConnectTimeout = function () {
  var self = this
  clearTimeout(self.connectTimeout)
  self.connectTimeout = setTimeout(function () {
    self.destroy(new Error('connect timeout'))
  }, CONNECT_TIMEOUT)
  if (self.connectTimeout.unref) self.connectTimeout.unref()
}

Peer.prototype.setHandshakeTimeout = function () {
  var self = this
  clearTimeout(self.handshakeTimeout)
  self.handshakeTimeout = setTimeout(function () {
    self.destroy(new Error('handshake timeout'))
  }, HANDSHAKE_TIMEOUT)
  if (self.handshakeTimeout.unref) self.handshakeTimeout.unref()
}

Peer.prototype.destroy = function (err) {
  var self = this
  if (self.destroyed) return
  self.destroyed = true
  self.connected = false

  debug('destroy %s (error: %s)', self.id, err && (err.message || err))

  clearTimeout(self.connectTimeout)
  clearTimeout(self.handshakeTimeout)

  var swarm = self.swarm
  var conn = self.conn
  var wire = self.wire

  self.conn = null
  self.swarm = null
  self.wire = null

  if (swarm && wire) {
    var index = swarm.wires.indexOf(wire)
    if (index >= 0) swarm.wires.splice(index, 1)
  }
  if (conn) conn.destroy()
  if (wire) wire.destroy()
  if (swarm) swarm.removePeer(self.id)
}
