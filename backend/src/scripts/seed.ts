import fs from 'fs';
import path from 'path';

import { connectDatabase } from '../config/database';
import Admin from '../models/Admin';
import Feed from '../models/Feed';
import Sku from '../models/Sku';
import User from '../models/User';

const runSeed = async (): Promise<void> => {
  await connectDatabase();

  try {
    const basePath = process.cwd();
    const skusData = JSON.parse(fs.readFileSync(path.join(basePath, 'responses/skus.json'), 'utf-8'));
    const feedData = JSON.parse(fs.readFileSync(path.join(basePath, 'responses/feed.json'), 'utf-8'));
    const profileData = JSON.parse(fs.readFileSync(path.join(basePath, 'responses/profile.json'), 'utf-8'));

    const userData = {
      id: profileData.id,
      name: profileData.name,
      email: profileData.email,
      password: '123456',
    };

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Feed.deleteMany({});
    await Sku.deleteMany({});

    console.log('Inserting User...');
    await User.create(userData);

    console.log('Inserting Admin...');
    await Admin.create({
      email: 'admin@smartcart.com',
      password: 'admin123',
      name: 'System Admin',
    });

    console.log('Inserting Feed...');
    await Feed.create(feedData);

    console.log('Inserting Skus...');
    await Sku.insertMany(skusData);

    console.log('Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error loading or inserting data:', error);
    process.exit(1);
  }
};

void runSeed();
