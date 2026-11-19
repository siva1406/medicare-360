import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { INITIAL_DOCTORS } from '../data/doctorsData';
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
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 px-5 py-4 sm:p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-sky-100 shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Book Medical Appointment</h3>
              <p className="text-[11px] sm:text-xs text-sky-100">Confirmed scheduling with hospital specialists</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            aria-label="Close booking modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Doctor selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Specialist Doctor *
            </label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-sky-500 outline-hidden font-medium"
              required
            >
              {doctors.map((doc, idx) => {
                const docId = doc._id || doc.id || `doc-${idx}`;
                const dept = typeof doc.department === 'string' ? doc.department : doc.department?.name || 'General';
                const fee = doc.consultationFee ?? doc.fee ?? 500;
                return (
                  <option key={docId} value={docId}>
                    {doc.name} ({dept}) • Fee: ₹{fee}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Active Doctor preview card */}
          {activeDoc && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-sky-50/70 border border-sky-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={activeDocAvatar}
                  alt={activeDoc.name}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-sky-200 shrink-0 bg-white"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeDoc.name || 'Doctor')}&background=0284c7&color=fff`;
                  }}
                />
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{activeDoc.name}</h4>
                  <p className="text-[11px] text-sky-700 truncate">{typeof activeDoc.department === 'string' ? activeDoc.department : activeDoc.department?.name}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">OPD Fee</span>
                <span className="text-sm font-extrabold text-slate-900">₹{activeDocFee}</span>
              </div>
            </div>
          )}

          {/* Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Date *</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden bg-white font-medium"
              required
            />
          </div>

          {/* Time Slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Consultation Slot *
              </label>
              {loadingSlots && <span className="text-[11px] text-sky-600 animate-pulse">Checking live availability...</span>}
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
              {(availableSlots.length > 0 ? availableSlots : defaultTimeSlots.map(t => ({ time: t, isAvailable: true }))).map((slotObj, idx) => {
                const slotText = typeof slotObj === 'string' ? slotObj : slotObj.time;
                const isAvail = typeof slotObj === 'string' ? true : slotObj.isAvailable;
                const isSelected = time === slotText;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!isAvail}
                    onClick={() => setTime(slotText)}
                    className={`min-h-[44px] px-2.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center text-center cursor-pointer ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-600'
                        : isAvail
                          ? 'border border-slate-200 bg-white hover:border-sky-300 text-slate-700'
                          : 'bg-slate-100 text-slate-400 border border-slate-100 cursor-not-allowed line-through opacity-60'
                    }`}
                  >
                    {slotText}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chief Complaint / Symptoms */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reason for Visit / Symptoms
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Follow-up consultation for blood pressure check, persistent headache"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[48px] py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{submitting ? 'Confirming Appointment...' : `Confirm & Book Appointment (₹${activeDocFee})`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
