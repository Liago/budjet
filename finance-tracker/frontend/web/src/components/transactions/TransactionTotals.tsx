import React from "react";
import { Transaction } from "../../utils/types";

interface TransactionTotalsProps {
  transactions: Transaction[];
  totalItems: number;
  formatAmount: (amount: number | string) => string;
}

interface TotalsData {
  income: number;
  expense: number;
  balance: number;
}

const TransactionTotals: React.FC<TransactionTotalsProps> = ({
  transactions,
  totalItems,
  formatAmount,
}) => {
  // Calcola i totali delle transazioni filtrate
  const calculateTotals = (): TotalsData => {
    const totals = {
      income: 0,
      expense: 0,
      balance: 0,
    };

    transactions.forEach((transaction) => {
      if (transaction.type === "INCOME") {
        totals.income += Number(transaction.amount);
      } else {
        totals.expense += Number(transaction.amount);
      }
    });

    totals.balance = totals.income - totals.expense;
    return totals;
  };

  const transactionTotals = calculateTotals();

  return (
    <div className="sm:flex-1">
      <p className="text-xs text-muted-foreground">
        <span className="font-medium">{transactions.length}</span> di{" "}
        <span className="font-medium">{totalItems}</span> transazioni
      </p>
      <div className="mt-1 flex space-x-3 text-xs">
        <span className="text-green-600 font-medium whitespace-nowrap">
          +{formatAmount(transactionTotals.income)}
        </span>
        <span className="text-red-600 font-medium whitespace-nowrap">
          -{formatAmount(transactionTotals.expense)}
        </span>
        <span
          className={`font-medium whitespace-nowrap ${
            transactionTotals.balance >= 0 ? "text-blue-600" : "text-red-600"
          }`}
        >
          = {formatAmount(Math.abs(transactionTotals.balance))}{" "}
          {transactionTotals.balance < 0 ? "🔻" : ""}
        </span>
      </div>
    </div>
  );
};

export default TransactionTotals;
