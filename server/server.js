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
// ระบบ Database Connection แบบ Serverless
// ----------------------------------------------------
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  if (!MONGODB_URI) {
    console.error('=> [MongoDB] ERROR: MONGODB_URI is missing!');
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = db.connections[0].readyState;
    console.log('=> [MongoDB] Connected to Atlas Cloud');
  } catch (error) {
    console.error('=> [MongoDB] Connection Error:', error);
  }
};

// Middleware ช่วยต่อสาย DB ก่อนเข้าสิทธิ์ Login
const handleAuthWithDB = async (req, res, next) => {
  await connectDB();
  next();
};

// ----------------------------------------------------
// Routes (ดักเผื่อไว้ทั้งแบบมี /api และไม่มี /api กัน Vercel เอ๋อ)
// ----------------------------------------------------
app.use('/api/auth', handleAuthWithDB, authRoutes);
app.use('/auth', handleAuthWithDB, authRoutes);

// Health Check (ดักทุกรูปแบบ ไม่ว่าจะมาเป็น /api หรือ / เพื่อให้ขึ้นหน้าจอสำเร็จแน่นอน)
app.get(['/api', '/api/', '/'], (req, res) => {
  res.json({
    status: 'ok',
    message: 'Sudoku Dash 3D Backend is running perfectly on Vercel!',
    testedUrl: req.url
  });
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