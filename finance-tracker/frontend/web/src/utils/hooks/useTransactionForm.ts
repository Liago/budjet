import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Category, Transaction } from '../types';
import { TransactionFormData } from '../../components/transactions/TransactionForm';

interface ValidationErrors {
  [key: string]: string | null;
}

interface ValidationRules {
  [key: string]: (value: any) => string | null;
}

interface UseTransactionFormResult {
  isModalOpen: boolean;
  errors: ValidationErrors;
  openModal: (transaction?: Transaction) => void;
  closeModal: () => void;
  validateForm: (data: TransactionFormData) => boolean;
  buildValidationRules: () => ValidationRules;
  normalizeFormData: (formData: TransactionFormData) => any;
}

const useTransactionForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const openModal = (transaction?: Transaction) => {
    setIsModalOpen(true);
    setErrors({});
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrors({});
  };

  const buildValidationRules = (): ValidationRules => {
    return {
      description: (value: string) => (!value ? "Description is required" : null),
      amount: (value: number | string) => {
        // Convert to number for comparison if it's a string
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        return numValue <= 0 ? "Amount must be greater than 0" : null;
      },
      date: (value: string) => (!value ? "Date is required" : null),
      categoryId: (value: string) => (!value ? "Category is required" : null),
    };
  };

  const validateForm = (data: TransactionFormData): boolean => {
    const rules = buildValidationRules();
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Validate each field in data against rules
    Object.keys(rules).forEach(field => {
      const value = data[field as keyof TransactionFormData];
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
  };

  const normalizeFormData = (formData: TransactionFormData) => {
    // Ensure amount is a valid string with exactly 2 decimal places
    const amount =
      typeof formData.amount === "number"
        ? formData.amount.toFixed(2)
        : parseFloat(String(formData.amount)).toFixed(2);

    return {
      ...formData,
      amount,
    };
  };

  return {
    isModalOpen,
    errors,
    openModal,
    closeModal,
    validateForm,
    buildValidationRules,
    normalizeFormData
  };
};

export default useTransactionForm; 