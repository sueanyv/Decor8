'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const comment = require('../model/comment.js');
const PORT = process.env.PORT || 3000;

process.env.MONGODB_URI = 'mongodb://localhost/decor8';

require('../server.js');

const url = `http://localhost:${PORT}`;

const exampleComment = {
  userId: '09123913',
  postId: 'sdadas232',
  message: 'sugey,brian,cayla,jermiah',
  imgURI: `${__dirname}/test/data/tester.png`
};


describe('comment route', ()=> {
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
