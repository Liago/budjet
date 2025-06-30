import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { it } from "date-fns/locale";

// 🔧 Safe date formatting helper
const formatSafeDate = (
  date: string | Date | null | undefined,
  formatString: string = "PPP"
): string => {
  if (!date) return "Data non disponibile";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Data non valida";
    return format(dateObj, formatString, { locale: it });
  } catch (error) {
    return "Data non valida";
  }
};

interface LastExecutionSummaryProps {
  lastExecution: {
    executionDate: string;
    processedPayments: number;
    createdTransactions: number;
    totalAmount: number;
    details: Array<{
      paymentName: string;
      amount: number;
      nextDate: string;
    }>;
  } | null;
  onManualExecution: () => void;
  isLoading: boolean;
  formatAmount: (amount: number) => string;
}

const LastExecutionSummary: React.FC<LastExecutionSummaryProps> = ({
  lastExecution,
  onManualExecution,
  isLoading,
  formatAmount,
}) => {
  if (isLoading) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Ultima Esecuzione Automatica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse flex space-y-4">
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">
          Ultima Esecuzione Automatica
        </CardTitle>
        <Button onClick={onManualExecution} variant="outline" size="sm">
          Esegui Ora
        </Button>
      </CardHeader>
      <CardContent>
        {lastExecution ? (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">
                  Ultima esecuzione:{" "}
                  {formatSafeDate(lastExecution.executionDate)}
                </p>
                <p className="text-sm text-gray-500">
                  Pagamenti processati: {lastExecution.processedPayments}
                </p>
                <p className="text-sm text-gray-500">
                  Transazioni create: {lastExecution.createdTransactions}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-blue-600">
                  {formatAmount(lastExecution.totalAmount)}
                </p>
                <p className="text-sm text-gray-500">Importo totale</p>
              </div>
            </div>

            {lastExecution.details.length > 0 && (
              <div className="mt-4">
                <p className="font-medium mb-2">Dettaglio transazioni:</p>
                <div className="space-y-2">
                  {lastExecution.details.map((detail, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{detail.paymentName}</p>
                        <p className="text-sm text-gray-500">
                          Prossimo pagamento:{" "}
                          {formatSafeDate(detail.nextDate, "dd/MM/yyyy")}
                        </p>
                      </div>
                      <p className="font-medium text-blue-600">
                        {formatAmount(detail.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">
              Nessuna esecuzione automatica registrata
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LastExecutionSummary;
