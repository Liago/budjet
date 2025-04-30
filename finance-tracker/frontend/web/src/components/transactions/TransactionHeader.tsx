import React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, UploadIcon } from "../Icons";

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
  isLoading,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold text-foreground">Transazioni</h1>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={onDeleteAll}
          variant="outline"
          className="text-red-700 hover:bg-red-50 border-red-300"
          disabled={isDeleting || isLoading}
          size="sm"
        >
          {isDeleting ? "Deleting..." : "Delete All"}
        </Button>
        <Button
          onClick={onManualDeleteAll}
          variant="outline"
          className="text-red-700 hover:bg-red-50 border-red-300"
          disabled={isDeleting || isLoading}
          size="sm"
        >
          Manual Delete All
        </Button>
        <Button onClick={onImportCsv} variant="outline" size="sm">
          <UploadIcon className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
        <Button onClick={onAddTransaction} size="sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>
    </div>
  );
};

export default TransactionHeader;
