import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { useTheme } from 'styled-components/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../common/button';

interface DateRangePickerProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

interface FormattedDateRange {
  startDate: string; // formato YYYY-MM-DD
  endDate: string; // formato YYYY-MM-DD
}

// Funzione per formattare la data in formato leggibile (DD/MM/YYYY)
const formatDateDisplay = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Funzione per formattare la data in formato YYYY-MM-DD
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  isVisible,
  onClose,
  onApply,
  initialStartDate,
  initialEndDate,
}) => {
  const theme = useTheme();
  
  // Inizializza le date se fornite, altrimenti usa le date predefinite
  const [startDate, setStartDate] = useState<Date>(
    initialStartDate || new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [endDate, setEndDate] = useState<Date>(
    initialEndDate || new Date()
  );
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  // Gestisci il cambiamento della data di inizio
  const onStartDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartPicker(Platform.OS === 'ios');
    setStartDate(currentDate);
    
    // Se la data di inizio è successiva alla data di fine, aggiorna la data di fine
    if (currentDate > endDate) {
      setEndDate(currentDate);
    }
  };
  
  // Gestisci il cambiamento della data di fine
  const onEndDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndPicker(Platform.OS === 'ios');
    
    // Impedisci di selezionare una data di fine precedente alla data di inizio
    if (currentDate >= startDate) {
      setEndDate(currentDate);
    }
  };
  
  // Applica il range di date selezionato
  const handleApply = () => {
    onApply(formatDateForAPI(startDate), formatDateForAPI(endDate));
    onClose();
  };
  
  if (!isVisible) return null;
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Seleziona intervallo date
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.datePickersContainer}>
            {/* Selettore data inizio */}
            <View style={styles.datePickerSection}>
              <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>
                Data Inizio
              </Text>
              <TouchableOpacity
                style={[styles.dateInput, { borderColor: theme.colors.border }]}
                onPress={() => setShowStartPicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} style={styles.calendarIcon} />
                <Text style={[styles.dateText, { color: theme.colors.text }]}>
                  {formatDateDisplay(startDate)}
                </Text>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onStartDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
            
            {/* Selettore data fine */}
            <View style={styles.datePickerSection}>
              <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>
                Data Fine
              </Text>
              <TouchableOpacity
                style={[styles.dateInput, { borderColor: theme.colors.border }]}
                onPress={() => setShowEndPicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} style={styles.calendarIcon} />
                <Text style={[styles.dateText, { color: theme.colors.text }]}>
                  {formatDateDisplay(endDate)}
                </Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onEndDateChange}
                  minimumDate={startDate}
                  maximumDate={new Date()}
                />
              )}
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Applica"
              onPress={handleApply}
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  datePickersContainer: {
    marginBottom: 20,
  },
  datePickerSection: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  calendarIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
  },
});

export default DateRangePicker;
