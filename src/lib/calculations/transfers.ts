/**
 * Transfer Calculation Functions
 *
 * Handles logic for transferring money between trip wallets:
 * - Trip Reserve (locked profit)
 * - Trip Balance (operating account for trip expenses)
 * - Business Account (global business expenses)
 *
 * Based on Money_Transfer.md PRD
 */

export type WalletType = 'trip_reserve' | 'trip_balance' | 'business_account';

export type ImpactType =
  | 'borrowed_from_reserve'      // Reserve → Balance/Business (reduces profit)
  | 'reduced_trip_balance'       // Balance → Business (reduces profit)
  | 'business_subsidy'           // Business → Balance (no profit impact)
  | 'added_to_trip_balance';     // Any → Balance (general)

export interface TripBalances {
  trip_reserve_balance: number;
  operating_account: number;      // Trip Balance
  business_account: number;
}

export interface TransferImpact {
  profitChange: number;           // How much profit will change (negative = reduces profit)
  newBalances: TripBalances;
  impactType: ImpactType;
  warning?: string;
}

export interface TransferValidation {
  isValid: boolean;
  error?: string;
  availableBalance: number;
}

/**
 * Allowed transfer paths per PRD:
 * - Reserve → Trip Balance ✓
 * - Reserve → Business ✓
 * - Trip Balance → Business ✓
 * - Business → Trip Balance ✓
 * - NO transfers TO Reserve (it's locked)
 */
export function isTransferAllowed(from: WalletType, to: WalletType): boolean {
  // Cannot transfer to reserve
  if (to === 'trip_reserve') return false;

  // Cannot transfer to same wallet
  if (from === to) return false;

  // All other paths are allowed
  return true;
}

/**
 * Get available balance for a wallet type
 */
export function getAvailableBalance(
  walletType: WalletType,
  balances: TripBalances
): number {
  switch (walletType) {
    case 'trip_reserve':
      return balances.trip_reserve_balance;
    case 'trip_balance':
      return balances.operating_account;
    case 'business_account':
      return balances.business_account;
  }
}

/**
 * Validate if a transfer is possible
 */
export function validateTransfer(
  from: WalletType,
  to: WalletType,
  amount: number,
  balances: TripBalances
): TransferValidation {
  // Check if path is allowed
  if (!isTransferAllowed(from, to)) {
    return {
      isValid: false,
      error: 'This transfer path is not allowed. Cannot transfer to Trip Reserve.',
      availableBalance: 0,
    };
  }

  // Check amount is positive
  if (amount <= 0) {
    return {
      isValid: false,
      error: 'Transfer amount must be greater than 0',
      availableBalance: getAvailableBalance(from, balances),
    };
  }

  // Check sufficient balance
  const availableBalance = getAvailableBalance(from, balances);
  if (amount > availableBalance) {
    return {
      isValid: false,
      error: `Insufficient balance. Available: ₹${availableBalance.toFixed(2)}`,
      availableBalance,
    };
  }

  return {
    isValid: true,
    availableBalance,
  };
}

/**
 * Calculate the impact of a transfer on profit and balances
 *
 * Profit Formula: Trip Reserve + Remaining Trip Balance
 *
 * Impact rules:
 * - Reserve → anywhere: Reduces profit by amount (borrowing from future profit)
 * - Trip Balance → Business: Reduces profit by amount (less leftover)
 * - Business → Trip Balance: No profit impact (subsidy)
 */
export function calculateTransferImpact(
  from: WalletType,
  to: WalletType,
  amount: number,
  currentBalances: TripBalances
): TransferImpact {
  const newBalances = { ...currentBalances };
  let profitChange = 0;
  let impactType: ImpactType;
  let warning: string | undefined;

  // Deduct from source
  switch (from) {
    case 'trip_reserve':
      newBalances.trip_reserve_balance -= amount;
      profitChange = -amount; // Reduces profit
      impactType = 'borrowed_from_reserve';
      warning = "⚠️ You're borrowing from your future profit. Your profit for this trip will reduce by this amount.";
      break;

    case 'trip_balance':
      newBalances.operating_account -= amount;
      if (to === 'business_account') {
        profitChange = -amount; // Reduces profit (less leftover)
        impactType = 'reduced_trip_balance';
        warning = "⚠️ This will reduce the leftover amount for this trip. Your expected profit may reduce.";
      } else {
        profitChange = 0;
        impactType = 'added_to_trip_balance';
      }
      break;

    case 'business_account':
      newBalances.business_account -= amount;
      profitChange = 0; // No profit impact (subsidy)
      impactType = 'business_subsidy';
      break;
  }

  // Add to destination
  switch (to) {
    case 'trip_balance':
      newBalances.operating_account += amount;
      if (from === 'business_account') {
        impactType = 'business_subsidy';
      }
      break;

    case 'business_account':
      newBalances.business_account += amount;
      break;

    case 'trip_reserve':
      // Should never happen due to validation, but handle it
      throw new Error('Cannot transfer to Trip Reserve');
  }

  return {
    profitChange,
    newBalances,
    impactType,
    warning,
  };
}

/**
 * Generate auto-generated note for transfer history
 */
export function generateTransferNote(
  from: WalletType,
  to: WalletType,
  amount: number,
  impact: TransferImpact
): string {
  const fromLabel = getWalletLabel(from);
  const toLabel = getWalletLabel(to);
  const formattedAmount = `₹${amount.toFixed(2)}`;

  let note = `Moved ${formattedAmount} from ${fromLabel} to ${toLabel}.`;

  if (impact.profitChange < 0) {
    note += ` Trip profit reduced by ₹${Math.abs(impact.profitChange).toFixed(2)}.`;
  } else if (impact.profitChange > 0) {
    note += ` Trip profit increased by ₹${impact.profitChange.toFixed(2)}.`;
  } else {
    note += ' No impact on trip profit.';
  }

  return note;
}

/**
 * Get user-friendly warning message for a transfer
 */
export function getTransferWarning(
  from: WalletType,
  to: WalletType,
  amount: number
): string | undefined {
  if (from === 'trip_reserve') {
    return "⚠️ You're borrowing from your future profit. Your profit for this trip will reduce by this amount.";
  }

  if (from === 'trip_balance' && to === 'business_account') {
    return "⚠️ This will reduce the leftover amount for this trip. Your expected profit may reduce.";
  }

  if (from === 'business_account' && to === 'trip_balance') {
    return "ℹ️ This adds more money to this trip's expense pool. Profit stays the same.";
  }

  return undefined;
}

/**
 * Get human-readable label for wallet type
 */
export function getWalletLabel(wallet: WalletType): string {
  switch (wallet) {
    case 'trip_reserve':
      return 'Trip Reserve';
    case 'trip_balance':
      return 'Trip Balance';
    case 'business_account':
      return 'Business Account';
  }
}

/**
 * Calculate current profit potential based on balances
 */
export function calculateProfitPotential(balances: TripBalances): number {
  return balances.trip_reserve_balance + balances.operating_account;
}
