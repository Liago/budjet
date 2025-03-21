import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { fetchUserProfile } from "./store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "./utils/hooks";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "sonner";

// Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import NotFound from "./pages/NotFound";
import RecurrentPayments from "./pages/RecurrentPayments";
import Analytics from "./pages/Analytics";

// Components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If we have a token but user is not authenticated yet, fetch the user profile
    if (token && !isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, token, isAuthenticated]);

  return (
    <ErrorBoundary>
      <Router>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            className: "my-toast",
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
            }
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="categories" element={<Categories />} />
            <Route path="recurrent-payments" element={<RecurrentPayments />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
