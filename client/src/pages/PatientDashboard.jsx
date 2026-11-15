import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { DigitalPrescriptionModal } from '../components/DigitalPrescriptionModal';
import { 
  Calendar, 
  FileText, 
  FolderPlus, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  UploadCloud, 
  Plus, 
  Printer, 
  Eye, 
  Trash2,
  Stethoscope,
  Heart,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export function PatientDashboard({ onOpenBookingModal }) {
  const { user, showToast } = useAuth();
  const [currentTab, setCurrentTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedRx, setSelectedRx] = useState(null);
  const [loading, setLoading] = useState(true);

  // Upload report modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDept, setReportDept] = useState('Biochemistry Lab');
  const [reportNotes, setReportNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const patientId = user?._id || user?.id || 'u-patient-1';
      const [apts, rxs, reps] = await Promise.all([
        api.getAppointments({ patientId }),
        api.getPrescriptions({ patientId }),
        api.getReports({ patientId })
      ]);
      setAppointments(Array.isArray(apts) ? apts : (apts?.appointments || []));
      setPrescriptions(Array.isArray(rxs) ? rxs : (rxs?.prescriptions || []));
      setReports(Array.isArray(reps) ? reps : (reps?.reports || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCancelAppointment = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.cancelAppointment(id, 'Cancelled by patient');
      showToast('Appointment cancelled successfully.', 'info');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to cancel appointment', 'error');
    }
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!reportTitle.trim()) return;

    try {
      await api.uploadReport({
        patientId: user?.id || 'u-patient-1',
        patientName: user?.name || 'Rajesh Kumar',
        title: reportTitle,
        department: reportDept,
        summary: reportNotes || 'Report uploaded by patient for physician review.',
        fileType: 'PDF'
      });
      showToast('Medical report uploaded successfully!');
      setUploadModalOpen(false);
      setReportTitle('');
      setReportNotes('');
      loadData();
    } catch (err) {
      showToast('Failed to upload report', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-65px)] bg-slate-50">
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} role="patient" />

      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-6xl">
        {/* Welcome Top Banner */}
        <div className="p-6 bg-gradient-to-r from-sky-600 to-teal-600 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200">Patient Dashboard</span>
            <h1 className="text-2xl font-black mt-1">Hello, {user?.name || 'Rajesh Kumar'}!</h1>
            <p className="text-xs text-sky-100 mt-0.5">Manage your clinical consultations, digital prescriptions, and lab tests.</p>
          </div>
          <button
            onClick={() => onOpenBookingModal()}
            className="px-4 py-2.5 rounded-xl bg-white text-sky-700 font-bold text-xs shadow-md hover:bg-sky-50 transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-sky-600" />
            <span>Book New Appointment</span>
          </button>
        </div>

        {/* Tab 1: Appointments */}
        {currentTab === 'appointments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Your Appointment History</h3>
              <span className="text-xs text-slate-500">{appointments.length} Appointments Found</span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400">Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">No Appointments Scheduled</h4>
                <p className="text-xs text-slate-500">Book your first consultation with our board-certified specialists.</p>
                <button
                  onClick={() => onOpenBookingModal()}
                  className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Book Appointment Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {appointments.map((apt) => (
                  <div key={apt.id} className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-soft transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">{apt.doctorName}</h4>
                          <span className="text-xs font-medium text-slate-400">• {apt.department}</span>
                        </div>
                        <p className="text-xs text-slate-600"><strong className="text-slate-800">Reason:</strong> {apt.reason}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-sky-600" />
                            <span>{apt.date}</span>
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-teal-600" />
                            <span>{apt.time}</span>
                          </span>
                          <span className="text-slate-400">Fee: ₹{apt.fee}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {getStatusBadge(apt.status)}
                      {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer hover:underline"
                        >
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Digital Prescriptions */}
        {currentTab === 'prescriptions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Your Digital Prescriptions</h3>
              <span className="text-xs text-slate-500">{prescriptions.length} Prescriptions Available</span>
            </div>

            {prescriptions.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">No Prescriptions Issued Yet</h4>
                <p className="text-xs text-slate-500">Your doctor will issue digital prescriptions after your consultation.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-soft transition space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">Rx #{rx.id}</span>
                          <h4 className="text-sm font-bold text-slate-900">{rx.doctorName}</h4>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">{rx.date}</span>
                      </div>

                      <div className="pt-3 space-y-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Diagnosis</span>
                          <p className="text-xs font-semibold text-slate-800">{rx.diagnosis}</p>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Prescribed Medicines</span>
                          <ul className="text-xs text-slate-600 mt-1 space-y-1">
                            {rx.medicines?.map((m, i) => (
                              <li key={i} className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                <span className="font-bold text-slate-800">{m.name}</span>
                                <span className="text-sky-700 text-[11px] font-semibold">{m.dosage}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-teal-700 font-semibold">Follow-up: {rx.followUpDate}</span>
                      <button
                        onClick={() => setSelectedRx(rx)}
                        className="px-3.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View / Print Rx</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Medical Reports */}
        {currentTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Medical Reports & Diagnostics</h3>
                <p className="text-xs text-slate-500">Secure electronic health records and lab results</p>
              </div>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Medical Report</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reports.map((rep) => (
                <div key={rep.id} className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-card transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                        <FolderPlus className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {rep.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">{rep.title}</h4>
                    <p className="text-xs text-slate-500 mb-2">{rep.department} • {rep.date}</p>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed mb-4">
                      {rep.summary}
                    </p>
                  </div>

                  <a
                    href={rep.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-xl text-xs font-bold text-center block transition"
                  >
                    View Document (PDF)
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Profile */}
        {currentTab === 'profile' && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-soft space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                alt={user?.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-300"
              />
              <div>
                <h3 className="text-xl font-bold text-slate-900">{user?.name || 'Rajesh Kumar'}</h3>
                <span className="text-xs text-sky-700 font-semibold bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                  Registered Patient
                </span>
                <p className="text-xs text-slate-400 mt-1">Patient ID: {user?.id || 'u-patient-1'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Blood Group</span>
                <span className="text-lg font-black text-rose-600">{user?.bloodGroup || 'B+'}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Age & Gender</span>
                <span className="text-base font-bold text-slate-800">{user?.age || '34'} Years • {user?.gender || 'Male'}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Contact Phone</span>
                <span className="text-base font-bold text-slate-800">{user?.phone || '+91 98765 43210'}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Emergency Contact</span>
                <span className="text-sm font-bold text-slate-800">{user?.emergencyContact || '+91 98765 00000 (Spouse)'}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-3">
                <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Address</span>
                <span className="text-sm font-semibold text-slate-700">{user?.address || '42, Anna Nagar West, Chennai, Tamil Nadu'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Upload Report Modal */}
        {uploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Upload Medical Document / Lab Report</h3>
              <form onSubmit={handleUploadReport} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Report Title *</label>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="e.g. Thyroid Profile Test / Chest X-Ray"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department / Lab</label>
                  <select
                    value={reportDept}
                    onChange={(e) => setReportDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500 outline-hidden"
                  >
                    <option value="Biochemistry Lab">Biochemistry Lab</option>
                    <option value="Hematology Lab">Hematology Lab</option>
                    <option value="Cardiology Diagnostics">Cardiology Diagnostics</option>
                    <option value="Radiology & Imaging">Radiology & Imaging</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Key Findings / Summary</label>
                  <textarea
                    rows={3}
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="e.g. TSH: 2.4 uIU/mL (Normal), Free T4: 1.2 ng/dL..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 outline-hidden"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Upload Document
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Existing Prescription Modal View */}
        {selectedRx && (
          <DigitalPrescriptionModal
            isOpen={!!selectedRx}
            onClose={() => setSelectedRx(null)}
            existingRx={selectedRx}
          />
        )}
      </main>
    </div>
  );
}
