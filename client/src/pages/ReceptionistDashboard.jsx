import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { BillingModal } from '../components/BillingModal';
import { 
  Calendar, 
  Clock, 
  Users, 
  Receipt, 
  Search, 
  Plus, 
  Printer, 
  CheckCircle2, 
  Phone, 
  User, 
  CreditCard,
  UserPlus
} from 'lucide-react';

export function ReceptionistDashboard() {
  const { user, showToast } = useAuth();
  const [currentTab, setCurrentTab] = useState('walkin');
  const [appointments, setAppointments] = useState([]);
  const [billings, setBillings] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Walk-in booking state
  const [walkinPatientName, setWalkinPatientName] = useState('');
  const [walkinPatientPhone, setWalkinPatientPhone] = useState('');
  const [walkinDoctorId, setWalkinDoctorId] = useState('');
  const [walkinReason, setWalkinReason] = useState('OPD Consultation');
  const [walkinSubmitting, setWalkinSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apts, bills, docs] = await Promise.all([
        api.getAppointments(),
        api.getBillings(),
        api.getDoctors({ availableOnly: 'true' })
      ]);
      const aptList = Array.isArray(apts) ? apts : (apts?.appointments || []);
      const billList = Array.isArray(bills) ? bills : (bills?.bills || []);
      const docList = Array.isArray(docs) ? docs : (docs?.doctors || []);
      setAppointments(aptList);
      setBillings(billList);
      setDoctors(docList);
      if (docList.length > 0 && !walkinDoctorId) {
        setWalkinDoctorId(docList[0]._id || docList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWalkinBooking = async (e) => {
    e.preventDefault();
    if (!walkinPatientName.trim() || !walkinPatientPhone.trim()) {
      showToast('Please provide patient name and phone number', 'error');
      return;
    }

    const doc = doctors.find(d => (d._id || d.id) === walkinDoctorId) || doctors[0];
    setWalkinSubmitting(true);
    try {
      const now = new Date();
      const currentSlot = `${String(now.getHours()).padStart(2, '0')}:${now.getMinutes() < 30 ? '00' : '30'}`;
      const today = now.toISOString().split('T')[0];

      const newApt = await api.bookAppointment({
        patientName: walkinPatientName,
        patientPhone: walkinPatientPhone,
        doctorId: doc?._id || doc?.id,
        doctorName: doc?.name || 'Dr. Specialist',
        department: doc?.department || 'General Medicine',
        date: today,
        slotTime: currentSlot,
        time: currentSlot,
        source: 'walk-in',
        type: 'Walk-in',
        reason: walkinReason
      });

      // Also automatically generate an invoice for the walk-in
      try {
        await api.createBilling({
          patientName: walkinPatientName,
          phone: walkinPatientPhone,
          patientId: newApt?.appointment?.patientId?._id || newApt?.appointment?.patientId,
          appointmentId: newApt?.appointment?._id || newApt?.appointment?.id,
          items: [
            { description: `OPD Consultation - ${doc?.name} (${doc?.department})`, amount: doc?.consultationFee || doc?.fee || 500 },
            { description: 'Hospital Registration & OPD Card Charge', amount: 50 }
          ],
          totalAmount: (doc?.consultationFee || doc?.fee || 500) + 50,
          paymentStatus: 'paid',
          paymentMode: 'cash'
        });
      } catch (billErr) {
        console.warn('Walk-in auto-billing creation:', billErr.message);
      }

      showToast(`Walk-in Token issued for ${walkinPatientName} with ${doc?.name}! Receipt created.`);
      setWalkinPatientName('');
      setWalkinPatientPhone('');
      loadData();
      setCurrentTab('queue');
    } catch (err) {
      showToast(err.message || 'Failed to schedule walk-in appointment', 'error');
    } finally {
      setWalkinSubmitting(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await api.payBilling(id, 'Cash at Counter');
      showToast(`Invoice #${id} settled! Payment marked as Paid.`);
      loadData();
    } catch (err) {
      showToast('Failed to update invoice', 'error');
    }
  };

  const filteredPatients = appointments.filter(a => 
    a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.patientPhone.includes(searchQuery)
  );

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-65px)] bg-slate-50 w-full overflow-x-hidden">
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} role="receptionist" />

      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl w-full pb-28 md:pb-8">
        {/* Top Reception Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200">Front Desk & Triage Console</span>
            <h1 className="text-xl sm:text-2xl font-black mt-0.5">Receptionist Workspace</h1>
            <p className="text-xs text-amber-100 mt-0.5">Desk Officer: {user?.name || 'Anitha Desk Officer'} • Counter 1</p>
          </div>
          <button
            onClick={() => setBillingModalOpen(true)}
            className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl bg-white text-amber-800 font-bold text-xs shadow-md hover:bg-amber-50 transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 min-h-[44px]"
          >
            <Receipt className="w-4 h-4 text-amber-700" />
            <span>Generate New Bill</span>
          </button>
        </div>

        {/* Tab 1: Walk-in Booking & Registration */}
        {currentTab === 'walkin' && (
          <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-soft space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Immediate Walk-in Patient Registration</h3>
              <p className="text-xs text-slate-500">Fast token generation for walk-in arrivals with automated counter billing</p>
            </div>

            <form onSubmit={handleWalkinBooking} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={walkinPatientName}
                      onChange={(e) => setWalkinPatientName(e.target.value)}
                      placeholder="e.g. Meena Kumari"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-amber-500 outline-hidden min-h-[44px]"
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
                      value={walkinPatientPhone}
                      onChange={(e) => setWalkinPatientPhone(e.target.value)}
                      placeholder="+91 94440 12345"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-amber-500 outline-hidden min-h-[44px]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign Available Specialist *</label>
                  <select
                    value={walkinDoctorId}
                    onChange={(e) => setWalkinDoctorId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-hidden min-h-[44px]"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.department}) • Fee: ₹{d.fee} • {d.room}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Symptoms / Chief Complaint</label>
                  <input
                    type="text"
                    value={walkinReason}
                    onChange={(e) => setWalkinReason(e.target.value)}
                    placeholder="e.g. Acute stomach ache & vomiting"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-amber-500 outline-hidden min-h-[44px]"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-xs text-amber-900">
                  <span className="font-bold block">Automated OPD Token + Counter Bill</span>
                  <span>Will create immediate appointment in the live queue & issue a cash receipt.</span>
                </div>
                <button
                  type="submit"
                  disabled={walkinSubmitting}
                  className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-md transition cursor-pointer disabled:opacity-50 min-h-[44px] shrink-0"
                >
                  {walkinSubmitting ? 'Registering...' : 'Issue OPD Token & Receipt'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Live OPD Queue */}
        {currentTab === 'queue' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Live OPD Consultation Queue</h3>
                <p className="text-xs text-slate-500">Real-time status of patients currently in the hospital</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full">
                {appointments.length} Patients Today
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft">
              <div className="table-scroll-wrapper">
                <table className="min-w-[680px] w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Token / Patient</th>
                      <th className="p-3.5">Phone</th>
                      <th className="p-3.5">Consulting Doctor</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Time Slot</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((apt, idx) => (
                      <tr key={apt.id} className="hover:bg-slate-50">
                        <td className="p-3.5 flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-900">{apt.patientName}</span>
                        </td>
                        <td className="p-3.5 text-slate-600">{apt.patientPhone}</td>
                        <td className="p-3.5 font-bold text-sky-700">{apt.doctorName}</td>
                        <td className="p-3.5 text-slate-600">{apt.department}</td>
                        <td className="p-3.5 font-semibold text-slate-800">{apt.time}</td>
                        <td className="p-3.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {apt.type}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            apt.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            apt.status === 'Completed' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Patient Search */}
        {currentTab === 'search' && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-soft flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient by name or phone number..."
                className="w-full text-sm outline-hidden"
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft">
              <div className="table-scroll-wrapper">
                <table className="min-w-[600px] w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Patient Name</th>
                      <th className="p-3.5">Contact Phone</th>
                      <th className="p-3.5">Last Doctor Visited</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Chief Complaint</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPatients.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-900">{apt.patientName}</td>
                        <td className="p-3.5 text-slate-600">{apt.patientPhone}</td>
                        <td className="p-3.5 text-sky-700 font-semibold">{apt.doctorName}</td>
                        <td className="p-3.5 text-slate-600">{apt.date}</td>
                        <td className="p-3.5 text-slate-500">{apt.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Billing Management */}
        {currentTab === 'billing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Hospital Billing & Invoices</h3>
                <p className="text-xs text-slate-500">Manage patient invoices, payment modes, and printable receipts</p>
              </div>
              <button
                onClick={() => setBillingModalOpen(true)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Bill</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft">
              <div className="table-scroll-wrapper">
                <table className="min-w-[650px] w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Invoice #</th>
                      <th className="p-3.5">Patient Name</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Payment Mode</th>
                      <th className="p-3.5">Amount (₹)</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {billings.map((bill) => (
                      <tr key={bill.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-900">#{bill.id}</td>
                        <td className="p-3.5 font-semibold text-slate-800">{bill.patientName}</td>
                        <td className="p-3.5 text-slate-500">{bill.date}</td>
                        <td className="p-3.5 text-slate-600">{bill.mode}</td>
                        <td className="p-3.5 font-bold text-slate-900">₹{bill.total.toLocaleString('en-IN')}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            bill.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {bill.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          {bill.status === 'Pending' && (
                            <button
                              onClick={() => handleMarkPaid(bill.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer min-tap"
                            >
                              Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedInvoice(bill)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer inline-flex items-center gap-1 min-tap"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* View / Print Invoice Modal */}
        {selectedInvoice && (
          <BillingModal
            isOpen={!!selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            invoice={selectedInvoice}
          />
        )}

        {/* Create Invoice Modal */}
        {billingModalOpen && (
          <BillingModal
            isOpen={billingModalOpen}
            onClose={() => setBillingModalOpen(false)}
            onCreated={() => loadData()}
          />
        )}
      </main>
    </div>
  );
}
