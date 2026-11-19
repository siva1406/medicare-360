import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Trash2, Printer, CheckCircle, X, Activity, User, Calendar } from 'lucide-react';

export function DigitalPrescriptionModal({ isOpen, onClose, appointment, existingRx, onCreated }) {
  const { user, showToast } = useAuth();

  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '1 - 0 - 1', duration: '5 Days', instruction: 'After meals' }
  ]);
  const [doctorAdvice, setDoctorAdvice] = useState('Maintain proper hydration and rest.');
  const [followUpDate, setFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const rx = existingRx;

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '1 - 0 - 0', duration: '7 Days', instruction: 'After food' }]);
  };

  const handleRemoveMedicine = (idx) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleMedicineChange = (idx, field, val) => {
    const updated = [...medicines];
    updated[idx][field] = val;
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      showToast('Please enter a clinical diagnosis', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const newRx = await api.createPrescription({
        appointmentId: appointment?._id || appointment?.id || '',
        patientId: appointment?.patientId?._id || appointment?.patientId || 'u-patient-1',
        patientName: appointment?.patientId?.name || appointment?.patientName || 'Rajesh Kumar',
        doctorId: user?._id || user?.id || 'u-doc-1',
        doctorName: user?.name || 'Dr. Priya Sharma',
        diagnosis,
        medicines: medicines.filter(m => m.name.trim()),
        doctorAdvice,
        followUpDate
      });

      showToast('Digital prescription generated successfully!');
      if (onCreated) onCreated(newRx);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to generate prescription', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[94vh] sm:max-h-[92vh] flex flex-col pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        {/* Modal Top Controls (Hidden in print) */}
        <div className="no-print bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-5 h-5 text-teal-400 shrink-0" />
            <h3 className="font-bold text-xs sm:text-sm truncate">
              {rx ? `Prescription #${rx.id}` : 'Create Digital Prescription'}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Print / PDF</span>
            </button>
            <button 
              type="button"
              onClick={onClose} 
              aria-label="Close prescription modal"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Printable Prescription Body */}
        <div className="printable-area p-4 sm:p-8 overflow-y-auto space-y-5 flex-1">
          {/* Hospital Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-sky-600 pb-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white shrink-0">
                <Activity className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                  MediCare 360 Multispecialty Hospital
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">42 Healthcare Boulevard, Anna Nagar, Chennai - 600040</p>
                <p className="text-[10px] sm:text-[11px] text-teal-700 font-semibold">NABH Accredited • Tel: 1800-425-3600</p>
              </div>
            </div>
            <div className="sm:text-right text-xs shrink-0 flex sm:flex-col justify-between items-center sm:items-end">
              <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 font-bold border border-sky-200 text-[11px]">
                Rx #{rx ? rx.id : 'NEW-DRAFT'}
              </span>
              <p className="text-slate-500 mt-0.5 text-[11px]">Date: {rx ? rx.date : new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Doctor & Patient Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Consulting Physician</p>
              <p className="font-bold text-slate-900 text-sm">{rx ? rx.doctorName : (user?.name || appointment?.doctorName || 'Dr. Priya Sharma')}</p>
              <p className="text-slate-600">Department: {appointment?.department || 'Cardiology'}</p>
              <p className="text-slate-500 text-[11px]">Reg. No: TNMC-84291</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Patient Details</p>
              <p className="font-bold text-slate-900 text-sm">{rx ? rx.patientName : (appointment?.patientName || 'Rajesh Kumar')}</p>
              <p className="text-slate-600">Age / Gender: {appointment?.patientAge ? `${appointment.patientAge} Yrs / ${appointment.patientGender}` : '34 Yrs / Male'}</p>
              <p className="text-slate-500 text-[11px]">Phone: {appointment?.patientPhone || '+91 98765 43210'}</p>
            </div>
          </div>

          {/* If viewing existing prescription */}
          {rx ? (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Clinical Diagnosis</h4>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-slate-900 font-bold text-sm">
                  {rx.diagnosis}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Prescribed Medicines (Rx)</h4>
                <div className="table-scroll-wrapper rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-xs text-left min-w-[500px]">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Medicine Name</th>
                        <th className="p-2.5">Dosage</th>
                        <th className="p-2.5">Duration</th>
                        <th className="p-2.5">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rx.medicines?.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-400 font-medium">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">{m.name}</td>
                          <td className="p-2.5 text-sky-700 font-semibold">{m.dosage}</td>
                          <td className="p-2.5 text-slate-600">{m.duration}</td>
                          <td className="p-2.5 text-teal-800 font-medium">{m.instruction}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Doctor's Advice & Diet</h5>
                  <p className="text-xs text-slate-700 leading-relaxed">{rx.doctorAdvice}</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Follow-up Visit</h5>
                    <p className="text-xs font-bold text-teal-800">{rx.followUpDate || 'After 7 days'}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-200 mt-2 sm:text-right">
                    <p className="text-xs font-bold text-slate-900">{rx.doctorName}</p>
                    <p className="text-[10px] text-slate-400">Digitally Verified Signature</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Creating new prescription form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Diagnosis / Findings *</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Viral Bronchitis / Stage 1 Hypertension"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden font-medium"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Medicines & Dosages
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="no-print min-h-[36px] px-2.5 py-1 text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer rounded-lg hover:bg-sky-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {medicines.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-500">Medicine #{idx + 1}</span>
                        {medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(idx)}
                            aria-label={`Remove medicine ${idx + 1}`}
                            className="no-print min-h-[36px] min-w-[36px] flex items-center justify-center p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Medicine name & strength (e.g. Paracetamol 650mg)"
                        value={m.name}
                        onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                        required
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Dosage</label>
                          <input
                            type="text"
                            placeholder="e.g. 1-0-1"
                            value={m.dosage}
                            onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-sm focus:ring-1 focus:ring-sky-500 outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Duration</label>
                          <input
                            type="text"
                            placeholder="e.g. 5 Days"
                            value={m.duration}
                            onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-sm focus:ring-1 focus:ring-sky-500 outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Instructions</label>
                          <input
                            type="text"
                            placeholder="e.g. After meals"
                            value={m.instruction}
                            onChange={(e) => handleMedicineChange(idx, 'instruction', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-sm focus:ring-1 focus:ring-sky-500 outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Advice / Diet Restrictions</label>
                  <textarea
                    rows={2}
                    value={doctorAdvice}
                    onChange={(e) => setDoctorAdvice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Next Follow-Up Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden bg-white font-medium"
                  />
                </div>
              </div>

              <div className="no-print pt-3 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{submitting ? 'Generating...' : 'Save & Issue Digital Rx'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
