import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { RecurrentPayment } from "../types";
import { RecurrentPaymentFormData } from "../../components/recurrent-payments/RecurrentPaymentForm";

interface ValidationErrors {
  [key: string]: string | null;
}

interface ValidationRules {
  [key: string]: (value: any) => string | null;
}

interface UseRecurrentPaymentFormResult {
  formData: RecurrentPaymentFormData;
  errors: ValidationErrors;
  isModalOpen: boolean;
  selectedStartDate: Date | undefined;
  selectedEndDate: Date | undefined;
  setFormData: (formData: RecurrentPaymentFormData) => void;
  openModal: () => void;
  closeModal: () => void;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleCheckboxChange: (checked: boolean) => void;
  handleStartDateChange: (date: Date | undefined) => void;
  handleEndDateChange: (date: Date | undefined) => void;
  validateForm: (data: RecurrentPaymentFormData) => boolean;
  buildValidationRules: () => ValidationRules;
  normalizeFormData: (formData: RecurrentPaymentFormData) => any;
  resetForm: (payment?: RecurrentPayment, categoryId?: string) => void;
}

const useRecurrentPaymentForm = (
  categories: any[]
): UseRecurrentPaymentFormResult => {
  const [formData, setFormData] = useState<RecurrentPaymentFormData>({
    name: "",
    amount: 0,
    categoryId: "",
    description: "",
    interval: "monthly",
    dayOfMonth: 1,
    startDate: format(new Date(), "yyyy-MM-dd"),
    isActive: true,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(
    undefined
  );

  // 🔧 Inizializza il form con il valore di default della prima categoria disponibile (safe)
  useEffect(() => {
    if (categories && categories.length > 0 && !formData.categoryId) {
      setFormData((prev) => ({
        ...prev,
        categoryId: categories[0].id,
      }));
    }
  }, [categories, formData.categoryId]);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
    setErrors({});
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setErrors({});
  }, []);

  const resetForm = useCallback(
    (payment?: RecurrentPayment, defaultCategoryId?: string) => {
      if (payment) {
        // Formatta le date nel formato yyyy-MM-dd per gli input HTML
        const startDate = payment.startDate
          ? format(new Date(payment.startDate), "yyyy-MM-dd")
          : "";

        const endDate = payment.endDate
          ? format(new Date(payment.endDate), "yyyy-MM-dd")
          : "";

        setFormData({
          name: payment.name,
          amount: payment.amount,
          categoryId: payment.categoryId,
          description: payment.description || "",
          interval: payment.interval,
          dayOfMonth: payment.dayOfMonth,
          dayOfWeek: payment.dayOfWeek,
          startDate: startDate,
          endDate: endDate,
          isActive: payment.isActive,
        });

        // Aggiorna anche le date del calendario
        setSelectedStartDate(
          payment.startDate ? new Date(payment.startDate) : new Date()
        );
        setSelectedEndDate(
          payment.endDate ? new Date(payment.endDate) : undefined
        );
      } else {
        // Default values for new payment
        const today = new Date();
        setFormData({
          name: "",
          amount: 0,
          categoryId:
            defaultCategoryId ||
            (categories && categories.length > 0 ? categories[0].id : ""), // 🔧 Safe check
          description: "",
          interval: "monthly",
          dayOfMonth: 1,
          startDate: format(today, "yyyy-MM-dd"),
          isActive: true,
        });

        // Reset date picker values
        setSelectedStartDate(today);
        setSelectedEndDate(undefined);
      }
    },
    [categories]
  );

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;
      if (name === "amount") {
        // Convert comma to dot for decimal separator and ensure amount is a valid number
        const normalizedValue = value.replace(/,/g, ".");
        const amount = parseFloat(normalizedValue);
        setFormData((prev) => ({
          ...prev,
          [name]: isNaN(amount) ? 0 : amount,
        }));
      } else if (name === "isActive") {
        // Utilizziamo il type casting per accedere alla proprietà checked di HTMLInputElement
        const checkbox = e.target as HTMLInputElement;
        setFormData((prev) => ({ ...prev, isActive: checkbox.checked }));
      } else if (name === "dayOfMonth") {
        const dayValue = parseInt(value);
        setFormData((prev) => ({
          ...prev,
          dayOfMonth: isNaN(dayValue) ? undefined : dayValue,
        }));
      } else if (name === "dayOfWeek") {
        const dayValue = parseInt(value);
        setFormData((prev) => ({
          ...prev,
          dayOfWeek: isNaN(dayValue) ? undefined : dayValue,
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    },
    []
  );

  // Handle checkbox change for the shadcn checkbox component
  const handleCheckboxChange = useCallback((checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  }, []);

  // Handle select change for shadcn select components
  const handleSelectChange = useCallback((name: string, value: string) => {
    if (name === "dayOfMonth" || name === "dayOfWeek") {
      const dayValue = parseInt(value);
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(dayValue) ? undefined : dayValue,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  // Handler per il cambiamento della data di inizio
  const handleStartDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      setSelectedStartDate(date);
      // Aggiorna il form data
      setFormData((prev) => ({
        ...prev,
        startDate: format(date, "yyyy-MM-dd"),
      }));
    }
  }, []);

  // Handler per il cambiamento della data di fine
  const handleEndDateChange = useCallback((date: Date | undefined) => {
    setSelectedEndDate(date);
    // Aggiorna il form data con data formattata o stringa vuota se data è undefined
    setFormData((prev) => ({
      ...prev,
      endDate: date ? format(date, "yyyy-MM-dd") : "",
    }));
  }, []);

  const buildValidationRules = useCallback((): ValidationRules => {
    return {
      name: (value: string) => (!value ? "Il nome è obbligatorio" : null),
      amount: (value: number | string) => {
        // Convert to number for comparison if it's a string
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        return numValue <= 0 ? "L'importo deve essere maggiore di 0" : null;
      },
      categoryId: (value: string) =>
        !value ? "La categoria è obbligatoria" : null,
      startDate: (value: string) =>
        !value ? "La data di inizio è obbligatoria" : null,
      interval: (value: string) =>
        !value ? "L'intervallo è obbligatorio" : null,
    };
  }, []);

  const validateForm = useCallback(
    (data: RecurrentPaymentFormData): boolean => {
      const rules = buildValidationRules();
      const newErrors: ValidationErrors = {};
      let isValid = true;

      // Check required fields
      Object.keys(rules).forEach((field) => {
        const value = data[field as keyof RecurrentPaymentFormData];
        const error = rules[field](value);

        if (error) {
          newErrors[field] = error;
          isValid = false;
        } else {
          newErrors[field] = null;
        }
      });

      setErrors(newErrors);
      return isValid;
    },
    [buildValidationRules]
  );

  const normalizeFormData = useCallback((data: RecurrentPaymentFormData) => {
    // Ensure amount is a valid string with exactly 2 decimal places
    const amount =
      typeof data.amount === "number"
        ? data.amount.toFixed(2)
        : parseFloat(data.amount.toString()).toFixed(2);

    // Prepara i dati prima di inviarli
    return {
      ...data,
      amount,
      // Se endDate è una stringa vuota, impostiamo undefined esplicitamente
      endDate:
        data.endDate && data.endDate.trim() !== "" ? data.endDate : undefined,
    };
  }, []);

  return {
    formData,
    errors,
    isModalOpen,
    selectedStartDate,
    selectedEndDate,
    setFormData,
    openModal,
    closeModal,
    handleInputChange,
    handleSelectChange,
    handleCheckboxChange,
    handleStartDateChange,
    handleEndDateChange,
    validateForm,
    buildValidationRules,
    normalizeFormData,
    resetForm,
  };
};

export default useRecurrentPaymentForm;
