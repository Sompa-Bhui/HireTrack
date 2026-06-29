import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    companyName: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('Resume', resumeSchema);
