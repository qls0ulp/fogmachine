const Joi = require('joi');
const makeDir = require('make-dir');
const Busboy = require("busboy");
const fs = require("fs");
const fe = require("path");
const winston = require('winston');
const loki = require('lokijs');

var db;
var dbCollections;
var dbSubscribers
var dbOrders;

exports.public = function (fm, program) {
  db = new loki(fe.join(program.storage.dbDirectory, program.filesDbName));

  fm.get('/api/public/v1/collections', (req, res) => {
    res.json([{"id":"1","name":"MyFirstSingle","type":"single","genre":"house","transcoded":false,"media":[{"title":"MyFirstSingle","file":"/media/1/single.mp3","trackNo":1,"waveform":"/media/path/to/waveform.svg"}]},{"id":"2","name":"MyFirstAlbum","type":"album","genre":"house","transcoded":true,"media":[{"title":"Thefirstsong","file":"/media/2/song1.mp3","trackNo":1,"waveform":"/media/path/to/waveform2.svg"},{"title":"Thesecondsong","file":"/media/2/song2.mp3","trackNo":2,"waveform":"/media/path/to/waveform3.svg"},{"title":"Thethirdsong","file":"/media/3/song3.mp3","trackNo":3,"waveform":"/media/path/to/waveform4.svg"}]}]);
    // hide stuff user should not see
  });
}

exports.admin = function (fm, program) {
  function adminGetAllCollections() {
    const results = dbCollections.find({});
    // TODO: SORT
    return results;
  }

  db.loadDatabase({}, () => {
    dbCollections = db.getCollection("collections");
    dbSubscribers = db.getCollection("subscribers");
    dbOrders = db.getCollection("orders");
  
    if (dbCollections === null) {
      dbCollections = db.addCollection("collections");
    }
    if (dbSubscribers === null) {
      dbSubscribers = db.addCollection("subscribers");
    }
    if (dbOrders === null) {
      dbOrders = db.addCollection("orders");
    }
  });
  
  fm.get('/api/admin/v1/collections', (req, res) => {
    return res.json(adminGetAllCollections());
  });

  fm.post("/collection/create", function (req, res) {
    // Name
    // Type: EP, album etc
    // Type:
      // Free: All songs available in all qualities
      // Subscriber Only: All songs available, limited or no selection available otherwise
      // Paid :
        // (need to have payment gateway setup first)
        // (also requires songs to uploaded in WAV or FLAC format)
        // All songs available for a price, limited public access
    // Collection price (if paid)
    // Version Number (optional)

    const schema = Joi.object().keys({
      name: Joi.string().allow(''),
      type: Joi.string().allow(''),
      status: Joi.string().valid('free', 'subscriber', 'paid'),
      price: Joi.number().min(1),
      version: Joi.string().allow(''),
      public: Joi.boolean(),
      transcode: Joi.boolean()
    });

    const valid = Joi.validate(req.body, schema, { allowUnknown: true, presence: 'optional' });
    if (valid.error) {
      return res.status(422).json({ error: 'input error', errorList: valid.error });
    }

    console.log(req.body)

    const newCollection = dbCollections.insert({
      name: req.body.name ? req.body.name : '',
      type: req.body.type ? req.body.type : '',
      status: req.body.status ? req.body.status : '',
      price: req.body.price ? req.body.price : 0,
      version: req.body.version ? req.body.version : '',
      public: req.body.public ? req.body.public : false,
      transcode: req.body.transcode ? req.body.transcode : false,
      order: 0 // TODO: Fill this in automatically
    });

    db.saveDatabase((err) => {
      if (err) {
        winston.error('Failed to save DB');
      }
    });

    return res.json(adminGetAllCollections());
  });

  fm.post("/collection/edit", function (req, res) {
    // Edit anything posted in the create call

    // Edit song DB entries if we are going from paid->free
      // Lock other editing calls during edit
  });

  fm.post("/collection/order", function (req, res) {
    // Special endpoint for ordering collections
  });

  fm.post("/collection/:collectionId/upload", function (req, res) {
    if (!req.params['collectionId']) {
      return res.status(500).json({ error: 'No collection Provided' });
    }

    console.log(req.params['collectionId'])

    var result = dbCollections.get(  Number(req.params['collectionId'])  );
    console.log(result)
    if (!result) {
      res.status(422).json({ error: 'Collection not found' });
      return;
    }

    const saveTo = fe.join(program.media, req.params['collectionId']);
    if (!fs.existsSync(saveTo)) {
      makeDir.sync(saveTo);
    }

    // If collection is paid, make sure file is wav
      // Then transcode into other formats
    // If not paid
      // Check if transcode flag is true
    

    
    const busboy = new Busboy({ headers: req.headers });

    var responseObj = {};


    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      console.log(mimetype)
      console.log(`Uploading File: ${saveTo}`);
      responseObj[fieldname] = {};

      // Check if file exists
      if (fs.existsSync( fe.join(saveTo, filename) )) {
        responseObj[fieldname].success = false;
        responseObj[fieldname].error = 'File Already Exists';
        file.resume();
        return;
      }

      // Check if WAV
      // if(result.)

      // write song
      file.pipe(fs.createWriteStream( fe.join(saveTo, filename) ));

      // Create song in DB
      // add all paths to DB

      // Transcode!
    });

    busboy.on("finish", function () {
      res.json({ success: true });
    });

    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      console.log('Field [' + fieldname + ']: value: ' + val);
    });

    return req.pipe(busboy);
  });

  fm.post("/collection/:collectionId/reorder-songs", function (req, res) {
    // Special endpoint specifically for re-ordering
  });

  fm.post("/collection/:collectionId/file/edit", function (req, res) {
    // Edit songs pubic/subscriber/paid options
  });

  fm.post("/collection/:collectionId/file/:fileId/upload", function (req, res) {
    // Edit version number if necessary
    // Change format in DB, if necessary
    // Check if wav, if collection is paid
    // transcode if necessary
    // Edit file location, if necessary (And delete old file if necessary)
  });
}