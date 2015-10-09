var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// ====================================
// EXTRAS
// ====================================
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var multer = require('multer');
var config = require('./config');
var authMW = require('./utils/authMiddleware');
// ************************************

// ====================================
// ROUTES REQUIRE
// ====================================
var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/authenticate');
var debugSetup = require('./routes/ds');
var torrent = require('./routes/torrent');
// ************************************


var app = express();

// ====================================
// DATABASE CONNEXION
// ====================================
var connexionDB = mongoose.connect(config.database, function(err) {
	if (err){
		console.log('database: connection error', err);
	}
	else {
		console.log('database: connection successful');
	}
});
app.set('connexionDB', connexionDB);
// ************************************


// ====================================
// TORRENTS
// ====================================
var TransmissionNode = require('./utils/transmissionNode');
var transmission = new TransmissionNode();
app.set('transmission', transmission);
//************************************


// var refreshTorrent = function () {
// 	console.log('yolo je refresh les diez et j emmit');
// };

// ====================================
// SOCKETS
// ====================================
// var connectedUsers = 0;
// var torrentIntervalId;
var socketIO = require('socket.io');
var io = socketIO();
app.io = io;
// var sockets = require('./utils/sockets')(io, transmission);











// console.log(io.parser);
// io.on('torrent-refresh', function (socket) {
// 	if (io.engine.clientsCount === 1)
// 		torrentIntervalId = setInterval(refreshTorrent, 1000);
// });

// io.on('connection', function (socket) {
// 	// connectedUsers++;
// 	console.log('new user connection');
// 	console.log('number of users currently connected :', io.engine.clientsCount);
// 	io.sockets.emit('connected-users', {connectedUsers: io.engine.clientsCount});
// 	// socket.emit('connection', {
// 	//     connectedUsers: connectedUsers
// 	//   });
// 	// socket.broadcast.emit('connection', {
// 	//     connectedUsers: connectedUsers
// 	//   });
// 	// console.log('NB USERS : ',connectedUsers);
// 	// socket.on('disconnect', function (socket) {
// 	// 	console.log('disconnect ON !!');
// 	// });
// 	socket.once('disconnect', function (socket) {
// 		console.log('users still online : ', io.engine.clientsCount);
// 		if (io.engine.clientsCount === 0)
// 			clearInterval(torrentIntervalId);
// 	});
// });

// io.sockets.once('disconnect', function (socket) {
// 	connectedUsers--;
// 	console.log('disconnect in io!');
// 	console.log('NB USERS : ',connectedUsers);
// });
//************************************


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ====================================
// ROUTES
// ====================================
app.use('/', routes);
app.use('/debug', debugSetup);
app.set('secret', config.secret);
app.use('/authenticate', auth);
// all route below need identification token
app.use(authMW);
app.use('/users', users);
app.use('/torrent', torrent);
// ************************************

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// function printPpl () {
// 	console.log("NBR --> ", io.engine.clientsCount);
// };
// setInterval(printPpl, 1000);

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
