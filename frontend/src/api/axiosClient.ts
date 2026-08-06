import axios from "axios";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8080",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
