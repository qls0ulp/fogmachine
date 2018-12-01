const logger = require('./modules/logger');
logger.init();
const winston = require('winston');
const express = require('express');
const fm = express();
const fs = require('fs');
const bodyParser = require('body-parser');

const defaults = require('./modules/defaults.js');
const API = require('./modules/api.js');

exports.init = function (program) {
  // Setup default values
  defaults.setup(program);

  // Logging
  if (program.writeLogs) {
    logger.addFileLogger(program.storage.logsDirectory);
  }

  var server;
  if (program.ssl && program.ssl.cert && program.ssl.key) {
    try {
      server = require('https').createServer({
        key: fs.readFileSync(program.ssl.key),
        cert: fs.readFileSync(program.ssl.cert)
      });
    } catch (error) {
      console.log('FAILED TO CREATE HTTPS SERVER');
      error.code = 'BAD CERTS';
      throw error;
    }
  } else {
    server = require('http').createServer();
  }

  // Magic Middleware Things
  fm.use(bodyParser.json());
  fm.use(bodyParser.urlencoded({ extended: true }));
  fm.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // Give access to public folders
  fm.use('/public', express.static(program.webAppDirectory));
  fm.use('/album-art', express.static(program.storage.albumArtDirectory));
  fm.use('/media/', express.static(program.storage.mediaDirectory));

  // Special endpoints for the webapp
  fm.get('/', (req, res) => { res.sendFile('public.html', { root: program.webAppDirectory }); });
  fm.all('/admin', (req, res) => { res.sendFile('admin.html', { root: program.webAppDirectory }) });


  API.public(fm, program);
  require('./modules/download.js').setup(fm, program);

  // User System and Login API + Middleware
  if (program.users) {
    require("./modules/login.js").setup(fm, program);
  }
  
  API.admin(fm, program);
  require('./modules/upload.js').setup(fm, program);

  // Used to determine the user has a working login token
  fm.get('/ping', (req, res) => {
    res.json({ success: true });
  });

  // Start the server!
  server.on('request', fm);
  server.listen(program.port, () => {
    winston.info(`Access FogMachine locally: ${program.ssl && program.ssl.cert && program.ssl.key ? 'https' : 'http'}://localhost:${program.port}`);
  });
}
