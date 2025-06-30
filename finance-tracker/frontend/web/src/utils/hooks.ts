import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "../store";
import { fetchUserProfile } from "../store/slices/authSlice";
import { fetchCategories } from "../store/slices/categorySlice";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Custom hook to check if the user is authenticated
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated && !user && !isLoading && !error) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated, user, isLoading, error]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
  };
};

/**
 * Custom hook to load categories
 */
export const useCategories = () => {
  const dispatch = useAppDispatch();
  const { categories, isLoading } = useAppSelector((state) => state.categories);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories]);

  return { categories: categories || [], isLoading };
};

export type ValidationRule<T> = (
  value: any,
  data?: Record<string, any>
) => string | null;

export interface FormErrors {
  [key: string]: string | null;
}

/**
 * Hook per la validazione dei form
 * @returns Oggetto con funzione di validazione, errori e reset
 */
export const useFormValidation = () => {
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Valida i dati del form in base alle regole di validazione
   * @param data Dati del form
   * @param rules Regole di validazione
   * @returns true se la validazione è passata, false altrimenti
   */
  const validate = <T extends Record<string, any>>(
    data: T,
    rules: Record<keyof T, ValidationRule<any>>
  ): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Controlla ogni campo con una regola di validazione
    Object.keys(rules).forEach((key) => {
      const value = data[key];
      const rule = rules[key as keyof T];

      // Applica la regola di validazione
      const error = rule(value, data);

      // Se c'è un errore, imposta il campo corrispondente
      if (error) {
        newErrors[key] = error;
        isValid = false;
      } else {
        newErrors[key] = null;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Pulisce tutti gli errori
   */
  const clearErrors = () => {
    setErrors({});
  };

  return { errors, validate, clearErrors };
};
