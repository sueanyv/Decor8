'use strict';

const jsonParser = require('body-parser');
const debug = require('debug')('decor8:profile-router');
const Router = require('express').Router;
const createError = require('http-errors');

const Profile = require('../model/profile.js');
const bearerAuth = require('../lib/bearer-auth-middleware');

const profileRouter = module.exports = Router();

profileRouter.post('/api/profile', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/profile');

  req.body.userID = req.user._id;
  new Profile(req.body).save()
  .then( profile => res.json(profile))
})
