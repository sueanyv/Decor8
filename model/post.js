'use strict';

const createError = require('http-errors');
const Promise = require('bluebird');
const debug = require('debug')('decor8:post');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comment = require('./comment.js');

const postSchema = Schema({
  name: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  userID: {
    type: Schema.Types.ObjectId,
    required: true
  },
  categoryID: {
    type: Schema.Types.ObjectId,
    required: true
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'comment'
  }],
  imageURI: {
    type: String,
    required: true,
    unique: true
  },
  objectKey: {
    type: String,
    required: true,
    unique: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

const Post = module.exports = mongoose.model('post', postSchema);

Post.findByIdAndAddComment = function(id, comment) {
  debug('findByIdAndAddComment');

  return Post.findById(id)
    .catch(err => Promise.reject(createError(404, err.message)))
    .then(post => {
      this.tempPost = post;
      return new Comment(comment).save();
    })
    .then(comment => {
      this.tempPost.comments.push(comment._id);
      this.tempComment = comment;
      return this.tempPost.save();
    })
    .then(() => {
      return this.tempComment;
    });
};
Post.findByIdAndRemoveComment = function(id, commentId) {
  debug('findByIdAndAddComment');
  Post.findById(id)
    .then(post => {
      for (var i = 0; i < post.comments.length; i++) {
        if (post.comments[i] == commentId) {
          post.comments.splice(i, 1);
        }
      }
      Post.findByIdAndUpdate(id, post, {new: true})
        .then(() => {
          return;
        })
        .catch(err => Promise.reject(createError(404, err.message)));
      return commentId;
    })
    .catch(err => Promise.reject(createError(404, err.message)));
};
