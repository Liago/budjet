import React from "react";
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
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TopCategory {
  name: string;
  amount: number;
  color: string;
}

interface TopCategoriesChartProps {
  topCategories: TopCategory[];
  formatAmount: (amount: number | string) => string;
}

const TopCategoriesChart: React.FC<TopCategoriesChartProps> = ({
  topCategories,
  formatAmount,
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium mb-1">{label}</p>
          <p style={{ color: payload[0].payload.color }}>
            €{formatAmount(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Customize the bar colors based on category color
  const renderBars = () => {
    return topCategories.map((category, index) => (
      <Bar 
        key={`bar-${index}`}
        dataKey="amount" 
        fill={category.color} 
        radius={[4, 4, 0, 0]} 
        barSize={25}
        background={{ fill: "#f0f0f0" }}
      />
    ));
  };

  const emptyState = topCategories.length === 0;

  return (
    <Card className="col-span-1 h-full flex flex-col">
      <CardHeader>
        <CardTitle>Top Categorie di Spesa</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {emptyState ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            Nessuna spesa in questo periodo
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topCategories}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => "€" + formatAmount(value)}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={100} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                {renderBars()}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t bg-gradient-to-r from-yellow-50 to-amber-50">
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
            className="text-yellow-600"
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

export default TopCategoriesChart; 
