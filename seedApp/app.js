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
var fs = require('fs');
// var join = require('path').join;
// var mongoose = require('mongoose');//dans init
// fs.readdirSync(join(__dirname, 'models')).forEach(function (file) {
// 	if (~file.indexOf('.js')) require(join(__dirname, 'models', file));
// });
var jwt = require('jsonwebtoken');
var multer = require('multer');
var authMW = require('./utils/authMiddleware');
var TransmissionNode = require('./utils/transmissionNode');
var configInit = require('./utils/configInit');
// ************************************

// ====================================
// CONFIG
// ====================================
var app = express();
var configFileName = './config.json';
var configDefaultName = './files/default-test.json';
// var configFile = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
var configFile = JSON.parse(fs.readFileSync(configFileName, 'utf8'));
var configDefault = JSON.parse(fs.readFileSync(configDefaultName, 'utf8'));
app.set('defaultConfig', configDefault);
var configInfos = configInit(configFile);
// var config = configInit(configFile);
// app.set('secret', config.secret);
// app.set('config', config);
// app.set('secret', configInfos.config.users.secret);
app.set('configFileName', configFileName);
app.set('secret', configInfos.config.secret);
app.set('config', configInfos.config);
app.set('connexionDB', configInfos.connexionDB);
app.set('transmission', configInfos.transmission);
require('./models/File');
require('./models/User');
require('./models/Wall');
// ************************************

// ====================================
// ROUTES REQUIRE
// ====================================
var users = require('./routes/users');
var auth = require('./routes/authenticate');
var debugSetup = require('./routes/ds');
var torrent = require('./routes/torrent');
var file = require('./routes/file');
var dashboard = require('./routes/dashboard');
var admin = require('./routes/admin');
// ************************************


// ====================================
// DATABASE CONNEXION
// ====================================
// var connexionDB = mongoose.connect(config.database, function (err) {
// 	if (err)
// 		console.log('database: connection error', err);
// 	else
// 		console.log('database: connection successful');
// });
// app.set('connexionDB', connexionDB);
// ************************************

// ====================================
// TORRENTS
// ====================================
// var transmission = new TransmissionNode();
// app.set('transmission', transmission);
//************************************

// ====================================
// SOCKETS
// ====================================
var io = socketIO();
app.io = io;
// var sockets = require('./utils/sockets')(io, transmission, app.get('secret'));
// var sockets = require('./utils/sockets')(io, transmission, app);
var sockets = require('./utils/sockets')(io, configInfos.transmission, app);
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
app.use('/dashboard', authMW, dashboard);
app.use('/users', authMW, users);
app.use('/torrent', authMW, torrent);
app.use('/file', authMW, file);
app.use('/admin', authMW, admin);
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
