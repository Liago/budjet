import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BalanceData {
  date: string;
  balance: number;
}

interface BalanceTrendChartProps {
  balanceData: BalanceData[];
  formatAmount: (amount: number | string) => string;
}

const BalanceTrendChart: React.FC<BalanceTrendChartProps> = ({
  balanceData,
  formatAmount
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium mb-1">{label}</p>
          <p>
            Bilancio: <span className={payload[0].value >= 0 ? 'text-green-600' : 'text-red-600'}>
              €{formatAmount(payload[0].value)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const emptyState = balanceData.length === 0;

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Andamento Bilancio</CardTitle>
      </CardHeader>
      <CardContent>
        {emptyState ? (
          <div className="h-80 flex items-center justify-center text-gray-400">
            Nessun dato disponibile in questo periodo
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={balanceData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
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
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BalanceTrendChart; 