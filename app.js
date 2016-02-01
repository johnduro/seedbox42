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
var jwt = require('jsonwebtoken');
var multer = require('multer');
var auth = require('./middlewares/auth.js');
var configInit = require('./config/init');
var ttCron = require('./utils/cron');
// ************************************

// ====================================
// CONFIG
// ====================================
var app = express();
var configInfos = configInit();
app.set('config', configInfos.config);
app.locals.ttConfig = configInfos.config;
app.locals.ttConfigDefault = configInfos.configDefault;
app.locals.ttConfigFileName = configInfos.configFileName;
app.locals.connexionDb = configInfos.connexionDb;
app.locals.transmission = configInfos.transmission;
// ************************************

// ====================================
// CRON
// ====================================
ttCron(app.locals.ttConfig, app.locals.transmission, app);


// ====================================
// ROUTES REQUIRE
// ====================================
var users = require('./routes/users');
var authenticate = require('./routes/authenticate');
var torrent = require('./routes/torrent');
var file = require('./routes/file');
var dashboard = require('./routes/dashboard');
var admin = require('./routes/admin');
// ************************************

// ====================================
// SOCKETS
// ====================================
var io = socketIO();
app.io = io;
var sockets = require('./sockets/sockets')(io, configInfos.transmission, app);
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
app.use('/authenticate', authenticate);

// ----- CONNECTED -----
app.use('/dashboard', auth, dashboard);
app.use('/users', auth, users);
app.use('/torrent', auth, torrent);
app.use('/file', auth, file);
app.use('/admin', auth, admin);
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
