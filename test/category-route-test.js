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

const examplePost ={ //eslint-disable-line
  name: 'example post name',
  desc: 'example post desc',
  price: 4,
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
    describe('with a valid id', function(){
      before(done => {
        new Category(exampleCategory).save()
        .then(category => {
          this.tempCategory = category;
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
      before(done => {
        examplePost.userID = this.tempUser._id;
        examplePost.categoryID = this.tempCategory._id;
        new Post(examplePost).save()
        .then(post => {
          this.examplePost = post;
          this.tempCategory.posts.push(this.examplePost._id);
          return Category.findByIdAndUpdate(this.tempCategory._id, this.tempCategory, {new:true});
        })
        .then(()=> done())
        .catch(done);
      });
      it('should return a category', done => {
        request.get(`${url}/api/category/${this.tempCategory._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.categoryType).to.equal(exampleCategory.categoryType);
          expect(res.body.desc).to.equal(exampleCategory.desc);
          expect(res.body.posts.length).to.equal(1);
          expect(res.body.posts[0]).to.be.a('object');
          done();
        });
      });
    });
    describe('with an invalid id', function(){
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
        request.get(`${url}/api/category/badid`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
    describe('with out a token', function(){
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
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });
  describe('GET /api/category', function(){
    before(done => {
      new Category(exampleCategory).save()
      .then(category => {
        this.tempCategory = category;
        done();
      })
      .catch(done);
    });
    before(done => {
      new Category({categoryType: 'beds', desc: 'this is a description'}).save()
      .then(category => {
        this.tempCategory = category;
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
    describe('With a token', () => {
      it('should return all galleries', done => {
        request.get(`${url}/api/category`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.length).to.equal(2);
          done();
        });
      });
    });
  });
  describe('PUT /api/category/:id', function(){
    describe('With a valid body, id, and token', function(){
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
      it('should return an update Category', done => {
        request.put(`${url}/api/category/${this.tempCategoryId}`)
        .send({categoryType: 'new category type', desc: 'new category desc'})
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.categoryType).to.equal('new category type');
          expect(res.body.desc).to.equal('new category desc');
          done();
        });
      });
    });
    describe('With a invalid body, valid id, and token', function(){
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
      it('should return an update Category', done => {
        request.put(`${url}/api/category/${this.tempCategoryId}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
    describe('With a valid body, invalid id, and token', function(){
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
      it('should return an update Category', done => {
        request.put(`${url}/api/category/badid`)
        .send({categoryType: 'new category type', desc: 'new category desc'})
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
    describe('With a valid body, valid id, and invalid token', function(){
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
      it('should return an update Category', done => {
        request.put(`${url}/api/category/${this.tempCategoryId}`)
        .send({categoryType: 'new category type', desc: 'new category desc'})
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });
  describe('Delete /api/category/:id', function(){
    describe('With a valid id', function(){
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
      it('should return a 204', done => {
        request.delete(`${url}/api/category/${this.tempCategoryId}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(204);
          done();
        });
      });
    });
  });
});
