import React, { useState } from 'react';
import { HashRouter, Routes, Route } from './components/Router';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SmartRecommenderModal } from './components/SmartRecommenderModal';
import { BookAppointmentModal } from './components/BookAppointmentModal';

import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Departments } from './pages/Departments';
import { Doctors } from './pages/Doctors';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ReceptionistDashboard } from './pages/ReceptionistDashboard';

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
