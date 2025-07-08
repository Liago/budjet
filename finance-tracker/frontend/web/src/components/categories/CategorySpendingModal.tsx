import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, TagIcon, getIconByName } from "../Icons";
import { Category, Transaction } from "../../utils/types";
import { transactionService } from "../../utils/apiServices";

interface CategorySpendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  timeFilter: string;
  availableMonths: { value: string; label: string }[];
}

interface CategorySpendingSummary {
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
  transactions: Transaction[];
  dailyBreakdown: { date: string; amount: number; count: number }[];
}

const CategorySpendingModal: React.FC<CategorySpendingModalProps> = ({
  isOpen,
  onClose,
  category,
  timeFilter,
  availableMonths,
}) => {
  const [spendingSummary, setSpendingSummary] =
    useState<CategorySpendingSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      fetchCategorySpending();
    }
  }, [isOpen, category, timeFilter]);

  const fetchCategorySpending = async () => {
    if (!category) return;

    setLoading(true);
    try {
      let startDate, endDate;

      if (timeFilter === "current-month") {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        startDate = format(
          new Date(currentYear, currentMonth - 1, 1),
          "yyyy-MM-dd"
        );
        endDate = format(new Date(currentYear, currentMonth, 0), "yyyy-MM-dd");
      } else {
        const [year, month] = timeFilter.split("-");
        startDate = format(
          new Date(parseInt(year), parseInt(month) - 1, 1),
          "yyyy-MM-dd"
        );
        endDate = format(
          new Date(parseInt(year), parseInt(month), 0),
          "yyyy-MM-dd"
        );
      }

      const response = await transactionService.getAll({
        startDate,
        endDate,
        categoryId: category.id,
        type: "EXPENSE",
        limit: 1000,
      });

      const transactions = response.data || [];
      const totalSpent = transactions.reduce(
        (sum, tx) => sum + Number(tx.amount),
        0
      );
      const transactionCount = transactions.length;
      const averageTransaction =
        transactionCount > 0 ? totalSpent / transactionCount : 0;

      // Create daily breakdown
      const dailyMap = new Map<string, { amount: number; count: number }>();
      transactions.forEach((tx) => {
        const dateKey = format(new Date(tx.date), "yyyy-MM-dd");
        const existing = dailyMap.get(dateKey) || { amount: 0, count: 0 };
        dailyMap.set(dateKey, {
          amount: existing.amount + Number(tx.amount),
          count: existing.count + 1,
        });
      });

      const dailyBreakdown = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => b.date.localeCompare(a.date));

      setSpendingSummary({
        totalSpent,
        transactionCount,
        averageTransaction,
        transactions: transactions.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        dailyBreakdown,
      });
    } catch (error) {
      console.error("Error fetching category spending:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = () => {
    if (timeFilter === "current-month") {
      return "Mese corrente";
    }
    const month = availableMonths.find((m) => m.value === timeFilter);
    return month ? month.label : "Periodo selezionato";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const renderCategoryIcon = (iconName: string, color: string) => {
    const IconComponent = getIconByName(iconName);
    return (
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        <IconComponent className="text-white" size={20} />
      </div>
    );
  };

  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {renderCategoryIcon(category.icon, category.color)}
            <div>
              <div className="text-xl">{category.name}</div>
              <div className="text-sm text-gray-500 font-normal">
                Riepilogo spese - {getPeriodLabel()}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Dettaglio completo delle spese sostenute per questa categoria nel
            periodo selezionato.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : spendingSummary ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500 mb-1">Totale Speso</div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(spendingSummary.totalSpent)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500 mb-1">Transazioni</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {spendingSummary.transactionCount}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500 mb-1">Spesa Media</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(spendingSummary.averageTransaction)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Breakdown */}
            {spendingSummary.dailyBreakdown.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Spese per Giorno
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {spendingSummary.dailyBreakdown.map((day) => (
                      <div
                        key={day.date}
                        className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {format(new Date(day.date), "dd MMMM yyyy", {
                              locale: it,
                            })}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {day.count} transazioni
                          </Badge>
                        </div>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(day.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transaction List */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Dettaglio Transazioni
                </h3>
                {spendingSummary.transactions.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {spendingSummary.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex justify-between items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {transaction.description}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <CalendarIcon className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {format(
                                new Date(transaction.date),
                                "dd/MM/yyyy",
                                { locale: it }
                              )}
                            </span>
                            {transaction.tags &&
                              transaction.tags.length > 0 && (
                                <>
                                  <TagIcon className="h-3 w-3 text-gray-400" />
                                  <div className="flex gap-1">
                                    {transaction.tags.map((tag) => (
                                      <Badge
                                        key={tag.id}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {tag.name}
                                      </Badge>
                                    ))}
                                  </div>
                                </>
                              )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-red-600">
                            {formatCurrency(Number(transaction.amount))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nessuna transazione trovata per questo periodo.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Errore nel caricamento dei dati.
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategorySpendingModal;
