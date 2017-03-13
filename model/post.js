'use strict';

'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Schema
const postSchema = Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  userID: { type: Schema.Types.ObjectId, required: true },
  categoryID: { type: Schema.Types.ObjectId, required: true },
  commentList: [listSchema],
  imageURI: { type: String, required: true, unique: true },
  objectKey: { type: String, required: true, unique: true },
  created: { type: Date, default: Date.now }
});

const listSchema = new mongoose.Schema({
  name: String,
  description: String,
  postID: {type: Schema.Types.ObjectId, required: true},
  created: {type: Date, default:Date.now}
});
  

module.exports = mongoose.model('post', postSchema);
module.exports = mongoose.model('', listSchema);