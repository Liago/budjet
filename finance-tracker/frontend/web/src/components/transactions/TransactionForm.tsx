import React, { useState, useEffect } from 'react';
import { Category, Transaction } from '../../utils/types';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogFooter, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  onCancel
}) => {
  const [formData, setFormData] = useState<TransactionFormData>({
    description: "",
    amount: 0,
    date: "",
    type: "EXPENSE",
    categoryId: "",
    tags: []
  });

  // Initialize form data when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date.substring(0, 10), // Only get YYYY-MM-DD part
        type: transaction.type,
        categoryId: transaction.category.id,
        tags: transaction.tags.map(tag => tag.name)
      });
    } else {
      setFormData({
        description: "",
        amount: 0,
        date: new Date().toISOString().substring(0, 10), // Current date in YYYY-MM-DD format
        type: "EXPENSE",
        categoryId: categories.length > 0 ? categories[0].id : "",
        tags: []
      });
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
      setFormData(prev => ({ ...prev, [name]: isNaN(amount) ? 0 : amount }));
    } else if (name === "tags") {
      // Split comma-separated tags
      const tags = value
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean);
      setFormData(prev => ({ ...prev, tags }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, formData);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {transaction ? "Edit Transaction" : "Add New Transaction"}
        </DialogTitle>
        <DialogDescription>
          {transaction
            ? "Update transaction details."
            : "Add a new transaction to your account."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmitForm}>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              required
              className={errors.description ? "border-red-500" : ""}
              value={formData.description}
              onChange={handleInputChange}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              type="number"
              id="amount"
              name="amount"
              required
              step="0.01"
              min="0.01"
              className={errors.amount ? "border-red-500" : ""}
              value={formData.amount}
              onChange={handleInputChange}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              type="date"
              id="date"
              name="date"
              required
              className={errors.date ? "border-red-500" : ""}
              value={formData.date}
              onChange={handleInputChange}
            />
            {errors.date && (
              <p className="text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Select
              name="type"
              value={formData.type}
              onValueChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  type: value as "INCOME" | "EXPENSE",
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select
              name="categoryId"
              value={formData.categoryId}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, categoryId: value }));
              }}
            >
              <SelectTrigger
                className={errors.categoryId ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
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
            {errors.categoryId && (
              <p className="text-sm text-red-600">{errors.categoryId}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="e.g. groceries, essentials, monthly"
              value={formData.tags ? formData.tags.join(", ") : ""}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : transaction
              ? "Update"
              : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export default TransactionForm; 