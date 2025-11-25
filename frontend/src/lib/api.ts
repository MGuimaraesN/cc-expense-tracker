import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxied by Next.js to the backend
});

// Request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    // Check if running in the browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
