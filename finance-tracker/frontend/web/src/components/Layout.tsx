import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { RootState } from "../store";
import { useSelector } from "react-redux";

// Icons
import {
  HomeIcon,
  CreditCardIcon,
  TagIcon,
  ChartBarIcon,
  ChevronUpIcon,
  MenuIcon,
  XIcon,
} from "./Icons";

// Components
import { UserProfile } from "./UserProfile";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white shadow-sm">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-blue-600">Bud-Jet</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <HomeIcon
                  className={({ isActive }) =>
                    `mr-3 flex-shrink-0 h-6 w-6 ${
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
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <CreditCardIcon
                  className={({ isActive }) =>
                    `mr-3 flex-shrink-0 h-6 w-6 ${
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
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <TagIcon
                  className={({ isActive }) =>
                    `mr-3 flex-shrink-0 h-6 w-6 ${
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
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <ChevronUpIcon
                  className={({ isActive }) =>
                    `mr-3 flex-shrink-0 h-6 w-6 ${
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
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <ChartBarIcon
                  className={({ isActive }) =>
                    `mr-3 flex-shrink-0 h-6 w-6 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`
                  }
                />
                Analisi
              </NavLink>
            </nav>
          </div>

          {/* User Profile */}
          <UserProfile />
        </div>
      </aside>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold text-blue-600">Bud-Jet</h1>
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
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={closeMobileMenu}
          ></div>

          {/* Menu content */}
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

            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-bold text-blue-600">Bud-Jet</h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                  onClick={closeMobileMenu}
                >
                  <HomeIcon
                    className={({ isActive }) =>
                      `mr-4 flex-shrink-0 h-6 w-6 ${
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
                    `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                  onClick={closeMobileMenu}
                >
                  <CreditCardIcon
                    className={({ isActive }) =>
                      `mr-4 flex-shrink-0 h-6 w-6 ${
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
                    `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                  onClick={closeMobileMenu}
                >
                  <TagIcon
                    className={({ isActive }) =>
                      `mr-4 flex-shrink-0 h-6 w-6 ${
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
                    `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                  onClick={closeMobileMenu}
                >
                  <ChevronUpIcon
                    className={({ isActive }) =>
                      `mr-4 flex-shrink-0 h-6 w-6 ${
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
                    `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                  onClick={closeMobileMenu}
                >
                  <ChartBarIcon
                    className={({ isActive }) =>
                      `mr-4 flex-shrink-0 h-6 w-6 ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`
                    }
                  />
                  Analisi
                </NavLink>
              </nav>
            </div>

            {/* Mobile User Profile */}
            <UserProfile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 pt-16 md:pt-0 overflow-scroll">
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
