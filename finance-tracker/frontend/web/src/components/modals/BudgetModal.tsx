import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Note: Alert component not available, using custom styling
import { Loader2, Euro, Info } from "lucide-react";
import { toast } from "sonner";
import { categoryService } from "../../utils/apiServices";

interface BudgetModalProps {
  open: boolean;
  onClose: () => void;
  categoryName: string;
  suggestedAmount?: number;
  potentialSaving?: number; // Amount to reduce from current budget
  onSuccess?: () => void;
}

const BudgetModal: React.FC<BudgetModalProps> = ({
  open,
  onClose,
  categoryName,
  suggestedAmount,
  potentialSaving,
  onSuccess,
}) => {
  const [budgetAmount, setBudgetAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const findCategoryByName = async () => {
      try {
        setLoading(true);
        const categories = await categoryService.getAll();
        const category = categories.find(
          (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
        );
        if (category) {
          setCategoryId(category.id);
          // Calculate suggested budget based on current budget and potential saving
          if (category.budget && potentialSaving) {
            const suggestedBudget = Math.max(0, category.budget - potentialSaving);
            setBudgetAmount(suggestedBudget.toString());
          } else if (category.budget) {
            setBudgetAmount(category.budget.toString());
          } else if (suggestedAmount) {
            setBudgetAmount(suggestedAmount.toString());
          }
        }
      } catch (error) {
        console.error("Error finding category:", error);
        toast.error("Errore nel caricamento della categoria");
      } finally {
        setLoading(false);
      }
    };

    if (open && categoryName) {
      // Find the category ID by name
      findCategoryByName();
    } else if (!open) {
      // Reset state when modal closes
      setBudgetAmount("");
      setCategoryId(null);
      setLoading(false);
    }
  }, [open, categoryName, suggestedAmount, potentialSaving]);

  const handleSave = async () => {
    if (!categoryId || !budgetAmount || isNaN(Number(budgetAmount))) {
      toast.error("Inserisci un importo valido");
      return;
    }

    try {
      setLoading(true);
      await categoryService.update(categoryId, {
        budget: Number(budgetAmount),
      });
      
      toast.success(
        `Budget di €${budgetAmount} impostato per ${categoryName}`
      );
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error("Errore nell'aggiornamento del budget");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBudgetAmount("");
    setCategoryId(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Imposta Budget per {categoryName}
          </DialogTitle>
          <DialogDescription>
            Imposta il limite di spesa mensile per questa categoria
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {potentialSaving && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Risparmio potenziale: €{potentialSaving.toFixed(2)} al mese
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="budget-amount">Budget mensile</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="budget-amount"
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                className="pl-9"
                placeholder="0.00"
                disabled={loading}
              />
            </div>
          </div>
          
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Annulla
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !budgetAmount}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Imposta Budget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetModal;