import React from "react";
import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number | string;
  type: "INCOME" | "EXPENSE";
  variant?: "default" | "compact" | "detailed" | "banking";
  className?: string;
  showSign?: boolean;
  showType?: boolean;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  type,
  variant = "default",
  className,
  showSign = true,
  showType = false,
}) => {
  const numericAmount = parseFloat(amount.toString());

  // Standard bancario italiano per formattazione
  const formatCurrency = (value: number) => {
    return value.toLocaleString("it-IT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const baseClasses = "font-mono font-semibold tabular-nums";

  const getVariantStyles = () => {
    switch (variant) {
      case "banking":
        return type === "INCOME"
          ? "text-green-700 dark:text-green-400"
          : "text-gray-900 dark:text-gray-100";

      case "detailed":
        return type === "INCOME"
          ? "text-green-600 bg-green-50 px-2 py-1 rounded dark:bg-green-900/20 dark:text-green-400"
          : "text-red-600 bg-red-50 px-2 py-1 rounded dark:bg-red-900/20 dark:text-red-400";

      case "compact":
        return type === "INCOME"
          ? "text-green-600 text-sm"
          : "text-red-600 text-sm";

      default:
        return type === "INCOME" ? "text-green-600" : "text-red-600";
    }
  };

  const getSign = () => {
    if (!showSign) return "";
    return type === "INCOME" ? "+ " : "";
  };

  const getTypeLabel = () => {
    if (!showType) return null;
    return (
      <div className="text-xs text-muted-foreground mt-1">
        {type === "INCOME" ? "Entrata" : "Uscita"}
      </div>
    );
  };

  return (
    <div className={cn("text-right", className)}>
      <div className={cn(baseClasses, getVariantStyles())}>
        {getSign()}€ {formatCurrency(Math.abs(numericAmount))}
      </div>
      {getTypeLabel()}
    </div>
  );
};
