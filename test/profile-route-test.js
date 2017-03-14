'use strict';

require('./lib/test-env.js');


const expect = require('chai').expect;
const request = require('superagent');
const Profile = require('../model/profile.js');
const User = require('../model/user.js');
const awsMocks = require('./lib/aws-mocks.js');

require('../model/profile.js');
require('../model/user.js');

const serverToggle = require('./lib/server-toggle.js');
const server = require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'test user',
  password: 'test password',
  email: 'testemail@test.com',
};

const exampleProfile = {
  name: 'exaple name',
  bio: 'example bio',
  image: `${__dirname}/data/nobody_image.jpg`
};

describe('Profile Routes', function () {
  before( done => {
    serverToggle.serverOn(server, done);
  });
  after( done => {
    serverToggle.serverOff(server, done);
  });
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Profile.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/profile/', function () {
    describe('with a valid token and valid data', function() {
      before( done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          console.log('user in Post test', user)
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });
      it('should return a profile', done => {
        console.log('inside it in Post')
        console.log('url', `${url}/api/profile`)
        request.post(`${url}/api/profile`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('name', exampleProfile.name)
        .field('bio', exampleProfile.bio)
        .attach('image', exampleProfile.image)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200, 'upload worked');
          expect(res.body.name).to.equal(exampleProfile.name);
          expect(res.body.bio).to.equal(exampleProfile.bio);
          expect(res.body.userID).to.be.a('string');
          expect(res.body.imageURI).to.equal(awsMocks.uploadMock.Location);
          console.log('response',res.body)
          done();
        });
      });
    });
  });
});
