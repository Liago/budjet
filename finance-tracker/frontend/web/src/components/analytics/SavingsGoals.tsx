import { useState, useEffect } from "react";
import { useAppSelector } from "../../utils/hooks";
import {
  SavingsGoal,
  CreateSavingsGoalData,
  UpdateSavingsGoalData,
} from "../../utils/types";
import {
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Calendar,
  PiggyBank,
  Tag,
} from "lucide-react";
import { format, differenceInDays, parseISO, addDays } from "date-fns";
import { it } from "date-fns/locale";

// UI Components
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { DatePicker } from "../../components/ui/date-picker";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Mock service per gli obiettivi di risparmio (da sostituire in seguito con il servizio reale)
const mockSavingsGoals: SavingsGoal[] = [
  {
    id: "1",
    name: "Vacanza in Sardegna",
    targetAmount: 1500,
    currentAmount: 750,
    deadline: addDays(new Date(), 60).toISOString(),
    description: "Risparmi per la vacanza estiva in Sardegna",
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Nuovo laptop",
    targetAmount: 1200,
    currentAmount: 400,
    deadline: addDays(new Date(), 120).toISOString(),
    description: "Per sostituire il vecchio computer",
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Fondo emergenze",
    targetAmount: 5000,
    currentAmount: 3200,
    description: "Fondo per spese impreviste",
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
];

// Schema di validazione
const savingsGoalSchema = z.object({
  name: z.string().min(1, { message: "Il nome è obbligatorio" }),
  targetAmount: z.coerce
    .number()
    .positive({ message: "L'importo deve essere positivo" }),
  currentAmount: z.coerce
    .number()
    .min(0, { message: "L'importo deve essere almeno 0" })
    .optional(),
  deadline: z.date().optional(),
  description: z.string().optional(),
});

const SavingsGoals = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>(mockSavingsGoals);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const { categories } = useAppSelector((state) => state.categories);

  // Form per aggiungere un nuovo obiettivo
  const addForm = useForm<z.infer<typeof savingsGoalSchema>>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      description: "",
    },
  });

  // Form per modificare un obiettivo esistente
  const editForm = useForm<z.infer<typeof savingsGoalSchema>>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      description: "",
    },
  });

  useEffect(() => {
    if (selectedGoal) {
      editForm.reset({
        name: selectedGoal.name,
        targetAmount: selectedGoal.targetAmount,
        currentAmount: selectedGoal.currentAmount,
        deadline: selectedGoal.deadline
          ? parseISO(selectedGoal.deadline)
          : undefined,
        description: selectedGoal.description || "",
      });
    }
  }, [selectedGoal, editForm]);

  const handleAddGoal = (data: z.infer<typeof savingsGoalSchema>) => {
    const newGoal: SavingsGoal = {
      id: Date.now().toString(),
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount || 0,
      deadline: data.deadline?.toISOString(),
      description: data.description,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    setGoals([...goals, newGoal]);
    setIsAddDialogOpen(false);
    addForm.reset();
    toast.success("Obiettivo di risparmio creato con successo!");
  };

  const handleEditGoal = (data: z.infer<typeof savingsGoalSchema>) => {
    if (!selectedGoal) return;

    const updatedGoals = goals.map((goal) => {
      if (goal.id === selectedGoal.id) {
        return {
          ...goal,
          name: data.name,
          targetAmount: data.targetAmount,
          currentAmount: data.currentAmount || 0,
          deadline: data.deadline?.toISOString(),
          description: data.description,
          updatedAt: new Date().toISOString(),
        };
      }
      return goal;
    });

    setGoals(updatedGoals);
    setIsEditDialogOpen(false);
    setSelectedGoal(null);
    toast.success("Obiettivo di risparmio aggiornato con successo!");
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo obiettivo?")) {
      setGoals(goals.filter((goal) => goal.id !== id));
      toast.success("Obiettivo di risparmio eliminato con successo!");
    }
  };

  const handleAddMoney = (goal: SavingsGoal) => {
    const amount = prompt("Quanto vuoi aggiungere ai risparmi? (€)");
    if (!amount) return;

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      toast.error("Inserisci un importo valido");
      return;
    }

    const updatedGoals = goals.map((g) => {
      if (g.id === goal.id) {
        const newAmount = g.currentAmount + amountNumber;
        const isCompleted = newAmount >= g.targetAmount;

        return {
          ...g,
          currentAmount: newAmount,
          isCompleted,
          updatedAt: new Date().toISOString(),
        };
      }
      return g;
    });

    setGoals(updatedGoals);
    toast.success(`€${amountNumber.toFixed(2)} aggiunti al tuo obiettivo!`);
  };

  const getProgressPercentage = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100);
  };

  const getRemainingDays = (deadline?: string) => {
    if (!deadline) return null;
    const days = differenceInDays(parseISO(deadline), new Date());
    return days >= 0 ? days : 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">I tuoi obiettivi di risparmio</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuovo obiettivo
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="p-8 text-center">
          <PiggyBank className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">
            Nessun obiettivo di risparmio
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Crea il tuo primo obiettivo di risparmio per iniziare a monitorare i
            tuoi progressi.
          </p>
          <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Crea obiettivo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <Card
              key={goal.id}
              className={goal.isCompleted ? "border-green-500" : ""}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center">
                      {goal.name}
                      {goal.isCompleted && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Sparkles className="mr-1 h-3 w-3" /> Completato
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">{goal.description}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedGoal(goal);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progresso</span>
                      <span>
                        {formatCurrency(goal.currentAmount)} /{" "}
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <Progress
                      value={getProgressPercentage(
                        goal.currentAmount,
                        goal.targetAmount
                      )}
                      className={goal.isCompleted ? "bg-green-100" : ""}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>
                        {getProgressPercentage(
                          goal.currentAmount,
                          goal.targetAmount
                        ).toFixed(0)}
                        %
                      </span>
                      <span>
                        Mancano:{" "}
                        {formatCurrency(goal.targetAmount - goal.currentAmount)}
                      </span>
                    </div>
                  </div>

                  {goal.deadline && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        Scadenza:{" "}
                        {format(parseISO(goal.deadline), "d MMMM yyyy", {
                          locale: it,
                        })}
                        {getRemainingDays(goal.deadline) !== null && (
                          <span className="ml-1">
                            ({getRemainingDays(goal.deadline)} giorni rimanenti)
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAddMoney(goal)}
                    disabled={goal.isCompleted}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Aggiungi risparmi
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog per aggiungere un nuovo obiettivo */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crea un nuovo obiettivo di risparmio</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli per il tuo nuovo obiettivo di risparmio.
            </DialogDescription>
          </DialogHeader>

          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(handleAddGoal)}
              className="space-y-4"
            >
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome dell'obiettivo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Es. Vacanza, Nuovo telefono..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importo obiettivo (€)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importo attuale (€)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormDescription>
                      Quanto hai già risparmiato per questo obiettivo?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data obiettivo</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        placeholder="Seleziona una data..."
                      />
                    </FormControl>
                    <FormDescription>
                      Entro quando vuoi raggiungere l'obiettivo?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrizione</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Descrivi il tuo obiettivo..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Annulla
                </Button>
                <Button type="submit">Crea obiettivo</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog per modificare un obiettivo esistente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica obiettivo di risparmio</DialogTitle>
            <DialogDescription>
              Modifica i dettagli del tuo obiettivo di risparmio.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditGoal)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome dell'obiettivo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Es. Vacanza, Nuovo telefono..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importo obiettivo (€)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importo attuale (€)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data obiettivo</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        placeholder="Seleziona una data..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrizione</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Descrivi il tuo obiettivo..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Annulla
                </Button>
                <Button type="submit">Salva modifiche</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavingsGoals;
