"use client";

import { useFinancialSummary, FinancialPeriod } from "@/hooks/use-financial-summary";
import { BankBalanceCard } from "./bank-balance-card";
import { ProfitCard } from "./profit-card";
import { TripReservesCard } from "./trip-reserves-card";
import { BusinessAccountCard } from "./business-account-card";
import { TripBalancesCard } from "./trip-balances-card";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error";

interface FinancialSummaryProps {
  period?: FinancialPeriod;
}

export function FinancialSummary({ period = "all" }: FinancialSummaryProps) {
  const { data: summary, isLoading, error, refetch } = useFinancialSummary(period);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Loading />
        <Loading />
        <Loading />
        <Loading />
        <Loading />
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        message="Failed to load financial summary"
        retry={refetch}
      />
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Primary Financial Cards - Five-Bucket Model + Trip Money Flow */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Bank Balance - Total cash */}
        <BankBalanceCard
          bankBalance={summary.bankBalance}
          totalAdvanceReceived={summary.totalAdvanceReceived}
          earnedRevenue={summary.earnedRevenue}
        />

        {/* Total Profit - From completed trips */}
        <ProfitCard
          profit={summary.profit || 0}
          withdrawableProfit={summary.withdrawableProfit || 0}
          totalWithdrawals={summary.totalWithdrawals || 0}
        />

        {/* Business Balance - Global business budget */}
        <BusinessAccountCard
          balance={summary.businessBalance || summary.businessAccount || 0}
          businessExpenses={summary.businessExpenses}
        />

        {/* Trip Balances - Active trip budgets */}
        <TripBalancesCard
          balance={summary.tripBalances || 0}
          tripCount={summary.activeTripsCount || 0}
          tripExpenses={summary.tripExpenses || 0}
        />

        {/* Upcoming Locked Reserve - Will convert to profit */}
        <TripReservesCard
          amount={summary.upcomingLockedReserve ?? summary.tripReserve ?? 0}
        />
      </div>
    </div>
  );
}
