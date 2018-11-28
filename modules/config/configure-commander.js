

const program = require('commander');
const fs = require('fs');
const colors = require('colors');

exports.setup = function (args) {
  program
    .version('0.1.0')
    // Server Config
    .option('-p, --port <port>', 'Select Port', /^\d+$/i, 3000)
    .option('-s, --secret <secret>', 'Set the login secret key')
    .option('-L, --logs', 'Enable Write Logs To Disk')
    // SSL
    .option('-c, --cert <cert>', 'SSL Certificate File')
    .option('-k, --key <key>', 'SSL Key File')
    // User System
    .option('-u, --user <user>', 'Set Username')
    .option('-x, --password <password>', 'Set Password')
    // JSON config
    .option('-j, --json <json>', 'Specify JSON Boot File')
    // Mod JSON Commands
    .option("--addkey <file>", "Add an SSL Key")
    .option("--addcert <file>", "Add an SSL Cert")
    .option("--wizard [file]", "Setup Wizard")
    .parse(args);

  if (program['wizard']) {
    require('./config-inquirer').wizard(program.wizard);
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

    if (program['addkey']) {
      require('./config-inquirer').addKey(loadJson, program.addkey, modJson => {
        fs.writeFileSync( program.json, JSON.stringify(modJson, null, 2), 'utf8');
        console.log(colors.green('SSL Key Added!'));
      });
      return false;
    }

    if (program['addcert']) {
      require('./config-inquirer').addCert(loadJson, program.addcert, modJson => {
        fs.writeFileSync( program.json, JSON.stringify(modJson, null, 2), 'utf8');
        console.log(colors.green('SSL Cert Added!'));
      });
      return false;
    }

    // No commands, continue
    require('./configure-json-file.js').setup(loadJson);
    loadJson.configFile = program.json;
    return loadJson;
  }

  let program3 = {
    port: program.port
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

  // Logs
  if (program.logs) {
    program3.writeLogs = true;
  }

  return program3;
}
