import React from "react";
import { Transaction } from "../../utils/types";

interface TransactionTotalsProps {
  transactions: Transaction[];
  totalItems: number;
  formatAmount: (amount: number) => string;
}

interface TotalsData {
  income: number;
  expense: number;
  balance: number;
  averageIncome: number;
  averageExpense: number;
  averageTotal: number;
}

const TransactionTotals: React.FC<TransactionTotalsProps> = ({
  transactions,
  totalItems,
  formatAmount,
}) => {
  // Calcola i totali e le medie delle transazioni filtrate
  const calculateTotalsAndAverages = (): TotalsData => {
    const totals = {
      income: 0,
      expense: 0,
      balance: 0,
      averageIncome: 0,
      averageExpense: 0,
      averageTotal: 0,
    };

    const incomeTransactions: number[] = [];
    const expenseTransactions: number[] = [];

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount);
      if (transaction.type === "INCOME") {
        totals.income += amount;
        incomeTransactions.push(amount);
      } else {
        totals.expense += amount;
        expenseTransactions.push(amount);
      }
    });

    totals.balance = totals.income - totals.expense;

    // Calcola le medie
    totals.averageIncome =
      incomeTransactions.length > 0
        ? totals.income / incomeTransactions.length
        : 0;

    totals.averageExpense =
      expenseTransactions.length > 0
        ? totals.expense / expenseTransactions.length
        : 0;

    totals.averageTotal =
      transactions.length > 0
        ? (totals.income + totals.expense) / transactions.length
        : 0;

    return totals;
  };

  const transactionTotals = calculateTotalsAndAverages();
  const incomeCount = transactions.filter((t) => t.type === "INCOME").length;
  const expenseCount = transactions.filter((t) => t.type === "EXPENSE").length;

  return (
    <div className="sm:flex-1">
      <p className="text-xs text-muted-foreground">
        <span className="font-medium">{transactions.length}</span> di{" "}
        <span className="font-medium">{totalItems}</span> transazioni
      </p>

      {/* Totali */}
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

      {/* Medie */}
      {transactions.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-muted-foreground mb-1 font-medium">
            Medie:
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {incomeCount > 0 && (
              <span className="text-green-600 font-medium whitespace-nowrap">
                ⌀ Entrate: {formatAmount(transactionTotals.averageIncome)} (
                {incomeCount})
              </span>
            )}
            {expenseCount > 0 && (
              <span className="text-red-600 font-medium whitespace-nowrap">
                ⌀ Uscite: {formatAmount(transactionTotals.averageExpense)} (
                {expenseCount})
              </span>
            )}
            <span className="text-blue-600 font-medium whitespace-nowrap">
              ⌀ Totale: {formatAmount(transactionTotals.averageTotal)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTotals;
