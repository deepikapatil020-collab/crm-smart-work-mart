const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('swm_crm_token');
  const headers = {
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is NOT FormData, set application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = (data && data.message) || response.statusText || 'Request failed';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  getMe: () => apiRequest('/auth/me'),
  changePassword: (data) => apiRequest('/auth/change-password', { method: 'POST', body: data }),

  // Users
  getUsers: () => apiRequest('/users'),
  createUser: (userData) => apiRequest('/users', { method: 'POST', body: userData }),
  updateUser: (id, userData) => apiRequest(`/users/${id}`, { method: 'PUT', body: userData }),
  deleteUser: (id) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
  resetPassword: (id, newPassword) => apiRequest(`/users/${id}/reset-password`, { method: 'POST', body: { newPassword } }),

  // Leads
  getLeads: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/leads${qs ? `?${qs}` : ''}`);
  },
  createLead: (leadData) => apiRequest('/leads', { method: 'POST', body: leadData }),
  updateLead: (id, leadData) => apiRequest(`/leads/${id}`, { method: 'PUT', body: leadData }),
  deleteLead: (id) => apiRequest(`/leads/${id}`, { method: 'DELETE' }),
  convertLead: (id) => apiRequest(`/leads/${id}/convert`, { method: 'POST' }),

  // Deals
  getDeals: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/deals${qs ? `?${qs}` : ''}`);
  },
  createDeal: (dealData) => apiRequest('/deals', { method: 'POST', body: dealData }),
  updateDeal: (id, dealData) => apiRequest(`/deals/${id}`, { method: 'PUT', body: dealData }),
  deleteDeal: (id) => apiRequest(`/deals/${id}`, { method: 'DELETE' }),

  // Customers
  getCustomers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/customers${qs ? `?${qs}` : ''}`);
  },
  createCustomer: (data) => apiRequest('/customers', { method: 'POST', body: data }),
  updateCustomer: (id, data) => apiRequest(`/customers/${id}`, { method: 'PUT', body: data }),
  deleteCustomer: (id) => apiRequest(`/customers/${id}`, { method: 'DELETE' }),

  // Activities
  getActivities: () => apiRequest('/activities'),
  createActivity: (data) => apiRequest('/activities', { method: 'POST', body: data }),
  updateActivity: (id, data) => apiRequest(`/activities/${id}`, { method: 'PUT', body: data }),
  deleteActivity: (id) => apiRequest(`/activities/${id}`, { method: 'DELETE' }),

  // Analytics
  getDashboardAnalytics: () => apiRequest('/analytics/dashboard'),

  // Import
  importData: (type, formData) => apiRequest(`/import/${type}`, { method: 'POST', body: formData }),

  // Download export link helper
  getExportUrl: (type, format = 'csv') => {
    const token = localStorage.getItem('swm_crm_token');
    return `/api/export/${type}?format=${format}&token=${token || ''}`;
  },

  // Template download helper
  getTemplateUrl: (type) => `/api/template/${type}`
};
