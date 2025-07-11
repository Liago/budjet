import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "styled-components/native";
import CustomDateRangeModal from "../CustomDateRangeModal";

// Periodi disponibili
export type DateFilterPeriod = "current" | "1m" | "3m" | "6m" | "1y" | "custom";

interface DateFilterProps {
  selectedPeriod: DateFilterPeriod;
  onSelectPeriod: (period: DateFilterPeriod) => void;
  onSelectCustomRange?: (startDate: string, endDate: string) => void;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

// Helper per calcolare le date in base al periodo selezionato
export const getDateRangeFromPeriod = (period: DateFilterPeriod): DateRange => {
  console.log(
    `🗓️ [DATE-DEBUG] getDateRangeFromPeriod called with period: ${period}`
  );

  const today = new Date();
  let startDate: Date;
  let endDate: Date = new Date(today); // Per default, la data finale è oggi

  console.log(`📅 [DATE-DEBUG] Today's date:`, {
    today: today.toISOString(),
    year: today.getFullYear(),
    month: today.getMonth() + 1, // +1 because getMonth() is 0-based
    day: today.getDate(),
  });

  switch (period) {
    case "current":
      // Mese corrente: dal primo all'ultimo giorno del mese corrente
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      // Ultimo giorno del mese corrente
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      console.log(`📆 [DATE-DEBUG] Current month range:`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      break;
    case "1m":
      // Ultimo mese: da 1 mese fa (dalla data di oggi) a oggi
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
      // Manteniamo lo stesso giorno del mese, se possibile
      break;
    case "3m":
      // Ultimi 3 mesi: da 3 mesi fa (dalla data di oggi) a oggi
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 3);
      break;
    case "6m":
      // Ultimi 6 mesi: da 6 mesi fa (dalla data di oggi) a oggi
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 6);
      break;
    case "1y":
      // Ultimo anno: da 1 anno fa (dalla data di oggi) a oggi
      startDate = new Date(today);
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    case "custom":
    default:
      // Per il custom usiamo un mese indietro come default, ma sarà sovrascritto
      // dalle date selezionate dall'utente
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
      break;
  }

  // Formatta le date in formato YYYY-MM-DD
  const result = {
    startDate: formatDateToYYYYMMDD(startDate),
    endDate: formatDateToYYYYMMDD(endDate),
  };

  console.log(`✅ [DATE-DEBUG] Final date range:`, result);
  return result;
};

// Funzione di utility per formattare la data in YYYY-MM-DD
export const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Componente DateFilter
export const DateFilter: React.FC<DateFilterProps> = ({
  selectedPeriod,
  onSelectPeriod,
  onSelectCustomRange,
}) => {
  const theme = useTheme();
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // Opzioni di filtro date
  const filterOptions = [
    { id: "current", label: "Mese Corrente" },
    { id: "1m", label: "1 Mese" },
    { id: "3m", label: "3 Mesi" },
    { id: "6m", label: "6 Mesi" },
    { id: "1y", label: "1 Anno" },
    { id: "custom", label: "Personalizzato" },
  ];

  const handlePeriodSelect = (period: DateFilterPeriod) => {
    // Se l'utente seleziona 'custom', mostra il modal
    if (period === "custom") {
      // Prepara le date iniziali per il modal
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);

      setCustomStartDate(formatDateToYYYYMMDD(oneMonthAgo));
      setCustomEndDate(formatDateToYYYYMMDD(today));
      setShowCustomModal(true);
    } else {
      onSelectPeriod(period);
    }
  };

  const handleCustomDateApply = (startDate: string, endDate: string) => {
    // Salva le date personalizzate selezionate
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);

    // Informa il componente padre che l'utente ha selezionato 'custom' e le date specifiche
    onSelectPeriod("custom");

    // Se è definito onSelectCustomRange, chiamalo con le date selezionate
    if (onSelectCustomRange) {
      onSelectCustomRange(startDate, endDate);
    }
  };

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.filterOption,
              {
                backgroundColor:
                  selectedPeriod === option.id
                    ? theme.colors.primary
                    : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => handlePeriodSelect(option.id as DateFilterPeriod)}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    selectedPeriod === option.id
                      ? theme.colors.white
                      : theme.colors.text,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <CustomDateRangeModal
        visible={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onApply={handleCustomDateApply}
        initialStartDate={customStartDate}
        initialEndDate={customEndDate}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  filterOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default DateFilter;
