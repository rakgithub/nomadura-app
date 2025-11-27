"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateBusinessExpense,
  businessExpenseCategoryLabels,
} from "@/hooks/use-business-expenses";
import { useFinancialSummary } from "@/hooks/use-financial-summary";
import { BusinessExpenseCategory } from "@/types/database";
import { AlertTriangle, Wallet } from "lucide-react";

interface BusinessExpenseModalProps {
  open: boolean;
  onClose: () => void;
}

export function BusinessExpenseModal({
  open,
  onClose,
}: BusinessExpenseModalProps) {
  const [category, setCategory] = useState<BusinessExpenseCategory>("rent");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [warningData, setWarningData] = useState<{
    availableOperatingCash: number;
    expenseAmount: number;
    shortfall?: number;
    reserveRequirement?: number;
    currentBankBalance?: number;
    newBankBalance?: number;
    reserveShortfall?: number;
  } | null>(null);

  const createExpense = useCreateBusinessExpense();
  const { data: financialSummary } = useFinancialSummary("all");

  const canAddExpense = financialSummary && financialSummary.operatingAccount > 0;

  const handleSubmit = async (e: React.FormEvent, ignoreWarning = false) => {
    e.preventDefault();
    setError("");

    // Check if funds are available
    if (!canAddExpense) {
      setError("No funds available in Operating Account. Cannot add business expense.");
      return;
    }

    const amountNum = parseFloat(amount);

    // Validation
    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    try {
      await createExpense.mutateAsync({
        category,
        description: description.trim(),
        amount: amountNum,
        expense_date: expenseDate,
        notes: notes.trim() || undefined,
        ignoreWarning,
      });

      // Reset form and close
      resetForm();
      onClose();
    } catch (err: any) {
      // Check if this is a warning response (NEW: includes reserve shortfall data)
      if (err.response?.data?.warning) {
        const data = err.response.data;
        setWarningData({
          availableOperatingCash: data.availableOperatingCash,
          expenseAmount: data.expenseAmount,
          shortfall: data.shortfall,
          reserveRequirement: data.reserveRequirement,
          currentBankBalance: data.currentBankBalance,
          newBankBalance: data.newBankBalance,
          reserveShortfall: data.reserveShortfall,
        });
        setShowWarning(true);
        return;
      }

      setError(
        err instanceof Error ? err.message : "Failed to create business expense"
      );
    }
  };

  const handleProceedAnyway = async () => {
    setShowWarning(false);
    // Create a fake event to trigger handleSubmit with ignoreWarning=true
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    await handleSubmit(fakeEvent, true);
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setNotes("");
    setCategory("rent");
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setError("");
    setShowWarning(false);
    setWarningData(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleClose = () => {
    if (!createExpense.isPending) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogHeader onClose={handleClose}>Add Business Expense</DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            {/* Operating Account Balance Display */}
            {financialSummary && (
              <div className={`p-4 border rounded-lg ${
                canAddExpense
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                  : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    canAddExpense ? 'bg-blue-100' : 'bg-red-100'
                  }`}>
                    <Wallet className={`h-5 w-5 ${
                      canAddExpense ? 'text-blue-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-medium mb-1 ${
                      canAddExpense ? 'text-blue-700' : 'text-red-700'
                    }`}>
                      Available for Business Expenses
                    </p>
                    <p className={`text-2xl font-bold ${
                      canAddExpense ? 'text-blue-900' : 'text-red-900'
                    }`}>
                      {formatCurrency(financialSummary.operatingAccount)}
                    </p>
                    <p className={`text-xs mt-1 ${
                      canAddExpense ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {canAddExpense
                        ? 'Operating Account Balance'
                        : 'No funds available - Cannot add expenses'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as BusinessExpenseCategory)
                  }
                  disabled={createExpense.isPending}
                  required
                >
                  {Object.entries(businessExpenseCategoryLabels).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={createExpense.isPending}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                type="text"
                placeholder="e.g., Office rent for November"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={createExpense.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense_date">Date *</Label>
              <Input
                id="expense_date"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                disabled={createExpense.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Optional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={createExpense.isPending}
              />
            </div>
          </div>
        </DialogContent>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createExpense.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createExpense.isPending || !canAddExpense}
          >
            {createExpense.isPending ? "Adding..." : "Add Expense"}
          </Button>
        </DialogFooter>
      </form>

      {/* Warning Dialog - NEW: Shows Reserve Shortfall */}
      {warningData && (
        <ConfirmDialog
          open={showWarning}
          onClose={() => setShowWarning(false)}
          onConfirm={handleProceedAnyway}
          title="⚠️ Reserve Shortfall Warning"
          description={
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-md">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 mb-2">
                    This expense will cause a reserve shortfall!
                  </p>
                  <p className="text-sm text-red-800">
                    You won't have enough money in the bank to cover upcoming trip obligations.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Required Trip Reserves:</span>
                  <span className="font-semibold">
                    {formatCurrency(warningData.reserveRequirement || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Current Bank Balance:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(warningData.currentBankBalance || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Expense Amount:</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(warningData.expenseAmount)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">New Bank Balance:</span>
                  <span className="font-semibold text-orange-600">
                    {formatCurrency(warningData.newBankBalance || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2 bg-red-50 px-3 rounded">
                  <span className="font-medium text-red-800">Reserve Shortfall:</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(warningData.reserveShortfall || 0)}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <p className="text-sm text-amber-900">
                  <strong>What this means:</strong> You'll be short by {formatCurrency(warningData.reserveShortfall || 0)} to safely deliver all upcoming trips.
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Only proceed if you're expecting more advance payments soon or have other funding sources.
              </p>
            </div>
          }
          confirmText="Proceed Anyway"
          cancelText="Cancel"
          variant="destructive"
          isLoading={createExpense.isPending}
        />
      )}
    </Dialog>
  );
}
