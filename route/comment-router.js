'use strict';

const jsonParser = require('body-parser').json();
const debug = require('debug')('cfgram:auth-router');
const Router = require('express').Router;
const basicAuth = require('../lib/basic-auth-middleware.js');

const User = require('../model/user.js');
const Post = require('../model/post.js');

const authRouter = module.exports = Router();

commentRouter.post('api/postId/:postId/comment', jsonParser, function(req, res, next) {
  debug('api/post/:postId/comment');
  console.log(api/post/:postId/comment);
  Post.findByIdAndAddComment(req.params.postId, req.body)
    .then(comment =>
      res.json(comment))
    .catch(() => {
      console.log('catch statement running');
      return next(createError(400, 'bad request error'));
    });
  });

  Post.findById(req.params.postID)
  .then( () => s3uploadProm(params))
  .then( s3data => {
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
  .then( comment => res.json(comment))
  .catch( err => next(err));
});

commentRouter.get('api/postId/:postId/comment',  function(req, res, next) {
  debug('GET: api/postId/:postId/comment');
comment.findById(req.params.postid)
  .then(list => res.json(list))
  .catch(next);
});
