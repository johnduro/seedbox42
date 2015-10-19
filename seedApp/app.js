// ====================================
// MODULES NPM
// ====================================
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socketIO = require('socket.io');
// ************************************

// ====================================
// EXTRAS
// ====================================
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var multer = require('multer');
var config = require('./config');
var authMW = require('./utils/authMiddleware');
var TransmissionNode = require('./utils/transmissionNode');
// ************************************

// ====================================
// ROUTES REQUIRE
// ====================================
var users = require('./routes/users');
var auth = require('./routes/authenticate');
var debugSetup = require('./routes/ds');
var torrent = require('./routes/torrent');
var file = require('./routes/file');
// ************************************

// ====================================
// CONFIG
// ====================================
var app = express();
app.set('secret', config.secret);
app.set('config', config);
// ************************************

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
var transmission = new TransmissionNode();
app.set('transmission', transmission);
//************************************

// ====================================
// SOCKETS
// ====================================
var io = socketIO();
app.io = io;
var sockets = require('./utils/sockets')(io, transmission, app.get('secret'));
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

// ----- STANDARDS -----
app.use('/debug', debugSetup);
app.use('/authenticate', auth);

// ----- CONNECTED -----
app.use('/users', authMW, users);
app.use('/torrent', authMW, torrent);
app.use('/file', authMW, file);
// ************************************

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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
