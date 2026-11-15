# MediCare 360 - Smart Healthcare Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-emerald.svg)](https://mongoosejs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

**MediCare 360** is an enterprise-grade, full-stack hospital management web application connecting patients, doctors, receptionists, and hospital administrators. Built with a production-ready Express/Node.js backend, MongoDB with Mongoose schemas, secure JWT authentication with bcrypt hashing, PDFKit document generation, and role-based access control (RBAC).

---

## 📑 Table of Contents
1. [Architecture & Folder Structure](#-architecture--folder-structure)
2. [Tech Stack](#-tech-stack)
3. [Roles & Access Control (RBAC)](#-roles--access-control-rbac)
4. [Live Database Seed & Admin Statistics](#-live-database-seed--admin-statistics)
5. [Demo Credentials](#-demo-credentials)
6. [Quick Start & Setup Instructions](#-quick-start--setup-instructions)
7. [Environment Variables (.env)](#-environment-variables-env)
8. [Comprehensive API Documentation](#-comprehensive-api-documentation)
9. [Key Advanced Features](#-key-advanced-features)
10. [Automated Testing](#-automated-testing)
11. [Production Deployment Guide](#-production-deployment-guide)

---

## 🏛 Architecture & Folder Structure

The project is cleanly decoupled into two main folders: `client/` (React Vite SPA) and `server/` (Node.js Express REST API).

```text
medicare-360/
├── client/                              # Frontend React (Vite) Application
│   ├── public/                          # Static assets and icons
│   ├── src/
│   │   ├── components/                  # Reusable UI components
│   │   │   ├── BillingModal.jsx         # Walk-in & payment invoice modal
│   │   │   ├── BookAppointmentModal.jsx # Slot-checking booking modal
│   │   │   ├── Charts.jsx               # Recharts interactive graphs
│   │   │   ├── DigitalPrescriptionModal.jsx # Rx prescription builder
│   │   │   ├── Footer.jsx               # Hospital footer
│   │   │   ├── Navbar.jsx               # Role-aware responsive navigation
│   │   │   ├── Router.jsx               # Client-side router & guards
│   │   │   ├── Sidebar.jsx              # Dashboard navigation drawer
│   │   │   └── SmartRecommenderModal.jsx# AI doctor recommendation modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # JWT state, demo logins & toasts
│   │   ├── pages/                       # Public pages & Role dashboards
│   │   │   ├── About.jsx                # About hospital page
│   │   │   ├── AdminDashboard.jsx       # Admin analytics & hospital ops
│   │   │   ├── Contact.jsx              # Contact & emergency inquiry
│   │   │   ├── Departments.jsx          # Hospital department directory
│   │   │   ├── DoctorDashboard.jsx      # Doctor appointments & Rx management
│   │   │   ├── Doctors.jsx              # Searchable doctor directory
│   │   │   ├── Home.jsx                 # High-converting landing page
│   │   │   ├── Login.jsx                # Role-selector login
│   │   │   ├── PatientDashboard.jsx     # Patient records, timeline & appointments
│   │   │   ├── ReceptionistDashboard.jsx# Walk-ins, triage & billing counter
│   │   │   ├── Register.jsx             # Patient registration
│   │   │   └── Services.jsx             # Medical specialty services
│   │   ├── services/
│   │   │   └── api.js                   # Unified REST API service client
│   │   ├── __tests__/                   # Frontend component and route tests
│   │   │   └── formValidation.test.js
│   │   ├── App.jsx                      # App root component
│   │   ├── main.jsx                     # Vite React entry point
│   │   └── index.css                    # Tailwind CSS design system
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                              # Backend Express REST API
│   ├── config/
│   │   └── db.js                        # Mongoose & in-memory engine fallback
│   ├── controllers/                     # Business logic controllers
│   │   ├── adminController.js           # Analytics, stats & CSV/PDF exports
│   │   ├── appointmentController.js     # Slot booking, anti-double-booking
│   │   ├── authController.js            # JWT auth, registration, login
│   │   ├── billingController.js         # Hospital bills, invoices & receipts
│   │   ├── departmentController.js      # Hospital departments CRUD
│   │   ├── doctorController.js          # Doctor profiles, schedule & AI recommend
│   │   ├── notificationController.js    # In-app notifications
│   │   ├── patientController.js         # Patient profile & medical timeline
│   │   ├── prescriptionController.js    # Rx generation & PDFKit PDF download
│   │   └── reportController.js          # Multer file upload & downloads
│   ├── cron/
│   │   └── reminders.js                 # node-cron 24h automated reminders
│   ├── middleware/                      # Security & RBAC middlewares
│   │   ├── audit.js                     # Access audit logger for EHR
│   │   ├── auth.js                      # JWT authentication verification
│   │   ├── errorHandler.js              # Centralized error handler
│   │   ├── rbac.js                      # Role-based authorization gate
│   │   ├── upload.js                    # Multer validated file upload
│   │   └── validate.js                  # express-validator handler
│   ├── models/                          # Mongoose Database Schemas
│   │   ├── Appointment.js               # Compound unique index on slot
│   │   ├── AuditLog.js                  # EHR access tracking
│   │   ├── Availability.js              # Doctor weekly schedule
│   │   ├── Bill.js                      # Billing line items & payments
│   │   ├── Department.js                # Hospital departments
│   │   ├── DoctorProfile.js             # Doctor qualifications & fees
│   │   ├── Leave.js                     # Doctor leave dates
│   │   ├── MedicalRecord.js             # Clinical vitals & doctor notes
│   │   ├── MedicalReport.js             # Uploaded PDF/image reports
│   │   ├── Notification.js              # System and reminder alerts
│   │   ├── PatientProfile.js            # Medical history, blood, allergies
│   │   ├── Prescription.js              # Medicines, dosage, instructions
│   │   └── User.js                      # Core identity model with bcrypt
│   ├── routes/                          # Express API Route Modules
│   │   ├── adminRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── billingRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── prescriptionRoutes.js
│   │   └── reportRoutes.js
│   ├── seed/
│   │   └── seed.js                      # Matches target live metrics
│   ├── tests/                           # Backend Supertest & unit test suite
│   │   └── runTests.js
│   ├── uploads/                         # Stored report files
│   ├── .env.example
│   ├── app.js                           # Express application configuration
│   ├── package.json
│   └── server.js                        # HTTP listener & cron service entry
│
├── package.json                         # Monorepo root scripts
├── run-all.js                           # Unified server & client runner
└── README.md
```

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 (Vite 5)
- **Routing**: Client-side history routing with protected role gates
- **Styling**: Tailwind CSS 3.4 (Medical Blue `#0284c7`, Light Slate Background `#f8fafc`, Teal Accents `#0d9488`)
- **Icons**: Lucide React
- **Analytics & Data Visualizations**: Recharts (ResponsiveContainer, AreaChart, BarChart, PieChart, LineChart)

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database & ODM**: MongoDB with Mongoose 8 (with embedded in-memory fallback for zero-config setups)
- **Authentication**: JWT (`jsonwebtoken`) with 7-day expiration & `bcryptjs` password hashing (cost 12)
- **File Uploads**: `multer` (restricted to PDF, JPG, PNG under 10MB)
- **PDF Generation**: `pdfkit` (streamed digital prescriptions and hospital tax invoices)
- **Automated Scheduling**: `node-cron` (hourly scanner dispatching 24-hour reminder notices)
- **Security & Hardening**: `helmet`, `cors` allowlist, `express-rate-limit`, input sanitization against NoSQL injection

---

## 🛡 Roles & Access Control (RBAC)

Permissions are enforced at the backend middleware level on **every** protected route:

| Role | Permissions & Scoping |
| :--- | :--- |
| **Patient** | Can access **only** their own medical records, book appointments, cancel upcoming appointments, download their prescriptions/invoices as PDF, and upload personal diagnostic reports. |
| **Doctor** | Accesses their own daily consultation queue, patient medical timelines for patients who have booked or consulted with them, writes digital prescriptions, updates clinic availability/leaves, and uploads clinical reports. |
| **Receptionist** | Handles new patient registration, books walk-in appointments with real-time doctor slot validation, schedules/reschedules, updates appointment triage statuses (`checked-in`, `in-progress`, `completed`, `no-show`), generates bills, and records payments. No clinical note authoring. |
| **Admin** | Hospital-wide oversight. Manages doctors, departments, patients, appointments, billing analytics, and generates hospital administrative reports (CSV/PDF). |

---

## 📊 Live Database Seed & Admin Statistics

The seed script (`server/seed/seed.js`) seeds the database to compute live metrics matching the required figures:

- **Total Patients**: `1,250`
- **Total Doctors**: `45` (distributed across Cardiology, Neurology, Orthopedics, Pediatrics, Dermatology, General Medicine, Oncology, Gastroenterology, Ophthalmology, ENT)
- **Total Appointments**: `320`
- **Total Revenue**: `₹4,50,000` (computed dynamically from bills using Indian number formatting)

---

## 🔑 Demo Credentials

| Role | Email | Password | Quick One-Click Demo |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@medicare360.com` | `admin123` | Click **Admin** button on Login |
| **Doctor** | `doctor@medicare360.com` | `doctor123` | Click **Doctor** button on Login |
| **Receptionist** | `receptionist@medicare360.com` | `reception123` | Click **Receptionist** button on Login |
| **Patient** | `patient@medicare360.com` | `patient123` | Click **Patient** button on Login |

---

## 🚀 Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18.0.0 or higher)
- Optional: MongoDB running locally on port 27017 (an embedded in-memory database engine starts automatically if MongoDB is not present).

### Step 1: Clone or Open Repository
```bash
cd medicare-360
```

### Step 2: Seed the Database
```bash
npm run seed
# or: cd server && node seed/seed.js
```

### Step 3: Start the Application
Run both the API and client from the root:
```bash
npm start
```
The application will launch on **`http://localhost:5000`**.

### Standalone Development Mode
To run client with Vite HMR:
```bash
# Terminal 1: Backend API
cd server
npm start

# Terminal 2: Frontend Client (Vite)
cd client
npm run dev
```
Open **`http://localhost:5173`** (Vite proxies all `/api` calls directly to port 5000).

---

## ⚙ Environment Variables (.env)

### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/medicare360
JWT_SECRET=super_secret_medicare360_jwt_token_key_2026_xyz
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=./uploads
```

### Client (`client/.env`)
```env
VITE_API_URL=/api
```

---

## 📡 Comprehensive API Documentation

All routes are prefixed with `/api`. Protected routes require header:
`Authorization: Bearer <jwt_token>`

### 1. Authentication
- **`POST /api/auth/register`**
  - Body: `{ name, email, password, phone, bloodGroup, allergies, emergencyContact }`
  - Response (201): `{ success: true, token, user }`
- **`POST /api/auth/login`**
  - Body: `{ email, password }`
  - Response (200): `{ success: true, token, user }`
- **`GET /api/auth/me`**
  - Response (200): Authenticated user and profile.
- **`POST /api/auth/logout`**

### 2. Appointments
- **`POST /api/appointments`**
  - Body: `{ doctorId, date, slotTime, reason, source }`
  - Enforces database unique compound index on `(doctorId, date, slotTime)`.
  - Response (201): Created appointment object.
  - Conflict (409): `{ success: false, message: "The slot ... is already booked." }`
- **`GET /api/appointments?date=...&status=...&doctorId=...`**
  - Scoped by role: patients see own appointments; doctors see their consults; receptionists/admins see all.
- **`PATCH /api/appointments/:id/status`**
  - Body: `{ status, cancellationReason, notes }`
- **`PATCH /api/appointments/:id/cancel`**
  - Body: `{ cancellationReason }`
  - Validates cancellation occurs prior to scheduled appointment time.
- **`PATCH /api/appointments/:id/reschedule`**
  - Body: `{ newDate, newSlotTime }`

### 3. Doctors & Smart Recommendation
- **`GET /api/doctors`**
  - Search, filter by department and specialization.
- **`GET /api/doctors/:id`**
  - Detailed profile, active schedule, and leave dates.
- **`GET /api/doctors/:id/availability?date=YYYY-MM-DD`**
  - Computes active and booked slots in real time.
- **`GET /api/doctors/recommend?department=Cardiology&date=YYYY-MM-DD`**
  - Smart ranking algorithm evaluating department match, availability window, rating, and clinical experience.
  - Returns ranking score breakdown + mandatory clinical disclaimer.

### 4. Prescriptions
- **`POST /api/prescriptions`** *(Doctor/Admin only)*
  - Body: `{ appointmentId, patientId, medicines: [{ name, dosage, frequency, duration, instructions }], instructions, followUpDate }`
- **`GET /api/prescriptions/:id/pdf`**
  - Streams hospital-branded PDF document generated on the fly via PDFKit.

### 5. Medical Reports
- **`POST /api/reports`**
  - Multipart form-data with `file` (PDF/JPG/PNG max 10MB), `patientId`, `title`, `type`.
- **`GET /api/reports/:id/download`**
  - Downloads validated diagnostic report.

### 6. Billing & Invoices
- **`POST /api/billing`** *(Receptionist/Admin)*
  - Body: `{ patientId, appointmentId, items: [{ description, amount }] }`
- **`PATCH /api/billing/:id/pay`**
  - Body: `{ paidAmount, paymentMode, transactionId }` (supports UPI, Card, Cash).
- **`GET /api/billing/:id/invoice`**
  - Generates official hospital tax invoice PDF with GSTIN, billing items, and payment receipt.

### 7. Admin Analytics & Reporting
- **`GET /api/admin/stats`**
  - Returns live figures: Total Patients (1,250), Total Doctors (45), Total Appointments (320), Total Revenue (₹4,50,000).
- **`GET /api/admin/analytics?period=week|month|year`**
  - Time-series appointment volume, department breakdown, no-show rate intelligence.
- **`GET /api/admin/reports/export?format=csv|pdf&type=appointments|billing|patients`**
  - Downloads exportable administrative report.

---

## 💡 Key Advanced Features

1. **Smart Doctor Recommendation**:
   Ranks available doctors by specialty alignment, date availability, experience tenure, and patient satisfaction ratings. Displays explicit percentage match and reasoning.
   > **Note on AI Usage**: System AI is strictly restricted to administrative and scheduling intelligence. All clinical decisions, prescriptions, and diagnoses remain exclusively with licensed medical physicians.

2. **Database-Level Anti-Double-Booking**:
   Compound unique index on `(doctorId, date, slotTime)` prevents concurrent slot collision.

3. **Digital Rx & Tax Invoices (PDFKit)**:
   Generates verified, clinic-branded PDF prescriptions and GST tax invoices.

4. **Automated Reminders (`node-cron`)**:
   Hourly background worker identifies appointments within the upcoming 24 hours, creates in-app notifications, and logs mock SMS/Email notifications.

5. **Chronological Medical Timeline**:
   Unified EHR timeline combining past appointments, prescriptions, clinical notes, and diagnostic lab reports.

---

## 🧪 Automated Testing

### Run Backend Tests (Supertest & RBAC)
```bash
cd server
npm test
```
Tests pass 14 assertions verifying:
- Authentication & JWT token issuing
- Password hashing & passwordHash exclusion
- RBAC permissions on protected routes (Admin, Doctor, Receptionist, Patient)
- Double-booking 409 conflict detection
- Billing calculations and payment recording

### Run Frontend Form & Route Tests
```bash
cd client
npm test
```
Tests pass 8 assertions verifying:
- Patient registration form validation rules
- Appointment booking requirements
- Client-side protected route authorization gates
- Prescription item structures
- Indian currency formatting (`₹4,50,000`)

---

## 🚢 Production Deployment Guide

### Option 1: Docker & Docker Compose
Create a `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:6.0
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  server:
    build: ./server
    restart: always
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/medicare360
      - JWT_SECRET=production_strong_secret_key_123
    depends_on:
      - mongodb

volumes:
  mongo-data:
```

### Option 2: Linux VM with PM2 & Nginx
1. Build the frontend client:
   ```bash
   cd client && npm run build
   ```
2. Start the backend with PM2:
   ```bash
   cd ../server
   npm run seed
   pm2 start server.js --name "medicare-api"
   ```
3. Nginx configuration (`/etc/nginx/sites-available/medicare360`):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
4. Obtain SSL via Certbot:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

---
© 2026 MediCare 360 Systems. All rights reserved.
