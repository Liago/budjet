import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecurrentPayment, RecurrenceInterval } from '../../utils/types';
import { ArrowUpIcon, ArrowDownIcon, EditIcon, TrashIcon } from '../../components/Icons';

interface RecurrentPaymentCardProps {
  payment: RecurrentPayment;
  formatAmount: (amount: number | string) => string;
  onToggleActive: (payment: RecurrentPayment) => void;
  onEdit: (payment: RecurrentPayment) => void;
  onDelete: (id: string) => void;
}

// Funzione per ottenere il testo dell'intervallo
const getIntervalText = (
  interval: RecurrenceInterval,
  dayOfMonth?: number,
  dayOfWeek?: number
): string => {
  switch (interval) {
    case "daily":
      return "Ogni giorno";
    case "weekly":
      return "Ogni settimana";
    case "monthly":
      return dayOfMonth ? `Il giorno ${dayOfMonth} di ogni mese` : "Ogni mese";
    case "yearly":
      return "Ogni anno";
    default:
      return "Personalizzato";
  }
};

const RecurrentPaymentCard: React.FC<RecurrentPaymentCardProps> = ({
  payment,
  formatAmount,
  onToggleActive,
  onEdit,
  onDelete
}) => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: payment.category.color }}
          >
            {payment.category.icon ? (
              <span>
                {payment.category.icon.charAt(0).toUpperCase()}
              </span>
            ) : (
              <span>€</span>
            )}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              {payment.name}
              {!payment.isActive && (
                <Badge variant="outline" className="ml-2 text-xs bg-gray-100 text-gray-600">
                  Inattivo
                </Badge>
              )}
            </h3>
            <div className="mt-1 text-sm text-gray-500 space-y-1">
              <p>{payment.description}</p>
              <p className="font-medium">
                {getIntervalText(
                  payment.interval,
                  payment.dayOfMonth,
                  payment.dayOfWeek
                )}
              </p>
              <p>
                Prossimo pagamento:{" "}
                <span className="font-medium">
                  {new Date(
                    payment.nextPaymentDate
                  ).toLocaleDateString("it-IT")}
                </span>
              </p>
              {payment.endDate && (
                <p>
                  Data di fine:{" "}
                  <span className="font-medium">
                    {new Date(payment.endDate).toLocaleDateString("it-IT")}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-lg font-bold text-gray-900">
            {formatAmount(payment.amount)}
          </div>
          <div className="text-sm text-gray-500">
            {payment.category.name}
          </div>

          <div className="mt-4 flex space-x-2">
            <Button
              onClick={() => onToggleActive(payment)}
              variant="ghost"
              size="icon"
              className={payment.isActive ? "text-green-600" : "text-gray-400"}
              title={payment.isActive ? "Disattiva" : "Attiva"}
            >
              {payment.isActive ? (
                <ArrowUpIcon className="h-5 w-5" />
              ) : (
                <ArrowDownIcon className="h-5 w-5" />
              )}
            </Button>
            <Button
              onClick={() => onEdit(payment)}
              variant="ghost"
              size="icon"
              className="text-blue-600"
              title="Modifica"
            >
              <EditIcon className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => onDelete(payment.id)}
              variant="ghost"
              size="icon"
              className="text-red-600"
              title="Elimina"
            >
              <TrashIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurrentPaymentCard; 