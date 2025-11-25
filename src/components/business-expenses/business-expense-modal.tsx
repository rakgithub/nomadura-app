"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateBusinessExpense,
  businessExpenseCategoryLabels,
} from "@/hooks/use-business-expenses";
import { BusinessExpenseCategory } from "@/types/database";

interface BusinessExpenseModalProps {
  open: boolean;
  onClose: () => void;
}

export function BusinessExpenseModal({
  open,
  onClose,
}: BusinessExpenseModalProps) {
  const [category, setCategory] = useState<BusinessExpenseCategory>("other");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const createExpense = useCreateBusinessExpense();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
      });

      // Reset form and close
      resetForm();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create business expense"
      );
    }
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setNotes("");
    setCategory("other");
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setError("");
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
          <Button type="submit" disabled={createExpense.isPending}>
            {createExpense.isPending ? "Adding..." : "Add Expense"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
