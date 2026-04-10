import type { Callback, Context, Handler } from 'aws-lambda';

import configure from '@codegenie/serverless-express';

import app from './app';
import { connectDatabase } from './config/database';

let expressHandler: Handler | undefined;

export const handler: Handler = async (event, context: Context, callback?: Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!expressHandler) {
    await connectDatabase();
    expressHandler = configure({ app }) as Handler;
  }

  if (callback === undefined) {
    return (expressHandler as (e: unknown, c: Context) => Promise<unknown>)(event, context);
  }
  return expressHandler(event, context, callback);
};
