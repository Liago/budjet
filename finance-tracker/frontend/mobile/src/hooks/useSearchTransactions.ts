import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Transaction } from "../types/models";
import { TransactionFilters } from "../components/transactions/TransactionFilters";

export const useSearchTransactions = (
  searchQuery: string,
  filters: TransactionFilters
) => {
  const transactions = useSelector(
    (state: RootState) => state.transactions.items
  );
  const categories = useSelector((state: RootState) => state.categories.items);

  return useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return transactions.filter((transaction) => {
      // Apply existing filters first
      if (filters.type && transaction.type !== filters.type) {
        return false;
      }

      if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
        return false;
      }

      if (filters.period) {
        const transactionDate = new Date(transaction.date);
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        switch (filters.period) {
          case "today":
            if (transactionDate < startOfDay) return false;
            break;
          case "week":
            if (transactionDate < startOfWeek) return false;
            break;
          case "month":
            if (transactionDate < startOfMonth) return false;
            break;
          case "year":
            if (transactionDate < startOfYear) return false;
            break;
        }
      }

      if (filters.minAmount && transaction.amount < filters.minAmount) {
        return false;
      }
      if (filters.maxAmount && transaction.amount > filters.maxAmount) {
        return false;
      }

      // Apply search query
      if (query) {
        const category = categories.find(
          (c) => c.id === transaction.categoryId
        );
        const categoryName = category ? category.name.toLowerCase() : "";
        const description = transaction.description.toLowerCase();
        const amount = transaction.amount.toString();

        return (
          description.includes(query) ||
          categoryName.includes(query) ||
          amount.includes(query)
        );
      }

      return true;
    });
  }, [transactions, categories, searchQuery, filters]);
};
