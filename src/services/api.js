import axios from "axios";

// Backend ka base URL (humara backend port 5000 par chal raha hai)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export const registerUser = (userData) => API.post("/auth/register", userData);
export const sendOtp = (mobile) => API.post("/auth/send-otp", { mobile });
export const verifyOtp = (mobile, otp) => API.post("/auth/verify-otp", { mobile, otp });

export default API;
