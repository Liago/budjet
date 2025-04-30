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
    <CardContent className="pt-4 px-3 pb-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <Label htmlFor="search" className="text-xs mb-1 block">
            Search
          </Label>
          <div className="relative">
            <SearchIcon className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Search..."
              className="pl-8 h-8 text-sm"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="month" className="text-xs mb-1 block">
            Mese
          </Label>
          <Select value={filterMonth} onValueChange={onMonthChange}>
            <SelectTrigger className="h-8 text-sm">
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
          <Label htmlFor="type" className="text-xs mb-1 block">
            Type
          </Label>
          <Select
            value={filterType}
            onValueChange={(value) =>
              onTypeChange(value as "all" | "INCOME" | "EXPENSE")
            }
          >
            <SelectTrigger className="h-8 text-sm">
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
          <Label htmlFor="category" className="text-xs mb-1 block">
            Category
          </Label>
          <Select value={filterCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="h-8 text-sm">
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
  );
};

export default TransactionFilter;
