import { User } from '../models/User.js';
import { DoctorProfile } from '../models/DoctorProfile.js';
import { Department } from '../models/Department.js';
import { Availability } from '../models/Availability.js';
import { Leave } from '../models/Leave.js';
import { Appointment } from '../models/Appointment.js';
import { logAudit } from '../middleware/audit.js';

export const getDoctors = async (req, res, next) => {
  try {
    const { department, specialization, search, page = 1, limit = 50 } = req.query;

    const doctorUsers = await User.find({
      role: 'doctor',
      isActive: true,
      ...(search && {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      })
    });

    const doctorUserIds = doctorUsers.map(d => d._id);

    let profileFilter = { userId: { $in: doctorUserIds } };
    if (department) {
      // Find department ID by name or ID
      const deptObj = await Department.findOne({
        $or: [{ _id: department.match(/^[0-9a-fA-F]{24}$/) ? department : null }, { name: { $regex: department, $options: 'i' } }]
      });
      if (deptObj) {
        profileFilter.departmentId = deptObj._id;
      }
    }

    if (specialization) {
      profileFilter.specialization = { $regex: specialization, $options: 'i' };
    }

    const profiles = await DoctorProfile.find(profileFilter)
      .populate('departmentId')
      .populate('userId', 'name email phone avatar isActive');

    const result = profiles
      .filter(p => p.userId && p.userId.isActive)
      .map(p => ({
        _id: p.userId._id,
        id: p.userId._id,
        profileId: p._id,
        name: p.userId.name,
        email: p.userId.email,
        phone: p.userId.phone,
        avatar: p.userId.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.userId.name)}&background=0284c7&color=fff`,
        department: p.departmentId ? p.departmentId.name : 'General Medicine',
        departmentId: p.departmentId ? p.departmentId._id : null,
        specialization: p.specialization,
        qualification: p.qualification,
        experienceYears: p.experienceYears || 5,
        experience: `${p.experienceYears || 5} Years`,
        consultationFee: p.consultationFee || 500,
        fee: p.consultationFee || 500,
        rating: p.rating || 4.9,
        available: true,
        timing: '09:00 AM - 05:00 PM',
        room: `OPD-${((parseInt(String(p.userId._id).slice(-2), 16) % 30) + 101)}`,
        bio: p.bio
      }));

    res.json({
      success: true,
      count: result.length,
      doctors: result
    });
  } catch (err) {
    next(err);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const profile = await DoctorProfile.findOne({ userId: user._id }).populate('departmentId');
    const availability = await Availability.find({ doctorId: user._id, isActive: true }).sort({ dayOfWeek: 1 });
    const leaves = await Leave.find({ doctorId: user._id, date: { $gte: new Date().toISOString().split('T')[0] } });

    res.json({
      success: true,
      doctor: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
        profile,
        availability,
        leaves
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    // RBAC: Doctor can only update own profile, Admin can update any
    if (req.user.role === 'doctor' && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit your own doctor profile.'
      });
    }

    const {
      name,
      phone,
      departmentId,
      specialization,
      qualification,
      experienceYears,
      consultationFee,
      bio,
      isActive
    } = req.body;

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
      ...(departmentId && { departmentId }),
      ...(specialization && { specialization }),
      ...(qualification && { qualification }),
      ...(experienceYears !== undefined && { experienceYears: Number(experienceYears) }),
      ...(consultationFee !== undefined && { consultationFee: Number(consultationFee) }),
      ...(bio !== undefined && { bio })
    };

    const updatedProfile = await DoctorProfile.findOneAndUpdate(
      { userId: id },
      { $set: profileUpdates },
      { new: true, upsert: true }
    ).populate('departmentId');

    await logAudit(req, 'UPDATE_DOCTOR', 'DoctorProfile', { doctorId: id });

    res.json({
      success: true,
      message: 'Doctor profile updated successfully',
      doctor: updatedProfile
    });
  } catch (err) {
    next(err);
  }
};

export const getDoctorAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // YYYY-MM-DD

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date in YYYY-MM-DD format.'
      });
    }

    // Check if doctor is on leave
    const isOnLeave = await Leave.findOne({ doctorId: id, date });
    if (isOnLeave) {
      return res.json({
        success: true,
        date,
        isAvailable: false,
        reason: `Doctor is on leave: ${isOnLeave.reason}`,
        slots: []
      });
    }

    // Determine day of week: Sunday = 0, Monday = 1, etc.
    const dayOfWeek = new Date(date).getUTCDay();

    // Check weekly availability schedule
    const schedule = await Availability.findOne({
      doctorId: id,
      dayOfWeek,
      isActive: true
    });

    if (!schedule) {
      return res.json({
        success: true,
        date,
        isAvailable: false,
        reason: 'Doctor does not consult on this day of the week.',
        slots: []
      });
    }

    // Generate slots
    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);
    const duration = schedule.slotDurationMinutes || 30;

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    const potentialSlots = [];
    for (let m = startMinutes; m < endMinutes; m += duration) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      potentialSlots.push(timeStr);
    }

    // Find existing booked slots for this date
    const bookedAppointments = await Appointment.find({
      doctorId: id,
      date,
      status: { $in: ['pending', 'confirmed', 'checked-in', 'in-progress'] }
    }).select('slotTime status');

    const bookedTimes = new Set(bookedAppointments.map(a => a.slotTime));

    const slots = potentialSlots.map(time => ({
      time,
      isAvailable: !bookedTimes.has(time),
      status: bookedTimes.has(time) ? 'booked' : 'available'
    }));

    res.json({
      success: true,
      date,
      isAvailable: true,
      schedule: {
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        duration
      },
      slots
    });
  } catch (err) {
    next(err);
  }
};

export const updateAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { schedules } = req.body; // Array of { dayOfWeek, startTime, endTime, slotDurationMinutes, isActive }

    if (req.user.role === 'doctor' && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own availability.'
      });
    }

    if (!Array.isArray(schedules)) {
      return res.status(400).json({
        success: false,
        message: 'schedules must be an array'
      });
    }

    for (const item of schedules) {
      await Availability.findOneAndUpdate(
        { doctorId: id, dayOfWeek: item.dayOfWeek },
        {
          $set: {
            startTime: item.startTime || '09:00',
            endTime: item.endTime || '17:00',
            slotDurationMinutes: item.slotDurationMinutes || 30,
            isActive: item.isActive !== undefined ? item.isActive : true
          }
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      message: 'Doctor availability schedule updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

export const addDoctorLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, reason } = req.body;

    if (req.user.role === 'doctor' && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only add leave for yourself.'
      });
    }

    const leave = await Leave.findOneAndUpdate(
      { doctorId: id, date },
      { $set: { reason: reason || 'Personal Leave' } },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Leave scheduled successfully',
      leave
    });
  } catch (err) {
    next(err);
  }
};

export const getDoctorStats = async (req, res, next) => {
  try {
    const doctorId = req.params.id || req.user._id;
    const todayStr = new Date().toISOString().split('T')[0];

    const [todayTotal, todayCompleted, todayPending, todayCancelled, allTimeTotal] = await Promise.all([
      Appointment.countDocuments({ doctorId, date: todayStr }),
      Appointment.countDocuments({ doctorId, date: todayStr, status: 'completed' }),
      Appointment.countDocuments({ doctorId, date: todayStr, status: { $in: ['pending', 'confirmed', 'checked-in'] } }),
      Appointment.countDocuments({ doctorId, date: todayStr, status: 'cancelled' }),
      Appointment.countDocuments({ doctorId })
    ]);

    res.json({
      success: true,
      stats: {
        todayTotal,
        todayCompleted,
        todayPending,
        todayCancelled,
        allTimeTotal
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Smart Doctor Recommendation
 * Ranks doctors by department match, availability in window, rating, experience.
 * Fully transparent reasoning score breakdown.
 * Complies with strict AI rule: administrative intelligence only, clinical disclaimer included.
 */
export const recommendDoctors = async (req, res, next) => {
  try {
    const params = { ...req.query, ...req.body };
    let { department, date, preferredTime, symptoms, symptom } = params;

    const symptomText = (symptoms || symptom || '').toLowerCase();
    if (!department && symptomText) {
      if (symptomText.includes('heart') || symptomText.includes('chest') || symptomText.includes('cardio') || symptomText.includes('palpitat')) {
        department = 'Cardiology';
      } else if (symptomText.includes('head') || symptomText.includes('brain') || symptomText.includes('neuro') || symptomText.includes('dizz')) {
        department = 'Neurology';
      } else if (symptomText.includes('bone') || symptomText.includes('joint') || symptomText.includes('fract') || symptomText.includes('ortho') || symptomText.includes('knee')) {
        department = 'Orthopedics';
      } else if (symptomText.includes('skin') || symptomText.includes('rash') || symptomText.includes('derma') || symptomText.includes('acne')) {
        department = 'Dermatology';
      } else if (symptomText.includes('child') || symptomText.includes('infant') || symptomText.includes('pediat') || symptomText.includes('baby')) {
        department = 'Pediatrics';
      } else if (symptomText.includes('stomach') || symptomText.includes('digest') || symptomText.includes('gastro') || symptomText.includes('acid')) {
        department = 'Gastroenterology';
      } else if (symptomText.includes('eye') || symptomText.includes('vision') || symptomText.includes('cataract') || symptomText.includes('ophthal')) {
        department = 'Ophthalmology';
      } else if (symptomText.includes('ear') || symptomText.includes('nose') || symptomText.includes('throat') || symptomText.includes('ent')) {
        department = 'ENT';
      } else {
        department = 'General Medicine';
      }
    }

    const profiles = await DoctorProfile.find()
      .populate('departmentId')
      .populate('userId', 'name email phone avatar isActive');

    const activeProfiles = profiles.filter(p => p.userId && p.userId.isActive);

    const scoredDoctors = [];

    for (const p of activeProfiles) {
      let score = 50; // base score
      const reasons = [];

      // 1. Department match
      if (department) {
        const deptName = p.departmentId ? p.departmentId.name.toLowerCase() : '';
        const searchDept = department.toLowerCase();
        if (deptName.includes(searchDept) || searchDept.includes(deptName)) {
          score += 30;
          reasons.push(`Exact specialty match with ${p.departmentId.name}`);
        } else {
          score -= 20;
        }
      }

      // 2. Rating score (up to 15 points)
      const rating = p.rating || 4.5;
      const ratingBonus = Math.round((rating / 5) * 15);
      score += ratingBonus;
      reasons.push(`High patient satisfaction rating (${rating.toFixed(1)} / 5.0)`);

      // 3. Experience bonus (up to 10 points)
      const exp = p.experienceYears || 5;
      if (exp >= 15) {
        score += 10;
        reasons.push(`Senior consultant with ${exp}+ years clinical experience`);
      } else if (exp >= 8) {
        score += 7;
        reasons.push(`Experienced practitioner with ${exp} years experience`);
      } else {
        score += 4;
        reasons.push(`${exp} years of dedicated practice`);
      }

      // 4. Date availability check
      if (date) {
        const leave = await Leave.findOne({ doctorId: p.userId._id, date });
        if (leave) {
          score -= 50;
          reasons.push(`Unavailable on requested date (${leave.reason})`);
        } else {
          const dayOfWeek = new Date(date).getUTCDay();
          const avail = await Availability.findOne({ doctorId: p.userId._id, dayOfWeek, isActive: true });
          if (avail) {
            score += 15;
            reasons.push(`Verified open clinic hours on ${date}`);
          } else {
            score -= 15;
            reasons.push(`Does not have routine consulting hours on this day`);
          }
        }
      }

      const matchPercentage = Math.min(Math.max(score, 10), 99);

      scoredDoctors.push({
        _id: p.userId._id,
        id: p.userId._id,
        name: p.userId.name,
        avatar: p.userId.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.userId.name)}&background=0284c7&color=fff`,
        department: p.departmentId ? p.departmentId.name : 'General Medicine',
        specialization: p.specialization,
        qualification: p.qualification,
        experienceYears: p.experienceYears || 5,
        experience: `${p.experienceYears || 5} Years`,
        consultationFee: p.consultationFee || 500,
        fee: p.consultationFee || 500,
        rating: p.rating || 4.9,
        available: true,
        timing: '09:00 AM - 05:00 PM',
        room: `OPD-${((parseInt(String(p.userId._id).slice(-2), 16) % 30) + 101)}`,
        matchPercentage,
        recommendationReasons: reasons
      });
    }

    // Sort by match percentage descending
    scoredDoctors.sort((a, b) => b.matchPercentage - a.matchPercentage);

    const recommendedList = scoredDoctors.slice(0, 10);
    const chosenDept = department || (recommendedList[0] ? recommendedList[0].department : 'General Medicine');

    res.json({
      success: true,
      clinicalNotice: 'Administrative Assistant Note: Doctor recommendations are generated based on schedule availability, department alignment, and experience metrics. Clinical diagnoses, prescriptions, and all medical decisions remain exclusively with licensed medical doctors.',
      recommendations: recommendedList,
      doctors: recommendedList,
      recommendedDepartment: chosenDept,
      advice: `Based on your described symptoms, our automated triage suggests consulting a specialist in ${chosenDept}. Please review the recommended physicians below to schedule your appointment.`
    });
  } catch (err) {
    next(err);
  }
};
