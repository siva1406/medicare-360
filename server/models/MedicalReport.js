import mongoose from 'mongoose';

const medicalReportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['Lab Report', 'Radiology', 'Prescription', 'Discharge Summary', 'Other'],
      default: 'Lab Report'
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      default: ''
    },
    fileSize: {
      type: Number,
      default: 0
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

export const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);
