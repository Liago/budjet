import { useState, useEffect } from 'react';
import { Category } from '../types';
import { CategoryFormData } from '../../components/categories/CategoryForm';

interface ValidationErrors {
  [key: string]: string | null;
}

interface ValidationRules {
  [key: string]: (value: any) => string | null;
}

const useCategoryForm = (initialCategory: Category | null) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validationRules: ValidationRules = {
    name: (value: string) => !value ? 'Category name is required' : null,
    color: (value: string) => !value ? 'Color is required' : null,
    icon: (value: string) => !value ? 'Icon is required' : null,
    budget: (value: string) => value && parseFloat(value) < 0 ? 'Budget cannot be negative' : null
  };

  useEffect(() => {
    if (initialCategory) {
      setCurrentCategory(initialCategory);
      setIsModalOpen(true);
    }
  }, [initialCategory]);

  const openModal = (category?: Category) => {
    setErrors({});
    setCurrentCategory(category || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCategory(null);
    setErrors({});
  };

  const validate = (data: CategoryFormData): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Validate each field
    Object.keys(validationRules).forEach(field => {
      const key = field as keyof CategoryFormData;
      const error = validationRules[field](data[key]);
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

  const clearErrors = () => {
    setErrors({});
  };

  return {
    isModalOpen,
    currentCategory,
    errors,
    openModal,
    closeModal,
    validate,
    clearErrors
  };
};

export default useCategoryForm; 