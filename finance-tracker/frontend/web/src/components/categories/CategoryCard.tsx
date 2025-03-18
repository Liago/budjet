import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditIcon, TrashIcon, getIconByName } from '../Icons';
import { Category } from '../../utils/types';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  onEdit, 
  onDelete 
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

  return (
    <Card className="overflow-hidden">
      <div 
        className="h-2"
        style={{ backgroundColor: category.color }}
      ></div>
      <CardContent className="p-4">
        <div className="flex items-center mb-2">
          {renderCategoryIcon(category.icon, category.color)}
          <h3 className="font-medium">{category.name}</h3>
        </div>
        {category.budget && (
          <div className="mt-2">
            <div className="flex justify-between mb-1 text-sm">
              <span>Monthly Budget:</span>
              <span className="font-medium">${Number(category.budget).toFixed(2)}</span>
            </div>
          </div>
        )}
        <div className="flex justify-end mt-4 space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(category)}
          >
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDelete(category.id)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard; 