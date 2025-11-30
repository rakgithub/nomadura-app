"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error";
import { Pagination } from "@/components/ui/pagination";
import { useGlobalTransfers } from "@/hooks/use-global-transfers";
import { getGlobalBucketLabel, formatCurrency } from "@/lib/calculations/global-transfers";
import { paginateArray, getTotalPages } from "@/lib/pagination";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 10;

export function GlobalTransferHistory() {
  const { data: transfers, isLoading, error } = useGlobalTransfers();
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Transfer History</h2>
        <Loading />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Transfer History</h2>
        <ErrorDisplay message="Failed to load transfer history" />
      </Card>
    );
  }

  if (!transfers || transfers.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Transfer History</h2>
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No transfers yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your transfer history will appear here
          </p>
        </div>
      </Card>
    );
  }

  const paginatedTransfers = paginateArray(transfers, currentPage, ITEMS_PER_PAGE);
  const totalPages = getTotalPages(transfers.length, ITEMS_PER_PAGE);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Transfer History</h2>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
              <th className="h-12 px-4 text-left align-middle font-medium">From</th>
              <th className="h-12 px-4 text-left align-middle font-medium">To</th>
              <th className="h-12 px-4 text-right align-middle font-medium">Amount</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransfers.map((transfer) => (
              <tr
                key={transfer.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <td className="p-4 align-middle">
                  <div className="text-sm">
                    {format(new Date(transfer.transfer_date), "MMM dd, yyyy")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(transfer.created_at), "HH:mm")}
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <span className="text-sm font-medium">
                    {getGlobalBucketLabel(transfer.from_bucket)}
                  </span>
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {getGlobalBucketLabel(transfer.to_bucket)}
                    </span>
                  </div>
                </td>
                <td className="p-4 align-middle text-right">
                  <span className="text-sm font-bold">
                    {formatCurrency(transfer.amount)}
                  </span>
                </td>
                <td className="p-4 align-middle">
                  <span className="text-sm text-muted-foreground">
                    {transfer.notes || "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        totalItems={transfers.length}
      />
    </Card>
  );
}
