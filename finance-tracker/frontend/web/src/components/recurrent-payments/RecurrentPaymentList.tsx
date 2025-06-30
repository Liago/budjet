import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "../../components/Icons";
import { RecurrentPayment } from "../../utils/types";
import RecurrentPaymentCard from "./RecurrentPaymentCard";

interface RecurrentPaymentListProps {
  payments: RecurrentPayment[];
  searchTerm: string;
  filterActive: string;
  formatAmount: (amount: number | string | null | undefined) => string; // 🔧 Updated to match fixed function
  onToggleActive: (payment: RecurrentPayment) => void;
  onEdit: (payment: RecurrentPayment) => void;
  onDelete: (id: string) => void;
  onAddPayment: () => void;
}

const RecurrentPaymentList: React.FC<RecurrentPaymentListProps> = ({
  payments,
  searchTerm,
  filterActive,
  formatAmount,
  onToggleActive,
  onEdit,
  onDelete,
  onAddPayment,
}) => {
  return (
    <Card>
      {(payments || []).length > 0 ? ( {/* 🔧 Safe check for payments */}
        <div className="divide-y divide-gray-200">
          {(payments || []).map((payment) => ( {/* 🔧 Safe check for payments */}
            <RecurrentPaymentCard
              key={payment.id}
              payment={payment}
              formatAmount={formatAmount}
              onToggleActive={onToggleActive}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">
          {searchTerm || filterActive !== "all" ? (
            <p>Nessun pagamento ricorrente corrisponde ai filtri.</p>
          ) : (
            <div className="space-y-4">
              <p>Non ci sono ancora pagamenti ricorrenti.</p>
              <Button onClick={onAddPayment} className="gap-2">
                <PlusIcon className="h-4 w-4" />
                Crea il tuo primo pagamento ricorrente
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default RecurrentPaymentList;
