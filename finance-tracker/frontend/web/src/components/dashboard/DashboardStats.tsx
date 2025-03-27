import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  formatAmount,
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
    <>
      {/* Income Card */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600"
            >
              <path d="m2 16 6-6 4 4 10-10" />
              <path d="M22 6v-4h-4" />
            </svg>
            Entrate
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-3xl font-bold text-green-600">
            €{formatAmount(safeIncome)}
          </p>
        </CardContent>
        <CardFooter className="border-t bg-gradient-to-r from-green-50 to-emerald-50">
          <p className="text-sm font-medium flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
            Questo periodo
          </p>
        </CardFooter>
      </Card>

      {/* Expense Card */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-red-50 to-rose-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-600"
            >
              <path d="m2 8 6 6 4-4 10 10" />
              <path d="M22 8v-4h-4" />
            </svg>
            Uscite
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-3xl font-bold text-red-600">
            €{formatAmount(safeExpense)}
          </p>
        </CardContent>
        <CardFooter className="border-t bg-gradient-to-r from-red-50 to-rose-50">
          <p className="text-sm font-medium flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-600"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
            Questo periodo
          </p>
        </CardFooter>
      </Card>

      {/* Budget Card */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Budget
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div>
            <p className="text-3xl font-bold text-blue-600">
              €{formatAmount(safeBudget)}
            </p>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Utilizzato:</span>
                <span
                  className={`font-medium ${
                    safeBudgetPercentage > 90
                      ? "text-red-600"
                      : safeBudgetPercentage > 70
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {safeBudgetPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`${
                    safeBudgetPercentage > 90
                      ? "bg-gradient-to-r from-red-500 to-red-400"
                      : safeBudgetPercentage > 70
                      ? "bg-gradient-to-r from-amber-500 to-amber-400"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  } h-2.5 rounded-full transition-all duration-500 ease-in-out`}
                  style={{
                    width: `${
                      safeBudgetPercentage > 100 ? 100 : safeBudgetPercentage
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-gradient-to-r from-blue-50 to-indigo-50">
          <p className="text-sm font-medium flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={
                safeBudgetRemaining >= 0 ? "text-emerald-600" : "text-red-600"
              }
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Rimanente:{" "}
            <span
              className={
                safeBudgetRemaining >= 0 ? "text-emerald-600" : "text-red-600"
              }
            >
              €{formatAmount(safeBudgetRemaining)}
            </span>
          </p>
        </CardFooter>
      </Card>

      {/* Balance Card */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-violet-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={balance >= 0 ? "text-purple-600" : "text-red-600"}
            >
              <path d="M18.5 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12.5a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3Z" />
              <path d="M14 8.5a2.5 2.5 0 0 0-5 0v7a2.5 2.5 0 0 1-5 0" />
              <path d="M14 15.5a2.5 2.5 0 0 0 5 0v-7a2.5 2.5 0 0 1 5 0" />
            </svg>
            Bilancio
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p
            className={`text-3xl font-bold ${
              balance >= 0 ? "text-purple-600" : "text-red-600"
            }`}
          >
            €{formatAmount(balance)}
          </p>
        </CardContent>
        <CardFooter className="border-t bg-gradient-to-r from-purple-50 to-violet-50">
          <p className="text-sm font-medium flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-purple-600"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
            Questo periodo
          </p>
        </CardFooter>
      </Card>
    </>
  );
};

export default DashboardStats;
