'use strict';

require('./lib/test-env.js');
const expect = require('chai').expect;
const request = require('superagent');
const awsMocks = require('./lib/aws-mocks.js'); //eslint-disable-line
// const mongoose = require('mongoose');
// const Promise = require('bluebird');
const serverToggle = require('./lib/server-toggle.js');
const server = require('../server.js');


const Comment = require('../model/comment.js');
const User = require('../model/user.js');
const Post = require('../model/post.js');
const Category = require('../model/category.js');

const url = `http://localhost:${process.env.PORT}`;

const examplePost ={
  name: 'example post name',
  desc: 'example post desc',
  imageURI: `${__dirname}/data/tester.png`,
  price:5,
  objectKey: 'example image key'
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
  after( done => {
    serverToggle.serverOff(server, done);
  });

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
        examplePost.categoryID = this.tempCategory._id;
        examplePost.userID = this.tempUser._id;
        new Post(examplePost).save()
        .then(post=>{
          this.tempPost = post;
          exampleComment.userId = this.tempUser._id;
          exampleComment.postId = this.tempPost._id;

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
        request.post(`http://localhost:${process.env.PORT}/api/post/${this.tempPost._id}/comment`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('message', 'sugey,brian,cayla,jermiah' )
        .field('postId', exampleComment.postId.toString())
        .field('userId', exampleComment.userId.toString())
        .attach('image', exampleComment.image)
        .end((err, res) => {
          if(err) return done(err);
          console.log('*****');
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal(exampleComment.message)
          // expect(res.body.imageURI).to.equal(awsMock.uploadMock)
          expect(res.body.postId).to.equal(this.tempPost._id.toString());
          done();
        });
      });
    });
  });
});
