import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DashboardStatsProps {
  totalIncome: number;
  totalExpense: number;
  totalBudget: number;
  budgetRemaining: number;
  budgetPercentage: number;
  formatAmount: (amount: number | string) => string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalIncome,
  totalExpense,
  totalBudget,
  budgetRemaining,
  budgetPercentage,
  formatAmount
}) => {
  // Protezione per valori NaN o undefined
  const safeIncome = isNaN(totalIncome) ? 0 : totalIncome;
  const safeExpense = isNaN(totalExpense) ? 0 : totalExpense;
  const safeBudget = isNaN(totalBudget) ? 0 : totalBudget;
  const safeBudgetRemaining = isNaN(budgetRemaining) ? 0 : budgetRemaining;
  const safeBudgetPercentage = isNaN(budgetPercentage) ? 0 : budgetPercentage;
  
  // Calcola il bilancio come differenza tra entrate e uscite
  const balance = safeIncome - safeExpense;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Income Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Entrate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">
            €{formatAmount(safeIncome)}
          </p>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">Questo periodo</p>
        </CardFooter>
      </Card>

      {/* Expense Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Uscite</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-600">
            €{formatAmount(safeExpense)}
          </p>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">Questo periodo</p>
        </CardFooter>
      </Card>

      {/* Budget Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-3xl font-bold text-blue-600">
              €{formatAmount(safeBudget)}
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Utilizzato:</span>
                <span
                  className={
                    safeBudgetPercentage > 100
                      ? "text-red-600 font-medium"
                      : "text-gray-600"
                  }
                >
                  {safeBudgetPercentage}%
                </span>
              </div>
              <Progress
                value={safeBudgetPercentage}
                className={
                  safeBudgetPercentage > 100
                    ? "bg-red-200"
                    : ""
                }
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">
            Rimanente: €{formatAmount(safeBudgetRemaining)}
          </p>
        </CardFooter>
      </Card>

      {/* Balance Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Bilancio</CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-3xl font-bold ${
              balance >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            €{formatAmount(balance)}
          </p>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">Questo periodo</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DashboardStats; 