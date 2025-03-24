import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../utils/hooks";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  addMonths,
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  isWithinInterval,
  isSameMonth,
  parseISO,
} from "date-fns";
import { it } from "date-fns/locale";
import { ArrowUpRight, ArrowDownRight, AlertCircle } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Transaction } from "../../utils/types";
import { dashboardService } from "../../utils/apiServices";
import { fetchDashboardStats } from "../../store/slices/dashboardSlice";

// Tipi per i dati processati
interface TimeRangeOption {
  value: string;
  label: string;
  months: number;
}

interface ChartData {
  name: string;
  income: number;
  expense: number;
  balance: number;
}

interface CategoryTrend {
  id: string;
  name: string;
  color: string;
  currentAmount: number;
  previousAmount: number;
  change: number;
  percentChange: number;
  transactionCount?: number;
}

interface SpendingAnomaly {
  category: string;
  color: string;
  month: string;
  amount: number;
  averageAmount: number;
  percentDeviation: number;
}

// Interfaccia per i dati di trend dal backend
interface TrendData {
  period: string;
  income: number;
  expense: number;
  balance: number;
}

interface TrendResponse {
  trends: TrendData[];
  categoryTrends?: CategoryTrend[];
  spendingAnomalies?: SpendingAnomaly[];
}

const TrendAnalyzer = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("spending");
  const [timeRange, setTimeRange] = useState("3m"); // Default a 3 mesi per allinearsi alla dashboard
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [categoryTrends, setCategoryTrends] = useState<CategoryTrend[]>([]);
  const [anomalies, setAnomalies] = useState<SpendingAnomaly[]>([]);
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ottieni le transazioni dal Redux store per il calcolo di tendenze e anomalie
  const transactions = useAppSelector(
    (state) => state.transactions.transactions
  );

  // Opzioni per la selezione del periodo temporale
  const timeRangeOptions: TimeRangeOption[] = [
    { value: "3m", label: "Ultimi 3 mesi", months: 3 },
    { value: "6m", label: "Ultimi 6 mesi", months: 6 },
    { value: "12m", label: "Ultimo anno", months: 12 },
  ];

  // Effetto per caricare i dati dal nuovo endpoint quando cambia il timeRange
  useEffect(() => {
    loadTrendData();
  }, [timeRange]);

  // Effetto per aggiornare le transazioni per il calcolo delle tendenze delle categorie e anomalie
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      // Filtra le transazioni per rimuovere potenziali duplicati
      const uniqueTransactions = filterValidTransactions(transactions);
      setRawTransactions(uniqueTransactions);
    }
  }, [transactions]);

  // Effetto per preparare i dati di tendenze categorie e anomalie quando cambiano le transazioni
  useEffect(() => {
    if (rawTransactions.length > 0) {
      prepareCategoryTrends();
      findAnomalies();
    }
  }, [rawTransactions, timeRange]);

  // Funzione per caricare i dati dal nuovo endpoint
  const loadTrendData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Chiama direttamente il servizio API con il periodo selezionato
      const response = await dashboardService.getTrendData(timeRange);
      const data = response as TrendResponse;

      // Prepara i dati per il grafico
      const formattedData = data.trends.map((trend) => ({
        name: trend.period,
        income: trend.income,
        expense: trend.expense,
        balance: trend.balance,
      }));

      setChartData(formattedData);

      // Aggiorna i dati delle tendenze delle categorie
      if (data.categoryTrends) {
        setCategoryTrends(data.categoryTrends);
      }

      // Aggiorna le anomalie
      if (data.spendingAnomalies) {
        setAnomalies(data.spendingAnomalies);
      }
    } catch (err) {
      console.error("Errore nel caricamento dei dati di trend:", err);
      setError("Impossibile caricare i dati di trend");

      // Se l'API fallisce, usiamo i dati locali come fallback
      if (rawTransactions.length > 0) {
        prepareCategoryTrends();
        findAnomalies();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione per filtrare transazioni valide e rimuovere duplicati
  const filterValidTransactions = (txs: Transaction[]): Transaction[] => {
    // Crea un Map per tenere traccia delle transazioni per ID
    const transactionMap = new Map<string, Transaction>();

    txs.forEach((tx) => {
      // Se una transazione ha lo stesso ID, prendiamo solo la prima occorrenza
      if (!transactionMap.has(tx.id)) {
        transactionMap.set(tx.id, tx);
      }
    });

    return Array.from(transactionMap.values());
  };

  // Funzione per normalizzare il valore di amount
  const normalizeAmount = (rawAmount: any): number => {
    // Se il valore è già un numero
    if (typeof rawAmount === "number") {
      return rawAmount;
    }

    // Se è una stringa, prima convertirla in un formato numerico
    try {
      // Rimuovi caratteri non numerici eccetto punto e virgola
      const cleanAmount = String(rawAmount).replace(/[^\d.,]/g, "");
      // Converti alla notazione con punto decimale
      const normalizedString = cleanAmount.replace(/\./g, "").replace(",", ".");
      // Converti in numero
      return parseFloat(normalizedString);
    } catch (e) {
      return 0;
    }
  };

  // Prepara i dati per le tendenze delle categorie
  const prepareCategoryTrends = () => {
    const selectedRange = timeRangeOptions.find(
      (option) => option.value === timeRange
    );
    if (!selectedRange || !rawTransactions.length) return;

    const months = selectedRange.months;
    const now = new Date();
    const currentPeriodStart = subMonths(now, Math.floor(months / 2));
    const previousPeriodStart = subMonths(
      currentPeriodStart,
      Math.floor(months / 2)
    );

    // Raggruppa le transazioni per periodo (corrente e precedente)
    const currentPeriodTransactions = rawTransactions.filter(
      (transaction: Transaction) => {
        const date = parseISO(transaction.date);
        return date >= currentPeriodStart && date <= now;
      }
    );

    const previousPeriodTransactions = rawTransactions.filter(
      (transaction: Transaction) => {
        const date = parseISO(transaction.date);
        return date >= previousPeriodStart && date < currentPeriodStart;
      }
    );

    // Calcola totali per categoria nel periodo corrente
    const currentCategoryTotals = new Map<
      string,
      { name: string; color: string; amount: number }
    >();

    currentPeriodTransactions
      .filter((transaction: Transaction) => transaction.type === "EXPENSE")
      .forEach((transaction: Transaction) => {
        const categoryId = transaction.category.id;
        const current = currentCategoryTotals.get(categoryId) || {
          name: transaction.category.name,
          color: transaction.category.color,
          amount: 0,
        };

        const amount = normalizeAmount(transaction.amount);
        if (!isNaN(amount)) {
          current.amount += Math.abs(amount);
        }

        currentCategoryTotals.set(categoryId, current);
      });

    // Calcola totali per categoria nel periodo precedente
    const previousCategoryTotals = new Map<string, number>();

    previousPeriodTransactions
      .filter((transaction: Transaction) => transaction.type === "EXPENSE")
      .forEach((transaction: Transaction) => {
        const categoryId = transaction.category.id;
        const current = previousCategoryTotals.get(categoryId) || 0;

        const amount = normalizeAmount(transaction.amount);
        if (!isNaN(amount)) {
          previousCategoryTotals.set(categoryId, current + Math.abs(amount));
        } else {
          previousCategoryTotals.set(categoryId, current);
        }
      });

    // Calcola variazioni tra i due periodi
    const trends: CategoryTrend[] = [];

    currentCategoryTotals.forEach((currentData, categoryId) => {
      const previousAmount = previousCategoryTotals.get(categoryId) || 0;
      const change = currentData.amount - previousAmount;
      const percentChange =
        previousAmount === 0
          ? currentData.amount > 0
            ? 100
            : 0
          : (change / previousAmount) * 100;

      trends.push({
        id: categoryId,
        name: currentData.name,
        color: currentData.color,
        currentAmount: currentData.amount,
        previousAmount,
        change,
        percentChange,
      });
    });

    // Ordina per variazione percentuale (decrescente)
    trends.sort(
      (a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange)
    );

    setCategoryTrends(trends);
  };

  // Trova anomalie nelle spese
  const findAnomalies = () => {
    if (!rawTransactions.length) return;

    const now = new Date();
    const anomalies: SpendingAnomaly[] = [];

    // Raggruppa transazioni per mese e categoria
    const categoryMonthlyData = new Map<string, Map<string, number>>();

    // Prima calcola i totali per ogni categoria per ogni mese
    for (let i = 0; i < 12; i++) {
      const month = subMonths(now, i);
      const monthKey = format(month, "MMM yyyy", { locale: it });

      rawTransactions
        .filter((transaction: Transaction) => {
          const date = parseISO(transaction.date);
          return transaction.type === "EXPENSE" && isSameMonth(date, month);
        })
        .forEach((transaction: Transaction) => {
          const categoryId = transaction.category.id;

          if (!categoryMonthlyData.has(categoryId)) {
            categoryMonthlyData.set(categoryId, new Map<string, number>());
          }

          const categoryData = categoryMonthlyData.get(categoryId)!;
          const currentAmount = categoryData.get(monthKey) || 0;

          const amount = normalizeAmount(transaction.amount);

          if (!isNaN(amount)) {
            categoryData.set(monthKey, currentAmount + Math.abs(amount));
          } else {
            categoryData.set(monthKey, currentAmount);
          }
        });
    }

    // Poi cerca anomalie confrontando ogni mese con la media
    categoryMonthlyData.forEach((monthlyData, categoryId) => {
      // Calcola la media per questa categoria
      let sum = 0;
      let count = 0;
      monthlyData.forEach((amount) => {
        sum += amount;
        count++;
      });
      const average = count > 0 ? sum / count : 0;

      // Cerca mesi con scostamenti significativi
      monthlyData.forEach((amount, monthKey) => {
        if (average > 0) {
          const deviation = amount - average;
          const percentDeviation = (deviation / average) * 100;

          // Se la deviazione è superiore al 50%, considera un'anomalia
          if (Math.abs(percentDeviation) > 50) {
            // Trova il nome e il colore della categoria
            const transaction = rawTransactions.find(
              (t: Transaction) => t.category.id === categoryId
            );
            const categoryName = transaction
              ? transaction.category.name
              : "Categoria sconosciuta";
            const categoryColor = transaction
              ? transaction.category.color
              : "#888888";

            anomalies.push({
              category: categoryName,
              color: categoryColor,
              month: monthKey,
              amount,
              averageAmount: average,
              percentDeviation,
            });
          }
        }
      });
    });

    // Ordina per deviazione percentuale (decrescente)
    anomalies.sort(
      (a, b) => Math.abs(b.percentDeviation) - Math.abs(a.percentDeviation)
    );
    setAnomalies(anomalies);
  };

  // Formattazione dei numeri come valuta
  const formatCurrency = (value: number) => {
    // Gestione speciale per valori non numerici o NaN
    if (value === undefined || value === null || isNaN(value)) {
      return "€0,00";
    }

    try {
      // Utilizzo di Intl.NumberFormat con il locale italiano
      return new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch (error) {
      // Fallback in caso di errore
      return `€${value.toFixed(2).replace(".", ",")}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap">
        <h2 className="text-xl font-semibold">Analisi delle Tendenze</h2>
        <div className="w-48">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona periodo" />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="spending">Spese vs Entrate</TabsTrigger>
          <TabsTrigger value="balance">Saldo</TabsTrigger>
          <TabsTrigger value="categories">Categorie</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalie</TabsTrigger>
        </TabsList>

        <TabsContent value="spending">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">
                Confronto Spese vs Entrate
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "6px",
                      }}
                      itemStyle={{ padding: "2px 0" }}
                    />
                    <Legend />
                    <defs>
                      <linearGradient
                        id="colorIncome"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4CAF50"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4CAF50"
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorExpense"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#F44336"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#F44336"
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Entrate"
                      stroke="#4CAF50"
                      fillOpacity={1}
                      fill="url(#colorIncome)"
                      activeDot={{ r: 6 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="Spese"
                      stroke="#F44336"
                      fillOpacity={1}
                      fill="url(#colorExpense)"
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Andamento del Saldo</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      name="Saldo"
                      stroke="#2196F3"
                      strokeWidth={2}
                      dot={{ strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">
                Tendenze per Categoria
              </h3>
              <div className="mb-4 text-sm text-gray-500">
                <p>
                  Confronto tra il periodo attuale e quello precedente. Le
                  percentuali indicano la variazione della spesa.
                </p>
              </div>
              <div className="space-y-4">
                {categoryTrends.length > 0 ? (
                  categoryTrends.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="font-medium">{category.name}</span>
                        <span className="text-xs text-gray-500">
                          ({category.transactionCount || 0} transazioni)
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">
                            {formatCurrency(category.currentAmount)}
                          </span>
                          <div
                            className={`flex items-center ${
                              category.percentChange > 0
                                ? "text-red-500"
                                : category.percentChange < 0
                                ? "text-green-500"
                                : "text-gray-500"
                            }`}
                          >
                            {category.percentChange > 0 ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : category.percentChange < 0 ? (
                              <ArrowDownRight className="h-4 w-4" />
                            ) : null}
                            <span>
                              {Math.abs(category.percentChange).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        {category.previousAmount > 0 && (
                          <span className="text-xs text-gray-500">
                            Periodo precedente:{" "}
                            {formatCurrency(category.previousAmount)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    Non ci sono abbastanza dati per mostrare le tendenze per
                    categoria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">
                Anomalie di Spesa Rilevate
              </h3>
              <div className="mb-4 text-sm text-gray-500">
                <p>
                  Mesi in cui la spesa per una categoria si discosta
                  significativamente dalla media. L'anomalia viene rilevata
                  quando lo scostamento supera il 50%.
                </p>
              </div>
              {anomalies.length > 0 ? (
                <div className="space-y-4">
                  {anomalies.map((anomaly, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-md flex items-start gap-3"
                    >
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {anomaly.category} - {anomaly.month}
                          </h4>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: anomaly.color }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Spesa: {formatCurrency(anomaly.amount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Media mensile: {formatCurrency(anomaly.averageAmount)}
                          {anomaly.percentDeviation > 0
                            ? ` (${anomaly.percentDeviation.toFixed(
                                1
                              )}% in più)`
                            : ` (${Math.abs(anomaly.percentDeviation).toFixed(
                                1
                              )}% in meno)`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  Non sono state rilevate anomalie significative nelle tue
                  spese.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrendAnalyzer;
