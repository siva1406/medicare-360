import { User } from '../models/User.js';
import { PatientProfile } from '../models/PatientProfile.js';
import { Appointment } from '../models/Appointment.js';
import { Prescription } from '../models/Prescription.js';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { MedicalReport } from '../models/MedicalReport.js';
import { logAudit } from '../middleware/audit.js';

export const getPatients = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { role: 'patient' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const [patients, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    const patientIds = patients.map(p => p._id);
    const profiles = await PatientProfile.find({ userId: { $in: patientIds } });
    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.userId.toString()] = p;
    });

    const populated = patients.map(p => ({
      _id: p._id,
      id: p._id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      isActive: p.isActive,
      createdAt: p.createdAt,
      profile: profileMap[p._id.toString()] || null
    }));

    res.json({
      success: true,
      patients: populated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getPatientProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    // RBAC: Patient can only view own profile unless doctor/receptionist/admin
    if (req.user.role === 'patient' && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only access your own profile.'
      });
    }

    const patient = await User.findById(id);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const profile = await PatientProfile.findOne({ userId: patient._id });
    await logAudit(req, 'VIEW_PATIENT_PROFILE', 'PatientProfile', { patientId: id });

    res.json({
      success: true,
      patient: {
        _id: patient._id,
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        isActive: patient.isActive,
        createdAt: patient.createdAt,
        profile
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updatePatientProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.role === 'patient' && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own profile.'
      });
    }

    const { name, phone, dateOfBirth, gender, bloodGroup, address, allergies, emergencyContact, isActive } = req.body;

    const userUpdates = {};
    if (name) userUpdates.name = name;
    if (phone) userUpdates.phone = phone;
    if (req.user.role === 'admin' && typeof isActive === 'boolean') {
      userUpdates.isActive = isActive;
    }

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(id, userUpdates);
    }

    const profileUpdates = {
      ...(dateOfBirth && { dateOfBirth }),
      ...(gender && { gender }),
      ...(bloodGroup && { bloodGroup }),
      ...(address && { address }),
      ...(allergies && { allergies: Array.isArray(allergies) ? allergies : [allergies] }),
      ...(emergencyContact && { emergencyContact })
    };

    const updatedProfile = await PatientProfile.findOneAndUpdate(
      { userId: id },
      { $set: profileUpdates },
      { new: true, upsert: true }
    );

    await logAudit(req, 'UPDATE_PATIENT_PROFILE', 'PatientProfile', { patientId: id });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (err) {
    next(err);
  }
};

export const getMedicalTimeline = async (req, res, next) => {
  try {
    const { id } = req.params;

    // RBAC: Patients can access only their own records.
    if (req.user.role === 'patient' && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only access your own medical timeline.'
      });
    }

    // Doctors can access only patients they have treated or have booked with them.
    if (req.user.role === 'doctor') {
      const hasAccess = await Appointment.exists({
        doctorId: req.user._id,
        patientId: id
      });
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only view records of patients who have booked or consulted with you.'
        });
      }
    }

    const [appointments, prescriptions, records, reports] = await Promise.all([
      Appointment.find({ patientId: id })
        .populate('doctorId', 'name email phone')
        .populate('departmentId', 'name')
        .sort({ date: -1 }),
      Prescription.find({ patientId: id })
        .populate('doctorId', 'name email')
        .sort({ createdAt: -1 }),
      MedicalRecord.find({ patientId: id })
        .populate('doctorId', 'name email')
        .sort({ createdAt: -1 }),
      MedicalReport.find({ patientId: id })
        .populate('uploadedBy', 'name role')
        .sort({ createdAt: -1 })
    ]);

    // Construct unified chronological timeline
    const timeline = [];

    appointments.forEach(a => {
      timeline.push({
        type: 'appointment',
        id: a._id,
        date: a.date,
        time: a.slotTime,
        timestamp: new Date(`${a.date}T${a.slotTime}:00Z`).getTime() || new Date(a.createdAt).getTime(),
        title: `Appointment with Dr. ${a.doctorId?.name || 'Doctor'}`,
        status: a.status,
        department: a.departmentId?.name || '',
        reason: a.reason,
        data: a
      });
    });

    prescriptions.forEach(p => {
      timeline.push({
        type: 'prescription',
        id: p._id,
        date: p.createdAt ? p.createdAt.toISOString().split('T')[0] : '',
        timestamp: new Date(p.createdAt).getTime(),
        title: `Prescription issued by Dr. ${p.doctorId?.name || 'Doctor'}`,
        medicinesCount: p.medicines?.length || 0,
        instructions: p.instructions,
        followUpDate: p.followUpDate,
        data: p
      });
    });

    records.forEach(r => {
      timeline.push({
        type: 'clinical_notes',
        id: r._id,
        date: r.createdAt ? r.createdAt.toISOString().split('T')[0] : '',
        timestamp: new Date(r.createdAt).getTime(),
        title: `Consultation Notes by Dr. ${r.doctorId?.name || 'Doctor'}`,
        vitals: r.vitals,
        notes: r.notes,
        data: r
      });
    });

    reports.forEach(rp => {
      timeline.push({
        type: 'report',
        id: rp._id,
        date: rp.createdAt ? rp.createdAt.toISOString().split('T')[0] : '',
        timestamp: new Date(rp.createdAt).getTime(),
        title: `${rp.title} (${rp.type})`,
        fileUrl: rp.fileUrl,
        uploadedBy: rp.uploadedBy?.name || 'User',
        data: rp
      });
    });

    // Sort descending by timestamp
    timeline.sort((a, b) => b.timestamp - a.timestamp);

    // Audit log
    await logAudit(req, 'VIEW_MEDICAL_TIMELINE', 'MedicalTimeline', { patientId: id });

    res.json({
      success: true,
      patientId: id,
      timeline,
      totalEntries: timeline.length
    });
  } catch (err) {
    next(err);
  }
};
