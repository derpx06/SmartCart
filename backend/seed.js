require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = require('./models/User');
const Feed = require('./models/Feed');
const Sku = require('./models/Sku');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');

  try {
    // Load Data
    const skusData = JSON.parse(fs.readFileSync(path.join(__dirname, 'responses/skus.json'), 'utf-8'));
    const feedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'responses/feed.json'), 'utf-8'));
    const profileData = JSON.parse(fs.readFileSync(path.join(__dirname, 'responses/profile.json'), 'utf-8'));

    // Initialize User Data based on mock-api profile
    const userData = {
      id: profileData.id,
      name: profileData.name,
      email: profileData.email,
      password: "123456"
    };

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Feed.deleteMany({});
    await Sku.deleteMany({});

    // Seed Data
    console.log('Inserting User...');
    await User.create(userData);

    console.log('Inserting Feed...');
    await Feed.create(feedData);

    console.log('Inserting Skus...');
    await Sku.insertMany(skusData);

    console.log('Data seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error loading or inserting data:', err);
    process.exit(1);
  }
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1);
});
