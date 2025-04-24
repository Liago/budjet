import { useState, useMemo, useEffect, useCallback } from "react";
import {
  addMonths,
  startOfMonth,
  endOfMonth,
  format,
  subMonths,
  subDays,
  startOfDay,
  endOfDay,
  isValid,
} from "date-fns";

type TimeRange =
  | "current-month"
  | "1-month"
  | "3-months"
  | "6-months"
  | "1-year"
  | "custom";

interface UseDashboardDateRangeResult {
  selectedTimeRange: TimeRange;
  startDate: Date;
  endDate: Date;
  customStartDate: string;
  customEndDate: string;
  handleTimeRangeChange: (range: TimeRange) => void;
  handleCustomStartDateChange: (date: string) => void;
  handleCustomEndDateChange: (date: string) => void;
  applyCustomDateRange: () => void;
  formatDateForAPI: (date: Date) => string;
}

export function useDashboardDateRange(): UseDashboardDateRangeResult {
  const today = new Date();
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRange>("current-month");

  // State for custom date range
  const [customStartDate, setCustomStartDate] = useState(
    format(subMonths(today, 1), "yyyy-MM-dd")
  );
  const [customEndDate, setCustomEndDate] = useState(
    format(today, "yyyy-MM-dd")
  );

  // State for actual date range used in API calls
  const [startDate, setStartDate] = useState(() => startOfMonth(today));
  const [endDate, setEndDate] = useState(() => endOfMonth(today));

  // Effetto di debug quando il range di date cambia
  useEffect(() => {
    console.log("useDashboardDateRange - date aggiornate:", {
      selectedTimeRange,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
    });
  }, [selectedTimeRange, startDate, endDate]);

  // Calculate date range based on selected time range
  const handleTimeRangeChange = (range: TimeRange) => {
    setSelectedTimeRange(range);

    let newStartDate: Date;
    let newEndDate: Date = endOfDay(today);

    switch (range) {
      case "current-month":
        newStartDate = startOfMonth(today);
        newEndDate = endOfMonth(today);
        break;
      case "1-month":
        newStartDate = startOfDay(subMonths(today, 1));
        break;
      case "3-months":
        newStartDate = startOfDay(subMonths(today, 3));
        break;
      case "6-months":
        newStartDate = startOfDay(subMonths(today, 6));
        break;
      case "1-year":
        newStartDate = startOfDay(subMonths(today, 12));
        break;
      case "custom":
        // Don't update the dates when switching to custom mode
        return;
      default:
        newStartDate = startOfMonth(today);
        newEndDate = endOfMonth(today);
    }

    // Aggiunto log di debug prima di impostare le date
    console.log("handleTimeRangeChange:", {
      range,
      newStartDate: format(newStartDate, "yyyy-MM-dd"),
      newEndDate: format(newEndDate, "yyyy-MM-dd"),
    });

    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleCustomStartDateChange = (date: string) => {
    console.log("handleCustomStartDateChange:", date);
    setCustomStartDate(date);
  };

  const handleCustomEndDateChange = (date: string) => {
    console.log("handleCustomEndDateChange:", date);
    setCustomEndDate(date);
  };

  const applyCustomDateRange = () => {
    try {
      const parsedStartDate = new Date(customStartDate);
      const parsedEndDate = new Date(customEndDate);

      // Validate dates
      if (!isValid(parsedStartDate) || !isValid(parsedEndDate)) {
        console.error("Date non valide:", { customStartDate, customEndDate });
        return;
      }

      if (parsedEndDate < parsedStartDate) {
        console.error("La data di fine è precedente alla data di inizio");
        return;
      }

      // Set time to start and end of day
      const startDateWithTime = startOfDay(parsedStartDate);
      const endDateWithTime = endOfDay(parsedEndDate);

      console.log("applyCustomDateRange:", {
        startDateWithTime: format(startDateWithTime, "yyyy-MM-dd"),
        endDateWithTime: format(endDateWithTime, "yyyy-MM-dd"),
      });

      setStartDate(startDateWithTime);
      setEndDate(endDateWithTime);
    } catch (error) {
      console.error(
        "Errore nell'applicare il range di date personalizzato:",
        error
      );
    }
  };

  const formatDateForAPI = useCallback((date: Date): string => {
    if (!isValid(date)) {
      console.warn("Data non valida fornita a formatDateForAPI:", date);
      return format(new Date(), "yyyy-MM-dd");
    }
    return format(date, "yyyy-MM-dd");
  }, []);

  return {
    selectedTimeRange,
    startDate,
    endDate,
    customStartDate,
    customEndDate,
    handleTimeRangeChange,
    handleCustomStartDateChange,
    handleCustomEndDateChange,
    applyCustomDateRange,
    formatDateForAPI,
  };
}

export default useDashboardDateRange;
