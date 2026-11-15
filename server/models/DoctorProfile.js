import mongoose from 'mongoose';

const doctorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    specialization: {
      type: String,
      required: true,
      trim: true
    },
    qualification: {
      type: String,
      default: 'MBBS, MD',
      trim: true
    },
    experienceYears: {
      type: Number,
      default: 5,
      min: 0
    },
    consultationFee: {
      type: Number,
      default: 500,
      min: 0
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5
    },
    bio: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);
