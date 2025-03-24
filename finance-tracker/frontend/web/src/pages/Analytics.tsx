import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../utils/hooks";
import { fetchTransactions } from "../store/slices/transactionSlice";
import { fetchCategories } from "../store/slices/categorySlice";
import SavingsGoals from "../components/analytics/SavingsGoals";
import TrendAnalyzer from "../components/analytics/TrendAnalyzer";
import PredictiveAnalysis from "../components/analytics/PredictiveAnalysis";
import BudgetVsSpendingAnalysis from "../components/analysis/BudgetVsSpendingAnalysis";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { format, subMonths } from "date-fns";
import { toast } from "sonner";

const Analytics = () => {
  const [activeTab, setActiveTab] = useState("trends");
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const transactions = useAppSelector((state) => state.transactions);

  // Funzione di utilità per formattare la valuta
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    // Calcola un periodo di un anno per le analisi
    const endDate = new Date();
    const startDate = subMonths(endDate, 12); // Ultimi 12 mesi

    // Formatta le date per l'API
    const startDateFormatted = format(startDate, "yyyy-MM-dd");
    const endDateFormatted = format(endDate, "yyyy-MM-dd");

    // Carica transazioni con un limite alto per analisi complete
    const filters = {
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      limit: 1000, // Limite alto per avere più dati possibili per le analisi
    };

    // Carica transazioni e categorie
    dispatch(fetchTransactions(filters));
    dispatch(fetchCategories());

    // Mostra messaggio se ci sono errori nel caricamento
    if (transactions.error) {
      toast.error("Errore nel caricamento dei dati: " + transactions.error);
    }
  }, [dispatch, user?.id]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-gray-900">
          Analisi Finanziaria
        </h1>
        <p className="text-gray-500">
          Analizza i tuoi risparmi e monitora i tuoi obiettivi finanziari
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="budget">Budget vs Spesa</TabsTrigger>
          <TabsTrigger value="savings">Risparmio e Obiettivi</TabsTrigger>
          <TabsTrigger value="trends">Trend Analyzer</TabsTrigger>
          <TabsTrigger value="prediction">Analisi Predittiva</TabsTrigger>
        </TabsList>

        <TabsContent value="budget" className="space-y-4">
          <BudgetVsSpendingAnalysis
            userId={user?.id || ""}
            formatCurrency={formatCurrency}
            timeRange="3m"
          />
        </TabsContent>

        <TabsContent value="savings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>I Tuoi Obiettivi di Risparmio</CardTitle>
              <CardDescription>
                Monitora il progresso verso i tuoi obiettivi finanziari
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SavingsGoals />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analyzer</CardTitle>
              <CardDescription>
                Analizza le tendenze delle tue finanze nel tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <p className="text-gray-500">Caricamento dati in corso...</p>
                </div>
              ) : transactions.transactions.length === 0 ? (
                <div className="flex justify-center items-center p-8">
                  <p className="text-gray-500">
                    Nessuna transazione disponibile per l'analisi
                  </p>
                </div>
              ) : (
                <TrendAnalyzer />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prediction">
          <Card>
            <CardHeader>
              <CardTitle>Analisi Predittiva</CardTitle>
              <CardDescription>
                Previsioni sulle tue finanze future
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <p className="text-gray-500">Caricamento dati in corso...</p>
                </div>
              ) : transactions.transactions.length === 0 ? (
                <div className="flex justify-center items-center p-8">
                  <p className="text-gray-500">
                    Nessuna transazione disponibile per l'analisi
                  </p>
                </div>
              ) : (
                <PredictiveAnalysis />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
