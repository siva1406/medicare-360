import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true
    },
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
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true }, // e.g. "1-0-1 after meals"
        duration: { type: String, required: true }, // e.g. "5 days"
        instructions: { type: String, default: '' }
      }
    ],
    instructions: {
      type: String,
      default: 'Take medicines on time with plenty of water. Get adequate rest.'
    },
    followUpDate: {
      type: String, // "YYYY-MM-DD"
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Prescription = mongoose.model('Prescription', prescriptionSchema);
