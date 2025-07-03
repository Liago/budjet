import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthlyData {
  name: string;
  income: number;
  expense: number;
}

interface IncomeExpenseBarChartProps {
  monthlyData: MonthlyData[];
  formatAmount: (amount: number | string) => string;
}

const IncomeExpenseBarChart: React.FC<IncomeExpenseBarChartProps> = ({
  monthlyData,
  formatAmount,
}) => {
  // Debug log per verificare i dati ricevuti
  useEffect(() => {
    console.log("IncomeExpenseBarChart - monthlyData ricevuti:", monthlyData);
    console.log(
      "IncomeExpenseBarChart - nomi dei mesi:",
      monthlyData.map((d) => d.name).join(", ")
    );

    // Log dettagliato dei valori per ogni mese
    console.log("IncomeExpenseBarChart - Dettaglio valori per mese:");
    monthlyData.forEach((month) => {
      console.log(
        `${month.name}: income=${month.income}, expense=${month.expense}`
      );
    });
  }, [monthlyData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`tooltip-${index}`} style={{ color: entry.color }}>
              {entry.name}: €{formatAmount(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const emptyState = monthlyData.length === 0;

  // Ordinare i mesi cronologicamente
  const sortedMonthlyData = [...monthlyData].sort((a, b) => {
    // Estrai mese e anno dalla stringa (formato "mmm yyyy")
    const [aMonth, aYear] = a.name.split(" ");
    const [bMonth, bYear] = b.name.split(" ");

    // Prima confronta gli anni
    if (aYear !== bYear) {
      return parseInt(aYear) - parseInt(bYear);
    }

    // Poi confronta i mesi (usa un array di mesi in italiano per il confronto)
    const months = [
      "gen",
      "feb",
      "mar",
      "apr",
      "mag",
      "giu",
      "lug",
      "ago",
      "set",
      "ott",
      "nov",
      "dic",
    ];
    return (
      months.indexOf(aMonth.toLowerCase()) -
      months.indexOf(bMonth.toLowerCase())
    );
  });

  return (
    <Card className="col-span-2 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Entrate vs Uscite</span>
          {process.env.NODE_ENV === "development" && (
            <span className="text-xs font-normal text-gray-500">
              Mesi: {monthlyData.map((d) => d.name).join(", ")}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {emptyState ? (
          <div className="h-80 flex items-center justify-center text-gray-400">
            Nessun dato disponibile in questo periodo
          </div>
        ) : (
          <div className="flex flex-col h-80">
            {/* Debug panel per mostrare i valori */}
            {process.env.NODE_ENV === "development" && (
              <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-50 rounded overflow-x-auto">
                <strong>Debug - Dati originali in monthlyData:</strong>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  <div className="font-medium">Mese</div>
                  <div className="font-medium">Entrate</div>
                  <div className="font-medium">Uscite</div>
                  {monthlyData.map((month, idx) => (
                    <React.Fragment key={idx}>
                      <div>{month.name}</div>
                      <div>€{formatAmount(month.income)}</div>
                      <div>€{formatAmount(month.expense)}</div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedMonthlyData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  height={40}
                  tickMargin={10}
                  interval={0}
                />
                <YAxis
                  tickFormatter={(value) => "€" + formatAmount(value)}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10 }}
                  formatter={(value) => (
                    <span className="text-sm font-medium">{value}</span>
                  )}
                />
                <Bar
                  dataKey="income"
                  name="Entrate"
                  fill="#22C55E"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                  minPointSize={3}
                />
                <Bar
                  dataKey="expense"
                  name="Uscite"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                  minPointSize={3}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
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
            className="text-blue-600"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <path d="M2 10h20" />
          </svg>
          Questo periodo
        </p>
      </CardFooter>
    </Card>
  );
};

export default IncomeExpenseBarChart;
