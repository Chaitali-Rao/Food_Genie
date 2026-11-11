import mongoose from 'mongoose';

const READY_STATE_MAP = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/**
 * Connect to MongoDB with timeout and resilient error handling.
 * Server remains alive even if MongoDB is initially unreachable.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/food_genie';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] Initial MongoDB connection failed: ${error.message}`);
    console.warn('[Database Warning] API running in degraded mode. Database features will be unavailable until MongoDB is started.');
    return null;
  }
};

/**
 * Returns current MongoDB connection health state.
 */
export const getDbStatus = () => {
  const stateCode = mongoose.connection.readyState;
  return {
    status: READY_STATE_MAP[stateCode] || 'unknown',
    readyState: stateCode,
    host: mongoose.connection.host || null,
    databaseName: mongoose.connection.name || null,
  };
};

// Connection event handlers for real-time monitoring
mongoose.connection.on('connected', () => {
  console.log('[Database Event] Connection established');
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database Event] Runtime error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[Database Event] Connection dropped');
});

