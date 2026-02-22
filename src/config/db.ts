import mongoose from 'mongoose';
import logger from '../utils/logger';

/**
 * Connect to MongoDB using Mongoose.
 * Retries up to 5 times on failure before exiting.
 */
const connectDB = async (): Promise<typeof mongoose> => {
  const MAX_RETRIES = 5;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI as string, {
        autoIndex: process.env.NODE_ENV !== 'production',
      });
      logger.info(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      retries += 1;
      logger.error(`MongoDB connection attempt ${retries} failed: ${(error as Error).message}`);
      if (retries >= MAX_RETRIES) {
        logger.error('Max retries reached. Exiting process.');
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // Unreachable but satisfies TypeScript
  throw new Error('Failed to connect to MongoDB');
};

export default connectDB;
