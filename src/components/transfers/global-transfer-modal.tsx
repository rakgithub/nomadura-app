"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ArrowRight, Info } from "lucide-react";
import {
  GlobalBucket,
  GlobalBalances,
  validateGlobalTransfer,
  calculateGlobalTransferImpact,
  getGlobalBucketLabel,
  getGlobalBucketDescription,
  getAllowedDestinations,
  getGlobalBucketBalance,
  formatCurrency,
} from "@/lib/calculations/global-transfers";
import { useCreateGlobalTransfer } from "@/hooks/use-global-transfers";

interface GlobalTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalances: GlobalBalances;
}

const sourceBuckets: GlobalBucket[] = [
  "profit_withdrawable",
  "business_account",
  "trip_balances",
  "trip_reserves",
];

export function GlobalTransferModal({
  open,
  onOpenChange,
  currentBalances,
}: GlobalTransferModalProps) {
  const [fromBucket, setFromBucket] = useState<GlobalBucket | "">("");
  const [toBucket, setToBucket] = useState<GlobalBucket | "">("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const createTransfer = useCreateGlobalTransfer();

  // Available "To" buckets based on "From" selection
  const toBucketOptions = useMemo(() => {
    if (!fromBucket) return [];
    return getAllowedDestinations(fromBucket);
  }, [fromBucket]);

  // Calculate available balance and validation
  const validation = useMemo(() => {
    if (!fromBucket || !toBucket || !amount) {
      return {
        isValid: false,
        error: undefined,
        availableBalance: fromBucket
          ? getGlobalBucketBalance(fromBucket, currentBalances)
          : 0,
      };
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return {
        isValid: false,
        error: "Invalid amount",
        availableBalance: getGlobalBucketBalance(fromBucket, currentBalances),
      };
    }

    return validateGlobalTransfer(
      fromBucket as GlobalBucket,
      toBucket as GlobalBucket,
      numAmount,
      currentBalances
    );
  }, [fromBucket, toBucket, amount, currentBalances]);

  // Calculate impact preview
  const impact = useMemo(() => {
    if (!fromBucket || !toBucket || !amount || !validation.isValid) {
      return null;
    }

    const numAmount = parseFloat(amount);
    return calculateGlobalTransferImpact(
      fromBucket as GlobalBucket,
      toBucket as GlobalBucket,
      numAmount,
      currentBalances
    );
  }, [fromBucket, toBucket, amount, validation.isValid, currentBalances]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid || !fromBucket || !toBucket) return;
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!fromBucket || !toBucket) return;

    try {
      await createTransfer.mutateAsync({
        from_bucket: fromBucket as GlobalBucket,
        to_bucket: toBucket as GlobalBucket,
        amount: parseFloat(amount),
        notes: notes || undefined,
      });

      // Reset form and close
      setFromBucket("");
      setToBucket("");
      setAmount("");
      setNotes("");
      setShowConfirmation(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Transfer failed:", error);
      // Error is handled by the mutation
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handleClose = () => {
    setFromBucket("");
    setToBucket("");
    setAmount("");
    setNotes("");
    setShowConfirmation(false);
    onOpenChange(false);
  };

  // Confirmation view
  if (showConfirmation && impact) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Transfer</DialogTitle>
            <DialogDescription>
              Review the transfer details and impact
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Transfer Summary */}
            <div className="flex items-center justify-center gap-3 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  {getGlobalBucketLabel(fromBucket as GlobalBucket)}
                </div>
                <div className="text-2xl font-bold">{formatCurrency(parseFloat(amount))}</div>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  {getGlobalBucketLabel(toBucket as GlobalBucket)}
                </div>
                <div className="text-2xl font-bold">{formatCurrency(parseFloat(amount))}</div>
              </div>
            </div>

            {/* Impact Description */}
            <div className="space-y-2">
              <h4 className="font-medium">Impact:</h4>
              <p className="text-sm text-muted-foreground">
                {impact.impactDescription}
              </p>
            </div>

            {/* Balance Changes */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Balance Changes:</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">
                    {getGlobalBucketLabel(fromBucket as GlobalBucket)}:
                  </span>
                  <span>
                    {formatCurrency(currentBalances[fromBucket as GlobalBucket])} →{" "}
                    <strong>
                      {formatCurrency(impact.newBalances[fromBucket as GlobalBucket])}
                    </strong>
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">
                    {getGlobalBucketLabel(toBucket as GlobalBucket)}:
                  </span>
                  <span>
                    {formatCurrency(currentBalances[toBucket as GlobalBucket])} →{" "}
                    <strong>
                      {formatCurrency(impact.newBalances[toBucket as GlobalBucket])}
                    </strong>
                  </span>
                </li>
              </ul>
            </div>

            {/* Warning */}
            {impact.warning && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-900">{impact.warning}</p>
              </div>
            )}

            {/* Notes */}
            {notes && (
              <div className="text-sm">
                <span className="font-medium">Notes: </span>
                <span className="text-muted-foreground">{notes}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={createTransfer.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1"
              disabled={createTransfer.isPending}
            >
              {createTransfer.isPending ? "Processing..." : "Confirm Transfer"}
            </Button>
          </div>

          {createTransfer.isError && (
            <p className="text-sm text-red-600">
              {createTransfer.error?.message || "Transfer failed"}
            </p>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Transfer form view
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transfer Money</DialogTitle>
          <DialogDescription>
            Move money between your financial buckets
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* From Bucket */}
          <div className="space-y-2">
            <Label htmlFor="from-bucket">From</Label>
            <select
              id="from-bucket"
              value={fromBucket}
              onChange={(e) => {
                setFromBucket(e.target.value as GlobalBucket);
                setToBucket(""); // Reset to bucket when from changes
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select source bucket</option>
              {sourceBuckets.map((bucket) => (
                <option key={bucket} value={bucket}>
                  {getGlobalBucketLabel(bucket)} (
                  {formatCurrency(getGlobalBucketBalance(bucket, currentBalances))})
                </option>
              ))}
            </select>
            {fromBucket && (
              <p className="text-xs text-muted-foreground">
                {getGlobalBucketDescription(fromBucket)}
              </p>
            )}
          </div>

          {/* To Bucket */}
          <div className="space-y-2">
            <Label htmlFor="to-bucket">To</Label>
            <select
              id="to-bucket"
              value={toBucket}
              onChange={(e) => setToBucket(e.target.value as GlobalBucket)}
              disabled={!fromBucket || toBucketOptions.length === 0}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select destination bucket</option>
              {toBucketOptions.map((bucket) => (
                <option key={bucket} value={bucket}>
                  {getGlobalBucketLabel(bucket)}
                </option>
              ))}
            </select>
            {!fromBucket && (
              <p className="text-xs text-muted-foreground">
                Select a source bucket first
              </p>
            )}
            {toBucket && (
              <p className="text-xs text-muted-foreground">
                {getGlobalBucketDescription(toBucket)}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!fromBucket || !toBucket}
            />
            {fromBucket && (
              <p className="text-xs text-muted-foreground">
                Available: {formatCurrency(validation.availableBalance)}
              </p>
            )}
            {validation.error && (
              <p className="text-xs text-red-600">{validation.error}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this transfer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Impact Preview */}
          {impact && (
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">
                    {impact.impactDescription}
                  </p>
                  {impact.warning && (
                    <p className="text-amber-700 font-medium">{impact.warning}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!validation.isValid}>
            Review Transfer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
