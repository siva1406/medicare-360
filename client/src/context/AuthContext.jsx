import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('medicare_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const login = async (email, password) => {
    try {
      const data = await api.login({ email, password });
      setUser(data.user);
      localStorage.setItem('medicare_token', data.token);
      localStorage.setItem('medicare_user', JSON.stringify(data.user));
      showToast(`Welcome back, ${data.user.name}!`);
      return data.user;
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const register = async (patientData) => {
    try {
      const data = await api.register(patientData);
      setUser(data.user);
      localStorage.setItem('medicare_token', data.token);
      localStorage.setItem('medicare_user', JSON.stringify(data.user));
      showToast('Registration successful! Welcome to MediCare 360.');
      return data.user;
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  const quickDemoLogin = async (role) => {
    const demoAccounts = {
      patient: { email: 'patient@medicare360.com', password: 'patient123' },
      doctor: { email: 'doctor@medicare360.com', password: 'doctor123' },
      admin: { email: 'admin@medicare360.com', password: 'admin123' },
      receptionist: { email: 'receptionist@medicare360.com', password: 'reception123' }
    };

    const target = demoAccounts[role];
    if (target) {
      return await login(target.email, target.password);
    }
  };

  const logout = () => {
    const userName = user?.name || 'User';
    setUser(null);
    localStorage.removeItem('medicare_token');
    localStorage.removeItem('medicare_user');
    showToast(`Logged out successfully. Goodbye ${userName}.`, 'info');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, quickDemoLogin, logout, toast, showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all transform animate-bounce-subtle border"
             style={{
               backgroundColor: toast.type === 'error' ? '#fef2f2' : toast.type === 'info' ? '#eff6ff' : '#f0fdf4',
               borderColor: toast.type === 'error' ? '#fecaca' : toast.type === 'info' ? '#bfdbfe' : '#bbf7d0',
               color: toast.type === 'error' ? '#991b1b' : toast.type === 'info' ? '#1e40af' : '#166534',
             }}>
          <span className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: toast.type === 'error' ? '#dc2626' : toast.type === 'info' ? '#2563eb' : '#16a34a',
                }} />
          <span>{toast.message}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
