import { FinancialSummary, OperatingStatus } from "@/types/financial";

/**
 * Calculates financial summary based on the NEW expense-aware model (per updated PRD).
 *
 * NEW Model (Expense-Aware):
 * - Locked Advance = Sum of advances for trips NOT completed (status-based, not percentage-based)
 * - Reserve Requirement = Sum of estimated_cost for all upcoming trips
 * - Operating Account = Bank Balance - Reserve Requirement
 * - Revenue is only earned when trips are completed
 * - 30/70 split applies ONLY when trip completes
 * - Every rupee is accounted for, obligations are clearly visible
 *
 * @param bankBalance - Actual money in the bank
 * @param earnedRevenue - Revenue from completed trips only
 * @param totalAdvanceReceived - Total customer advances for upcoming trips
 * @param totalLockedAdvance - Advances for trips NOT completed (status-based)
 * @param reserveRequirement - Sum of estimated costs for upcoming trips
 * @param tripExpenses - Total trip-specific expenses
 * @param businessExpenses - Total general business expenses
 * @param totalWithdrawals - Sum of all withdrawals
 * @param totalTransfers - Transfers from profit pool to operating
 * @returns FinancialSummary object with all calculated metrics
 *
 * @example
 * ```typescript
 * // Customer pays ₹20,000 advance for Kerala trip (estimated cost: ₹20,000)
 * const summary = calculateAdvanceBasedFinancials(
 *   20000,  // bank balance
 *   0,      // earned revenue (trip not completed yet)
 *   20000,  // total advance received (Kerala trip)
 *   20000,  // locked advance (Kerala not completed)
 *   20000,  // reserve requirement (estimated cost for Kerala)
 *   0,      // trip expenses so far
 *   0,      // business expenses
 *   0,      // withdrawals
 *   0       // transfers
 * );
 * // Result:
 * // {
 * //   bankBalance: 20000,
 * //   earnedRevenue: 0,
 * //   totalAdvanceReceived: 20000,
 * //   totalLockedAdvance: 20000,  // All advance is locked (trip not completed)
 * //   reserveRequirement: 20000,
 * //   operatingAccount: 0,  // 20000 - 20000 = 0
 * //   reserveShortfall: 0,  // No shortfall
 * //   tripExpenses: 0,
 * //   businessExpenses: 0,
 * //   totalExpenses: 0,
 * //   profitPool: 0,  // No profit until trip completes
 * //   totalWithdrawals: 0,
 * //   totalTransfers: 0,
 * //   withdrawableProfit: 0
 * // }
 * ```
 */
export function calculateAdvanceBasedFinancials(
  bankBalance: number,
  earnedRevenue: number,
  totalAdvanceReceived: number,
  totalLockedAdvance: number,
  reserveRequirement: number,
  tripExpenses: number,
  businessExpenses: number,
  totalWithdrawals: number,
  totalTransfers: number = 0
): FinancialSummary {
  // Step 1: Calculate total expenses
  const totalExpenses = tripExpenses + businessExpenses;

  // Step 2: Calculate profit pool (30% of earned revenue only)
  const profitPool = earnedRevenue * 0.30;

  // Step 3: Calculate operating account (NEW LOGIC)
  // Operating Account = Bank Balance - Required Trip Reserves
  // If negative, shows reserve shortfall
  const operatingAccount = bankBalance - reserveRequirement;

  // Step 4: Calculate reserve shortfall
  const reserveShortfall = Math.max(0, reserveRequirement - bankBalance);

  // Step 5: Calculate withdrawable profit
  // Profit pool minus withdrawals and transfers
  const withdrawableProfit = Math.max(0, profitPool - totalWithdrawals - totalTransfers);

  // Step 6: Determine operating status
  const operatingStatus = getOperatingStatus(operatingAccount, reserveRequirement, reserveShortfall);

  return {
    bankBalance,
    earnedRevenue,
    totalAdvanceReceived,
    totalLockedAdvance,
    reserveRequirement,
    operatingAccount,
    operatingStatus,
    reserveShortfall,
    tripExpenses,
    businessExpenses,
    totalExpenses,
    profitPool,
    totalWithdrawals,
    totalTransfers,
    withdrawableProfit,
    // Legacy fields (deprecated but kept for backward compatibility)
    totalTripReserves: reserveRequirement,  // Map to new field
    totalEarlyUnlock: 0,  // Deprecated concept
  };
}

/**
 * Determines the health status of the operating account (NEW LOGIC).
 *
 * Status levels:
 * - healthy: Operating Account > ₹5,000 AND no reserve shortfall
 * - warning: Operating Account between ₹0 and ₹5,000 OR small reserve shortfall
 * - critical: Operating Account < 0 (reserve shortfall exists)
 *
 * @param operatingAccount - Current operating account balance (Bank Balance - Reserve Requirement)
 * @param reserveRequirement - Total reserve requirement for upcoming trips
 * @param reserveShortfall - Amount by which reserve requirement exceeds bank balance
 * @returns Operating status indicator
 */
function getOperatingStatus(
  operatingAccount: number,
  reserveRequirement: number,
  reserveShortfall: number
): OperatingStatus {
  // If reserve shortfall exists, critical
  if (reserveShortfall > 0 || operatingAccount < 0) {
    return "critical";
  }

  // If operating account is low but positive
  if (operatingAccount < 5000) {
    return "warning";
  }

  // Healthy state
  return "healthy";
}

/**
 * Legacy function for backward compatibility.
 * This provides a simplified interface that uses old 30/70 split model assumptions.
 *
 * @deprecated Use calculateAdvanceBasedFinancials for the new advance-based model
 */
export function calculateFundSeparation(
  totalRevenue: number,
  tripExpenses: number,
  businessExpenses: number,
  totalWithdrawals: number,
  totalTransfers: number = 0
): FinancialSummary {
  // For backward compatibility, assume all revenue is "earned"
  // and there are no advances in the old model
  return calculateAdvanceBasedFinancials(
    totalRevenue - tripExpenses - businessExpenses - totalWithdrawals, // bankBalance
    totalRevenue, // earnedRevenue (assume all is earned in old model)
    0, // totalAdvanceReceived (no advances in old model)
    0, // totalLockedAdvance
    0, // reserveRequirement (no reserves in old model)
    tripExpenses,
    businessExpenses,
    totalWithdrawals,
    totalTransfers
  );
}
