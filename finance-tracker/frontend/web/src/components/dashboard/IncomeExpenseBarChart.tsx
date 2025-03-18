import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  formatAmount
}) => {
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

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Entrate vs Uscite</CardTitle>
      </CardHeader>
      <CardContent>
        {emptyState ? (
          <div className="h-80 flex items-center justify-center text-gray-400">
            Nessun dato disponibile in questo periodo
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
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
                />
                <YAxis 
                  tickFormatter={(value) => '€' + formatAmount(value)} 
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 10 }} 
                  formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                />
                <Bar 
                  dataKey="income" 
                  name="Entrate" 
                  fill="#22C55E" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                />
                <Bar 
                  dataKey="expense" 
                  name="Uscite" 
                  fill="#EF4444" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseBarChart; 