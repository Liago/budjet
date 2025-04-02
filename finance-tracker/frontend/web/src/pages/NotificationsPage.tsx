import React, { useState, useEffect } from "react";
import { notificationService } from "../services/notificationService";
import { Notification, NotificationGroup } from "../types/notification";
import Layout from "../components/Layout";
import { NotificationItem } from "../components/ui/notification-item";
import { NotificationSettingsModal } from "../components/ui/notification-settings-modal";
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  AdjustmentsHorizontalIcon,
} from "../components/Icons";

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groupedNotifications, setGroupedNotifications] = useState<
    NotificationGroup[]
  >([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Carica le notifiche
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);

      // Raggruppa le notifiche per data
      const grouped = notificationService.groupNotificationsByDate(
        filter === "unread" ? data.filter((n) => !n.read) : data
      );
      setGroupedNotifications(grouped);
    } catch (error) {
      console.error("Errore nel caricamento delle notifiche:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carica le notifiche all'avvio
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Aggiorna le notifiche quando cambia il filtro
  useEffect(() => {
    const grouped = notificationService.groupNotificationsByDate(
      filter === "unread" ? notifications.filter((n) => !n.read) : notifications
    );
    setGroupedNotifications(grouped);
  }, [filter, notifications]);

  // Marca una notifica come letta
  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);

    // Aggiorna lo stato locale
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Marca tutte le notifiche come lette
  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();

    // Aggiorna lo stato locale
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Elimina una notifica
  const handleDeleteNotification = async (id: string) => {
    await notificationService.deleteNotification(id);

    // Aggiorna lo stato locale
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifiche</h1>
            <p className="mt-2 text-sm text-gray-600">
              Visualizza e gestisci tutte le tue notifiche
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                  filter === "all"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
                onClick={() => setFilter("all")}
              >
                Tutte
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  filter === "unread"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
                onClick={() => setFilter("unread")}
              >
                Non lette
              </button>
            </div>

            <button
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setIsSettingsModalOpen(true)}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
              <span>Impostazioni</span>
            </button>

            {notifications.some((n) => !n.read) && (
              <button
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleMarkAllAsRead}
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                <span>Segna tutte come lette</span>
              </button>
            )}
          </div>
        </div>

        {/* Separatore */}
        <div className="mt-6 border-t border-gray-200"></div>

        {/* Contenuto principale */}
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="spinner"></div>
            </div>
          ) : groupedNotifications.length > 0 ? (
            <div className="space-y-8">
              {groupedNotifications.map((group, idx) => (
                <div
                  key={idx}
                  className="bg-white shadow rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700">
                      {group.title}
                    </h3>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {group.notifications.map((notification) => (
                      <li key={notification.id} className="p-4">
                        <NotificationItem
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                          showDelete
                          onDelete={() =>
                            handleDeleteNotification(notification.id)
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-white p-8 rounded-lg shadow">
              <BellIcon className="h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Nessuna notifica
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Non hai{" "}
                {filter === "unread" ? "notifiche non lette" : "notifiche"} al
                momento.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modale impostazioni notifiche */}
      <NotificationSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </Layout>
  );
};

export default NotificationsPage;
