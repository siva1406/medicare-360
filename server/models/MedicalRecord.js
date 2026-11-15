import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema(
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
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    vitals: {
      bloodPressure: { type: String, default: '120/80' },
      heartRate: { type: Number, default: 72 },
      temperature: { type: Number, default: 98.6 },
      weight: { type: Number, default: 65 },
      oxygenLevel: { type: Number, default: 99 }
    },
    diagnosis: {
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

export const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
