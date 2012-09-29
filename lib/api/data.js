/**
 * Spoofify API data manager
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

// load the cache
cachier = require('node-cachier');
cache = cachier.createCache();

// =========================
// Data management functions
// =========================

// count current users
exports.count = function() {
  return cache.size();
};

// check if user exists
exports.exists = function(user) {
  if(cache.get(user) === false) {
    return false;
  } else {
    return true;
  }
};

// put user's data
exports.put = function(user, data) {
  return cache.put(user, data, 600); // remove in 10 minutes
};

// get user's data
exports.get = function(user) {
  return cache.get(user);
};

// delete user
exports.del = function(user) {
  return cache.del(user);
};

// now, all is loaded -> tell the core to proceed
exports.loaded = true;
