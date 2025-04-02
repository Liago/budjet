import React from "react";
import { Link } from "react-router-dom";
import { Notification } from "../../types/notification";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

// Icons
import {
  BellIcon,
  CalendarIcon,
  ChartBarIcon,
  CreditCardIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  TagIcon,
  TrendingUp,
  DocumentIcon,
  TrashIcon,
} from "../Icons";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  showDelete = false,
  onDelete,
}) => {
  const { id, type, title, message, createdAt, read, link } = notification;

  const handleClick = () => {
    if (!read) {
      onMarkAsRead(id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDelete) {
      onDelete(id);
    }
  };

  const renderIcon = () => {
    switch (type) {
      case "BUDGET_ALERT":
        return <TagIcon className="h-6 w-6 text-orange-500" />;
      case "PAYMENT_REMINDER":
        return <CalendarIcon className="h-6 w-6 text-blue-500" />;
      case "TRANSACTION_ALERT":
        return <CreditCardIcon className="h-6 w-6 text-red-500" />;
      case "MILESTONE_REACHED":
        return <TrendingUp className="h-6 w-6 text-green-500" />;
      case "PERIOD_SUMMARY":
        return <ChartBarIcon className="h-6 w-6 text-purple-500" />;
      case "TAX_DEADLINE":
        return <DocumentIcon className="h-6 w-6 text-gray-500" />;
      case "NEW_FEATURE":
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
      case "PERSONALIZED_TIP":
        return <LightBulbIcon className="h-6 w-6 text-yellow-500" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const formattedDate = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: it,
  });

  const content = (
    <div
      className={`flex p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        read ? "opacity-70" : "bg-blue-50/30"
      }`}
      onClick={handleClick}
    >
      <div className="mr-3 flex-shrink-0">{renderIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p
            className={`text-sm font-medium ${
              read ? "text-gray-700" : "text-gray-900"
            }`}
          >
            {title}
          </p>
          <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
            {formattedDate}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{message}</p>
      </div>
      {!read && (
        <div className="ml-2 flex-shrink-0">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
        </div>
      )}
      {showDelete && onDelete && (
        <div className="ml-2 flex-shrink-0">
          <button
            className="text-gray-400 hover:text-red-500 p-1"
            onClick={handleDelete}
            aria-label="Elimina notifica"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="block">
        {content}
      </Link>
    );
  }

  return content;
};
