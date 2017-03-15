'use strict';

require('./lib/test-env.js');

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const awsMocks = require('./lib/aws-mocks.js');

const Post = require('../model/post.js');
const User = require('../model/user.js');
const Category = require('../model/category.js');

// const AWS = require('aws-sdk-mock');

const serverToggle = require('./lib/server-toggle.js');
const server = require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'exampleuser',
  password: '1234',
  email: 'exampleuser@test.com'
};

const exampleCategory = {
  categoryType: 'test categoryTypre',
  desc: 'test category description'
};

const examplePost = {
  name: 'example post name',
  desc: 'example post desc',
  price: 4,
  image: `${__dirname}/data/tester.png`,
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

  describe('POST: /api/category/:categoryID/post', function() {
    describe('with a valid token and valid data', function() {
      before( done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
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
        new Category(exampleCategory).save()
        .then( category => {
          this.tempCategory = category;
          done();
        })
        .catch(done);
      });

      it('should return a post', done => {
        request.post(`${url}/api/category/${this.tempCategory._id}/post`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('name', examplePost.name)
        .field('desc', examplePost.desc)
        .field('price', examplePost.price)
        .attach('image', examplePost.image)
        .end((err, res) => {

          Category.findById(this.tempCategory._id)
          .then(() => {
          })
          .catch(done);
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(examplePost.name);
          expect(res.body.desc).to.equal(examplePost.desc);
          expect(res.body.categoryID).to.equal(this.tempCategory._id.toString());
          expect(res.body.imageURI).to.equal(awsMocks.uploadMock.Location);
          done();
        });
      });
    });

    describe('with invalid body', function(){
      before(done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch();
      });

      it('should return a 400 for bad request', done => {
        request.post(`${url}/api/category/categoryID/post`)
        .send({})
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
    describe('if no token found', () => {
      it('should return a 401 status code', done => {
        request.post(`${url}/api/category/categoryID/post`)
        .send(examplePost)
        .set({})
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });

  describe('GET: /api/post/:id', () => {
    before( done => {
      new User (exampleUser)
      .generatePasswordHash(exampleUser.password)
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
      new Category(exampleCategory).save()
      .then( category => {
        this.tempCategory = category;
        done();
      })
      .catch(done);
    });
    before ( done => {
      examplePost.userID = this.tempUser._id;
      examplePost.imageURI = 'stuff';
      examplePost.objectKey = 'stuff';
      examplePost.categoryID = this.tempCategory._id;
      new Post(examplePost).save()
      .then( post => {
        this.tempPost = post;
        done();
      })
      .catch(done);
    });

    after( done => {
      delete examplePost.userID;
      done();
    });

    it('should return a post', done => {
      request.get(`${url}/api/post/${this.tempPost._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if(err) return done(err);
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal(examplePost.name);
        expect(res.body.desc).to.equal(examplePost.desc);
        expect(res.body.categoryID).to.equal(this.tempCategory._id.toString());
        expect(res.body.imageURI).to.equal('stuff');
        expect(res.body.userID).to.be.a('String');
        done();
      });
    });

    it('should return a post', done => {
      request.get(`${url}/api/post/`)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
    describe('invalid if no token found', () => {
      it('should return a 401 status', done => {
        request.get(`${url}/api/post/badid`)
        .set({})
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });
  describe('PUT: /api/post/:id', () => {
    describe('with valid body, id and token', function(){
      before( done => {
        new User (exampleUser)
        .generatePasswordHash(exampleUser.password)
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
      before ( done => {
        examplePost.userID = this.tempUser._id;
        new Post(examplePost).save()
        .then( post => {
          this.tempPost = post;
          done();
        })
        .catch(done);
      });
      it('should return an updated Post', done => {
        request.put(`${url}/api/post/${this.tempPost._id}`)
        .send({ name: 'new name',
          desc: 'new description',
          price: 11})
        .set({
          Authorization: `Bearer ${this.tempToken}`})
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).to.equal(200);
            expect(res.body.name).to.equal('new name');
            expect(res.body.desc).to.equal('new description');
            expect(res.body.price).to.equal(11);
            done();
          });
      });
    });
    describe('with an invalid body', () => {
      it('should return a 400 error', done => {
        request.put(`${url}/api/post/${this.tempPost._id}`)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .send({ NahName:'blahwrong', DuhDesc:'wrongupdate'})
          .end((err, res) => {
            expect(res.status).to.equal(400);
            done();
          });
      });
    });
    describe('with an unfound post ID', () => {
      it('should return a 404', done => {
        request.put(`${url}/api/post/`)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .send({name: 'no dice', desc: 'no luck'})
          .end((err, res) => {
            expect(err.message).to.equal('Not Found');
            expect(res.status).to.equal(404);
            done();
          });
      });
    });
  });
  describe('with an invalid token', () => {
    it('should return a 401 error', done => {
      request.put(`${url}/api/post/${this.tempPost._id}`)
        .set({
          Authorization: 'Bear claws'
        })
        .send({name: 'nope', desc:'nada', price: 1 })
        .end((err, res) => {
          expect(err.message).to.equal('Unauthorized');
          expect(res.status).to.equal(401);
          done();

        });
    });
  });

  describe('Delete /api/category/:categoryID/post/:id', function(){
    describe('With a valid id', function(){
      before ( done => {
        // examplePost.userID = this.tempUser._id;
        new Post(examplePost).save()
          .then( post => {
            this.tempPost = post;
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
        new Category(exampleCategory).save()
          .then(category => {
            this.tempCategory = category;
            category.posts.push(this.tempPost._id);
            Category.findByIdAndUpdate(category._id, category, {new:true})
            .then(() => {
              return;
            }).
            catch(done);
            done();
          })
          .catch(done);
      });
      it('should return a 204', done => {
        request.delete(`${url}/api/category/${this.tempCategory._id}/post/${this.tempPost._id}`)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .end((err, res) => {
            Category.findById(this.tempCategory._id)
            .then(() => {
              return;
            })
            .catch(done);
            if(err) return done(err);
            expect(res.status).to.equal(204);
            done();
          });
      });
    });
  });
});
