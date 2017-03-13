'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = Schema({
  profileId: { type: String, required: true },
  postId: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
  // picUrl: { type: string, required: true }
});

module.exports = mongoose.model('comment', commentSchema);
