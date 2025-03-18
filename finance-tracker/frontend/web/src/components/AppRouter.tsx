import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../utils/hooks';
import Dashboard from '../pages/Dashboard';
import LoginPage from '../pages/Login';
import RegisterPage from '../pages/Register';
import TransactionsPage from '../pages/Transactions';
import ProfilePage from '../pages/Profile';
import SettingsPage from '../pages/Settings';
import CategoriesPage from '../pages/Categories';
import BudgetsPage from '../pages/Budgets';
import AnalyticsPage from '../pages/Analytics';
import NotFoundPage from '../pages/NotFound';
import RecurrentPayments from '../pages/RecurrentPayments';
import Layout from './Layout';

const AppRouter = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
      
      <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="budgets" element={<BudgetsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="recurrent-payments" element={<RecurrentPayments />} />
      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter; 