const Busboy = require("busboy");
const fs = require("fs");
const fe = require("path");
const makeDir = require('make-dir');

exports.setup = function(fm, program) {
  fm.post("/upload", function (req, res) {
    if (!req.headers['data-location']) {
      return res.status(500).json({ error: 'No Location Provided' });
    }

    const saveTo = fe.join(program.media, filename);

    // Check if path exits, if not make the path
    if (!fs.existsSync(fe.dirname(saveTo))) {
      makeDir.sync(fe.dirname(psaveTo));
    }

    const busboy = new Busboy({ headers: req.headers });

    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      console.log(`Uploading File: ${saveTo}`);
      file.pipe(fs.createWriteStream(saveTo));
    });

    busboy.on("finish", function () {
      res.json({ success: true });
    });

    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      console.log('Field [' + fieldname + ']: value: ' + val);
    });

    return req.pipe(busboy);
  });
};
