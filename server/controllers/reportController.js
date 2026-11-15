import path from 'path';
import fs from 'fs';
import { MedicalReport } from '../models/MedicalReport.js';
import { Appointment } from '../models/Appointment.js';
import { logAudit } from '../middleware/audit.js';

export const uploadReport = async (req, res, next) => {
  try {
    let { patientId, title, type, notes } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a PDF, JPG, or PNG file.'
      });
    }

    if (req.user.role === 'patient') {
      patientId = req.user._id;
    } else if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'patientId is required for uploading reports.'
      });
    }

    // Doctor RBAC check: only upload for patient they treat or have booked
    if (req.user.role === 'doctor') {
      const hasTreated = await Appointment.exists({ doctorId: req.user._id, patientId });
      if (!hasTreated) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only upload reports for patients consulting with you.'
        });
      }
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const report = await MedicalReport.create({
      patientId,
      uploadedBy: req.user._id,
      title: title || req.file.originalname,
      type: type || 'Lab Report',
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      notes: notes || ''
    });

    await logAudit(req, 'UPLOAD_MEDICAL_REPORT', 'MedicalReport', {
      reportId: report._id,
      patientId,
      filename: req.file.originalname
    });

    const populated = await MedicalReport.findById(report._id)
      .populate('uploadedBy', 'name role')
      .populate('patientId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Medical report uploaded successfully',
      report: populated
    });
  } catch (err) {
    next(err);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const { patientId, type } = req.query;
    const filter = {};

    if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    } else if (patientId) {
      filter.patientId = patientId;
    }

    if (type) {
      filter.type = type;
    }

    const reports = await MedicalReport.find(filter)
      .populate('uploadedBy', 'name role')
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (err) {
    next(err);
  }
};

export const downloadReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await MedicalReport.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // RBAC: Patient can only download own
    if (req.user.role === 'patient' && report.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only access your own reports.'
      });
    }

    const filePath = path.resolve('.' + report.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Report file not found on server.'
      });
    }

    await logAudit(req, 'DOWNLOAD_REPORT', 'MedicalReport', { reportId: id });
    res.download(filePath, report.fileName || path.basename(filePath));
  } catch (err) {
    next(err);
  }
};
