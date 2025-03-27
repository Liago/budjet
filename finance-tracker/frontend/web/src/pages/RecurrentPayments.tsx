import { useEffect } from "react";
import {
  fetchRecurrentPayments,
  createRecurrentPayment,
  updateRecurrentPayment,
  deleteRecurrentPayment,
  setCurrentRecurrentPayment,
} from "../store/slices/recurrentPaymentSlice";
import {
  useAppDispatch,
  useAppSelector,
  useAuth,
  useCategories,
} from "../utils/hooks";
import useRecurrentPaymentForm from "../utils/hooks/useRecurrentPaymentForm";
import useRecurrentPaymentFilters from "../utils/hooks/useRecurrentPaymentFilters";
import { RecurrentPayment } from "../utils/types";
import { format } from "date-fns";
import { notificationService } from "../utils/notificationService";
import { Dialog } from "@/components/ui/dialog";

// Import componenti di presentazione
import RecurrentPaymentHeader from "../components/recurrent-payments/RecurrentPaymentHeader";
import RecurrentPaymentFilter from "../components/recurrent-payments/RecurrentPaymentFilter";
import RecurrentPaymentList from "../components/recurrent-payments/RecurrentPaymentList";
import RecurrentPaymentForm from "../components/recurrent-payments/RecurrentPaymentForm";

// Utility per formattare gli importi con la virgola come separatore decimale e simbolo dell'euro
const formatAmount = (amount: number | string): string => {
  // Assicuriamoci che amount sia un numero prima di chiamare toFixed
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return `€ ${numAmount.toFixed(2).replace(".", ",")}`;
};

const RecurrentPayments = () => {
  const dispatch = useAppDispatch();
  const { recurrentPayments, isLoading, currentRecurrentPayment } =
    useAppSelector((state) => state.recurrentPayments);
  const { categories } = useCategories();
  useAuth(); // Make sure user is authenticated

  // Custom hooks
  const {
    formData,
    errors,
    isModalOpen,
    selectedStartDate,
    selectedEndDate,
    handleInputChange,
    handleSelectChange,
    handleCheckboxChange,
    handleStartDateChange,
    handleEndDateChange,
    validateForm,
    normalizeFormData,
    openModal,
    closeModal,
    resetForm,
  } = useRecurrentPaymentForm(categories);

  const {
    searchTerm,
    filterActive,
    filteredPayments,
    setSearchTerm,
    setFilterActive,
  } = useRecurrentPaymentFilters(recurrentPayments);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchRecurrentPayments());
  }, [dispatch]);

  // Reset form when modal is opened/closed or when editing a payment
  useEffect(() => {
    if (isModalOpen && currentRecurrentPayment) {
      resetForm(currentRecurrentPayment);
    }
  }, [isModalOpen, currentRecurrentPayment, resetForm]);

  const handleOpenModal = (payment?: RecurrentPayment) => {
    if (payment) {
      dispatch(setCurrentRecurrentPayment(payment));
    } else {
      dispatch(setCurrentRecurrentPayment(null));
      resetForm(undefined, categories.length > 0 ? categories[0].id : "");
    }
    openModal();
  };

  const handleCloseModal = () => {
    closeModal();
    dispatch(setCurrentRecurrentPayment(null));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepara i dati prima di validarli e inviarli
    const preparedData = normalizeFormData(formData);

    if (validateForm(formData)) {
      const toastId = notificationService.loading(
        currentRecurrentPayment
          ? "Aggiornamento pagamento ricorrente..."
          : "Creazione pagamento ricorrente..."
      );

      if (currentRecurrentPayment) {
        // Update existing payment
        dispatch(
          updateRecurrentPayment({
            id: currentRecurrentPayment.id,
            data: preparedData,
          })
        )
          .unwrap()
          .then(() => {
            notificationService.success(
              "Pagamento ricorrente aggiornato con successo",
              {
                id: toastId as unknown as string,
              }
            );
            handleCloseModal();
          })
          .catch((error) => {
            notificationService.error(
              "Errore durante l'aggiornamento del pagamento ricorrente",
              {
                id: toastId as unknown as string,
                description: error.message || "Si è verificato un errore",
              }
            );
            console.error("Error updating recurrent payment:", error);
          });
      } else {
        // Create new payment
        dispatch(createRecurrentPayment(preparedData))
          .unwrap()
          .then(() => {
            notificationService.success(
              "Pagamento ricorrente creato con successo",
              {
                id: toastId as unknown as string,
              }
            );
            handleCloseModal();
          })
          .catch((error) => {
            notificationService.error(
              "Errore durante la creazione del pagamento ricorrente",
              {
                id: toastId as unknown as string,
                description: error.message || "Si è verificato un errore",
              }
            );
            console.error("Error creating recurrent payment:", error);
          });
      }
    } else {
      notificationService.warning("Compila tutti i campi obbligatori", {
        description: "Controlla i campi evidenziati in rosso",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await notificationService.confirmDialog(
      "Sei sicuro di voler eliminare questo pagamento ricorrente?",
      {
        description: "Questa azione non può essere annullata",
        duration: 10000,
      }
    );

    if (confirmed) {
      const toastId = notificationService.loading("Eliminazione in corso...");
      dispatch(deleteRecurrentPayment(id))
        .unwrap()
        .then(() => {
          notificationService.success(
            "Pagamento ricorrente eliminato con successo",
            {
              id: toastId as unknown as string,
            }
          );
        })
        .catch((error) => {
          notificationService.error(
            "Errore durante l'eliminazione del pagamento ricorrente",
            {
              id: toastId as unknown as string,
              description: error.message || "Si è verificato un errore",
            }
          );
        });
    }
  };

  const handleToggleActive = (payment: RecurrentPayment) => {
    const isActivating = !payment.isActive;
    const status = isActivating ? "attivazione" : "disattivazione";
    const statusCompleted = isActivating ? "attivato" : "disattivato";

    const toastId = notificationService.loading(
      `${status.charAt(0).toUpperCase() + status.slice(1)} in corso...`
    );

    dispatch(
      updateRecurrentPayment({
        id: payment.id,
        data: { isActive: !payment.isActive },
      })
    )
      .unwrap()
      .then(() => {
        notificationService.success(
          `Pagamento ricorrente ${statusCompleted} con successo`,
          {
            id: toastId as unknown as string,
          }
        );
      })
      .catch((error) => {
        notificationService.error(
          `Errore durante la ${status} del pagamento ricorrente`,
          {
            id: toastId as unknown as string,
            description: error.message || "Si è verificato un errore",
          }
        );
      });
  };

  if (isLoading && recurrentPayments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RecurrentPaymentHeader onAddPayment={() => handleOpenModal()} />

      <RecurrentPaymentFilter
        searchTerm={searchTerm}
        filterActive={filterActive}
        onSearchChange={setSearchTerm}
        onFilterActiveChange={setFilterActive}
      />

      <RecurrentPaymentList
        payments={filteredPayments}
        searchTerm={searchTerm}
        filterActive={filterActive}
        formatAmount={formatAmount}
        onToggleActive={handleToggleActive}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        onAddPayment={() => handleOpenModal()}
      />

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
      >
        <RecurrentPaymentForm
          payment={currentRecurrentPayment}
          categories={categories}
          formData={formData}
          errors={errors}
          isLoading={isLoading}
          selectedStartDate={selectedStartDate}
          selectedEndDate={selectedEndDate}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
          onCheckboxChange={handleCheckboxChange}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Dialog>
    </div>
  );
};

export default RecurrentPayments;
