import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogFooter, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getIconByName, CategoryIcons } from '../Icons';
import { Category } from '../../utils/types';

interface ValidationErrors {
  [key: string]: string | null;
}

interface CategoryFormProps {
  category: Category | null;
  onSubmit: (formData: CategoryFormData) => void;
  onCancel: () => void;
  errors: ValidationErrors;
}

export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  budget: string;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  errors
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    icon: 'ShoppingCart',
    color: '#3B82F6',
    budget: '',
  });

  // Predefined colors for categories
  const colorOptions = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#F97316', // Orange
    '#14B8A6', // Teal
    '#6B7280', // Gray
  ];
  
  // Icon options for categories
  const iconOptions = Object.keys(CategoryIcons);
  
  // Set form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        icon: category.icon || 'ShoppingCart',
        color: category.color,
        budget: category.budget ? category.budget.toString() : '',
      });
    } else {
      setFormData({
        name: '',
        icon: 'ShoppingCart',
        color: '#3B82F6',
        budget: '',
      });
    }
  }, [category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectIcon = (icon: string) => {
    setFormData(prev => ({ ...prev, icon }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogDescription>
          {category ? 'Update your category details.' : 'Create a new category for your transactions.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-black' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
            {errors.color && <p className="text-sm text-red-500">{errors.color}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="icon">Icon</Label>
            <div className="h-32 overflow-y-auto border rounded-md p-2">
              <div className="grid grid-cols-5 gap-2">
                {iconOptions.map((icon) => {
                  const IconComponent = getIconByName(icon);
                  return (
                    <button
                      key={icon}
                      type="button"
                      className={`p-2 rounded-md flex items-center justify-center ${formData.icon === icon ? 'bg-primary/20 border border-primary' : 'hover:bg-gray-100'}`}
                      onClick={() => handleSelectIcon(icon)}
                    >
                      <IconComponent size={20} />
                    </button>
                  );
                })}
              </div>
            </div>
            {errors.icon && <p className="text-sm text-red-500">{errors.icon}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="budget">Monthly Budget (optional)</Label>
            <Input
              id="budget"
              name="budget"
              type="number"
              placeholder="0.00"
              value={formData.budget}
              onChange={handleInputChange}
              min="0"
              step="0.01"
            />
            <p className="text-sm text-gray-500">Set a monthly budget limit for this category</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {category ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export default CategoryForm; 