#!/usr/bin/env node
/**
 * Non-interactive: sam deploy --parameter-overrides from .env (backend root).
 * Run from repo: node scripts/sam-deploy-from-env.cjs
 */
const { readFileSync } = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
let env = {};
try {
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
} catch (e) {
  console.error('Missing or unreadable .env at', envPath);
  process.exit(1);
}

const jwt = env.JWT_SECRET || 'super-secret-key';

const required = ['MONGO_URI', 'REDIS_URL'];
for (const k of required) {
  if (!env[k]) {
    console.error(`Set ${k} in .env before deploy.`);
    process.exit(1);
  }
}

const overrides = [
  `MongoUri=${env.MONGO_URI}`,
  `JwtSecret=${jwt}`,
  `RedisUrl=${env.REDIS_URL}`,
  `QdrantUrl=${env.QDRANT_URL || ''}`,
  `QdrantApiKey=${env.QDRANT_API_KEY || ''}`,
  `GroqApiKey=${env.GROQ_API_KEY || ''}`,
  `CloudinaryCloudName=${env.CLOUDINARY_CLOUD_NAME || ''}`,
  `CloudinaryApiKey=${env.CLOUDINARY_API_KEY || ''}`,
  `CloudinaryApiSecret=${env.CLOUDINARY_API_SECRET || ''}`,
];

const r = spawnSync(
  'sam',
  [
    'deploy',
    '--no-confirm-changeset',
    '--capabilities',
    'CAPABILITY_IAM',
    '--resolve-s3',
    '--parameter-overrides',
    ...overrides,
  ],
  { cwd: root, stdio: 'inherit', env: process.env }
);

process.exit(r.status ?? 1);
