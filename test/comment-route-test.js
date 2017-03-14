'use strict';

require('./lib/test-env.js');
const expect = require('chai')
const request = require('superagent');
const awsMocks = require('./lib/aws-mocks.js'); //eslint-disable-line
const mongoose = require('mongoose');
const Promise = require('bluebird');
const serverToggle = require('./lib/server-toggle.js');
const server = require('../server.js');

const PORT = process.env.PORT || 3000;

const Comment = require('../model/comment.js');
const User = require('../model/user.js');
const Post = require('../model/post.js');

process.env.MONGODB_URI = 'mongodb://localhost/decor8';

require('../server.js');

const url = `http://localhost:${PORT}`;

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

const exampleComment = {
  message: 'sugey,brian,cayla,jermiah',
  imgURI: `${__dirname}/test/data/tester.png`
};

describe('Comment Routes', function(){
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
  describe('POST: api/post/:postId/comment', ()=> {
    describe('with a valid body', ()=> {
      after(done => {
        if (this.tempComment) {
          Comment.remove({})
            .then(() => done())
            .catch(done);
          return;
        }
        done();
      });

      it('should return a comment', done => {
        request.post(`POST: api/post/:postId/comment`)
          .send(exampleComment)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(200);
            this.tempcomment = res.body;
            done();
          });
      });

      // it('should ', done => {
      //   request.post(`${url}/api/comment`)
      //     .send(exampleComment)
      //     .end((err, res) => {
      //       if (err) return done(err);
      //       expect(res.status).to.equal(400);
      //       expect(res.body.title).to.equal('test comment title');
      //       this.tempComment = res.body;
      //       done();
      //     });
      // });
    });
  });
});
