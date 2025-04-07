import { store } from "../store";

const API_BASE_URL = "https://api.budjet.com"; // Replace with your actual API URL

/**
 * Base API configuration for making HTTP requests
 */
export const api = {
  /**
   * Make a GET request
   * @param endpoint - API endpoint to call
   * @param params - Query parameters
   */
  get: async (endpoint: string, params: Record<string, string> = {}) => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Make a POST request
   * @param endpoint - API endpoint to call
   * @param data - Data to send in request body
   */
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  /**
   * Make a PUT request
   * @param endpoint - API endpoint to call
   * @param data - Data to send in request body
   */
  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  /**
   * Make a DELETE request
   * @param endpoint - API endpoint to call
   */
  delete: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    return handleResponse(response);
  },
};

/**
 * Get headers for API requests, including auth token if available
 */
const getHeaders = () => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const state = store.getState();
  const token = state.auth.token;

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Handle API response, parse JSON and check for errors
 */
const handleResponse = async (response: Response) => {
  const data = await response.json();

  if (!response.ok) {
    // Handle different error statuses
    if (response.status === 401) {
      // Authorization error - could trigger logout here
      // store.dispatch(logout());
    }

    throw new Error(data.message || "An error occurred");
  }

  return data;
};
