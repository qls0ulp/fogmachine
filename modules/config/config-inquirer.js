const inquirer = require('inquirer');
const colors = require('colors');
const fs = require('fs');
const path = require('path');

// TODO: Get this from login module
const hashConfig = {
  // size of the generated hash
  hashBytes: 32,
  // larger salt means hashed passwords are more resistant to rainbow table, but
  // you get diminishing returns pretty fast
  saltBytes: 16,
  iterations: 15000,
  encoding: 'base64'
};

exports.init = function(filepath, callback) {
  console.log(filepath)
  if (!filepath) {
    console.log(colors.yellow('No filepath given'));
    return;
  }

  // Check that path exists
  if (fs.existsSync(filepath)) {
    inquirer
    .prompt([{
      message: "This file already exists. Do you want to overwrite it?",
      type: "confirm",
      name: "confirm"
    }])
    .then(answers => {
      if(answers.confirm === true) {
        fs.writeFileSync( filepath, JSON.stringify({}), 'utf8');
        return callback();
      }
    });
  }else {
    fs.writeFileSync( filepath, JSON.stringify({}), 'utf8');
    callback();
  }
}

exports.makeSecret = function(current, callback) {
  if (current.secret) {
    ask1();
  } else{
    ask2();
  }

  function ask1() {
    inquirer
    .prompt([{
      message: "You already have a secret. Would you like to make a new one?  All login sessions will no longer be valid",
      type: "confirm",
      name: "confirm"
    }])
    .then(answers => {
      if(answers.confirm === true) {
        ask2();  
      }
    });
  }

  function ask2() {
    inquirer
    .prompt([{
      message: "Would you like to auto-generate a secret",
      type: "confirm",
      name: "confirm"
    }])
    .then(answers => {
      if(answers.confirm === true) {
        require('crypto').randomBytes(48, function (err, buffer) {
          current.secret = buffer.toString('hex');
          callback(current);
        });
      } else {
        ask3();
      }
    });
  }


  function ask3() {
    inquirer
    .prompt([{
      message: "Enter your secret",
      type: "input",
      name: "secret",
      validate: answer => {
        if (answer.length < 1) {
          return 'You need to enter a secret';
        }
        return true;
      }
    }])
    .then(answers => {
      current.secret = answers.secret;
      callback(current);
    });
  }
}

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

exports.editPort = function(current, callback) {
  if (current.port) {
    console.log(`Port is currently set to ${current.port}`);
  } else {
    console.log('Port is set to default: 3000');
  }

  inquirer
    .prompt([{
      message: "Port Number (1 - 65535):",
      type: "input",
      name: "port",
      validate: answer => {
        if (!Number.isInteger(Number(answer)) || Number(answer) < 1 || Number(answer) > 65535) {
          return 'Port must be a an integer between 1 and 65535!';
        }
        return true;
      }
    }])
    .then(answers => {
      current.port = Number(answers.port);
      callback(current);
    });
}

exports.deleteUser = function(current, callback) {
  if(!current.users || Object.keys(current.users).length === 0){
    console.log(colors.yellow('No users found'));
    return;
  }

  var users = [];
  Object.keys(current.users).forEach(key => {
    users.push({ name: key });
  });

  inquirer
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

      callback(current);
    });
}

exports.addUser = function(current, callback) {
  inquirer
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
    .then(answers => {
      if(!current.users){
        current.users = {};
      }

      generateSaltedPassword(answers.password, (salt, hashedPassword) => {
        current.users[answers.username] = {
          password: hashedPassword,
          salt: salt
        };

        callback(current);
      });
    });


  function generateSaltedPassword(password, cb) {
    require('crypto').randomBytes(hashConfig.saltBytes, function (err, salt) {
      if (err) {
        console.log(`Failed to hash password`);
        return;
      }
      require('crypto').pbkdf2(password, salt, hashConfig.iterations, hashConfig.hashBytes, 'sha512', function (err, hash) {
        if (err) {
          console.log(`Failed to hash password`);
          return;
        }
        cb(salt, new Buffer(hash).toString('hex'));
      });
    });
  }
}

exports.mediaPath = function(current, filepath, callback) {
  if(!filepath){
    console.log(colors.yellow('No path given'));
    console.log(`Please add the path after the  ${colors.blue('--addpath')} command`);
    return;
  }

  // Turn relative paths into absolute paths
  if (!path.isAbsolute(filepath)){
    filepath = path.join(process.cwd(), filepath);
  }

  // Check that path exists
  if (!fs.existsSync(filepath)) {
    console.log(colors.yellow('Path does not exist!'));
    return;
  }

  if (!fs.statSync(filepath).isDirectory()) {
    console.log(colors.yellow('Path is not a directory'));
    return;
  }

  current.media = filepath;
  callback(current);
}
