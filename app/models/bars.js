'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Bar = new Schema({
	name: String,
	id: String,
	image: String,
	going: Array
});

module.exports = mongoose.model('Bar', Bar);
