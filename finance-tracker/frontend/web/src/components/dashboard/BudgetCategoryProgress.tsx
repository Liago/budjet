import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../components/ui/card";

interface BudgetCategory {
  id: number;
  name: string;
  color: string;
  budget: number;
  spent: number;
  percentage: number;
}

interface BudgetCategoryProgressProps {
  budgetCategories: BudgetCategory[];
  formatAmount: (amount: number | string) => string;
}

const BudgetCategoryProgress: React.FC<BudgetCategoryProgressProps> = ({
  budgetCategories,
  formatAmount,
}) => {
  // Helper functions
  const getProgressBarColor = (percentage: number) => {
    if (percentage > 100) return "bg-gradient-to-r from-red-500 to-red-400"; // Oltre budget
    if (percentage > 90)
      return "bg-gradient-to-r from-orange-500 to-orange-400"; // Quasi al limite (90-100%)
    if (percentage > 75)
      return "bg-gradient-to-r from-yellow-500 to-yellow-400"; // Attenzione (75-90%)
    return "bg-gradient-to-r from-green-500 to-green-400"; // OK (0-75%)
  };

  const getPercentageTextColor = (percentage: number) => {
    if (percentage > 100) return "text-red-600 font-semibold";
    if (percentage > 90) return "text-orange-600 font-semibold";
    if (percentage > 75) return "text-yellow-600 font-semibold";
    return "text-green-600 font-semibold";
  };

  const calculateSpentPercentage = (percentage: number) => {
    return Math.min(percentage, 100);
  };

  return (
    <Card className="col-span-1 h-full flex flex-col">
      <CardHeader>
        <CardTitle>Progresso Budget</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {budgetCategories.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            Nessun budget impostato
          </div>
        ) : (
          <div className="space-y-5">
            {budgetCategories.map((category, index) => (
              <div key={`${category.id}-${category.name}-${index}`}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium text-sm">{category.name}</span>
                  </div>
                  <span className={getPercentageTextColor(category.percentage)}>
                    {category.percentage}%
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>€{formatAmount(category.spent)}</span>
                  <span>€{formatAmount(category.budget)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`${getProgressBarColor(
                      category.percentage
                    )} h-2.5 rounded-full transition-all duration-500 ease-in-out`}
                    style={{
                      width: `${calculateSpentPercentage(
                        category.percentage
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t bg-gradient-to-r from-teal-50 to-cyan-50">
        <p className="text-sm font-medium flex items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-teal-600"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <path d="M2 10h20" />
          </svg>
          Questo periodo
        </p>
      </CardFooter>
    </Card>
  );
};

export default BudgetCategoryProgress;
