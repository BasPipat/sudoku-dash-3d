import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware พื้นฐาน
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// ระบบ Database Connection แบบ Serverless (ปลอดภัย ไม่ค้าง)
// ----------------------------------------------------
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('=> [MongoDB] Using existing database connection');
    return;
  }
  if (!MONGODB_URI) {
    console.error('=> [MongoDB] ERROR: MONGODB_URI is missing!');
    return;
  }

  console.log('=> [MongoDB] Creating new database connection...');
  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = db.connections[0].readyState;
    console.log('=> [MongoDB] Successfully connected to Atlas Cloud');
  } catch (error) {
    console.error('=> [MongoDB] Connection Error:', error);
  }
};

// ----------------------------------------------------
// Routes (ฝัง Middleware เช็กฐานข้อมูลเฉพาะตอนจะเรียก API)
// ----------------------------------------------------
app.use('/api/auth', async (req, res, next) => {
  await connectDB();
  next();
}, authRoutes);

// Health Check เอาไว้เช็กว่า Vercel รันเซิร์ฟเวอร์เราขึ้นไหม
app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'Sudoku Dash 3D Backend is running on Vercel!' });
});

// ----------------------------------------------------
// Start Server (เฉพาะตอนรันเทสต์ในเครื่อง Local)
// ----------------------------------------------------
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    await connectDB();
    console.log(`Backend server is running on port ${PORT} (local dev)`);
  });
}

// โยน app ให้ Vercel จัดการต่อแบบ Serverless
export default app;