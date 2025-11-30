"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Using native select since shadcn select is not installed
import { AlertCircle, ArrowRight, Info } from "lucide-react";
import {
  WalletType,
  TripBalances,
  validateTransfer,
  calculateTransferImpact,
  getWalletLabel,
  getAvailableBalance,
  isTransferAllowed,
} from "@/lib/calculations/transfers";
import { useCreateWalletTransfer } from "@/hooks/use-wallet-transfers";

interface WalletTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: {
    id: string;
    name: string;
    trip_reserve_balance: number;
    operating_account: number;
    business_account: number;
  };
}

const walletOptions: { value: WalletType; label: string }[] = [
  { value: "trip_reserve", label: "Trip Reserve" },
  { value: "trip_balance", label: "Trip Balance" },
  { value: "business_account", label: "Business Account" },
];

export function WalletTransferModal({
  open,
  onOpenChange,
  trip,
}: WalletTransferModalProps) {
  const [fromWallet, setFromWallet] = useState<WalletType | "">("");
  const [toWallet, setToWallet] = useState<WalletType | "">("");
  const [amount, setAmount] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const createTransfer = useCreateWalletTransfer();

  const currentBalances: TripBalances = {
    trip_reserve_balance: trip.trip_reserve_balance,
    operating_account: trip.operating_account,
    business_account: trip.business_account,
  };

  // Available "To" options based on "From" selection
  const toWalletOptions = useMemo(() => {
    if (!fromWallet) return [];
    return walletOptions.filter(
      (opt) =>
        opt.value !== fromWallet &&
        opt.value !== "trip_reserve" && // Cannot transfer TO reserve
        isTransferAllowed(fromWallet, opt.value)
    );
  }, [fromWallet]);

  // Calculate available balance and validation
  const validation = useMemo(() => {
    if (!fromWallet || !toWallet || !amount) {
      return { isValid: false, error: undefined, availableBalance: 0 };
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return { isValid: false, error: "Invalid amount", availableBalance: 0 };
    }

    return validateTransfer(
      fromWallet as WalletType,
      toWallet as WalletType,
      numAmount,
      currentBalances
    );
  }, [fromWallet, toWallet, amount, currentBalances]);

  // Calculate impact preview
  const impact = useMemo(() => {
    if (!fromWallet || !toWallet || !amount || !validation.isValid) {
      return null;
    }

    const numAmount = parseFloat(amount);
    return calculateTransferImpact(
      fromWallet as WalletType,
      toWallet as WalletType,
      numAmount,
      currentBalances
    );
  }, [fromWallet, toWallet, amount, validation.isValid, currentBalances]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid || !fromWallet || !toWallet) return;
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!fromWallet || !toWallet) return;

    try {
      await createTransfer.mutateAsync({
        tripId: trip.id,
        from_wallet: fromWallet as WalletType,
        to_wallet: toWallet as WalletType,
        amount: parseFloat(amount),
      });

      // Reset form and close
      setFromWallet("");
      setToWallet("");
      setAmount("");
      setShowConfirmation(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Transfer failed:", error);
      // Error handling is done by the mutation
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handleClose = () => {
    setFromWallet("");
    setToWallet("");
    setAmount("");
    setShowConfirmation(false);
    onOpenChange(false);
  };

  if (showConfirmation && impact) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Transfer</DialogTitle>
            <DialogDescription>{trip.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Transfer Summary */}
            <div className="flex items-center justify-center gap-3 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">{getWalletLabel(fromWallet as WalletType)}</div>
                <div className="text-2xl font-bold">₹{amount}</div>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <div className="text-center">
                <div className="text-sm text-muted-foreground">{getWalletLabel(toWallet as WalletType)}</div>
                <div className="text-2xl font-bold">₹{amount}</div>
              </div>
            </div>

            {/* Impact Details */}
            <div className="space-y-2">
              <h4 className="font-medium">Impact:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    {getWalletLabel(fromWallet as WalletType)} will reduce to{" "}
                    <strong>₹{impact.newBalances[fromWallet === "trip_balance" ? "operating_account" : fromWallet === "trip_reserve" ? "trip_reserve_balance" : "business_account"].toFixed(2)}</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    {getWalletLabel(toWallet as WalletType)} will increase to{" "}
                    <strong>₹{impact.newBalances[toWallet === "trip_balance" ? "operating_account" : "business_account"].toFixed(2)}</strong>
                  </span>
                </li>
                {impact.profitChange !== 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>
                      Trip Profit Potential will {impact.profitChange < 0 ? "reduce" : "increase"} by{" "}
                      <strong className={impact.profitChange < 0 ? "text-red-600" : "text-green-600"}>
                        ₹{Math.abs(impact.profitChange).toFixed(2)}
                      </strong>
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* Warning */}
            {impact.warning && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-900">{impact.warning}</p>
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

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transfer Money Between Wallets</DialogTitle>
          <DialogDescription>{trip.name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* From Wallet */}
          <div className="space-y-2">
            <Label htmlFor="from-wallet">From Wallet</Label>
            <select
              id="from-wallet"
              value={fromWallet}
              onChange={(e) => {
                setFromWallet(e.target.value as WalletType);
                setToWallet(""); // Reset to wallet when from changes
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select source wallet</option>
              {walletOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} (₹{getAvailableBalance(option.value, currentBalances).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* To Wallet */}
          <div className="space-y-2">
            <Label htmlFor="to-wallet">To Wallet</Label>
            <select
              id="to-wallet"
              value={toWallet}
              onChange={(e) => setToWallet(e.target.value as WalletType)}
              disabled={!fromWallet}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select destination wallet</option>
              {toWalletOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {!fromWallet && (
              <p className="text-xs text-muted-foreground">Select a source wallet first</p>
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
              disabled={!fromWallet || !toWallet}
            />
            {fromWallet && (
              <p className="text-xs text-muted-foreground">
                Available: ₹{validation.availableBalance.toFixed(2)}
              </p>
            )}
            {validation.error && (
              <p className="text-xs text-red-600">{validation.error}</p>
            )}
          </div>

          {/* Impact Preview */}
          {impact && (
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Profit Impact:</strong>{" "}
                    {impact.profitChange === 0 ? (
                      <span className="text-green-600">No change</span>
                    ) : (
                      <span className={impact.profitChange < 0 ? "text-red-600" : "text-green-600"}>
                        {impact.profitChange < 0 ? "-" : "+"}₹{Math.abs(impact.profitChange).toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!validation.isValid}
          >
            Review Transfer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
