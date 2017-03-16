'use strict';

require('./lib/test-env.js');
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
        debug('Singup Post');
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
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempUser = user;
          done();
        })
        .catch(done);
      });
      after(done => {
        User.remove({})
        .then(() => done())
        .catch(done);
      });
      it('should return a token', done => {
        debug('Signin Get');
        request.get(`${url}/api/signin`)
        .auth('Cayla Zabel', 'isacodeboss')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
      });
    });
    describe('Without authorization', function(){
      before(done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempUser = user;
          done();
        })
        .catch(done);
      });
      after(done => {
        User.remove({})
        .then(() => done())
        .catch(done);
      });
      it('should return a token', done => {
        debug('Signin Get');
        request.get(`${url}/api/signin`)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
    describe('Without Basic in authorization', function(){
      before(done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempUser = user;
          done();
        })
        .catch(done);
      });
      after(done => {
        User.remove({})
        .then(() => done())
        .catch(done);
      });
      it('should return a token', done => {
        debug('Signin Get');
        request.get(`${url}/api/signin`)
        .set({
          Authorization: `${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
    describe('Without Username in  authorization', function(){
      before(done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempUser = user;
          done();
        })
        .catch(done);
      });
      after(done => {
        User.remove({})
        .then(() => done())
        .catch(done);
      });
      it('should return a token', done => {
        debug('Signin Get');
        request.get(`${url}/api/signin`)
        .set({
          Authorization: 'Basic Random Text'
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
    describe('With Username authorizationbut not password', function(){
      before(done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempUser = user;
          done();
        })
        .catch(done);
      });
      after(done => {
        User.remove({})
        .then(() => done())
        .catch(done);
      });
      it('should return a token', done => {
        debug('Signin Get');
        request.get(`${url}/api/signin`)
        .set({
          Authorization: 'Basic username:'
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });
  describe('Get /', function(){
    describe('I wouldnt know how to error this', function(){
      it('should return a message', done => {
        request.get(`${url}/`)
        .end((err, res) => {
          expect(res.text).to.equal('This is working!!');
          done();
        });
      });
    });
  });
});
