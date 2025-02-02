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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ************************************

// ====================================
// EXTRAS
// ====================================
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
import download from "./routes/download.js";
// ************************************

// ====================================
// HTTP SERVER
// ====================================
import http from 'http';
import cors from 'cors';
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// ====================================
// SOCKETS
// ====================================
import { Server } from 'socket.io';
import createSockets from "./sockets/sockets.js";
var io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

app.io = io;

createSockets(io, configInfos.transmission, app);

const PORT = app.settings.config.appPort || 3000;
app.set('port', PORT);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
server.on('error', onError);
server.on('listening', onListening);
/* function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
} */

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

import createDebug from "debug";
const debug = createDebug('seedApp:server')

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

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
app.use('/download', download);
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
