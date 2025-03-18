import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchIcon } from '../Icons';

interface CategoryFilterProps {
  searchTerm: string;
  filterType: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  searchTerm,
  filterType,
  onSearchChange,
  onFilterChange
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
            <SearchIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          
          <div>
            <Select
              value={filterType}
              onValueChange={onFilterChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryFilter; 