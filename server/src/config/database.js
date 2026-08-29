import mongoose from 'mongoose';
import config from './index.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`✓ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

export default connectDB;
