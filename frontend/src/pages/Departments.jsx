import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from '../components/Router';
import { HeartPulse, Activity, Bone, Baby, Stethoscope, Sparkles, UserCheck, ArrowRight, Calendar } from 'lucide-react';

export function Departments({ onOpenBookingModal }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDepartments()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.departments || []);
        setDepartments(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const deptList = Array.isArray(departments) ? departments : (departments?.departments || []);

  const iconMap = {
    Heart: HeartPulse,
    Brain: Activity,
    Bone: Bone,
    Baby: Baby,
    Stethoscope: Stethoscope,
    Sparkles: Sparkles,
    UserCheck: UserCheck
  };

  return (
    <div className="py-12 space-y-12 max-w-7xl mx-auto px-4 sm:px-8">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3.5 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
          Specialized Medical Wings
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Hospital Departments
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Each department is led by experienced senior consultants, staffed by dedicated healthcare professionals, and supported by modern diagnostic laboratories.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading departments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deptList.map((dept) => {
            const Icon = iconMap[dept.icon] || Stethoscope;
            const docNum = dept.doctorCount ?? dept.doctorsCount ?? 0;
            return (
              <div key={dept._id || dept.id || dept.name} className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-card transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                      {docNum} {docNum === 1 ? 'Specialist' : 'Specialists'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1">{dept.name}</h3>
                  <p className="text-xs text-sky-700 font-medium mb-3">Head: {dept.head || 'Dr. Senior Consultant, MD'}</p>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">{dept.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/doctors?department=${encodeURIComponent(dept.name)}`}
                    className="text-xs font-bold text-slate-700 hover:text-sky-600 flex items-center gap-1"
                  >
                    <span>View Doctors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => onOpenBookingModal && onOpenBookingModal({ department: dept.name, departmentId: dept._id || dept.id })}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book OPD</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
