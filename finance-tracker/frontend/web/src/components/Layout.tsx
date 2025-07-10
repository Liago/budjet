import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { RootState } from "../store";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { toast } from "sonner";
import { apiService } from "../utils/api";
import { useTheme } from "../utils/hooks/useTheme";
import { useUIPreferences } from "../utils/hooks/useUIPreferences";

// Icons
import {
  HomeIcon,
  CreditCardIcon,
  TagIcon,
  ChartBarIcon,
  ChevronUpIcon,
  SunIcon,
  MoonIcon,
  SearchIcon,
  UserIcon,
  ChevronDownIcon,
  MailIcon,
  LogOutIcon,
  Settings,
} from "./Icons";

// New Sidebar Components
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";

// Components
import { UserProfile } from "./UserProfile";
import { NotificationDropdown } from "./ui/notification-dropdown";

// Modifichiamo il tipo per accettare children come prop
interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Rimpiazzo lo stato locale con il hook Redux
  const {
    sidebarOpen,
    preferences,
    setSidebarOpenState,
    toggleSidebarState,
    handleSidebarMouseEnter,
    handleSidebarMouseLeave,
  } = useUIPreferences();

  const { isDark, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    "test" | "transactions"
  >("test");
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
      const data = await apiService.post<{ success: boolean; error?: string }>(
        "/direct/email/test",
        {
          template: selectedTemplate,
        }
      );

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

  // Definizione dei link della sidebar
  const sidebarLinks = [
    {
      label: "Dashboard",
      href: "/",
      icon: (
        <HomeIcon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Transazioni",
      href: "/transactions",
      icon: (
        <CreditCardIcon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Categorie",
      href: "/categories",
      icon: (
        <TagIcon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Pagamenti Ricorrenti",
      href: "/recurrent-payments",
      icon: (
        <ChevronUpIcon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Analisi",
      href: "/analytics",
      icon: (
        <ChartBarIcon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-neutral-800">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpenState}>
        <SidebarBody
          className="justify-between gap-10"
          onMouseEnter={handleSidebarMouseEnter}
          onMouseLeave={handleSidebarMouseLeave}
        >
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Logo */}
            <div className="mt-8 mb-8">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
                  Bud-Jet
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col gap-2">
              {sidebarLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>

          {/* User Profile Section */}
          <div>
            <SidebarLink
              link={{
                label: user?.firstName + " " + user?.lastName || "User",
                href: "#",
                icon: (
                  <img
                    src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`}
                    className="h-7 w-7 flex-shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Search or title */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cerca..."
                  className="pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Right side - Actions */}
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
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate("/preferences");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent/50 flex items-center"
                      >
                        <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                        Preferenze
                      </button>
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
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-neutral-900 p-6">
          {/* Rendiamo il componente flessibile per mostrare o children o Outlet */}
          <div className="container mx-auto max-w-full">
            {children ? children : <Outlet />}
          </div>
        </main>
      </div>

      {/* Email Test Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Test Email</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Template:
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) =>
                  setSelectedTemplate(e.target.value as "test" | "transactions")
                }
                className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700"
              >
                <option value="test">Template Base</option>
                <option value="transactions">Template Transazioni</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={handleSendTestEmail}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Invio..." : "Invia"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
