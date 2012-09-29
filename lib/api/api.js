/**
 * Spoofify API loader
 *
 * @version 0.0.1a
 * @author Spoofify <info@spoofifyapp.org>
 * @link http://spoofifyapp.org/
 * @copyright Copyright 2012-2012 Spoofify
 * @license http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0
 * @package Spoofify
 */

// set the module's status to "not loaded"
exports.loaded = false;

// ================
// Get API versions
// ================

// get all API versions and export them
exports.apiVersions = fs.readdirSync(__dirname + '/apis/');

// =========
// Load APIs
// =========

// define the array
var stuff = {};

// loop through versions
exports.apiVersions.forEach(function(apiversion) {
  categories = fs.readdirSync(__dirname + '/apis/' + apiversion + '/');

  // loop through categories (app/frontend)
  categories.forEach(function(category) {
    files = fs.readdirSync(__dirname + '/apis/' + apiversion + '/' + category + '/');

    // loop through API methods
    files.forEach(function(file) {
      // change the filename to match API calls
      filename = file.substr(0, file.length - 3).replace("-", "/");
      // add the method to the array
      stuff[apiversion + "/" + category + "/" + filename] = require(__dirname + '/apis/' + apiversion + '/' + category + '/' + file);
    });
  });
});

// export the API methods
exports.apis = stuff;

// now, all is loaded -> tell the core to proceed
exports.loaded = true;

// =================
// Process a request
// =================

exports.process = function(available, req, res) {
  // test the structure of the request
  if(!/.+\/.+\/.+\/.+\/.*/.test(req.params[0])) {
    console.warn("Warn: Request /api/" + req.params[0] + " is not valid (invalid structure)");
    res.end(exports.close(418, {}, false, res));
    return;
  }

  // get the ID from the request URI
  matches = req.params[0].match(/((.|\n)*)\/(?!(.|\n)*\/)((.|\n)*)/);

  // check if the API is available
  if(!available) {
    res.end(exports.close(503, {"available": false}, matches[1], res));
    return;
  }

  // check if server is ready to take a user
  if(datamanager.count() > 15) {
    console.warn("Warn: Server is overloaded: " + datamanager.count() + " devices registered.");
    res.end(exports.close(507, {}, matches[1], res));
    return;
  }

  catched = false;
  try {
    response = "";

    // get the correct API method
    apimethod = stuff[matches[1]];

    // check the requirements
    if(apimethod.requires.method.toLowerCase() != req.method.toLowerCase()) {
      // wrong HTTP method
      response = exports.close(405, {}, matches[1], res);
      throw "wrong HTTP method: " + req.method;
    } else if(apimethod.requires.auth && (matches[4] === "" || !datamanager.exists(matches[4]))) {
      // Auth not given
      response = exports.close(401, {}, matches[1], res);
      throw "auth required but not given";
    } else {
      Object.keys(apimethod.requires.params).forEach(function(key) {
        if(!req.param(apimethod.requires.params[key])) {
          // a param is not given
          response = exports.close(400, {}, matches[1], res);
          throw "param \"" + apimethod.requires.params[key] + "\" not given";
        }
      });
    }

    // all OK -> fire the method
    response = exports.close(200, apimethod.process(available, matches[4]), matches[1], res);
  } catch(err) {
    if(err == "TypeError: Cannot call method 'process' of undefined") {
      e = "method does not exist";
      response = exports.close(501, {}, matches[1], res);
    } else if(err == "TypeError: Cannot read property 'requires' of undefined") {
      e = "API version does not exist";
      response = exports.close(410, {}, matches[1], res);
    } else {
      e = err;
    }
    catched = true;

    if(response === undefined) {
      // API method has thrown an error
      exports.close(500, {}, matches[1], res);
      console.warn("Fatal: API method /api/" + req.params[0] + " contains an error: \"" + e + "\".");
    } else {
      console.warn("Warn: Request: /api/" + req.params[0] + " is not valid (" + e + ").");
    }
  }

  if(!catched) {
    console.info("Request: /api/" + req.params[0] + " (API).");
  }
};

// send back a JSON response
exports.close = function(statuscode, data, apicall, res) {
  if(data.MIMEType !== null) {
    // do not echo JSON -> echo directly
    res.type(data.MIMEType).status(statuscode);
    res.end(data.data);
    return true;
  } else {
    res.type('application/json').status(statuscode);
  }

  // is not a string, parse to echo JSON

  // split API call
  if(!apicall) {
    matchessplit = {
      1: false,
      2: false,
      3: false
    };
  } else {
    matchessplit = apicall.match(/(.+?)\/(.+?)\/(.+)/);
  }

  // add standard params
  json = {
    "apicall": matchessplit[3],
    "for": matchessplit[2],
    "apiversion": matchessplit[1],
    "status": statuscode
  };

  // add the method params
  for(var attrname in data) {
    json[attrname] = data[attrname];
  }

  // close the connection with the JSON output
  res.end(JSON.stringify(json));
  return true;
};
