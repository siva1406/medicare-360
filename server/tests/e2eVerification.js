import assert from 'assert';
import app from '../app.js';
import { EventEmitter } from 'events';
import { Appointment } from '../models/Appointment.js';
import { Bill } from '../models/Bill.js';
import { User } from '../models/User.js';

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

    app.handle(req, res);
  });
}

async function verifyAll() {
  console.log('====================================================');
  console.log('  Comprehensive E2E Feature Verification');
  console.log('====================================================\n');

  // 1. Health
  const rHealth = await request('GET', '/api/health');
  assert.strictEqual(rHealth.status, 200);
  assert.strictEqual(rHealth.body.status, 'healthy');
  console.log('  ✓ [PASS] Health check returns healthy');

  // 2. Departments
  const rDepts = await request('GET', '/api/departments');
  assert.strictEqual(rDepts.status, 200);
  assert.ok(rDepts.body.departments.length > 0);
  assert.ok(rDepts.body.departments[0].doctorCount !== undefined);
  assert.ok(rDepts.body.departments[0].doctorsCount !== undefined);
  assert.ok(rDepts.body.departments[0].head);
  console.log('  ✓ [PASS] Departments return doctorsCount and head consultant');

  // 3. Doctors
  const rDocs = await request('GET', '/api/doctors');
  assert.strictEqual(rDocs.status, 200);
  assert.ok(rDocs.body.doctors.length > 0);
  assert.strictEqual(rDocs.body.doctors[0].available, true);
  assert.ok(rDocs.body.doctors[0].consultationFee);
  assert.ok(rDocs.body.doctors[0].fee);
  assert.ok(rDocs.body.doctors[0].avatar);
  console.log('  ✓ [PASS] Doctors directory populated with availability & fee fallbacks');

  // 4. AI Recommender
  const rRec = await request('POST', '/api/ai/recommend', {
    symptoms: 'Chest tightness and shortness of breath'
  });
  assert.strictEqual(rRec.status, 200);
  assert.strictEqual(rRec.body.recommendedDepartment, 'Cardiology');
  assert.ok(rRec.body.doctors.length > 0);
  assert.ok(rRec.body.advice);
  console.log('  ✓ [PASS] AI Recommender returns recommendedDepartment, doctors, and advice');

  // 5. Online Guest Booking (Unauthenticated)
  const testDoctor = rDocs.body.doctors[0];
  const rGuestBook = await request('POST', '/api/appointments', {
    doctorId: testDoctor.id,
    date: '2026-12-25',
    slotTime: '11:00',
    time: '11:00 AM',
    patientName: 'Guest Patient Online',
    patientPhone: '+91 98888 77777',
    reason: 'Emergency Cardiology Consultation'
  });
  assert.strictEqual(rGuestBook.status, 201);
  assert.strictEqual(rGuestBook.body.appointment.slotTime, '11:00');
  console.log('  ✓ [PASS] Guest online booking succeeds without requiring JWT token');

  // 6. Cleanup test booking
  await Appointment.deleteMany({ date: '2026-12-25' });
  console.log('  ✓ [PASS] Cleaned up temporary test appointment');

  console.log('\n====================================================');
  console.log('  All Features Verified Successfully!');
  console.log('====================================================');
}

verifyAll().catch((err) => {
  console.error('E2E Verification Failed:', err);
  process.exit(1);
});

