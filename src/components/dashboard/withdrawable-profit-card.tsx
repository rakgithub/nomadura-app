"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WithdrawableProfitCardProps {
  amount: number;
  profitPool: number;
  totalWithdrawals: number;
  onWithdraw?: () => void;
}

export function WithdrawableProfitCard({
  amount,
  profitPool,
  totalWithdrawals,
  onWithdraw,
}: WithdrawableProfitCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  const isWithdrawable = amount > 0;
  const withdrawnPercentage =
    profitPool > 0 ? (totalWithdrawals / profitPool) * 100 : 0;
  const availablePercentage = 100 - withdrawnPercentage;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Withdrawable Profit</CardTitle>
        <CardDescription className="text-xs">Your available profit (30% pool)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold text-green-600">
          {formatCurrency(amount)}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Profit Pool (30%)
            </span>
            <span className="text-sm font-semibold">
              {formatCurrency(profitPool)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Total Withdrawn
            </span>
            <span className="text-sm font-semibold text-red-600">
              {formatCurrency(totalWithdrawals)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Available</span>
            <span className="text-sm font-semibold text-green-600">
              {availablePercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Visual bar showing available vs withdrawn */}
        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="bg-green-500"
            style={{ width: `${Math.max(0, availablePercentage)}%` }}
          />
        </div>

        {!isWithdrawable && (
          <p className="text-xs text-muted-foreground text-center">
            Generate more revenue or reduce expenses to increase profit
          </p>
        )}
      </CardContent>
    </Card>
  );
}
