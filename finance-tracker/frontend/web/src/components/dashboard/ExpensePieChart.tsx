import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryExpense {
  id: number;
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface ExpensePieChartProps {
  expensesByCategory: CategoryExpense[];
  formatAmount: (amount: number | string) => string;
}

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({
  expensesByCategory,
  formatAmount
}) => {
  // Prepare data for Legend component
  const renderLegend = () => {
    return (
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        {expensesByCategory.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center text-sm">
            <div 
              className="w-3 h-3 mr-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="flex-1 truncate">{entry.name}</span>
            <span className="font-medium ml-2">€{formatAmount(entry.value)}</span>
            <span className="text-gray-500 ml-2">({entry.percentage}%)</span>
          </div>
        ))}
      </div>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{data.name}</p>
          <p>€{formatAmount(data.value)}</p>
          <p>{data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const emptyState = expensesByCategory.length === 0;

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Spese per Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        {emptyState ? (
          <div className="h-80 flex items-center justify-center text-gray-400">
            Nessuna spesa in questo periodo
          </div>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={1}
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {renderLegend()}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpensePieChart; 