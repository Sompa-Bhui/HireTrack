import mongoose from 'mongoose';

const dailyTrackerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    platforms: {
      type: Object,
      default: {}
    },
    totalApplications: { type: Number, default: 0 },
    dailyGoal: { type: Number, default: 100 },
    goalCompleted: { type: Boolean, default: false },
    streakApplied: { type: Boolean, default: false }
  },
  { timestamps: true }
);

dailyTrackerSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model('DailyTracker', dailyTrackerSchema);
