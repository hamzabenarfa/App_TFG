import axios from "axios";
import { initAxios } from "./api-interceptor";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

(async () => {
  try {
    await initAxios(api);
  } catch (error) {
    console.error("Failed to initialize Axios:", error);
  }
})();

export default api;
