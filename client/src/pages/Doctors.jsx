import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Star, Clock, Calendar, CheckCircle2, XCircle, Stethoscope, AlertCircle, RefreshCw } from 'lucide-react';

export function Doctors({ onSelectDoctorForBooking }) {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(() => {
    try {
      const hash = window.location.hash || '';
      const queryIdx = hash.indexOf('?');
      if (queryIdx !== -1) {
        const params = new URLSearchParams(hash.slice(queryIdx));
        const deptParam = params.get('department') || params.get('dept');
        if (deptParam) return deptParam;
      }
    } catch (e) {}
    return 'All';
  });
  const [search, setSearch] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDoctorData = () => {
    setLoading(true);
    setError(null);
    Promise.all([api.getDoctors(), api.getDepartments()])
      .then(([docs, depts]) => {
        const docList = Array.isArray(docs) ? docs : (docs?.doctors || []);
        const deptList = Array.isArray(depts) ? depts : (depts?.departments || []);
        setDoctors(docList);
        setDepartments(deptList);
      })
      .catch((err) => {
        console.error('Failed to load doctors:', err);
        setError(err.message || 'Unable to load doctor profiles. Please check server connection.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  // Synchronize department filter when URL hash changes
  useEffect(() => {
    const handleHash = () => {
      try {
        const hash = window.location.hash || '';
        const queryIdx = hash.indexOf('?');
        if (queryIdx !== -1) {
          const params = new URLSearchParams(hash.slice(queryIdx));
          const deptParam = params.get('department') || params.get('dept');
          if (deptParam) {
            setSelectedDept(deptParam);
            return;
          }
        }
      } catch (e) {}
    };

    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const doctorList = Array.isArray(doctors) ? doctors : (doctors?.doctors || []);
  const deptList = Array.isArray(departments) ? departments : (departments?.departments || []);

  const filteredDoctors = doctorList.filter((doc) => {
    if (!doc) return false;
    const docDept = (typeof doc.department === 'string' ? doc.department : doc.department?.name || '').toLowerCase();
    const targetDept = String(selectedDept || 'All').trim().toLowerCase();
    const matchesDept = targetDept === 'all' || docDept === targetDept || docDept.includes(targetDept);
    
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || 
      String(doc.name || '').toLowerCase().includes(q) || 
      docDept.includes(q) ||
      String(doc.specialization || '').toLowerCase().includes(q) ||
      String(doc.qualification || '').toLowerCase().includes(q) ||
      String(doc.bio || '').toLowerCase().includes(q);

    const isAvail = doc.available !== undefined ? doc.available : true;
    const matchesAvail = availableOnly ? isAvail : true;

    return matchesDept && matchesSearch && matchesAvail;
  });

  return (
    <div className="py-12 space-y-8 max-w-7xl mx-auto px-4 sm:px-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
          Board-Certified Faculty
        </span>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Find Your Specialist Doctor</h1>
        <p className="text-slate-600 text-sm">
          Browse verified doctors across medical disciplines, check live OPD availability, and schedule instant appointments.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 bg-white rounded-2xl shadow-soft border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor name or specialty..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
          />
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedDept('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedDept.toLowerCase() === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Specialists
          </button>
          {deptList.map(d => {
            const dName = typeof d === 'string' ? d : d.name || 'General';
            const isSelected = selectedDept.toLowerCase() === dName.toLowerCase();
            return (
              <button
                key={d._id || d.id || dName}
                onClick={() => setSelectedDept(dName)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dName}
              </button>
            );
          })}
        </div>

        {/* Available only toggle */}
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 whitespace-nowrap cursor-pointer">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
          />
          <span>Available Today Only</span>
        </label>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-700">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDoctorData}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Doctors Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs">Loading verified doctor profiles...</span>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No doctors found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No doctors matched your filter ({selectedDept !== 'All' ? selectedDept : 'All Disciplines'}). Try clearing the search or choosing another department.
          </p>
          <button
            onClick={() => { setSelectedDept('All'); setSearch(''); setAvailableOnly(false); }}
            className="px-4 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc, index) => {
            const docId = doc._id || doc.id || `doc-${index}`;
            const docName = doc.name || 'Specialist Doctor';
            const avatarUrl = doc.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(docName)}&background=0284c7&color=fff`;
            const docExp = doc.experience || (doc.experienceYears ? `${doc.experienceYears} Years` : '5+ Years');
            const docFee = doc.consultationFee ?? doc.fee ?? 500;
            const isAvail = doc.available !== undefined ? doc.available : true;
            const deptDisplay = typeof doc.department === 'string' ? doc.department : doc.department?.name || 'General Medicine';

            return (
              <div
                key={docId}
                className="bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-card transition overflow-hidden flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={avatarUrl}
                      alt={docName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shrink-0 bg-sky-50"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(docName)}&background=0284c7&color=fff`;
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-slate-900 leading-tight">{docName}</h3>
                      </div>
                      <span className="text-xs font-semibold text-sky-700 block mt-0.5">{deptDisplay}</span>
                      <p className="text-[11px] text-slate-500">{doc.qualification || 'MBBS, MD'}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{doc.rating || 4.9}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-500 font-medium">{docExp} Experience</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {doc.bio || 'Experienced senior consultant with expertise in evidence-based clinical therapeutics.'}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>OPD Timings:</span>
                      </span>
                      <span className="font-semibold text-slate-800">{doc.timing || '09:00 AM - 05:00 PM'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Consultation Room:</span>
                      <span className="font-semibold text-slate-800">{doc.room || 'OPD-102'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Consultation Fee:</span>
                      <span className="font-bold text-sky-700 text-sm">₹{docFee}</span>
                    </div>
                  </div>
                </div>

                {/* Action Card Bottom */}
                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    {isAvail ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Available</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3 text-slate-400" />
                        <span>In Surgery</span>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (onSelectDoctorForBooking) {
                        onSelectDoctorForBooking(doc);
                      } else {
                        window.location.hash = '/';
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Appointment</span>
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
