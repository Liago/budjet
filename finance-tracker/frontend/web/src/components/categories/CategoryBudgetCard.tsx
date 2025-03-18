import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EditIcon, getIconByName } from "../Icons";
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

  const calculateSpentPercentage = () => {
    return Math.min(Math.round((spent / budget) * 100), 100);
  };

  const getRealSpentPercentage = () => {
    return Math.round((spent / budget) * 100);
  };

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

  const percentage = getRealSpentPercentage();

  return (
    <Card className="overflow-hidden">
      <div className="h-2" style={{ backgroundColor: category.color }}></div>
      <CardContent className="p-4">
        <div className="flex items-center mb-3">
          {renderCategoryIcon(category.icon, category.color)}
          <h3 className="font-medium">{category.name}</h3>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-sm mb-3">
            <span className="font-medium text-gray-600">Budget mensile:</span>
            <span className="font-bold text-blue-600">
              ${budget.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-sm mb-3">
            <span className="font-medium text-gray-600">Speso:</span>
            <span
              className={`font-bold ${
                isOverBudget() ? "text-red-600" : "text-green-600"
              }`}
            >
              ${spent.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-sm mb-3">
            <span className="font-medium text-gray-600">Rimanente:</span>
            <span
              className={`font-bold ${
                remaining < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              ${remaining.toFixed(2)}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Utilizzato:</span>
              <span className={getPercentageTextColor(percentage)}>
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`${getProgressBarColor(
                  percentage
                )} h-2.5 rounded-full transition-all duration-500 ease-in-out`}
                style={{ width: `${calculateSpentPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
            <EditIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryBudgetCard;
