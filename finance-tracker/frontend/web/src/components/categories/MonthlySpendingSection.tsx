import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "../Icons";
import { Category } from "../../utils/types";
import CategoryBudgetCard from "./CategoryBudgetCard";
import CategorySpendingModal from "./CategorySpendingModal";

interface MonthlySpendingProps {
  categories: Category[];
  categorySpending: { [key: string]: number };
  monthlyAverages: { [key: string]: number };
  timeFilter: string;
  availableMonths: { value: string; label: string }[];
  loadingSpending: boolean;
  onTimeFilterChange: (value: string) => void;
  onEditCategory: (category: Category) => void;
}

const MonthlySpendingSection: React.FC<MonthlySpendingProps> = ({
  categories,
  categorySpending,
  monthlyAverages,
  timeFilter,
  availableMonths,
  loadingSpending,
  onTimeFilterChange,
  onEditCategory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtra le categorie con budget e ordinale per budget decrescente
  const categoriesWithBudget = categories
    .filter((category) => category.budget)
    .sort((a, b) => Number(b.budget) - Number(a.budget)); // Ordina per budget decrescente

  // Prendi la prima categoria come predefinita per l'aggiunta di budget (se disponibile)
  const defaultCategory = categories.length > 0 ? categories[0] : undefined;

  const handleViewCategoryDetails = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-700">
            Spese Mensili per Categoria
          </h2>
          <Select value={timeFilter} onValueChange={onTimeFilterChange}>
            <SelectTrigger className="w-[180px] bg-white">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Seleziona periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i periodi</SelectItem>
              <SelectItem value="current-month">Mese corrente</SelectItem>
              {availableMonths.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-gray-600 mt-1">
          Visualizza quanto speso nel periodo selezionato per ciascuna categoria
          con budget allocato. Clicca su una categoria per vedere i dettagli.
        </p>
      </div>

      {timeFilter !== "all" ? (
        loadingSpending ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading spending data...</p>
          </div>
        ) : categoriesWithBudget.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoriesWithBudget.map((category) => (
              <CategoryBudgetCard
                key={category.id}
                category={category}
                spent={categorySpending[category.id] || 0}
                monthlyAverage={monthlyAverages[category.id] || 0}
                onEdit={onEditCategory}
                onViewDetails={handleViewCategoryDetails}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-gray-500 mb-4">
                No categories with budget found. Set budgets for your categories
                to track spending.
              </p>
              <Button
                onClick={() =>
                  defaultCategory && onEditCategory(defaultCategory)
                }
              >
                Set Category Budget
              </Button>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">
              Select "Current Month" to view budget vs spending for your
              categories.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Category Spending Modal */}
      <CategorySpendingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        category={selectedCategory}
        timeFilter={timeFilter}
        availableMonths={availableMonths}
      />
    </div>
  );
};

export default MonthlySpendingSection;
