"use client";

import { useState } from "react";
import { useWithdrawals, useDeleteWithdrawal } from "@/hooks/use-withdrawals";
import { useFinancialSummary } from "@/hooks/use-financial-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { paginateArray, getTotalPages } from "@/lib/pagination";
import { WithdrawalModal } from "@/components/withdrawals/withdrawal-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Trash2, Plus } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function WithdrawalsPage() {
  const { data: withdrawals, isLoading, error, refetch } = useWithdrawals();
  const { data: summary } = useFinancialSummary();
  const deleteWithdrawal = useDeleteWithdrawal();
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Paginate withdrawals
  const paginatedWithdrawals = withdrawals
    ? paginateArray(withdrawals, currentPage, ITEMS_PER_PAGE)
    : [];
  const totalPages = withdrawals
    ? getTotalPages(withdrawals.length, ITEMS_PER_PAGE)
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteWithdrawal.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <ErrorDisplay message="Failed to load withdrawals" retry={refetch} />
      </div>
    );
  }

  const totalWithdrawn =
    withdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Withdrawals</h1>
            <p className="text-muted-foreground">
              Track your profit withdrawals
            </p>
          </div>
          <Button onClick={() => setWithdrawalModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Withdrawal
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Total Withdrawn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalWithdrawn)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Available to Withdraw
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary?.withdrawableProfit || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Total Withdrawals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {withdrawals?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawals List */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            {!withdrawals || withdrawals.length === 0 ? (
              <EmptyState
                title="No withdrawals yet"
                description="Click 'New Withdrawal' to record your first profit withdrawal"
              />
            ) : (
              <>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Notes</th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Amount</th>
                        <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground w-[80px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedWithdrawals.map((withdrawal) => (
                        <tr key={withdrawal.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4 align-middle text-sm">
                            {formatDate(withdrawal.withdrawal_date)}
                          </td>
                          <td className="p-4 align-middle text-sm text-muted-foreground max-w-[400px]">
                            <span className="line-clamp-2">{withdrawal.notes || '—'}</span>
                          </td>
                          <td className="p-4 align-middle text-right">
                            <span className="font-bold text-green-600">
                              {formatCurrency(withdrawal.amount)}
                            </span>
                          </td>
                          <td className="p-4 align-middle text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(withdrawal.id)}
                              disabled={deleteWithdrawal.isPending}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={withdrawals.length}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {summary && (
        <WithdrawalModal
          open={withdrawalModalOpen}
          onClose={() => setWithdrawalModalOpen(false)}
          availableAmount={summary.withdrawableProfit}
        />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Withdrawal"
        description="Are you sure you want to delete this withdrawal? This action cannot be undone."
        isLoading={deleteWithdrawal.isPending}
      />
    </div>
  );
}
