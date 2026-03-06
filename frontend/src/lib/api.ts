import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;
//Request interceptor
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//response interceptors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    //If we get a 401 and haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/users/refresh")) {
      originalRequest._retry = true;

      try {
        // const res = await axios.post(
        //   `${import.meta.env.VITE_API_URL}users/refresh`,
        //   {},
        //   { withCredentials: true },
        // );
        // const { accessToken } = res.data;
        // useAuthStore.getState().setAuth(res.data.user, accessToken);
        if(!refreshPromise) {
            refreshPromise = axios.post(
                `${import.meta.env.VITE_API_URL}/users/refresh`,
                {},
                { withCredentials: true}
            ).then((res) => {
                const { user, accessToken } = res.data;
                useAuthStore.getState().setAuth(user, accessToken);
                return accessToken;
            }).finally(() => {
                refreshPromise = null;
            });
        }
        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
