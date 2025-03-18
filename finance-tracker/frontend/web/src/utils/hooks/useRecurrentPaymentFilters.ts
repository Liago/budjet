import { useState, useMemo } from 'react';
import { RecurrentPayment } from '../types';

interface UseRecurrentPaymentFiltersResult {
  searchTerm: string;
  filterActive: "all" | "active" | "inactive";
  filteredPayments: RecurrentPayment[];
  setSearchTerm: (value: string) => void;
  setFilterActive: (value: "all" | "active" | "inactive") => void;
}

const useRecurrentPaymentFilters = (payments: RecurrentPayment[]): UseRecurrentPaymentFiltersResult => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  // Applicazione dei filtri e ordinamento per data del prossimo pagamento
  const filteredPayments = useMemo(() => {
    return payments
      .filter((payment) => {
        // Filter by search term
        const matchesSearch =
          payment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (payment.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        // Filter by active status
        const matchesActive =
          filterActive === "all" ||
          (filterActive === "active" && payment.isActive) ||
          (filterActive === "inactive" && !payment.isActive);

        return matchesSearch && matchesActive;
      })
      // Sort by nextPaymentDate (earliest date first)
      .sort((a, b) => {
        const dateA = new Date(a.nextPaymentDate).getTime();
        const dateB = new Date(b.nextPaymentDate).getTime();
        return dateA - dateB;
      });
  }, [payments, searchTerm, filterActive]);

  return {
    searchTerm,
    filterActive,
    filteredPayments,
    setSearchTerm,
    setFilterActive
  };
};

export default useRecurrentPaymentFilters; 