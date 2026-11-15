import assert from 'assert';
import app from '../app.js';
import { EventEmitter } from 'events';
import { Appointment } from '../models/Appointment.js';
import { Bill } from '../models/Bill.js';

// In-process mock HTTP dispatcher: dispatches directly to express without opening TCP ports!
function request(method, urlPath, body = null, headers = {}) {
  return new Promise((resolve) => {
    const [pathPart, queryPart] = urlPath.split('?');
    const query = {};
    if (queryPart) {
      new URLSearchParams(queryPart).forEach((v, k) => {
        query[k] = v;
      });
    }

    const req = new EventEmitter();
    req.method = method;
    req.url = urlPath;
    req.originalUrl = urlPath;
    req.path = pathPart;
    req.query = query;
    req.headers = {
      'content-type': 'application/json',
      ...Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]))
    };
    req.body = body || {};
    req.connection = { remoteAddress: '127.0.0.1' };
    req.socket = req.connection;
    req.ip = '127.0.0.1';

    const res = new EventEmitter();
    res.statusCode = 200;
    res._headers = {};
    let responseBody = '';

    res.setHeader = (k, v) => {
      res._headers[k.toLowerCase()] = v;
    };
    res.getHeader = (k) => res._headers[k.toLowerCase()];
    res.header = res.setHeader;

    res.status = (code) => {
      res.statusCode = code;
      return res;
    };

    res.sendStatus = (code) => {
      res.statusCode = code;
      resolve({ status: code, body: null, headers: res._headers });
    };

    res.json = (data) => {
      res.setHeader('content-type', 'application/json');
      resolve({ status: res.statusCode, body: data, headers: res._headers });
    };

    res.send = (data) => {
      if (typeof data === 'object') {
        return res.json(data);
      }
      resolve({ status: res.statusCode, body: data, headers: res._headers });
    };

    res.end = (chunk) => {
      if (chunk) responseBody += chunk;
      resolve({ status: res.statusCode, body: responseBody, headers: res._headers });
    };

    res.download = (filePath, fileName) => {
      resolve({ status: 200, body: `Downloading ${fileName}`, headers: res._headers });
    };

    app.handle(req, res);
  });
}

async function runAllTests() {
  console.log('====================================================');
  console.log('  MediCare 360 - Automated In-Memory Test Suite');
  console.log('====================================================\n');

  // Clean test artifacts to ensure test suite is strictly idempotent across multiple runs
  try {
    await Appointment.deleteMany({ date: '2026-12-18' });
    await Bill.deleteMany({ transactionId: 'UPI-TEST-12345678' });
  } catch (err) {}

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  }

  let adminToken = '';
  let patientToken = '';
  let doctorToken = '';
  let receptionistToken = '';
  let patientId = '';
  let doctorId = '';

  console.log('--- Suite 1: Authentication & JWT ---');
  await test('POST /api/auth/login - Admin login returns valid JWT token and user info', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'admin@medicare360.com',
      password: 'admin123'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.role, 'admin');
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.passwordHash, undefined, 'passwordHash must never be exposed');
    adminToken = res.body.token;
  });

  await test('POST /api/auth/login - Patient login returns valid JWT and patient role', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'patient@medicare360.com',
      password: 'patient123'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.role, 'patient');
    patientToken = res.body.token;
    patientId = res.body.user.id || res.body.user._id;
  });

  await test('POST /api/auth/login - Doctor login returns doctor profile and role', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'doctor@medicare360.com',
      password: 'doctor123'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.role, 'doctor');
    doctorToken = res.body.token;
    doctorId = res.body.user.id || res.body.user._id;
  });

  await test('POST /api/auth/login - Receptionist login returns receptionist role', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'receptionist@medicare360.com',
      password: 'reception123'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.role, 'receptionist');
    receptionistToken = res.body.token;
  });

  await test('POST /api/auth/login - Rejects invalid password with 401', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'admin@medicare360.com',
      password: 'wrong_password_xyz'
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  await test('GET /api/auth/me - Authenticates and returns current user info', async () => {
    const res = await request('GET', '/api/auth/me', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.email, 'admin@medicare360.com');
  });

  console.log('\n--- Suite 2: Role-Based Access Control (RBAC) ---');
  await test('GET /api/admin/stats - Admin can access admin stats with 4 target metrics', async () => {
    const res = await request('GET', '/api/admin/stats', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.stats.formatted.totalPatients, '1,250');
    assert.strictEqual(res.body.stats.formatted.totalDoctors, '45');
    assert.strictEqual(res.body.stats.formatted.totalAppointments, '320');
    assert.strictEqual(res.body.stats.formatted.totalRevenue, '₹4,50,000');
  });

  await test('GET /api/admin/stats - Patient is blocked with 403 Forbidden', async () => {
    const res = await request('GET', '/api/admin/stats', null, {
      Authorization: `Bearer ${patientToken}`
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  await test('POST /api/prescriptions - Patient cannot create digital prescriptions (Doctor only)', async () => {
    const res = await request('POST', '/api/prescriptions', {
      appointmentId: 'some-apt-id',
      patientId,
      medicines: [{ name: 'Test Med', dosage: '1 tablet', frequency: 'daily', duration: '1 day' }]
    }, {
      Authorization: `Bearer ${patientToken}`
    });
    assert.strictEqual(res.status, 403);
  });

  console.log('\n--- Suite 3: Appointment Booking & Conflict Detection ---');
  const testDate = '2026-12-18';
  const testSlot = '10:00';

  await test('POST /api/appointments - Successfully books open appointment slot', async () => {
    const res = await request('POST', '/api/appointments', {
      doctorId,
      date: testDate,
      slotTime: testSlot,
      reason: 'General Cardiac Assessment'
    }, {
      Authorization: `Bearer ${patientToken}`
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.appointment.slotTime, testSlot);
  });

  await test('POST /api/appointments - Prevents double-booking with 409 Conflict', async () => {
    // Attempt to book the exact same doctor, date, and slot
    const res = await request('POST', '/api/appointments', {
      doctorId,
      date: testDate,
      slotTime: testSlot,
      reason: 'Duplicate Booking Attempt'
    }, {
      Authorization: `Bearer ${patientToken}`
    });
    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.success, false);
  });

  console.log('\n--- Suite 4: Smart Doctor Recommendation & AI Boundaries ---');
  await test('GET /api/doctors/recommend - Provides ranked doctors with match scores and administrative notice', async () => {
    const res = await request('GET', '/api/doctors/recommend?department=Cardiology&date=2026-12-16');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.recommendations.length > 0);
    assert.ok(res.body.clinicalNotice.includes('Clinical diagnoses, prescriptions, and all medical decisions remain exclusively with licensed medical doctors'));
    assert.ok(res.body.recommendations[0].matchPercentage > 70);
    assert.ok(res.body.recommendations[0].recommendationReasons.length > 0);
  });

  console.log('\n--- Suite 5: Billing & Revenue Calculation ---');
  let newBillId = '';
  await test('POST /api/billing - Receptionist creates hospital invoice with computed total', async () => {
    const res = await request('POST', '/api/billing', {
      patientId,
      items: [
        { description: 'Cardiology Specialist Consultation', amount: 1200 },
        { description: 'ECG 12-Lead Diagnostic Test', amount: 800 }
      ]
    }, {
      Authorization: `Bearer ${receptionistToken}`
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.bill.totalAmount, 2000);
    assert.strictEqual(res.body.bill.paymentStatus, 'unpaid');
    newBillId = res.body.bill._id || res.body.bill.id;
  });

  await test('PATCH /api/billing/:id/pay - Records payment via UPI and updates status to paid', async () => {
    const res = await request('PATCH', `/api/billing/${newBillId}/pay`, {
      paidAmount: 2000,
      paymentMode: 'upi',
      transactionId: 'UPI-TEST-12345678'
    }, {
      Authorization: `Bearer ${receptionistToken}`
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.bill.paymentStatus, 'paid');
    assert.strictEqual(res.body.bill.paidAmount, 2000);
  });

  console.log('\n====================================================');
  console.log(`  Tests Complete: ${passed} passed, ${failed} failed`);
  console.log('====================================================\n');

  try {
    await Appointment.deleteMany({ date: '2026-12-18' });
    await Bill.deleteMany({ transactionId: 'UPI-TEST-12345678' });
  } catch (err) {}

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
