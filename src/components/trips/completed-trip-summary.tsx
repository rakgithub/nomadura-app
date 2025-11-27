"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Lock, CheckCircle2, AlertCircle } from "lucide-react";

interface CompletedTripSummaryProps {
  finalProfit: number;
  reserveReleased: number;
  tripSpendReleased: number;
  completedAt?: string;
}

export function CompletedTripSummary({
  finalProfit,
  reserveReleased,
  tripSpendReleased,
  completedAt,
}: CompletedTripSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Trip Closed Badge */}
      <div className="flex items-center gap-2 p-4 bg-slate-100 border border-slate-200 rounded-lg">
        <Lock className="h-5 w-5 text-slate-600" />
        <div className="flex-1">
          <p className="font-semibold text-slate-900">Trip Closed</p>
          <p className="text-sm text-slate-600">
            This trip was completed on {formatDate(completedAt)}. No further updates can be made.
          </p>
        </div>
      </div>

      {/* Main Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Total Profit Released */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-amber-900">
                Total Profit Released
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-700" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">
              {formatCurrency(finalProfit)}
            </div>
            <p className="text-sm text-amber-700/80 mt-1">
              Added to your Profit Wallet
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Breakdown */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-blue-900">
              Profit Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Trip Reserve Released</span>
                <span className="font-semibold text-blue-900">
                  {formatCurrency(reserveReleased)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Unused Trip Budget</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(tripSpendReleased)}
                </span>
              </div>
              <div className="pt-2 border-t border-blue-200 flex justify-between font-semibold">
                <span className="text-blue-900">Total Profit</span>
                <span className="text-amber-600">
                  {formatCurrency(finalProfit)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Trip Status */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-green-900">
                Trip Status
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 border border-green-200 rounded-full">
                <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse"></div>
                <span className="text-sm font-semibold text-green-900">Completed</span>
              </div>
              <p className="text-sm text-green-700 mt-2">
                This trip is closed. No further updates can be made.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-900">
          <p className="font-medium">Trip financials have been finalized</p>
          <p className="text-xs mt-1">
            The profit from this trip has been released to your global Profit Wallet.
            You can view your total profit on the dashboard and withdraw it anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
