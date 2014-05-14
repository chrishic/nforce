var nforce = require('../');
var NForceError = require('../lib/error');
var api = require('./mock/sfdc-rest-api');
var port   = process.env.PORT || 3000;
var should = require('should');

var server;
var lastRequest;

var org = nforce.createConnection(api.getClient());

var oauth = api.getOAuth();

describe('api-mock-errors', function() {

  beforeEach(function(done) {
    api.start(port, done);
  });

  describe('invalid json errors', function() {

    it('should return invalid json error on bad json from authenticate', function(done) {
      var body = '{myproperty: \'invalid json\'$$$$';
      api.setResponse(200, { 'content-type': 'application/json;charset=UTF-8' }, body);
      org.authenticate({ username: 'test', password: 'test'}, function(err, resp) {
        err.should.exist;
        err.should.be.an.instanceof(NForceError.ApiCallFailure);
        err.message.should.equal('Invalid JSON response from Salesforce');
        done();
      });
    });

    it('should return invalid json error on bad json from query', function(done) {
      var body = '{myproperty: \'invalid json\'$$$$';
      api.setResponse(200, { 'content-type': 'application/json;charset=UTF-8' }, body);
      org.query({query: 'SELECT Id FROM Account', oauth: oauth }, function(err, resp) {
        err.should.exist;
        err.should.be.an.instanceof(NForceError.ApiCallFailure);
        err.message.should.equal('Invalid JSON response from Salesforce');
        done();
      });
    });
  
  });
  
  // describe('non-json response errors', function() {
    
  //   it('should return non json error on bad json from authenticate', function(done) {
  //     var body = '<html></html>';
  //     api.setResponse(200, { 'content-type': 'text/html;charset=UTF-8' }, body);
  //     org.authenticate({ username: 'test', password: 'test'}, function(err, resp) {
  //       should.exist(err);
  //       err.should.be.an.instanceof(NForceError.ApiCallFailure);
  //       err.message.should.equal('Non-JSON response from Salesforce');
  //       done();
  //     });
  //   });

  // });

  describe('closed socket', function() {

    it('should return an error on closed socket', function(done) {
      api.closeOnRequest(true);
      org.query({query: 'SELECT Id FROM Account', oauth: oauth }, function(err, res) {
        err.should.exist;
        err.message.should.equal('socket hang up');
        done();
      });
    });

  });

  // reset the lastRequest
  afterEach(function(done) {
    api.reset();
    api.stop(done);
  });

});