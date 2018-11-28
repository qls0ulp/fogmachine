#!/usr/bin/env node
"use strict";

// Check if we are in an electron environment
if (process.versions["electron"]) {
  // off to a separate electron boot environment
  require("./fogmachine-electron.js");
  return;
}

var program = require("./modules/config/configure-commander.js").setup(process.argv);

// User ran a maintenance operation.  End the program
if(!program){
  return;
}

// Check for errors
if (program.error) {
  console.log(program.error);
  process.exit(1);
  return;
}

const colors = require('colors');
console.clear();
console.log(colors.bold(`
   ___
  | __|__  __ _
  | _/ _ \\/ _\` |
  |_|\\___/\\__, |  _    _
  |  \\/  ||___/__| |_ (_)_ _  ___ 
  | |\\/| / _\` / _| ' \\| | ' \\/ -_)
  |_|  |_\\__,_\\__|_||_|_|_||_\\___|`));
console.log(colors.blue.bold(`    Paul Sori - ${colors.underline('paul@fogmachine.io')}`));
console.log(colors.blue.bold(`    Louis Dauvergne - ${colors.underline('design@mstream.io')}`));
console.log();
console.log(colors.magenta.bold('Find a bug? Report it at:'));
console.log(colors.underline('https://github.com/IrosTheBeggar/fogmachine/issues'));
console.log();

// Boot the server
require("./fogmachine.js").init(program);
