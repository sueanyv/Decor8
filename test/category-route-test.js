'use strict';

require('./lib/test-env.js');
const expect = require('chai').expect;
const request = require('superagent');
const awsMocks = require('./lib/aws-mocks.js'); //eslint-disable-line
const mongoose = require('mongoose');
const Promise = require('bluebird');

const Category = require('../model/category.js');
const Post = require('../model/post.js');
const User = require('../model/user.js');

const url = `http://localhost:${process.env.PORT}`;
const serverToggle = require('./lib/server-toggle.js');
const server = require('../server.js');

const exampleCategory = {
  categoryType: 'test category',
  desc: 'test desc'
};

const examplePost ={
  name: 'example post name',
  desc: 'example post desc',
  imageURI: 'example image uri',
  objectKey: 'example image key',
};

const exampleUser = {
  username: 'Cayla Zabel',
  password: 'isacodeboss',
  email: 'example@email.com'
};

mongoose.promise = Promise;

describe('Category Routes', function(){
  before( done => {
    serverToggle.serverOn(server, done);
  });
  after( done => {
    serverToggle.serverOff(server, done);
  });
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Category.remove({}),
      Post.remove({})
    ])
    .then( () => done())
    .catch(done);
  });
  describe('POST /api/category', function(){
    describe('With a valid body', function(){
      before(done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then(token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });
      it('should return a Category', done => {
        request.post(`${url}/api/category`)
        .send(exampleCategory)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.categoryType).to.equal(exampleCategory.categoryType);
          expect(res.body.desc).to.equal(exampleCategory.desc);
          done();
        });
      });
    });
    describe('With an invalid body', function(){
      before(done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then(token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });
      it('should return a Category', done => {
        request.post(`${url}/api/category`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
    describe('Without a token', function(){
      before(done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then(token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });
      it('should return a Category', done => {
        request.post(`${url}/api/category`)
        .send(exampleUser)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });
  describe('Get api/category/:id', function(){
    describe('with a valid body', function(){
      before(done => {
        new Category(exampleCategory).save()
        .then(category => {
          this.tempCategoryId = category._id;
          done();
        })
        .catch(done);
      });
      before(done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then(token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });
      it('should return a category', done => {
        request.get(`${url}/api/category/${this.tempCategoryId}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.categoryType).to.equal(exampleCategory.categoryType);
          expect(res.body.desc).to.equal(exampleCategory.desc);
          done();
        });
      });
    });
  });
});
