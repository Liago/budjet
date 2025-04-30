import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { RootState } from "../store";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { toast } from "sonner";
import { useTheme } from "../utils/hooks/useTheme";

// Icons
import {
  HomeIcon,
  CreditCardIcon,
  TagIcon,
  ChartBarIcon,
  ChevronUpIcon,
  MenuIcon,
  XIcon,
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
import { NotificationDropdown } from "./ui/notification-dropdown";

// Modifichiamo il tipo per accettare children come prop
interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    "test" | "transactions"
  >("test");
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout() as any);
    setIsUserMenuOpen(false);
  };

  const handleTestEmail = async () => {
    setIsUserMenuOpen(false);
    setShowEmailModal(true);
  };

  const handleSendTestEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ template: selectedTemplate }),
      });

      if (!response.ok) {
        throw new Error("Failed to send test email");
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Email di test inviata con successo!");
        setShowEmailModal(false);
      } else {
        toast.error("Errore nell'invio dell'email: " + data.error);
      }
    } catch (error) {
      toast.error("Errore nell'invio dell'email");
      console.error("Error sending test email:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`h-screen flex overflow-hidden ${
        isDark ? "dark" : ""
      } bg-background`}
    >
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-card border-r border-border">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-border">
            <h1 className="text-xl font-bold text-primary">Bud-Jet</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-3 py-4 space-y-1">
              <div className="space-y-0.5">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-lg ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent/50"
                    }`
                  }
                >
                  <HomeIcon
                    className={({ isActive }) =>
                      `mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive
                          ? "text-accent-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
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
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent/50"
                    }`
                  }
                >
                  <CreditCardIcon
                    className={({ isActive }) =>
                      `mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive
                          ? "text-accent-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
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
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent/50"
                    }`
                  }
                >
                  <TagIcon
                    className={({ isActive }) =>
                      `mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive
                          ? "text-accent-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
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
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent/50"
                    }`
                  }
                >
                  <ChevronUpIcon
                    className={({ isActive }) =>
                      `mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive
                          ? "text-accent-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
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
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent/50"
                    }`
                  }
                >
                  <ChartBarIcon
                    className={({ isActive }) =>
                      `mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive
                          ? "text-accent-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
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
        <div className="sticky top-0 z-10 flex-shrink-0 h-16 bg-card border-b border-border">
          <div className="flex items-center justify-between px-4 h-full">
            {/* Left side - Mobile menu button & Search */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 focus:outline-none"
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
                <div className="relative text-muted-foreground focus-within:text-foreground">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <SearchIcon className="h-5 w-5" />
                  </div>
                  <input
                    id="search"
                    className="block w-full bg-background py-2 pl-10 pr-3 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Search or type command..."
                    type="search"
                  />
                  <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                    <kbd className="inline-flex items-center border border-border rounded px-2 text-sm font-sans font-medium text-muted-foreground">
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
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
                aria-label={
                  isDark ? "Passa al tema chiaro" : "Passa al tema scuro"
                }
              >
                {isDark ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>

              {/* Notifications */}
              <NotificationDropdown />

              {/* User menu */}
              <div className="relative">
                <button
                  className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-accent/50"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <img
                    className="h-8 w-8 rounded-full"
                    src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`}
                    alt={`${user?.firstName} ${user?.lastName}`}
                  />
                  <div className="hidden md:flex md:items-center">
                    <span className="text-sm font-medium text-foreground">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <ChevronDownIcon className="ml-2 h-4 w-4 text-muted-foreground" />
                  </div>
                </button>

                {/* Dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-popover py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium text-foreground">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleTestEmail}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent/50 flex items-center"
                      >
                        <MailIcon className="mr-3 h-4 w-4 text-muted-foreground" />
                        Test Email
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent/50 flex items-center"
                      >
                        <LogOutIcon className="mr-3 h-4 w-4 text-muted-foreground" />
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
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6">
          {/* Rendiamo il componente flessibile per mostrare o children o Outlet */}
          <div className="container mx-auto max-w-full">
            {children ? children : <Outlet />}
          </div>
        </main>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-card">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={closeMobileMenu}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-foreground"
              >
                <span className="sr-only">Close sidebar</span>
                <XIcon className="h-6 w-6 text-foreground" />
              </button>
            </div>
            {/* Mobile menu content */}
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-bold text-primary">Bud-Jet</h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {/* Mobile navigation links */}
                {/* ... (same NavLink components as desktop but with mobile-specific classes) ... */}
              </nav>
            </div>
            {/* Mobile theme toggle */}
            <div className="border-t border-border p-4">
              <button
                onClick={toggleTheme}
                className="flex items-center w-full px-2 py-2 text-sm text-foreground hover:bg-accent/50 rounded-lg"
              >
                {isDark ? (
                  <>
                    <SunIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                    <span>Passa al tema chiaro</span>
                  </>
                ) : (
                  <>
                    <MoonIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                    <span>Passa al tema scuro</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[999] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
              onClick={() => setShowEmailModal(false)}
            />
            <div className="relative transform overflow-hidden rounded-lg bg-card text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-card px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-semibold leading-6 text-foreground">
                      Test Email Templates
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="test-template"
                          name="template"
                          value="test"
                          checked={selectedTemplate === "test"}
                          onChange={(e) =>
                            setSelectedTemplate(
                              e.target.value as "test" | "transactions"
                            )
                          }
                          className="h-4 w-4 text-primary focus:ring-primary border-border"
                        />
                        <label htmlFor="test-template" className="ml-3">
                          <span className="block text-sm font-medium text-foreground">
                            Template Base
                          </span>
                          <span className="block text-sm text-muted-foreground">
                            Email di test base con conferma configurazione
                          </span>
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="transactions-template"
                          name="template"
                          value="transactions"
                          checked={selectedTemplate === "transactions"}
                          onChange={(e) =>
                            setSelectedTemplate(
                              e.target.value as "test" | "transactions"
                            )
                          }
                          className="h-4 w-4 text-primary focus:ring-primary border-border"
                        />
                        <label htmlFor="transactions-template" className="ml-3">
                          <span className="block text-sm font-medium text-foreground">
                            Template Transazioni
                          </span>
                          <span className="block text-sm text-muted-foreground">
                            Email con tabella transazioni e riepilogo
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-accent/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={isLoading}
                  className="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Invio in corso...
                    </>
                  ) : (
                    "Invia Test Email"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-accent/50 sm:mt-0 sm:w-auto"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
