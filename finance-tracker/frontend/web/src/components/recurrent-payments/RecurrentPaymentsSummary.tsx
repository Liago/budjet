import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecurrentPayment } from "../../utils/types";

interface RecurrentPaymentsSummaryProps {
  payments: RecurrentPayment[];
  formatAmount: (amount: number | string) => string;
}

const RecurrentPaymentsSummary: React.FC<RecurrentPaymentsSummaryProps> = ({
  payments,
  formatAmount,
}) => {
  // Calculate total monthly amount from active payments
  const totalMonthlyAmount = payments
    .filter((payment) => payment.isActive)
    .reduce((sum, payment) => {
      const amount =
        typeof payment.amount === "string"
          ? parseFloat(payment.amount)
          : payment.amount;
      return sum + amount;
    }, 0);

  // Count active and inactive payments
  const activePayments = payments.filter((payment) => payment.isActive).length;
  const inactivePayments = payments.filter(
    (payment) => !payment.isActive
  ).length;

  return (
    <Card className="col-span-3">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="text-lg flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-600"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            <path d="M12 7v10" />
            <path d="M12 7h5" />
            <path d="M12 7H7" />
          </svg>
          Pagamenti Ricorrenti
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-4xl font-bold text-blue-600">
              {formatAmount(totalMonthlyAmount)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Totale mensile dei pagamenti attivi
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {activePayments} attivi
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {inactivePayments} inattivi
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {payments.length} pagamenti totali
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecurrentPaymentsSummary;
