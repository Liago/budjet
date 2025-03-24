import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import { fetchBudgetAnalysis } from "../../store/slices/dashboardSlice";

// Interface for budget deviation category
interface BudgetDeviation {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  amount: number;
  budget: number;
  deviation: number;
  deviationPercentage: number;
  isOverBudget: boolean;
  isRegularlyExceeding: boolean;
  suggestions: string[];
}

interface BudgetVsSpendingAnalysisProps {
  userId: string;
  formatCurrency: (amount: number) => string;
  timeRange?: string;
}

const BudgetVsSpendingAnalysis: React.FC<BudgetVsSpendingAnalysisProps> = ({
  userId,
  formatCurrency,
  timeRange = "1m",
}) => {
  const dispatch = useAppDispatch();
  const {
    budgetAnalysis: data,
    loadingBudgetAnalysis: loading,
    budgetAnalysisError: error,
  } = useAppSelector((state) => state.dashboard);

  const [activeTab, setActiveTab] = useState<string>("overview");

  // Period options
  const periods = [
    { value: "1m", label: "Ultimo mese" },
    { value: "3m", label: "Ultimi 3 mesi" },
    { value: "6m", label: "Ultimi 6 mesi" },
    { value: "12m", label: "Ultimo anno" },
  ];
  const [selectedPeriod, setSelectedPeriod] = useState<string>(timeRange);

  // Fetch budget vs spending data
  useEffect(() => {
    dispatch(fetchBudgetAnalysis(selectedPeriod));
  }, [dispatch, selectedPeriod]);

  // Helper functions
  const getDeviationColor = (deviation: number) => {
    if (deviation > 20) return "text-red-600";
    if (deviation > 10) return "text-orange-600";
    if (deviation > 0) return "text-yellow-600";
    return "text-green-600";
  };

  const getBarColor = (percentage: number) => {
    if (percentage > 100) return "#ef4444"; // red
    if (percentage > 90) return "#f97316"; // orange
    if (percentage > 75) return "#eab308"; // yellow
    return "#22c55e"; // green
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="h-64 flex items-center justify-center">
            <div className="text-gray-400">Caricamento analisi budget...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="h-64 flex items-center justify-center">
            <div className="text-red-500 flex items-center">
              <AlertCircle className="mr-2" size={18} />
              {error}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.categoryAnalysis || data.categoryAnalysis.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="h-64 flex items-center justify-center">
            <div className="text-gray-400">
              Nessun dato disponibile. Configura i budget nelle categorie per
              visualizzare l'analisi.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for visualization
  const chartData = data.categoryAnalysis.map((cat: any) => ({
    name: cat.categoryName,
    budget: Number(cat.budget),
    spent: Number(cat.amount),
    percentage: cat.budgetPercentage,
    color: cat.categoryColor,
  }));

  // Sort problematic categories first (highest deviation)
  const sortedDeviations = [...data.categoryAnalysis]
    .filter((cat: any) => cat.budget > 0)
    .sort((a: any, b: any) => Math.abs(b.deviation) - Math.abs(a.deviation));

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Analisi Budget vs Spesa</CardTitle>
            <CardDescription>
              Confronto tra budget allocati e spese effettive
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {periods.map((period) => (
              <Button
                key={period.value}
                variant={
                  selectedPeriod === period.value ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="detailed">Dettaglio Categorie</TabsTrigger>
            <TabsTrigger value="suggestions">Suggerimenti</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Riepilogo Budget</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">Budget Totale</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(data.totalBudget)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">Spesa Totale</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(data.totalSpent)}
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className={`${
                    data.totalRemaining >= 0 ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">Rimanente</div>
                    <div
                      className={`text-2xl font-bold ${
                        data.totalRemaining >= 0
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {formatCurrency(data.totalRemaining)}
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className={`${
                    data.totalDeviation <= 0 ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">Scostamento</div>
                    <div
                      className={`text-2xl font-bold flex items-center ${
                        data.totalDeviation <= 0
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {data.totalDeviation <= 0 ? (
                        <TrendingDown className="mr-1" size={18} />
                      ) : (
                        <TrendingUp className="mr-1" size={18} />
                      )}
                      {data.totalDeviationPercentage}%
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">
                Confronto Budget vs Spese
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    barGap={0}
                    barCategoryGap={20}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      tickLine={{ transform: "rotate(-45)" }}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        formatCurrency(Number(value)),
                        name === "budget" ? "Budget" : "Spesa",
                      ]}
                    />
                    <Legend />
                    <Bar name="Budget" dataKey="budget" fill="#4f46e5" />
                    <Bar name="Spesa Effettiva" dataKey="spent" fill="#22c55e">
                      {chartData.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getBarColor(entry.percentage)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="detailed">
            <div className="space-y-6">
              {sortedDeviations.map((category: any) => (
                <Card key={category.categoryId} className="overflow-hidden">
                  <div
                    className="h-1"
                    style={{ backgroundColor: category.categoryColor }}
                  ></div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-lg">
                        {category.categoryName}
                      </h3>
                      <div
                        className={`font-medium ${getDeviationColor(
                          category.deviationPercentage
                        )}`}
                      >
                        {category.isOverBudget ? (
                          <div className="flex items-center">
                            <TrendingUp className="mr-1" size={16} />+
                            {category.deviationPercentage}%
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <TrendingDown className="mr-1" size={16} />
                            {category.deviationPercentage}%
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <div className="text-sm text-gray-500">Budget</div>
                        <div className="font-medium">
                          {formatCurrency(category.budget)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Speso</div>
                        <div className="font-medium">
                          {formatCurrency(category.amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Differenza</div>
                        <div
                          className={`font-medium ${
                            category.isOverBudget
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {formatCurrency(Math.abs(category.deviation))}
                          {category.isOverBudget ? " sopra" : " sotto"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Trend</div>
                        <div className="font-medium">
                          {category.isRegularlyExceeding ? (
                            <span className="text-red-600">
                              Superamento ricorrente
                            </span>
                          ) : (
                            <span className="text-gray-600">Nella norma</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {category.isOverBudget && category.isRegularlyExceeding && (
                      <div className="mt-4 bg-orange-50 p-3 rounded-md text-sm">
                        <div className="font-medium text-orange-800 mb-1">
                          Suggerimento:
                        </div>
                        <div className="text-orange-700">
                          {category.suggestion ||
                            "Valuta di aumentare il budget o ridurre le spese in questa categoria."}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="suggestions">
            <div className="space-y-6">
              {data.suggestions && data.suggestions.length > 0 ? (
                data.suggestions.map((suggestion: any, index: number) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="h-1 bg-blue-500"></div>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">{suggestion.title}</h3>
                      <p className="text-gray-700 mb-2">
                        {suggestion.description}
                      </p>

                      {suggestion.potentialSaving && (
                        <div className="mt-3 bg-green-50 p-2 rounded flex items-center">
                          <TrendingDown
                            className="text-green-600 mr-2"
                            size={16}
                          />
                          <span className="text-green-700 text-sm">
                            Risparmio potenziale:{" "}
                            {formatCurrency(suggestion.potentialSaving)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-gray-500 py-12">
                  Nessun suggerimento disponibile al momento.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BudgetVsSpendingAnalysis;
