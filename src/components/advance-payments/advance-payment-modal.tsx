"use client";

import { useState } from "react";
import { useCreateAdvancePayment } from "@/hooks/use-advance-payments";
import { useSettings } from "@/hooks/use-settings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";

interface AdvancePaymentModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  tripName: string;
  participantId?: string;
}

export function AdvancePaymentModal({
  open,
  onClose,
  tripId,
  tripName,
  participantId,
}: AdvancePaymentModalProps) {
  const createAdvancePayment = useCreateAdvancePayment();
  const { data: settings } = useSettings();

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");

  const tripReservePercentage = settings?.trip_reserve_percentage ?? 60;
  const earlyUnlockPercentage = settings?.early_unlock_percentage ?? 20;
  const lockedPercentage = settings?.locked_percentage ?? 20;

  const amountNum = parseFloat(amount) || 0;
  const tripReserveAmount = (amountNum * tripReservePercentage) / 100;
  const earlyUnlockAmount = (amountNum * earlyUnlockPercentage) / 100;
  const lockedAmount = (amountNum * lockedPercentage) / 100;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amountNum <= 0) {
      return;
    }

    try {
      await createAdvancePayment.mutateAsync({
        trip_id: tripId,
        participant_id: participantId,
        amount: amountNum,
        payment_date: paymentDate,
        notes: notes || null,
      });

      // Reset form and close
      setAmount("");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      onClose();
    } catch (error) {
      console.error("Failed to create advance payment:", error);
    }
  };

  const handleClose = () => {
    if (!createAdvancePayment.isPending) {
      setAmount("");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Advance Payment</DialogTitle>
          <DialogDescription>
            Record a customer advance payment for {tripName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount Received *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
              disabled={createAdvancePayment.isPending}
            />
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="payment-date">Payment Date *</Label>
            <Input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              disabled={createAdvancePayment.isPending}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this payment..."
              rows={3}
              disabled={createAdvancePayment.isPending}
            />
          </div>

          {/* Automatic Split Preview */}
          {amountNum > 0 && (
            <div className="p-4 bg-muted rounded-md space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-sm">Automatic Split Breakdown</h4>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Trip Reserve ({tripReservePercentage}%)
                  </span>
                  <span className="font-medium text-blue-600">
                    {formatCurrency(tripReserveAmount)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pl-4">
                  Protected for trip expenses only
                </p>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-muted-foreground">
                    Early Unlock ({earlyUnlockPercentage}%)
                  </span>
                  <span className="font-medium" style={{ color: "#9CBB04" }}>
                    {formatCurrency(earlyUnlockAmount)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pl-4">
                  Moves to Operating Account immediately
                </p>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-muted-foreground">
                    Locked ({lockedPercentage}%)
                  </span>
                  <span className="font-medium text-amber-600">
                    {formatCurrency(lockedAmount)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pl-4">
                  Unlocks when trip completes
                </p>
              </div>

              <div className="pt-3 border-t">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(amountNum)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {createAdvancePayment.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                {(createAdvancePayment.error as Error)?.message ||
                  "Failed to record advance payment"}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createAdvancePayment.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={amountNum <= 0 || createAdvancePayment.isPending}
            >
              {createAdvancePayment.isPending
                ? "Recording..."
                : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
