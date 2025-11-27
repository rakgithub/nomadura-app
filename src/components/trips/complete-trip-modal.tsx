"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, Lock, Unlock } from "lucide-react";
import { useCompleteTrip } from "@/hooks/use-complete-trip";
import { useRouter } from "next/navigation";

interface CompleteTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: {
    id: string;
    name: string;
    total_advance_received: number;
    trip_reserve_balance: number;
    operating_account: number;
    business_account: number;
  };
  totalExpenses: number;
  hasNoExpenses: boolean;
  isOverspent: boolean;
}

export function CompleteTripModal({
  open,
  onOpenChange,
  trip,
  totalExpenses,
  hasNoExpenses,
  isOverspent,
}: CompleteTripModalProps) {
  const router = useRouter();
  const completeTrip = useCompleteTrip();
  const [showConfirm, setShowConfirm] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  const remainingTripSpend = Math.max(0, trip.operating_account);
  const finalProfit = trip.trip_reserve_balance + remainingTripSpend;

  const handleConfirm = async () => {
    try {
      const result = await completeTrip.mutateAsync(trip.id);

      // Show success and close modal
      onOpenChange(false);

      // Optionally show a success toast/notification here
      // toast.success(result.message);
    } catch (error) {
      // Error is handled by the mutation
      console.error("Failed to complete trip:", error);
    }
  };

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Complete Trip?</DialogTitle>
          <DialogDescription>
            {trip.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warnings */}
          {hasNoExpenses && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-900">
                <p className="font-medium">No expenses added</p>
                <p className="text-xs mt-1">
                  You haven't added any expenses for this trip. The entire trip budget will become profit.
                </p>
              </div>
            </div>
          )}

          {isOverspent && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium">Trip exceeded budget</p>
                <p className="text-xs mt-1">
                  This trip exceeded the planned trip budget. Extra expenses were deducted from your Business Balance.
                </p>
              </div>
            </div>
          )}

          {/* Financial Summary */}
          <div className="space-y-3 border rounded-lg p-4 bg-slate-50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Advance Received</span>
              <span className="font-semibold">{formatCurrency(trip.total_advance_received)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Trip Expenses</span>
              <span className="font-semibold text-red-600">{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-blue-600" />
                Trip Reserve
              </span>
              <span className="font-semibold text-blue-600">{formatCurrency(trip.trip_reserve_balance)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Remaining Trip Spend</span>
              <span className="font-semibold text-green-600">{formatCurrency(remainingTripSpend)}</span>
            </div>
          </div>

          {/* Final Profit */}
          <div className="border-2 border-amber-200 rounded-lg p-4 bg-amber-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-700" />
                <span className="text-sm font-medium text-amber-900">Final Profit Release</span>
              </div>
              <div className="text-2xl font-bold text-amber-700">
                {formatCurrency(finalProfit)}
              </div>
            </div>
            <p className="text-xs text-amber-700 mt-2">
              This amount will be added to your Profit Wallet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Formula: Trip Reserve + Remaining Trip Spend
            </p>
          </div>

          {/* Confirmation checkbox for final step */}
          {showConfirm && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Unlock className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-900">
                <p className="font-medium">This action cannot be undone</p>
                <p className="text-xs mt-1">
                  Once completed, the trip will become read-only and no further edits can be made.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowConfirm(false);
              onOpenChange(false);
            }}
            disabled={completeTrip.isPending}
          >
            Cancel
          </Button>
          {!showConfirm ? (
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={completeTrip.isPending}
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleConfirm}
              disabled={completeTrip.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {completeTrip.isPending ? "Completing..." : "Confirm Completion"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
