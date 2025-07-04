import React from "react";
import { Transaction } from "../../utils/types";
import {
  EditIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
} from "../Icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CurrencyDisplay } from "@/components/ui/currency-display";

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
  selectedTransactions: string[];
  setSelectedTransactions: (ids: string[]) => void;
  enableMultiSelect: boolean;
  onBulkEdit: (transactions: Transaction[]) => void;
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
  formatAmount,
  selectedTransactions,
  setSelectedTransactions,
  enableMultiSelect,
  onBulkEdit,
}) => {
  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transactions.map((t) => t.id));
    }
  };

  const handleSelectTransaction = (id: string) => {
    if (selectedTransactions.includes(id)) {
      setSelectedTransactions(selectedTransactions.filter((tid) => tid !== id));
    } else {
      setSelectedTransactions([...selectedTransactions, id]);
    }
  };

  const getSelectedTransactionsData = (): Transaction[] => {
    return transactions.filter((t) => selectedTransactions.includes(t.id));
  };

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="min-w-full divide-y divide-border table-fixed">
        <thead className="bg-muted/50">
          <tr>
            {enableMultiSelect && (
              <th className="text-center p-3 w-12">
                <Checkbox
                  checked={
                    transactions.length > 0 &&
                    selectedTransactions.length === transactions.length
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all transactions"
                />
              </th>
            )}
            <th className="text-left text-xs font-medium p-3 uppercase text-muted-foreground w-1/4">
              Description
            </th>
            <th
              className="text-left text-xs font-medium p-3 uppercase text-muted-foreground cursor-pointer w-1/6"
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
            <th className="text-left text-xs font-medium p-3 uppercase text-muted-foreground w-1/6">
              Category
            </th>
            <th
              className="text-right text-xs font-medium p-3 uppercase text-muted-foreground cursor-pointer w-1/6"
              onClick={() => onSort("amount")}
            >
              <div className="flex items-center justify-end">
                Amount
                {sortField === "amount" &&
                  (sortDirection === "asc" ? (
                    <ArrowUpIcon className="ml-1 h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </th>
            <th className="text-right text-xs font-medium p-3 uppercase text-muted-foreground w-24">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-muted/50">
                {enableMultiSelect && (
                  <td className="p-3 text-center">
                    <Checkbox
                      checked={selectedTransactions.includes(transaction.id)}
                      onCheckedChange={() =>
                        handleSelectTransaction(transaction.id)
                      }
                      aria-label={`Select transaction ${transaction.description}`}
                    />
                  </td>
                )}
                <td className="p-3">
                  <div className="font-medium truncate">
                    {transaction.description}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {transaction.tags && transaction.tags.length > 0
                      ? transaction.tags.map((tag) => tag.name).join(", ")
                      : "No tags"}
                  </div>
                </td>
                <td className="p-3">
                  <div className="font-mono text-sm">
                    {new Date(transaction.date).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString("it-IT", {
                      weekday: "short",
                    })}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center">
                    <div
                      className="h-6 w-6 flex-shrink-0 rounded-full mr-2"
                      style={{
                        backgroundColor: transaction.category.color,
                      }}
                    ></div>
                    <div className="truncate">{transaction.category.name}</div>
                  </div>
                </td>
                <td className="p-3">
                  <CurrencyDisplay
                    amount={transaction.amount}
                    type={transaction.type}
                    variant="default"
                    showType={true}
                  />
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(transaction)}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(transaction.id)}
                      disabled={isDeleting}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={enableMultiSelect ? 6 : 5}
                className="p-4 text-center text-muted-foreground"
              >
                No transactions found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {enableMultiSelect && selectedTransactions.length > 0 && (
        <div className="p-3 border-t flex items-center justify-between bg-muted/20 flex-wrap gap-2">
          <div className="text-sm font-medium">
            {selectedTransactions.length} transaction
            {selectedTransactions.length !== 1 ? "s" : ""} selected
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTransactions([])}
            >
              Deselect All
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onBulkEdit(getSelectedTransactionsData())}
            >
              Edit Selected
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
