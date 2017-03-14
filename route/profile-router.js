'use strict';

const jsonParser = require('body-parser');
const debug = require('debug')('decor8:profile-router');
const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');
const Router = require('express').Router;
const createError = require('http-errors');

const Profile = require('../model/profile.js');
const bearerAuth = require('../lib/bearer-auth-middleware');

AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({ dest: dataDir });

const profileRouter = module.exports = Router();

function s3uploadProm(params) {
  debug('s3uploadProm');
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3data) => {
      if (err) return reject(err);
      resolve(s3data);
    });
  });
}

profileRouter.post('/api/profile', bearerAuth,  jsonParser, function(req, res, next) {
  debug('POST: /api/profile');

  new Profile({
    
  })
}



 upload.single('image'), jsonParser, function(req, res, next) {
  debug('POST: /api/profile');

  if(!req.file) {
    return next(createError(400, 'file not saved'));
  }
  if(!req.file.path) {
    return next(createError(500, 'file not saved'));
  }

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path)
  };

  Profile.findById(req.params.userID)
  .then( () => s3uploadProm(params))
  .then( s3data => {
    del([`${dataDir}/*`]);
    let imageData = {
      name: req.body.name,
      bio: req.body.bio,
      userID: req.user._id,
      imageURI: s3data.Location,
      objectKey: s3data.Key
    };
    return new Profile(imageData).save();
  })
  .then( pic => res.json(pic))
  .catch( err => next(err));
});



profileRouter.get('/api/profile/:userID', bearerAuth, function(req, res, next){
  debug('GET: /api/profile/:userID');

  Profile.findById(req.params.id)
  .then( profile => {
    if(profile.userID.toString() !== req.user._id.toString()){
      return next(createError(401, 'invalid user'));
    }
    res.json(profile);
  })
  .catch(next);
});

profileRouter.put('/api/profile/:id', bearerAuth, jsonParser, function(req, res, next){
  debug('PUT: /api/profile/:id');

  if(!req.body.bio) return next(createError(400, 'bio required'));
  if(!req.body.name) return next(createError(400, 'name required'));
  if(!req.body.age) return next(createError(400, 'age  required'));

  Profile.findByIdAndUpdate(req.params.id, req.body, {new:true})
  .then( profile => {
    if(!profile) return next(createError(404, 'profile not found'));
    res.json(profile);
  })
  .catch(next);
});
