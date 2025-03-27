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
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            {enableMultiSelect && (
              <th className="text-center p-3">
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
                <td className="p-3 whitespace-nowrap">
                  <div className="font-medium">{transaction.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.tags.map((tag) => tag.name).join(", ")}
                  </div>
                </td>
                <td className="p-3 whitespace-nowrap">
                  <div>{new Date(transaction.date).toLocaleDateString()}</div>
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
                      transaction.type === "INCOME" ? "default" : "destructive"
                    }
                    className={
                      transaction.type === "INCOME"
                        ? "bg-green-100 text-green-800"
                        : ""
                    }
                  >
                    {transaction.type === "INCOME" ? "+€ " : "-€ "}
                    {formatAmount(transaction.amount).substring(2)}
                  </Badge>
                </td>
                <td className="p-3 whitespace-nowrap text-right">
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
        <div className="p-3 border-t flex items-center justify-between bg-muted/20">
          <div className="text-sm font-medium">
            {selectedTransactions.length} transaction
            {selectedTransactions.length !== 1 ? "s" : ""} selected
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => setSelectedTransactions([])}
            >
              Deselect All
            </Button>
            <Button
              variant="default"
              size="sm"
              className="ml-2"
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
