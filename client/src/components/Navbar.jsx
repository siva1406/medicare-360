import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from './Router';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  PhoneCall, 
  Clock, 
  MapPin, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Calendar, 
  Menu, 
  X, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export function Navbar({ onOpenSmartRecommender }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdown(false);
  }, [location.pathname]);

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'doctor': return '/doctor-dashboard';
      case 'admin': return '/admin-dashboard';
      case 'receptionist': return '/receptionist-dashboard';
      case 'patient':
      default:
        return '/patient-dashboard';
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Departments', path: '/departments' },
    { name: 'Doctors', path: '/doctors' },
    { name: 'Contact', path: '/contact' },
  ];

  const roleColors = {
    patient: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    doctor: 'bg-sky-50 text-sky-700 border-sky-200',
    admin: 'bg-purple-50 text-purple-700 border-purple-200',
    receptionist: 'bg-amber-50 text-amber-700 border-amber-200'
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top emergency and info bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 sm:py-2 px-3 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold tracking-wide text-[11px] sm:text-xs">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="hidden xs:inline">24/7 Emergency:</span>
              <a href="tel:18004253600" className="text-white hover:underline font-bold">1800-425-3600</a>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>OPD: 8:00 AM - 8:00 PM</span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-slate-400 text-[11px] sm:text-xs">
            <div className="hidden sm:flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Anna Nagar, Chennai</span>
            </div>
            <button 
              onClick={onOpenSmartRecommender}
              className="inline-flex items-center gap-1.5 text-teal-300 hover:text-white font-medium transition cursor-pointer min-h-[32px] py-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold">AI Matcher</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0 min-h-[44px]">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-sky-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">MediCare</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold bg-teal-500 text-white tracking-wider">360</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium tracking-wider uppercase -mt-0.5 hidden xs:block">Healthcare System</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'text-sky-600 bg-sky-50 font-semibold'
                    : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & Auth */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={onOpenSmartRecommender}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition shadow-xs cursor-pointer min-h-[40px]"
          >
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
            <span>AI Doctor Match</span>
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="min-h-[44px] min-w-[44px] flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                aria-label="User menu"
              >
                <img
                  src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-sky-400 shrink-0"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{user.name}</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase">{user.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {userDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setUserDropdown(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${roleColors[user.role]}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                  <Link
                    to={getDashboardPath()}
                    className="min-h-[44px] flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 font-medium transition"
                  >
                    <LayoutDashboard className="w-4 h-4 text-sky-600" />
                    <span>My Dashboard</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="min-h-[44px] w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-medium transition text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/login"
                className="min-h-[44px] px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:text-sky-600 hover:bg-slate-100 transition flex items-center"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="min-h-[44px] px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm shadow-sky-600/30 transition flex items-center gap-1 sm:gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden xs:inline">Book</span>
                <span className="hidden sm:inline">Appointment</span>
              </Link>
            </div>
          )}

          {/* Mobile hamburger button with accessible 44x44px touch target */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Responsive Hamburger Panel) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[calc(41px+57px)] bottom-0 bg-slate-900/40 backdrop-blur-xs z-50 animate-in fade-in">
          <div className="bg-white border-b border-slate-200 px-4 pt-3 pb-6 max-h-[85vh] overflow-y-auto space-y-2 shadow-2xl">
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`min-h-[48px] flex items-center px-4 py-3 rounded-xl text-base font-semibold transition ${
                      isActive 
                        ? 'bg-sky-50 text-sky-700 font-bold' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSmartRecommender();
                }}
                className="min-h-[48px] w-full py-3 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-sm flex items-center justify-center gap-2 border border-teal-200 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Smart Doctor Matcher</span>
              </button>

              {user ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[48px] w-full py-3 px-4 rounded-xl bg-sky-600 text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-md shadow-sky-600/20"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Go to Dashboard ({user.role})</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="min-h-[48px] w-full py-3 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-sm text-center flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[48px] py-3 px-4 text-center rounded-xl border border-slate-300 text-slate-700 font-bold text-sm flex items-center justify-center hover:bg-slate-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[48px] py-3 px-4 text-center rounded-xl bg-sky-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-sky-600/20"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
