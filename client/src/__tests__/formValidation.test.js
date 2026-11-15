import assert from 'assert';

console.log('====================================================');
console.log('  MediCare 360 - Frontend Form & Route Test Suite');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

// 1. Validation logic under test
function validateRegistration(formData) {
  const errors = {};
  if (!formData.name?.trim()) errors.name = 'Full name is required';
  if (!formData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Valid email is required';
  }
  if (!formData.password || formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  if (!formData.phone?.trim()) errors.phone = 'Phone number is required';
  return { isValid: Object.keys(errors).length === 0, errors };
}

function validateAppointmentBooking(booking) {
  const errors = {};
  if (!booking.doctorId) errors.doctorId = 'Please select a doctor';
  if (!booking.date) errors.date = 'Appointment date is required';
  if (!booking.slotTime) errors.slotTime = 'Please select a time slot';
  return { isValid: Object.keys(errors).length === 0, errors };
}

function checkRouteAccess(userRole, route) {
  const rolePermissions = {
    patient: ['/patient-dashboard', '/doctors', '/departments', '/about', '/services', '/contact'],
    doctor: ['/doctor-dashboard', '/doctors', '/departments', '/about', '/services', '/contact'],
    receptionist: ['/receptionist-dashboard', '/doctors', '/departments', '/about', '/services', '/contact'],
    admin: ['/admin-dashboard', '/patient-dashboard', '/doctor-dashboard', '/receptionist-dashboard', '/doctors', '/departments', '/about', '/services', '/contact']
  };

  if (!userRole) return { allowed: false, redirect: '/login' };
  const allowedRoutes = rolePermissions[userRole] || [];
  const allowed = allowedRoutes.includes(route);
  return { allowed, redirect: allowed ? route : `/${userRole}-dashboard` };
}

function validatePrescription(rx) {
  const errors = {};
  if (!rx.patientId) errors.patientId = 'Patient required';
  if (!rx.appointmentId) errors.appointmentId = 'Appointment required';
  if (!Array.isArray(rx.medicines) || rx.medicines.length === 0) {
    errors.medicines = 'At least one medicine is required';
  } else {
    rx.medicines.forEach((m, idx) => {
      if (!m.name || !m.dosage || !m.frequency) {
        errors[`medicine_${idx}`] = 'Medicine name, dosage, and frequency are required';
      }
    });
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

function formatINR(val) {
  return `₹${Number(val || 0).toLocaleString('en-IN')}`;
}

// Run Test Cases
test('validateRegistration - Valid patient data succeeds', () => {
  const result = validateRegistration({
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    password: 'password123',
    phone: '+91 98765 43210'
  });
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(Object.keys(result.errors).length, 0);
});

test('validateRegistration - Invalid email and short password fail', () => {
  const result = validateRegistration({
    name: 'Rajesh',
    email: 'invalid-email',
    password: '123',
    phone: ''
  });
  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.email);
  assert.ok(result.errors.password);
  assert.ok(result.errors.phone);
});

test('validateAppointmentBooking - Enforces doctor, date, and slot selection', () => {
  const valid = validateAppointmentBooking({
    doctorId: 'doc_123',
    date: '2026-11-20',
    slotTime: '10:30'
  });
  assert.strictEqual(valid.isValid, true);

  const invalid = validateAppointmentBooking({
    doctorId: '',
    date: '',
    slotTime: ''
  });
  assert.strictEqual(invalid.isValid, false);
  assert.strictEqual(Object.keys(invalid.errors).length, 3);
});

test('checkRouteAccess - Unauthenticated user redirected to /login', () => {
  const check = checkRouteAccess(null, '/patient-dashboard');
  assert.strictEqual(check.allowed, false);
  assert.strictEqual(check.redirect, '/login');
});

test('checkRouteAccess - Patient cannot access /admin-dashboard', () => {
  const check = checkRouteAccess('patient', '/admin-dashboard');
  assert.strictEqual(check.allowed, false);
  assert.strictEqual(check.redirect, '/patient-dashboard');
});

test('checkRouteAccess - Admin can access /admin-dashboard', () => {
  const check = checkRouteAccess('admin', '/admin-dashboard');
  assert.strictEqual(check.allowed, true);
});

test('validatePrescription - Enforces structured medicine items', () => {
  const valid = validatePrescription({
    patientId: 'p1',
    appointmentId: 'a1',
    medicines: [{ name: 'Amoxicillin', dosage: '500mg', frequency: '1-0-1' }]
  });
  assert.strictEqual(valid.isValid, true);

  const invalid = validatePrescription({
    patientId: 'p1',
    appointmentId: 'a1',
    medicines: []
  });
  assert.strictEqual(invalid.isValid, false);
});

test('formatINR - Uses Indian number format correctly', () => {
  assert.strictEqual(formatINR(450000), '₹4,50,000');
  assert.strictEqual(formatINR(1250), '₹1,250');
  assert.strictEqual(formatINR(320), '₹320');
});

console.log('\n====================================================');
console.log(`  Frontend Tests Complete: ${passed} passed, ${failed} failed`);
console.log('====================================================\n');

if (failed > 0) process.exit(1);
