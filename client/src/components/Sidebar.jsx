import React, { useState } from 'react';
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
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

export function Sidebar({ currentTab, onSelectTab, role }) {
  const { user, logout, quickDemoLogin } = useAuth();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const patientTabs = [
    { id: 'appointments', label: 'My Appointments', icon: Calendar, shortLabel: 'Appts' },
    { id: 'prescriptions', label: 'Digital Prescriptions', icon: FileText, shortLabel: 'Rx' },
    { id: 'reports', label: 'Medical Reports & Lab', icon: FolderPlus, shortLabel: 'Reports' },
    { id: 'profile', label: 'Health Profile', icon: UserCheck, shortLabel: 'Profile' },
  ];

  const doctorTabs = [
    { id: 'schedule', label: "Today's Consultations", icon: Calendar, shortLabel: 'OPD' },
    { id: 'patients', label: 'Patient Medical History', icon: Users, shortLabel: 'Patients' },
    { id: 'prescriptions', label: 'Digital Rx Issued', icon: FileText, shortLabel: 'Rx' },
    { id: 'availability', label: 'Manage Availability', icon: Clock, shortLabel: 'Hours' },
    { id: 'stats', label: 'Daily Statistics', icon: TrendingUp, shortLabel: 'Stats' },
  ];

  const adminTabs = [
    { id: 'overview', label: 'Overview & KPIs', icon: LayoutDashboard, shortLabel: 'Overview' },
    { id: 'doctors', label: 'Doctor Management', icon: Stethoscope, shortLabel: 'Doctors' },
    { id: 'departments', label: 'Departments', icon: Building2, shortLabel: 'Depts' },
    { id: 'patients', label: 'Patient Directory', icon: Users, shortLabel: 'Patients' },
    { id: 'revenue', label: 'Revenue Analytics', icon: TrendingUp, shortLabel: 'Revenue' },
  ];

  const receptionistTabs = [
    { id: 'walkin', label: 'Walk-in Registration', icon: Calendar, shortLabel: 'Walk-in' },
    { id: 'queue', label: 'Live OPD Queue', icon: Clock, shortLabel: 'Queue' },
    { id: 'search', label: 'Patient Search', icon: Users, shortLabel: 'Search' },
    { id: 'billing', label: 'Billing & Invoices', icon: Receipt, shortLabel: 'Billing' },
  ];

  let tabs = patientTabs;
  if (role === 'doctor') tabs = doctorTabs;
  if (role === 'admin') tabs = adminTabs;
  if (role === 'receptionist') tabs = receptionistTabs;

  // Primary tabs for mobile bottom bar (first 3-4 items, plus More button if needed)
  const primaryMobileTabs = tabs.length > 4 ? tabs.slice(0, 3) : tabs;
  const hasMoreTabs = tabs.length > 4;

  const handleMobileTabClick = (tabId) => {
    onSelectTab(tabId);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      {/* ============================================================ */}
      {/* 1. DESKTOP SIDEBAR (Visible on md screens: 768px and above)    */}
      {/* ============================================================ */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 min-h-[calc(100vh-65px)]">
        {/* Current User Card */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
              alt={user?.name || "User"}
              className="w-10 h-10 rounded-xl object-cover border border-sky-400 shrink-0"
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
                className={`w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                    : 'text-slate-600 hover:text-sky-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
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
              className="min-h-[44px] flex items-center justify-center p-2 rounded-lg border border-slate-200 bg-white hover:border-sky-300 text-center font-medium text-slate-700 hover:text-sky-600 transition"
            >
              Patient
            </Link>
            <Link
              to="/doctor-dashboard"
              onClick={() => quickDemoLogin('doctor')}
              className="min-h-[44px] flex items-center justify-center p-2 rounded-lg border border-slate-200 bg-white hover:border-sky-300 text-center font-medium text-slate-700 hover:text-sky-600 transition"
            >
              Doctor
            </Link>
            <Link
              to="/admin-dashboard"
              onClick={() => quickDemoLogin('admin')}
              className="min-h-[44px] flex items-center justify-center p-2 rounded-lg border border-slate-200 bg-white hover:border-sky-300 text-center font-medium text-slate-700 hover:text-sky-600 transition"
            >
              Admin
            </Link>
            <Link
              to="/receptionist-dashboard"
              onClick={() => quickDemoLogin('receptionist')}
              className="min-h-[44px] flex items-center justify-center p-2 rounded-lg border border-slate-200 bg-white hover:border-sky-300 text-center font-medium text-slate-700 hover:text-sky-600 transition"
            >
              Reception
            </Link>
          </div>
        </div>

        {/* Logout button */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MOBILE TOP TAB STRIP & DRAWER TOGGLE (< 768px screens)    */}
      {/* ============================================================ */}
      <div className="md:hidden w-full bg-white border-b border-slate-200 px-3 py-2 sticky top-[57px] z-30 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          {/* Scrollable horizontal tab pills with min 44px touch targets */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.shortLabel || tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Drawer Button */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer shrink-0"
            aria-label="Open Workspace Menu & Role Switcher"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MOBILE BOTTOM TAB BAR (< 768px screens)                   */}
      {/* ============================================================ */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1 shadow-lg pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
        <div className="flex items-center justify-around">
          {primaryMobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleMobileTabClick(tab.id)}
                className={`min-h-[48px] min-w-[54px] flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                  isActive
                    ? 'text-sky-600 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-sky-50' : ''}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600 stroke-[2.5]' : 'text-slate-500'}`} />
                </div>
                <span className="truncate max-w-[64px]">{tab.shortLabel || tab.label}</span>
              </button>
            );
          })}

          {/* More / Menu Button */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="min-h-[48px] min-w-[54px] flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
            aria-label="More options"
          >
            <div className="p-1 rounded-lg">
              <MoreHorizontal className="w-5 h-5 text-slate-500" />
            </div>
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* ============================================================ */}
      {/* 4. MOBILE SLIDE-UP DRAWER FOR DASHBOARD                      */}
      {/* ============================================================ */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full rounded-t-3xl shadow-2xl border-t border-slate-200 max-h-[85vh] flex flex-col overflow-hidden pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            {/* Drawer Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                  alt={user?.name || "User"}
                  className="w-10 h-10 rounded-xl object-cover border border-sky-400 shrink-0"
                />
                <div className="truncate">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{user?.name || 'MediCare User'}</h4>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800">
                    {role || user?.role || 'Guest'} Workspace
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* All Workspace Tabs with large touch targets */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Navigate Workspace
                </p>
                <div className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleMobileTabClick(tab.id)}
                        className={`w-full min-h-[48px] flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition text-left cursor-pointer ${
                          isActive
                            ? 'bg-sky-600 text-white font-bold shadow-sm'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span>{tab.label}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Role Switcher */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Switch Role Profile
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Link
                    to="/patient-dashboard"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      quickDemoLogin('patient');
                    }}
                    className="min-h-[44px] flex items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 active:bg-sky-50 active:text-sky-700"
                  >
                    Patient Portal
                  </Link>
                  <Link
                    to="/doctor-dashboard"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      quickDemoLogin('doctor');
                    }}
                    className="min-h-[44px] flex items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 active:bg-sky-50 active:text-sky-700"
                  >
                    Doctor Portal
                  </Link>
                  <Link
                    to="/admin-dashboard"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      quickDemoLogin('admin');
                    }}
                    className="min-h-[44px] flex items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 active:bg-sky-50 active:text-sky-700"
                  >
                    Admin Console
                  </Link>
                  <Link
                    to="/receptionist-dashboard"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      quickDemoLogin('receptionist');
                    }}
                    className="min-h-[44px] flex items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 active:bg-sky-50 active:text-sky-700"
                  >
                    Receptionist
                  </Link>
                </div>
              </div>

              {/* Sign Out */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    logout();
                  }}
                  className="w-full min-h-[48px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
