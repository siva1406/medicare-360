const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '') + '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('medicare_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  register: (patientData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(patientData)
  }),

  // Doctors
  getDoctors: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/doctors${query ? `?${query}` : ''}`);
    return Array.isArray(data) ? data : (data.doctors || []);
  },
  getDoctorAvailability: async (doctorId, date) => {
    return request(`/doctors/${doctorId}/availability${date ? `?date=${date}` : ''}`);
  },
  createDoctor: (doctor) => request('/doctors', {
    method: 'POST',
    body: JSON.stringify(doctor)
  }),
  updateDoctor: (id, updates) => request(`/doctors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  deleteDoctor: (id) => request(`/doctors/${id}`, {
    method: 'DELETE'
  }),

  // Departments
  getDepartments: async () => {
    const data = await request('/departments');
    return Array.isArray(data) ? data : (data.departments || []);
  },
  createDepartment: (dept) => request('/departments', {
    method: 'POST',
    body: JSON.stringify(dept)
  }),

  // Appointments
  getAppointments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/appointments${query ? `?${query}` : ''}`);
    return Array.isArray(data) ? data : (data.appointments || []);
  },
  bookAppointment: (aptData) => request('/appointments', {
    method: 'POST',
    body: JSON.stringify(aptData)
  }),
  updateAppointmentStatus: (id, status, notes = '') => request(`/appointments/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes })
  }),
  cancelAppointment: (id, reason = 'Cancelled by patient') => request(`/appointments/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ cancellationReason: reason })
  }),

  // Prescriptions
  getPrescriptions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/prescriptions${query ? `?${query}` : ''}`);
    return Array.isArray(data) ? data : (data.prescriptions || []);
  },
  createPrescription: (rxData) => request('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(rxData)
  }),

  // Medical Reports
  getReports: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/reports${query ? `?${query}` : ''}`);
    return Array.isArray(data) ? data : (data.reports || []);
  },
  uploadReport: (reportData) => request('/reports', {
    method: 'POST',
    body: JSON.stringify(reportData)
  }),

  // Billing
  getBillings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/billing${query ? `?${query}` : ''}`);
    return Array.isArray(data) ? data : (data.bills || []);
  },
  createBilling: (billData) => request('/billing', {
    method: 'POST',
    body: JSON.stringify(billData)
  }),
  payBilling: (id, paymentData) => {
    const payload = typeof paymentData === 'object' 
      ? paymentData 
      : { paymentMode: paymentData || 'cash' };
    return request(`/billing/${id}/pay`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  // Admin Stats
  getAdminStats: () => request('/admin/stats'),

  // AI Recommendation
  recommendDoctor: (symptomData) => request('/ai/recommend', {
    method: 'POST',
    body: JSON.stringify(symptomData)
  })
};
