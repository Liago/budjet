import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DailySpending {
  date: string;
  amount: number;
}

interface DailySpendingChartProps {
  dailySpending: DailySpending[];
  formatAmount: (amount: number | string) => string;
}

const DailySpendingChart: React.FC<DailySpendingChartProps> = ({
  dailySpending,
  formatAmount,
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium mb-1">{label}</p>
          <p className="text-red-600">€{formatAmount(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const emptyState = dailySpending.length === 0;

  return (
    <Card className="col-span-2 h-full flex flex-col">
      <CardHeader>
        <CardTitle>Spese Giornaliere</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {emptyState ? (
          <div className="h-80 flex items-center justify-center text-gray-400">
            Nessun dato disponibile in questo periodo
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailySpending}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  height={40}
                  tickMargin={10}
                />
                <YAxis 
                  tickFormatter={(value) => "€" + formatAmount(value)}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#EF4444" 
                  activeDot={{ r: 6 }} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t bg-gradient-to-r from-orange-50 to-amber-50">
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
            className="text-orange-600"
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

export default DailySpendingChart; 
