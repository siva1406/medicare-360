import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    dayOfWeek: {
      type: Number, // 0 = Sunday, 1 = Monday, ... 6 = Saturday
      required: true,
      min: 0,
      max: 6
    },
    startTime: {
      type: String, // "09:00"
      required: true
    },
    endTime: {
      type: String, // "17:00"
      required: true
    },
    slotDurationMinutes: {
      type: Number,
      default: 30,
      min: 10
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Unique availability per doctor per day
availabilitySchema.index({ doctorId: 1, dayOfWeek: 1 }, { unique: true });

export const Availability = mongoose.model('Availability', availabilitySchema);
