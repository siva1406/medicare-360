import React from 'react';
import { 
  HeartPulse, 
  Activity, 
  Microscope, 
  Stethoscope, 
  Truck, 
  Pill, 
  Video, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export function Services({ onOpenBookingModal }) {
  const services = [
    { title: '24/7 Emergency & Level 1 Trauma Care', desc: 'Round-the-clock emergency physicians, acute resuscitations, and rapid access to catheterization labs.', icon: ShieldAlert, color: 'text-rose-600 bg-rose-50' },
    { title: 'Outpatient Specialty Clinics (OPD)', desc: 'Consultations across 30+ medical specialties with zero paperwork and streamlined digital tokens.', icon: Stethoscope, color: 'text-sky-600 bg-sky-50' },
    { title: 'Comprehensive Diagnostic Laboratory', desc: 'Fully automated biochemistry, hematology, immunology and molecular pathology testing with same-day reports.', icon: Microscope, color: 'text-teal-600 bg-teal-50' },
    { title: 'Advanced Cath Lab & Interventional Cardiology', desc: 'Equipped with biplane digital angiography, intravascular ultrasound (IVUS) and fractional flow reserve (FFR).', icon: HeartPulse, color: 'text-rose-600 bg-rose-50' },
    { title: 'Telemedicine & Remote Consultation', desc: 'Connect with senior consultants from the comfort of your home via HD encrypted video consultations.', icon: Video, color: 'text-purple-600 bg-purple-50' },
    { title: '24/7 Digital Pharmacy & Home Delivery', desc: 'Fully stocked hospital pharmacy dispensing genuine medicines with barcode tracking and doorstep delivery.', icon: Pill, color: 'text-amber-600 bg-amber-50' },
    { title: 'Advanced Intensive Care Units (ICU / CCU / NICU)', desc: 'Dedicated intensive care with 1:1 nurse-to-patient ratio, advanced mechanical ventilators and ECMO support.', icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Advanced Cardiac Ambulance Fleet', desc: 'Mobile ICUs equipped with defibrillators, oxygen, ventilator and paramedic teams ready on a 1-minute alert.', icon: Truck, color: 'text-sky-600 bg-sky-50' },
  ];

  return (
    <div className="py-8 sm:py-12 space-y-8 sm:space-y-12 max-w-7xl mx-auto px-4 sm:px-8">
      <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
        <span className="px-3.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider">
          Comprehensive Clinical Services
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          World-Class Medical Solutions Under One Roof
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          From preventative wellness checkups to complicated neurosurgeries, MediCare 360 delivers seamless clinical excellence supported by modern medical engineering.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-card transition flex flex-col justify-between">
              <div>
                <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{s.desc}</p>
              </div>
              <button
                onClick={() => onOpenBookingModal && onOpenBookingModal()}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer pt-2 border-t border-slate-100 min-h-[44px] min-tap"
              >
                <span>Book Service</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
