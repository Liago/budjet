import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Note: Alert component not available, using custom styling
import { Loader2, Target, Euro, Calendar, Info } from "lucide-react";
import { toast } from "sonner";
import { savingsGoalsService } from "../../utils/apiServices";

interface SavingsGoalModalProps {
  open: boolean;
  onClose: () => void;
  suggestedAmount?: number;
  onSuccess?: () => void;
}

const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  open,
  onClose,
  suggestedAmount,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: suggestedAmount?.toString() || "",
    targetDate: "",
    description: "",
    category: "emergency",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.targetAmount || !formData.targetDate) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    if (isNaN(Number(formData.targetAmount))) {
      toast.error("Inserisci un importo valido");
      return;
    }

    try {
      setLoading(true);
      await savingsGoalsService.create({
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        targetDate: formData.targetDate,
        description: formData.description,
        category: formData.category,
      });
      
      toast.success(
        `Obiettivo di risparmio "${formData.name}" creato con successo`
      );
      
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error creating savings goal:", error);
      toast.error("Errore nella creazione dell'obiettivo");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      targetAmount: "",
      targetDate: "",
      description: "",
      category: "emergency",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Calculate minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Crea Obiettivo di Risparmio
          </DialogTitle>
          <DialogDescription>
            Imposta un obiettivo di risparmio per raggiungere i tuoi traguardi finanziari
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {suggestedAmount && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Importo suggerito: €{suggestedAmount.toFixed(2)} al mese
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="goal-name">Nome obiettivo</Label>
            <Input
              id="goal-name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Es. Fondo emergenza"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="target-amount">Importo obiettivo</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="target-amount"
                type="number"
                value={formData.targetAmount}
                onChange={(e) => handleInputChange("targetAmount", e.target.value)}
                className="pl-9"
                placeholder="0.00"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="target-date">Data obiettivo</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="target-date"
                type="date"
                value={formData.targetDate}
                onChange={(e) => handleInputChange("targetDate", e.target.value)}
                className="pl-9"
                min={minDateString}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona una categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emergency">Fondo Emergenza</SelectItem>
                <SelectItem value="vacation">Vacanze</SelectItem>
                <SelectItem value="house">Casa</SelectItem>
                <SelectItem value="car">Auto</SelectItem>
                <SelectItem value="education">Educazione</SelectItem>
                <SelectItem value="investment">Investimenti</SelectItem>
                <SelectItem value="other">Altro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione (opzionale)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Aggiungi una descrizione per il tuo obiettivo..."
              rows={2}
              disabled={loading}
            />
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
            disabled={loading || !formData.name || !formData.targetAmount || !formData.targetDate}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crea Obiettivo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SavingsGoalModal;