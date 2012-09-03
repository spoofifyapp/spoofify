/**
 * Spoofify API: /app/new/request/
 *
 * @version 0.0.1a
 * @author Spoofify <info@spoofifyapp.org>
 * @link http://spoofifyapp.org/
 * @copyright Copyright 2012-2012 Spoofify
 * @license http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0
 * @package Spoofify
 */

// the requirements for this API call
exports.requires = {
  "method": "GET",
  "auth": false,
  "params": [
    
  ]
}

// the processing function
exports.process = function(available) {
  return {
    "available": available,
  };
}