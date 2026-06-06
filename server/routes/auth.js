import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// POST /api/auth/google
router.post('/google', async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'Google idToken is required' });
  }

  try {
    // If GOOGLE_CLIENT_ID is not configured yet, we can fall back to decoding the token without verification for testing
    let payload;
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your-google-oauth-client-id.apps.googleusercontent.com') {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      // Decode JWT without verification for development if client id is not configured
      console.warn("GOOGLE_CLIENT_ID is not configured in .env. Decoding token without verification.");
      const parts = idToken.split('.');
      if (parts.length === 3) {
        payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      } else {
        throw new Error('Invalid token structure');
      }
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google token payload' });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find user by Google ID or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // Create new user
      user = new User({
        email,
        displayName: name || email.split('@')[0],
        avatar: picture,
        googleId,
      });
      await user.save();
    } else {
      // Update existing user properties if they changed
      let changed = false;
      if (!user.googleId) {
        user.googleId = googleId;
        changed = true;
      }
      if (picture && user.avatar !== picture) {
        user.avatar = picture;
        changed = true;
      }
      if (name && user.displayName !== name) {
        user.displayName = name;
        changed = true;
      }
      if (changed) {
        await user.save();
      }
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        stats: user.stats
      }
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Google authentication failed', error: error.message });
  }
});

// POST /api/auth/apple
router.post('/apple', async (req, res) => {
  const { identityToken, email, displayName, appleId } = req.body;

  if (!appleId || !email) {
    return res.status(400).json({ message: 'appleId and email are required' });
  }

  try {
    // Check if user exists by appleId or email
    let user = await User.findOne({ $or: [{ appleId }, { email }] });

    if (!user) {
      user = new User({
        email,
        displayName: displayName || email.split('@')[0],
        appleId,
      });
      await user.save();
    } else {
      let changed = false;
      if (!user.appleId) {
        user.appleId = appleId;
        changed = true;
      }
      if (changed) {
        await user.save();
      }
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        stats: user.stats
      }
    });

  } catch (error) {
    console.error('Apple Auth Error:', error);
    res.status(401).json({ message: 'Apple authentication failed', error: error.message });
  }
});

// GET /api/auth/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(444).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      stats: user.stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
});

// POST /api/auth/stats
router.post('/stats', authenticateToken, async (req, res) => {
  const { difficulty, score, time, moves } = req.body; // difficulty: 'easy', 'medium', 'hard'

  if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).json({ message: 'Invalid or missing difficulty level' });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentStats = user.stats[difficulty] || { highScore: 0, totalPlayed: 0, bestTime: null, bestMoves: null };

    // Update total played
    currentStats.totalPlayed += 1;

    // Update high score if new score is higher
    if (score && score > currentStats.highScore) {
      currentStats.highScore = score;
    }

    // Update best time if it's less than existing bestTime (or if bestTime is null)
    if (time && (currentStats.bestTime === null || time < currentStats.bestTime)) {
      currentStats.bestTime = time;
    }

    // Update best moves if it's less than existing bestMoves (or if bestMoves is null)
    if (moves && (currentStats.bestMoves === null || moves < currentStats.bestMoves)) {
      currentStats.bestMoves = moves;
    }

    // Set difficulty object and save
    user.stats[difficulty] = currentStats;
    user.markModified('stats');
    await user.save();

    res.json({
      message: 'Stats updated successfully',
      stats: user.stats
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error updating stats', error: error.message });
  }
});

export default router;
