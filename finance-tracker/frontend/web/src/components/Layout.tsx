import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { logout } from "../store/slices/authSlice";

// Icons
import {
  HomeIcon,
  CreditCardIcon,
  TagIcon,
  UserIcon,
  LogoutIcon,
  MenuIcon,
  XIcon,
  ChartBarIcon,
  ChevronUpIcon
} from "./Icons";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout() as any);
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Funzione per ottenere il nome completo dell'utente
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return `${user.firstName} ${user.lastName}`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white shadow-md">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-blue-600">Finance Tracker</h1>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
                end
              >
                <HomeIcon className="mr-3 h-5 w-5" />
                Dashboard
              </NavLink>
              <NavLink
                to="/transactions"
                className={({ isActive }) =>
                  `group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <CreditCardIcon className="mr-3 h-5 w-5" />
                Transazioni
              </NavLink>
              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  `group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <TagIcon className="mr-3 h-5 w-5" />
                Categorie
              </NavLink>
              <NavLink
                to="/recurrent-payments"
                className={({ isActive }) =>
                  `group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <ChevronUpIcon className="mr-3 h-5 w-5" />
                Pagamenti Ricorrenti
              </NavLink>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <ChartBarIcon className="mr-3 h-5 w-5" />
                Analisi
              </NavLink>
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="bg-gray-200 rounded-full p-1">
                  <UserIcon className="h-8 w-8 text-gray-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {getUserDisplayName()}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    <LogoutIcon className="mr-1 h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold text-blue-600">Finance Tracker</h1>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-25"
          onClick={closeMobileMenu}
        >
          <div
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center justify-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-blue-600">
                  Finance Tracker
                </h1>
              </div>
              <div className="mt-8 flex-grow flex flex-col">
                <nav className="flex-1 px-2 space-y-1">
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                    onClick={closeMobileMenu}
                    end
                  >
                    <HomeIcon className="mr-3 h-5 w-5" />
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/transactions"
                    className={({ isActive }) =>
                      `group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                    onClick={closeMobileMenu}
                  >
                    <CreditCardIcon className="mr-3 h-5 w-5" />
                    Transazioni
                  </NavLink>
                  <NavLink
                    to="/categories"
                    className={({ isActive }) =>
                      `group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                    onClick={closeMobileMenu}
                  >
                    <TagIcon className="mr-3 h-5 w-5" />
                    Categorie
                  </NavLink>
                  <NavLink
                    to="/recurrent-payments"
                    className={({ isActive }) =>
                      `group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                    onClick={closeMobileMenu}
                  >
                    <ChevronUpIcon className="mr-3 h-5 w-5" />
                    Pagamenti Ricorrenti
                  </NavLink>
                  <NavLink
                    to="/analytics"
                    className={({ isActive }) =>
                      `group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                    onClick={closeMobileMenu}
                  >
                    <ChartBarIcon className="mr-3 h-5 w-5" />
                    Analisi
                  </NavLink>
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex-shrink-0 w-full group block">
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full p-1">
                      <UserIcon className="h-8 w-8 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">
                        {getUserDisplayName()}
                      </p>
                      <button
                        onClick={handleLogout}
                        className="flex items-center text-xs font-medium text-gray-500 hover:text-gray-700"
                      >
                        <LogoutIcon className="mr-1 h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 pt-16 md:pt-0">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
