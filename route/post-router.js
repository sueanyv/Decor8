'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');

const Post = require('../model/post.js');
const postRouter = module.exports = new Router();

postRouter.post('/api/category/categoryID/post', jsonParser, function(req, res, next) {
  req.body.timestamp = new Date();
  new Post(req.body).save()
  .then( post => res.json(post))
  .catch(next);
});

postRouter.get('/api/category/categoryID/post/:id', function(req, res, next) {
  Post.findById(req.params.id)
  .populate('comments')
  .then( post => res.json(post))
  .catch( err => next(createError(404, err.message)));
});

postRouter.put('/api/category/categoryID/post/:id', jsonParser, function(req, res, next) {
  Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
  .then( post => res.json(post))
  .catch( err => {
    if (err.name === 'ValidationError') return next(err);
    next(createError(404, err.message));
  });
});

postRouter.delete('/api/category/categoryID/post/:id', function(req, res, next){
  Post.findByIdAndRemove(req.params.id)
  .then( () => res.status(204).send())
  .catch( err => next(createError(404, err.message)));
});