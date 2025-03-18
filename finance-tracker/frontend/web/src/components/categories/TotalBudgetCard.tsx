import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Category } from "../../utils/types";

interface TotalBudgetCardProps {
  categories: Category[];
}

const TotalBudgetCard: React.FC<TotalBudgetCardProps> = ({ categories }) => {
  const categoriesWithBudget = categories.filter((cat) => cat.budget);
  const totalBudget = categoriesWithBudget.reduce(
    (total, cat) => total + Number(cat.budget),
    0
  );
  const budgetPercentage =
    categories.length > 0
      ? (categoriesWithBudget.length / categories.length) * 100
      : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calcola il budget medio per categoria
  const averageBudget =
    categoriesWithBudget.length > 0
      ? totalBudget / categoriesWithBudget.length
      : 0;

  // Trova la categoria con il budget più alto
  const categoryWithHighestBudget =
    categoriesWithBudget.length > 0
      ? categoriesWithBudget.reduce(
          (prev, current) =>
            Number(prev.budget) > Number(current.budget) ? prev : current,
          categoriesWithBudget[0]
        )
      : null;

  // Determina lo stato del budget
  const getBudgetStatus = () => {
    if (budgetPercentage >= 90)
      return { label: "Eccellente", color: "text-green-600" };
    if (budgetPercentage >= 70)
      return { label: "Buono", color: "text-blue-600" };
    if (budgetPercentage >= 50)
      return { label: "Discreto", color: "text-yellow-600" };
    return { label: "Da migliorare", color: "text-orange-600" };
  };

  const budgetStatus = getBudgetStatus();

  // Calcola il colore della progress bar
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-gradient-to-r from-green-500 to-green-400";
    if (percentage >= 70) return "bg-gradient-to-r from-blue-500 to-blue-400";
    if (percentage >= 50)
      return "bg-gradient-to-r from-yellow-500 to-yellow-400";
    return "bg-gradient-to-r from-orange-500 to-orange-400";
  };

  return (
    <Card className="mb-6 mt-4 overflow-hidden shadow-lg border border-gray-100">
      {/* Header stripe */}
      <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

      <CardHeader className="pb-2">
        <div className="flex items-center">
          <div className="p-2 mr-3 bg-blue-100 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl">Budget Totale Allocato</CardTitle>
            <CardDescription>
              Panoramica dei budget mensili assegnati alle categorie
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left column - Budget amount and stats */}
          <div className="space-y-6">
            {/* Total Budget Amount */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 mb-1">
                  Budget Totale Mensile:
                </span>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-blue-700">
                    {formatCurrency(totalBudget)}
                  </span>
                  <span className="ml-2 text-sm text-blue-600">/mese</span>
                </div>
              </div>
            </div>

            {/* Budget Stats */}
            <div className="grid grid-cols-2 gap-3">
              {/* Average Budget */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Budget Medio</div>
                <div className="font-semibold text-lg">
                  {formatCurrency(averageBudget)}
                </div>
              </div>

              {/* Highest Budget */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">
                  Budget Più Alto
                </div>
                <div className="font-semibold text-lg">
                  {categoryWithHighestBudget
                    ? formatCurrency(Number(categoryWithHighestBudget.budget))
                    : "N/A"}
                </div>
                {categoryWithHighestBudget && (
                  <div className="text-xs text-gray-500 truncate mt-1">
                    {categoryWithHighestBudget.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Coverage and status */}
          <div className="flex flex-col justify-between">
            {/* Coverage stats */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-500 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                  </svg>
                  <span className="text-sm font-medium">Copertura Budget</span>
                </div>
                <span className={`text-sm font-medium ${budgetStatus.color}`}>
                  {budgetStatus.label}
                </span>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Categorie con budget:</span>
                    <span className="font-medium">
                      {Math.round(budgetPercentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${getProgressColor(
                        budgetPercentage
                      )} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${budgetPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="flex items-center text-green-600 mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{categoriesWithBudget.length}</span>
                    </div>
                    <span>con budget</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center text-orange-600 mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        {categories.length - categoriesWithBudget.length}
                      </span>
                    </div>
                    <span>senza budget</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 border-t border-gray-100">
        <div className="text-sm flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-500 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-gray-600">
            Per un controllo efficace delle tue spese, ti consigliamo di
            impostare un budget per tutte le categorie.
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TotalBudgetCard;
