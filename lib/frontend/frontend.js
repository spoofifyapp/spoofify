/**
 * Spoofify frontend loader
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

// now, all is loaded -> tell the core to proceed
exports.loaded = true;

// process a request
exports.process = function(req, res) {
  res.end();
};