"use client";

import { useState } from "react";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { TripStats } from "@/components/dashboard/trip-stats";
import { WithdrawalModal } from "@/components/withdrawals/withdrawal-modal";
import { useFinancialSummary, FinancialPeriod } from "@/hooks/use-financial-summary";

interface DashboardContentProps {
  userEmail: string;
}

const periodLabels: Record<FinancialPeriod, string> = {
  this_month: "This Month",
  last_month: "Last Month",
  this_year: "This Year",
  last_year: "Last Year",
  all: "All Time",
};

export function DashboardContent({ userEmail }: DashboardContentProps) {
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [financialPeriod, setFinancialPeriod] = useState<FinancialPeriod>("all");
  const { data: summary } = useFinancialSummary(financialPeriod);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        </div>

        {/* Trip Stats */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Trips Overview</h2>
          <TripStats />
        </div>

        {/* Financial Overview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Financial Overview</h2>
            <select
              value={financialPeriod}
              onChange={(e) => setFinancialPeriod(e.target.value as FinancialPeriod)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {(Object.keys(periodLabels) as FinancialPeriod[]).map((period) => (
                <option key={period} value={period}>
                  {periodLabels[period]}
                </option>
              ))}
            </select>
          </div>
          <FinancialSummary
            period={financialPeriod}
            onWithdraw={() => setWithdrawalModalOpen(true)}
          />
        </div>
      </div>

      {summary && (
        <WithdrawalModal
          open={withdrawalModalOpen}
          onClose={() => setWithdrawalModalOpen(false)}
          availableAmount={summary.withdrawableProfit}
        />
      )}
    </div>
  );
}
