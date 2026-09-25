import axios from 'axios';

// The live cloud backend on Render
const DEPLOYED_BACKEND_URL = 'https://job-application-tracker-02nn.onrender.com';

let envBase = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

let rawBase;
if (envBase) {
  rawBase = envBase.endsWith('/api') ? envBase : `${envBase}/api`;
} else if (
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
) {
  // Local dev environment: proxy via Vite dev server to localhost:8080
  rawBase = '/api';
} else {
  // Production cloud environment (Render Static Site / Vercel): automatically target the deployed Render backend
  rawBase = `${DEPLOYED_BACKEND_URL}/api`;
}

const api = axios.create({
  baseURL: rawBase,
  timeout: 60000, // 60s timeout: accommodates Render free tier cold starts while preventing endless hangs
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('jwt_token') || localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear invalid token
      if (localStorage.getItem('jwt_token')) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
