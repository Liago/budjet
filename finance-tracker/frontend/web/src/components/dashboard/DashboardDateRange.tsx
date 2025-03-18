import React, { useState, useEffect } from 'react';
import { CalendarIcon } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Calendar } from '../ui/calendar';
import { PopoverContent, Popover, PopoverTrigger } from '../ui/popover';

import { cn } from "../../lib/utils";

import { format } from "date-fns";
import { it } from 'date-fns/locale';

type TimeRange = 'current-month' | '1-month' | '3-months' | '6-months' | '1-year' | 'custom';

interface DashboardDateRangeProps {
  selectedTimeRange: TimeRange;
  customStartDate: string;
  customEndDate: string;
  onTimeRangeChange: (range: TimeRange) => void;
  onCustomStartDateChange: (date: string) => void;
  onCustomEndDateChange: (date: string) => void;
  onApplyCustomDateRange: () => void;
}

export const DashboardDateRange: React.FC<DashboardDateRangeProps> = ({
  selectedTimeRange,
  customStartDate,
  customEndDate,
  onTimeRangeChange,
  onCustomStartDateChange,
  onCustomEndDateChange,
  onApplyCustomDateRange
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleCustomRangeClick = () => {
    onTimeRangeChange('custom');
    setIsDatePickerOpen(!isDatePickerOpen);
  };

  const handleApplyCustomDateRange = () => {
    onApplyCustomDateRange();
    setIsDatePickerOpen(false);
  };

  // Effetto di debug per monitorare i cambiamenti di periodo
  useEffect(() => {
    console.log('DashboardDateRange - periodo selezionato:', {
      selectedTimeRange,
      customStartDate,
      customEndDate,
      isDatePickerOpen
    });
  }, [selectedTimeRange, customStartDate, customEndDate, isDatePickerOpen]);
  
  // Funzione per evidenziare in modo più chiaro il pulsante selezionato
  const getButtonVariant = (buttonRange: TimeRange) => {
    return selectedTimeRange === buttonRange ? 
      "default" : 
      "outline";
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button
          variant={getButtonVariant('current-month')}
          size="sm"
          onClick={() => onTimeRangeChange('current-month')}
          className={selectedTimeRange === 'current-month' ? "ring-2 ring-primary" : ""}
        >
          Mese Corrente
        </Button>
        <Button
          variant={getButtonVariant('1-month')}
          size="sm"
          onClick={() => onTimeRangeChange('1-month')}
          className={selectedTimeRange === '1-month' ? "ring-2 ring-primary" : ""}
        >
          1 Mese
        </Button>
        <Button
          variant={getButtonVariant('3-months')}
          size="sm"
          onClick={() => onTimeRangeChange('3-months')}
          className={selectedTimeRange === '3-months' ? "ring-2 ring-primary" : ""}
        >
          3 Mesi
        </Button>
        <Button
          variant={getButtonVariant('6-months')}
          size="sm"
          onClick={() => onTimeRangeChange('6-months')}
          className={selectedTimeRange === '6-months' ? "ring-2 ring-primary" : ""}
        >
          6 Mesi
        </Button>
        <Button
          variant={getButtonVariant('1-year')}
          size="sm"
          onClick={() => onTimeRangeChange('1-year')}
          className={selectedTimeRange === '1-year' ? "ring-2 ring-primary" : ""}
        >
          1 Anno
        </Button>
        <Button
          variant={getButtonVariant('custom')}
          size="sm"
          onClick={handleCustomRangeClick}
          className={selectedTimeRange === 'custom' ? "ring-2 ring-primary" : ""}
        >
          Personalizzato
        </Button>
      </div>

      {isDatePickerOpen && (
        <div className="flex flex-wrap items-end gap-4 p-4 bg-gray-50 rounded-lg mb-4">
          <div>
            <p className="text-sm font-medium mb-2">Data Inizio</p>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !customStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStartDate ? format(new Date(customStartDate), "d MMMM yyyy", { locale: it }) : "Seleziona una data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customStartDate ? new Date(customStartDate) : undefined}
                    onSelect={(date: Date | undefined) => date && onCustomStartDateChange(format(date, 'yyyy-MM-dd'))}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Data Fine</p>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !customEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEndDate ? format(new Date(customEndDate), "d MMMM yyyy", { locale: it }) : "Seleziona una data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customEndDate ? new Date(customEndDate) : undefined}
                    onSelect={(date: Date | undefined) => date && onCustomEndDateChange(format(date, 'yyyy-MM-dd'))}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button size="sm" onClick={handleApplyCustomDateRange}>
            Applica
          </Button>
        </div>
      )}
    </div>
  );
};

export default DashboardDateRange; 