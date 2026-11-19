import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Receipt, Plus, Trash2, Printer, CheckCircle, X, Activity } from 'lucide-react';

export function BillingModal({ isOpen, onClose, invoice, onCreated }) {
  const { showToast } = useAuth();

  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [items, setItems] = useState([
    { description: 'OPD Consultation Fee', amount: 500 }
  ]);
  const [mode, setMode] = useState('UPI / GPay');
  const [status, setStatus] = useState('Paid');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const inv = invoice;

  const handleAddItem = () => {
    setItems([...items, { description: '', amount: 0 }]);
  };

  const handleRemoveItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, val) => {
    const updated = [...items];
    updated[idx][field] = field === 'amount' ? (Number(val) || 0) : val;
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName.trim()) {
      showToast('Patient name is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createBilling({
        patientName,
        phone,
        items,
        subtotal,
        total: subtotal,
        status,
        mode
      });
      const invoiceNum = created?.bill?._id || created?._id || created?.id || 'NEW';
      showToast(`Invoice #${invoiceNum} generated successfully!`);
      if (onCreated) onCreated(created?.bill || created);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to create invoice', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[94vh] sm:max-h-[90vh] flex flex-col pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        {/* Modal Top Bar */}
        <div className="no-print bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Receipt className="w-5 h-5 text-teal-400 shrink-0" />
            <h3 className="font-bold text-xs sm:text-sm truncate">
              {inv ? `Hospital Bill #${inv.id}` : 'Generate Billing Invoice'}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Print Receipt</span>
            </button>
            <button 
              type="button"
              onClick={onClose} 
              aria-label="Close billing modal"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Area */}
        <div className="printable-area p-4 sm:p-8 overflow-y-auto space-y-5 flex-1">
          {/* Hospital Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-slate-900 pb-4 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">MediCare 360 Multispecialty Hospital</h2>
                <p className="text-[11px] text-slate-500">42 Healthcare Blvd, Anna Nagar, Chennai - 600040</p>
                <p className="text-[10px] text-teal-700 font-semibold">GSTIN: 33AAACM1234F1Z9 • Tel: 1800-425-3600</p>
              </div>
            </div>
            <div className="sm:text-right text-xs shrink-0 flex sm:flex-col justify-between items-center sm:items-end">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                (inv?.status || status) === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {(inv?.status || status)}
              </span>
              <p className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5">Invoice: #{inv ? inv.id : 'DRAFT'}</p>
              <p className="text-slate-500 text-[10px] sm:text-[11px]">Date: {inv ? inv.date : new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Patient Details */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Billed To</span>
              <span className="font-bold text-slate-900 text-sm block">{inv ? inv.patientName : (patientName || 'Patient')}</span>
              <span className="text-slate-500 block">{inv ? inv.phone : (phone || '+91 99999 88888')}</span>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Mode</span>
              <span className="font-bold text-slate-800 text-sm block">{inv ? inv.mode : mode}</span>
            </div>
          </div>

          {inv ? (
            /* View existing invoice */
            <div className="space-y-4">
              <div className="table-scroll-wrapper rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-xs text-left min-w-[360px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Service / Item Description</th>
                      <th className="p-2.5 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inv.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-medium text-slate-800">{item.description}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">₹{item.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-end">
                <div className="w-full sm:w-56 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>₹{inv.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Taxes (CGST/SGST 0%):</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-1">
                    <span>Total Amount:</span>
                    <span className="text-sky-700">₹{inv.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Create new invoice form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="no-print min-h-[36px] px-2.5 py-1 text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer rounded-lg hover:bg-sky-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <input
                        type="text"
                        placeholder="Service or consultation description"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                        required
                      />
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 sm:w-28">
                          <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                            className="w-full pl-6 pr-2 py-2 rounded-lg border border-slate-300 bg-white text-sm font-bold text-right focus:ring-1 focus:ring-sky-500 outline-hidden"
                            required
                          />
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            aria-label={`Remove item ${idx + 1}`}
                            className="no-print min-h-[40px] min-w-[40px] flex items-center justify-center p-2 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white outline-hidden font-medium"
                  >
                    <option value="UPI / GPay">UPI / GPay / QR</option>
                    <option value="Cash">Cash at Counter</option>
                    <option value="Credit / Debit Card">Credit / Debit Card</option>
                    <option value="Health Insurance">Health Insurance / TPA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white outline-hidden font-medium"
                  >
                    <option value="Paid">Paid (Full Receipt)</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Total Payable:</span>
                <span className="text-lg font-black text-sky-700">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="no-print pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{submitting ? 'Generating...' : 'Issue & Print Receipt'}</span>
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between text-[11px] text-slate-400 gap-1 text-center sm:text-left">
            <p>Computer generated invoice. No signature required.</p>
            <p>Thank you for choosing MediCare 360.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
