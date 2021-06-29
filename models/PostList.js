
'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var postListSchema = Schema( {
  name: String,
  postText: String,
  userId: ObjectId
} );

module.exports = mongoose.model( 'postList', postListSchema );
