import { api } from "./api";
import { store } from "../store";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from "../store/slices/authSlice";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

/**
 * Authentication service for user login, registration, etc.
 */
export const authService = {
  /**
   * Login user with email and password
   */
  login: async (credentials: LoginCredentials) => {
    try {
      store.dispatch(loginStart());

      const response = (await api.post(
        "/auth/login",
        credentials
      )) as LoginResponse;

      store.dispatch(
        loginSuccess({
          user: response.user,
          token: response.token,
        })
      );

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      store.dispatch(loginFailure(errorMessage));
      throw error;
    }
  },

  /**
   * Register a new user
   */
  register: async (data: RegisterData) => {
    try {
      const response = await api.post("/auth/register", data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      // Call logout endpoint if needed
      // await api.post('/auth/logout', {});

      // Clear store
      store.dispatch(logout());
    } catch (error) {
      // Even if API logout fails, clear local state
      store.dispatch(logout());
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const state = store.getState();
    return !!state.auth.token;
  },
};
