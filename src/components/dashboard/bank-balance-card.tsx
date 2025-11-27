"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

interface BankBalanceCardProps {
  bankBalance: number;
  totalAdvanceReceived: number;
  earnedRevenue: number;
}

export function BankBalanceCard({
  bankBalance,
  totalAdvanceReceived,
  earnedRevenue,
}: BankBalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Bank Balance</CardTitle>
          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-yellow-700" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-3xl font-bold text-yellow-700">
            {formatCurrency(bankBalance)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Actual money in the bank
          </p>
        </div>

        {/* Breakdown */}
        <div className="pt-3 border-t space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Advance Received</span>
            <span className="font-semibold">{formatCurrency(totalAdvanceReceived)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Earned Revenue</span>
            <span className="font-semibold">{formatCurrency(earnedRevenue)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
