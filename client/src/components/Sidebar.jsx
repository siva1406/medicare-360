import React from 'react';
import { Link, useLocation } from './Router';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Users, 
  UserCheck, 
  Receipt, 
  Settings, 
  LogOut, 
  Activity, 
  Clock, 
  FolderPlus,
  Stethoscope,
  Building2,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export function Sidebar({ currentTab, onSelectTab, role }) {
  const { user, logout, quickDemoLogin } = useAuth();
  const location = useLocation();

  const patientTabs = [
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'prescriptions', label: 'Digital Prescriptions', icon: FileText },
    { id: 'reports', label: 'Medical Reports & Lab', icon: FolderPlus },
    { id: 'profile', label: 'Personal Health Profile', icon: UserCheck },
  ];

  const doctorTabs = [
    { id: 'schedule', label: "Today's Consultations", icon: Calendar },
    { id: 'patients', label: 'Patient Medical History', icon: Users },
    { id: 'prescriptions', label: 'Digital Rx Issued', icon: FileText },
    { id: 'availability', label: 'Manage Availability', icon: Clock },
    { id: 'stats', label: 'Daily Statistics', icon: TrendingUp },
  ];

  const adminTabs = [
    { id: 'overview', label: 'Overview & KPIs', icon: LayoutDashboard },
    { id: 'doctors', label: 'Doctor Management', icon: Stethoscope },
    { id: 'departments', label: 'Department Management', icon: Building2 },
    { id: 'patients', label: 'Patient Directory', icon: Users },
    { id: 'revenue', label: 'Revenue Analytics', icon: TrendingUp },
  ];

  const receptionistTabs = [
    { id: 'walkin', label: 'Walk-in Registration', icon: Calendar },
    { id: 'queue', label: 'Live OPD Queue', icon: Clock },
    { id: 'search', label: 'Patient Search', icon: Users },
    { id: 'billing', label: 'Billing & Invoices', icon: Receipt },
  ];

  let tabs = patientTabs;
  if (role === 'doctor') tabs = doctorTabs;
  if (role === 'admin') tabs = adminTabs;
  if (role === 'receptionist') tabs = receptionistTabs;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-65px)]">
      {/* Current User Card */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
            alt={user?.name || "User"}
            className="w-10 h-10 rounded-xl object-cover border border-sky-400"
          />
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">{user?.name || 'MediCare User'}</h4>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
              {role || user?.role || 'Guest'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex-1 py-4 px-3 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
          {(role || user?.role || 'User').toUpperCase()} WORKSPACE
        </p>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Role Switcher for Demo Testing */}
      <div className="p-3 border-t border-slate-100 bg-slate-50">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Quick Switch Dashboard
        </p>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <Link
            to="/patient-dashboard"
            onClick={() => quickDemoLogin('patient')}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:border-sky-300 text-center font-medium text-slate-700 hover:text-sky-600"
          >
            Patient
          </Link>
          <Link
            to="/doctor-dashboard"
            onClick={() => quickDemoLogin('doctor')}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:border-sky-300 text-center font-medium text-slate-700 hover:text-sky-600"
          >
            Doctor
          </Link>
          <Link
            to="/admin-dashboard"
            onClick={() => quickDemoLogin('admin')}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:border-sky-300 text-center font-medium text-slate-700 hover:text-sky-600"
          >
            Admin
          </Link>
          <Link
            to="/receptionist-dashboard"
            onClick={() => quickDemoLogin('receptionist')}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:border-sky-300 text-center font-medium text-slate-700 hover:text-sky-600"
          >
            Reception
          </Link>
        </div>
      </div>

      {/* Logout button */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
