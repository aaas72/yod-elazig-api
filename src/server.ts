import dotenv from 'dotenv';
import path from 'path';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

import app from './app';
import connectDB from './config/db';
import { User } from './models';
import { logger } from './utils';

const PORT: number = parseInt(process.env.PORT || '5000', 10);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const usersWithoutUsername = await User.find({
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: '' },
      ],
    });

    if (usersWithoutUsername.length > 0) {
      for (const user of usersWithoutUsername) {
        await user.save();
      }
      logger.info(`Backfilled usernames for ${usersWithoutUsername.length} existing users.`);
    }

    let HOST = process.env.HOST;
    if (!HOST) {
      HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
    }
    const server = app.listen(PORT, HOST, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📚 API Docs: http://${HOST}:${PORT}/api/docs`);
      logger.info(`🏥 Health:   http://${HOST}:${PORT}/api/health`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // ── Graceful shutdown ──────────────────────────────
    const shutdown = (signal: string) => {
      logger.info(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // ── Unhandled errors ───────────────────────────────
    process.on('unhandledRejection', (reason: Error) => {
      logger.error('Unhandled Rejection:', reason);
      shutdown('unhandledRejection');
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      shutdown('uncaughtException');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
