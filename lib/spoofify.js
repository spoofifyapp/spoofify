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

// About the app
console.info("===========================================================");
console.info("Spoofify (http://spoofifyapp.org/)");
console.info("A proof-of-concept for Android permission based data piracy");
console.info("===========================================================\n");

// ====================
// Get some information
// ====================

if(process.env.npm_package_version === undefined) {
  console.warn('Warning: Spoofify seems not to be started via "npm start", so it can\'t access env stuff. Will do fallback.\n');
  var port = 3000;
  var version = "?";
  var available = true;
} else {
  var port = process.env.npm_package_config_port;
  var version = process.env.npm_package_version;
  var available = process.env.npm_package_config_available;
}

// =========
// Libraries
// =========

express = require('express');
var app = express();

fs = require('fs');
path = require('path');

sass = require('node-sass');

// ========
// Handlers
// ========

// define handler for API
app.all('/api/*', function(req, res) {
  // let the API process that request
  api.process(available, req, res);
});

// define handler for SCSS files (need to parse)
app.get('/*.css', function(req, res, next) {
  try {
    if(fs.lstatSync(__dirname + '/../static/' + req.params[0] + ".scss").isFile()) {
      // file found, serve it
      console.info("Request: /" + req.params[0] + ".css (SCSS).");
      fs.readFile(path.normalize(__dirname + '/../static/' + req.params[0] + ".scss"), function(err, data) {
        if(err) {
          console.error("Error: Error reading /static/" + req.params[0] + ".scss: " + err);
          return;
        }
        sass.render(data, function(e, css) {
          if(e) {
            console.error("Error: Error parsing /static/" + req.params[0] + ".scss: " + e);
            res.end("");
          } else {
            res.end(css);
          }
        });
      });
    } else {
      // not a file, no way to serve it -> send request to frontend
      next();
    }
  } catch(e) {
    // file does not exist -> send request to frontend
    next();
  }  
});

// define handler for all other static files
app.get('/*', function(req, res, next) {
  try {
    if(fs.lstatSync(__dirname + '/../static/' + req.params[0]).isFile()) {
      // file found, serve it
      console.info("Request: /" + req.params[0] + " (Static).");
      res.sendfile(path.normalize(__dirname + '/../static/' + req.params[0]));
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
app.get('/*', function(req, res) {
  console.info("Request: /" + req.params[0] + " (Frontend).");
  
  // let the frontend process that
  frontend.process(req, res);
});

// ======================
// Print some information
// ======================

// About the app
console.info("===========================================================");
console.info("Spoofify (http://spoofifyapp.org/)");
console.info("A proof-of-concept for Android permission based data piracy");
console.info("===========================================================\n");

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

var port = process.env.npm_package_config_port;
if(port === undefined) {
  console.warn('Warning: Spoofify seems not to be started via "npm start", so it can\'t access the port. Will do fallback.');
  port = 3000;
}
app.listen(port);
console.info("Info: Listening on port " + port + ".\n");

// =====
// STDIN
// =====

process.stdin.resume();
process.stdin.setEncoding('utf8');

// needed for a cool easteregg
var pseudodied = 0;

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
  
  // hidden eastereggs
  if(data == "hello\n") {
    console.info('STDOUT: Hi! How are you? Or should I say "...world"? And does this user interaction even make any sense?');
  }
  
  if(data == "die\n") {
    switch(pseudodied) {
      case 0:
        console.info("STDOUT: Uh oh. I really don't like that joke!");
        pseudodied = 1;
        break;
      case 1:
        console.info("STDOUT: You really want me to? Then use Ctrl-C.");
        console.info("STDOUT: D'oh! I told you that tip! (shit)");
        pseudodied = 2;
        break;
      case 2:
        console.info("STDOUT: Huh? You are still there? There is no secret bonus story!");
        setTimeout(function() {
          console.info("\nSTDOUT: Oops, I'm dead. Really. I'm so sorry.");
          console.info("Info: Got three (!) die signals from a stupid user. It's it's own fault. #dead");
          process.exit(0);
        }, 1000); 
    }
  }
});

// if SIGINT is received, log that
process.on('SIGINT', function () {
  console.log("\nInfo: Got SIGINT. Will now exit gracefully. G-R-A-C-E-F. I'm dead.");
  process.exit(0);
});