'use strict';

const debug = require('debug')('decor8:basic-auth');
const createError = require('http-errors');

module.exports = function(req, res, next){
  debug('basic-auth');
  var authHeader = req.headers.authorization;
  if(!authHeader){
    return next(createError(401, 'authorization header required'));
  }

  var base64Header = authHeader.split('Basic ')[1];
  if(!base64Header){
    return next(createError(401, 'Username and Password required'));
  }
  var utf8Str = new Buffer(base64Header, 'base64').toString();
  var authArr = utf8Str.split(':');

  req.auth = {
    username: authArr[0],
    password: authArr[1],
  };

  if(!req.auth.username || !req.auth.password){
    return next(createError(401, 'usernameand password required'));
  }

  next();
};
