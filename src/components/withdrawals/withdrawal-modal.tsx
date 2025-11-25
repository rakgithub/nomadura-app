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
import { useCreateWithdrawal } from "@/hooks/use-withdrawals";

interface WithdrawalModalProps {
  open: boolean;
  onClose: () => void;
  availableAmount: number;
}

export function WithdrawalModal({
  open,
  onClose,
  availableAmount,
}: WithdrawalModalProps) {
  const [amount, setAmount] = useState("");
  const [withdrawalDate, setWithdrawalDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const createWithdrawal = useCreateWithdrawal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amountNum = parseFloat(amount);

    // Validation
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if (amountNum > availableAmount) {
      setError(
        `Amount exceeds available profit ($${availableAmount.toFixed(2)})`
      );
      return;
    }

    try {
      await createWithdrawal.mutateAsync({
        amount: amountNum,
        withdrawal_date: withdrawalDate,
        notes: notes || undefined,
      });

      // Reset form and close
      setAmount("");
      setNotes("");
      setWithdrawalDate(new Date().toISOString().split("T")[0]);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create withdrawal"
      );
    }
  };

  const handleClose = () => {
    if (!createWithdrawal.isPending) {
      setError("");
      setAmount("");
      setNotes("");
      setWithdrawalDate(new Date().toISOString().split("T")[0]);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogHeader onClose={handleClose}>Withdraw Profit</DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                Available to withdraw:{" "}
                <span className="font-bold">
                  ${availableAmount.toFixed(2)}
                </span>
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={availableAmount}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={createWithdrawal.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdrawal_date">Date *</Label>
              <Input
                id="withdrawal_date"
                type="date"
                value={withdrawalDate}
                onChange={(e) => setWithdrawalDate(e.target.value)}
                required
                disabled={createWithdrawal.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Optional notes about this withdrawal"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={createWithdrawal.isPending}
              />
            </div>
          </div>
        </DialogContent>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createWithdrawal.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createWithdrawal.isPending}>
            {createWithdrawal.isPending ? "Processing..." : "Withdraw"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
