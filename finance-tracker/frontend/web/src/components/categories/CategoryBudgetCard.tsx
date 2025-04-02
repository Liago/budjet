import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EditIcon, getIconByName, ArrowUpIcon, ArrowDownIcon } from "../Icons";
import { Category } from "../../utils/types";

interface CategoryBudgetCardProps {
  category: Category;
  spent: number;
  onEdit: (category: Category) => void;
}

const CategoryBudgetCard: React.FC<CategoryBudgetCardProps> = ({
  category,
  spent,
  onEdit,
}) => {
  const budget = Number(category.budget);
  const remaining = budget - spent;

  // Helper functions
  const renderCategoryIcon = (iconName: string, color: string) => {
    const IconComponent = getIconByName(iconName);
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
        style={{ backgroundColor: color }}
      >
        <IconComponent className="text-white" size={16} />
      </div>
    );
  };

  const isOverBudget = () => spent > budget;

  // Calcola la percentuale effettiva di budget utilizzato
  const calculatePercentage = () => {
    if (budget <= 0) return 0;
    return Math.round((spent / budget) * 100);
  };

  const calculateSpentPercentage = () => {
    return Math.min(calculatePercentage(), 100);
  };

  // Get color based on percentage
  const getProgressColor = (percentage: number) => {
    if (percentage > 90) return "#ef4444"; // red-500
    if (percentage > 75) return "#f97316"; // orange-500
    if (percentage > 50) return "#eab308"; // yellow-500
    return "#22c55e"; // green-500
  };

  const getPercentageTextColor = (percentage: number) => {
    if (percentage > 100) return "text-red-600 font-semibold";
    if (percentage > 90) return "text-orange-600 font-semibold";
    if (percentage > 75) return "text-yellow-600 font-semibold";
    return "text-green-600 font-semibold";
  };

  const percentage = calculatePercentage();
  const isTrendingUp = isOverBudget(); // Usiamo questo per determinare se mostrare la freccia su o giù

  return (
    <Card className="overflow-hidden bg-white">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium text-base">{category.name}</h3>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onEdit(category)}
            >
              <EditIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center mb-3">
          {renderCategoryIcon(category.icon, category.color)}
          <div className="flex items-center">
            {isTrendingUp ? (
              <ArrowUpIcon className="h-4 w-4 text-red-500 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-green-500 mr-1" />
            )}
            <span className="text-2xl font-semibold">€{budget.toFixed(0)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm mb-3">
            <span className="font-medium text-gray-600">Budget mensile:</span>
            <span className="font-bold text-blue-600">
              €{budget.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-sm mb-3">
            <span className="font-medium text-gray-600">Speso:</span>
            <span
              className={`font-bold ${
                isOverBudget() ? "text-red-600" : "text-green-600"
              }`}
            >
              €{spent.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-sm mb-3">
            <span className="font-medium text-gray-600">Rimanente:</span>
            <span
              className={`font-bold ${
                remaining < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              €{remaining.toFixed(2)}
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Utilizzato:</span>
              <span className={getPercentageTextColor(percentage)}>
                {percentage}%
              </span>
            </div>

            <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-in-out"
                style={{
                  width: `${calculateSpentPercentage()}%`,
                  backgroundColor: getProgressColor(percentage),
                }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryBudgetCard;
