import PDFDocument from 'pdfkit';
import { Prescription } from '../models/Prescription.js';
import { Appointment } from '../models/Appointment.js';
import { DoctorProfile } from '../models/DoctorProfile.js';
import { PatientProfile } from '../models/PatientProfile.js';
import { Notification } from '../models/Notification.js';
import { logAudit } from '../middleware/audit.js';

export const createPrescription = async (req, res, next) => {
  try {
    const { appointmentId, patientId, medicines, instructions, followUpDate } = req.body;

    if (!appointmentId || !patientId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'appointmentId, patientId, and a valid medicines array are required.'
      });
    }

    const doctorId = req.user._id;

    // Verify appointment belongs to this doctor
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.doctorId.toString() !== doctorId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only prescribe for appointments assigned to you.'
      });
    }

    const prescription = await Prescription.create({
      appointmentId,
      patientId,
      doctorId,
      medicines,
      instructions: instructions || 'Take medicines with warm water after meals. Rest adequately.',
      followUpDate: followUpDate || ''
    });

    // Mark appointment as completed
    appointment.status = 'completed';
    await appointment.save();

    // Notify patient
    await Notification.create({
      userId: patientId,
      message: `Dr. ${req.user.name} has issued a digital prescription for your consultation.`,
      type: 'appointment'
    });

    await logAudit(req, 'CREATE_PRESCRIPTION', 'Prescription', {
      prescriptionId: prescription._id,
      patientId,
      appointmentId
    });

    const populated = await Prescription.findById(prescription._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Digital prescription created successfully',
      prescription: populated
    });
  } catch (err) {
    next(err);
  }
};

export const getPrescriptions = async (req, res, next) => {
  try {
    const { patientId, appointmentId } = req.query;
    const filter = {};

    if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      filter.doctorId = req.user._id;
    }

    if (patientId && ['doctor', 'receptionist', 'admin'].includes(req.user.role)) {
      filter.patientId = patientId;
    }

    if (appointmentId) {
      filter.appointmentId = appointmentId;
    }

    const prescriptions = await Prescription.find(filter)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone')
      .populate('appointmentId', 'date slotTime reason')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (err) {
    next(err);
  }
};

export const getPrescriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findById(id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone')
      .populate('appointmentId');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // RBAC check
    if (req.user.role === 'patient' && prescription.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view your own prescriptions.'
      });
    }

    res.json({
      success: true,
      prescription
    });
  } catch (err) {
    next(err);
  }
};

export const getPrescriptionPdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findById(id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone')
      .populate('appointmentId');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // RBAC check
    if (req.user.role === 'patient' && prescription.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only download your own prescriptions.'
      });
    }

    const [doctorProfile, patientProfile] = await Promise.all([
      DoctorProfile.findOne({ userId: prescription.doctorId._id }).populate('departmentId'),
      PatientProfile.findOne({ userId: prescription.patientId._id })
    ]);

    // Create PDF Document
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Prescription-${prescription._id.toString().slice(-6)}.pdf`
    );

    doc.pipe(res);

    // Header: Hospital Info
    doc.fillColor('#0284c7').fontSize(22).text('MediCare 360', 50, 50, { bold: true });
    doc.fillColor('#64748b').fontSize(10).text('Smart Healthcare & Multi-Specialty Hospital', 50, 75);
    doc.text('108 Healthcare Blvd, Tech City | Helpline: +91 800-MEDICARE | info@medicare360.com', 50, 90);

    doc.moveTo(50, 108).lineTo(550, 108).strokeColor('#0284c7').lineWidth(1.5).stroke();

    // Doctor & Patient Block
    doc.moveDown(2);
    const startY = 120;

    // Left Column: Doctor Info
    doc.fillColor('#0f172a').fontSize(12).text(`Dr. ${prescription.doctorId.name}`, 50, startY, { bold: true });
    doc.fillColor('#475569').fontSize(9).text(`Specialization: ${doctorProfile?.specialization || 'Consultant Physician'}`);
    doc.text(`Qualification: ${doctorProfile?.qualification || 'MBBS, MD'}`);
    doc.text(`Department: ${doctorProfile?.departmentId?.name || 'General Medicine'}`);

    // Right Column: Patient Info
    doc.fillColor('#0f172a').fontSize(12).text(`Patient: ${prescription.patientId.name}`, 320, startY, { bold: true });
    doc.fillColor('#475569').fontSize(9).text(`Phone: ${prescription.patientId.phone || 'N/A'}`);
    doc.text(`Gender: ${patientProfile?.gender || 'N/A'} | Blood Group: ${patientProfile?.bloodGroup || 'N/A'}`);
    doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`);

    doc.moveTo(50, 185).lineTo(550, 185).strokeColor('#e2e8f0').lineWidth(1).stroke();

    // Rx Symbol
    doc.fillColor('#0284c7').fontSize(26).text('Rx', 50, 200, { bold: true });

    // Medicines Table
    let tableY = 240;
    doc.fillColor('#1e293b').fontSize(10).text('MEDICINE & DOSAGE', 50, tableY, { bold: true });
    doc.text('FREQUENCY', 250, tableY, { bold: true });
    doc.text('DURATION', 380, tableY, { bold: true });
    doc.text('INSTRUCTIONS', 460, tableY, { bold: true });

    doc.moveTo(50, tableY + 15).lineTo(550, tableY + 15).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    tableY += 25;

    prescription.medicines.forEach((med, index) => {
      doc.fillColor('#0f172a').fontSize(9).text(`${index + 1}. ${med.name} (${med.dosage})`, 50, tableY);
      doc.fillColor('#475569').text(med.frequency, 250, tableY);
      doc.text(med.duration, 380, tableY);
      doc.text(med.instructions || 'As advised', 460, tableY);
      tableY += 22;
    });

    // Instructions & Advice
    tableY = Math.max(tableY + 20, 420);
    doc.fillColor('#0284c7').fontSize(11).text('Doctor Advice & Instructions:', 50, tableY, { bold: true });
    tableY += 16;
    doc.fillColor('#334155').fontSize(9).text(prescription.instructions || 'Take medications on time. Drink adequate fluids.', 50, tableY, { width: 500 });

    if (prescription.followUpDate) {
      tableY += 30;
      doc.fillColor('#dc2626').fontSize(10).text(`Recommended Follow-up Date: ${prescription.followUpDate}`, 50, tableY, { bold: true });
    }

    // Signature Area
    const signY = 620;
    doc.moveTo(380, signY).lineTo(530, signY).strokeColor('#94a3b8').lineWidth(1).stroke();
    doc.fillColor('#0f172a').fontSize(10).text(`Dr. ${prescription.doctorId.name}`, 380, signY + 5, { align: 'center', width: 150 });
    doc.fillColor('#64748b').fontSize(8).text('Authorized Medical Officer', 380, signY + 18, { align: 'center', width: 150 });

    // Footer Disclaimer
    doc.fillColor('#94a3b8').fontSize(7).text(
      'Disclaimer: This is a verified digital prescription generated via MediCare 360 EHR. Clinical responsibility remains strictly with the attending physician.',
      50,
      720,
      { align: 'center', width: 500 }
    );

    doc.end();

    await logAudit(req, 'DOWNLOAD_PRESCRIPTION_PDF', 'Prescription', { prescriptionId: id });
  } catch (err) {
    next(err);
  }
};
