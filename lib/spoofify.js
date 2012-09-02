#!/usr/bin/env node

var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('Battle stations!')
  res.end();
}).listen(8080);

console.log('Info: Server has started on port 8080');