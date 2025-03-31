import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon } from "../../components/Icons";

interface RecurrentPaymentFilterProps {
  searchTerm: string;
  filterActive: "all" | "active" | "inactive";
  onSearchChange: (value: string) => void;
  onFilterActiveChange: (value: "all" | "active" | "inactive") => void;
}

const RecurrentPaymentFilter: React.FC<RecurrentPaymentFilterProps> = ({
  searchTerm,
  filterActive,
  onSearchChange,
  onFilterActiveChange,
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search" className="mb-1">
              Cerca
            </Label>
            <div className="relative">
              <Input
                id="search"
                placeholder="Cerca pagamenti ricorrenti..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="sm:w-[200px]">
            <Label htmlFor="status" className="mb-1">
              Stato
            </Label>
            <Select
              value={filterActive}
              onValueChange={(value) =>
                onFilterActiveChange(value as "all" | "active" | "inactive")
              }
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Seleziona uno stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="active">Attivi</SelectItem>
                <SelectItem value="inactive">Inattivi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecurrentPaymentFilter;
