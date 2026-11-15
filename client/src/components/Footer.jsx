import React from 'react';
import { Link } from './Router';
import { Activity, Phone, Mail, MapPin, Heart, ShieldCheck, Award, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: Hospital Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-white">MediCare</span>
                <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-teal-500 text-white tracking-wider">360</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed pr-6">
              A comprehensive next-generation healthcare platform seamlessly connecting patients, clinicians, diagnostic labs, and hospital administration with precision and empathy.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Award className="w-4 h-4 text-amber-400" />
                <span>NABH Accredited</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ISO 9001:2015</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white text-sm font-bold tracking-wider uppercase mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-sky-400 transition">Home</Link></li>
              <li><Link to="/about" className="hover:text-sky-400 transition">About Hospital</Link></li>
              <li><Link to="/services" className="hover:text-sky-400 transition">Specialized Services</Link></li>
              <li><Link to="/departments" className="hover:text-sky-400 transition">Medical Departments</Link></li>
              <li><Link to="/doctors" className="hover:text-sky-400 transition">Find a Doctor</Link></li>
              <li><Link to="/contact" className="hover:text-sky-400 transition">Help & Contacts</Link></li>
            </ul>
          </div>

          {/* Column 3: Portals */}
          <div>
            <h4 className="text-white text-sm font-bold tracking-wider uppercase mb-4">Portals & Access</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/patient-dashboard" className="hover:text-sky-400 transition">Patient Portal</Link></li>
              <li><Link to="/doctor-dashboard" className="hover:text-sky-400 transition">Doctor Workspace</Link></li>
              <li><Link to="/admin-dashboard" className="hover:text-sky-400 transition">Admin Console</Link></li>
              <li><Link to="/receptionist-dashboard" className="hover:text-sky-400 transition">Reception & Billing</Link></li>
              <li><Link to="/login" className="hover:text-sky-400 transition">Staff & User Login</Link></li>
              <li><Link to="/register" className="hover:text-sky-400 transition">New Patient Sign Up</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact info */}
          <div>
            <h4 className="text-white text-sm font-bold tracking-wider uppercase mb-4">24/7 Contact</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>42 Healthcare Boulevard, Anna Nagar West, Chennai - 600040</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Emergency: 1800-425-3600</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                <span>24/7 Emergency & ICU Care</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <span>care@medicare360.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MediCare 360 Smart Healthcare Management System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              Developed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for compassionate modern care
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
