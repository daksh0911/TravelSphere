import axios from 'axios';
import { sanitizeObject } from '../utils/security';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // Helps defend against CSRF in browsers
  },
  timeout: 10000,
});

// Security Interceptor for Outgoing Requests
api.interceptors.request.use((config) => {
  // Attach session token securely from sessionStorage
  const token = sessionStorage.getItem('travelsphere_session_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Sanitize outbound request payload against Prototype Pollution
  if (config.data && typeof config.data === 'object') {
    config.data = sanitizeObject(config.data);
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Security Interceptor for Incoming Responses (Handling 401 unauthorized & 403 forbidden)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Invalidate compromised/expired session token safely
      sessionStorage.removeItem('travelsphere_session_token');
      sessionStorage.removeItem('travelsphere_user');
    }
    return Promise.reject(error);
  }
);

export default api;
