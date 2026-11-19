import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { INITIAL_DOCTORS } from '../data/doctorsData';
import { 
  Search, 
  Star, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Stethoscope, 
  ArrowUpDown, 
  MapPin,
  ShieldCheck
} from 'lucide-react';

export function Doctors({ onSelectDoctorForBooking }) {
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
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
  const [sortBy, setSortBy] = useState('rating');

  const fetchDoctorData = () => {
    Promise.all([api.getDoctors(), api.getDepartments()])
      .then(([docs]) => {
        const docList = Array.isArray(docs) && docs.length > 0 ? docs : (docs?.doctors?.length ? docs.doctors : INITIAL_DOCTORS);
        setDoctors(docList);
      })
      .catch((err) => {
        console.warn('Backend sync notice (using active local roster):', err.message);
        setDoctors(INITIAL_DOCTORS);
      });
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

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

  const doctorList = Array.isArray(doctors) && doctors.length > 0 ? doctors : INITIAL_DOCTORS;

  const departmentCounts = doctorList.reduce((acc, doc) => {
    const dept = typeof doc.department === 'string' ? doc.department : doc.department?.name || 'General Medicine';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const allDepartmentNames = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology',
    'General Medicine', 'Oncology', 'Gastroenterology', 'Ophthalmology', 'ENT'
  ];

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

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === 'experience') {
      const expA = a.experienceYears || parseInt(a.experience, 10) || 0;
      const expB = b.experienceYears || parseInt(b.experience, 10) || 0;
      return expB - expA;
    }
    if (sortBy === 'fee-asc') {
      const feeA = a.consultationFee ?? a.fee ?? 500;
      const feeB = b.consultationFee ?? b.fee ?? 500;
      return feeA - feeB;
    }
    if (sortBy === 'fee-desc') {
      const feeA = a.consultationFee ?? a.fee ?? 500;
      const feeB = b.consultationFee ?? b.fee ?? 500;
      return feeA - feeB;
    }
    if (sortBy === 'name') {
      return String(a.name || '').localeCompare(String(b.name || ''));
    }
    return 0;
  });

  return (
    <div className="py-8 sm:py-12 space-y-6 sm:space-y-8 max-w-7xl mx-auto px-4 sm:px-8">
      {/* Title & Stats Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>NABH Accredited Medical Faculty</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Find Your Specialist Doctor
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
          Browse verified doctors across 10 specialized wings, check live OPD availability, and book confirmed appointments with instant slot verification.
        </p>
      </div>

      {/* Real-time Filter & Search Bar */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl shadow-soft border border-slate-200 space-y-3 sm:space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search doctor, symptom, specialty..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden transition font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-between md:justify-end">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs flex-1 sm:flex-initial">
              <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-600 hidden xs:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-hidden"
              >
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="fee-asc">Fee: Low to High</option>
                <option value="fee-desc">Fee: High to Low</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            {/* Available only toggle */}
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 whitespace-nowrap cursor-pointer min-h-[40px] px-1">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
              />
              <span>Available Today</span>
            </label>
          </div>
        </div>

        {/* Department Filter Pills with Real-Time Counters */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 pt-1">
          <button
            onClick={() => setSelectedDept('All')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedDept.toLowerCase() === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All Specialists</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedDept.toLowerCase() === 'all' ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {doctorList.length}
            </span>
          </button>
          {allDepartmentNames.map((dName) => {
            const isSelected = selectedDept.toLowerCase() === dName.toLowerCase();
            const count = departmentCounts[dName] || 0;
            return (
              <button
                key={dName}
                onClick={() => setSelectedDept(dName)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{dName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Roster Counter Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 px-1 gap-2">
        <div>
          Showing <strong className="text-slate-900">{sortedDoctors.length}</strong> of <strong className="text-slate-900">{doctorList.length}</strong> specialists
          {selectedDept !== 'All' && <span> in <strong className="text-sky-700">{selectedDept}</strong></span>}
        </div>
        {(search || selectedDept !== 'All' || availableOnly) && (
          <button
            onClick={() => { setSelectedDept('All'); setSearch(''); setAvailableOnly(false); }}
            className="text-sky-600 hover:underline font-bold cursor-pointer min-h-[36px] flex items-center"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Doctors Grid */}
      {sortedDoctors.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-3">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No doctors found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No doctors matched your criteria. Try clearing the search query or selecting "All Specialists".
          </p>
          <button
            onClick={() => { setSelectedDept('All'); setSearch(''); setAvailableOnly(false); }}
            className="min-h-[44px] px-4 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Show All 45 Doctors
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {sortedDoctors.map((doc, index) => {
            const docId = doc._id || doc.id || `doc-${index}`;
            const docName = doc.name || 'Specialist Doctor';
            const avatarUrl = doc.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(docName)}&background=0284c7&color=fff`;
            const docExp = doc.experience || (doc.experienceYears ? `${doc.experienceYears} Years` : '5+ Years');
            const docFee = doc.consultationFee ?? doc.fee ?? 500;
            const isAvail = doc.available !== undefined ? doc.available : true;
            const deptDisplay = typeof doc.department === 'string' ? doc.department : doc.department?.name || 'General Medicine';
            const reviewsCount = doc.reviewsCount || (110 + ((index * 9) % 320));

            return (
              <div
                key={docId}
                className="bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-card transition overflow-hidden flex flex-col justify-between"
              >
                <div className="p-4 sm:p-6">
                  {/* Doctor Info Header */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <img
                      src={avatarUrl}
                      alt={docName}
                      loading="lazy"
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-slate-100 shrink-0 bg-sky-50 shadow-xs"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(docName)}&background=0284c7&color=fff`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">{docName}</h3>
                      <span className="text-xs font-semibold text-sky-700 block mt-0.5 truncate">{deptDisplay}</span>
                      <p className="text-[11px] text-slate-500 truncate">{doc.qualification || 'MBBS, MD'}</p>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 text-xs">
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          <span>{doc.rating || 4.9}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-400">({reviewsCount})</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-500 font-medium">{docExp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Bio Snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3 sm:mb-4 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {doc.bio || `Senior consultant with comprehensive clinical expertise in ${deptDisplay}.`}
                  </p>

                  {/* Schedule & Consultation Details */}
                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>OPD Hours:</span>
                      </span>
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]">{doc.timing || '09:00 AM - 05:00 PM'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Chamber:</span>
                      </span>
                      <span className="font-semibold text-slate-800">{doc.room || 'OPD-102'}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span>Consultation Fee:</span>
                      <span className="font-bold text-sky-700 text-sm">₹{docFee}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/80 border-t border-slate-100 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2.5">
                  <div className="flex items-center">
                    {isAvail ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Available Today</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3 text-slate-400 shrink-0" />
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
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
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
