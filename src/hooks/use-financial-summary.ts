"use client";

import { useQuery } from "@tanstack/react-query";
import { FinancialSummary } from "@/types/financial";

export type FinancialPeriod = "this_month" | "last_month" | "this_year" | "last_year" | "all";

async function fetchFinancialSummary(period: FinancialPeriod): Promise<FinancialSummary> {
  const params = new URLSearchParams();
  if (period !== "all") {
    params.append("period", period);
  }

  const url = `/api/dashboard/summary${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch financial summary");
  return res.json();
}

/**
 * Hook to fetch financial summary with fund separation calculations.
 *
 * Returns the 30/70 split breakdown:
 * - Business revenue (total income)
 * - Profit pool (30%)
 * - Operating pool (70%)
 * - Operating account (70% - expenses)
 * - Withdrawable profit (30% - withdrawals)
 *
 * @param period - Time period to filter data (default: "all")
 */
export function useFinancialSummary(period: FinancialPeriod = "all") {
  return useQuery({
    queryKey: ["financial-summary", period],
    queryFn: () => fetchFinancialSummary(period),
  });
}
