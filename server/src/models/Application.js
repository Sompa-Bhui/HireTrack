import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    location: { type: String, default: '' },
    applicationSource: {
      type: String,
      enum: ['LinkedIn', 'Indeed', 'Naukri', 'Foundit', 'Wellfound', 'HR Email', 'Company Career Page', 'Referral', 'Internshala', 'Glassdoor', 'Other'],
      default: 'Other'
    },
    status: { type: String, enum: ['Wishlist', 'Applied', 'OA', 'Interview', 'Technical Round', 'Manager Round', 'HR Round', 'Offer', 'Rejected'], default: 'Wishlist' },
    appliedDate: { type: Date, default: Date.now },
    interviewDate: { type: Date, default: null },
    jobUrl: { type: String, default: '' },
    links: { type: String, default: '' },
    notes: { type: String, default: '' },
    archived: { type: Boolean, default: false },
    favorite: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('Application', applicationSchema);
