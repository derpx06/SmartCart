import { Schema, model } from 'mongoose';

const feedItemSchema = new Schema({
  id: String,
  title: String,
  subtitle: String,
});

const feedSchema = new Schema({
  items: [feedItemSchema],
});

export default model('Feed', feedSchema);
