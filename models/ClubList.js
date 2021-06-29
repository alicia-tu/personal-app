
'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var clubListSchema = Schema( {
  clubName: String,
  clubType: String,
  createdAt: String,
  userId: ObjectId
} );

module.exports = mongoose.model( 'ClubList', clubListSchema );
