import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditIcon, TrashIcon, getIconByName } from "../Icons";
import { Category } from "../../utils/types";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
}) => {
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

  // Ensure budget is a number for display
  const budgetValue = category.budget ? Number(category.budget) : 0;

  return (
    <Card className="overflow-hidden bg-white">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
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
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onDelete(category.id)}
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center">
          {renderCategoryIcon(category.icon, category.color)}
          {category.budget ? (
            <span className="text-xl font-semibold">
              €{budgetValue.toFixed(0)}
            </span>
          ) : (
            <span className="text-sm text-gray-500 italic">Nessun budget</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
