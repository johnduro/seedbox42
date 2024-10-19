// ====================================
// MODULES NPM
// ====================================
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ************************************

// ====================================
// EXTRAS
// ====================================
import fs from 'fs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import auth from './middlewares/auth.js';
import configInit from './config/init.js'
import ttCron from './utils/cron.js';
import { renderFile } from 'ejs';
// ************************************

// ====================================
// CONFIG
// ====================================
var app = express();
var configInfos = await configInit();
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
import users from "./routes/users.js";
import authenticate from "./routes/authenticate.js";
import torrent from "./routes/torrent.js";
import file from "./routes/file.js";
import dashboard from "./routes/dashboard.js";
import admin from "./routes/admin.js";
// ************************************

// ====================================
// SOCKETS
// ====================================
var io = new Server()
app.io = io;
import createSockets from "./sockets/sockets.js";
const sockets = createSockets(io, configInfos.transmission, app);
//************************************

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', renderFile);
app.set('view engine', 'ejs');

// favicon
app.use(favicon(path.join(__dirname, 'public', 'assets', 'images', 'favicon.ico')));
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

export default app;
