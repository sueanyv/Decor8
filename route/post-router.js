'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('decor8:post-router');
const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');

const Post = require('../model/post.js');
const Category = require('../model/category.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({ dest: dataDir });

const postRouter = module.exports = new Router();

function s3uploadProm(params) {
  debug('s3uploadProm');

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

postRouter.post('/api/category/:categoryID/post', bearerAuth, jsonParser, upload.single('image'), function(req, res, next) {
  debug('post /api/category/:categoryID/post');

  if(!req.body.name || !req.body.desc){
    return next(createError(400, 'missing required values'));
  }
  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path)
  };

  Category.findById(req.params.categoryID)
  .then( () => s3uploadProm(params))
  .then( s3data => {
    del([`${dataDir}/*`]);
    let postData = {
      name: req.body.name,
      desc: req.body.desc,
      price: req.body.price,
      objectKey:s3data.Key,
      imageURI:s3data.Location,
      userID: req.user._id,
      categoryID:req.params.categoryID
    };
    return Category.findByIdAndAddPost(req.params.categoryID, postData);
  })
  .then( post => res.json(post))
  .catch(err => next(err));


});

postRouter.get('/api/post/:id', bearerAuth, function(req, res, next){
  debug('GET: /api/post/:id');

  Post.findById(req.params.id)
  .then( post => {
    if ( post.userID.toString() !== req.user._id.toString()) {
      return next(createError(401, 'invalid user'));
    }
    res.json(post);
  })
  .catch(next);
});

postRouter.put('/api/post/:id', bearerAuth, jsonParser, function(req, res, next){
  debug('PUT: /api/post/:id');

  if(!req.body.name) return next(createError(400, 'name required'));
  if(!req.body.desc) return next(createError(400, 'description required'));


  Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
  .then( post => {
    if ( !post){
      return next(createError(404, 'post not found'));
    }
    res.json(post);
  })
  .catch(next);
});

postRouter.delete('/api/category/:categoryID/post/:id', bearerAuth, function(req, res, next){
  debug('DELETE: /api/category/:categoryID/post/:id');

  Category.findByIdAndRemovePost(req.params.categoryID, req.params.id);

  Post.findByIdAndRemove(req.params.id)
  .then(post => {
    if(!post) return next(createError(404, 'post not found'));
    res.sendStatus(204);
  })
  .catch(next);
});
