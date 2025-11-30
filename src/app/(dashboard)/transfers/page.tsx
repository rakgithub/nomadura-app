"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Plus } from "lucide-react";
import { GlobalTransferModal } from "@/components/transfers/global-transfer-modal";
import { GlobalTransferHistory } from "@/components/transfers/global-transfer-history";
import { useFinancialSummary } from "@/hooks/use-financial-summary";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error";
import { formatCurrency } from "@/lib/calculations/global-transfers";

export default function TransfersPage() {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const { data: summary, isLoading, error } = useFinancialSummary("all");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transfers</h1>
            <p className="text-muted-foreground mt-1">
              Move money between your financial buckets
            </p>
          </div>
        </div>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transfers</h1>
            <p className="text-muted-foreground mt-1">
              Move money between your financial buckets
            </p>
          </div>
        </div>
        <ErrorDisplay message="Failed to load financial data" />
      </div>
    );
  }

  const balances = {
    profit_withdrawable: summary?.withdrawableProfit || 0,
    business_account: summary?.businessAccount || summary?.businessBalance || 0,
    trip_balances: summary?.tripBalances || 0,
    trip_reserves: summary?.upcomingLockedReserve || summary?.tripReserve || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transfers</h1>
          <p className="text-muted-foreground mt-1">
            Move money between your financial buckets
          </p>
        </div>
        <Button onClick={() => setShowTransferModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Transfer
        </Button>
      </div>

      {/* Current Balances */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Profit (Withdrawable)
              </p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(balances.profit_withdrawable)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Available profit from completed trips
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Business Account
              </p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(balances.business_account)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Global business budget
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Trip Balances
              </p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(balances.trip_balances)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Spendable across {summary?.activeTripsCount || 0} active trips
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Trip Reserves
              </p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(balances.trip_reserves)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Protected reserves for active trips
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <ArrowRightLeft className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">About Transfers</p>
            <p className="text-sm text-muted-foreground">
              You can move money between buckets to manage your finances. For
              example, you can reinvest profit into trips, subsidize trips from
              business account, or move trip budgets to business expenses.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Note:</strong> You cannot transfer money TO Profit (Withdrawable) or Trip Reserves - these are outcome buckets that fill automatically.
            </p>
          </div>
        </div>
      </Card>

      {/* Transfer History */}
      <GlobalTransferHistory />

      {/* Transfer Modal */}
      {showTransferModal && (
        <GlobalTransferModal
          open={showTransferModal}
          onOpenChange={setShowTransferModal}
          currentBalances={balances}
        />
      )}
    </div>
  );
}
