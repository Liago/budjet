import { useState, useEffect } from "react";
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  deleteAllTransactions,
  setCurrentTransaction,
  setPage,
  bulkUpdateTransactions,
  bulkDeleteTransactions,
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
import { toast } from "sonner";
import { DeleteConfirmationModal } from "../components/ui/confirmation-modal";

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
import TransactionForm, {
  TransactionFormData,
} from "../components/transactions/TransactionForm";
import TransactionImportModal from "../components/transactions/TransactionImportModal";
import BulkEditModal from "../components/transactions/BulkEditModal";

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
    setPageSize,
    handleSort,
  } = useTransactionFilters(currentPage);

  const {
    isModalOpen,
    errors: formErrors,
    openModal,
    closeModal,
    validateForm,
    normalizeFormData,
  } = useTransactionForm();

  // Local state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    string[]
  >([]);
  const [enableMultiSelect, setEnableMultiSelect] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    transactionId: string;
    description: string;
  }>({ open: false, transactionId: "", description: "" });
  const [deleteAllModal, setDeleteAllModal] = useState<{
    open: boolean;
    type: "all" | "manual";
  }>({ open: false, type: "all" });

  // Fetch transactions with filters
  useEffect(() => {
    dispatch(fetchTransactions(currentFilters));
  }, [dispatch, currentFilters]);

  // Reimposta la selezione quando cambiano i filtri o si caricano nuove transazioni
  useEffect(() => {
    setSelectedTransactionIds([]);
  }, [transactions, currentFilters]);

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
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setDeleteModal({
        open: true,
        transactionId: id,
        description: transaction.description
      });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Se è una cancellazione di selezione multipla
      if (!deleteModal.transactionId && selectedTransactionIds.length > 0) {
        await handleBulkDelete();
      } else {
        // Cancellazione singola
        await dispatch(deleteTransaction(deleteModal.transactionId)).unwrap();
      }
      
      setDeleteModal({ open: false, transactionId: "", description: "" });
    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const result = await dispatch(bulkDeleteTransactions({ ids: selectedTransactionIds })).unwrap();
      
      toast.success(
        `Eliminazione completata. Eliminate: ${result.deleted}, Fallite: ${result.failed}`
      );

      // Reset selezione
      setSelectedTransactionIds([]);
      setEnableMultiSelect(false);
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Errore durante l'eliminazione delle transazioni");
    }
  };

  // Handle delete all transactions
  const handleDeleteAll = () => {
    setDeleteAllModal({ open: true, type: "all" });
  };

  const handleConfirmDeleteAll = async () => {
    try {
      setIsDeleting(true);
      const result = await dispatch(deleteAllTransactions()).unwrap();
      toast.success(
        result.message || "Tutte le transazioni eliminate con successo"
      );
      setDeleteAllModal({ open: false, type: "all" });
    } catch (error) {
      console.error("Error deleting all transactions:", error);
      toast.error(
        "Impossibile eliminare tutte le transazioni. Controlla la console per i dettagli."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle manual delete all transactions
  const handleManualDeleteAll = async () => {
    setDeleteAllModal({ open: true, type: "manual" });
  };

  const handleConfirmManualDeleteAll = async () => {
    try {
      setIsDeleting(true);

      // Get the current list of transactions from state
      const transactionsToDelete = [...transactions];

      if (transactionsToDelete.length === 0) {
        toast.info("Nessuna transazione da eliminare");
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

      toast.success(
        `Eliminazione completata. Eliminate con successo: ${results.success}, Fallite: ${results.failed}`
      );

      // Refresh the transactions list
      dispatch(
        fetchTransactions({
          page: 1,
          limit: 10,
        })
      );
      
      setDeleteAllModal({ open: false, type: "all" });
    } catch (error) {
      console.error("Error in manual deletion process:", error);
      toast.error(
        "Si è verificato un errore durante il processo di eliminazione manuale. Controlla la console per i dettagli."
      );
    } finally {
      setIsDeleting(false);
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
    ? filteredTransactions.filter(
        (t) =>
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.tags.some((tag) =>
            tag.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
    : filteredTransactions;

  // Gestisci la modifica multipla
  const handleBulkEdit = (selectedTransactions: Transaction[]) => {
    setIsBulkEditModalOpen(true);
  };

  // Gestisci il salvataggio delle modifiche multiple
  const handleBulkUpdate = async (updates: any) => {
    const updateData: any = {};
    let hasUpdate = false;

    if (updates.updateCategory && updates.categoryId) {
      updateData.categoryId = updates.categoryId;
      hasUpdate = true;
    }

    if (updates.updateDate && updates.date) {
      updateData.date = updates.date;
      hasUpdate = true;
    }

    if (updates.updateType && updates.type) {
      updateData.type = updates.type;
      hasUpdate = true;
    }

    if (updates.updateDescription && updates.description) {
      updateData.description = updates.description;
      hasUpdate = true;
    }

    if (updates.updateTags && updates.tags) {
      updateData.tags = updates.tags;
      hasUpdate = true;
    }

    // Verifica che ci sia almeno un campo da aggiornare
    if (!hasUpdate || Object.keys(updateData).length === 0) {
      toast.warning(
        "Seleziona almeno un campo da aggiornare e inserisci un valore"
      );
      return;
    }

    try {
      console.log("Aggiornamento con dati:", {
        ids: selectedTransactionIds,
        data: updateData,
      });

      await dispatch(
        bulkUpdateTransactions({
          ids: selectedTransactionIds,
          data: updateData,
        })
      ).unwrap();

      // Chiudi il modal dopo l'aggiornamento riuscito
      setIsBulkEditModalOpen(false);

      // Resetta lo stato della selezione dopo l'aggiornamento
      setSelectedTransactionIds([]);

      // Notifica l'utente del successo
      toast.success("Transazioni aggiornate con successo");
    } catch (error) {
      console.error("Errore nell'aggiornamento in blocco:", error);
      toast.error(
        "Si è verificato un errore durante l'aggiornamento in blocco."
      );
    }
  };

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Transazioni</CardTitle>
            <div className="flex items-center gap-2">
              {/* Toggle della modalità di selezione multipla */}
              <Button
                variant={enableMultiSelect ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setEnableMultiSelect(!enableMultiSelect);
                  setSelectedTransactionIds([]);
                }}
              >
                {enableMultiSelect
                  ? "Disattiva selezione"
                  : "Selezione multipla"}
              </Button>

              {/* Pulsante per aggiungere nuova transazione */}
              <Button onClick={() => handleOpenModal()} size="sm">
                <PlusIcon className="h-4 w-4 mr-2" /> Nuova
              </Button>

              {/* Pulsanti per selezione multipla */}
              {enableMultiSelect && selectedTransactionIds.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkEdit(transactions.filter(t => selectedTransactionIds.includes(t.id)))}
                  >
                    <EditIcon className="h-4 w-4 mr-2" /> Modifica ({selectedTransactionIds.length})
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteModal({
                      open: true,
                      transactionId: "",
                      description: `${selectedTransactionIds.length} transazioni selezionate`
                    })}
                  >
                    <TrashIcon className="h-4 w-4 mr-2" /> Elimina ({selectedTransactionIds.length})
                  </Button>
                </>
              )}

              {/* Pulsante per importare CSV */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportModalOpen(true)}
              >
                <UploadIcon className="h-4 w-4 mr-2" /> Importa
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filter section */}
      <Card className="mb-4">
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
      </Card>

      {/* Transaction list */}
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
          selectedTransactions={selectedTransactionIds}
          setSelectedTransactions={setSelectedTransactionIds}
          enableMultiSelect={enableMultiSelect}
          onBulkEdit={handleBulkEdit}
        />

        {/* Totals and Pagination */}
        <div className="flex flex-col sm:flex-row px-4 py-3 border-t border-border gap-4">
          {/* Transaction Totals */}
          <TransactionTotals
            transactions={displayedTransactions}
            totalItems={totalItems}
            formatAmount={formatAmount}
          />

          {/* Pagination */}
          <div className="flex-shrink-0 sm:ml-auto">
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

      {/* Import CSV Modal */}
      <Dialog
        open={isImportModalOpen}
        onOpenChange={(open) => !open && setIsImportModalOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importa Transazioni</DialogTitle>
            <DialogDescription>
              Carica un file CSV per importare le transazioni
            </DialogDescription>
          </DialogHeader>
          <CsvImporter
            onSuccess={() => {
              setIsImportModalOpen(false);
              dispatch(fetchTransactions(currentFilters));
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Modal */}
      <BulkEditModal
        open={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        selectedTransactions={transactions.filter((t) =>
          selectedTransactionIds.includes(t.id)
        )}
        categories={categories}
        onBulkUpdate={handleBulkUpdate}
      />

      {/* Delete Single Transaction Modal */}
      <DeleteConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, transactionId: "", description: "" })}
        onConfirm={handleConfirmDelete}
        itemName={deleteModal.description}
        itemType="transazione"
        loading={isDeleting}
        warning="Questa azione eliminerà la transazione in modo permanente."
      />

      {/* Delete All Transactions Modal */}
      <DeleteConfirmationModal
        open={deleteAllModal.open}
        onClose={() => setDeleteAllModal({ open: false, type: "all" })}
        onConfirm={deleteAllModal.type === "all" ? handleConfirmDeleteAll : handleConfirmManualDeleteAll}
        itemName="tutte le transazioni"
        itemType=""
        loading={isDeleting}
        warning={
          deleteAllModal.type === "all" 
            ? "Questa azione eliminerà TUTTE le transazioni in modo permanente. Non sarà possibile annullare questa operazione."
            : "Questa azione eliminerà TUTTE le transazioni una per una. Non sarà possibile annullare questa operazione."
        }
      />
    </div>
  );
};

export default Transactions;
