#!/usr/bin/env node

/**
 * Spoofify API and frontend server
 *
 * @version 0.0.1a
 * @author Spoofify <info@spoofifyapp.org>
 * @link http://spoofifyapp.org/
 * @copyright Copyright 2012-2012 Spoofify
 * @license http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0
 * @package Spoofify
 */

// ===========
// Environment
// ===========

// the current version of the API and app (debugging)
var appVersion = 1.1;

// if any calls to the API are allowed
var available = true;

// =========
// Libraries
// =========

// require Express
express = require('express');
var app = express();

// require fs
fs = require('fs');

// ========
// Handlers
// ========

// define handler for API
app.all('/api/*', function(req, res) {
  // let the API process that request
  api.process(available, req, res);
});

// define handler for static files
app.get('/*', function(req, res, next) {
  try {
    if(fs.lstatSync(__dirname + '/../static/' + req.params[0]).isFile()) {
      // file found, serve it
      console.info("Request: /" + req.params[0] + " (Static).");
      res.sendfile(dirname + '/../static/' + req.params[0]);
    } else {
      // not a file, no way to serve it -> send request to frontend
      next();
    }
  } catch(e) {
    // file does not exist -> send request to frontend
    next();
  }
});

// define handler for anything else (frontend)
app.all('/*', function(req, res) {
  console.info("Request: /" + req.params[0] + " (Frontend).");
  
  res.end("Works");
  
  // let the frontend process that
  frontend.process(req, res);
});

// ======================
// Print some information
// ======================

// Node version
console.info("Env: Node " + process.version);

// App version
console.info("Env: App v" + appVersion);

// Availability
console.info("Env: Available: " + available);

// Platform
console.info("Env: Platform: " + process.platform);

// PID
console.info("Env: PID: " + process.pid);

// RAM usage
console.info("Env: RAM usage: " + Math.round(process.memoryUsage().rss / 1000) / 1000 + " MB\n");

// ==========
// Load stuff
// ==========

console.info("Info: Waiting for modules to load.\n");

// define vars for error msgs
var echo = "";
var die = false;

// load the API and all API versions and methods
try {
  api = require(__dirname + '/api/api.js');
} catch(e) {
  // could not load API, will die!
  echo += "Fatal: Could not load API: \"" + e + "\"!\n";
  die = true;
}

// load the data manager
try {
  datamanager = require(__dirname + '/api/data.js');
} catch(e) {
  // could not load datamanager, will die!
  echo += "Fatal: Could not load data manager: \"" + e + "\"!\n";
  die = true;
}

// load the frontend with all pages
try {
  frontend = require(__dirname + '/frontend/frontend.js');
} catch(e) {
  // could not load frontend, will die!
  echo += "Fatal: Could not load frontend: \"" + e + "\"!\n";
  die = true;
}

// wait for completion
while(!die && (!frontend.loaded || !api.loaded || !datamanager.loaded)) {}

// RAM usage
console.info("Env: RAM usage incl. libraries: " + Math.round(process.memoryUsage().rss / 1000) / 1000 + " MB\n");

// ======================
// Check some other stuff
// ======================

// check if "static" exists
try {
  if(!fs.lstatSync(__dirname + '/../static').isDirectory()) {
    throw "Error: no such directory 'static'";
  }
} catch(e) {
  echo += "Fatal: \"" + e + "\"!\n";
  die = true;
}

// check if there were any errors
if(die) {
  process.stderr.write(echo);
  console.error("Fatal: Will now die!");
  process.exit(1);
} else {
  console.info("Info: Stuff was loaded successfully! Starting server.");
}

// =========
// Listening
// =========

// now listen on port 3000, if on NodeJitsu that will be changed to 80 automatically
var port = 3000;
app.listen(port);
console.info("Info: Listening on port " + port + ".\n");

// =====
// STDIN
// =====

process.stdin.resume();
process.stdin.setEncoding('utf8');

// let user get information (debugging)
process.stdin.on('data', function(data) {
  data = data.toString();
  
  // RAM usage
  if(data == "ram\n") {
    console.info("STDOUT: RAM usage: " + Math.round(process.memoryUsage().rss / 1000) / 1000 + " MB\n");
  }
  
  // number of users
  if(data == "users\n") {
    console.info("STDOUT: Number of users: " + datamanager.count());
  }
});

// if SIGINT is received, log that
process.on('SIGINT', function () {
  console.log("\nInfo: Got SIGINT. Will now exit gracefully. G-R-A-C-E-F. I'm dead.");
  process.exit(0);
});