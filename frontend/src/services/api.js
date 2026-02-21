// Purpose: Axios instance configured for TaskFlow Pro API
// Why: Centralizes base URL, headers, and auth handling for all network calls
// How: Adds JWT from localStorage and redirects to /login on 401 responses/logouts
import axios from 'axios';

// Resolve API base (prefer env override). Must include `/api` to match FastAPI routes.
const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://todo-fastapi-react-postgresql.onrender.com/api';

// Create a preconfigured Axios client used across the app (services/components)
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if a JWT is present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // expected by FastAPI auth dependency
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize errors; if 401, clear auth and route user to login screen
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
