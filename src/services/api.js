import axios from "axios";
import { toast } from 'react-hot-toast';

// Backend ka base URL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Z+ Security: Global Request Interceptor for JWT
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('agriconnect_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Tunnel bypass for mobile testing (ngrok & localtunnel)
  config.headers['ngrok-skip-browser-warning'] = 'true';
  config.headers['bypass-tunnel-reminder'] = 'true';
  
  return config;
});

// Z+ Proper: Global Response Interceptor for Universal Error Toasts
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract human-readable error message
    const message = error.response?.data?.message || 
                   (error.message === "Network Error" ? "Connection lost. Please check your internet and try again." : error.message) || 
                   "Something went wrong on our end. Please try again in a moment.";
    
    // Universal Toast: Har Jagah error dikhayega automatically
    toast.error(message);
    
    return Promise.reject(error);
  }
);

export const registerUser = (userData) => API.post("/auth/register", userData);
export const loginUser = (credentials) => API.post("/auth/login", credentials);
export const checkAvailability = (data) => API.post("/auth/check-availability", data);

// OTP Routes for Registration
export const sendOtp = (data) => API.post("/auth/send-otp", data);
export const verifyOtp = (identifier, otp) => API.post("/auth/verify-otp", { identifier, otp });

// Forgot Password Flow
export const sendForgotPasswordOtp = (data) => API.post("/auth/forgot-password-otp", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);

// Password-less OTP Login
export const sendLoginOtp = (data) => API.post("/auth/login-otp-send", data);
export const verifyLoginOtp = (data) => API.post("/auth/login-otp-verify", data);

export const uploadAvatar = (formData) => API.post("/upload/avatar", formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

export default API;
