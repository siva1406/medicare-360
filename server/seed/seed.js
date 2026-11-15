import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { PatientProfile } from '../models/PatientProfile.js';
import { DoctorProfile } from '../models/DoctorProfile.js';
import { Department } from '../models/Department.js';
import { Availability } from '../models/Availability.js';
import { Appointment } from '../models/Appointment.js';
import { Prescription } from '../models/Prescription.js';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { MedicalReport } from '../models/MedicalReport.js';
import { Bill } from '../models/Bill.js';
import { Notification } from '../models/Notification.js';

const DEPARTMENT_DATA = [
  { name: 'Cardiology', description: 'Comprehensive heart care, cardiovascular surgery, and arrhythmia treatments.', icon: 'Heart' },
  { name: 'Neurology', description: 'Advanced diagnosis and treatment for brain, spine, and nervous system disorders.', icon: 'Brain' },
  { name: 'Orthopedics', description: 'Specialized joint replacements, sports injuries, and trauma rehabilitation.', icon: 'Bone' },
  { name: 'Pediatrics', description: 'Compassionate pediatric care from newborns to adolescents.', icon: 'Baby' },
  { name: 'Dermatology', description: 'Clinical and cosmetic skin care, laser treatments, and allergy testing.', icon: 'Sparkles' },
  { name: 'General Medicine', description: 'Holistic preventive healthcare, lifestyle diseases, and chronic management.', icon: 'Activity' },
  { name: 'Oncology', description: 'Multi-disciplinary cancer therapy, precision oncology, and supportive care.', icon: 'Shield' },
  { name: 'Gastroenterology', description: 'Advanced endoscopic procedures, liver health, and digestive wellness.', icon: 'Stomach' },
  { name: 'Ophthalmology', description: 'Complete eye care, cataract surgery, and retinal laser therapies.', icon: 'Eye' },
  { name: 'ENT', description: 'Ear, nose, throat and micro-laryngeal surgical treatments.', icon: 'Headphones' }
];

const DOCTOR_NAMES = [
  'Dr. Sarah Jenkins', 'Dr. Rajesh Sharma', 'Dr. Emily Chen', 'Dr. Marcus Vance', 'Dr. Sunita Patel',
  'Dr. Vikram Rao', 'Dr. Anita Desai', 'Dr. David Kim', 'Dr. Neha Gupta', 'Dr. Robert Taylor',
  'Dr. Priya Nair', 'Dr. Michael Chang', 'Dr. Arvind Swamy', 'Dr. Kavita Reddy', 'Dr. James Wilson',
  'Dr. Meera Iyer', 'Dr. Sanjay Verma', 'Dr. Lisa Wong', 'Dr. Deepak Malhotra', 'Dr. Rachel Adams',
  'Dr. Siddharth Sen', 'Dr. Pooja Bhatia', 'Dr. John Miller', 'Dr. Ananya Roy', 'Dr. Brian Clark',
  'Dr. Suresh Joshi', 'Dr. Shalini Saxena', 'Dr. Kevin Harris', 'Dr. Ritu Chopra', 'Dr. Thomas White',
  'Dr. Harish Kumar', 'Dr. Divya Nambiar', 'Dr. Christopher Lee', 'Dr. Swati Bansal', 'Dr. Paul Walker',
  'Dr. Alok Nath', 'Dr. Nandini Menon', 'Dr. Daniel Scott', 'Dr. Manisha Kulkarni', 'Dr. Andrew Green',
  'Dr. Tarun Khanna', 'Dr. Sneha Pillai', 'Dr. Richard Moore', 'Dr. Vandana Agarwal', 'Dr. George Baker'
];

async function seedDatabase() {
  try {
    console.log('--- Starting MediCare 360 Database Seeder ---');
    await connectDB();

    // Clean existing data
    console.log('Clearing old collections...');
    await Promise.all([
      User.updateMany({}, { $set: { isActive: false } }),
      Department.find(),
      Appointment.find()
    ]);

    // 1. Seed Departments
    console.log('Seeding departments...');
    const createdDepts = [];
    for (const d of DEPARTMENT_DATA) {
      const dept = await Department.findOneAndUpdate(
        { name: d.name },
        { $set: d },
        { upsert: true, new: true }
      );
      createdDepts.push(dept);
    }
    console.log(`Created ${createdDepts.length} departments.`);

    // Password hashes
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const doctorPass = await bcrypt.hash('doctor123', salt);
    const receptionistPass = await bcrypt.hash('reception123', salt);
    const patientPass = await bcrypt.hash('patient123', salt);

    // 2. Seed Admin
    console.log('Seeding Administrator...');
    const adminUser = await User.findOneAndUpdate(
      { email: 'admin@medicare360.com' },
      {
        $set: {
          name: 'Hospital Administrator',
          email: 'admin@medicare360.com',
          passwordHash: adminPass,
          role: 'admin',
          phone: '+91 98000 11100',
          isActive: true
        }
      },
      { upsert: true, new: true }
    );

    // 3. Seed Receptionist
    console.log('Seeding Receptionist...');
    const receptionistUser = await User.findOneAndUpdate(
      { email: 'receptionist@medicare360.com' },
      {
        $set: {
          name: 'Front Desk Priya',
          email: 'receptionist@medicare360.com',
          passwordHash: receptionistPass,
          role: 'receptionist',
          phone: '+91 98000 22200',
          isActive: true
        }
      },
      { upsert: true, new: true }
    );

    // 4. Seed 45 Doctors
    console.log('Seeding 45 Doctors...');
    const doctorUsers = [];
    for (let i = 0; i < 45; i++) {
      const email = i === 0 ? 'doctor@medicare360.com' : `doctor${i + 1}@medicare360.com`;
      const name = DOCTOR_NAMES[i] || `Dr. Consultant ${i + 1}`;
      const dept = createdDepts[i % createdDepts.length];

      const docUser = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            name,
            email,
            passwordHash: doctorPass,
            role: 'doctor',
            phone: `+91 98100 ${String(1000 + i).padStart(5, '0')}`,
            isActive: true
          }
        },
        { upsert: true, new: true }
      );
      doctorUsers.push(docUser);

      const exp = 6 + (i % 18);
      const fee = 500 + ((i % 5) * 200);
      const rating = 4.6 + ((i % 5) * 0.08);

      await DoctorProfile.findOneAndUpdate(
        { userId: docUser._id },
        {
          $set: {
            userId: docUser._id,
            departmentId: dept._id,
            specialization: `${dept.name} Specialist`,
            qualification: i % 2 === 0 ? 'MBBS, MD, DM' : 'MBBS, MS, DNB',
            experienceYears: exp,
            consultationFee: fee,
            rating: Number(rating.toFixed(1)),
            bio: `${name} has over ${exp} years of clinical excellence in ${dept.name}, with patient-focused healthcare methodologies.`
          }
        },
        { upsert: true, new: true }
      );

      // Seed weekly availability (Mon - Sat, 09:00 - 17:00, 30 min)
      for (let day = 1; day <= 6; day++) {
        await Availability.findOneAndUpdate(
          { doctorId: docUser._id, dayOfWeek: day },
          {
            $set: {
              doctorId: docUser._id,
              dayOfWeek: day,
              startTime: '09:00',
              endTime: '17:00',
              slotDurationMinutes: 30,
              isActive: true
            }
          },
          { upsert: true }
        );
      }
    }
    console.log(`Seeded ${doctorUsers.length} doctors with availability schedules.`);

    // 5. Seed 1,250 Patients
    console.log('Seeding 1,250 Patients (matching admin statistics requirement)...');
    // First: Primary demo patient
    const demoPatientUser = await User.findOneAndUpdate(
      { email: 'patient@medicare360.com' },
      {
        $set: {
          name: 'Rajesh Kumar',
          email: 'patient@medicare360.com',
          passwordHash: patientPass,
          role: 'patient',
          phone: '+91 98765 43210',
          isActive: true
        }
      },
      { upsert: true, new: true }
    );

    await PatientProfile.findOneAndUpdate(
      { userId: demoPatientUser._id },
      {
        $set: {
          userId: demoPatientUser._id,
          dateOfBirth: '1988-06-15',
          gender: 'Male',
          bloodGroup: 'O+',
          address: { street: '42 Orchid Residency', city: 'Mumbai', state: 'Maharashtra', postalCode: '400001' },
          allergies: ['Penicillin', 'Dust Mites'],
          emergencyContact: { name: 'Priya Kumar', phone: '+91 98765 43211', relation: 'Spouse' }
        }
      },
      { upsert: true }
    );

    // Remaining patients to reach exactly 1,250
    const patientUsers = [demoPatientUser];
    const existingPatientCount = await User.countDocuments({ role: 'patient' });
    const toGenerate = Math.max(0, 1250 - existingPatientCount);

    if (toGenerate > 0) {
      console.log(`Bulk inserting ${toGenerate} patient accounts...`);
      const patientBatch = [];
      const profileBatch = [];

      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+'];
      const genders = ['Male', 'Female'];
      const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad'];

      for (let i = 1; i <= toGenerate; i++) {
        const pEmail = `patient${existingPatientCount + i}@medicare360.com`;
        const gender = genders[i % 2];
        const blood = bloodGroups[i % bloodGroups.length];
        const city = cities[i % cities.length];
        const pName = `Patient ${existingPatientCount + i}`;

        const pUser = {
          name: pName,
          email: pEmail,
          passwordHash: patientPass,
          role: 'patient',
          phone: `+91 9${String(100000000 + i).slice(-9)}`,
          isActive: true,
          createdAt: new Date(Date.now() - (i * 3600 * 1000 * 4))
        };
        patientBatch.push(pUser);
      }

      const insertedUsers = await User.insertMany(patientBatch);
      insertedUsers.forEach((u, idx) => {
        patientUsers.push(u);
        profileBatch.push({
          userId: u._id,
          dateOfBirth: '1992-04-10',
          gender: genders[idx % 2],
          bloodGroup: bloodGroups[idx % bloodGroups.length],
          address: { street: `${idx + 10} Lakeview St`, city: cities[idx % cities.length], state: 'India', postalCode: '560001' },
          allergies: idx % 4 === 0 ? ['Aspirin'] : [],
          emergencyContact: { name: `Contact ${idx}`, phone: u.phone, relation: 'Family' }
        });
      });

      await PatientProfile.insertMany(profileBatch);
    }
    const totalPatientsCount = await User.countDocuments({ role: 'patient' });
    console.log(`Total Patients in database: ${totalPatientsCount}`);

    // 6. Seed exactly 320 Appointments
    console.log('Seeding 320 Appointments (matching admin statistics requirement)...');
    await Appointment.deleteMany({});

    const aptBatch = [];
    const slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
    const statuses = ['completed', 'completed', 'completed', 'confirmed', 'pending', 'cancelled', 'no-show'];

    const today = new Date();
    for (let i = 0; i < 320; i++) {
      const doctor = doctorUsers[i % doctorUsers.length];
      const patient = patientUsers[i % patientUsers.length];
      const dept = createdDepts[i % createdDepts.length];
      const slotTime = slots[i % slots.length];
      const status = statuses[i % statuses.length];

      // Assign distinct days per cycle to guarantee zero collision
      const dayCycle = Math.floor(i / (doctorUsers.length * slots.length)) + Math.floor(i / doctorUsers.length);
      const offsetDays = (dayCycle % 25) - 15;
      const aptDate = new Date(today);
      aptDate.setDate(aptDate.getDate() + offsetDays);
      const dateStr = aptDate.toISOString().split('T')[0];

      aptBatch.push({
        patientId: patient._id,
        doctorId: doctor._id,
        departmentId: dept._id,
        date: dateStr,
        slotTime,
        status,
        source: i % 4 === 0 ? 'walk-in' : 'online',
        reason: i % 2 === 0 ? 'Routine Health Checkup' : 'Specialist Consultation',
        cancellationReason: status === 'cancelled' ? 'Patient requested reschedule due to work schedule' : '',
        createdAt: new Date(Date.now() - (i * 3600 * 1000 * 8))
      });
    }

    await Appointment.insertMany(aptBatch);
    const totalAptCount = await Appointment.countDocuments();
    console.log(`Total Appointments in database: ${totalAptCount}`);

    // 7. Seed Prescriptions for completed appointments
    console.log('Seeding sample Prescriptions...');
    const completedApts = await Appointment.find({ status: 'completed' }).limit(30);
    for (const apt of completedApts) {
      await Prescription.findOneAndUpdate(
        { appointmentId: apt._id },
        {
          $set: {
            appointmentId: apt._id,
            patientId: apt.patientId,
            doctorId: apt.doctorId,
            medicines: [
              { name: 'Amoxicillin 500mg', dosage: '1 tablet', frequency: '1-0-1 after food', duration: '5 days', instructions: 'Finish full course' },
              { name: 'Paracetamol 650mg', dosage: '1 tablet', frequency: 'As needed for fever/pain', duration: '3 days', instructions: 'Max 3 tablets daily' },
              { name: 'Vitamin C + Zinc', dosage: '1 tablet', frequency: '0-1-0 after lunch', duration: '15 days', instructions: 'Immunity booster' }
            ],
            instructions: 'Drink at least 2.5 liters of clean water daily. Avoid cold beverages and heavy exertion.',
            followUpDate: '2026-11-25'
          }
        },
        { upsert: true }
      );
    }

    // 8. Seed Bills to achieve exactly ₹4,50,000 Total Revenue
    console.log('Seeding Bills to achieve exactly ₹4,50,000 total revenue...');
    // We will clear existing bills and create 300 bills totaling exactly 4,50,000
    // 300 bills * 1500 = 450,000
    const billsBatch = [];
    for (let i = 0; i < 300; i++) {
      const patient = patientUsers[i % patientUsers.length];
      billsBatch.push({
        patientId: patient._id,
        items: [
          { description: 'Specialist Consultation Fee', amount: 1000 },
          { description: 'Diagnostic Vitals & Triage', amount: 500 }
        ],
        totalAmount: 1500,
        paidAmount: 1500,
        paymentStatus: 'paid',
        paymentMode: i % 3 === 0 ? 'upi' : (i % 3 === 1 ? 'card' : 'cash'),
        transactionId: `TXN-MED360-${String(100000 + i)}`,
        createdBy: receptionistUser._id,
        createdAt: new Date(Date.now() - (i * 3600 * 1000 * 2))
      });
    }
    // Add 20 unpaid / pending bills so there is live billing pipeline
    for (let j = 0; j < 20; j++) {
      const patient = patientUsers[(300 + j) % patientUsers.length];
      billsBatch.push({
        patientId: patient._id,
        items: [
          { description: 'Routine Consultation', amount: 800 }
        ],
        totalAmount: 800,
        paidAmount: 0,
        paymentStatus: 'unpaid',
        paymentMode: 'none',
        createdBy: receptionistUser._id,
        createdAt: new Date()
      });
    }

    // Reset bills and insert
    await Bill.deleteMany ? await Bill.deleteMany({}) : (await Bill.find()).forEach(async b => await Bill.findByIdAndDelete(b._id));
    await Bill.insertMany(billsBatch);

    // Compute live revenue
    const allPaidBills = await Bill.find({ paymentStatus: { $in: ['paid', 'partially_paid'] } });
    const liveRevenue = allPaidBills.reduce((acc, b) => acc + (b.paidAmount || b.totalAmount), 0);
    console.log(`Live Total Revenue: ₹${liveRevenue.toLocaleString('en-IN')}`);

    // 9. Seed Medical Reports
    console.log('Seeding sample Medical Reports...');
    await MedicalReport.findOneAndUpdate(
      { title: 'Complete Blood Count (CBC) Panel' },
      {
        $set: {
          patientId: demoPatientUser._id,
          uploadedBy: doctorUsers[0]._id,
          title: 'Complete Blood Count (CBC) Panel',
          type: 'Lab Report',
          fileUrl: '/uploads/cbc-report.pdf',
          fileName: 'cbc-report.pdf',
          fileSize: 245000,
          notes: 'Hemoglobin and platelet levels within normal healthy ranges.'
        }
      },
      { upsert: true }
    );

    // 10. Seed Notifications
    await Notification.create({
      userId: demoPatientUser._id,
      message: 'Welcome to MediCare 360! Your digital healthcare profile is active.',
      type: 'system'
    });

    console.log('================================================================');
    console.log('  MediCare 360 - Database Seed Complete!');
    console.log(`  Total Patients:     ${await User.countDocuments({ role: 'patient' })} (Target: 1,250)`);
    console.log(`  Total Doctors:      ${await User.countDocuments({ role: 'doctor' })} (Target: 45)`);
    console.log(`  Total Appointments: ${await Appointment.countDocuments()} (Target: 320)`);
    console.log(`  Total Revenue:      ₹${liveRevenue.toLocaleString('en-IN')} (Target: ₹4,50,000)`);
    console.log('================================================================');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Database seeding failed:', err);
    process.exit(1);
  }
}

seedDatabase();
