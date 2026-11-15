import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Contact() {
  const { showToast } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Your message has been sent to the patient care desk. We will call you shortly!');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="py-12 space-y-12 max-w-7xl mx-auto px-4 sm:px-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider">
          Patient Support & Helpdesk
        </span>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Contact MediCare 360</h1>
        <p className="text-slate-600 text-sm">
          Have questions about doctor schedules, admissions, or insurance approvals? Our team is available 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Hospital Contact Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              <span>Emergency 24x7 Helpline</span>
            </div>
            <div>
              <p className="text-2xl font-black text-white">1800-425-3600</p>
              <p className="text-xs text-slate-400 mt-1">Dedicated trauma coordinators & ambulance dispatch</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-soft space-y-4 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">Hospital Address</h4>
                <p className="text-xs text-slate-500 mt-0.5">42 Healthcare Boulevard, 2nd Avenue, Anna Nagar West, Chennai, Tamil Nadu - 600040</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">OPD Appointments Desk</h4>
                <p className="text-xs text-slate-500 mt-0.5">+91 (044) 2618-3600 / +91 (044) 2618-3601</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">Email Inquiries</h4>
                <p className="text-xs text-slate-500 mt-0.5">care@medicare360.com / appointments@medicare360.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">Visiting Hours</h4>
                <p className="text-xs text-slate-500 mt-0.5">OPD: Mon-Sat 08:00 AM - 08:00 PM</p>
                <p className="text-xs text-slate-500">Inpatient Visiting: 04:30 PM - 07:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-slate-200 shadow-soft">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Send an Enquiry or Request a Callback</h3>
          <p className="text-xs text-slate-500 mb-6">Our patient relationship officer will review and reach out within 30 minutes.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh V"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98400 12345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. ramesh@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department / Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-sky-500 outline-hidden"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Cardiology">Cardiology Department</option>
                  <option value="Neurology">Neurology Department</option>
                  <option value="Orthopedics">Orthopedics Department</option>
                  <option value="Health Checkup Package">Executive Health Checkup</option>
                  <option value="Billing & Insurance">Insurance / TPA Claim</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message or Medical Details</label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Let us know how we can assist you..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit Inquiry</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
