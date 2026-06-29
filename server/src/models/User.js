import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'system' },
    dailyGoal: { type: Number, default: 100, min: 1 },
    streak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
    totalMissionCompleted: { type: Number, default: 0, min: 0 },
    goalCompleted: { type: Boolean, default: false },
    goalCompletedAt: { type: Date, default: null },
    goalCompletedDate: { type: String, default: '' },
    achievements: { type: [String], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
