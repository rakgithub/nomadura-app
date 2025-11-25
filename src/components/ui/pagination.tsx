"use client";

import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-t pt-4">
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Show first, last, current, and pages around current
            const showPage =
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1);

            const showEllipsis =
              (page === currentPage - 2 && currentPage > 3) ||
              (page === currentPage + 2 && currentPage < totalPages - 2);

            if (showEllipsis) {
              return (
                <span key={page} className="px-2">
                  ...
                </span>
              );
            }

            if (!showPage) {
              return null;
            }

            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className="min-w-[40px]"
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
