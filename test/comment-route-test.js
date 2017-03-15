'use strict';

require('./lib/test-env.js');
const expect = require('chai').expect;
const request = require('superagent');
const awsMocks = require('./lib/aws-mocks.js'); //eslint-disable-line
// const mongoose = require('mongoose');
// const Promise = require('bluebird');
const serverToggle = require('./lib/server-toggle.js');
const server = require('../server.js');

const PORT = process.env.PORT || 3000;

const Comment = require('../model/comment.js');
const User = require('../model/user.js');
const Post = require('../model/post.js');
const Category = require('../model/category.js');

process.env.MONGODB_URI = 'mongodb://localhost/decor8';


const url = `http://localhost:${PORT}`;

const examplePost ={
  name: 'example post name',
  desc: 'example post desc',
  imageURI: 'example image uri',
  objectKey: 'example image key',
};

const exampleCategory = {
  categoryType:'chair',
  desc:'seating'
};

const exampleUser = {
  username: 'Cayla Zabel',
  password: 'isacodeboss',
  email: 'example@email.com'
};

const exampleComment = {
  message: 'sugey,brian,cayla,jermiah',
  image: `${__dirname}/data/tester.png`
};

describe('Comment Routes', function(){
  before( done => {
    serverToggle.serverOn(server, done);
  });
  // after( done => {
  //   serverToggle.serverOff(server, done);
  // });
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Comment.remove({}),
      Post.remove({}),
      Category.remove({})
    ])
    .then( () => done())
    .catch(done);
  });
  describe('POST: api/post/:postId/comment', ()=> {
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
      before(done =>{
        new Category(exampleCategory).save()
        .then(category => {
          this.tempCategory = category;
          done();
        }).catch(done);
      });
      before(done => {
        examplePost.userID = this.tempUser._id;
        examplePost.categoryID = this.tempCategory._id;
        new Post(examplePost).save()
        .then(post=>{
          this.tempPost = post;
          exampleComment.userId = this.tempUser._id;
          exampleComment.postId = post._id;
          done();
        }).catch(done);
      })
      after(done => {
        delete examplePost.userID;
        delete examplePost.categoryID;
        delete exampleComment.userId;
        delete exampleComment.postId
        done();
      })

      it('should return a comment', done => {
        console.log('in it in post test comments')
        request.post(`${url}/api/post/${this.tempPost._id}/comment`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('message', exampleComment.message)
        .field('userId', exampleComment.userId)
        .field('postId', exampleComment.postId)
        .attach('image', exampleComment.image)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
      });
    });
  });
});
