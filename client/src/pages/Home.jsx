import React, { useState, useEffect } from 'react';
import { Link } from '../components/Router';
import { api } from '../services/api';
import { INITIAL_DOCTORS } from '../data/doctorsData';
import { 
  Activity, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Clock, 
  PhoneCall, 
  Users, 
  ArrowRight, 
  Stethoscope, 
  CheckCircle2, 
  Star,
  HeartPulse,
  Microscope,
  FileText
} from 'lucide-react';

export function Home({ onOpenSmartRecommender, onOpenBookingModal }) {
  const [featuredDoctors, setFeaturedDoctors] = useState(() => INITIAL_DOCTORS.slice(0, 4));

  useEffect(() => {
    api.getDoctors()
      .then((docs) => {
        const list = Array.isArray(docs) ? docs : (docs?.doctors || []);
        setFeaturedDoctors(list.slice(0, 4));
      })
      .catch(console.error);
  }, []);

  const stats = [
    { label: 'Happy Treated Patients', value: '1,250+', icon: Users },
    { label: 'Board-Certified Doctors', value: '45+', icon: Stethoscope },
    { label: 'Monthly Appointments', value: '320+', icon: Calendar },
    { label: 'Emergency Response Time', value: '< 8 Mins', icon: Clock },
  ];

  const features = [
    {
      title: 'Smart Doctor Recommendation',
      desc: 'Our intelligent symptom checker recommends the right department and available specialist instantly.',
      icon: Sparkles,
      color: 'bg-teal-500',
    },
    {
      title: 'Real-Time Appointment Booking',
      desc: 'Browse doctor calendars, check available slots and book confirmed appointments in 60 seconds.',
      icon: Calendar,
      color: 'bg-sky-600',
    },
    {
      title: 'Tamper-Proof Digital Prescriptions',
      desc: 'Access verified digital prescriptions with dosage timelines and follow-up alerts directly on your phone.',
      icon: FileText,
      color: 'bg-indigo-600',
    },
    {
      title: 'Integrated Electronic Health Records',
      desc: 'Securely upload, store, and access diagnostic lab reports, ECG charts, and medical history 24/7.',
      icon: ShieldCheck,
      color: 'bg-emerald-600',
    },
  ];

  const departments = [
    { name: 'Cardiology', desc: 'Heart care, Angiography, 2D Echo and Arrhythmia clinic', icon: HeartPulse, count: '8 Doctors' },
    { name: 'Neurology', desc: 'Brain, stroke management, spine and neuromuscular disorders', icon: Activity, count: '6 Doctors' },
    { name: 'Orthopedics', desc: 'Joint replacement, fracture care, sports injury rehabilitation', icon: Stethoscope, count: '7 Doctors' },
    { name: 'Pediatrics', desc: 'Comprehensive child healthcare, immunizations & neonatal ICU', icon: Users, count: '5 Doctors' },
  ];

  return (
    <div className="space-y-12 sm:space-y-20 pb-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-slate-50 pt-8 sm:pt-12 pb-14 sm:pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse"></span>
                <span>Next-Gen Healthcare Management</span>
              </div>

              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Smart, Compassionate <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-600">
                  Healthcare for Every Life.
                </span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                MediCare 360 unifies patients, clinicians, diagnostics, and hospital administration on a seamless, secure SaaS platform with automated scheduling and digital prescriptions.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => onOpenBookingModal && onOpenBookingModal()}
                  className="min-h-[48px] px-6 py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition hover:-translate-y-0.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Book Appointment Online</span>
                </button>
                <button
                  onClick={onOpenSmartRecommender}
                  className="min-h-[48px] px-6 py-3.5 bg-white hover:bg-teal-50 text-teal-700 border-2 border-teal-600/40 hover:border-teal-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Smart Doctor Matcher</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 sm:pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>NABH Certified Care</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant Digital Rx</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero Wait OPD Token</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="relative mx-auto max-w-sm sm:max-w-md bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80"
                  alt="Doctor with patient"
                  loading="lazy"
                  className="w-full h-56 sm:h-72 object-cover rounded-2xl shadow-sm"
                />

                {/* Floating Doctor Badge (Safely contained on mobile) */}
                <div className="mt-3 sm:absolute sm:-bottom-5 sm:-left-5 bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold shrink-0">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Dr. Priya Sharma</div>
                    <div className="text-[11px] text-teal-700 font-semibold">Chief Cardiologist</div>
                    <div className="flex items-center gap-1 text-[10px] text-amber-500 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                      <span className="font-bold text-slate-700">4.9</span>
                      <span className="text-slate-400">(420+ reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Floating 24/7 Hotline Badge */}
                <div className="hidden sm:flex absolute -top-4 -right-4 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
                  <div className="text-left">
                    <div className="text-[9px] uppercase font-bold text-slate-400">24/7 Trauma Care</div>
                    <div className="text-xs font-extrabold text-white">1800-425-3600</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-2xl shadow-soft border border-slate-200">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl bg-slate-50/50 sm:bg-transparent">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 truncate">{s.value}</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Platform Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2 sm:space-y-3">
          <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            Smarter Hospital Operations
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Designed for Patients, Doctors, and Administrators
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Everything your medical journey requires — organized in an intuitive, unified platform with real-time sync.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-card transition group flex flex-col justify-between">
                <div>
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${f.color} text-white flex items-center justify-center mb-4 group-hover:scale-105 transition shadow-md`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Medical Departments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Centers of Clinical Excellence</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Specialized Medical Departments</h2>
          </div>
          <Link to="/departments" className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 min-h-[36px]">
            <span>View All Departments</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {departments.map((dept, i) => {
            const Icon = dept.icon;
            return (
              <div key={i} className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 hover:border-sky-400 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{dept.name}</h3>
                <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full inline-block mb-3 border border-teal-100">
                  {dept.count}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">{dept.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Specialist Doctors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Board-Certified Faculty</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Meet Our Specialist Doctors</h2>
            <p className="text-xs text-slate-500 mt-1">Book direct consultations with senior physicians and surgeons across disciplines.</p>
          </div>
          <Link to="/doctors" className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 min-h-[36px]">
            <span>Browse All 45+ Doctors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredDoctors.map((doc, idx) => {
            const docId = doc._id || doc.id || `doc-${idx}`;
            const docName = doc.name || 'Specialist Doctor';
            const avatarUrl = doc.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(docName)}&background=0284c7&color=fff`;
            const docExp = doc.experience || (doc.experienceYears ? `${doc.experienceYears} Years` : '5+ Years');
            const docFee = doc.consultationFee ?? doc.fee ?? 500;
            const deptDisplay = typeof doc.department === 'string' ? doc.department : doc.department?.name || 'General Medicine';

            return (
              <div
                key={docId}
                className="bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-card transition flex flex-col justify-between p-4 sm:p-5"
              >
                <div>
                  <img
                    src={avatarUrl}
                    alt={docName}
                    loading="lazy"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover mb-3 sm:mb-4 border-2 border-slate-100 bg-sky-50 mx-auto"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(docName)}&background=0284c7&color=fff`;
                    }}
                  />
                  <div className="text-center space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{docName}</h3>
                    <span className="text-xs font-semibold text-sky-700 block truncate">{deptDisplay}</span>
                    <p className="text-[11px] text-slate-500 truncate">{doc.qualification || 'MBBS, MD'}</p>
                    <div className="flex items-center justify-center gap-2 pt-1 text-xs">
                      <span className="flex items-center gap-1 font-bold text-amber-500 text-[11px]">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        <span>{doc.rating || 4.9}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-500">{docExp} Exp</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Fee:</span>
                    <span className="font-bold text-slate-900">₹{docFee}</span>
                  </div>
                  <button
                    onClick={() => onOpenBookingModal && onOpenBookingModal(doc)}
                    className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition cursor-pointer shadow-xs flex items-center"
                  >
                    Book Slot
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 24/7 Emergency & Walk-in Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              <span>24 Hours Emergency & Ambulance Fleet</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Need Urgent Medical Attention? <br />
              <span className="text-teal-400">We are here 24 hours a day.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Equipped with Level 1 Trauma Care, dedicated coronary care units, rapid CT/MRI diagnostics and life-support ambulances.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <a
                href="tel:18004253600"
                className="min-h-[48px] px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 shrink-0" />
                <span>Call Emergency: 1800-425-3600</span>
              </a>
              <Link
                to="/contact"
                className="min-h-[48px] px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-sm border border-slate-700 transition flex items-center justify-center"
              >
                Directions to Hospital
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
