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

// Database Connection & Server Startup
console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas Cloud');
    app.listen(PORT, () => {
      console.log(`Backend server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Starting server in offline-mode (without database)...');
    
    // Allow server to run even if DB connection fails, so frontend developers can work
    app.listen(PORT, () => {
      console.log(`Backend server is running on port ${PORT} (OFFLINE-MODE)`);
    });
  });
