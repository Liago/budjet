import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Notification, NotificationGroup } from "../../types/notification";
import { notificationService } from "../../services/notificationService";
import { NotificationItem } from "./notification-item";
import { NotificationBadge } from "./notification-badge";
import { NotificationSettingsModal } from "./notification-settings-modal";
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  AdjustmentsHorizontalIcon,
} from "../Icons";

interface NotificationDropdownProps {
  maxHeight?: number;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  maxHeight = 400,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groupedNotifications, setGroupedNotifications] = useState<
    NotificationGroup[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Carica le notifiche
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);

      // Aggiorna il conteggio delle non lette
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);

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

    // Aggiorna periodicamente il conteggio delle non lette (ogni 60 secondi)
    const interval = setInterval(async () => {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Aggiorna le notifiche quando cambia il filtro
  useEffect(() => {
    const grouped = notificationService.groupNotificationsByDate(
      filter === "unread" ? notifications.filter((n) => !n.read) : notifications
    );
    setGroupedNotifications(grouped);
  }, [filter, notifications]);

  // Chiudi dropdown quando si clicca all'esterno
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Marca una notifica come letta
  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);

    // Aggiorna lo stato locale
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    // Aggiorna il conteggio
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Marca tutte le notifiche come lette
  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();

    // Aggiorna lo stato locale
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Toggle del dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);

    // Se stiamo aprendo il dropdown, aggiorna le notifiche
    if (!isOpen) {
      fetchNotifications();
    }
  };

  // Apri modale impostazioni
  const openSettingsModal = () => {
    setIsSettingsModalOpen(true);
    setIsOpen(false); // Chiudi dropdown quando apri la modale
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Icona campanella con badge */}
      <button
        className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
      >
        <span className="sr-only">Notifiche</span>
        <BellIcon className="h-6 w-6" />
        <NotificationBadge count={unreadCount} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Notifiche</h3>
            <div className="flex space-x-2">
              {/* Filtro */}
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  className={`px-3 py-1 text-xs font-medium rounded-l-md ${
                    filter === "all"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setFilter("all")}
                >
                  Tutte
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 text-xs font-medium rounded-r-md ${
                    filter === "unread"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setFilter("unread")}
                >
                  Non lette
                </button>
              </div>

              {/* Segna tutte come lette */}
              {unreadCount > 0 && (
                <button
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  <span>Segna tutte</span>
                </button>
              )}
            </div>
          </div>

          {/* Notifications list */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Caricamento notifiche...
              </div>
            ) : groupedNotifications.length > 0 ? (
              groupedNotifications.map((group, idx) => (
                <div key={idx}>
                  <div className="sticky top-0 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500">
                    {group.title}
                  </div>
                  {group.notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <BellIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2">
                  Nessuna notifica {filter === "unread" ? "non letta" : ""}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 flex justify-between bg-gray-50">
            <button
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
              onClick={openSettingsModal}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
              <span>Impostazioni notifiche</span>
            </button>
            <Link
              to="/notifications"
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={() => setIsOpen(false)}
            >
              Vedi tutte le notifiche
            </Link>
          </div>
        </div>
      )}

      {/* Modale impostazioni notifiche */}
      <NotificationSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};
