import mongoose from 'mongoose';

const billSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    items: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 }
      }
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'partially_paid'],
      default: 'unpaid'
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'card', 'upi', 'none'],
      default: 'none'
    },
    transactionId: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

export const Bill = mongoose.model('Bill', billSchema);
