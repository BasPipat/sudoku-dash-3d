import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health Check Route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Sudoku Dash 3D Backend is running' });
});

// Database Connection caching for serverless environment
let cachedDbConnection = null;

const connectDB = async () => {
  if (cachedDbConnection) {
    return cachedDbConnection;
  }
  
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI is not defined in environment variables.');
    return null;
  }

  console.log('Connecting to MongoDB Atlas...');
  try {
    cachedDbConnection = await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB Atlas Cloud');
    return cachedDbConnection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

// Initialize DB connection
connectDB().catch(err => {
  console.log('Running in offline-mode or DB connection pending...');
});

// Middleware to ensure DB connection is active before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    // Continue in offline-mode if DB is unreachable
    console.warn('Request processed without DB connection due to error');
  }
  next();
});

// Start listening only if running locally (not on Vercel)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT} (local dev)`);
  });
}

export default app;
