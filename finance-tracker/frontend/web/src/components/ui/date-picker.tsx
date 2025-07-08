import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { it } from "date-fns/locale";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Input } from "./input";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

// Enhanced Safari detection function
const isSafari = () => {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  const vendor = window.navigator.vendor?.toLowerCase() || "";

  // More comprehensive Safari detection
  return (
    (userAgent.includes("safari") &&
      !userAgent.includes("chrome") &&
      !userAgent.includes("chromium")) ||
    vendor.includes("apple") ||
    /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent)
  );
};

// Check if Popover is problematic (fallback for any browser with Popover issues)
const hasPopoverIssues = () => {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent.toLowerCase();

  // Safari and any mobile browser often have Popover issues
  return (
    isSafari() ||
    userAgent.includes("safari") ||
    /iphone|ipad|ipod|android|mobile/i.test(userAgent)
  );
};

export function DatePicker({
  date,
  setDate,
  placeholder = "Seleziona una data",
  className,
}: DatePickerProps) {
  const [useNativeInput, setUseNativeInput] = React.useState(false);
  const [popoverError, setPopoverError] = React.useState(false);

  React.useEffect(() => {
    // Check if we should use native input
    const shouldUseNative = hasPopoverIssues();
    setUseNativeInput(shouldUseNative);

    console.log("DatePicker - Browser detection:", {
      userAgent: window.navigator.userAgent,
      isSafari: isSafari(),
      hasPopoverIssues: hasPopoverIssues(),
      useNativeInput: shouldUseNative,
    });
  }, []);

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      // Create date in local timezone to avoid timezone issues
      const selectedDate = new Date(value + "T00:00:00");
      setDate(selectedDate);
    } else {
      setDate(undefined);
    }
  };

  // Error boundary for Popover - fallback to native input
  const handlePopoverError = React.useCallback(() => {
    console.warn("Popover error detected, falling back to native input");
    setPopoverError(true);
    setUseNativeInput(true);
  }, []);

  // Use native date input for Safari, mobile, or if Popover has issues
  if (useNativeInput || popoverError) {
    return (
      <div className={cn("relative w-full", className)}>
        <Input
          type="date"
          value={date ? format(date, "yyyy-MM-dd") : ""}
          onChange={handleNativeDateChange}
          className="w-full pl-10 pr-3"
          placeholder={placeholder}
          style={{
            colorScheme: "light",
            // Ensure native date picker is visible and functional
            WebkitAppearance: "none",
            appearance: "none",
          }}
        />
        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <div className="text-xs text-muted-foreground mt-1">
          {date && `Selezionato: ${format(date, "dd/MM/yyyy", { locale: it })}`}
        </div>
      </div>
    );
  }

  // Other browsers: Use custom popover calendar with error handling
  try {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
            onClick={(e) => {
              // Additional Safari handling - if click doesn't work, fallback
              setTimeout(() => {
                if (isSafari()) {
                  handlePopoverError();
                }
              }, 100);
            }}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, "PPP", { locale: it })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
          onOpenAutoFocus={(e) => {
            // Handle focus issues in Safari
            if (isSafari()) {
              e.preventDefault();
            }
          }}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus={!isSafari()}
            locale={it}
          />
        </PopoverContent>
      </Popover>
    );
  } catch (error) {
    console.error("Popover error:", error);
    handlePopoverError();
    return null; // Will re-render with native input
  }
}
