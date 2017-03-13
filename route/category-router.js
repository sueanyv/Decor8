'use strict';

const Router = require('express').Router;
const debug = require('debug')('decor8:categoryRouter');
const createError = require('http-errors');

const jsonParser = require('body-parser').json();
const bearerAuth = require('bearer-auth-middleware.js');

const Category = require('../model/category.js');

const categoryRouter = Module.exports = Router();

categoryRouter.post('/api/category', bearerAuth, jsonParser, function(req, res, next){
  debug('Post /api/category');

  return new Category(req.body).save()
  .then(category => res.json(category))
  .catch(next);
})

categoryRouter.get('/api/category/:id', bearerAuth, function(req, res, next){
  debug('')
})
