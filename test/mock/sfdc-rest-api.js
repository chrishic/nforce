var http        = require('http');
var util        = require('util');
var port        = process.env.PORT || 3000;
var lastRequest = null;
var nextResponse = null;
var closeOnRequest = false;
var isListening = false;
var apiCount = 0;
var apiLimit = 5000;

var sockets = [];

var server;

module.exports.setPort = function(p) {
  port = p;
}

module.exports.start = function(port, cb) {

  if(!port) port = process.env.PORT || 3000;

  server = http.createServer(function(req, res) {
      
    lastRequest = req;
    lastRequest.body = '';

    req.on('data', function(chunk) {
      lastRequest.body += chunk.toString();
    });

    req.on('end', function() {

      apiCount++;

      if(closeOnRequest) {
        if(sockets.length) {
          for(var i=0; i<sockets.length; i++) {
            sockets[i].destroy();
          }
        }
        return server.close();
      }

      var apiUsageHeader = util.format('api-usage=%d/%d', apiCount, apiLimit);

      if(nextResponse) {
        if (nextResponse && nextResponse.headers && typeof nextResponse.headers === 'object') {
          nextResponse.headers['sforce-limit-info'] = apiUsageHeader;
        }
        res.writeHead(nextResponse.code, nextResponse.headers);
        if(nextResponse.body) {
          res.write(nextResponse.body, 'utf8')
        }
      } else {
        res.writeHead(200, { 
          'Content-Type': 'application/json',
          'sforce-limit-info': apiUsageHeader
        });
      } 
      res.end();
    });
 
  });

  server.on('listening', function() {
    isListening = true;
  });

  server.on('close', function() {
    isListening = false;
  });

  server.on('connection', function(socket) {
    sockets.push(socket);
    socket.on('close', function () {
      sockets.splice(sockets.indexOf(socket), 1);
    });
  });

  server.listen(port, cb);

}

// return an example client
module.exports.getClient = function() {
  return {
    clientId: 'ADFJSD234ADF765SFG55FD54S',
    clientSecret: 'adsfkdsalfajdskfa',
    redirectUri: 'http://localhost:' + port + '/oauth/_callback',
    loginUri: 'http://localhost:' + port + '/login/uri',
    apiVersion: '27.0',
    maxSockets: Infinity
  }
}

// return an example client with connection pooling disabled
module.exports.getNoPoolingClient = function() {
  return {
    clientId: 'ADFJSD234ADF765SFG55FD54S',
    clientSecret: 'adsfkdsalfajdskfa',
    redirectUri: 'http://localhost:' + port + '/oauth/_callback',
    loginUri: 'http://localhost:' + port + '/login/uri',
    apiVersion: '27.0',
    maxSockets: 0
  }
}

// return an example oauth
module.exports.getOAuth = function() {
  return {
    id: 'http://localhost: ' + port + '/id/00Dd0000000fOlWEAU/005d00000014XTPAA2',
    issued_at: '1362448234803',
    instance_url: 'http://localhost:' + port,
    signature: 'djaflkdjfdalkjfdalksjfalkfjlsdj',
    access_token: 'aflkdsjfdlashfadhfladskfjlajfalskjfldsakjf'
  }
}

module.exports.setResponse = function(code, headers, body) {
  nextResponse = {
    code: code,
    headers: headers,
    body: body
  }
}

// return the last cached request
module.exports.getLastRequest = function() {
  return lastRequest;
}

// simulate a socket close on a request
module.exports.closeOnRequest = function(close) {
  closeOnRequest = close;
}

// reset the cache
module.exports.reset = function() {
  lastRequest = null;
  nextResponse = null;
  closeOnRequest = false;
  sockets = [];
}

// close the server
module.exports.stop = function(cb) {
  if(!isListening) {
    server = null;
    return cb();
  } else {
    server.close(cb);
    server = null;
  }
}