import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare360';

  if (process.env.USE_MEMORY_DB === 'true') {
    mongoMemoryServer = await MongoMemoryServer.create();
    const memUri = mongoMemoryServer.getUri();
    await mongoose.connect(memUri);
    console.log(`[Database] Connected to In-Memory MongoDB at ${memUri}`);
    return;
  }

  try {
    // Attempt standard connection
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`[Database] Connected to MongoDB at ${uri}`);
  } catch (err) {
    console.warn(`[Database] Could not connect to MongoDB at ${uri} (${err.message}). Starting MongoMemoryServer...`);
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] Fallback: Connected to In-Memory MongoDB at ${memUri}`);
    } catch (fallbackErr) {
      console.error('[Database] Failed to initialize In-Memory MongoDB:', fallbackErr);
      throw fallbackErr;
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
