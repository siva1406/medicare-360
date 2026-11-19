import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { DigitalPrescriptionModal } from '../components/DigitalPrescriptionModal';
import { 
  Calendar, 
  Users, 
  FileText, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Printer, 
  Stethoscope, 
  Power, 
  Check, 
  X,
  Eye,
  Activity
} from 'lucide-react';

export function DoctorDashboard() {
  const { user, showToast } = useAuth();
  const [currentTab, setCurrentTab] = useState('schedule');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [activePrescriptionModal, setActivePrescriptionModal] = useState(false);
  const [activeAptForRx, setActiveAptForRx] = useState(null);
  const [selectedRxToView, setSelectedRxToView] = useState(null);
  const [patientDetailModal, setPatientDetailModal] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const doctorId = user?._id || user?.id || 'u-doc-1';
      const [apts, rxs] = await Promise.all([
        api.getAppointments({ doctorId }),
        api.getPrescriptions({ doctorId })
      ]);
      setAppointments(Array.isArray(apts) ? apts : (apts?.appointments || []));
      setPrescriptions(Array.isArray(rxs) ? rxs : (rxs?.prescriptions || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updateAppointmentStatus(id, newStatus);
      showToast(`Appointment marked as ${newStatus}`);
      loadData();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleToggleAvailability = () => {
    const nextState = !isAvailable;
    setIsAvailable(nextState);
    showToast(`OPD Availability status updated to: ${nextState ? 'ONLINE / ACCEPTING PATIENTS' : 'OFFLINE / IN SURGERY'}`);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-65px)] bg-slate-50 w-full overflow-x-hidden">
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} role="doctor" />

      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl w-full pb-28 md:pb-8">
        {/* Doctor Top Hero Card */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-sky-900 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col xs:flex-row items-center xs:items-start text-center xs:text-left gap-4">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"}
              alt="Doctor"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-400 shrink-0"
            />
            <div>
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Clinician Workspace</span>
              <h1 className="text-xl sm:text-2xl font-black">{user?.name || 'Dr. Priya Sharma'}</h1>
              <p className="text-xs text-slate-300">
                Department of {user?.department || 'Cardiology'} • Suite 302 • OPD 09:00 AM - 02:00 PM
              </p>
            </div>
          </div>

          {/* Availability Toggle */}
          <button
            onClick={handleToggleAvailability}
            className={`w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[44px] ${
              isAvailable
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isAvailable ? 'Status: Accepting Patients' : 'Status: Busy / In Surgery'}</span>
          </button>
        </div>

        {/* Tab 1: Consultations / Schedule */}
        {currentTab === 'schedule' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Today's Appointment Schedule</h3>
                <p className="text-xs text-slate-500">Review pending requests, patient vitals, and issue digital prescriptions</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-sky-100 text-sky-800 rounded-full">
                {appointments.length} Total Patients
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400">Loading consultations...</div>
            ) : appointments.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-sm">No Appointments for Today</h4>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-soft transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {apt.patientName.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{apt.patientName}</h4>
                          <span className="text-xs text-slate-500">• {apt.patientAge ? `${apt.patientAge} Yrs / ${apt.patientGender}` : '34 Yrs'}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {apt.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">Symptoms:</strong> {apt.reason}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-semibold text-sky-700">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{apt.time} ({apt.date})</span>
                          </span>
                          <button
                            onClick={() => setPatientDetailModal(apt)}
                            className="text-xs text-teal-700 hover:text-teal-800 font-bold underline cursor-pointer"
                          >
                            View Medical File
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {apt.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'Approved')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'Rejected')}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {apt.status === 'Approved' && (
                        <button
                          onClick={() => {
                            setActiveAptForRx(apt);
                            setActivePrescriptionModal(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Generate Digital Rx</span>
                        </button>
                      )}

                      {apt.status === 'Completed' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}

                      {apt.status === 'Cancelled' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Patient History */}
        {currentTab === 'patients' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Patient Electronic Health Records</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{apt.patientName}</h4>
                      <p className="text-xs text-slate-500">Phone: {apt.patientPhone}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700">
                      ID: {apt.patientId}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p><strong className="text-slate-800">Primary Complaint:</strong> {apt.reason}</p>
                    <p><strong className="text-slate-800">Consultation Date:</strong> {apt.date} at {apt.time}</p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setPatientDetailModal(apt)}
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Open Full Patient History
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Prescriptions Issued */}
        {currentTab === 'prescriptions' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Digital Prescriptions Issued by You</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-sky-700">Rx #{rx.id}</span>
                      <span className="text-xs text-slate-400">{rx.date}</span>
                    </div>
                    <div className="pt-2 space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">Patient: {rx.patientName}</h4>
                      <p className="text-xs text-slate-600 font-medium">Diagnosis: {rx.diagnosis}</p>
                      <p className="text-xs text-slate-500">Medicines: {rx.medicines?.length || 0} items prescribed</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setSelectedRxToView(rx)}
                      className="px-3.5 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View / Reprint Rx</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Availability */}
        {currentTab === 'availability' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft space-y-6">
            <h3 className="text-lg font-bold text-slate-900">OPD Consultation & Shift Availability</h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Online OPD Reception</h4>
                <p className="text-xs text-slate-500">Toggle whether reception can book immediate walk-in / online appointments today</p>
              </div>
              <button
                onClick={handleToggleAvailability}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isAvailable ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                }`}
              >
                {isAvailable ? 'Available Now' : 'Currently Offline'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Scheduled OPD Hours</span>
                <p className="text-slate-500">Monday - Friday: 09:00 AM - 02:00 PM</p>
                <p className="text-slate-500">Saturday: 09:00 AM - 01:00 PM (Emergency On-Call)</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Consultation Chamber</span>
                <p className="text-slate-500">Cardiology Wing, 3rd Floor, Suite 302</p>
                <p className="text-slate-500">Direct Extension: 3021</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Daily Stats */}
        {currentTab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Today's Patients</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">{appointments.length}</span>
              <span className="text-[11px] text-emerald-600 font-semibold">100% On-time OPD</span>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Prescriptions Issued</span>
              <span className="text-3xl font-black text-teal-600 mt-1 block">{prescriptions.length}</span>
              <span className="text-[11px] text-slate-500">Digitally verified</span>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Consultation Fee</span>
              <span className="text-3xl font-black text-sky-700 mt-1 block">₹800</span>
              <span className="text-[11px] text-slate-500">Hospital standard rate</span>
            </div>
          </div>
        )}

        {/* Digital Prescription Generation Modal */}
        {activePrescriptionModal && (
          <DigitalPrescriptionModal
            isOpen={activePrescriptionModal}
            onClose={() => {
              setActivePrescriptionModal(false);
              setActiveAptForRx(null);
            }}
            appointment={activeAptForRx}
            onCreated={() => loadData()}
          />
        )}

        {/* View Prescription Modal */}
        {selectedRxToView && (
          <DigitalPrescriptionModal
            isOpen={!!selectedRxToView}
            onClose={() => setSelectedRxToView(null)}
            existingRx={selectedRxToView}
          />
        )}

        {/* Patient Details Modal */}
        {patientDetailModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900">Patient Clinical File</h3>
                <button onClick={() => setPatientDetailModal(null)} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer min-tap">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <p><strong className="text-slate-800">Patient Name:</strong> {patientDetailModal.patientName}</p>
                <p><strong className="text-slate-800">Contact Phone:</strong> {patientDetailModal.patientPhone}</p>
                <p><strong className="text-slate-800">Appointment ID:</strong> {patientDetailModal.id}</p>
                <p><strong className="text-slate-800">Chief Symptoms:</strong> {patientDetailModal.reason}</p>
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 mt-2">
                  <p className="font-semibold text-sky-900">Vitals & Triage (Reception Note):</p>
                  <p className="text-sky-800 mt-1">BP: 124/82 mmHg • Pulse: 78 bpm • SpO2: 98% • Temp: 98.4°F</p>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setPatientDetailModal(null)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer min-h-[44px]"
                >
                  Close File
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
