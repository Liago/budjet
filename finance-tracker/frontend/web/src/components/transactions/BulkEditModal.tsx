import React, { useState, useEffect } from "react";
import { Transaction, Category } from "../../utils/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "../Icons";
import { Input } from "@/components/ui/input";

interface BulkEditModalProps {
  open: boolean;
  onClose: () => void;
  selectedTransactions: Transaction[];
  categories: Category[];
  onBulkUpdate: (updates: BulkUpdateData) => Promise<void>;
}

interface BulkUpdateData {
  categoryId?: string;
  date?: string;
  type?: "INCOME" | "EXPENSE";
  description?: string;
  // Campi da aggiornare (vero = aggiorna, falso = ignora)
  updateCategory: boolean;
  updateDate: boolean;
  updateType: boolean;
  updateDescription: boolean;
}

const BulkEditModal: React.FC<BulkEditModalProps> = ({
  open,
  onClose,
  selectedTransactions,
  categories,
  onBulkUpdate,
}) => {
  const [bulkData, setBulkData] = useState<BulkUpdateData>({
    updateCategory: false,
    updateDate: false,
    updateType: false,
    updateDescription: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State per le selezioni
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<"INCOME" | "EXPENSE">(
    "EXPENSE"
  );
  const [description, setDescription] = useState<string>("");

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const updates: BulkUpdateData = {
      updateCategory: bulkData.updateCategory,
      updateDate: bulkData.updateDate,
      updateType: bulkData.updateType,
      updateDescription: bulkData.updateDescription,
    };

    if (bulkData.updateCategory) {
      updates.categoryId = selectedCategory;
    }

    if (bulkData.updateDate && selectedDate) {
      updates.date = format(selectedDate, "yyyy-MM-dd");
    }

    if (bulkData.updateType) {
      updates.type = selectedType;
    }

    if (bulkData.updateDescription) {
      updates.description = description;
    }

    try {
      await onBulkUpdate(updates);
      onClose();
    } catch (error) {
      console.error("Error updating transactions:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifica in blocco</DialogTitle>
          <DialogDescription>
            {selectedTransactions.length === 1
              ? "Modificare 1 transazione"
              : `Modificare ${selectedTransactions.length} transazioni`}
          </DialogDescription>
        </DialogHeader>

        {/* Specchietto riepilogativo dei campi modificabili */}
        <div className="border rounded-md p-3 bg-muted/30 mb-4">
          <h3 className="text-sm font-medium mb-2">
            Campi disponibili per la modifica massiva:
          </h3>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-3 border-b py-2">
              <div className="font-medium">Campo</div>
              <div className="col-span-2">Descrizione</div>
            </div>

            <div className="grid grid-cols-3 py-1">
              <div className="font-medium">Descrizione</div>
              <div className="col-span-2">
                Imposta la stessa descrizione per tutte le transazioni
                selezionate
              </div>
            </div>

            <div className="grid grid-cols-3 py-1">
              <div className="font-medium">Categoria</div>
              <div className="col-span-2">
                Assegna la stessa categoria a tutte le transazioni selezionate
              </div>
            </div>

            <div className="grid grid-cols-3 py-1">
              <div className="font-medium">Data</div>
              <div className="col-span-2">
                Imposta la stessa data per tutte le transazioni selezionate
              </div>
            </div>

            <div className="grid grid-cols-3 py-1">
              <div className="font-medium">Tipo</div>
              <div className="col-span-2">
                Cambia il tipo (Entrata/Uscita) per tutte le transazioni
                selezionate
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Nota: l'importo non è modificabile in blocco
          </p>
        </div>

        <div className="grid gap-4 py-4">
          {/* Descrizione */}
          <div className="flex items-start space-x-4">
            <div className="flex items-center h-5">
              <Checkbox
                id="update-description"
                checked={bulkData.updateDescription}
                onCheckedChange={(checked) =>
                  setBulkData({
                    ...bulkData,
                    updateDescription: checked === true,
                  })
                }
              />
            </div>
            <div className="grid gap-1.5 w-full">
              <Label htmlFor="update-description">Aggiorna descrizione</Label>
              <Input
                id="description"
                disabled={!bulkData.updateDescription}
                placeholder="Inserisci descrizione comune"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Categoria */}
          <div className="flex items-start space-x-4">
            <div className="flex items-center h-5">
              <Checkbox
                id="update-category"
                checked={bulkData.updateCategory}
                onCheckedChange={(checked) =>
                  setBulkData({ ...bulkData, updateCategory: checked === true })
                }
              />
            </div>
            <div className="grid gap-1.5 w-full">
              <Label htmlFor="update-category">Aggiorna categoria</Label>
              <Select
                disabled={!bulkData.updateCategory}
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona una categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
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
            </div>
          </div>

          {/* Data */}
          <div className="flex items-start space-x-4">
            <div className="flex items-center h-5">
              <Checkbox
                id="update-date"
                checked={bulkData.updateDate}
                onCheckedChange={(checked) =>
                  setBulkData({ ...bulkData, updateDate: checked === true })
                }
              />
            </div>
            <div className="grid gap-1.5 w-full">
              <Label htmlFor="update-date">Aggiorna data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left ${
                      !bulkData.updateDate ? "opacity-50" : ""
                    }`}
                    disabled={!bulkData.updateDate}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP")
                    ) : (
                      <span>Seleziona una data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tipo (Entrata o Uscita) */}
          <div className="flex items-start space-x-4">
            <div className="flex items-center h-5">
              <Checkbox
                id="update-type"
                checked={bulkData.updateType}
                onCheckedChange={(checked) =>
                  setBulkData({ ...bulkData, updateType: checked === true })
                }
              />
            </div>
            <div className="grid gap-1.5 w-full">
              <Label htmlFor="update-type">Aggiorna tipo</Label>
              <Select
                disabled={!bulkData.updateType}
                value={selectedType}
                onValueChange={(value: "INCOME" | "EXPENSE") =>
                  setSelectedType(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Entrata</SelectItem>
                  <SelectItem value="EXPENSE">Uscita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annulla
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Salvataggio..." : "Salva modifiche"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkEditModal;
