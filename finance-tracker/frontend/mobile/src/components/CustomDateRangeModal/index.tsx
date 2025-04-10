import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '../common/button';

interface CustomDateRangeModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

const formatDateToDisplay = (date: Date): string => {
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDate = (dateString: string | undefined): Date => {
  if (!dateString) return new Date();
  try {
    return new Date(dateString);
  } catch (error) {
    return new Date();
  }
};

const CustomDateRangeModal: React.FC<CustomDateRangeModalProps> = ({
  visible,
  onClose,
  onApply,
  initialStartDate,
  initialEndDate,
}) => {
  const theme = useTheme();
  const today = new Date();
  
  const [startDate, setStartDate] = useState<Date>(parseDate(initialStartDate));
  const [endDate, setEndDate] = useState<Date>(parseDate(initialEndDate));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setStartDate(currentDate);
    
    // Se la data di inizio è successiva alla data di fine, aggiorna anche la data di fine
    if (currentDate > endDate) {
      setEndDate(currentDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === 'ios');
    setEndDate(currentDate);
  };

  const handleApply = () => {
    onApply(formatDateToYYYYMMDD(startDate), formatDateToYYYYMMDD(endDate));
    onClose();
  };

  const renderIOSDatePickers = () => (
    <View style={styles.iosPickersContainer}>
      <DateTimePicker
        value={startDate}
        mode="date"
        display="spinner"
        onChange={handleStartDateChange}
        maximumDate={today}
        style={styles.iosPicker}
      />
      <DateTimePicker
        value={endDate}
        mode="date"
        display="spinner"
        onChange={handleEndDateChange}
        minimumDate={startDate}
        maximumDate={today}
        style={styles.iosPicker}
      />
    </View>
  );

  const renderAndroidDatePickers = () => (
    <View>
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
          maximumDate={today}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          minimumDate={startDate}
          maximumDate={today}
        />
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Seleziona intervallo di date
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.dateRangeContainer}>
            <View style={styles.datePickerRow}>
              <Text style={[styles.dateLabel, { color: theme.colors.text }]}>Data Inizio</Text>
              {Platform.OS === 'android' ? (
                <TouchableOpacity
                  style={[styles.dateButton, { borderColor: theme.colors.border }]}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={{ color: theme.colors.text }}>
                    {formatDateToDisplay(startDate)}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.datePickerRow}>
              <Text style={[styles.dateLabel, { color: theme.colors.text }]}>Data Fine</Text>
              {Platform.OS === 'android' ? (
                <TouchableOpacity
                  style={[styles.dateButton, { borderColor: theme.colors.border }]}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={{ color: theme.colors.text }}>
                    {formatDateToDisplay(endDate)}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {Platform.OS === 'ios' ? renderIOSDatePickers() : renderAndroidDatePickers()}

          <View style={styles.buttonsContainer}>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
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
  dateRangeContainer: {
    marginBottom: 20,
  },
  datePickerRow: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  iosPickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iosPicker: {
    flex: 1,
    height: 200,
  },
  buttonsContainer: {
    marginTop: 20,
  },
});

export default CustomDateRangeModal;