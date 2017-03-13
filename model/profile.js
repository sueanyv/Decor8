'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = Schema({
  bio: { type: String, required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  userID: { type: Schema.Types.ObjectId, required: true },
  imgageURI: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('profile', profileSchema); 
