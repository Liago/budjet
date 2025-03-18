import React from "react";
import { SearchIcon } from "../Icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "../../utils/types";

interface TransactionFilterProps {
  searchTerm: string;
  filterType: "all" | "INCOME" | "EXPENSE";
  filterCategory: string;
  filterMonth: string;
  availableMonths: { value: string; label: string }[];
  categories: Category[];
  onSearchChange: (value: string) => void;
  onTypeChange: (value: "all" | "INCOME" | "EXPENSE") => void;
  onCategoryChange: (value: string) => void;
  onMonthChange: (value: string) => void;
}

const TransactionFilter: React.FC<TransactionFilterProps> = ({
  searchTerm,
  filterType,
  filterCategory,
  filterMonth,
  availableMonths,
  categories,
  onSearchChange,
  onTypeChange,
  onCategoryChange,
  onMonthChange,
}) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search" className="mb-2">
              Search
            </Label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="Search transactions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="month" className="mb-2">
              Mese
            </Label>
            <Select value={filterMonth} onValueChange={onMonthChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tutti i mesi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i mesi</SelectItem>
                {availableMonths.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type" className="mb-2">
              Type
            </Label>
            <Select
              value={filterType}
              onValueChange={(value) =>
                onTypeChange(value as "all" | "INCOME" | "EXPENSE")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category" className="mb-2">
              Category
            </Label>
            <Select value={filterCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionFilter;
