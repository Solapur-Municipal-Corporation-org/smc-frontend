import axios from "axios";
import Cookies from "js-cookie";

const baseURL = process.env.NEXT_PUBLIC_BHOOMI_API_BASE_URL || "http://localhost:5000/api";
const client = axios.create({ baseURL });

client.interceptors.request.use((config) => {
  const pathname = typeof window === "undefined" ? "" : window.location.pathname;
  let token = null;
  if (pathname === "/department/bhoomi-malmatta" || pathname.startsWith("/department/bhoomi-malmatta/")) token = Cookies.get("dept_token");
  else if (pathname.startsWith("/citizen/bhoomi-malmatta/")) token = Cookies.get("cp_token");
  else if (typeof window !== "undefined") token = window.localStorage.getItem("smc_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

export default client;
