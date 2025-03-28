import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { RootState } from "../store";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";

// Icons
import {
  HomeIcon,
  CreditCardIcon,
  TagIcon,
  ChartBarIcon,
  ChevronUpIcon,
  MenuIcon,
  XIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  SearchIcon,
  UserIcon,
  ChevronDownIcon,
  MailIcon,
  LogOutIcon,
} from "./Icons";

// Components
import { UserProfile } from "./UserProfile";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsUserMenuOpen(false);
  };

  const handleTestEmail = () => {
    // La logica per il test email è già implementata nel componente UserProfile
    setIsUserMenuOpen(false);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r border-gray-200">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">Bud-Jet</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-3 py-4 space-y-1">
              <div className="space-y-0.5">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-lg ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <HomeIcon
                    className={({ isActive }) =>
                      `mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`
                    }
                  />
                  Dashboard
                </NavLink>

                <NavLink
                  to="/transactions"
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-lg ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <CreditCardIcon
                    className={({ isActive }) =>
                      `mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`
                    }
                  />
                  Transazioni
                </NavLink>

                <NavLink
                  to="/categories"
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-lg ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <TagIcon
                    className={({ isActive }) =>
                      `mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`
                    }
                  />
                  Categorie
                </NavLink>

                <NavLink
                  to="/recurrent-payments"
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-lg ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <ChevronUpIcon
                    className={({ isActive }) =>
                      `mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`
                    }
                  />
                  Pagamenti Ricorrenti
                </NavLink>

                <NavLink
                  to="/analytics"
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-lg ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <ChartBarIcon
                    className={({ isActive }) =>
                      `mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`
                    }
                  />
                  Analisi
                </NavLink>
              </div>
            </nav>
          </div>
        </div>
      </aside>

      {/* Header bar */}
      <div className="flex-1 flex flex-col md:pl-64">
        <div className="sticky top-0 z-10 flex-shrink-0 h-16 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 h-full">
            {/* Left side - Mobile menu button & Search */}
            <div className="flex items-center md:hidden">
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

            {/* Search bar */}
            <div className="flex-1 px-4 flex justify-center lg:justify-end">
              <div className="w-full max-w-lg lg:max-w-xs">
                <label htmlFor="search" className="sr-only">
                  Search
                </label>
                <div className="relative text-gray-400 focus-within:text-gray-600">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <SearchIcon className="h-5 w-5" />
                  </div>
                  <input
                    id="search"
                    className="block w-full bg-white py-2 pl-10 pr-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search or type command..."
                    type="search"
                  />
                  <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                    <kbd className="inline-flex items-center border border-gray-200 rounded px-2 text-sm font-sans font-medium text-gray-400">
                      ⌘K
                    </kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - User menu, notifications, theme */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>

              {/* Notifications */}
              <button className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg relative">
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-gray-100"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <img
                    className="h-8 w-8 rounded-full"
                    src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`}
                    alt={`${user?.firstName} ${user?.lastName}`}
                  />
                  <div className="hidden md:flex md:items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-500" />
                  </div>
                </button>

                {/* Dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleTestEmail}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <MailIcon className="mr-3 h-4 w-4 text-gray-400" />
                        Test Email
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <LogOutIcon className="mr-3 h-4 w-4 text-gray-400" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={closeMobileMenu}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={closeMobileMenu}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Close sidebar</span>
                <XIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            {/* Mobile menu content */}
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-bold text-blue-600">Bud-Jet</h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {/* Mobile navigation links */}
                {/* ... (same NavLink components as desktop but with mobile-specific classes) ... */}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
