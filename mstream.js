const express = require('express');
const mstream = express();
const fs = require('fs');
const fe = require('path');
const bodyParser = require('body-parser');

exports.init = function (program) {
  // Setup Secret for JWT
  try {
    // If user entered a filepath
    if (fs.statSync(program.secret).isFile()) {
      program.secret = fs.readFileSync(program.secret, 'utf8');
    }
  } catch (error) {
    if (program.secret) {
      // just use secret as is
      program.secret = String(program.secret);
    } else {
      // If no secret was given, generate one
      require('crypto').randomBytes(48, function (err, buffer) {
        program.secret = buffer.toString('hex');
      });
    }
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
  mstream.use(bodyParser.json()); // support json encoded bodies
  mstream.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

  // Setup WebApp
  if (program.userinterface) {
    // Give access to public folder
    mstream.use('/public', express.static(fe.join(__dirname, program.userinterface)));
    // Serve the webapp
    mstream.get('/', function (req, res) {
      res.sendFile(fe.join(program.userinterface, 'public.html'), { root: __dirname });
    });
    // Serve Shared Page
    mstream.all('/admin', function (req, res) {
      res.sendFile(fe.join(program.userinterface, 'admin.html'), { root: __dirname });
    });
  }

  // Setup Album Art
  if (!program.albumArtDir) {
    program.albumArtDir = fe.join(__dirname, 'image-cache');
  }

  // Album art endpoint
  mstream.use('/album-art', express.static(program.albumArtDir));

  // // Setup all folders with express static
  // for (var key in program.folders) {
  //   mstream.use('/media/' + key + '/', express.static(program.folders[key].root));
  // }

  // User System and Login API + Middleware
  // TODO: Require this on prod version
  if (program.users) {
    require("./modules/login.js").setup(mstream, program);
  }

  // Used to determine the user has a working login token
  mstream.get('/ping', function (req, res) {
    res.json({ success: true });
  });


  // Start the server!
  // TODO: Check if port is in use before firing up server
  server.on('request', mstream);
  server.listen(program.port, function () {
    let protocol = program.ssl && program.ssl.cert && program.ssl.key ? 'https' : 'http';
    console.log('Access mStream locally: ' + protocol + '://localhost:' + program.port);

    require('internal-ip').v4().then(ip => {
      console.log('Access mStream on your local network: ' + protocol + '://' + ip + ':' + program.port);
    });

    // Handle Port Forwarding
    if (!program.tunnel) {
      return
    }

    try {
      require('./modules/auto-port-forwarding.js').setup(program, function (status) {
        if (status !== true) {
          throw "Port Forwarding Failed";
        }
        require('public-ip').v4().then(ip => {
          exports.addresses.internet = protocol + '://' + ip + ':' + program.port;
          exports.logit('Access mStream on your local network:the internet: ' + exports.addresses.internet);
        });
      });
    } catch (err) {
      console.log('Port Forwarding Failed');
      console.log('Port Forwarding Failed.  The server is running but you will have to configure your own port forwarding');
    }
  });
}
