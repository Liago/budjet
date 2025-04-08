import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL will be different for local development on different platforms
const API_BASE_URL =
  Platform.OS === "ios"
    ? "http://localhost:3000/api"
    : "http://10.0.2.2:3000/api"; // Android emulator uses 10.0.2.2 to reach localhost

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor for adding token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle unauthorized errors (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear token on auth error
      await AsyncStorage.removeItem("token");

      // You could implement token refresh logic here instead

      // For now, just reject with the error
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// API service utility
export const apiService = {
  // GET request
  get: async <T>(endpoint: string, params?: any): Promise<T> => {
    const config: AxiosRequestConfig = { params };
    const response: AxiosResponse<T> = await axiosInstance.get(
      endpoint,
      config
    );
    return response.data;
  },

  // POST request
  post: async <T>(endpoint: string, data: any): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.post(endpoint, data);
    return response.data;
  },

  // PUT request
  put: async <T>(endpoint: string, data: any): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.put(endpoint, data);
    return response.data;
  },

  // PATCH request
  patch: async <T>(endpoint: string, data: any): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.patch(
      endpoint,
      data
    );
    return response.data;
  },

  // DELETE request
  delete: async <T>(endpoint: string): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.delete(endpoint);
    return response.data;
  },

  // Form data upload
  upload: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.post(
      endpoint,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};
