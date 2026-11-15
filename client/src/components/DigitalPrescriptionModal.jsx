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
        doctorName: user?.name || 'Dr. Specialist',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Top Controls (Hidden in print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-sm">
              {rx ? `Digital Prescription #${rx.id}` : 'Create Digital Prescription'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Prescription Body */}
        <div className="printable-area p-8 overflow-y-auto space-y-6">
          {/* Hospital Header */}
          <div className="flex items-start justify-between border-b-2 border-sky-600 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">MediCare 360 Multispecialty Hospital</h2>
                <p className="text-xs text-slate-500 font-medium">42 Healthcare Boulevard, Anna Nagar West, Chennai - 600040</p>
                <p className="text-[11px] text-teal-700 font-semibold">NABH Accredited • Tel: 1800-425-3600 • care@medicare360.com</p>
              </div>
            </div>
            <div className="text-right text-xs">
              <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 font-bold border border-sky-200">
                Rx #{rx ? rx.id : 'NEW-DRAFT'}
              </span>
              <p className="text-slate-500 mt-1">Date: {rx ? rx.date : new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Doctor & Patient Metadata Row */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Consulting Physician</p>
              <p className="font-bold text-slate-900 text-sm">{rx ? rx.doctorName : (user?.name || appointment?.doctorName || 'Dr. Priya Sharma')}</p>
              <p className="text-slate-600">Department: {appointment?.department || 'Cardiology'}</p>
              <p className="text-slate-500">Reg. No: TNMC-84291</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Patient Details</p>
              <p className="font-bold text-slate-900 text-sm">{rx ? rx.patientName : (appointment?.patientName || 'Rajesh Kumar')}</p>
              <p className="text-slate-600">Age / Gender: {appointment?.patientAge ? `${appointment.patientAge} Yrs / ${appointment.patientGender}` : '34 Yrs / Male'}</p>
              <p className="text-slate-500">Phone: {appointment?.patientPhone || '+91 98765 43210'}</p>
            </div>
          </div>

          {/* If viewing existing prescription */}
          {rx ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Clinical Diagnosis</h4>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-slate-900 font-semibold text-sm">
                  {rx.diagnosis}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Prescribed Medicines (Rx)</h4>
                <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Doctor's Advice & Diet</h5>
                  <p className="text-xs text-slate-700 leading-relaxed">{rx.doctorAdvice}</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Follow-up Visit</h5>
                    <p className="text-xs font-bold text-teal-800">{rx.followUpDate || 'After 7 days'}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 mt-2 text-right">
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
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
                    className="no-print text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {medicines.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50">
                      <input
                        type="text"
                        placeholder="Medicine name & strength (e.g. Paracetamol 650mg)"
                        value={m.name}
                        onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:ring-1 focus:ring-sky-500 outline-hidden"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 1-0-1)"
                        value={m.dosage}
                        onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                        className="w-24 px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-center focus:ring-1 focus:ring-sky-500 outline-hidden"
                      />
                      <input
                        type="text"
                        placeholder="Duration"
                        value={m.duration}
                        onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                        className="w-24 px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-center focus:ring-1 focus:ring-sky-500 outline-hidden"
                      />
                      <input
                        type="text"
                        placeholder="Timing (e.g. After meals)"
                        value={m.instruction}
                        onChange={(e) => handleMedicineChange(idx, 'instruction', e.target.value)}
                        className="w-32 px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:ring-1 focus:ring-sky-500 outline-hidden"
                      />
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="no-print p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Advice / Diet Restrictions</label>
                  <textarea
                    rows={2}
                    value={doctorAdvice}
                    onChange={(e) => setDoctorAdvice(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Next Follow-Up Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="no-print pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-md shadow-teal-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{submitting ? 'Generating...' : 'Save & Issue Digital Prescription'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
