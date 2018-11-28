// Sets up default values for 
const fs = require('fs');
const path = require('path');

exports.setup = function (program) {
  program.filesDbName = 'files.loki-v1.db'

  if (!program.storage) {
    program.storage = {};
  }
  // Album Art Directory
  if (!program.storage.albumArtDirectory) {
    program.storage.albumArtDirectory = path.join(__dirname, '../image-cache');
  }
  // Media Directory
  if(!program.storage.mediaDirectory) {
    program.storage.mediaDirectory = path.join(__dirname, '../media');
  }
  // DB Directory
  if (!program.storage.dbDirectory) {
    program.storage.dbDirectory = path.join(__dirname, '../save/db');
  }
  // Logs Directory
  if (!program.storage.logsDirectory) {
    program.storage.logsDirectory = path.join(__dirname, '../save/logs');
  }
  // Webapp
  if (!program.webAppDirectory) {
    program.webAppDirectory = path.join(__dirname, '../public')
  }
  // Port
  if (!program.port) {
    program.port = 3000;
  }

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
      require('crypto').randomBytes(48, (err, buffer) => {
        program.secret = buffer.toString('hex');
      });
    }
  }

  return program;
}