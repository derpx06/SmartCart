import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import pinoHttp from 'pino-http';

import { env } from './config/env';
import apiRoutes from './routes';

const app = express();

if (env.nodeEnv !== 'test') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
  app.use(
    pinoHttp({
      autoLogging: true,
    })
  );
}

if (env.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

const globalLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors());
app.use(express.json());
app.use(globalLimiter);
app.use(['/login', '/register', '/admin/login'], authLimiter);
const imagesDir = path.join(process.cwd(), 'images');
if (fs.existsSync(imagesDir)) {
  app.use('/images', express.static(imagesDir));
}
app.use(apiRoutes);

export default app;
