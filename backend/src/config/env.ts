import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3001),
  mongoUri: process.env.MONGO_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'super-secret-key',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 100),
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 10),
  groqApiKey: process.env.GROQ_API_KEY ?? '',
  groqModel: process.env.GROQ_MODEL ?? 'openai/gpt-oss-20b',
  groqSttModel: process.env.GROQ_STT_MODEL ?? 'whisper-large-v3-turbo',
  groqTtsModel: process.env.GROQ_TTS_MODEL ?? 'canopylabs/orpheus-v1-english',
  groqBaseUrl: process.env.GROQ_BASE_URL ?? 'https://api.groq.com/openai/v1',
  qdrantUrl: process.env.QDRANT_URL ?? '',
  qdrantApiKey: process.env.QDRANT_API_KEY ?? '',
  qdrantCollection: process.env.QDRANT_COLLECTION ?? 'smartcart_products',
  embeddingDimensions: Number(process.env.EMBEDDING_DIMENSIONS ?? 384),
};
