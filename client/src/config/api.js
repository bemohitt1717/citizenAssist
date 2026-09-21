import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://citizenassist.onrender.com/api"
    : "http://localhost:5000/api");

const api = axios.create({
  baseURL: API_URL.replace(/\/$/, ""),
  withCredentials: true, // CRITICAL: Send cookies with requests for authentication
});

export default api;
