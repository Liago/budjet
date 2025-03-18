import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusIcon, UploadIcon } from '../Icons';

interface TransactionHeaderProps {
  onAddTransaction: () => void;
  onImportCsv: () => void;
  onDeleteAll: () => void;
  onManualDeleteAll: () => void;
  isDeleting: boolean;
  isLoading: boolean;
}

const TransactionHeader: React.FC<TransactionHeaderProps> = ({
  onAddTransaction,
  onImportCsv,
  onDeleteAll,
  onManualDeleteAll,
  isDeleting,
  isLoading
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>

      <div className="flex items-center space-x-2">
        <Button
          onClick={onDeleteAll}
          variant="outline"
          className="text-red-700 hover:bg-red-50 border-red-300"
          disabled={isDeleting || isLoading}
        >
          {isDeleting ? "Deleting..." : "Delete All"}
        </Button>
        <Button
          onClick={onManualDeleteAll}
          variant="outline"
          className="text-red-700 hover:bg-red-50 border-red-300"
          disabled={isDeleting || isLoading}
        >
          Manual Delete All
        </Button>
        <Button onClick={onImportCsv} variant="outline">
          <UploadIcon className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
        <Button onClick={onAddTransaction}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>
    </div>
  );
};

export default TransactionHeader; 