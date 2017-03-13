'use strict';

require('test-env.js');
const awsMocks = require('./lib/aws-mocks.js');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const expect = require('chai').expect;
const request = require('superagent');
const User = require('../model/user.js');
const debug = require('debug')('decor8:basic-auth-route-test');

mongoose.Promise = Promise;

const url = `http://localhost:${process.env.PORT}`
