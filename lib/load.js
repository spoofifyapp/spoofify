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
    json = JSON.parse(pageData);

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
          jsonlocfile = JSON.parse(pageData);

          // add the meta data
          jsonlocfile.localization = {
            "nativename": json[key].name,
            "author": json[key].by,
            "version": json[key].version
          }

          // stringify it back again
          tosave = JSON.stringify(jsonlocfile);

          // save it into localization dir
          fs.writeFile(__dirname + '/../data/localization/' + key + '.json', tosave, function (err) {
            if (err) throw err;
            console.log('Saved localization "' + json[key].name + '".');
          });
        });
      }).on('error', function(e) {
        // echo errors from a localization file
        console.error("localization file " + json[key].name + ": " + e);
      });
    });
  });
}).on('error', function(err) {
  // echo errors from the .localizations file
  console.error(".localizations file: " + err);
});