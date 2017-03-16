'use strict';

require('./lib/test-env.js');
const expect = require('chai').expect;
const request = require('superagent');
const awsMocks = require('./lib/aws-mocks.js'); //eslint-disable-line

const serverToggle = require('./lib/server-toggle.js');
const server = require('../server.js');

const Comment = require('../model/comment.js');
const User = require('../model/user.js');
const Post = require('../model/post.js');
const Category = require('../model/category.js');

const url = `http://localhost:${process.env.PORT}`;

const examplePost = {
  name: 'example post name',
  desc: 'example post desc',
  imageURI: `${__dirname}/data/tester.png`,
  price: 5,
  objectKey: 'example image key'
};

const exampleCategory = {
  categoryType: 'chair',
  desc: 'seating'
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

describe('Comment Routes', () => {
  before(done => {
    serverToggle.serverOn(server, done);
  });
  after(done => {
    serverToggle.serverOff(server, done);
  });

  afterEach(done => {
    Promise.all([
      User.remove({}),
      Comment.remove({}),
      Post.remove({}),
      Category.remove({})
    ])
    .then(() => done())
    .catch(done);
  });
  describe('POST: api/post/:postId/comment', () => {
    describe('With a valid body', () => {
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
          done();
        }).catch(done);
      });
      before(done => {
        examplePost.categoryID = this.tempCategory._id;
        examplePost.userID = this.tempUser._id;
        new Post(examplePost).save()
        .then(post => {
          this.tempPost = post;
          exampleComment.userId = this.tempUser._id;
          exampleComment.postId = this.tempPost._id;
          done();
        }).catch(done);
      });
      after(done => {
        delete examplePost.userID;
        delete examplePost.categoryID;
        delete exampleComment.userId;
        delete exampleComment.postId;
        done();
      });

      it('should return a comment', done => {
        request.post(`${url}/api/post/${this.tempPost._id}/comment`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('message', 'sugey,brian,cayla,jermiah')
        .field('postId', exampleComment.postId.toString())
        .field('userId', exampleComment.userId.toString())
        .attach('image', exampleComment.image)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal(exampleComment.message);
          expect(res.body.postId).to.equal(this.tempPost._id.toString());
          done();
        });
      });
    });
    describe('if no token found', () => {
      it('should return a 401 status code', done => {
        request.post(`${url}/api/post/postId/comment`)
        .send(examplePost)
        .set({})
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
    describe('not found', () => {
      it('should return a 404', done => {
        request.post(`${url}/api/post/postId/commen`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
    describe('bad request', () => {
      it('should return a 400', done => {
        request.post(`${url}/api/post/${this.tempPost._id}/comment`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .set('content-Type', ' application/json')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });


  describe('GET: /api/comment/:id', () => {
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
        done();
      }).catch(done);
    });
    before(done => {
      examplePost.categoryID = this.tempCategory._id;
      examplePost.userID = this.tempUser._id;
      new Post(examplePost).save()
      .then(post => {
        this.tempPost = post;
        exampleComment.userId = this.tempUser._id;
        exampleComment.postId = this.tempPost._id;

        done();
      }).catch(done);
    });
    before(done => {
      exampleComment.objectKey = 'stuff';
      exampleComment.imageURI = 'stuff';
      exampleComment.userId = this.tempUser._id;
      exampleComment.postId = this.tempPost._id;
      new Comment(exampleComment).save()
      .then(comment => {
        this.tempComment = comment;
        done();
      }).catch(done);
    });

    it('should return a comment', done => {
      request.get(`${url}/api/comment/${this.tempComment._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal(exampleComment.message);
        expect(res.body.postId).to.equal(this.tempPost._id.toString());
        done();
      });
    });
    describe('with an unfound post ID', () => {
      it('should return a comment', done => {
        request.get(`${url}/api/post/postId/commen`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
    describe('invalid if no token found', () => {
      it('should return a 401 status', done => {
        request.get(`${url}/api/post/wrongcomment`)
        .set({})
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });

  describe('PUT: /api/comment/:id', () => {
    describe('with valid body, id and token', function() {
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
          done();
        }).catch(done);
      });
      before(done => {
        examplePost.categoryID = this.tempCategory._id;
        examplePost.userID = this.tempUser._id;
        new Post(examplePost).save()
        .then(post => {
          this.tempPost = post;
          exampleComment.userId = this.tempUser._id;
          exampleComment.postId = this.tempPost._id;

          done();
        }).catch(done);
      });
      before(done => {
        exampleComment.objectKey = 'stuff';
        exampleComment.imageURI = 'stuff';
        exampleComment.userId = this.tempUser._id;
        exampleComment.postId = this.tempPost._id;
        new Comment(exampleComment).save()
        .then(comment => {
          this.tempComment = comment;
          done();
        }).catch(done);
      });
      it('should return an updated Post', done => {
        request.put(`${url}/api/comment/${this.tempComment._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .send({
          message: 'sugey,brian,cayla'})
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(200);
            console.log('res bdy in ****', res.body);
            expect(res.body.message).to.equal('sugey,brian,cayla');
            expect(res.body.userId).to.equal(this.tempUser._id.toString());
            done();
          });
      });
    });
    describe('with an invalid body', () => {
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
          done();
        }).catch(done);
      });
      before(done => {
        examplePost.categoryID = this.tempCategory._id;
        examplePost.userID = this.tempUser._id;
        new Post(examplePost).save()
        .then(post => {
          this.tempPost = post;
          exampleComment.userId = this.tempUser._id;
          exampleComment.postId = this.tempPost._id;

          done();
        }).catch(done);
      });
      before(done => {
        exampleComment.objectKey = 'stuff';
        exampleComment.imageURI = 'stuff';
        exampleComment.userId = this.tempUser._id;
        exampleComment.postId = this.tempPost._id;
        new Comment(exampleComment).save()
        .then(comment => {
          this.tempComment = comment;
          done();
        }).catch(done);
      });
      it('should return a 400 error', done => {
        request.put(`${url}/api/comment/${this.tempComment._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .send({
          message: 'sugey,brian,cayla'})
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('sugey,brian,cayla');
          expect(res.body.userId).to.equal(this.tempUser._id.toString());
          done();
        });
      });
    });
    describe('with an invalid body', () => {
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
          done();
        }).catch(done);
      });
      before(done => {
        examplePost.categoryID = this.tempCategory._id;
        examplePost.userID = this.tempUser._id;
        new Post(examplePost).save()
        .then(post => {
          this.tempPost = post;
          exampleComment.userId = this.tempUser._id;
          exampleComment.postId = this.tempPost._id;
          done();
        }).catch(done);
      });
      before(done => {
        exampleComment.objectKey = 'stuff';
        exampleComment.imageURI = 'stuff';
        exampleComment.userId = this.tempUser._id;
        exampleComment.postId = this.tempPost._id;
        new Comment(exampleComment).save()
        .then(comment => {
          this.tempComment = comment;
          done();
        }).catch(done);
      });
      it('should return a 400 error', done => {
        request.put(`${url}/api/comment/${this.tempComment._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
    describe('with an unfound post ID', () => {
      it('should return a 404', done => {
        request.put(`${url}/api/comment/`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .send({message: 'sugey'})
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
      request.put(`${url}/api/comment/${this.tempComment._id}`)
      .set({
        Authorization: 'Bear claws'
      })
      .send({message: 'sugey'})
      .end((err, res) => {
        expect(err.message).to.equal('Unauthorized');
        expect(res.status).to.equal(401);
        done();
      });
    });
  });
  describe('Delete /api/post/postId/comment/:id', () =>{
    describe('With a valid id', () =>{
      before(done => {
        exampleComment.objectKey = 'stuff';
        exampleComment.imageURI = 'stuff';
        exampleComment.userId = this.tempUser._id;
        exampleComment.postId = this.tempPost._id;
        new Comment(exampleComment).save()
        .then(comment => {
          this.tempComment = comment;
          done();
        }).catch(done);
      });

      before ( done => {
        new Post(examplePost).save()
        .then( post => {
          post.comments.push(this.tempComment._id);
          this.tempPost = post;
          return Post.findByIdAndUpdate(post._id, post);
        })
        .then(() => done())
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
          this.tempCategoryId = category._id;
          done();
        })
        .catch(done);
      });
      it('should return a 204', done => {
        request.delete(`${url}/api/post/${this.tempPost._id}/comment/${this.tempComment._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {

          Post.findById(this.tempPost._id)
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
  describe('PUT: /api/comment/:id/vote', () => {
    describe('with valid body, id and token', function() {
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
          done();
        }).catch(done);
      });
      before(done => {
        examplePost.categoryID = this.tempCategory._id;
        examplePost.userID = this.tempUser._id;
        new Post(examplePost).save()
        .then(post => {
          this.tempPost = post;
          exampleComment.userId = this.tempUser._id;
          exampleComment.postId = this.tempPost._id;

          done();
        }).catch(done);
      });
      before(done => {
        exampleComment.objectKey = 'stuff';
        exampleComment.imageURI = 'stuff';
        exampleComment.userId = this.tempUser._id;
        exampleComment.postId = this.tempPost._id;
        new Comment(exampleComment).save()
        .then(comment => {
          this.tempComment = comment;
          done();
        }).catch(done);
      });
      it('should return an updated Comment', done => {
        console.log('$$$$$###', this.tempComment._id)
        request.put(`${url}/api/comment/${this.tempComment._id}/upvote`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .send({
          message: 'sugey,cayla'})
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(200);
            console.log('res bdy in ****', res.body.upvote);
            expect(res.body.message).to.equal('sugey,cayla');
            expect(res.body.upVote).to.equal(1);
            expect(res.body.userId).to.equal(this.tempUser._id.toString());
            done();
          });
        });
      });
      describe('with an invalid body', () => {
        it('should return a 400 error', done => {
          request.put(`${url}/api/comment/${this.tempComment._id}/upvote`)
            .set({
              Authorization: `Bearer ${this.tempToken}`
            })
            .send({ mersage:'blahwrong',})
            .end((err, res) => {
              expect(res.status).to.equal(400);
              done();
            });
        });
      });
      describe('with an unfound post ID', () => {
        it('should return a 404', done => {
          request.put(`${url}/api/comment/`)
            .set({
              Authorization: `Bearer ${this.tempToken}`
            })
            .send({ message:'blahwrong',})
            .end((err, res) => {
              expect(err.message).to.equal('Not Found');
              expect(res.status).to.equal(404);
              done();
            });
        });
      });
      describe('with an invalid token', () => {
        it('should return a 401 error', done => {
          request.put(`${url}/api/comment/${this.tempComment._id}/upvote`)
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
    });
 });
