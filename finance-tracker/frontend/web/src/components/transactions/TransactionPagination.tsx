import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number | "all";
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number | "all") => void;
}

const TransactionPagination: React.FC<TransactionPaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  // Generate page numbers to display, with ellipsis for large ranges
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      // If we have 5 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always add first page
      pages.push(1);

      // Calculate middle pages
      if (currentPage <= 3) {
        pages.push(2, 3, 4, "...");
      } else if (currentPage >= totalPages - 2) {
        pages.push("...", totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...");
      }

      // Always add last page if not already included
      if (totalPages > 1 && !pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Items per page selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Visualizza:</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => {
            onPageSizeChange(value === "all" ? "all" : parseInt(value));
          }}
        >
          <SelectTrigger className="h-7 w-[70px] text-xs">
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

      {/* Pagination controls */}
      {totalPages > 1 && pageSize !== "all" && (
        <div className="flex space-x-1">
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="icon"
            className="h-7 w-7 text-xs"
          >
            &larr;
          </Button>

          {getPageNumbers().map((page, idx) =>
            page === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-2 flex items-center">
                ...
              </span>
            ) : (
              <Button
                key={`page-${page}`}
                onClick={() => onPageChange(Number(page))}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                className="h-7 w-7 text-xs"
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
            className="h-7 w-7 text-xs"
          >
            &rarr;
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionPagination;
