import React, { useState, useEffect } from "react";
import { Category, Transaction } from "../../utils/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  TagIcon,
  EditIcon,
  CategoryIcons,
} from "../Icons";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export interface TransactionFormData {
  description: string;
  amount: number | string;
  date: string;
  type: "INCOME" | "EXPENSE";
  categoryId: string;
  tags: string[];
}

interface ValidationErrors {
  [key: string]: string | null;
}

interface TransactionFormProps {
  transaction: Transaction | null;
  categories: Category[];
  errors: ValidationErrors;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent, formData: TransactionFormData) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  categories,
  errors,
  isLoading,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<TransactionFormData>({
    description: "",
    amount: 0,
    date: "",
    type: "EXPENSE",
    categoryId: "",
    tags: [],
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Initialize form data when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date.substring(0, 10), // Only get YYYY-MM-DD part
        type: transaction.type,
        categoryId: transaction.category.id,
        tags: transaction.tags.map((tag) => tag.name),
      });
      setSelectedDate(new Date(transaction.date));
    } else {
      const today = new Date();
      setFormData({
        description: "",
        amount: 0,
        date: today.toISOString().substring(0, 10), // Current date in YYYY-MM-DD format
        type: "EXPENSE",
        categoryId: categories.length > 0 ? categories[0].id : "",
        tags: [],
      });
      setSelectedDate(today);
    }
  }, [transaction, categories]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "amount") {
      // Convert all commas to dots for decimal separator and ensure amount is a valid number
      const normalizedValue = value.replace(/,/g, ".");
      const amount = parseFloat(normalizedValue);
      setFormData((prev) => ({ ...prev, [name]: isNaN(amount) ? 0 : amount }));
    } else if (name === "tags") {
      // Split comma-separated tags
      const tags = value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      setFormData((prev) => ({ ...prev, tags }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData((prev) => ({
        ...prev,
        date: format(date, "yyyy-MM-dd"),
      }));
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, formData);
  };

  // Trova la categoria selezionata
  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  // Importiamo le icone dai CategoryIcons
  const { DollarSign, ShoppingBag } = CategoryIcons;

  return (
    <>
      <DialogHeader className="pb-4">
        <DialogTitle className="flex items-center gap-2 text-xl">
          <EditIcon className="h-5 w-5" />
          {transaction ? "Modifica Transazione" : "Aggiungi Nuova Transazione"}
        </DialogTitle>
        <DialogDescription>
          {transaction
            ? "Aggiorna i dettagli della transazione."
            : "Aggiungi una nuova transazione al tuo account."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmitForm}>
        {/* Tipo di transazione con tab più visibili */}
        <div className="mb-6">
          <Label className="mb-2 block">Tipo di Transazione</Label>
          <Tabs
            value={formData.type}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                type: value as "INCOME" | "EXPENSE",
              }))
            }
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger
                value="EXPENSE"
                className={`data-[state=active]:bg-red-100 data-[state=active]:text-red-700 gap-2`}
              >
                <ArrowUpIcon className="h-4 w-4 text-red-600" />
                Uscita
              </TabsTrigger>
              <TabsTrigger
                value="INCOME"
                className={`data-[state=active]:bg-green-100 data-[state=active]:text-green-700 gap-2`}
              >
                <ArrowDownIcon className="h-4 w-4 text-green-600" />
                Entrata
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-5">
          {/* Informazioni principali */}
          <div className="bg-muted/40 p-4 rounded-lg">
            <div className="grid gap-4">
              {/* Descrizione */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="flex items-center gap-2"
                >
                  <EditIcon className="h-4 w-4" />
                  Descrizione
                </Label>
                <Input
                  id="description"
                  name="description"
                  required
                  className={cn(
                    "transition-all focus-visible:ring-2",
                    errors.description
                      ? "border-red-500 focus-visible:ring-red-400"
                      : ""
                  )}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Es. Spesa al supermercato"
                />
                {errors.description && (
                  <p className="text-sm text-red-600 font-medium">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Importo */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Importo
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    id="amount"
                    name="amount"
                    required
                    step="0.01"
                    min="0.01"
                    className={cn(
                      "pl-8 transition-all focus-visible:ring-2",
                      errors.amount
                        ? "border-red-500 focus-visible:ring-red-400"
                        : "",
                      formData.type === "INCOME" ? "bg-green-50" : "bg-red-50"
                    )}
                    value={formData.amount}
                    onChange={handleInputChange}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    €
                  </span>
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-600 font-medium">
                    {errors.amount}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Separatore */}
          <div className="h-px bg-border w-full my-4" />

          {/* Categoria e data */}
          <div className="grid grid-cols-2 gap-4">
            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="categoryId" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Categoria
              </Label>
              <Select
                name="categoryId"
                value={formData.categoryId}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, categoryId: value }));
                }}
              >
                <SelectTrigger
                  className={cn(
                    "transition-all focus-visible:ring-2",
                    errors.categoryId
                      ? "border-red-500 focus-visible:ring-red-400"
                      : ""
                  )}
                >
                  <SelectValue placeholder="Seleziona una categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center">
                          <div
                            className="h-3 w-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-600 font-medium">
                  {errors.categoryId}
                </p>
              )}
            </div>

            {/* Data con calendario popup */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Data
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left",
                      "transition-all focus-visible:ring-2",
                      errors.date
                        ? "border-red-500 focus-visible:ring-red-400"
                        : ""
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "dd MMMM yyyy")
                    ) : (
                      <span>Seleziona una data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-sm text-red-600 font-medium">
                  {errors.date}
                </p>
              )}
            </div>
          </div>

          {/* Separatore */}
          <div className="h-px bg-border w-full my-4" />

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="flex items-center gap-2">
              <TagIcon className="h-4 w-4" />
              Tags (separati da virgola)
            </Label>
            <Input
              id="tags"
              name="tags"
              placeholder="es. spesa, essenziali, mensile"
              className="transition-all focus-visible:ring-2"
              value={formData.tags ? formData.tags.join(", ") : ""}
              onChange={handleInputChange}
            />
            <p className="text-sm text-muted-foreground">
              I tag ti aiutano a categorizzare ulteriormente le tue transazioni
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            variant="default"
            className={cn(
              formData.type === "INCOME"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-primary hover:bg-primary/90"
            )}
          >
            {isLoading ? "Salvataggio..." : transaction ? "Aggiorna" : "Crea"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export default TransactionForm;
