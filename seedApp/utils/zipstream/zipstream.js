/**
 * ZipStream
 * 
 * @author : Lionel Seguin
 * @email  : lseguin@student.42.fr 
 * @date   : 17 april 2015
 */

var Stream = require('stream').Stream;
var util = require('util');
var crc32 = require('./crc32');

function ZipStream() {
	var self = this;

	self.busy = false;
	self.eof = false;

	self.queue = [];
	self.fileptr = 0;
	self.files = [];
}
util.inherits(ZipStream, Stream);

function convertDate(d) {
	var year = d.getFullYear();

	if (year < 1980)
		return (1 << 21) | (1 << 16);
	return ((year - 1980) << 25) | ((d.getMonth() + 1) << 21) | (d.getDate() << 16) |
	(d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
}

ZipStream.prototype._finalize = function() {
	var self = this;

	self._pushCentralDirectory();
	self.emit('end');
	self.removeAllListeners();
}

ZipStream.prototype.finalize = function(callback) {
	var self = this;

	if (self.eof)
	{
		self.emit('error', 'finalize is already set.');
		return self;
	}
	if (self.files.length === 0 && !self.busy) {
		self.emit('error', 'no files in zip');
		return self;
	}
	self.on('end', function () {
		callback(self.fileptr);
	});
	self.eof = true;
	if (!self.busy)
		self._finalize(callback);
	return self;
}

ZipStream.prototype._push = function(chunk) {
	var self = this;

	self.emit('data', chunk);
}

ZipStream.prototype._addFile = function(source, file, callback) {
	var self = this;

	if (self.busy) {
		self.emit('error', 'previous file not finished');
		return ;
	}

	self.busy = true;
	self.file = file;

	setImmediate(function () {
		self._pushLocalFileHeader(file);

		var checksum = crc32.createCRC32();
		var uncompressed = 0;

		source.on('data', function(chunk) {
			checksum.update(chunk);
			uncompressed += chunk.length;
			self._push(chunk);
		});

		source.on('end', function() {
			file.crc32 = checksum.digest();
			file.compressed = file.uncompressed = uncompressed;

			self.fileptr += uncompressed;
			self._pushDataDescriptor(file);

			self.files.push(file);
			self.busy = false;
			
			if (self.queue.length > 0) {
				var n = self.queue.shift();
				self._addFile(n.source, n.file, n.callback);
			}
			else if (self.eof) {
				self._finalize();
			}
			if (callback) callback();
		});
	});
}

ZipStream.prototype.addFile = function(source, file, callback) {
	var self = this;

	if (self.eof) {
		self.emit('error', 'finalise is already set.');
		return ;
	}

	if (self.busy) {
		self.queue.push({
			source : source,
			file : file,
			callback : callback
		});
		return self;
	}
	self._addFile(source, file, callback);
	return self;
}

ZipStream.prototype._pushLocalFileHeader = function(file) {
	var self = this;

	file.version = 20;
	file.bitflag = 8;
	file.method = 0;
	file.moddate = convertDate(new Date());
	file.offset = self.fileptr;

	var buf = new Buffer(30 + file.name.length);

	buf.writeUInt32LE(0x04034b50, 0);         // local file header signature
	buf.writeUInt16LE(file.version, 4);       // version needed to extract
	buf.writeUInt16LE(file.bitflag, 6);       // general purpose bit flag
	buf.writeUInt16LE(file.method, 8);        // compression method
	buf.writeUInt32LE(file.moddate, 10);      // last mod file date and time

	buf.writeInt32LE(0, 14);                  // crc32
	buf.writeUInt32LE(0, 18);                 // compressed size
	buf.writeUInt32LE(0, 22);                 // uncompressed size

	buf.writeUInt16LE(file.name.length, 26);  // file name length
	buf.writeUInt16LE(0, 28);                 // extra field length
	buf.write(file.name, 30);                 // file name

	self._push(buf);
	self.fileptr += buf.length;
}

ZipStream.prototype._pushDataDescriptor = function(file) {
	var self = this;

	var buf = new Buffer(16);
	buf.writeUInt32LE(0x08074b50, 0);         // data descriptor record signature
	buf.writeInt32LE(file.crc32, 4);          // crc-32
	buf.writeUInt32LE(file.compressed, 8);    // compressed size
	buf.writeUInt32LE(file.uncompressed, 12); // uncompressed size

	self._push(buf);
	self.fileptr += buf.length;
}

ZipStream.prototype._pushCentralDirectory = function() {
	var self = this;
	var cdoffset = self.fileptr;

	var ptr = 0;
	var cdsize = 0;

	var len, buf;

	for (var i=0; i<self.files.length; i++) {
		var file = self.files[i];

		len = 46 + file.name.length;
		buf = new Buffer(len);

		// central directory file header
		buf.writeUInt32LE(0x02014b50, 0);         // central file header signature
		buf.writeUInt16LE(file.version, 4);       // TODO version made by
		buf.writeUInt16LE(file.version, 6);       // version needed to extract
		buf.writeUInt16LE(file.bitflag, 8);       // general purpose bit flag
		buf.writeUInt16LE(file.method, 10);       // compression method
		buf.writeUInt32LE(file.moddate, 12);      // last mod file time and date
		buf.writeInt32LE(file.crc32, 16);         // crc-32
		buf.writeUInt32LE(file.compressed, 20);   // compressed size
		buf.writeUInt32LE(file.uncompressed, 24); // uncompressed size
		buf.writeUInt16LE(file.name.length, 28);  // file name length
		buf.writeUInt16LE(0, 30);                 // extra field length
		buf.writeUInt16LE(0, 32);                 // file comment length
		buf.writeUInt16LE(0, 34);                 // disk number where file starts
		buf.writeUInt16LE(0, 36);                 // internal file attributes
		buf.writeUInt32LE(0, 38);                 // external file attributes
		buf.writeUInt32LE(file.offset, 42);       // relative offset
		buf.write(file.name, 46);                 // file name

		ptr = ptr + len;
		self._push(buf);
	}

	cdsize = ptr;

	// end of central directory record
	len = 22;
	buf = new Buffer(len);

	buf.writeUInt32LE(0x06054b50, 0);           // end of central dir signature
	buf.writeUInt16LE(0, 4);                    // number of this disk
	buf.writeUInt16LE(0, 6);                    // disk where central directory starts
	buf.writeUInt16LE(self.files.length, 8);    // number of central directory records on this disk
	buf.writeUInt16LE(self.files.length, 10);   // total number of central directory records
	buf.writeUInt32LE(cdsize, 12);              // size of central directory in bytes
	buf.writeUInt32LE(cdoffset, 16);            // offset of start of central directory, relative to start of archive
	buf.writeUInt16LE(0, 20);                   // comment length

	ptr = ptr + len;

	self._push(buf);
	self.fileptr += ptr;
}

module.exports = ZipStream;
