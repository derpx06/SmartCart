import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 3001),
  mongoUri: process.env.MONGO_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'super-secret-key',
  groqApiKey: process.env.GROQ_API_KEY ?? '',
  groqModel: process.env.GROQ_MODEL ?? 'openai/gpt-oss-20b',
  groqBaseUrl: process.env.GROQ_BASE_URL ?? 'https://api.groq.com/openai/v1',
  qdrantUrl: process.env.QDRANT_URL ?? '',
  qdrantApiKey: process.env.QDRANT_API_KEY ?? '',
  qdrantCollection: process.env.QDRANT_COLLECTION ?? 'smartcart_products',
  embeddingDimensions: Number(process.env.EMBEDDING_DIMENSIONS ?? 384),
};
