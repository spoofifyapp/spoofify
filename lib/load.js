#!/usr/bin/env node

/**
 * Spoofify localization loader (preinstall)
 *
 * @version 0.0.1a
 * @author Spoofify <info@spoofifyapp.org>
 * @link http://spoofifyapp.org/
 * @copyright Copyright 2012-2012 Spoofify
 * @license http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0
 * @package Spoofify
 */

console.log("Fetching localizations...\n");

// require https to use it as a client and fs to save localization files
var https = require('https'),
    fs = require('fs'),
    pageData = '',
    json,
    jsonlocfile,
    tosave;

// get all available localizations
var req = https.get({ host: 'raw.github.com', path: '/spoofifyapp/spoofify-localization/master/' }, function (res) {
  res.setEncoding('utf8');

  // get data and save it
  res.on('data', function (chunk) {
    pageData += chunk;
  });

  // got the whole file
  res.on('end', function(){
    try {
      json = JSON.parse(pageData);
    } catch(e) {
      // no valid JSON
      console.error("Could not load list of localizations: " + e);
      process.exit(1);
    }
    
    // fetch every localization and process it
    Object.keys(json).forEach(function(key) {
      // fetch the file
      https.get({ host: 'raw.github.com', path: '/spoofifyapp/spoofify-localization/master/' + key + '.json' }, function(res) {
        var pageData = "";
        res.setEncoding('utf8');

        // get data and save it
        res.on('data', function (chunk) {
          pageData += chunk;
        });

        // got the whole file
        res.on('end', function(){
          // parse the JSON
          try {
            jsonlocfile = JSON.parse(pageData);
          } catch(e) {
            console.error("Could not load localization file \"" + json[key].name + "\": " + e);
            process.exit(1);
          }

          // add the meta data
          jsonlocfile["i18n.nativename"] = json[key].name;
          jsonlocfile["i18n.author"] = json[key].by;
          jsonlocfile["i18n.version"] = json[key].version;

          // stringify it back again
          tosave = JSON.stringify(jsonlocfile);

          // save it into localization dir
          console.log('Saved localization "' + json[key].name + '" into ./frontend/.locales/' + key + '.json');
          fs.writeFileSync(__dirname + '/../frontend/.locales/' + key + '.json', tosave);
        });
      }).on('error', function(e) {
        // echo errors from a localization file
        console.error("Could not load localization file \"" + json[key].name + "\": " + e);
        process.exit(1);
      });
    });
  });
}).on('error', function(err) {
  // echo errors from the .localizations file
  console.error("Could not load list of localizations: " + err);
  process.exit(1);
});

// complete the output
process.on('exit', function() {
  console.log("\nFetched all " + Object.keys(json).length + " available localizations.\nWill exit with exit 0.\n");
  process.exit(0);
});