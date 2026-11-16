import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, User, Phone, CheckCircle, X, Stethoscope, AlertCircle } from 'lucide-react';

function to24HourTime(str) {
  if (!str) return '10:00';
  const clean = String(str).trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const mins = match[2];
    const meridiem = match[3] ? match[3].toUpperCase() : null;
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${mins}`;
  }
  return clean;
}

export function BookAppointmentModal({ isOpen, onClose, selectedDoctor, onBookingSuccess }) {
  const { user, showToast } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('10:00 AM');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getDoctors().then(docs => {
        const list = Array.isArray(docs) ? docs : (docs?.doctors || []);
        setDoctors(list);
        if (selectedDoctor) {
          const docTargetId = selectedDoctor._id || selectedDoctor.id;
          if (docTargetId) {
            setDoctorId(docTargetId);
          } else if (selectedDoctor.department) {
            const matched = list.find(d => (d.department || '').toLowerCase() === selectedDoctor.department.toLowerCase());
            if (matched) setDoctorId(matched._id || matched.id);
            else if (list.length > 0) setDoctorId(list[0]._id || list[0].id);
          }
        } else if (list.length > 0 && !doctorId) {
          setDoctorId(list[0]._id || list[0].id);
        }
      }).catch(console.error);

      if (user) {
        setPatientName(user.name || '');
        setPatientPhone(user.phone || '');
      }
    }
  }, [isOpen, selectedDoctor, user]);

  // Fetch real-time available slots whenever doctorId or date changes
  useEffect(() => {
    if (isOpen && doctorId && date) {
      setLoadingSlots(true);
      api.getDoctorAvailability(doctorId, date)
        .then(res => {
          if (res && res.slots && Array.isArray(res.slots) && res.slots.length > 0) {
            setAvailableSlots(res.slots);
            // Default select first open slot if available
            const firstAvailable = res.slots.find(s => s.isAvailable);
            if (firstAvailable) {
              setTime(firstAvailable.time);
            }
          } else {
            setAvailableSlots([]);
          }
        })
        .catch(() => {
          setAvailableSlots([]);
        })
        .finally(() => setLoadingSlots(false));
    }
  }, [isOpen, doctorId, date]);

  if (!isOpen) return null;

  const defaultTimeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', 
    '03:30 PM', '04:30 PM', '05:30 PM'
  ];

  const activeDoc = doctors.find(d => (d._id || d.id) === doctorId) || selectedDoctor || doctors[0];
  const activeDocId = activeDoc ? (activeDoc._id || activeDoc.id) : doctorId;
  const activeDocFee = activeDoc ? (activeDoc.consultationFee ?? activeDoc.fee ?? 500) : 500;
  const activeDocAvatar = activeDoc?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeDoc?.name || 'Doctor')}&background=0284c7&color=fff`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeDoc || !date || !time) return;

    setSubmitting(true);
    try {
      const slotTime = to24HourTime(time);
      const apt = await api.bookAppointment({
        patientId: user ? (user.id || user._id) : undefined,
        patientName: patientName || (user ? user.name : 'Patient'),
        patientPhone: patientPhone || (user ? user.phone : '+91 98765 43210'),
        doctorId: activeDocId,
        departmentId: activeDoc.departmentId,
        doctorName: activeDoc.name,
        department: typeof activeDoc.department === 'string' ? activeDoc.department : activeDoc.department?.name || 'General Medicine',
        date,
        slotTime,
        time,
        reason: reason || 'Routine Consultation',
        source: 'online',
        type: 'Online Booking'
      });

      showToast(`Appointment confirmed with ${activeDoc.name} on ${date} at ${time}!`);
      if (onBookingSuccess) onBookingSuccess(apt);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to book appointment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-sky-100">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Book Medical Appointment</h3>
              <p className="text-xs text-sky-100">Confirmed scheduling with hospital specialists</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Doctor selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Specialist Doctor
            </label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
              required
            >
              {doctors.map(doc => {
                const docVal = doc._id || doc.id;
                const docFee = doc.consultationFee ?? doc.fee ?? 500;
                return (
                  <option key={docVal} value={docVal}>
                    {doc.name} - {doc.department} (Fee: ₹{docFee})
                  </option>
                );
              })}
            </select>
          </div>

          {activeDoc && (
            <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-100 flex items-center gap-3">
              <img
                src={activeDocAvatar}
                alt={activeDoc?.name || 'Doctor'}
                className="w-12 h-12 rounded-lg object-cover border border-sky-200 bg-white"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeDoc?.name || 'Doctor')}&background=0284c7&color=fff`;
                }}
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 text-sm block">{activeDoc.name}</span>
                <span className="text-sky-700 font-medium">{activeDoc.department} • {activeDoc.room || 'OPD-102'}</span>
                <span className="text-slate-500 block">Consultation Fee: <strong className="text-slate-900">₹{activeDocFee}</strong></span>
              </div>
            </div>
          )}

          {/* Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Date</label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Time Slot {loadingSlots && <span className="text-[10px] text-sky-600 font-normal">(Checking slots...)</span>}
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                required
              >
                {availableSlots.length > 0 ? (
                  availableSlots.map(slot => (
                    <option key={slot.time} value={slot.time} disabled={!slot.isAvailable}>
                      {slot.time} {slot.isAvailable ? '• Available' : '• Booked'}
                    </option>
                  ))
                ) : (
                  defaultTimeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Visit / Symptoms</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe your symptoms or reason for consulting the doctor..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md shadow-sky-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Confirming...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
