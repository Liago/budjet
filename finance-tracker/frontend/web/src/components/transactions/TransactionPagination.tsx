import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransactionPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number | 'all';
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number | 'all') => void;
}

const TransactionPagination: React.FC<TransactionPaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
        {/* Selettore elementi per pagina */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Visualizza:</span>
          <Select 
            value={String(pageSize)} 
            onValueChange={(value) => {
              onPageSizeChange(value === 'all' ? 'all' : parseInt(value));
            }}
          >
            <SelectTrigger className="h-8 w-[80px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="all">Tutti</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Paginazione desktop */}
        {totalPages > 1 && pageSize !== 'all' && (
          <div className="flex space-x-1">
            <Button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="icon"
              className={`h-8 w-8 ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span className="sr-only">Previous</span>
              &larr;
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  onClick={() => onPageChange(page)}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                >
                  {page}
                </Button>
              )
            )}

            <Button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              size="icon"
              className={`h-8 w-8 ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <span className="sr-only">Next</span>
              &rarr;
            </Button>
          </div>
        )}
      </div>

      {/* Mobile pagination */}
      {totalPages > 1 && pageSize !== 'all' && (
        <div className="sm:hidden flex justify-between px-4 pb-4">
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className={
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }
          >
            Previous
          </Button>
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            className={
              currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : ""
            }
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
};

export default TransactionPagination; 