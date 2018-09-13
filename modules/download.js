const archiver = require('archiver');
const fe = require('path');
const fs = require('fs');

exports.setup = function (fm, program) {
  fm.post('/download', function (req, res) {
    var archive = archiver('zip');

    archive.on('error', function (err) {
      console.log(err.message);
      res.status(500).json({ error: err.message });
    });

    archive.on('end', function () {
      // TODO: add logging
    });

    // sets the archive name. TODO: Rename this
    res.attachment('zipped-playlist.zip');

    //streaming magic
    archive.pipe(res);

    // Get the POSTed files
    var fileArray;
    if (req.allowedFiles) {
      fileArray = allowedFiles;
    } else {
      fileArray = JSON.parse(req.body.fileArray);
    }

    for (var i in fileArray) {
      const pathInfo = fe.join(program.media, fileArray[i]);
      if (!fs.existsSync(pathInfo)) {
        continue;
      }

      archive.file(pathInfo.fullPath, { name: fe.basename(fileArray[i]) });
    }

    archive.finalize();
  });
}
