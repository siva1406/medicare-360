import PDFDocument from 'pdfkit';
import { Bill } from '../models/Bill.js';
import { User } from '../models/User.js';
import { Appointment } from '../models/Appointment.js';
import { Notification } from '../models/Notification.js';
import { logAudit } from '../middleware/audit.js';

export const createBill = async (req, res, next) => {
  try {
    let { patientId, appointmentId, items, paymentMode = 'none', paidAmount = 0, status, mode, phone } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid items array is required.'
      });
    }

    if (!patientId) {
      const searchPhone = phone || req.body.patientPhone;
      let patient = null;
      if (searchPhone) {
        patient = await User.findOne({ phone: searchPhone, role: 'patient' });
      }
      if (!patient && req.body.patientName) {
        patient = await User.findOne({ name: { $regex: req.body.patientName, $options: 'i' }, role: 'patient' });
      }
      if (!patient) {
        patient = await User.findOne({ role: 'patient' });
      }
      if (patient) {
        patientId = patient._id;
      }
    }

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'patientId or valid patient reference is required.'
      });
    }

    const totalAmount = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const resolvedMode = (mode || paymentMode || 'cash').toLowerCase().includes('upi') ? 'upi' 
      : (mode || paymentMode || 'cash').toLowerCase().includes('card') ? 'card' 
      : (mode || paymentMode || 'cash').toLowerCase().includes('cash') ? 'cash' : 'none';

    let paid = Number(paidAmount || 0);
    if (!paid && (status === 'Paid' || status === 'paid')) {
      paid = totalAmount;
    }

    let paymentStatus = 'unpaid';
    if (paid >= totalAmount && totalAmount > 0) {
      paymentStatus = 'paid';
    } else if (paid > 0) {
      paymentStatus = 'partially_paid';
    }

    const bill = await Bill.create({
      patientId,
      appointmentId: appointmentId || null,
      items,
      totalAmount,
      paidAmount: paid,
      paymentStatus,
      paymentMode: resolvedMode,
      createdBy: req.user ? req.user._id : null
    });

    // Notify patient
    await Notification.create({
      userId: patientId,
      message: `A new hospital invoice of ₹${totalAmount.toLocaleString('en-IN')} has been generated. Status: ${paymentStatus}.`,
      type: 'billing'
    });

    await logAudit(req, 'CREATE_BILL', 'Bill', {
      billId: bill._id,
      patientId,
      totalAmount,
      paymentStatus
    });

    const populated = await Bill.findById(bill._id)
      .populate('patientId', 'name email phone')
      .populate('createdBy', 'name role');

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      bill: populated
    });
  } catch (err) {
    next(err);
  }
};

export const getBills = async (req, res, next) => {
  try {
    const { patientId, paymentStatus } = req.query;
    const filter = {};

    if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    } else if (patientId) {
      filter.patientId = patientId;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    const bills = await Bill.find(filter)
      .populate('patientId', 'name email phone')
      .populate('appointmentId')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bills.length,
      bills
    });
  } catch (err) {
    next(err);
  }
};

export const recordPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paidAmount, paymentMode, mode, transactionId } = req.body;

    const bill = await Bill.findById(id).populate('patientId', 'name email phone');
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    const amount = Number(paidAmount || bill.totalAmount);
    bill.paidAmount = amount;
    bill.paymentMode = paymentMode || mode || 'card';
    bill.transactionId = transactionId || `TXN-${Date.now().toString().slice(-8)}`;

    if (amount >= bill.totalAmount) {
      bill.paymentStatus = 'paid';
    } else if (amount > 0) {
      bill.paymentStatus = 'partially_paid';
    }

    await bill.save();

    await Notification.create({
      userId: bill.patientId._id,
      message: `Payment of ₹${amount.toLocaleString('en-IN')} received via ${bill.paymentMode.toUpperCase()} for Invoice #${bill._id.toString().slice(-6)}.`,
      type: 'billing'
    });

    await logAudit(req, 'RECORD_PAYMENT', 'Bill', {
      billId: id,
      amount,
      paymentMode: bill.paymentMode,
      paymentStatus: bill.paymentStatus
    });

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      bill
    });
  } catch (err) {
    next(err);
  }
};

export const getInvoicePdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bill = await Bill.findById(id)
      .populate('patientId', 'name email phone')
      .populate('createdBy', 'name role');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // RBAC: Patient only download own
    if (req.user.role === 'patient' && bill.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only download your own invoices.'
      });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Invoice-${bill._id.toString().slice(-6)}.pdf`
    );

    doc.pipe(res);

    // Header
    doc.fillColor('#0284c7').fontSize(22).text('MediCare 360', 50, 50, { bold: true });
    doc.fillColor('#64748b').fontSize(10).text('Official Hospital Tax Invoice / Receipt', 50, 75);
    doc.text('GSTIN: 27AABCM3600E1Z5 | Helpline: +91 800-MEDICARE', 50, 90);

    doc.moveTo(50, 108).lineTo(550, 108).strokeColor('#0284c7').lineWidth(1.5).stroke();

    // Invoice Meta
    const startY = 125;
    doc.fillColor('#0f172a').fontSize(11).text(`INVOICE #: INV-${bill._id.toString().slice(-8).toUpperCase()}`, 50, startY, { bold: true });
    doc.fillColor('#475569').fontSize(9).text(`Date: ${new Date(bill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`);
    doc.text(`Payment Status: ${bill.paymentStatus.toUpperCase()}`);
    doc.text(`Payment Mode: ${(bill.paymentMode || 'N/A').toUpperCase()}`);

    // Patient Meta
    doc.fillColor('#0f172a').fontSize(11).text('BILLED TO:', 320, startY, { bold: true });
    doc.fillColor('#475569').fontSize(9).text(`Patient Name: ${bill.patientId.name}`);
    doc.text(`Phone: ${bill.patientId.phone || 'N/A'}`);
    doc.text(`Email: ${bill.patientId.email}`);

    doc.moveTo(50, 195).lineTo(550, 195).strokeColor('#e2e8f0').lineWidth(1).stroke();

    // Line items
    let tableY = 215;
    doc.fillColor('#1e293b').fontSize(10).text('ITEM DESCRIPTION', 50, tableY, { bold: true });
    doc.text('AMOUNT (INR)', 450, tableY, { bold: true, align: 'right' });

    doc.moveTo(50, tableY + 15).lineTo(550, tableY + 15).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    tableY += 25;

    bill.items.forEach((item, idx) => {
      doc.fillColor('#0f172a').fontSize(9).text(`${idx + 1}. ${item.description}`, 50, tableY);
      doc.fillColor('#0f172a').fontSize(9).text(`₹${Number(item.amount).toLocaleString('en-IN')}`, 450, tableY, { align: 'right' });
      tableY += 22;
    });

    tableY = Math.max(tableY + 20, 360);
    doc.moveTo(50, tableY).lineTo(550, tableY).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    tableY += 15;

    // Totals
    doc.fillColor('#0f172a').fontSize(11).text('Subtotal:', 350, tableY, { bold: true });
    doc.text(`₹${bill.totalAmount.toLocaleString('en-IN')}`, 450, tableY, { align: 'right', bold: true });
    tableY += 20;

    doc.text('Amount Paid:', 350, tableY, { bold: true });
    doc.fillColor('#16a34a').text(`₹${(bill.paidAmount || 0).toLocaleString('en-IN')}`, 450, tableY, { align: 'right', bold: true });
    tableY += 20;

    const balance = Math.max(0, bill.totalAmount - (bill.paidAmount || 0));
    doc.fillColor('#dc2626').text('Balance Due:', 350, tableY, { bold: true });
    doc.text(`₹${balance.toLocaleString('en-IN')}`, 450, tableY, { align: 'right', bold: true });

    // Footer note
    doc.fillColor('#94a3b8').fontSize(8).text(
      'Thank you for trusting MediCare 360. For any billing inquiries, please contact accounts@medicare360.com or visit the reception counter.',
      50,
      680,
      { align: 'center', width: 500 }
    );

    doc.end();

    await logAudit(req, 'DOWNLOAD_INVOICE_PDF', 'Bill', { billId: id });
  } catch (err) {
    next(err);
  }
};
