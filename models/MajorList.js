
'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var majorListSchema = Schema( {
  majorName: String,
  majorType: String,
  createdAt: String,
  userId: ObjectId
} );

module.exports = mongoose.model( 'MajorList', majorListSchema );
