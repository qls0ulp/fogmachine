const inquirer = require('inquirer');
inquirer.registerPrompt('directory', require('inquirer-select-directory'));
const colors = require('colors');
const fs = require('fs');
const path = require('path');
const Login = require('../login');
const br = require('os').EOL;
const defaults = require('../defaults').setup({});

exports.addKey = function(current, filepath, callback) {
  if (!filepath) {
    console.log(colors.yellow('No filepath given'));
    return;
  }

  // Turn relative paths into absolute paths
  if (!path.isAbsolute(filepath)){
    filepath = path.join(process.cwd(), filepath);
  }

  // Check that path exists
  if (!fs.existsSync(filepath)) {
    console.log(colors.yellow('Filepath does not exist!'));
    return;
  }

  if (!fs.statSync(filepath).isFile()) {
    console.log(colors.yellow('Supplied key is not a file'));
    return;
  }

  if (!current.ssl) {
    current.ssl = {};
  }

  current.ssl.key = filepath;
  callback(current);
}

exports.addCert = function(current, filepath, callback) {
  if (!filepath) {
    console.log(colors.yellow('No filepath given'));
    return;
  }

  // Turn relative paths into absolute paths
  if (!path.isAbsolute(filepath)){
    filepath = path.join(process.cwd(), filepath);
  }

  // Check that path exists
  if (!fs.existsSync(filepath)) {
    console.log(colors.yellow('Filepath does not exist!'));
    return;
  }

  if (!fs.statSync(filepath).isFile()) {
    console.log(colors.yellow('Supplied key is not a file'));
    return;
  }

  if (!current.ssl) {
    current.ssl = {};
  }

  current.ssl.cert = filepath;
  callback(current);
}

function editPort(loadJson) {
  console.clear();
  console.log();
  console.log(colors.blue.bold('FogMachine Configuration Wizard'));
  console.log(colors.magenta('Edit Port'));
  console.log();
  console.log(colors.yellow('Port defaults to 3000 if not set '));
  console.log();

  return inquirer
    .prompt([{
      message: "Port Number (1 - 65535):",
      type: "input",
      name: "port",
      default: loadJson.port ? loadJson.port : defaults.port,
      validate: answer => {
        if (!Number.isInteger(Number(answer)) || Number(answer) < 1 || Number(answer) > 65535) {
          return 'Port must be a an integer between 1 and 65535!';
        }
        return true;
      }
    }])
    .then(answers => {
      return Number(answers.port);
    });
}

function deleteOneUser(current) {
  if (!current.users || (Object.keys(current.users).length === 0 && current.users.constructor === Object)) {
    throw new Error('No users found');
  }

  console.clear();
  console.log();
  console.log(colors.blue.bold('FogMachine Configuration Wizard'));
  console.log(colors.magenta('Remove Users'));
  console.log();
  console.log(colors.yellow('Choose none to go back'));
  console.log();

  var users = [];
  Object.keys(current.users).forEach(key => {
    users.push({ name: key });
  });

  return inquirer
    .prompt([{
      message: "Choose Users To Be Deleted",
      type: "checkbox",
      name: "users",
      choices: users
    }])
    .then(answers => {
      if(!answers || !answers.users || answers.users.length < 1) {
        return;
      }

      answers.users.forEach(key => {
        delete current.users[key];
      });

      return;
    });
}

function addOneUser(current) {
  console.clear();
  console.log();
  console.log(colors.blue.bold('FogMachine Configuration Wizard'));
  console.log(colors.magenta('Add User'));
  console.log();

  var answers;
  return inquirer
    .prompt([{
      message: "Username:",
      type: "input",
      name: "username",
      validate: answer => {
        if (answer.length < 1) {
          return 'You need a username';
        }
        // Check that username doesn't already exist
        if (current.users && current.users[answer]) {
          return 'Username already exists';
        }
        return true;
      }
    },
    {
      message: "Password:",
      type: "password",
      name: "password",
      validate: answer => {
        if (answer.length < 1) {
          return 'You need a password';
        }
        return true;
      }
    }])
    .then(ans => {
      answers = ans;
      return hashPassword(answers.password);
    })
    .then((hashObj) => {
      if(!current.users){
        current.users = {};
      }
      current.users[answers.username] = {
        password: hashObj.hashPassword,
        salt: hashObj.salt
      };
    });
}

function hashPassword(password) {
  return  new Promise((resolve, reject) => {
    Login.hashPassword(password, (salt, hashedPassword, err) => {
      if (err) {
        // return callback(false, err);
        return reject('Failed to hash password');
      }
      resolve({salt, hashPassword: Buffer.from(hashedPassword).toString('hex')});
    });
  });
}

exports.wizard = function(filepath) {
  doTheThing(filepath);
}

function confirmThis(confirmText, defaults = false) {
  return inquirer
    .prompt([{
      message: confirmText,
      type: "confirm",
      name: "confirm",
      default: defaults
    }])
    .then(answers => {
      if(answers.confirm === true) {
        return true;
      }
      return false;
    });
}


async function doTheThing(filepath) {
  // Use the default file if none is provided
  if (typeof filepath !== 'string') {
    filepath = path.join(__dirname, '../../save/default.json');
  }
  filepath = path.resolve(filepath);

  // Create file if it does not exist
  var hasNewFileBeenCreated = false;
  if (!fs.existsSync(filepath)) {
    try {
      fs.writeFileSync( filepath, JSON.stringify({},  null, 2), 'utf8');
      hasNewFileBeenCreated = true;
    } catch (err) {
      console.log(colors.red('Failed to create a new file!'));
      console.log(colors.yellow('Check that you have the correct permissions'));
      console.log('Exiting Setup Wizard....');
      process.exit(1);
    }
  }

  // Load the file
  var loadJson;
  try {
    loadJson = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (error) {
    console.log();
    console.log("ERROR: Failed to parse JSON file");
    console.log();
    console.log('Exiting Setup Wizard...');
    console.log();
    process.exit(1);
  }
  
  const returnMain = await mainLoop(loadJson, filepath, hasNewFileBeenCreated);

  if(returnMain === 'finished2') {
    console.clear();
    console.log();
    console.log(colors.blue.bold('FogMachine Configuration Wizard'));
    console.log(colors.magenta('Config Not Saved!'));
    console.log();
    process.exit();
  }

  // Save
  fs.writeFileSync( filepath, JSON.stringify(loadJson,  null, 2), 'utf8');
  console.clear();
  console.log();
  console.log(colors.blue.bold('FogMachine Configuration Wizard'));
  console.log(colors.magenta('Config Saved!'));
  console.log();
  console.log(colors.bold('You can start FogMachine by running the command:'));
  console.log(`fogmachine -j ${filepath}`);
  console.log();
}

async function mainLoop(loadJson, filepath, hasNewFileBeenCreated) {
  var mainOpt = { select: true };
  while (mainOpt.select !== 'finished' && mainOpt.select !== 'finished2') {
    console.clear();
    console.log();
    console.log(colors.blue.bold('FogMachine Configuration Wizard'));
    console.log(colors.magenta('Main Menu'));
    console.log();
    console.log(`${colors.green('Config File:')} ${colors.bold(filepath)}`);
    console.log();

    if (hasNewFileBeenCreated) {
      console.log(colors.blue('A new config file has been saved!'));
      console.log();
      hasNewFileBeenCreated = false;
    }

    if (!loadJson.secret) {
      loadJson.secret = await generateSecret();
      console.log(colors.blue('A new secret key has been generated!'));
      console.log('The secret key is used to authenticate login sessions')
      console.log();
    }

    // Print if specified
    if (mainOpt.select === 'current') {
      console.log(loadJson);
      console.log();
    }

    mainOpt = await inquirer.prompt([{
      message: `Selection Option:`,
      pageSize: 12,
      type: "list",
      name: "select",
      choices: [
        { name: ' * User System', value: 'users' },
        { name: ' * Server Options', value: 'server' },
        new inquirer.Separator(),
        { name: 'See Current Config', value: 'current' },
        { name: 'Save and Exit', value: 'finished' },
        { name: 'Exit Without Saving', value: 'finished2' },
      ]
    }]).then(answers => {
      return answers;
    });

    switch (mainOpt.select) {
      case 'users':
        await userLoop(loadJson);
        break;
      case 'server':
        await serverLoop(loadJson);
        break;
      default:
        break;
    }
  }

  return mainOpt.select;
}

async function serverLoop(loadJson) {
  if (!loadJson.storage || typeof loadJson.storage !== 'object') {
    loadJson.storage = {};
  }

  var editUsers = { userList: true };
  var printErr;
  var printMsg;
  while (editUsers.userList !== 'finished') {
    console.clear();
    console.log();
    console.log(colors.blue.bold('FogMachine Configuration Wizard'));
    console.log(colors.magenta('Server Options'));
    console.log();

    if (printErr) {
      console.log(colors.red(printErr));
      console.log();
      printErr = null;
    }

    if (printMsg) {
      console.log(colors.blue(printMsg));
      console.log();
      printMsg = null;
    }

    editUsers = await inquirer.prompt([{
      message: 'Choose an option',
      type: "list",
      name: "userList",
      pageSize: 12,
      choices: [{ name: ' ← Go Back', value: 'finished' }, 
        new inquirer.Separator(),
        { name: ' * Port', value: 'editPort' },
        { name: ' * SSL', value: 'ssl' },
        { name: ' * Storage', value: 'storage' },
        { name: ` * Write Logs to Disk (${loadJson.writeLogs ? colors.green('Enabled') : colors.red('Disabled')})`, value: 'logs' },
        { name: ' * Generate New Authentication Secret', value: 'editSecret' },
        { name: ' * Change the Web App Directory', value: 'editUi' },
      ]
    }]).then(answers => {
      return answers;
    });

    switch (editUsers.userList) {
      case 'editPort':
        try {
          loadJson.port = await editPort(loadJson);
        } catch (err) {
          printErr = err.message;
        }
        break;
      case 'editSecret':
        try {
          await makeSecret(loadJson);
        } catch (err) {
          printErr = err.message;
        }
        break;
      case 'logs':
        try {
          await toggleLogging(loadJson);
        } catch (err) {
          printErr = err.message;
        }
        break;
      case 'editUi':
        try {
          await changeWebappFolder(loadJson);
        } catch (err) {
          printErr = err.message;
        }
        break;
      case 'storage':
        try {
          await storageLoop(loadJson);
        } catch (err) {
          printErr = err.message;
        }
        break;
      case 'ssl':
        try {
          if (loadJson.ssl && loadJson.ssl.key && loadJson.ssl.cert) {
            printMsg = `SSL is already configured${br}* ${colors.green('cert')}: ${loadJson.ssl.cert}${br}* ${colors.green('key')}: ${loadJson.ssl.key}`;
          } else {
            var didIt = await sslStuff(loadJson);
            if (didIt){
              printMsg = 'SSL Template Added'
            }
          }
          // await sslStuff(loadJson);
        }catch (err) {
          printErr = err.message;
        }
      default:
        break;
    }
  }
}

async function storageLoop(loadJson) {
  var editUsers = { userList: true };
  var printErr;
  var printMsg;
  while (editUsers.userList !== 'finished') {
    console.clear();
    console.log();
    console.log(colors.blue.bold('FogMachine Configuration Wizard'));
    console.log(colors.magenta('Storage'));
    console.log();
    console.log('Choose where FogMachine saves different files');
    console.log('By default, all files are saved in the /FogMachine folder and under the /save and /image-cache directories');
    console.log();
    console.log();

    if (printErr) {
      console.log(colors.red(printErr));
      console.log();
      printErr = null;
    }

    if (printMsg) {
      console.log(colors.blue(printMsg));
      console.log();
      printMsg = null;
    }

    editUsers = await inquirer.prompt([{
      message: 'Choose an option',
      type: "list",
      name: "userList",
      choices: [{ name: ' ← Go Back', value: 'finished' }, 
        new inquirer.Separator(),
        { name: ' * Album Art Directory', value: 'aa' },
        { name: ' * Media Directory', value: 'media' },
        { name: ' * Logs Directory', value: 'logs' },
        { name: ' * DB Directory', value: 'db' }
      ]
    }]).then(answers => {
      return answers;
    });

    switch (editUsers.userList) {
      case 'aa':
        try {
          await editAADirectory(loadJson);
        } catch (err) {
          printErr = err.message;
        }
        break;
      case 'media':
        try {
          await editMediaDirectory(loadJson);
        } catch (err) {
          printErr = err.message;
        }
        break;
      case 'db':
        try {
          await editDBDirectory(loadJson);
        } catch (err) {
          printErr = err.message;
        }
        break;
      case 'logs':
        try {
          await editLogsDirectory(loadJson);
        } catch (err) {
          printErr = err.message;
        }
        break;
      default:
        break;
    }
  }
}

function editMediaDirectory(loadJson) {
  console.clear();
  console.log();
  console.log(colors.blue.bold('FogMachine Configuration Wizard'));
  console.log(colors.magenta('Album Art Storage'));
  console.log();
  console.log(colors.yellow('FogMachine saves media files to one directory.  This directory is accessible through the API!'));
  console.log('By default, FogMachine uses the `/media` directory')
  console.log();
  console.log();

  return inquirer.prompt([{
    type: 'directory',
    name: 'from',
    message: 'Choose Media Folder:',
    basePath: loadJson.storage.mediaDirectory ? loadJson.storage.mediaDirectory : defaults.storage.mediaDirectory
  }]).then((answers) => {
    if (answers.from === defaults.storage.mediaDirectory) {
      delete loadJson.storage.mediaDirectory;
    } else {
      loadJson.storage.mediaDirectory = answers.from;
    }
    return answers.from;
  });
}

function editAADirectory(loadJson) {
  console.clear();
  console.log();
  console.log(colors.blue.bold('FogMachine Configuration Wizard'));
  console.log(colors.magenta('Album Art Storage'));
  console.log();
  console.log(colors.yellow('FogMachine saves all the album art images to one directory.  This directory is accessible through the API!'));
  console.log('By default, FogMachine uses the `/image-cache` directory')
  console.log();
  console.log();

  return inquirer.prompt([{
    type: 'directory',
    name: 'from',
    message: 'Choose Album Art Folder:',
    basePath: loadJson.storage.albumArtDirectory ? loadJson.storage.albumArtDirectory : defaults.storage.albumArtDirectory
  }]).then((answers) => {
    if (answers.from === defaults.storage.albumArtDirectory) {
      delete loadJson.storage.albumArtDirectory;
    } else {
      loadJson.storage.albumArtDirectory = answers.from;
    }
    return answers.from;
  });
}

function editDBDirectory(loadJson) {
  console.clear();
  console.log();
  console.log(colors.blue.bold('FogMachine Configuration Wizard'));
  console.log(colors.magenta('Database Storage'));
  console.log();
  console.log('FogMachine saves several DB files to this directory');
  console.log('By default, FogMachine uses the `/save` directory')
  console.log();
  console.log();

  return inquirer.prompt([{
    type: 'directory',
    name: 'from',
    message: 'Choose Directory:',
    basePath: loadJson.storage.dbDirectory ? loadJson.storage.dbDirectory : defaults.storage.dbDirectory
  }]).then((answers) => {
    if (answers.from === defaults.storage.dbDirectory) {
      delete loadJson.storage.dbDirectory;
    } else {
      loadJson.storage.dbDirectory = answers.from;
    }
    return answers.from;
  });
}

function editLogsDirectory(loadJson) {
  console.clear();
  console.log();
  console.log(colors.blue.bold('FogMachine Configuration Wizard'));
  console.log(colors.magenta('Logs Storage'));
  console.log();
  console.log('FogMachine will write all logs to this directory');
  console.log(`Writing logs to disk is currently: ${loadJson.writeLogs ? colors.green('Enabled') : colors.red('Disabled')}`)
  console.log();
  console.log();

  return inquirer.prompt([{
    type: 'directory',
    name: 'from',
    message: 'Choose Directory:',
    basePath: loadJson.storage.logsDirectory ? loadJson.storage.logsDirectory : defaults.storage.logsDirectory
  }]).then((answers) => {
    if (answers.from === defaults.storage.logsDirectory) {
      delete loadJson.storage.logsDirectory;
    } else {
      loadJson.storage.logsDirectory = answers.from;
    }
    return answers.from;
  });
}

async function toggleLogging(loadJson) {
  console.clear();
  console.log();
  console.log(colors.blue.bold('FogMachine Configuration Wizard'));
  console.log(colors.magenta('Logging'));
  console.log();
  console.log(`Logging is: ${loadJson.writeLogs ? colors.green('Enabled') : colors.red('Disabled') }`);
  console.log(`Logs will be written to: ${loadJson.storage.logsDirectory ? loadJson.storage.logsDirectory : defaults.storage.logsDirectory}`);
  console.log();

  const shouldFlip = await confirmThis(`Do you want to ${loadJson.writeLogs ? colors.red('DISABLE') : colors.green('ENABLE') } logging?`);
  if (shouldFlip) {
    loadJson.writeLogs = !loadJson.writeLogs;
  }
}

async function sslStuff(loadJson) {
  console.clear();
  console.log();
  console.log(colors.blue.bold('FogMachine Configuration Wizard'));
  console.log(colors.magenta('SSL Options'));
  console.log();
  console.log('FogMachine can use HTTPS, you just need to provide the SSL certificate and key');
  console.log();
  console.log(colors.yellow('You will have to add these manually, but this wizard can add the empty template to the config'));
  console.log();

  const shouldGen = await confirmThis('Would you like to generate an SSL template?');
  if (shouldGen){
    loadJson.ssl = {
      key: '',
      cert: ''
    }
  }

  return shouldGen;
}

async function makeSecret(loadJson) {
  // Secret
  if (!loadJson.secret) {
    loadJson.secret = await generateSecret();
  } else {
    console.clear();
    console.log();
    console.log(colors.blue.bold('FogMachine Configuration Wizard'));
    console.log(colors.magenta('Secret Generator'));
    console.log();
    console.log('The Secret Key is used to secure login sessions');
    console.log(colors.yellow('Generating a new secret will force all users to sign in again'));
    console.log();
    const shouldMakeNewSecret = await confirmThis("You already have a secret. Would you like to make a new one?");
    if (shouldMakeNewSecret) {
      loadJson.secret = await generateSecret();
    }
  }
}

function changeWebappFolder(loadJson) {
  console.clear();
  console.log();
  console.log(colors.blue.bold('FogMachine Configuration Wizard'));
  console.log(colors.magenta('Server Options'));
  console.log();

  const defaultDir = path.join(__dirname, '../../public');

  return inquirer.prompt([{
    type: 'directory',
    name: 'from',
    message: 'Choose Your Web App Folder:',
    basePath: loadJson.webAppDirectory ? loadJson.webAppDirectory : defaultDir
  }]).then((answers) => {
    if (answers.from === defaultDir) {
      delete loadJson.webAppDirectory;
    } else {
      loadJson.webAppDirectory = answers.from;
    }
    return answers.from;
  });
}

async function userLoop(loadJson) {
  if (!loadJson.users || typeof loadJson.users !== 'object') {
    loadJson.users = {};
  }
  var editUsers = { userList: true };
  var printErr;
  while (editUsers.userList !== 'finished') {
    console.clear();
    console.log();
    console.log(colors.blue.bold('FogMachine Configuration Wizard'));
    console.log(colors.magenta('User Options'));
    console.log();

    printUsers(loadJson.users);

    if (printErr) {
      console.log(colors.red(printErr));
      console.log();
      printErr = null;
    }

    editUsers = await inquirer.prompt([{
      message: 'Choose an option',
      type: "list",
      name: "userList",
      choices: [{ name: ' ← Go Back', value: 'finished' }, 
        new inquirer.Separator(),
        { name: ' * Add A User', value: 'addUser' },
        { name: ' * Remove Users', value: 'removeUser' }
      ]
    }]).then(answers => {
      return answers;
    });

    switch (editUsers.userList) {
      case 'addUser':
        try {
          await addOneUser(loadJson);
        } catch (err) {
          printErr = err.message;
        }
        break;
      case 'removeUser':
        try {
          await deleteOneUser(loadJson);
        } catch (err) {
          printErr = err.message;
        }
        break;
      default:
        break;
    }
  }
}

function generateSecret() {
  return new Promise((resolve, reject) => {
    require('crypto').randomBytes(48, function (err, buffer) {
      if (err) {
        reject();
      }
      resolve(buffer.toString('hex'));
    });
  });
}

function printUsers(users) {
  if (!users || Object.keys(users).length === 0) {
    console.log('There are currently no users');
    console.log(colors.yellow('With no users, FogMachine will be publicly available and the login system will be disabled'));
    console.log();
    return;
  }

  console.log('Your config has the following users:');
  Object.entries(users).forEach(([key, value]) => {
    console.log(` * ${colors.green.bold.dim(key)}`);
  });
  console.log();
}
