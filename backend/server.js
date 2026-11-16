import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Built-in CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json({ limit: '10mb' }));

// Helper to read and write database
function readDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { users: [], doctors: [], appointments: [], departments: [], prescriptions: [], medicalReports: [], billings: [], stats: {} };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return false;
  }
}

// ======================== AUTH ROUTES ========================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();

  const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials. User not found.' });
  }

  // Support demo passwords or exact match
  if (user.password && user.password !== password && password !== 'demo') {
    return res.status(401).json({ message: 'Incorrect password.' });
  }

  // Include doctor details if role is doctor
  let extraInfo = {};
  if (user.role === 'doctor') {
    const docProfile = db.doctors.find(d => d.id === user.id || d.email === user.email);
    if (docProfile) {
      extraInfo = { doctorProfile: docProfile };
    }
  }

  res.json({
    token: `token_${user.id}_${Date.now()}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      department: user.department,
      avatar: user.avatar,
      ...extraInfo
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, age, gender, bloodGroup, address, emergencyContact } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const db = readDB();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ message: 'An account with this email already exists.' });
  }

  const newPatient = {
    id: `u-patient-${Date.now()}`,
    name,
    email: email.trim(),
    password,
    role: 'patient',
    phone: phone || '',
    age: parseInt(age) || 30,
    gender: gender || 'Not Specified',
    bloodGroup: bloodGroup || 'O+',
    address: address || '',
    emergencyContact: emergencyContact || '',
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`
  };

  db.users.push(newPatient);
  db.stats.totalPatients = (db.stats.totalPatients || 1250) + 1;
  writeDB(db);

  res.status(201).json({
    message: 'Patient registration successful',
    token: `token_${newPatient.id}_${Date.now()}`,
    user: newPatient
  });
});

// ======================== DOCTORS ROUTES ========================
app.get('/api/doctors', (req, res) => {
  const db = readDB();
  const { department, search, availableOnly } = req.query;

  let results = [...db.doctors];
  if (department && department !== 'All') {
    results = results.filter(d => d.department.toLowerCase() === department.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.department.toLowerCase().includes(q) ||
      (d.qualification && d.qualification.toLowerCase().includes(q))
    );
  }
  if (availableOnly === 'true') {
    results = results.filter(d => d.available);
  }

  res.json(results);
});

app.post('/api/doctors', (req, res) => {
  const db = readDB();
  const newDoctor = {
    id: `u-doc-${Date.now()}`,
    ...req.body,
    rating: req.body.rating || 5.0,
    available: req.body.available !== undefined ? req.body.available : true,
    avatar: req.body.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
  };

  db.doctors.push(newDoctor);

  // Also add to users table for login
  db.users.push({
    id: newDoctor.id,
    name: newDoctor.name,
    email: newDoctor.email || `dr.${newDoctor.name.toLowerCase().replace(/[^a-z]/g, '')}@medicare360.com`,
    password: 'doctor',
    role: 'doctor',
    phone: newDoctor.phone || '+91 98400 00000',
    department: newDoctor.department,
    avatar: newDoctor.avatar
  });

  db.stats.totalDoctors = (db.stats.totalDoctors || 45) + 1;
  writeDB(db);

  res.status(201).json(newDoctor);
});

app.put('/api/doctors/:id', (req, res) => {
  const db = readDB();
  const index = db.doctors.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  db.doctors[index] = { ...db.doctors[index], ...req.body };
  writeDB(db);
  res.json(db.doctors[index]);
});

app.delete('/api/doctors/:id', (req, res) => {
  const db = readDB();
  db.doctors = db.doctors.filter(d => d.id !== req.params.id);
  db.users = db.users.filter(u => u.id !== req.params.id);
  writeDB(db);
  res.json({ message: 'Doctor deleted successfully' });
});

// ======================== DEPARTMENTS ROUTES ========================
app.get('/api/departments', (req, res) => {
  const db = readDB();
  res.json(db.departments);
});

app.post('/api/departments', (req, res) => {
  const db = readDB();
  const newDept = {
    id: `dep-${Date.now()}`,
    ...req.body,
    doctorsCount: req.body.doctorsCount || 1
  };
  db.departments.push(newDept);
  writeDB(db);
  res.status(201).json(newDept);
});

// ======================== APPOINTMENTS ROUTES ========================
app.get('/api/appointments', (req, res) => {
  const db = readDB();
  const { role, userId, doctorId, patientId, status } = req.query;

  let results = [...db.appointments];
  if (patientId) {
    results = results.filter(a => a.patientId === patientId);
  } else if (doctorId) {
    results = results.filter(a => a.doctorId === doctorId);
  } else if (role === 'doctor' && userId) {
    results = results.filter(a => a.doctorId === userId);
  } else if (role === 'patient' && userId) {
    results = results.filter(a => a.patientId === userId);
  }

  if (status && status !== 'All') {
    results = results.filter(a => a.status.toLowerCase() === status.toLowerCase());
  }

  // Sort by date descending
  results.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(results);
});

app.post('/api/appointments', (req, res) => {
  const db = readDB();
  const { patientId, patientName, patientPhone, doctorId, doctorName, department, date, time, slotTime, reason, type } = req.body;
  const appointmentTime = time || slotTime;
  const doctor = db.doctors.find(d => d.id === doctorId || d.name === doctorName) || db.doctors[0];
  const finalDoctorName = doctorName || (doctor ? doctor.name : 'Dr. Specialist');

  if (!finalDoctorName || !date || !appointmentTime) {
    return res.status(400).json({ message: 'Doctor, date and time slot are required.' });
  }

  const newAppointment = {
    id: `apt-${Date.now()}`,
    patientId: patientId || 'u-patient-walkin',
    patientName: patientName || 'Walk-in Patient',
    patientPhone: patientPhone || '+91 99999 88888',
    doctorId: doctor ? doctor.id : (doctorId || 'u-doc-1'),
    doctorName: finalDoctorName,
    department: department || (doctor ? doctor.department : 'General Medicine'),
    date,
    time: appointmentTime,
    slotTime: appointmentTime,
    type: type || 'Online Booking',
    status: 'Approved',
    reason: reason || 'General Consultation',
    fee: doctor ? doctor.fee : 500,
    paymentStatus: type === 'Walk-in' ? 'Paid' : 'Pending'
  };

  db.appointments.unshift(newAppointment);
  db.stats.totalAppointments = (db.stats.totalAppointments || 320) + 1;
  writeDB(db);

  res.status(201).json(newAppointment);
});

app.put('/api/appointments/:id/status', (req, res) => {
  const { status, notes } = req.body;
  const db = readDB();
  const apt = db.appointments.find(a => a.id === req.params.id);

  if (!apt) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  apt.status = status || apt.status;
  if (notes) apt.notes = notes;
  writeDB(db);

  res.json(apt);
});

// ======================== DIGITAL PRESCRIPTIONS ROUTES ========================
app.get('/api/prescriptions', (req, res) => {
  const db = readDB();
  const { patientId, doctorId } = req.query;

  let results = [...db.prescriptions];
  if (patientId) {
    results = results.filter(p => p.patientId === patientId);
  }
  if (doctorId) {
    results = results.filter(p => p.doctorId === doctorId);
  }

  res.json(results);
});

app.post('/api/prescriptions', (req, res) => {
  const db = readDB();
  const { appointmentId, patientId, patientName, doctorId, doctorName, diagnosis, medicines, doctorAdvice, followUpDate } = req.body;

  const newRx = {
    id: `rx-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    appointmentId: appointmentId || '',
    patientId: patientId || 'u-patient-1',
    patientName: patientName || 'Patient',
    doctorId: doctorId || 'u-doc-1',
    doctorName: doctorName || 'Dr. Priya Sharma',
    date: new Date().toISOString().split('T')[0],
    diagnosis: diagnosis || 'Clinical Examination',
    medicines: medicines || [],
    doctorAdvice: doctorAdvice || 'Take plenty of fluids and rest.',
    followUpDate: followUpDate || 'After 7 days'
  };

  db.prescriptions.unshift(newRx);

  // If tied to appointment, mark appointment as Completed
  if (appointmentId) {
    const apt = db.appointments.find(a => a.id === appointmentId);
    if (apt) apt.status = 'Completed';
  }

  writeDB(db);
  res.status(201).json(newRx);
});

// ======================== MEDICAL REPORTS ROUTES ========================
app.get('/api/reports', (req, res) => {
  const db = readDB();
  const { patientId } = req.query;

  let results = [...db.medicalReports];
  if (patientId) {
    results = results.filter(r => r.patientId === patientId);
  }

  res.json(results);
});

app.post('/api/reports', (req, res) => {
  const db = readDB();
  const { patientId, patientName, title, department, doctor, summary, fileType } = req.body;

  const newReport = {
    id: `rep-${Date.now()}`,
    patientId: patientId || 'u-patient-1',
    patientName: patientName || 'Rajesh Kumar',
    title: title || 'Clinical Investigation Report',
    date: new Date().toISOString().split('T')[0],
    department: department || 'Diagnostics',
    doctor: doctor || 'Dr. Priya Sharma',
    fileType: fileType || 'PDF',
    status: 'Reviewed',
    summary: summary || 'No abnormalities detected.',
    url: 'https://placehold.co/600x400/0284c7/ffffff?text=' + encodeURIComponent(title || 'Lab Report')
  };

  db.medicalReports.unshift(newReport);
  writeDB(db);

  res.status(201).json(newReport);
});

// ======================== BILLING ROUTES ========================
app.get('/api/billing', (req, res) => {
  const db = readDB();
  const { patientId } = req.query;

  let results = [...db.billings];
  if (patientId) {
    results = results.filter(b => b.patientId === patientId);
  }
  res.json(results);
});

app.post('/api/billing', (req, res) => {
  const db = readDB();
  const { patientId, patientName, phone, items, mode, status } = req.body;

  const calculatedSubtotal = (items || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const newInvoice = {
    id: `inv-${Date.now().toString().slice(-4)}`,
    patientId: patientId || 'u-patient-walkin',
    patientName: patientName || 'Walk-in Patient',
    phone: phone || '+91 99999 00000',
    date: new Date().toISOString().split('T')[0],
    items: items || [{ description: 'General Consultation', amount: 500 }],
    subtotal: calculatedSubtotal,
    tax: 0,
    total: calculatedSubtotal,
    status: status || 'Paid',
    mode: mode || 'Cash'
  };

  db.billings.unshift(newInvoice);
  if (newInvoice.status === 'Paid') {
    db.stats.totalRevenue = (db.stats.totalRevenue || 450000) + calculatedSubtotal;
  }
  writeDB(db);

  res.status(201).json(newInvoice);
});

app.put('/api/billing/:id/pay', (req, res) => {
  const db = readDB();
  const invoice = db.billings.find(b => b.id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  invoice.status = 'Paid';
  invoice.mode = req.body.mode || invoice.mode || 'Cash';
  db.stats.totalRevenue = (db.stats.totalRevenue || 450000) + invoice.total;
  writeDB(db);

  res.json(invoice);
});

// ======================== ADMIN DASHBOARD STATS ========================
app.get('/api/admin/stats', (req, res) => {
  const db = readDB();
  res.json({
    totalPatients: db.stats.totalPatients || 1250,
    totalDoctors: db.stats.totalDoctors || 45,
    totalAppointments: db.stats.totalAppointments || 320,
    totalRevenue: db.stats.totalRevenue || 450000,
    monthlyAppointments: db.stats.monthlyAppointments,
    departmentStats: db.stats.departmentStats,
    recentPatients: db.users.filter(u => u.role === 'patient').slice(-5).reverse(),
    recentAppointments: db.appointments.slice(0, 5)
  });
});

// ======================== SMART DOCTOR RECOMMENDATION (AI / RULE-BASED) ========================
app.post('/api/ai/recommend', (req, res) => {
  const { symptoms, age, notes } = req.body;
  const db = readDB();

  const symLower = (symptoms || '').toLowerCase();

  let targetDept = 'General Medicine';
  let advice = 'Based on your overall symptoms, a primary assessment by our General Medicine specialist is recommended.';

  if (symLower.includes('chest') || symLower.includes('heart') || symLower.includes('palpitation') || symLower.includes('breath') || symLower.includes('bp') || symLower.includes('hypertension')) {
    targetDept = 'Cardiology';
    advice = 'Detected cardiovascular indicators (chest symptoms/palpitations/hypertension). An evaluation by a Cardiologist with an ECG is strongly recommended.';
  } else if (symLower.includes('headache') || symLower.includes('migraine') || symLower.includes('dizzy') || symLower.includes('numb') || symLower.includes('seizure') || symLower.includes('spine')) {
    targetDept = 'Neurology';
    advice = 'Neurological symptoms detected (persistent headaches, vertigo or nerve numbness). Consultation with a Neurologist is advised.';
  } else if (symLower.includes('joint') || symLower.includes('knee') || symLower.includes('bone') || symLower.includes('fracture') || symLower.includes('back pain') || symLower.includes('shoulder')) {
    targetDept = 'Orthopedics';
    advice = 'Musculoskeletal & joint concerns detected. An Orthopedic specialist can assess mobility and bone structure.';
  } else if (symLower.includes('child') || symLower.includes('infant') || symLower.includes('baby') || (age && Number(age) < 14)) {
    targetDept = 'Pediatrics';
    advice = 'Pediatric assessment recommended for children and young adolescents for gentle, age-tailored care.';
  } else if (symLower.includes('skin') || symLower.includes('rash') || symLower.includes('acne') || symLower.includes('hair') || symLower.includes('allergy') || symLower.includes('itch')) {
    targetDept = 'Dermatology';
    advice = 'Dermatological symptoms detected. A specialist will assess skin lesions, allergy, or hair health.';
  } else if (symLower.includes('pregnant') || symLower.includes('maternity') || symLower.includes('period') || symLower.includes('pelvic')) {
    targetDept = 'Gynecology & Obstetrics';
    advice = 'Gynecological care recommended for women’s wellness, prenatal assessment and hormonal balance.';
  }

  // Find matching available doctors
  const matchedDoctors = db.doctors.filter(d => d.department.toLowerCase().includes(targetDept.toLowerCase().split(' ')[0]));

  res.json({
    recommendedDepartment: targetDept,
    advice,
    doctors: matchedDoctors.length > 0 ? matchedDoctors : db.doctors.slice(0, 3)
  });
});

// Serve frontend static build if available (supports client/dist and frontend/dist)
const clientDist = path.join(__dirname, '..', 'client', 'dist');
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
const staticDist = fs.existsSync(clientDist) ? clientDist : (fs.existsSync(frontendDist) ? frontendDist : null);

if (staticDist) {
  app.use(express.static(staticDist, { maxAge: '1d', etag: true }));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return;
    }
    if (path.extname(req.path)) {
      return res.status(404).send('Static asset not found');
    }
    res.sendFile(path.join(staticDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`MediCare 360 System running on http://localhost:${PORT}`);
});
