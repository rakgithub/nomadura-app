/**
 * Financial Summary Types
 *
 * NEW Expense-Aware Financial Model (per updated PRD):
 * - Locked Advance = Sum of advances for trips NOT completed (status-based)
 * - Reserve Requirement = Sum of estimated_cost for all upcoming trips
 * - Operating Account = Bank Balance - Reserve Requirement
 * - Revenue is only earned when trips are completed
 * - 30/70 split applies ONLY when trip completes
 */

export type OperatingStatus = 'healthy' | 'warning' | 'critical';

export interface FinancialSummary {
  /** Actual money in the bank account */
  bankBalance: number;

  /** Revenue earned from completed trips only (not advance) */
  earnedRevenue: number;

  /** Total customer advances received for upcoming trips */
  totalAdvanceReceived: number;

  /** Locked advance (sum of advances for trips NOT completed - status-based) */
  totalLockedAdvance: number;

  /** Total reserve requirement (sum of estimated costs for upcoming trips) */
  reserveRequirement: number;

  /** Money available for operations (Bank Balance - Reserve Requirement) */
  operatingAccount: number;

  /** Health status of operating account */
  operatingStatus: OperatingStatus;

  /** Reserve shortfall (if reserve requirement exceeds bank balance) */
  reserveShortfall: number;

  /** Total trip-specific expenses (transport, accommodation, etc.) */
  tripExpenses: number;

  /** Total general business expenses (rent, software, marketing, etc.) */
  businessExpenses: number;

  /** Sum of trip and business expenses */
  totalExpenses: number;

  /** 30% profit pool from earned revenue (only from completed trips) */
  profitPool: number;

  /** Total amount withdrawn to date */
  totalWithdrawals: number;

  /** Total amount transferred from profit to operating pool */
  totalTransfers: number;

  /** Amount available to withdraw now (profit pool - withdrawals - transfers) */
  withdrawableProfit: number;

  /** Total profit from completed trips (sum of released_profit) */
  totalProfit?: number;

  /** Total profit (same as totalProfit, main field) */
  profit?: number;

  /** Business account balance */
  businessBalance?: number;

  /** Business account (same as businessBalance) */
  businessAccount?: number;

  /** Sum of operating_account for active trips */
  tripBalances?: number;

  /** Sum of trip_reserve_balance for active trips */
  upcomingLockedReserve?: number;

  /** Count of active trips */
  activeTripsCount?: number;

  /** Trip reserve total */
  tripReserve?: number;

  /** @deprecated Use reserveRequirement instead */
  totalTripReserves: number;

  /** @deprecated Concept removed in new PRD */
  totalEarlyUnlock: number;

  /** NEW: Unlocked operating amount from advances (100 - reserve%) */
  unlockedOperating?: number;
}
