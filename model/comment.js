'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = Schema({
  profileId: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('comment', commentSchema);
