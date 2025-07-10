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

// Enhanced Safari detection - più aggressivo
const isSafari = () => {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  const vendor = window.navigator.vendor?.toLowerCase() || "";

  // Detection più completa per Safari desktop e mobile
  return (
    userAgent.includes("safari") ||
    vendor.includes("apple") ||
    /iphone|ipad|ipod/i.test(userAgent) ||
    /macintosh/i.test(userAgent) ||
    /version\/.*safari/i.test(userAgent)
  );
};

// Check se è mobile device
const isMobile = () => {
  if (typeof window === "undefined") return false;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    window.navigator.userAgent
  );
};

export function DatePicker({
  date,
  setDate,
  placeholder = "Seleziona una data",
  className,
}: DatePickerProps) {
  const [shouldUseNativeInput, setShouldUseNativeInput] = React.useState(false);

  React.useEffect(() => {
    // SEMPRE usa input nativo per Safari e mobile
    const useNative = isSafari() || isMobile();
    setShouldUseNativeInput(useNative);

    console.log("DatePicker - Detection:", {
      userAgent: window.navigator.userAgent,
      vendor: window.navigator.vendor,
      isSafari: isSafari(),
      isMobile: isMobile(),
      useNative,
    });
  }, []);

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // Formato yyyy-MM-dd
    if (value) {
      // Crea data in local timezone evitando problemi di timezone
      const selectedDate = new Date(value + "T00:00:00");
      setDate(selectedDate);
    } else {
      setDate(undefined);
    }
  };

  // Se Safari o mobile, usa SEMPRE input nativo
  if (shouldUseNativeInput) {
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
            WebkitAppearance: "none",
            appearance: "none",
          }}
        />
        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        {date && (
          <div className="text-xs text-muted-foreground mt-1">
            {format(date, "dd/MM/yyyy", { locale: it })}
          </div>
        )}
      </div>
    );
  }

  // Altri browser: usa Popover calendar
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
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "PPP", { locale: it })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          locale={it}
        />
      </PopoverContent>
    </Popover>
  );
}
