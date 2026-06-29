import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    type: { type: String, enum: ['info', 'warning', 'success', 'deadline', 'interview'], default: 'info' },
    read: { type: Boolean, default: false },
    dueAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
