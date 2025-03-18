import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { ArrowRightIcon } from 'lucide-react';
import { Transaction } from '../../types/Transaction';
import { Link } from 'react-router-dom';

interface RecentTransactionsProps {
  transactions: Transaction[];
  formatAmount: (amount: number | string) => string;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  formatAmount
}) => {
  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Transazioni Recenti</CardTitle>
        <Link to="/transactions">
          <Button size="sm" variant="ghost">
            Vedi Tutte
            <ArrowRightIcon className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            Nessuna transazione in questo periodo
          </div>
        ) : (
          <div className="space-y-5">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-full mr-3 flex items-center justify-center text-white"
                    style={{ 
                      backgroundColor: transaction.category?.color || (transaction.type === 'INCOME' ? '#22C55E' : '#EF4444')
                    }}
                  >
                    <span className="text-xs font-medium">{transaction.category?.icon || (transaction.type === 'INCOME' ? '+' : '-')}</span>
                  </div>
                  <div>
                    <p className="font-medium truncate max-w-[160px]">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(transaction.date), 'd MMM yyyy', { locale: it })}
                    </p>
                  </div>
                </div>
                <div className={`font-medium ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'INCOME' ? '+' : '-'}€{formatAmount(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions; 