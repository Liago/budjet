import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CsvImporter from '../CsvImporter';

interface TransactionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TransactionImportModal: React.FC<TransactionImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import transactions
          </DialogDescription>
        </DialogHeader>
        <CsvImporter onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default TransactionImportModal; 