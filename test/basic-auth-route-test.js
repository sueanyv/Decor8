'use strict';

require('test-env.js');
const awsMocks = require('./lib/aws-mocks.js'); //eslint-disable-line
const mongoose = require('mongoose');
const Promise = require('bluebird');
const expect = require('chai').expect;
const request = require('superagent');
const User = require('../model/user.js');
const debug = require('debug')('decor8:basic-auth-route-test');

const serverToggle = require('./lib/server-toggle.js');
const server = require('../server.js');

mongoose.Promise = Promise;

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'Cayla Zabel',
  password: 'isacodeboss',
  email: 'example@email.com'
};

describe('User Tests', function(){
  before( done => {
    serverToggle.serverOn(server, done);
  });
  after( done => {
    serverToggle.serverOff(server, done);
  });
  describe('Post /api/signup', function(){
    describe('With a valid body', function(){
      after(done => {
        User.remove({})
        .then(() => done())
        .catch(done);
      });
      it('should return a token', done => {
        debug('/api/signup');
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });
  });
  describe('Get /api/signin', function(){
    describe('With a valid body', function(){
      before(done => {
        
      })
    })
  })
});
