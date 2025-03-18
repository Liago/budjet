import React from 'react';
import { Transaction } from '../../utils/types';
import { EditIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '../Icons';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TransactionListProps {
  transactions: Transaction[];
  sortField: "date" | "amount";
  sortDirection: "asc" | "desc";
  onSort: (field: "date" | "amount") => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
  isDeleting: boolean;
  formatAmount: (amount: number | string) => string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  isLoading,
  isDeleting,
  formatAmount
}) => {
  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left text-xs font-medium p-3 uppercase text-muted-foreground">
              Description
            </th>
            <th
              className="text-left text-xs font-medium p-3 uppercase text-muted-foreground cursor-pointer"
              onClick={() => onSort("date")}
            >
              <div className="flex items-center">
                Date
                {sortField === "date" &&
                  (sortDirection === "asc" ? (
                    <ArrowUpIcon className="ml-1 h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </th>
            <th className="text-left text-xs font-medium p-3 uppercase text-muted-foreground">
              Category
            </th>
            <th
              className="text-left text-xs font-medium p-3 uppercase text-muted-foreground cursor-pointer"
              onClick={() => onSort("amount")}
            >
              <div className="flex items-center">
                Amount
                {sortField === "amount" &&
                  (sortDirection === "asc" ? (
                    <ArrowUpIcon className="ml-1 h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </th>
            <th className="text-right text-xs font-medium p-3 uppercase text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-muted/50">
                <td className="p-3 whitespace-nowrap">
                  <div className="font-medium">
                    {transaction.description}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.tags.map((tag) => tag.name).join(", ")}
                  </div>
                </td>
                <td className="p-3 whitespace-nowrap">
                  <div>
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className="h-6 w-6 rounded-full mr-2"
                      style={{
                        backgroundColor: transaction.category.color,
                      }}
                    ></div>
                    <div>{transaction.category.name}</div>
                  </div>
                </td>
                <td className="p-3 whitespace-nowrap">
                  <Badge
                    variant={
                      transaction.type === "INCOME"
                        ? "default"
                        : "destructive"
                    }
                    className={
                      transaction.type === "INCOME"
                        ? "bg-green-100 text-green-800"
                        : ""
                    }
                  >
                    {transaction.type === "INCOME" ? "+€ " : "-€ "}
                    {
                      formatAmount(transaction.amount).substring(2) // Rimuoviamo il simbolo € perché lo aggiungiamo prima con il segno + o -
                    }
                  </Badge>
                </td>
                <td className="p-3 whitespace-nowrap text-right">
                  <Button
                    onClick={() => onEdit(transaction)}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-900 mr-2"
                    disabled={isLoading}
                  >
                    <EditIcon className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => onDelete(transaction.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-900"
                    disabled={isLoading || isDeleting}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={5}
                className="p-3 text-center text-muted-foreground"
              >
                No transactions found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList; 