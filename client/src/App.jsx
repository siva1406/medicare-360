import React, { useState, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from './components/Router';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SmartRecommenderModal } from './components/SmartRecommenderModal';
import { BookAppointmentModal } from './components/BookAppointmentModal';

// Code-split routes for fast initial load and performance
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Services = lazy(() => import('./pages/Services').then(m => ({ default: m.Services })));
const Departments = lazy(() => import('./pages/Departments').then(m => ({ default: m.Departments })));
const Doctors = lazy(() => import('./pages/Doctors').then(m => ({ default: m.Doctors })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const PatientDashboard = lazy(() => import('./pages/PatientDashboard').then(m => ({ default: m.PatientDashboard })));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard').then(m => ({ default: m.DoctorDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ReceptionistDashboard = lazy(() => import('./pages/ReceptionistDashboard').then(m => ({ default: m.ReceptionistDashboard })));

function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider animate-pulse">Loading MediCare 360...</p>
    </div>
  );
}

function MainApp() {
  const [smartRecommenderOpen, setSmartRecommenderOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  const handleOpenBooking = (doc = null) => {
    setSelectedDoctorForBooking(doc);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar onOpenSmartRecommender={() => setSmartRecommenderOpen(true)} />

      <div className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home onOpenSmartRecommender={() => setSmartRecommenderOpen(true)} onOpenBookingModal={handleOpenBooking} />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services onOpenBookingModal={handleOpenBooking} />} />
            <Route path="/departments" element={<Departments onOpenBookingModal={handleOpenBooking} />} />
            <Route path="/doctors" element={<Doctors onSelectDoctorForBooking={handleOpenBooking} />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/patient-dashboard" element={<PatientDashboard onOpenBookingModal={handleOpenBooking} />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/receptionist-dashboard" element={<ReceptionistDashboard />} />
            <Route path="*" element={<Home onOpenSmartRecommender={() => setSmartRecommenderOpen(true)} onOpenBookingModal={handleOpenBooking} />} />
          </Routes>
        </Suspense>
      </div>

      <Footer />

      {/* Global Modals */}
      <SmartRecommenderModal
        isOpen={smartRecommenderOpen}
        onClose={() => setSmartRecommenderOpen(false)}
        onSelectDoctor={(doc) => {
          setSmartRecommenderOpen(false);
          handleOpenBooking(doc);
        }}
      />

      <BookAppointmentModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedDoctorForBooking(null);
        }}
        selectedDoctor={selectedDoctorForBooking}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <MainApp />
      </HashRouter>
    </AuthProvider>
  );
}
