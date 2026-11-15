import React, { useState } from 'react';
import { api } from '../services/api';
import { Sparkles, X, AlertCircle, ArrowRight, CheckCircle2, User, Stethoscope, Clock } from 'lucide-react';

export function SmartRecommenderModal({ isOpen, onClose, onSelectDoctor }) {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const quickSymptoms = [
    { label: 'Chest Pain & Heart Palpitations', value: 'Chest discomfort, tightness and rapid heartbeat' },
    { label: 'Severe Migraine & Dizziness', value: 'Throbbing headache, light sensitivity and feeling dizzy' },
    { label: 'Knee Joint Pain & Swelling', value: 'Swelling and sharp pain in knee joints when climbing stairs' },
    { label: 'Child High Fever & Cough', value: 'Toddler high grade fever, continuous cough and cold' },
    { label: 'Skin Itching & Red Rashes', value: 'Allergic red rash on arms with severe itching' },
  ];

  const handleRecommend = async (e) => {
    if (e) e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    try {
      const data = await api.recommendDoctor({ symptoms, age });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-sky-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-teal-100">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Smart Doctor Recommender</h3>
              <p className="text-xs text-teal-100">Intelligent symptom-to-specialist matching engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <form onSubmit={handleRecommend} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Describe your symptoms or health concern
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. I have been having severe chest tightness and shortness of breath since yesterday morning..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-hidden transition"
                required
              />
            </div>

            {/* Quick symptom presets */}
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Or choose a common condition:</p>
              <div className="flex flex-wrap gap-2">
                {quickSymptoms.map((qs, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSymptoms(qs.value);
                      if (qs.label.includes('Child')) setAge('5');
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition cursor-pointer text-slate-600 font-medium"
                  >
                    {qs.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient Age (Optional)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 34"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 outline-hidden"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || !symptoms.trim()}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Analyzing symptoms...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Find Matching Specialist</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* AI Result Card */}
          {result && (() => {
            const docList = Array.isArray(result.doctors)
              ? result.doctors
              : Array.isArray(result.recommendations)
                ? result.recommendations
                : [];
            const deptName = result.recommendedDepartment || (docList[0]?.department) || 'General Medicine';
            const adviceText = result.advice || result.clinicalNotice || `Based on your symptoms, we recommend consulting a specialist in ${deptName}.`;

            return (
              <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
                  <div className="flex items-center gap-2 text-teal-800 font-bold text-sm mb-1">
                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                    <span>Recommended Department: {deptName}</span>
                  </div>
                  <p className="text-xs text-teal-700 leading-relaxed pl-7">{adviceText}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                    Available Specialists in {deptName}
                  </h4>
                  <div className="space-y-3">
                    {docList.map((doc) => {
                      const docId = doc._id || doc.id;
                      const avatarUrl = doc.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=0284c7&color=fff`;
                      const exp = doc.experience || (doc.experienceYears ? `${doc.experienceYears} Years` : '5+ Years');
                      const fee = doc.consultationFee ?? doc.fee ?? 500;
                      return (
                        <div
                          key={docId}
                          className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-white hover:shadow-md transition flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={avatarUrl}
                              alt={doc.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-sky-50"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=0284c7&color=fff`;
                              }}
                            />
                            <div>
                              <h5 className="text-sm font-bold text-slate-900">{doc.name}</h5>
                              <p className="text-xs text-slate-500">{doc.department} • {exp}</p>
                              <div className="flex items-center gap-2 text-[11px] text-teal-700 font-medium mt-0.5">
                                <Clock className="w-3 h-3 text-teal-500" />
                                <span>{doc.timing || '09:00 AM - 05:00 PM'}</span>
                                <span className="text-slate-400">•</span>
                                <span className="font-bold text-slate-800">₹{fee}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              onClose();
                              if (onSelectDoctor) onSelectDoctor(doc);
                            }}
                            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer shrink-0"
                          >
                            <span>Book Slot</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
