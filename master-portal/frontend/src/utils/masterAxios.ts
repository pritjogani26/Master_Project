import axios from "axios";
import { getMasterAccessToken } from "./masterAuthStorage";

const masterAxios = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

masterAxios.interceptors.request.use(
  (config) => {
    const token = getMasterAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default masterAxios;