import { Appointment } from '../models/Appointment.js';
import { User } from '../models/User.js';
import { DoctorProfile } from '../models/DoctorProfile.js';
import { Leave } from '../models/Leave.js';
import { Availability } from '../models/Availability.js';
import { Notification } from '../models/Notification.js';
import { Bill } from '../models/Bill.js';
import { logAudit } from '../middleware/audit.js';

function normalizeSlotTime(t) {
  if (!t) return t;
  const str = String(t).trim();
  const match = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const mins = match[2];
    const meridiem = match[3] ? match[3].toUpperCase() : null;
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${mins}`;
  }
  return str;
}

export const createAppointment = async (req, res, next) => {
  try {
    let {
      patientId,
      doctorId,
      departmentId,
      date,
      slotTime,
      source = 'online',
      reason = 'General Consultation'
    } = req.body;

    slotTime = normalizeSlotTime(slotTime || req.body.time);

    // RBAC: Patient, Receptionist, Admin, or Guest online user
    if (req.user) {
      if (req.user.role === 'patient') {
        patientId = req.user._id;
        source = 'online';
      } else if (['receptionist', 'admin'].includes(req.user.role)) {
        if (!patientId) {
          return res.status(400).json({
            success: false,
            message: 'patientId is required for booking appointments.'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Doctors cannot directly book patient appointments.'
        });
      }
    } else {
      // Guest online booking
      source = 'online';
      if (!patientId) {
        const phone = req.body.patientPhone || req.body.phone || '+91 98765 43210';
        let patient = await User.findOne({ phone, role: 'patient' });
        if (!patient) {
          patient = await User.findOne({ email: 'patient@medicare360.com' });
        }
        if (!patient) {
          patient = await User.findOne({ role: 'patient' });
        }
        if (patient) {
          patientId = patient._id;
        }
      }
    }

    if (!doctorId || !date || !slotTime) {
      return res.status(400).json({
        success: false,
        message: 'doctorId, date, and slotTime are required.'
      });
    }

    // Verify doctor exists and is active
    let doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      const docProfile = await DoctorProfile.findById(doctorId);
      if (docProfile) {
        doctor = await User.findById(docProfile.userId);
        if (doctor) {
          doctorId = doctor._id;
          if (!departmentId) departmentId = docProfile.departmentId;
        }
      }
    }

    if (!doctor || doctor.role !== 'doctor' || !doctor.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or inactive.'
      });
    }

    // Determine departmentId if not passed
    if (!departmentId) {
      const docProfile = await DoctorProfile.findOne({ userId: doctorId });
      if (docProfile) {
        departmentId = docProfile.departmentId;
      }
    }
    if (!departmentId) {
      const anyDept = await Department.findOne();
      if (anyDept) departmentId = anyDept._id;
    }

    // 1. Check if doctor is on leave on this date
    const onLeave = await Leave.findOne({ doctorId, date });
    if (onLeave) {
      return res.status(400).json({
        success: false,
        message: `Doctor is on leave on ${date} (${onLeave.reason}). Please select another date.`
      });
    }

    // 2. Check if doctor has consulting hours on this day of week
    const dayOfWeek = new Date(date).getUTCDay();
    let schedule = await Availability.findOne({ doctorId, dayOfWeek, isActive: true });
    if (!schedule) {
      schedule = await Availability.findOne({ doctorId, isActive: true });
    }
    if (!schedule) {
      return res.status(400).json({
        success: false,
        message: 'Doctor does not have active consulting hours on this day of the week.'
      });
    }

    // 3. Check if slot is already booked for active appointments
    const existingBooking = await Appointment.findOne({
      doctorId,
      date,
      slotTime,
      status: { $in: ['pending', 'confirmed', 'checked-in', 'in-progress'] }
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: `The slot ${slotTime} on ${date} is already booked for Dr. ${doctor.name}. Please select a different time slot.`
      });
    }

    // Status: Online bookings default to 'pending' or 'confirmed' (walk-ins confirmed immediately)
    const initialStatus = source === 'walk-in' ? 'confirmed' : 'pending';

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      departmentId,
      date,
      slotTime,
      status: initialStatus,
      source,
      reason
    });

    // Create notifications for patient and doctor
    await Promise.all([
      Notification.create({
        userId: patientId,
        message: `Appointment scheduled with Dr. ${doctor.name} for ${date} at ${slotTime} (Status: ${initialStatus}).`,
        type: 'appointment'
      }),
      Notification.create({
        userId: doctorId,
        message: `New appointment booking received from patient for ${date} at ${slotTime}.`,
        type: 'appointment'
      })
    ]);

    await logAudit(req, 'BOOK_APPOINTMENT', 'Appointment', {
      appointmentId: appointment._id,
      patientId,
      doctorId,
      date,
      slotTime
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone')
      .populate('departmentId', 'name');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: populated
    });
  } catch (err) {
    next(err);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    const {
      date,
      status,
      doctorId,
      patientId,
      departmentId,
      page = 1,
      limit = 50
    } = req.query;

    const filter = {};

    // RBAC Scoping
    if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      filter.doctorId = req.user._id;
    } else {
      // Receptionist & Admin can filter by any patient or doctor
      if (doctorId) filter.doctorId = doctorId;
      if (patientId) filter.patientId = patientId;
    }

    if (date) filter.date = date;
    if (status) filter.status = status;
    if (departmentId) filter.departmentId = departmentId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate('patientId', 'name email phone avatar')
        .populate('doctorId', 'name email phone avatar')
        .populate('departmentId', 'name')
        .sort({ date: -1, slotTime: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Appointment.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: appointments.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      appointments
    });
  } catch (err) {
    next(err);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason, notes } = req.body;

    const appointment = await Appointment.findById(id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Role verification
    const normalizedStatus = (status || '').toLowerCase();
    if (req.user.role === 'patient') {
      const patientUserId = appointment.patientId?._id || appointment.patientId;
      if (patientUserId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only update your own appointments.'
        });
      }
      if (normalizedStatus !== 'cancelled') {
        return res.status(403).json({
          success: false,
          message: 'Patients can only cancel their appointments.'
        });
      }
    } else if (req.user.role === 'doctor' && appointment.doctorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update appointments assigned to you.'
      });
    }

    // If status is rejected, reason is required
    if (normalizedStatus === 'rejected' && !cancellationReason) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required.'
      });
    }

    appointment.status = normalizedStatus || status;
    if (cancellationReason) appointment.cancellationReason = cancellationReason;
    if (notes) appointment.notes = notes;

    await appointment.save();

    // Notify patient
    await Notification.create({
      userId: appointment.patientId._id,
      message: `Your appointment with Dr. ${appointment.doctorId.name} for ${appointment.date} has been updated to: ${appointment.status}.`,
      type: 'appointment'
    });

    await logAudit(req, 'UPDATE_APPOINTMENT_STATUS', 'Appointment', {
      appointmentId: id,
      newStatus: appointment.status
    });

    res.json({
      success: true,
      message: `Appointment status updated to ${appointment.status}`,
      appointment
    });
  } catch (err) {
    next(err);
  }
};

export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cancellationReason = req.body.cancellationReason || req.body.reason || req.body.notes || 'Cancelled by patient';

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // RBAC: Patient can cancel only their own
    if (req.user.role === 'patient' && appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only cancel your own appointments.'
      });
    }

    // Business Rule: Cancel only BEFORE the scheduled time
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.slotTime}:00`);
    const now = new Date();
    if (appointmentDateTime < now && req.user.role === 'patient') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an appointment that has already passed.'
      });
    }

    if (['completed', 'cancelled', 'rejected'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Appointment is already ${appointment.status} and cannot be cancelled.`
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason;
    await appointment.save();

    // Notify doctor
    await Notification.create({
      userId: appointment.doctorId,
      message: `Appointment on ${appointment.date} at ${appointment.slotTime} was cancelled: ${cancellationReason}`,
      type: 'appointment'
    });

    await logAudit(req, 'CANCEL_APPOINTMENT', 'Appointment', {
      appointmentId: id,
      reason: cancellationReason
    });

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (err) {
    next(err);
  }
};

export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newDate, newSlotTime } = req.body;

    if (!newDate || !newSlotTime) {
      return res.status(400).json({
        success: false,
        message: 'newDate and newSlotTime are required.'
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // RBAC: Patient only their own, or Receptionist/Admin
    if (req.user.role === 'patient' && appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only reschedule your own appointments.'
      });
    }

    // Check doctor availability on new date
    const onLeave = await Leave.findOne({ doctorId: appointment.doctorId, date: newDate });
    if (onLeave) {
      return res.status(400).json({
        success: false,
        message: `Doctor is on leave on ${newDate}. Please choose another date.`
      });
    }

    // Check duplicate slot collision
    const existing = await Appointment.findOne({
      _id: { $ne: id },
      doctorId: appointment.doctorId,
      date: newDate,
      slotTime: newSlotTime,
      status: { $in: ['pending', 'confirmed', 'checked-in', 'in-progress'] }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `The slot ${newSlotTime} on ${newDate} is already booked. Please choose another time.`
      });
    }

    appointment.date = newDate;
    appointment.slotTime = newSlotTime;
    appointment.status = 'confirmed';
    await appointment.save();

    await Notification.create({
      userId: appointment.patientId,
      message: `Your appointment has been rescheduled to ${newDate} at ${newSlotTime}.`,
      type: 'appointment'
    });

    await logAudit(req, 'RESCHEDULE_APPOINTMENT', 'Appointment', {
      appointmentId: id,
      newDate,
      newSlotTime
    });

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment
    });
  } catch (err) {
    next(err);
  }
};
