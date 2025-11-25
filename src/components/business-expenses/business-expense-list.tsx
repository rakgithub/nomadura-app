"use client";

import {
  useBusinessExpenses,
  useDeleteBusinessExpense,
  businessExpenseCategoryLabels,
  businessExpenseCategoryColors,
} from "@/hooks/use-business-expenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { paginateArray, getTotalPages } from "@/lib/pagination";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const ITEMS_PER_PAGE = 10;

export function BusinessExpenseList() {
  const { data: expenses, isLoading, error, refetch } = useBusinessExpenses();
  const deleteExpense = useDeleteBusinessExpense();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Paginate expenses
  const paginatedExpenses = expenses
    ? paginateArray(expenses, currentPage, ITEMS_PER_PAGE)
    : [];
  const totalPages = expenses
    ? getTotalPages(expenses.length, ITEMS_PER_PAGE)
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
      await deleteExpense.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorDisplay
        message="Failed to load business expenses"
        onRetry={refetch}
      />
    );
  }

  const totalExpenses =
    expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Business Expenses</CardTitle>
            <div className="text-sm text-muted-foreground">
              Total: <span className="font-bold">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!expenses || expenses.length === 0 ? (
            <EmptyState
              message="No business expenses yet"
              description="Click 'New Business Expense' to add your first expense"
            />
          ) : (
            <>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Description</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Notes</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Amount</th>
                      <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground w-[80px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedExpenses.map((expense) => (
                      <tr key={expense.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 align-middle text-sm">
                          {formatDate(expense.expense_date)}
                        </td>
                        <td className="p-4 align-middle">
                          <span
                            className={`inline-flex px-2 py-1 rounded text-xs font-medium ${businessExpenseCategoryColors[expense.category]}`}
                          >
                            {businessExpenseCategoryLabels[expense.category]}
                          </span>
                        </td>
                        <td className="p-4 align-middle">
                          <span className="font-medium">{expense.description}</span>
                        </td>
                        <td className="p-4 align-middle text-sm text-muted-foreground max-w-[200px]">
                          <span className="line-clamp-2">{expense.notes || '—'}</span>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <span className="font-bold">
                            {formatCurrency(expense.amount)}
                          </span>
                        </td>
                        <td className="p-4 align-middle text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(expense.id)}
                            disabled={deleteExpense.isPending}
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
                  totalItems={expenses.length}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Business Expense"
        description="Are you sure you want to delete this business expense? This action cannot be undone."
        isPending={deleteExpense.isPending}
      />
    </>
  );
}
