'use strict';

const jsonParser = require('body-parser').json();
const debug = require('debug')('cfgram:auth-router');
const Router = require('express').Router;
const del = require('del');
const basicAuth = require('../lib/basic-auth-middleware.js');
const Comment = require('../model/comment.js');


const authRouter = module.exports = Router();

commentRouter.post('/api/postId/:postId/comment', bearerAuth, jsonParser,  function(req, res, next) {
  debug('/api/post/:postId/comment');
  Post.findByIdAndAddComment(req.params.postId, req.body, req.userId)
    .then(comment =>
      res.json(comment))
    .catch(() => {
      console.log('catch statement running');
      return next(createError(400, 'bad request error'));
    });

Post.findById(req.params.postID)
  .then(() => s3uploadProm(params))
  .then(s3data => {
    del([`${dataDir}/*`]);
    let commentData = {
      message: req.body.message,
      objectKey: s3data.Key,
      imageURI: s3data.Location,
      userID: req.user._id,
      postID: req.params.postID
    }
    return new comment(commentData).save();
    console.log(commentData);
  })
  .then(comment => res.json(comment))
  .catch(err => next(err));
});

commentRouter.get('/api/comment/:commentId', bearerAuth, function(req, res, next) {
  debug('GET: api/postId/:postId/comment');
  Comment.findById(req.params.postid)
    .then(list => res.json(list))
    .catch(next);
});

commentRouter.put('/api/postId/comment:commentId', bearerAuth, function(req, res, next){
  Comment.findById(req.params.id)
  .then(comment => {
    comment = req.body;
    res.json(comment);
  })
  .catch(next);
});


commentRouter.delete('/api/postId/comment:commentId',  bearerAuth,function(req, res, next) {
  Comment.findByIdAndAddRemove(req.params.commentId, req.body)
  var params = {
    image: 'decor8',
    image: 's3data.Key'
  }
  s3.deleteObject(params)
});
