import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TopSpendingCategoryProps {
  categoryName: string;
  categoryColor: string;
  amount: number;
  percentage: number;
  formatAmount: (amount: number | string) => string;
}

const TopSpendingCategory: React.FC<TopSpendingCategoryProps> = ({
  categoryName,
  categoryColor,
  amount,
  percentage,
  formatAmount,
}) => {
  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="pb-2 bg-gradient-to-r from-violet-50 to-fuchsia-50">
        <CardTitle className="text-lg flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-violet-600"
          >
            <path d="M2 10h20" />
            <path d="M6 14h2" />
            <path d="M16 14h2" />
            <path d="M10 14h4" />
            <rect width="20" height="14" x="2" y="5" rx="2" />
          </svg>
          Categoria Prin...
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-3xl font-bold text-violet-600 mb-1">
          {categoryName}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: categoryColor }}
          />
          <span className="text-sm text-gray-500">
            €{formatAmount(amount)} ({percentage}% delle spese)
          </span>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-gradient-to-r from-violet-50 to-fuchsia-50">
        <p className="text-sm font-medium text-violet-600 hover:text-violet-500 cursor-pointer">
          Dettagli
        </p>
      </CardFooter>
    </Card>
  );
};

export default TopSpendingCategory;
