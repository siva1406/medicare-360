import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true
    },
    slotTime: {
      type: String, // Format: HH:mm
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'checked-in', 'in-progress', 'completed', 'no-show'],
      default: 'pending'
    },
    source: {
      type: String,
      enum: ['online', 'walk-in'],
      default: 'online'
    },
    reason: {
      type: String,
      default: 'General Consultation'
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Prevent double booking at the database level for active appointments
appointmentSchema.index(
  { doctorId: 1, date: 1, slotTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'confirmed', 'checked-in', 'in-progress'] }
    }
  }
);

export const Appointment = mongoose.model('Appointment', appointmentSchema);
