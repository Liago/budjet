import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusIcon } from '../../components/Icons';

interface RecurrentPaymentHeaderProps {
  onAddPayment: () => void;
}

const RecurrentPaymentHeader: React.FC<RecurrentPaymentHeaderProps> = ({
  onAddPayment
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-2xl font-bold text-gray-900">
        Pagamenti Ricorrenti
      </h1>

      <Button
        onClick={onAddPayment}
        className="gap-2"
      >
        <PlusIcon className="h-4 w-4" />
        Aggiungi Pagamento Ricorrente
      </Button>
    </div>
  );
};

export default RecurrentPaymentHeader; 