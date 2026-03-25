import axios from "axios";

const API = "http://localhost:8000";

const api = axios.create({
  baseURL: API,
  withCredentials: true
});

api.interceptors.response.use(
  response => response,

  async (error) => {

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {

      originalRequest._retry = true;

      try {

        await axios.post(
          `${API}/auth/refresh/`,
          {},
          { withCredentials: true }
        );

        // retry original request
        return api(originalRequest);

      } catch (refreshError) {

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;