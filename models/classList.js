
'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var classListSchema = Schema( {
  className: String,
  credit: Number,
  completed: Boolean,
  createdAt: Date,
  userId: ObjectId
} );

module.exports = mongoose.model( 'ClassList', classListSchema );
