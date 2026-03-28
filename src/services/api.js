import axios from "axios";

// Backend ka base URL (humara backend port 5000 par chal raha hai)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export const registerUser = (userData) => API.post("/auth/register", userData);
export const sendOtp = (data) => API.post("/auth/send-otp", data);
export const verifyOtp = (identifier, otp) => API.post("/auth/verify-otp", { identifier, otp });

export default API;
