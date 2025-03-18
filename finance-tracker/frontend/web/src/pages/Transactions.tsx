import { useState, useEffect } from "react";
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  deleteAllTransactions,
  setCurrentTransaction,
  setPage,
} from "../store/slices/transactionSlice";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  SearchIcon,
  FilterIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UploadIcon,
  CalendarIcon,
} from "../components/Icons";
import {
  useAppDispatch,
  useAppSelector,
  useAuth,
  useCategories,
  useFormValidation,
} from "../utils/hooks";
import useTransactionFilters from "../utils/hooks/useTransactionFilters";
import useTransactionForm from "../utils/hooks/useTransactionForm";
import {
  CreateTransactionData,
  Transaction,
  TransactionFilters,
  UpdateTransactionData,
} from "../utils/types";
import { format } from "date-fns";
import CsvImporter from "../components/CsvImporter";

// Import shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

// Import presentational components
import TransactionHeader from "../components/transactions/TransactionHeader";
import TransactionFilter from "../components/transactions/TransactionFilter";
import TransactionList from "../components/transactions/TransactionList";
import TransactionTotals from "../components/transactions/TransactionTotals";
import TransactionPagination from "../components/transactions/TransactionPagination";
import TransactionForm, { TransactionFormData } from "../components/transactions/TransactionForm";
import TransactionImportModal from "../components/transactions/TransactionImportModal";

// Aggiungiamo un'utility per formattare gli importi con il simbolo dell'euro
const formatAmount = (amount: number | string): string => {
  const numAmount =
    typeof amount === "number" ? amount : parseFloat(String(amount));
  return `€ ${numAmount.toFixed(2).replace(".", ",")}`;
};

const Transactions = () => {
  const dispatch = useAppDispatch();
  const {
    transactions,
    isLoading,
    currentTransaction,
    totalPages,
    currentPage,
    totalItems,
  } = useAppSelector((state) => state.transactions);
  const { categories } = useCategories();
  useAuth(); // Make sure user is authenticated

  // Custom hooks
  const { errors, validate } = useFormValidation();
  const { 
    searchTerm, filterType, filterCategory, filterMonth, 
    sortField, sortDirection, pageSize, availableMonths, currentFilters,
    setSearchTerm, setFilterType, setFilterCategory, setFilterMonth,
    setPageSize, handleSort
  } = useTransactionFilters(currentPage);
  
  const {
    isModalOpen, 
    errors: formErrors, 
    openModal, 
    closeModal, 
    validateForm, 
    normalizeFormData
  } = useTransactionForm();

  // Local state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch transactions with filters
  useEffect(() => {
    dispatch(fetchTransactions(currentFilters));
  }, [dispatch, currentFilters]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      dispatch(setPage(newPage));
    }
  };

  // Handle opening transaction form modal
  const handleOpenModal = (transaction?: Transaction) => {
    dispatch(setCurrentTransaction(transaction || null));
    openModal(transaction);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent, formData: TransactionFormData) => {
    e.preventDefault();
    
    // Normalize form data
    const normalizedData = normalizeFormData(formData);
    
    // Validate form
    if (validateForm(normalizedData)) {
      if (currentTransaction) {
        // Update existing transaction
        dispatch(
          updateTransaction({
            id: currentTransaction.id,
            data: normalizedData,
          })
        )
          .unwrap()
          .then(() => {
            closeModal();
          })
          .catch((error) => {
            console.error("Error updating transaction:", error);
          });
      } else {
        // Create new transaction
        dispatch(createTransaction(normalizedData))
          .unwrap()
          .then(() => {
            closeModal();
          })
          .catch((error) => {
            console.error("Error creating transaction:", error);
          });
      }
    }
  };

  // Handle transaction deletion
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      setIsDeleting(true);
      dispatch(deleteTransaction(id)).finally(() => {
        setIsDeleting(false);
      });
    }
  };

  // Handle delete all transactions
  const handleDeleteAll = () => {
    if (
      window.confirm(
        "Are you sure you want to delete ALL transactions? This action cannot be undone."
      )
    ) {
      setIsDeleting(true);
      dispatch(deleteAllTransactions())
        .unwrap()
        .then((result) => {
          alert(result.message || "All transactions deleted successfully");
        })
        .catch((error) => {
          console.error("Error deleting all transactions:", error);
          alert(
            "Failed to delete all transactions. Please check the console for details."
          );
        })
        .finally(() => {
          setIsDeleting(false);
        });
    }
  };

  // Handle manual delete all transactions
  const handleManualDeleteAll = async () => {
    if (
      window.confirm(
        "Are you sure you want to manually delete ALL transactions? This action cannot be undone."
      )
    ) {
      setIsDeleting(true);

      try {
        // Get the current list of transactions from state
        const transactionsToDelete = [...transactions];

        if (transactionsToDelete.length === 0) {
          alert("No transactions to delete");
          return;
        }

        const results = {
          success: 0,
          failed: 0,
        };

        // Delete each transaction one by one
        for (const transaction of transactionsToDelete) {
          try {
            await dispatch(deleteTransaction(transaction.id)).unwrap();
            results.success++;
          } catch (error) {
            console.error(
              `Failed to delete transaction ${transaction.id}:`,
              error
            );
            results.failed++;
          }
        }

        alert(
          `Deletion complete. Successfully deleted: ${results.success}, Failed: ${results.failed}`
        );

        // Refresh the transactions list
        dispatch(
          fetchTransactions({
            page: 1,
            limit: 10,
          })
        );
      } catch (error) {
        console.error("Error in manual deletion process:", error);
        alert(
          "An error occurred during the manual deletion process. Please check the console for details."
        );
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Handle refresh data
  const handleRefreshData = () => {
    dispatch(fetchTransactions(currentFilters));
  };

  // Filter and sort transactions
  const filteredTransactions = [...transactions];

  // Sort transactions
  filteredTransactions.sort((a, b) => {
    if (sortField === "date") {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      return sortDirection === "asc"
        ? a.amount - b.amount
        : b.amount - a.amount;
    }
  });

  // Apply text search filter if needed
  const displayedTransactions = searchTerm 
    ? filteredTransactions.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : filteredTransactions;

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleDeleteAll}
            variant="outline"
            className="text-red-700 hover:bg-red-50 border-red-300"
            disabled={isDeleting || isLoading}
          >
            {isDeleting ? "Deleting..." : "Delete All"}
          </Button>
          <Button
            onClick={handleManualDeleteAll}
            variant="outline"
            className="text-red-700 hover:bg-red-50 border-red-300"
            disabled={isDeleting || isLoading}
          >
            Manual Delete All
          </Button>
          <Button onClick={() => setIsImportModalOpen(true)} variant="outline">
            <UploadIcon className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Import Modal */}
      <TransactionImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleRefreshData}
      />

      {/* Filters and Search */}
      <TransactionFilter 
        searchTerm={searchTerm}
        filterType={filterType}
        filterCategory={filterCategory}
        filterMonth={filterMonth}
        availableMonths={availableMonths}
        categories={categories}
        onSearchChange={setSearchTerm}
        onTypeChange={setFilterType}
        onCategoryChange={setFilterCategory}
        onMonthChange={setFilterMonth}
      />

      {/* Transactions Table */}
      <Card>
        <TransactionList 
          transactions={displayedTransactions}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          isLoading={isLoading}
          isDeleting={isDeleting}
          formatAmount={formatAmount}
        />

        {/* Totals and Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="flex-1 sm:flex sm:items-center sm:justify-between">
            {/* Transaction Totals */}
            <TransactionTotals 
              transactions={displayedTransactions} 
              totalItems={totalItems} 
              formatAmount={formatAmount} 
            />
            
            {/* Pagination */}
            <TransactionPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={(size) => {
                setPageSize(size);
                if (currentPage !== 1) {
                  dispatch(setPage(1)); // Reset to first page when changing page size
                }
              }}
            />
          </div>
        </div>
      </Card>

      {/* Transaction Form Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <TransactionForm 
            transaction={currentTransaction}
            categories={categories}
            errors={formErrors || errors}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
