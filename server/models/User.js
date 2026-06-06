import mongoose from 'mongoose';

const ScoreStatsSchema = new mongoose.Schema({
  highScore: { type: Number, default: 0 },
  totalPlayed: { type: Number, default: 0 },
  bestTime: { type: Number, default: null }, // best completion time in seconds
  bestMoves: { type: Number, default: null }  // best number of moves
}, { _id: false });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatar: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  appleId: { type: String, unique: true, sparse: true },
  stats: {
    easy: { type: ScoreStatsSchema, default: () => ({}) },
    medium: { type: ScoreStatsSchema, default: () => ({}) },
    hard: { type: ScoreStatsSchema, default: () => ({}) }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', UserSchema);
export default User;
