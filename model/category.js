'use strict';

const mongoose = require('mongoose');
const createError = require('http-errors');
const debug = require('debug')('decor8:category');
const Schema = mongoose.Schema;

const categorySchema = Schema({
  categoryType: {type:String, required: true},
  created: {type:Date, default: Date.now},
  desc: {type:String, required:true}
})
