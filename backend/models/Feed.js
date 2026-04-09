const mongoose = require('mongoose');

const feedItemSchema = new mongoose.Schema({
  id: String,
  title: String,
  subtitle: String
});

const feedSchema = new mongoose.Schema({
  items: [feedItemSchema]
});

module.exports = mongoose.model('Feed', feedSchema);
