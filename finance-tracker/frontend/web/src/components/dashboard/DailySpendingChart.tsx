import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  formatAmount
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium mb-1">{label}</p>
          <p className="text-red-600">
            €{formatAmount(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const emptyState = dailySpending.length === 0;

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Spese Giornaliere</CardTitle>
      </CardHeader>
      <CardContent>
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
                  tickFormatter={(value) => '€' + formatAmount(value)} 
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
    </Card>
  );
};

export default DailySpendingChart; 