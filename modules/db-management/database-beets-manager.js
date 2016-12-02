// Special functions for beets DB

// Download the database
// TODO: Fix these
mstream.get('/db/download-db', function(req, res){
  var file =  program.database;

  res.download(file); // Set disposition and send it.
});


// Get hash of database
mstream.get( '/db/hash', function(req, res){
  var hash = crypto.createHash('sha256');
  var fileStream = fs.createReadStream(program.database);

  hash.setEncoding('hex');
  fileStream.pipe(hash, { end: false });


  fileStream.on('end', function () {
    hash.end();

    var returnThis = {
      hash:String(hash.read())
    };

    res.send(JSON.stringify(returnThis));

  });
});





// // TODO: This thing has to be tested
//
// // TODO: These functions are for interacting withe the beets DB
//   // Includes: rescan DB, hash files
//   // Once DB has been updated, call functiosn in /db-write/database-beets-[mysql/sqlite/loki].js to pull info into publicDB
//
// const spawn = require('child_process').spawn;
// var scanLock = false;
// var yetAnotherArrayOfSongs = [];
// var totalFileCount = 0;
//
// exports.setup = function(mstream, program, rootDir, db){
//   const scanThisDir = program.beetspath; // TODO: Check that this is a real directory
//
//
//   mstream.get('/db/recursive-scan-beets', function(req,res){
//
//     if(scanLock === true){
//       // Return error
//       res.status(401).send('{"error":"Scan in progress"}');
//       return;
//     }
//
//     scanLock = true;
//     var cmd = spawn('beet', [ 'import', '-A', '--group-albums' , scanThisDir]);
//
//     cmd.stdout.on('data', (data) => {
//       console.log(`stdout: ${data}`);
//     });
//
//     cmd.stderr.on('data', (data) => {
//       console.log(`stderr: ${data}`);
//       scanLock = false;
//
//     });
//
//     cmd.on('close', (code) => {
//       console.log(`child process exited with code ${code}`);
//       hashFileBeets();
//
//       // TODO: Remove all empty dirs
//     });
//   });
//
//
//   function hashFileBeets(){
//    // var hashCmd = spawn('beet check -a');
//     var hashCmd = spawn('beet', [ 'check', '-a']);
//
//
//     hashCmd.stdout.on('data', (data) => {
//       console.log(`stdout: ${data}`);
//     });
//
//     hashCmd.stderr.on('data', (data) => {
//       console.log(`stderr: ${data}`);
//       scanLock = false;
//
//     });
//
//     hashCmd.on('close', (code) => {
//       console.log(`child process exited with code ${code}`);
//       scanLock = false;
//
//     });
//   }
//
//   // TODO: Function that will remove all empty folders
//   function removeEmptyFolders(){
//     var hashCmd = spawn('beet', [ 'check', '-a']);
//     // 'find ~ -type d -empty -delete'
//   }
//
//
//
//   mstream.get('/db/status-beets', function(req, res){
//     var returnObject = {};
//
//     returnObject.locked = scanLock;
//
//
//     if(scanLock){
//
//       // Currently we don't support filecount stats when using beets DB
//       // Dummy data
//       returnObject.totalFileCount = 0;
//       returnObject.filesLeft = 0;
//
//
//       res.json(returnObject);
//
//     }else{
//       var sql = 'SELECT Count(*) FROM items';
//
//       db.get(sql, function(err, row){
//         if(err){
//           console.log(err.message);
//
//           res.status(500).json({ error: err.message });
//           return;
//         }
//
//
//         var fileCountDB = row['Count(*)']; // TODO: Is this correct???
//
//         returnObject.totalFileCount = fileCountDB;
//         res.json(returnObject);
//
//       });
//     }
//
//   });
//
//
// }