import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    // Seed catalog from SKUs if empty (once at startup)
    try {
      const { ensureCatalogSeededFromSkus } = require('./services/catalogSync.service');
      console.log('[Server] Checking catalog seeds...');
      await ensureCatalogSeededFromSkus();
      console.log('[Server] Catalog check complete.');
    } catch (seedError) {
      console.error('[Server] Seeding failed but continuing:', seedError);
    }

    app.listen(env.port, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${env.port}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

void startServer();
