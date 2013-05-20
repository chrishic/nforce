var util = require('util');


//---------------------------------------------------
//
//  Base error definitions
//
//  All custom errors should inherit off either UncheckedError or CheckedError.
//
//---------------------------------------------------

var UncheckedError = function (msg, constr) {
    Error.captureStackTrace(this, constr || this);
    this.message = msg || 'Error';
};
util.inherits(UncheckedError, Error);
UncheckedError.prototype.name = 'Runtime Error';


var CheckedError = function (msg) {
    this.message = msg || 'Error';
};
util.inherits(CheckedError, Error);
CheckedError.prototype.name = 'Application Error';


//---------------------------------------------------
//
//  Custom errors
//
//---------------------------------------------------

var ApiCallFailure = function (msg, errorCode, statusCode) {
    ApiCallFailure.super_.call(this, msg);
    this.errorCode = errorCode || '';
    this.statusCode = statusCode || '';
};
util.inherits(ApiCallFailure, CheckedError);
ApiCallFailure.prototype.name = 'SF REST API Error';


//---  Export the custom app errors

module.exports = {
    ApiCallFailure: ApiCallFailure
};
