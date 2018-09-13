const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.setup = function (fm, program) {
  // Create the user array
  var Users = program.users;
  // Crypto Config
  const hashConfig = {
    // size of the generated hash
    hashBytes: 32,
    // larger salt means hashed passwords are more resistant to rainbow table, but
    // you get diminishing returns pretty fast
    saltBytes: 16,
    iterations: 15000,
    encoding: 'base64'
  };

  for (let username in Users) {
    if(!Users[username]["password"]){
      console.log(`User ${username} is missing password and will not be able to log in!`)
      continue;
    }

    if (Users[username].salt) {
      // If the user already has a salt, it means the password is hashed and can be used as is
      Users[username].salt = new Buffer(Users[username].salt);
      continue;
    }

    generateSaltedPassword(username, Users[username]["password"]);
  }


  function generateSaltedPassword(username, password) {
    crypto.randomBytes(hashConfig.saltBytes, function (err, salt) {
      if (err) {
        console.log(`Failed to hash password for user ${username}`);
        return;
      }

      crypto.pbkdf2(password, salt, hashConfig.iterations, hashConfig.hashBytes, 'sha512', function (err, hash) {
        if (err) {
          console.log(`Failed to hash password for user ${username}`);
          return;
        }
        Users[username]['password'] = new Buffer(hash).toString('hex');
        Users[username]['salt'] = salt;
      });
    });
  }

  // Failed Login Attempt
  fm.get('/login-failed', function (req, res) {
    // Wait before sending the response
    setTimeout((function () {
      res.status(401).json({ error: 'Try Again' })
    }), 800);
  });

  fm.get('/access-denied', function (req, res) {
    res.status(403).json({ error: 'Access Denied' });
  });

  // Authenticate User
  fm.post('/login', function (req, res) {
    if (!req.body.username || !req.body.password) {
      return res.redirect('/login-failed');
    }

    let username = req.body.username;
    let password = req.body.password;

    // Check is user is in array
    if (typeof Users[username] === 'undefined') {
      // user does not exist
      return res.redirect('/login-failed');
    }

    if (!Users[username].password || !Users[username].password ) {
      console.log('User is missing password or salt');
      return res.redirect('/login-failed');
    }

    // Check is password is correct
    crypto.pbkdf2(password, Users[username]['salt'], hashConfig.iterations, hashConfig.hashBytes, 'sha512', function (err, verifyHash) {
      // Make sure passwords match
      if (new Buffer(verifyHash).toString('hex') !== Users[username]['password']) {
        return res.redirect('/login-failed');
      }

      // Return a JWT
      res.json({ token: jwt.sign({ username: username }, program.secret) });
    });
  });


  // Middleware that checks for token
  fm.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (!token) {
      return res.redirect('/access-denied');
    }

    // verifies secret and checks exp
    jwt.verify(token, program.secret, function (err, decoded) {
      if (err) {
        return res.redirect('/access-denied');
      }

      req.user = Users[decoded.username];
      req.user.username = decoded.username;

      next();
    });
  });
}
