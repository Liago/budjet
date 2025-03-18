import React from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../utils/hooks";

interface NavigationItem {
  name: string;
  path: string;
  icon: string;
}

const Sidebar: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const navigationItems: NavigationItem[] = [
    {
      name: "Dashboard",
      path: "/",
      icon: "dashboard",
    },
    {
      name: "Transazioni",
      path: "/transactions",
      icon: "currency-euro",
    },
    {
      name: "Categorie",
      path: "/categories",
      icon: "tag",
    },
    {
      name: "Budget",
      path: "/budgets",
      icon: "chart-pie",
    },
    {
      name: "Pagamenti Ricorrenti",
      path: "/recurrent-payments",
      icon: "refresh",
    },
    {
      name: "Analisi",
      path: "/analytics",
      icon: "chart-bar",
    },
  ];

  const accountItems: NavigationItem[] = [
    {
      name: "Profilo",
      path: "/profile",
      icon: "user",
    },
    {
      name: "Impostazioni",
      path: "/settings",
      icon: "cog",
    },
  ];
  
  // Funzione per rendere l'icona
  const renderIcon = (iconName: string) => {
    // In una implementazione reale, qui andrebbero usate icone da una libreria come FontAwesome o Heroicons
    return <span className="icon">{iconName.charAt(0).toUpperCase()}</span>;
  };

  // Funzione per ottenere il nome completo o le iniziali dell'utente
  const getUserDisplayName = () => {
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`;
  };

  // Funzione per ottenere le iniziali dell'utente
  const getUserInitials = () => {
    if (!user) return '';
    return user.firstName.charAt(0);
  };

  return (
    <aside className="flex flex-col w-64 h-screen bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 px-4">
        <h1 className="text-xl font-bold text-blue-600">Finance Tracker</h1>
      </div>

      {/* User info */}
      {user && (
        <div className="flex items-center px-4 py-2 border-b border-gray-200">
          <div className="w-10 h-10 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {getUserInitials()}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{getUserDisplayName()}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <div className="pb-2">
          <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Principale
          </p>
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-2 py-2 mt-1 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
              end={item.path === "/"}
            >
              <div className="mr-3 text-lg">{renderIcon(item.icon)}</div>
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="pt-2 mt-2 border-t border-gray-200">
          <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Account
          </p>
          {accountItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-2 py-2 mt-1 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <div className="mr-3 text-lg">{renderIcon(item.icon)}</div>
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-2 mt-auto text-xs text-gray-500 border-t border-gray-200">
        <p>© {new Date().getFullYear()} Finance Tracker</p>
        <p>Versione 1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
