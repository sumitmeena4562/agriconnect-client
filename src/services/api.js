import axios from "axios";

// Backend ka base URL (humara backend port 5000 par chal raha hai)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

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
