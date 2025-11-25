"use client";

import { useFinancialSummary, FinancialPeriod } from "@/hooks/use-financial-summary";
import { BusinessRevenueCard } from "./business-revenue-card";
import { OperatingAccountCard } from "./operating-account-card";
import { WithdrawableProfitCard } from "./withdrawable-profit-card";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error";

interface FinancialSummaryProps {
  onWithdraw?: () => void;
  period?: FinancialPeriod;
}

export function FinancialSummary({ onWithdraw, period = "all" }: FinancialSummaryProps) {
  const { data: summary, isLoading, error, refetch } = useFinancialSummary(period);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <BusinessRevenueCard
        revenue={summary.businessRevenue}
        profitPool={summary.profitPool}
        operatingPool={summary.operatingPool}
      />
      <OperatingAccountCard
        balance={summary.operatingAccount}
        operatingPool={summary.operatingPool}
        totalExpenses={summary.totalExpenses}
        status={summary.operatingStatus}
      />
      <WithdrawableProfitCard
        amount={summary.withdrawableProfit}
        profitPool={summary.profitPool}
        totalWithdrawals={summary.totalWithdrawals}
        onWithdraw={onWithdraw}
      />
    </div>
  );
}
