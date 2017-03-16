'use strict';

const debug = require('debug')('decor8:error-middleware');
const createError = require('http-errors');

module.exports = function(err, req, res, next){
  debug('error-middleware');

  console.error('name', err.name);
  console.error('message', err.message);
  console.error('status', err.status);

  if(err.name === 'ValidationError'){
    err = createError(400, err.message);
    res.status(err.status).send(err.name);
    return;
  }

  if(err.status){
    res.status(err.status).send(err.name);
    next();
    return;
  }

  if(err.name === 'CastError'){
    err = createError(404, err.mesage);
    res.status(err.status).send(err.name);
    return;
  }

  err = createError(500, err.message);
  res.status(err.status).send(err.name);
  next();
};
