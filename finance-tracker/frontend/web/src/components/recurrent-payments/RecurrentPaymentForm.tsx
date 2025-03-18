import React from 'react';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Category, RecurrentPayment } from '../../utils/types';

export interface RecurrentPaymentFormData {
  name: string;
  amount: number | string;
  categoryId: string;
  description: string;
  interval: "daily" | "weekly" | "monthly" | "yearly";
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

interface ValidationErrors {
  [key: string]: string | null;
}

interface RecurrentPaymentFormProps {
  payment: RecurrentPayment | null;
  categories: Category[];
  formData: RecurrentPaymentFormData;
  errors: ValidationErrors;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onCheckboxChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const RecurrentPaymentForm: React.FC<RecurrentPaymentFormProps> = ({
  payment,
  categories,
  formData,
  errors,
  isLoading,
  onInputChange,
  onSelectChange,
  onCheckboxChange,
  onSubmit,
  onCancel
}) => {
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>
          {payment ? "Modifica Pagamento" : "Nuovo Pagamento Ricorrente"}
        </DialogTitle>
        <DialogDescription>
          Compila i campi sottostanti per {payment ? "modificare il" : "creare un nuovo"} pagamento ricorrente.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              className={errors.name ? "border-red-300" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Importo</Label>
            <Input
              type="number"
              id="amount"
              name="amount"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={onInputChange}
              className={errors.amount ? "border-red-300" : ""}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Categoria</Label>
            <Select 
              value={formData.categoryId} 
              onValueChange={(value) => onSelectChange("categoryId", value)}
            >
              <SelectTrigger id="categoryId" className={errors.categoryId ? "border-red-300" : ""}>
                <SelectValue placeholder="Seleziona una categoria" />
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

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione (opzionale)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={onInputChange}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Intervallo</Label>
            <Select 
              value={formData.interval} 
              onValueChange={(value) => onSelectChange("interval", value)}
            >
              <SelectTrigger id="interval">
                <SelectValue placeholder="Seleziona un intervallo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Giornaliero</SelectItem>
                <SelectItem value="weekly">Settimanale</SelectItem>
                <SelectItem value="monthly">Mensile</SelectItem>
                <SelectItem value="yearly">Annuale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.interval === "monthly" && (
            <div className="space-y-2">
              <Label htmlFor="dayOfMonth">Giorno del mese</Label>
              <Select 
                value={String(formData.dayOfMonth || 1)} 
                onValueChange={(value) => onSelectChange("dayOfMonth", value)}
              >
                <SelectTrigger id="dayOfMonth">
                  <SelectValue placeholder="Seleziona il giorno" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(
                    (day) => (
                      <SelectItem key={day} value={String(day)}>
                        {day}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.interval === "weekly" && (
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Giorno della settimana</Label>
              <Select 
                value={String(formData.dayOfWeek || 1)} 
                onValueChange={(value) => onSelectChange("dayOfWeek", value)}
              >
                <SelectTrigger id="dayOfWeek">
                  <SelectValue placeholder="Seleziona il giorno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Lunedì</SelectItem>
                  <SelectItem value="2">Martedì</SelectItem>
                  <SelectItem value="3">Mercoledì</SelectItem>
                  <SelectItem value="4">Giovedì</SelectItem>
                  <SelectItem value="5">Venerdì</SelectItem>
                  <SelectItem value="6">Sabato</SelectItem>
                  <SelectItem value="0">Domenica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="startDate">Data di inizio</Label>
            <Input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={onInputChange}
              className={errors.startDate ? "border-red-300" : ""}
            />
            {errors.startDate && (
              <p className="text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Data di fine (opzionale)</Label>
            <Input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate || ""}
              onChange={onInputChange}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={onCheckboxChange}
            />
            <Label htmlFor="isActive" className="cursor-pointer">Attivo</Label>
          </div>
        </div>

        <DialogFooter className="mt-6 gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Annulla
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading
              ? "Salvataggio..."
              : payment
              ? "Aggiorna"
              : "Crea"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default RecurrentPaymentForm; 