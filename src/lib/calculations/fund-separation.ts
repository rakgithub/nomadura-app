import { FinancialSummary, OperatingStatus } from "@/types/financial";

/**
 * Calculates fund separation based on 30/70 split model.
 *
 * Model:
 * - 30% of revenue goes to profit pool (owner's money)
 * - 70% of revenue goes to operating pool (business expenses)
 *
 * @param totalRevenue - Total income from all participant payments
 * @param tripExpenses - Total trip-specific expenses (transport, accommodation, etc.)
 * @param businessExpenses - Total general business expenses (rent, software, etc.)
 * @param totalWithdrawals - Sum of all past withdrawals
 * @returns FinancialSummary object with all calculated metrics
 *
 * @example
 * ```typescript
 * const summary = calculateFundSeparation(10000, 4000, 1000, 500);
 * // Result:
 * // {
 * //   businessRevenue: 10000,
 * //   profitPool: 3000,        // 30% of 10000
 * //   operatingPool: 7000,     // 70% of 10000
 * //   tripExpenses: 4000,
 * //   businessExpenses: 1000,
 * //   totalExpenses: 5000,
 * //   operatingAccount: 2000,  // 7000 - 5000
 * //   operatingStatus: 'healthy',
 * //   totalWithdrawals: 500,
 * //   withdrawableProfit: 2500 // 3000 - 500
 * // }
 * ```
 */
export function calculateFundSeparation(
  totalRevenue: number,
  tripExpenses: number,
  businessExpenses: number,
  totalWithdrawals: number
): FinancialSummary {
  // Step 1: Split revenue into two pools
  const profitPool = totalRevenue * 0.30;
  const operatingPool = totalRevenue * 0.70;

  // Step 2: Calculate total expenses
  const totalExpenses = tripExpenses + businessExpenses;

  // Step 3: Calculate operating account balance
  // This can be negative if expenses exceed 70% allocation
  const operatingAccount = operatingPool - totalExpenses;

  // Step 4: Calculate withdrawable profit
  // Cannot be negative - you can't withdraw what you don't have
  const withdrawableProfit = Math.max(0, profitPool - totalWithdrawals);

  // Step 5: Determine operating status
  const operatingStatus = getOperatingStatus(operatingAccount, operatingPool);

  return {
    businessRevenue: totalRevenue,
    profitPool,
    operatingPool,
    tripExpenses,
    businessExpenses,
    totalExpenses,
    operatingAccount,
    operatingStatus,
    totalWithdrawals,
    withdrawableProfit,
  };
}

/**
 * Determines the health status of the operating account.
 *
 * Status levels:
 * - healthy: > 20% of operating pool remaining
 * - warning: 5-20% of operating pool remaining
 * - critical: < 5% remaining or negative (over budget)
 *
 * @param operatingAccount - Current operating account balance
 * @param operatingPool - Total operating pool allocation (70% of revenue)
 * @returns Operating status indicator
 */
function getOperatingStatus(
  operatingAccount: number,
  operatingPool: number
): OperatingStatus {
  // Avoid division by zero
  if (operatingPool === 0) {
    return "critical";
  }

  const operatingRatio = operatingAccount / operatingPool;

  if (operatingRatio > 0.20) {
    return "healthy";
  } else if (operatingRatio > 0.05) {
    return "warning";
  } else {
    return "critical";
  }
}
