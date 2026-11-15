import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: true
    },
    reason: {
      type: String,
      default: 'Personal Leave'
    }
  },
  {
    timestamps: true
  }
);

leaveSchema.index({ doctorId: 1, date: 1 }, { unique: true });

export const Leave = mongoose.model('Leave', leaveSchema);
