import axios from 'axios';
import { getToken } from './auth';

/**
 * Central Axios instance for AgriConnect API v1.
 * Base URL is set to '/api/v1' — Vite proxy forwards to backend.
 * Auth token is auto-injected via request interceptor.
 * Use this instead of raw axios for all API calls.
 */
const api = axios.create({
  baseURL: '/api/v1',
});

// Request interceptor: auto-attach Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
