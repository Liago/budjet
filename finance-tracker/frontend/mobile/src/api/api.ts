import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Rimuovo l'import diretto dello store per evitare il ciclo di dipendenze
// import { store } from "../store";

// Determinazione dell'URL API basata su variabili d'ambiente o piattaforma
let API_BASE_URL: string;

// Prima controlla se c'è una variabile d'ambiente EXPO_PUBLIC_API_URL
const PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL;

// Poi controlla le variabili in expoConfig.extra
const CONFIG_API_URL = Constants.expoConfig?.extra?.API_URL;

// Se abbiamo un URL nelle variabili d'ambiente, usalo
if (PUBLIC_API_URL) {
  console.log("Using API URL from EXPO_PUBLIC_API_URL:", PUBLIC_API_URL);
  API_BASE_URL = PUBLIC_API_URL;
} else if (CONFIG_API_URL) {
  console.log("Using API URL from app config:", CONFIG_API_URL);
  API_BASE_URL = CONFIG_API_URL;
} else {
  // 🔧 UPDATED: Allineamento al web frontend - usa lo stesso URL di produzione
  API_BASE_URL = __DEV__
    ? Platform.OS === "ios"
      ? "http://localhost:3000/api"
      : "http://10.0.2.2:3000/api"
    : "https://bud-jet-be.netlify.app/.netlify/functions/api";
  console.log("Using aligned API URL:", API_BASE_URL);
}

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

// Creo un'utilità per gestire le azioni di dispatch senza importare lo store direttamente
let storeDispatch: any = null;

// Funzione per impostare il dispatch dal componente principale
export const setStoreDispatch = (dispatch: any) => {
  storeDispatch = dispatch;
};

// API service utility
export const apiService = {
  // GET request
  get: async <T>(endpoint: string, params?: any): Promise<T> => {
    try {
      // Log della richiesta effettivamente inviata
      console.log(`🔍 [API-DEBUG] GET Request to ${endpoint}`);
      console.log(`📋 [API-DEBUG] Params:`, JSON.stringify(params, null, 2));
      console.log(
        `🌐 [API-DEBUG] Full URL will be: ${API_BASE_URL}${endpoint}`
      );

      // Formatta i parametri per le API - assicurati che le date siano stringhe
      const formattedParams = params ? { ...params } : {};

      const config: AxiosRequestConfig = { params: formattedParams };

      console.log(
        `⚙️ [API-DEBUG] Axios config:`,
        JSON.stringify(config, null, 2)
      );

      const response: AxiosResponse<T> = await axiosInstance.get(
        endpoint,
        config
      );

      // Log all API responses in development
      console.log(`✅ [API-DEBUG] Response for ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        dataType: typeof response.data,
        dataKeys:
          response.data && typeof response.data === "object"
            ? Object.keys(response.data)
            : [],
        data: response.data,
      });

      // Special handling for dashboard stats to ensure data consistency with web app
      if (
        endpoint === "/direct/dashboard/stats" ||
        endpoint === "/dashboard/stats"
      ) {
        console.log("Raw dashboard stats:", response.data);

        // Ensure data is properly structured
        const data = response.data as any;

        // Convert categories to budgetStatus if using older API
        if (data.categories && !data.budgetStatus) {
          data.budgetStatus = data.categories
            .filter((cat: any) => cat.budget)
            .map((cat: any) => ({
              categoryId: cat.categoryId,
              categoryName: cat.categoryName,
              categoryColor: cat.categoryColor,
              budget: cat.budget || 0,
              spent: cat.amount || 0,
              remaining: (cat.budget || 0) - (cat.amount || 0),
              percentage: cat.budgetPercentage || 0,
            }));
        }

        console.log("Processed dashboard stats:", data);
        return data as T;
      }

      // Special handling for transactions to ensure all fields are properly set
      if (endpoint === "/direct/transactions" || endpoint === "/transactions") {
        console.log("Raw transactions data:", response.data);

        const data = response.data as any;

        // Ensure transaction amounts are numeric
        if (data.data && Array.isArray(data.data)) {
          data.data = data.data.map((transaction: any) => ({
            ...transaction,
            amount:
              typeof transaction.amount === "number"
                ? transaction.amount
                : typeof transaction.amount === "string"
                ? parseFloat(transaction.amount)
                : 0,
          }));
        }

        console.log("Processed transactions data:", data);
        return data as T;
      }

      // Special handling for categories
      if (endpoint === "/direct/categories" || endpoint === "/categories") {
        console.log("Raw categories data:", JSON.stringify(response.data));
        if (Array.isArray(response.data)) {
          console.log(`Ricevute ${response.data.length} categorie dal server`);
          // Verifica che ogni categoria abbia il tipo definito
          response.data.forEach((cat, index) => {
            console.log(
              `Categoria ${index}: ID=${cat.id}, Nome=${cat.name}, Tipo=${cat.type}`
            );
          });
        } else {
          console.log(
            "Il server ha restituito dati non array per le categorie:",
            typeof response.data
          );
        }
        return response.data;
      }

      return response.data;
    } catch (error: any) {
      console.error(`API Error for ${endpoint}:`, error);

      // Log di errori 400 (Bad Request) per debugging
      if (error.response?.status === 400) {
        console.error(`Bad Request Error Details for ${endpoint}:`);
        console.error("Request params:", params);
        console.error("Response data:", error.response?.data);
        console.error("Server message:", error.response?.data?.message);
      }

      // Se c'è un errore con le transazioni, restituisci un risultato vuoto ma non far fallire l'app
      if (endpoint === "/direct/transactions" || endpoint === "/transactions") {
        console.log("Returning empty transaction data for error case");

        // Create a properly formatted empty response that matches the expected type
        const emptyResponse = {
          data: [],
          meta: {
            total: 0,
            page: params?.page || 1,
            limit: params?.limit || 10,
            totalPages: 0,
          },
        };

        console.log("Empty response structure:", emptyResponse);
        return emptyResponse as unknown as T;
      }

      // Se c'è un errore con le categorie, restituisci un array vuoto
      if (endpoint === "/direct/categories" || endpoint === "/categories") {
        console.log("Returning empty categories array for error case");
        return [] as unknown as T;
      }

      throw error;
    }
  },

  // POST request
  post: async <T>(endpoint: string, data: any): Promise<T> => {
    try {
      console.log(`API POST Request to ${endpoint}:`, JSON.stringify(data));
      const response: AxiosResponse<T> = await axiosInstance.post(
        endpoint,
        data
      );
      console.log(`API POST Response from ${endpoint}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`API Error for ${endpoint}:`, error);
      console.error(
        "Request data that caused the error:",
        JSON.stringify(data)
      );
      if (error.response) {
        console.error("Response error data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  },

  // PUT request
  put: async <T>(endpoint: string, data: any): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await axiosInstance.put(
        endpoint,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  },

  // PATCH request
  patch: async <T>(endpoint: string, data: any): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await axiosInstance.patch(
        endpoint,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  },

  // DELETE request
  delete: async <T>(endpoint: string): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await axiosInstance.delete(endpoint);
      return response.data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
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

// Response interceptor for handling common errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle unauthorized errors (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get token from storage
        const token = await AsyncStorage.getItem("token");

        // If we have no token, it's a genuine auth issue
        if (!token) {
          console.log("No authentication token found in storage");
          // Dispatch logout action using our utility function
          if (storeDispatch) {
            storeDispatch({ type: "auth/logout/fulfilled", payload: null });
          }
          return Promise.reject(error);
        }

        // If we have a token that's not working, it might be expired
        console.log(
          "Token exists but API returned 401 - session likely expired"
        );
        await AsyncStorage.removeItem("token");
        if (storeDispatch) {
          storeDispatch({ type: "auth/logout/fulfilled", payload: null });
        }
      } catch (storageError) {
        console.error("Error accessing token storage:", storageError);
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
