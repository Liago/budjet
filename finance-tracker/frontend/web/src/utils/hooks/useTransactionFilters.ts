import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { TransactionFilters } from '../types';

interface UseTransactionFiltersResult {
  searchTerm: string;
  filterType: "all" | "INCOME" | "EXPENSE";
  filterCategory: string;
  filterMonth: string;
  sortField: "date" | "amount";
  sortDirection: "asc" | "desc";
  pageSize: number | 'all';
  availableMonths: { value: string; label: string }[];
  currentFilters: TransactionFilters;
  setSearchTerm: (value: string) => void;
  setFilterType: (value: "all" | "INCOME" | "EXPENSE") => void;
  setFilterCategory: (value: string) => void;
  setFilterMonth: (value: string) => void;
  setSortField: (value: "date" | "amount") => void;
  setSortDirection: (value: "asc" | "desc") => void;
  setPageSize: (value: number | 'all') => void;
  handleSort: (field: "date" | "amount") => void;
}

const useTransactionFilters = (currentPage: number): UseTransactionFiltersResult => {
  // Generate current month value as default
  const getCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "INCOME" | "EXPENSE">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>(getCurrentMonth());
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [pageSize, setPageSize] = useState<number | 'all'>(10);
  
  // Generate list of available months for filtering
  const getAvailableMonths = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = date.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
      
      months.push({ value, label });
    }
    
    return months;
  };
  
  const availableMonths = useMemo(() => getAvailableMonths(), []);
  
  // Handle sorting
  const handleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };
  
  // Combine all filters - Using useMemo to prevent unnecessary recreation
  const currentFilters = useMemo<TransactionFilters>(() => {
    const filters: TransactionFilters = {
      page: currentPage,
      limit: pageSize === 'all' ? 1000 : pageSize,
    };

    // Add type filter if not 'all'
    if (filterType !== "all") {
      filters.type = filterType;
    }

    // Add category filter if not 'all'
    if (filterCategory !== "all") {
      filters.categoryId = filterCategory;
    }

    // Add date range if month filter is set
    if (filterMonth !== "all") {
      const [year, month] = filterMonth.split("-");
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of month
      
      filters.startDate = format(startDate, "yyyy-MM-dd");
      filters.endDate = format(endDate, "yyyy-MM-dd");
    }
    
    return filters;
  }, [currentPage, pageSize, filterType, filterCategory, filterMonth]);
  
  return {
    searchTerm,
    filterType,
    filterCategory,
    filterMonth,
    sortField,
    sortDirection,
    pageSize,
    availableMonths,
    currentFilters,
    setSearchTerm,
    setFilterType,
    setFilterCategory,
    setFilterMonth,
    setSortField,
    setSortDirection,
    setPageSize,
    handleSort
  };
};

export default useTransactionFilters; 