
'use strict';

const jsonParser = require('body-parser').json();
const debug = require('debug')('cfgram:auth-router');
const Router = require('express').Router;
const basicAuth = require('../lib/basic-auth-middleware.js');

const User = require('../model/user.js');
const Post = require('../model/post.js');

const authRouter = module.exports = Router();

commentRouter.post('/api/comment', jsonParser, function(req, res, next) {
  debug('POST /api/comment');
  new comment(req.body).save()
    .then(comment =>
      res.json(comment))
    .catch(() => {
      console.log('catch statement running');
      return next(errorHandler(400, 'bad request error'));
    });
  });
