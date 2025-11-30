"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loading } from "@/components/ui/loading";
import { ArrowRight, TrendingDown, TrendingUp, MinusCircle } from "lucide-react";
import { useWalletTransfers } from "@/hooks/use-wallet-transfers";
import { getWalletLabel } from "@/lib/calculations/transfers";

interface WalletTransferHistoryProps {
  tripId: string;
}

export function WalletTransferHistory({ tripId }: WalletTransferHistoryProps) {
  const { data: transfers, isLoading, error } = useWalletTransfers(tripId);

  if (isLoading) {
    return <Loading className="min-h-[200px]" />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-red-600">Failed to load transfer history</p>
        </CardContent>
      </Card>
    );
  }

  if (!transfers || transfers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No transfers yet"
            description="Wallet transfers will appear here when you move money between Trip Reserve, Trip Balance, and Business Account."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transfers.map((transfer) => (
            <div
              key={transfer.id}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {/* Transfer direction */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{getWalletLabel(transfer.from_wallet)}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{getWalletLabel(transfer.to_wallet)}</span>
                  </div>

                  {/* Note */}
                  <p className="text-sm text-muted-foreground">{transfer.note}</p>

                  {/* Date */}
                  <p className="text-xs text-muted-foreground">
                    {new Date(transfer.transfer_date).toLocaleString()}
                  </p>
                </div>

                {/* Amount and impact badge */}
                <div className="text-right space-y-2">
                  <div className="text-lg font-bold">₹{Number(transfer.amount).toFixed(2)}</div>
                  <ImpactBadge impactType={transfer.impact_type} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ImpactBadge({ impactType }: { impactType: string }) {
  switch (impactType) {
    case "borrowed_from_reserve":
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
          <TrendingDown className="h-3 w-3" />
          Profit Reduced
        </div>
      );

    case "reduced_trip_balance":
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
          <TrendingDown className="h-3 w-3" />
          Profit May Reduce
        </div>
      );

    case "business_subsidy":
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
          <MinusCircle className="h-3 w-3" />
          No Profit Impact
        </div>
      );

    case "added_to_trip_balance":
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
          <TrendingUp className="h-3 w-3" />
          Added Funds
        </div>
      );

    default:
      return null;
  }
}
