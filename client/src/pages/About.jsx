import React from 'react';
import { Award, ShieldCheck, Heart, Users, Target, Activity } from 'lucide-react';

export function About() {
  const leadership = [
    { name: 'Dr. Venkatesh Raman', role: 'Medical Director & Chief Administrator', qualification: 'MD, MHA (All India Institute)', img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80' },
    { name: 'Dr. Priya Sharma', role: 'Head of Cardiovascular Sciences', qualification: 'MD, DM (Cardiology), FACC', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80' },
    { name: 'Dr. Arvind Swaminathan', role: 'Director of Neurosciences', qualification: 'MD, DM (Neurology), FINR', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80' },
    { name: 'Mrs. Anitha Sundaram', role: 'Chief of Patient Experience', qualification: 'MBA (Hospital Administration)', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="py-12 space-y-16 max-w-7xl mx-auto px-4 sm:px-8">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3.5 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
          Excellence in Healthcare Since 2012
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Pioneering Advanced Medical Care with Human Compassion
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          MediCare 360 is Chennai's premier multispecialty tertiary healthcare facility, combining world-class clinical talent, state-of-the-art robotic infrastructure, and compassionate patient-centric design.
        </p>
      </div>

      {/* Values & Accreditations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Our Clinical Mission</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            To provide precise, evidence-based diagnostic and therapeutic healthcare with zero medical errors, rapid digital turnaround, and complete affordability.
          </p>
        </div>

        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Accreditations & Quality</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Recognized with National Accreditation Board for Hospitals & Healthcare Providers (NABH) and ISO 9001:2015 certifications for stringent safety protocols.
          </p>
        </div>

        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Patient-First Philosophy</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every clinical decision revolves around patient dignity, emotional reassurance, transparent billing, and dedicated post-discharge recovery monitoring.
          </p>
        </div>
      </div>

      {/* Hospital Leadership */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900">Hospital Clinical Leadership</h2>
          <p className="text-xs text-slate-500 mt-2">Guided by eminent physicians, surgeons and healthcare administrators.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {leadership.map((l, i) => (
            <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
              <img
                src={l.img}
                alt={l.name}
                className="w-24 h-24 rounded-2xl mx-auto object-cover mb-4 border-2 border-sky-100 shadow-xs"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(l.name)}&background=0284c7&color=fff`;
                }}
              />
              <h4 className="text-sm font-bold text-slate-900">{l.name}</h4>
              <p className="text-xs text-sky-700 font-semibold mt-0.5">{l.role}</p>
              <p className="text-[11px] text-slate-500 mt-1">{l.qualification}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
