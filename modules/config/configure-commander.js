

const program = require('commander');
const fs = require('fs');
const colors = require('colors');

exports.setup = function (args) {
  program
    .version('0.1.0')
    // Server Config
    .option('-p, --port <port>', 'Select Port', /^\d+$/i, 3000)
    .option('-i, --userinterface <folder>', 'Specify folder name that will be served as the UI', 'public')
    .option('-s, --secret <secret>', 'Set the login secret key')
    .option('-I, --images <images>', 'Set the image folder')
    .option('-m, --media <media>', 'Set the media folder', process.cwd())

    // SSL
    .option('-c, --cert <cert>', 'SSL Certificate File')
    .option('-k, --key <key>', 'SSL Key File')

    // User System
    .option('-u, --user <user>', 'Set Username')
    .option('-x, --password <password>', 'Set Password')

    // DB
    .option('-d, --database <path>', 'Specify Database Filepath', 'fog.db')

    // JSON config
    .option('-j, --json <json>', 'Specify JSON Boot File')

    // Mod JSON Commands
    .option("--adduser", "Adds user to JSON file")
    .option("--mediapath <folder>", "Adds path to JSON file")
    .option("--init <file>", "Makes a new JSON file")
    .option("--editport", "Edits the port")
    .option("--addkey <file>", "Add an SSL Key")
    .option("--addcert <file>", "Add an SSL Cert")
    .option("--makesecret", "Add an SSL Cert")
    .option("--removeuser", "Delete User From Config")

    .parse(args);
  
  if (program.init) {
    require('./config-inquirer').init(program.init, () => {
      console.log(colors.green(`Created ${program.init}!`));
    });
    return false;
  }

  // Use JSON config
  if (program.json) {
    try {
      var loadJson = JSON.parse(fs.readFileSync(program.json, 'utf8'));
    } catch (error) {
      // This condition is hit only if the user entered a json file as an argument and the file did not exist or is invalid JSON
      console.log("ERROR: Failed to parse JSON file");
      return false;
    }

    if (program['adduser']) {
      require('./config-inquirer').addUser(loadJson, modJson => {
        fs.writeFileSync( program.json, JSON.stringify(modJson), 'utf8');
        console.log(colors.green('User Added!'));
      });
      return false;
    }

    if (program['mediapath']) {
      require('./config-inquirer').mediaPath(loadJson, program.addpath, modJson => {
        fs.writeFileSync( program.json, JSON.stringify(modJson), 'utf8');
        console.log(colors.green('Folder Added!'));
      });
      return false;
    }

    if (program['editport']) {
      require('./config-inquirer').editPort(loadJson, modJson => {
        fs.writeFileSync( program.json, JSON.stringify(modJson), 'utf8');
        console.log(colors.green('Port Updated!'));
      });
      return false;
    }

    if (program['addkey']) {
      require('./config-inquirer').addKey(loadJson, program.addkey, modJson => {
        fs.writeFileSync( program.json, JSON.stringify(modJson), 'utf8');
        console.log(colors.green('SSL Key Added!'));
      });
      return false;
    }

    if (program['addcert']) {
      require('./config-inquirer').addCert(loadJson, program.addcert, modJson => {
        fs.writeFileSync( program.json, JSON.stringify(modJson), 'utf8');
        console.log(colors.green('SSL Cert Added!'));
      });
      return false;
    }

    if (program['makesecret']) {
      require('./config-inquirer').makeSecret(loadJson, modJson => {
        fs.writeFileSync( program.json, JSON.stringify(modJson), 'utf8');
        console.log(colors.green('Secret Added!'));
        console.log('Your login sessions will now persist between server reboots');
      });
      return false;
    }

    if (program['removeuser']) {
      require('./config-inquirer').deleteUser(loadJson, modJson => {
        fs.writeFileSync( program.json, JSON.stringify(modJson), 'utf8');
        console.log(colors.green('User Deleted'));
      });
      return false;
    }

    // No commands, continue
    return require('./configure-json-file.js').setup(loadJson);
  }

  let program3 = {
    port: program.port,
    userinterface: program.userinterface,
    media: program.media,
    database: program.database
  }

  // Secret
  if (program.secret) {
    program3.secret = program.secret;
  }

  // User account
  if (program.user && program.password) {
    program3.users = {};
    program3.users[program.user] = {
      password: program.password,
    }
  }

  // SSL stuff
  if (program.key && program.cert) {
    program3.ssl = {};
    program3.ssl.key = program.key;
    program3.ssl.cert = program.cert;
  }

  // images
  if (program.images) {
    program3.albumArtDir = program.images;
  }

  return program3;
}
