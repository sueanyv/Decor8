'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  postId: {type: Schema.Types.ObjectId, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  objectKey: { type: String, required: true, unique: true },
  imageURI: { type: String, required: true }
});


module.exports = mongoose.model('comment', commentSchema);
