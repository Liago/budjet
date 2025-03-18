import React from 'react';
import { Transaction } from '../../utils/types';

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
  formatAmount
}) => {
  // Calcola i totali delle transazioni filtrate
  const calculateTotals = (): TotalsData => {
    const totals = {
      income: 0,
      expense: 0,
      balance: 0
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'INCOME') {
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
    <div>
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium">{transactions.length}</span> of{" "}
        <span className="font-medium">{totalItems}</span> transactions
      </p>
      <div className="mt-2 flex flex-wrap gap-x-4 text-sm">
        <span className="text-green-600 font-medium">
          Entrate: {formatAmount(transactionTotals.income)}
        </span>
        <span className="text-red-600 font-medium">
          Uscite: {formatAmount(transactionTotals.expense)}
        </span>
        <span className={`font-medium ${transactionTotals.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
          Bilancio: {formatAmount(transactionTotals.balance)}
        </span>
      </div>
    </div>
  );
};

export default TransactionTotals; 