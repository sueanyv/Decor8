'use strict';

const jsonParser = require('body-parser').json();
const debug = require('debug')('decor8:comment-router');
const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');
const Router = require('express').Router;
const createError = require('http-errors');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const Comment = require('../model/comment.js');
const Post = require('../model/post.js');
AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({ dest: dataDir });

const commentRouter = module.exports = Router();

function s3uploadProm(params) {
  debug('s3uploadProm');

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3data) => {
      if (err) return reject(err);
      resolve(s3data);
    });
  });
}


commentRouter.post('/api/post/:postId/comment', bearerAuth, upload.single('image'), jsonParser,  function(req, res, next) {
  debug('/api/post/:postId/comment');

  if(!req.body.message) return next(createError(400, 'expected a message'));

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path)
  };
  Post.findById(req.params.postId)
  .then(() => s3uploadProm(params))
  .then(s3data => {
    del([`${dataDir}/*`]);
    let commentData = {
      message: req.body.message,
      objectKey: s3data.Key,
      imageURI: s3data.Location,
      userId: req.user._id,
      postId: req.params.postId
    };
    return Post.findByIdAndAddComment(req.params.postId, commentData);
  })
  .then(comment => res.json(comment))
  .catch(err => next(err));
});

commentRouter.get('/api/comment/:id', bearerAuth, function(req, res, next) {
  debug('GET: api/comment/:id');

  Comment.findById(req.params.id)
  .then(comment => {
    if ( comment.userId.toString() !== req.user._id.toString()){
      return next(createError(401, 'invalid user'));
    }
    res.json(comment);
  })
  .catch(next);
});

commentRouter.put('/api/comment/:id', bearerAuth, jsonParser, function(req, res, next){
  debug('PUT api/comment/:id');

  if(!req.body.message) return next(createError(400, 'expected an message.'));
  Comment.findByIdAndUpdate(req.params.id, req.body, { new: true })
  .then( comment => {
    res.json(comment);
  })
  .catch(next);
});


commentRouter.delete('/api/post/:postId/comment/:id', bearerAuth, function(req, res, next) {
  debug('Delete /api/post/:postId');

  Post.findByIdAndRemoveComment(req.params.postId, req.params.id);

  Comment.findByIdAndRemove(req.params.id)
  .then( comment => {
    if(!comment) return next(createError(404, 'comment not found'));
    res.sendStatus(204);
  })
  .catch(next);
});
