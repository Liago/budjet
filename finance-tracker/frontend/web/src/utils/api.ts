import axios, { AxiosError, AxiosResponse } from "axios";

// API base URL - should be configured based on environment
export const API_URL = "http://localhost:3000/api";

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Generic API request handlers
export const apiService = {
  get: <T>(url: string, params?: any): Promise<T> => {
    console.log(`API GET ${url} con parametri:`, params);
    return api.get(url, { params }).then((response: AxiosResponse<T>) => {
      console.log(`Risposta API GET ${url}:`, response.data);
      return response.data;
    });
  },
  post: <T>(url: string, data: any): Promise<T> => {
    console.log(`API POST ${url} con dati (stringify):`, JSON.stringify(data));
    console.log(`API POST ${url} con dati (object):`, data);

    return api
      .post(url, data)
      .then((response: AxiosResponse<T>) => {
        console.log(`Risposta API POST ${url}:`, response.data);
        return response.data;
      })
      .catch((error) => {
        console.error(`Errore API POST ${url}:`, error);
        console.error(`Request data era:`, data);
        if (error.response) {
          console.error(`Risposta errore:`, error.response.data);
        }
        throw error;
      });
  },
  put: <T>(url: string, data: any): Promise<T> => {
    return api
      .put(url, data)
      .then((response: AxiosResponse<T>) => response.data);
  },
  patch: <T>(url: string, data: any): Promise<T> => {
    return api
      .patch(url, data)
      .then((response: AxiosResponse<T>) => response.data);
  },
  delete: <T>(url: string): Promise<T> => {
    return api.delete(url).then((response: AxiosResponse<T>) => response.data);
  },
  // New method for file uploads
  upload: <T>(url: string, formData: FormData): Promise<T> => {
    return api
      .post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response: AxiosResponse<T>) => response.data);
  },
};

export default api;
