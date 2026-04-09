import mongoose from 'mongoose';

import { env } from './env';

export const connectDatabase = async (): Promise<void> => {
  if (!env.mongoUri) {
    throw new Error('MONGO_URI is not defined in environment variables.');
  }

  await mongoose.connect(env.mongoUri);
  console.log('Connected to MongoDB.');
};
