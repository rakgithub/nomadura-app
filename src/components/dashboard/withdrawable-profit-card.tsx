"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleDollarSign } from "lucide-react";

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
    return new Intl.NumberFormat("en-IN", {
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Withdrawable Profit</CardTitle>
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <CircleDollarSign className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(amount)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Available profit (30% pool)
          </p>
        </div>

        {/* Breakdown */}
        <div className="pt-3 border-t space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Profit Pool (30%)</span>
            <span className="font-medium">{formatCurrency(profitPool)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Withdrawn</span>
            <span className="font-medium text-red-600">{formatCurrency(totalWithdrawals)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
