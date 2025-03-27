import React from "react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Category, RecurrentPayment } from "../../utils/types";
import {
  CalendarIcon,
  CategoryIcons,
  EditIcon,
  ChartLineIcon,
  PlusIcon,
} from "../Icons";
import {
  Clock,
  CalendarRange,
  RotateCcw,
  Repeat,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

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
  selectedStartDate: Date | undefined;
  selectedEndDate: Date | undefined;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onSelectChange: (name: string, value: string) => void;
  onCheckboxChange: (checked: boolean) => void;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const RecurrentPaymentForm: React.FC<RecurrentPaymentFormProps> = ({
  payment,
  categories,
  formData,
  errors,
  isLoading,
  selectedStartDate,
  selectedEndDate,
  onInputChange,
  onSelectChange,
  onCheckboxChange,
  onStartDateChange,
  onEndDateChange,
  onSubmit,
  onCancel,
}) => {
  const { DollarSign, ShoppingBag } = CategoryIcons;

  // Trova la categoria selezionata
  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  // Icona e nome intervallo per la visualizzazione
  const getIntervalInfo = (interval: string) => {
    switch (interval) {
      case "daily":
        return {
          icon: <RotateCcw className="h-4 w-4 text-blue-500" />,
          name: "Giornaliero",
        };
      case "weekly":
        return {
          icon: <Repeat className="h-4 w-4 text-indigo-500" />,
          name: "Settimanale",
        };
      case "monthly":
        return {
          icon: <CalendarIcon className="h-4 w-4 text-purple-500" />,
          name: "Mensile",
        };
      case "yearly":
        return {
          icon: <CalendarRange className="h-4 w-4 text-green-500" />,
          name: "Annuale",
        };
      default:
        return { icon: <Clock className="h-4 w-4" />, name: "Sconosciuto" };
    }
  };

  const intervalInfo = getIntervalInfo(formData.interval);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
              <div className="bg-primary/10 p-2 rounded-full">
                <Repeat className="h-5 w-5 text-primary" />
              </div>
              {payment ? "Modifica Pagamento" : "Nuovo Pagamento Ricorrente"}
            </DialogTitle>
            {formData.isActive ? (
              <Badge className="bg-green-500 hover:bg-green-600">Attivo</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Inattivo
              </Badge>
            )}
          </div>
          <DialogDescription>
            Compila i campi sottostanti per{" "}
            {payment ? "modificare il" : "creare un nuovo"} pagamento
            ricorrente.
          </DialogDescription>
        </DialogHeader>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 pt-4 max-h-[70vh] overflow-y-auto"
      >
        <div className="space-y-6">
          {/* Informazioni principali */}
          <div className="bg-muted/40 p-4 rounded-lg space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
              <ChartLineIcon className="h-4 w-4" />
              Informazioni principali
            </h3>

            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <EditIcon className="h-4 w-4" />
                Nome
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                className={cn(
                  "transition-all focus-visible:ring-2",
                  errors.name ? "border-red-500 focus-visible:ring-red-400" : ""
                )}
                placeholder="Es. Abbonamento Netflix"
              />
              {errors.name && (
                <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

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
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={onInputChange}
                  className={cn(
                    "pl-8 transition-all focus-visible:ring-2",
                    errors.amount
                      ? "border-red-500 focus-visible:ring-red-400"
                      : ""
                  )}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  €
                </span>
              </div>
              {errors.amount && (
                <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.amount}
                </p>
              )}
            </div>
          </div>

          {/* Categoria e Descrizione */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Categoria
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => onSelectChange("categoryId", value)}
              >
                <SelectTrigger
                  id="categoryId"
                  className={cn(
                    "transition-all focus-visible:ring-2",
                    errors.categoryId
                      ? "border-red-500 focus-visible:ring-red-400"
                      : "",
                    selectedCategory ? "border-l-4" : "",
                    selectedCategory
                      ? `border-l-[${selectedCategory.color}]`
                      : ""
                  )}
                  style={
                    selectedCategory
                      ? {
                          borderLeftColor: selectedCategory.color,
                        }
                      : {}
                  }
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
                <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.categoryId}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <EditIcon className="h-4 w-4" />
                Descrizione (opzionale)
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={onInputChange}
                rows={2}
                placeholder="Aggiungi una descrizione dettagliata..."
                className="resize-none transition-all focus-visible:ring-2"
              />
            </div>
          </div>

          {/* Configurazione temporale */}
          <div className="bg-muted/40 p-4 rounded-lg space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4" />
              Configurazione temporale
            </h3>

            <div className="space-y-2">
              <Label htmlFor="interval" className="flex items-center gap-2">
                {intervalInfo.icon}
                Intervallo
              </Label>
              <Select
                value={formData.interval}
                onValueChange={(value) => onSelectChange("interval", value)}
              >
                <SelectTrigger
                  id="interval"
                  className="transition-all focus-visible:ring-2"
                >
                  <SelectValue placeholder="Seleziona un intervallo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily" className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-blue-500" />
                      Giornaliero
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="weekly"
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4 text-indigo-500" />
                      Settimanale
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="monthly"
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-purple-500" />
                      Mensile
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="yearly"
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarRange className="h-4 w-4 text-green-500" />
                      Annuale
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.interval === "monthly" && (
              <div className="space-y-2">
                <Label htmlFor="dayOfMonth" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Giorno del mese
                </Label>
                <Select
                  value={String(formData.dayOfMonth || 1)}
                  onValueChange={(value) => onSelectChange("dayOfMonth", value)}
                >
                  <SelectTrigger
                    id="dayOfMonth"
                    className="transition-all focus-visible:ring-2"
                  >
                    <SelectValue placeholder="Seleziona il giorno" />
                  </SelectTrigger>
                  <SelectContent className="h-60 overflow-y-auto">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={String(day)}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.interval === "weekly" && (
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Giorno della settimana
                </Label>
                <Select
                  value={String(formData.dayOfWeek || 1)}
                  onValueChange={(value) => onSelectChange("dayOfWeek", value)}
                >
                  <SelectTrigger
                    id="dayOfWeek"
                    className="transition-all focus-visible:ring-2"
                  >
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4" />
                  Data di inizio
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left",
                        "transition-all focus-visible:ring-2",
                        errors.startDate
                          ? "border-red-500 focus-visible:ring-red-400"
                          : ""
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedStartDate ? (
                        format(selectedStartDate, "dd MMMM yyyy")
                      ) : (
                        <span>Seleziona una data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedStartDate}
                      onSelect={onStartDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.startDate && (
                  <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4" />
                  Data di fine (opzionale)
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left transition-all focus-visible:ring-2"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedEndDate ? (
                        format(selectedEndDate, "dd MMMM yyyy")
                      ) : (
                        <span>Seleziona una data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedEndDate}
                      onSelect={onEndDateChange}
                      initialFocus
                      fromDate={selectedStartDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Stato */}
          <div className="flex items-center space-x-2 pt-2">
            <div className="flex items-center space-x-2 relative group">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={onCheckboxChange}
                className={
                  formData.isActive
                    ? "bg-green-500 text-white border-green-500"
                    : ""
                }
              />
              <Label
                htmlFor="isActive"
                className="cursor-pointer text-sm font-medium flex items-center gap-1"
              >
                Pagamento attivo
                <span className="text-muted-foreground hidden group-hover:inline-flex ml-1.5">
                  <HelpCircle className="h-3.5 w-3.5" />
                </span>
              </Label>
              <div className="absolute bottom-full mb-2 bg-black text-xs text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-48 left-0">
                {formData.isActive
                  ? "Il pagamento verrà calendarizzato e notificato"
                  : "Il pagamento non genererà notifiche"}
              </div>
            </div>
          </div>
        </div>
      </form>

      <DialogFooter className="px-6 py-4 border-t bg-muted/30">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annulla
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 gap-2"
          onClick={handleSubmit}
        >
          {payment ? (
            <>
              <EditIcon className="h-4 w-4" />
              {isLoading ? "Aggiornamento..." : "Aggiorna"}
            </>
          ) : (
            <>
              <PlusIcon className="h-4 w-4" />
              {isLoading ? "Creazione..." : "Crea"}
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default React.memo(RecurrentPaymentForm);
