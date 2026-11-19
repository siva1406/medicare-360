import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { MonthlyAppointmentsChart, DepartmentDistributionChart } from '../components/Charts';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Building2, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';

export function AdminDashboard() {
  const { user, showToast } = useAuth();
  const [currentTab, setCurrentTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add doctor modal state
  const [addDoctorOpen, setAddDoctorOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    department: 'Cardiology',
    qualification: 'MBBS, MD',
    experience: '8 Years',
    fee: 700,
    room: 'OPD Suite 204',
    email: '',
    phone: '+91 98400 11223'
  });

  // Add department modal state
  const [addDeptOpen, setAddDeptOpen] = useState(false);
  const [newDept, setNewDept] = useState({
    name: '',
    head: '',
    description: '',
    doctorsCount: 1
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminStats, docs, depts] = await Promise.all([
        api.getAdminStats(),
        api.getDoctors(),
        api.getDepartments()
      ]);
      setStats(adminStats);
      setDoctors(Array.isArray(docs) ? docs : (docs?.doctors || []));
      setDepartments(Array.isArray(depts) ? depts : (depts?.departments || []));
      setPatients(adminStats?.recentPatients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!newDoctor.name.trim()) return;

    try {
      await api.createDoctor(newDoctor);
      showToast(`Doctor ${newDoctor.name} added successfully!`);
      setAddDoctorOpen(false);
      setNewDoctor({
        name: '',
        department: 'Cardiology',
        qualification: 'MBBS, MD',
        experience: '8 Years',
        fee: 700,
        room: 'OPD Suite 204',
        email: '',
        phone: '+91 98400 11223'
      });
      loadData();
    } catch (err) {
      showToast('Failed to add doctor', 'error');
    }
  };

  const handleDeleteDoctor = async (id, name) => {
    if (!confirm(`Are you sure you want to remove ${name} from the medical roster?`)) return;
    try {
      await api.deleteDoctor(id);
      showToast(`Doctor ${name} removed from roster.`);
      loadData();
    } catch (err) {
      showToast('Failed to delete doctor', 'error');
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDept.name.trim()) return;

    try {
      await api.createDepartment(newDept);
      showToast(`Department ${newDept.name} created!`);
      setAddDeptOpen(false);
      setNewDept({ name: '', head: '', description: '', doctorsCount: 1 });
      loadData();
    } catch (err) {
      showToast('Failed to add department', 'error');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-65px)] bg-slate-50 w-full overflow-x-hidden">
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl w-full pb-28 md:pb-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Hospital Executive Console
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Admin Dashboard</h1>
            <p className="text-xs text-slate-500">Live hospital operations, capacity metrics, and departmental statistics</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAddDoctorOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer min-h-[44px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Doctor</span>
            </button>
            <button
              onClick={() => setAddDeptOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer min-h-[44px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Department</span>
            </button>
          </div>
        </div>

        {/* 4 Primary KPI Cards (As required by spec) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-soft">
            <div className="flex items-center justify-between text-sky-600 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Patients</span>
              <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              {(stats?.totalPatients || 1250).toLocaleString('en-IN')}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>+14% this month</span>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-soft">
            <div className="flex items-center justify-between text-teal-600 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Doctors</span>
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats?.totalDoctors || 45}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-teal-700 font-semibold mt-1">
              <span>Across 8 Super Specialties</span>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-soft">
            <div className="flex items-center justify-between text-indigo-600 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Appointments</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              {(stats?.totalAppointments || 320).toLocaleString('en-IN')}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>96.4% Completion Rate</span>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-soft">
            <div className="flex items-center justify-between text-purple-600 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{(stats?.totalRevenue || 450000).toLocaleString('en-IN')}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>+18.5% YoY</span>
            </div>
          </div>
        </div>

        {/* Tab 1: Overview & Charts */}
        {currentTab === 'overview' && (
          <div className="space-y-6">
            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Appointment Trend Chart */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-soft space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Appointment Analytics & Revenue Trends</h3>
                    <p className="text-xs text-slate-500">Monthly consultation volume & hospital inflow</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg">
                    2026 YTD
                  </span>
                </div>
                <MonthlyAppointmentsChart data={stats?.monthlyAppointments} />
              </div>

              {/* Department Distribution */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-soft space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Department-wise Patient Load</h3>
                  <p className="text-xs text-slate-500">Patient distribution across specialties</p>
                </div>
                <DepartmentDistributionChart data={stats?.departmentStats} />
              </div>
            </div>

            {/* Recent Registrations & Appointments Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Patient Registrations */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Recent Patient Registrations</h3>
                <div className="divide-y divide-slate-100 text-xs">
                  {stats?.recentPatients?.map((p) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{p.name}</span>
                          <span className="text-slate-500">{p.phone} • {p.bloodGroup || 'B+'}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">ID: {p.id}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Appointments */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Recent Scheduled Consultations</h3>
                <div className="divide-y divide-slate-100 text-xs">
                  {stats?.recentAppointments?.map((apt) => (
                    <div key={apt.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">{apt.patientName}</span>
                        <span className="text-slate-500">with {apt.doctorName} ({apt.department})</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-700 block">{apt.date} • {apt.time}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Doctor Management */}
        {currentTab === 'doctors' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Medical Doctor Directory ({doctors.length})</h3>
              <button
                onClick={() => setAddDoctorOpen(true)}
                className="px-3.5 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Doctor</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft">
              <div className="table-scroll-wrapper">
                <table className="min-w-[650px] w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Doctor</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Experience</th>
                      <th className="p-3.5">OPD Fee</th>
                      <th className="p-3.5">Chamber</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {doctors.map((doc, idx) => {
                      const docId = doc._id || doc.id || `doc-${idx}`;
                      const docName = doc.name || 'Specialist Doctor';
                      const avatarUrl = doc.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(docName)}&background=0284c7&color=fff`;
                      const deptDisplay = typeof doc.department === 'string' ? doc.department : doc.department?.name || 'General Medicine';
                      const docExp = doc.experience || (doc.experienceYears ? `${doc.experienceYears} Years` : '5+ Years');
                      const docFee = doc.consultationFee ?? doc.fee ?? 500;

                      return (
                        <tr key={docId} className="hover:bg-slate-50/80">
                          <td className="p-3.5 flex items-center gap-3">
                            <img
                              src={avatarUrl}
                              alt={docName}
                              className="w-8 h-8 rounded-lg object-cover bg-sky-50 border border-slate-100"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(docName)}&background=0284c7&color=fff`;
                              }}
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{docName}</span>
                              <span className="text-slate-400 text-[10px]">{doc.email}</span>
                            </div>
                          </td>
                          <td className="p-3.5 font-semibold text-sky-700">{deptDisplay}</td>
                          <td className="p-3.5 text-slate-600">{docExp}</td>
                          <td className="p-3.5 font-bold text-slate-900">₹{docFee}</td>
                          <td className="p-3.5 text-slate-600">{doc.room || 'OPD-102'}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              doc.available ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {doc.available ? 'Active' : 'Off-duty'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleDeleteDoctor(docId, docName)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer min-tap"
                              title="Remove Doctor"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Department Management */}
        {currentTab === 'departments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Hospital Departments ({departments.length})</h3>
              <button
                onClick={() => setAddDeptOpen(true)}
                className="px-3.5 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Department</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <div key={dept.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{dept.name}</h4>
                    <span className="text-[10px] font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">
                      {dept.doctorsCount} Faculty
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">Head: {dept.head || 'Chief Consultant'}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{dept.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Patients Directory */}
        {currentTab === 'patients' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Registered Patients Directory</h3>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft">
              <div className="table-scroll-wrapper">
                <table className="min-w-[600px] w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Patient Name</th>
                      <th className="p-3.5">Contact Phone</th>
                      <th className="p-3.5">Blood Group</th>
                      <th className="p-3.5">Age / Gender</th>
                      <th className="p-3.5">Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80">
                        <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                        <td className="p-3.5 text-slate-600">{p.phone}</td>
                        <td className="p-3.5 font-bold text-rose-600">{p.bloodGroup || 'B+'}</td>
                        <td className="p-3.5 text-slate-600">{p.age || 34} Yrs • {p.gender || 'Male'}</td>
                        <td className="p-3.5 text-slate-500 truncate max-w-xs">{p.address || 'Chennai'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Revenue Analytics */}
        {currentTab === 'revenue' && (
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-soft space-y-4">
              <h3 className="text-base font-bold text-slate-900">Hospital Financial Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                  <span className="text-xs font-bold text-purple-700 uppercase">Gross OPD Inflow</span>
                  <span className="text-2xl font-black text-purple-950 block mt-1">₹4,50,000</span>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Settled Transactions</span>
                  <span className="text-2xl font-black text-emerald-950 block mt-1">94.8%</span>
                </div>
                <div className="p-4 rounded-xl bg-sky-50 border border-sky-100">
                  <span className="text-xs font-bold text-sky-700 uppercase">Avg Consultation Rate</span>
                  <span className="text-2xl font-black text-sky-950 block mt-1">₹750</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Doctor Modal */}
        {addDoctorOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900">Add New Doctor to Faculty</h3>
                <button onClick={() => setAddDoctorOpen(false)} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer min-tap">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddDoctor} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Name *</label>
                  <input
                    type="text"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Sundaram"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-base sm:text-xs focus:ring-2 focus:ring-sky-500 outline-hidden min-h-[44px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                    <select
                      value={newDoctor.department}
                      onChange={(e) => setNewDoctor({ ...newDoctor, department: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-base sm:text-xs bg-white focus:ring-2 focus:ring-sky-500 outline-hidden min-h-[44px]"
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications</label>
                    <input
                      type="text"
                      value={newDoctor.qualification}
                      onChange={(e) => setNewDoctor({ ...newDoctor, qualification: e.target.value })}
                      placeholder="e.g. MBBS, MS, MCh"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-base sm:text-xs focus:ring-2 focus:ring-sky-500 outline-hidden min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Experience</label>
                    <input
                      type="text"
                      value={newDoctor.experience}
                      onChange={(e) => setNewDoctor({ ...newDoctor, experience: e.target.value })}
                      placeholder="e.g. 10 Years"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-base sm:text-xs focus:ring-2 focus:ring-sky-500 outline-hidden min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Fee (₹)</label>
                    <input
                      type="number"
                      value={newDoctor.fee}
                      onChange={(e) => setNewDoctor({ ...newDoctor, fee: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-base sm:text-xs focus:ring-2 focus:ring-sky-500 outline-hidden min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Room / Suite</label>
                    <input
                      type="text"
                      value={newDoctor.room}
                      onChange={(e) => setNewDoctor({ ...newDoctor, room: e.target.value })}
                      placeholder="Suite 204"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-base sm:text-xs focus:ring-2 focus:ring-sky-500 outline-hidden min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAddDoctorOpen(false)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold cursor-pointer min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer min-h-[44px] shadow-xs"
                  >
                    Add Doctor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Department Modal */}
        {addDeptOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900">Add New Department</h3>
                <button onClick={() => setAddDeptOpen(false)} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer min-tap">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddDepartment} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department Name *</label>
                  <input
                    type="text"
                    value={newDept.name}
                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                    placeholder="e.g. Pulmonology"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-base sm:text-xs focus:ring-2 focus:ring-purple-500 outline-hidden min-h-[44px]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department Head</label>
                  <input
                    type="text"
                    value={newDept.head}
                    onChange={(e) => setNewDept({ ...newDept, head: e.target.value })}
                    placeholder="e.g. Dr. K. Ramanathan"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-base sm:text-xs focus:ring-2 focus:ring-purple-500 outline-hidden min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Description</label>
                  <textarea
                    rows={2}
                    value={newDept.description}
                    onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                    placeholder="Short description of treatments and services..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-base sm:text-xs focus:ring-2 focus:ring-purple-500 outline-hidden"
                  />
                </div>
                <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAddDeptOpen(false)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold cursor-pointer min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer min-h-[44px] shadow-xs"
                  >
                    Create Department
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
