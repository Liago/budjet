import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createPortal } from "react-dom";

type EmailTemplate = "test" | "transactions";

interface TemplateOption {
  value: EmailTemplate;
  label: string;
  description: string;
  icon: string;
}

const templateOptions: TemplateOption[] = [
  {
    value: "test",
    label: "Template Base",
    description: "Email di test base con conferma configurazione",
    icon: "✉️",
  },
  {
    value: "transactions",
    label: "Template Transazioni",
    description: "Email con tabella transazioni e riepilogo",
    icon: "📊",
  },
];

export const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate>("test");

  const handleLogout = () => {
    dispatch(logout() as any);
    navigate("/login");
  };

  const handleTestEmail = async () => {
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
        setShowModal(false);
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

  const getUserInitials = () => {
    if (!user) return "";
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <>
      <div className="flex-shrink-0 w-full group">
        <div className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-all duration-200">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-lg shadow-lg">
              {getUserInitials()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
          </div>

          <div className="ml-4 flex-grow">
            <p className="text-sm font-semibold text-gray-900">
              {user ? `${user.firstName} ${user.lastName}` : "User"}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowModal(true)}
              disabled={isLoading}
              className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors duration-200 flex items-center gap-1"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Test Email
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors duration-200 flex items-center gap-1"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Test Email Modal */}
      {showModal &&
        createPortal(
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-[998]" />

            {/* Modal Container */}
            <div className="fixed inset-0 z-[999] overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all max-w-lg w-full">
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Test Email Templates
                      </h3>
                      <button
                        onClick={() => setShowModal(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Seleziona un template per testare l'invio delle email
                    </p>
                  </div>

                  {/* Modal Body */}
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 gap-4">
                      {templateOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`
                            relative flex p-4 rounded-lg border-2 cursor-pointer
                            ${
                              selectedTemplate === option.value
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="template"
                            value={option.value}
                            checked={selectedTemplate === option.value}
                            onChange={(e) =>
                              setSelectedTemplate(
                                e.target.value as EmailTemplate
                              )
                            }
                            className="sr-only"
                          />
                          <div className="flex items-start">
                            <div className="flex-shrink-0 text-2xl">
                              {option.icon}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">
                                {option.label}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {option.description}
                              </p>
                            </div>
                            {selectedTemplate === option.value && (
                              <div className="absolute top-4 right-4 text-blue-600">
                                <svg
                                  className="h-5 w-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Annulla
                    </button>
                    <button
                      onClick={handleTestEmail}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Invio in corso...
                        </>
                      ) : (
                        "Invia Test Email"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
};
