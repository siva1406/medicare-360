import React, { useState } from 'react';
import { Link, useNavigate } from '../components/Router';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Stethoscope, Building2, Receipt } from 'lucide-react';

export function Login() {
  const { login, quickDemoLogin, showToast } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectByRole = (role) => {
    switch (role) {
      case 'doctor':
        navigate('/doctor-dashboard');
        break;
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'receptionist':
        navigate('/receptionist-dashboard');
        break;
      case 'patient':
      default:
        navigate('/patient-dashboard');
        break;
    }
  };

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      redirectByRole(user.role);
    } catch (err) {
      // toast shown in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (role) => {
    setLoading(true);
    try {
      const user = await quickDemoLogin(role);
      redirectByRole(user.role);
    } catch (err) {
      // toast shown in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-600 to-teal-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-sky-600/20">
            <Activity className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Sign In to MediCare 360</h2>
          <p className="text-xs text-slate-500">Access your role-based healthcare portal</p>
        </div>

        {/* Demo Fast-Login Selector */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-soft space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">
            ⚡ Quick 1-Click Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoSelect('patient')}
              disabled={loading}
              className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer min-h-[54px] min-tap"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Patient Portal</span>
              <span className="text-[10px] text-emerald-600 font-normal">Rajesh Kumar</span>
            </button>

            <button
              onClick={() => handleDemoSelect('doctor')}
              disabled={loading}
              className="p-3 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100/70 text-sky-800 font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer min-h-[54px] min-tap"
            >
              <Stethoscope className="w-4 h-4 text-sky-600" />
              <span>Doctor Portal</span>
              <span className="text-[10px] text-sky-600 font-normal">Dr. Priya Sharma</span>
            </button>

            <button
              onClick={() => handleDemoSelect('admin')}
              disabled={loading}
              className="p-3 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 text-purple-800 font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer min-h-[54px] min-tap"
            >
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>Admin Console</span>
              <span className="text-[10px] text-purple-600 font-normal">Hospital Admin</span>
            </button>

            <button
              onClick={() => handleDemoSelect('receptionist')}
              disabled={loading}
              className="p-3 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 text-amber-800 font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer min-h-[54px] min-tap"
            >
              <Receipt className="w-4 h-4 text-amber-600" />
              <span>Reception Desk</span>
              <span className="text-[10px] text-amber-600 font-normal">Anitha Officer</span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-soft">
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-bold">Or enter credentials</span>
            </div>
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. patient@medicare360.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-sky-500 outline-hidden min-h-[44px]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-sky-500 outline-hidden min-h-[44px]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-5 mt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have a patient account?{' '}
            <Link to="/register" className="font-bold text-sky-600 hover:text-sky-700">
              Register as New Patient
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
