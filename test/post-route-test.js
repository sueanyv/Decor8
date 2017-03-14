'use strict';

require('./lib/test-env.js');

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const awsMocks = require('./lib/aws-mocks.js');

const Post = require('../model/post.js');
const User = require('../model/user.js');
const Category = require('../model/category.js');

const AWS = require('aws-sdk-mock');

const serverToggle = require('./lib/server-toggle.js');
const server = require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const fakeUser = {
  username: 'fakeuser',
  password: '1234',
  email: 'fakeuser@test.com'
};

const fakeCategory = {
  name: 'test category',
  desc: 'test category description'
};

const fakePost = {
  name: 'test post',
  desc: 'test post description',
  image: `${__dirname}/data/tester.png`
};


describe('Post Routes', function() {
  before( done => {
    serverToggle.serverOn(server, done);
  });
  
  after( done => {
    serverToggle.serverOff(server, done);
  });

  afterEach( done => {
    Promise.all([
      Post.remove({}),
      User.remove({}),
      Category.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/category/:id/post', function() {
    describe('with a valid token and valid data', function() {
      before( done => {
        new User(fakeUser)
        .generatePasswordHash(fakeUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      before( done => {
        fakeCategory.userID = this.tempUser._id.toString();
        new Category(fakeCategory).save()
        .then( category => {
          this.tempCategory = category;
          done();
        })
        .catch(done);
      });

      after( done => {
        delete fakeCategory.userID;
        done();
      });

      it('should return a post', done => {
        request.post(`${url}/api/category/${this.tempCategory._id}/post`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('name', fakePost.name)
        .field('desc', fakePost.desc)
        .attach('image', fakePost.image)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(fakePost.name);
          expect(res.body.desc).to.equal(fakePost.desc);
          expect(res.body.categoryID).to.equal(this.tempCategory._id.toString());
          expect(res.body.imageURI).to.equal(awsMocks.uploadMock.Location);
          done();
        });
      });
    });
  });
});
