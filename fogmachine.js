const logger = require('./modules/logger');
logger.init();
const winston = require('winston');
const express = require('express');
const fm = express();
const fs = require('fs');
const bodyParser = require('body-parser');

const defaults = require('./modules/defaults.js');

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
      // TODO: Verify files are real
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
  fm.use(bodyParser.json()); // support json encoded bodies
  fm.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
  fm.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // Give access to public folder
  fm.use('/public', express.static(program.webAppDirectory));
  // Serve the webapp
  fm.get('/', function (req, res) {
    res.sendFile('public.html', { root: program.webAppDirectory });
  });
  // Serve Shared Page
  fm.all('/admin', function (req, res) {
    res.sendFile('admin.html', { root: program.webAppDirectory });
  });

  fm.use('/album-art', express.static(program.storage.albumArtDirectory));
  fm.use('/media/', express.static(program.storage.mediaDirectory));

  fm.get('/api/test/all-public', (req, res) => {
    res.json([{"id":"1","name":"MyFirstSingle","type":"single","genre":"house","transcoded":false,"media":[{"title":"MyFirstSingle","file":"/media/1/single.mp3","trackNo":1,"waveform":"/media/path/to/waveform.svg"}]},{"id":"2","name":"MyFirstAlbum","type":"album","genre":"house","transcoded":true,"media":[{"title":"Thefirstsong","file":"/media/2/song1.mp3","trackNo":1,"waveform":"/media/path/to/waveform2.svg"},{"title":"Thesecondsong","file":"/media/2/song2.mp3","trackNo":2,"waveform":"/media/path/to/waveform3.svg"},{"title":"Thethirdsong","file":"/media/3/song3.mp3","trackNo":3,"waveform":"/media/path/to/waveform4.svg"}]}]);
  });

  require('./modules/download.js').setup(fm, program);
  
  // User System and Login API + Middleware
  if (program.users) {
    require("./modules/login.js").setup(fm, program);
  }
  
  const loki = require('lokijs');
  const db = new loki(program.storage.dbDirectory);
  require('./modules/admin.js').setup(fm, program, db);
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
