import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusIcon } from '../Icons';
import { Category } from '../../utils/types';
import CategoryCard from './CategoryCard';

interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  isLoading,
  onEdit,
  onDelete,
  onAdd
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {isLoading ? (
        <div className="col-span-full flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : categories.length > 0 ? (
        categories.map((category) => (
          <CategoryCard 
            key={category.id} 
            category={category} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-500 mb-4">No categories found. Create your first category to get started.</p>
          <Button onClick={onAdd}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Category
          </Button>
        </div>
      )}
    </div>
  );
};

export default CategoryList; 