/**
 * Financial Summary Types
 *
 * Types for fund separation calculations using the 30/70 split model:
 * - 30% of revenue goes to profit pool (withdrawable by owner)
 * - 70% of revenue goes to operating pool (covers all expenses)
 */

export type OperatingStatus = 'healthy' | 'warning' | 'critical';

export interface FinancialSummary {
  /** Total income from all participant payments */
  businessRevenue: number;

  /** 30% of revenue allocated as owner profit */
  profitPool: number;

  /** 70% of revenue allocated for operations */
  operatingPool: number;

  /** Total trip-specific expenses (transport, accommodation, etc.) */
  tripExpenses: number;

  /** Total general business expenses (rent, software, marketing, etc.) */
  businessExpenses: number;

  /** Sum of trip and business expenses */
  totalExpenses: number;

  /** Operating pool minus total expenses (can be negative if over budget) */
  operatingAccount: number;

  /** Health status of operating account */
  operatingStatus: OperatingStatus;

  /** Total amount withdrawn to date */
  totalWithdrawals: number;

  /** Amount available to withdraw now (profit pool - withdrawals) */
  withdrawableProfit: number;
}
