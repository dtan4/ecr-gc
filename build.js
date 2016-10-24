'use strict';

let exec = require('child_process').exec;
let Package = require('./package');

function excludePath(key) {
  return 'node_modules/' + key + '\\*';
}

function excludePaths() {
  return Object.keys(Package.devDependencies).map(key => excludePath(key)).join(' ');
}

let command = 'zip -r dist/ecr-gc.zip index.js node_modules -x ' + excludePaths();

exec(command, { maxBuffer: 400 * 1024 }, (err, stdout, stderr) => {
  console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);

  if (err != null) {
    console.log('exec error: ' + err);
  }
});
