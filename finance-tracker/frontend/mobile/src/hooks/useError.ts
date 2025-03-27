import { useState, useCallback } from "react";

interface ErrorState {
  message: string;
  visible: boolean;
}

export const useError = () => {
  const [error, setError] = useState<ErrorState>({
    message: "",
    visible: false,
  });

  const showError = useCallback((message: string) => {
    setError({ message, visible: true });
  }, []);

  const hideError = useCallback(() => {
    setError((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    error,
    showError,
    hideError,
  };
};
