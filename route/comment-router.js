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

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path)
  };
console.log('postId',req.params.postId)
console.log('body', req.body)
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
    // return new comment(commentData).save(console.log(error ()));
    console.log('before find by id and add comment')
   return Post.findByIdAndAddComment(req.params.postId, commentData);
  })
  .then(comment => res.json(comment))
  .catch(err => next(err));
});

commentRouter.get('/api/comment/:commentId', bearerAuth, function(req, res, next) {
  debug('GET: api/postId/:postId/comment');
  Comment.findById(req.params.postId)
    .then(list => res.json(list))
    .catch(next);
});

commentRouter.put('/api/postId/comment:commentId', bearerAuth, function(req, res, next){
  Comment.findByIdAndUpdate(req.params.id)
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
  .catch(next);
});
