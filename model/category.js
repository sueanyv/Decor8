'use strict';

const mongoose = require('mongoose');
const createError = require('http-errors');
const debug = require('debug')('decor8:category');
const Schema = mongoose.Schema;

const Post = require('./post.js');

const categorySchema = Schema({
  categoryType: {type:String, required: true},
  created: {type:Date, default: Date.now},
  desc: {type:String, required:true},
  postList: [{type: Schema.Types.ObjectId, ref: 'post' }]
});

const Category = module.exports = mongoose.model('category', categorySchema);

Category.findByIdAndAddPost = function(id, post){
  debug('findByIdAndAddPost');

  return Category.findById()
  .catch(err => Promise.reject(createError(404, err.message)))
  .then(category => {
    post.categoryID = category._id;
    this.tempCategory = category;
    return new Post(post).save();
  })
  .then(post => {
    this.tempCategory.postList.push(post._id);
    this.tempPost = post;
    return this.tempCategory.save();
  })
  .then(() => {
    return this.tempPost;
  });
};

Category.findByIdAndRemovePost = function(id, postId){
  debug('findByIdAndAddPost');

  Category.findById(id)
  .then(category => {
    for(var i = 0; i < category.postList.length; i++){
      if(category.postList[i] === postId){
        category.postList.splice(i, 1);
      }
    }
    Category.findByIdandUpdate(id, category)
    .then(() => {
      return;
    })
    .catch(err => Promise.reject(createError(404, err.message)));
    return postId;
  })
  .catch(err => Promise.reject(createError(404, err.message)));
};
