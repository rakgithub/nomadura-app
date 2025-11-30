/**
 * Global Transfer Calculation Functions
 *
 * Handles logic for transferring money between global financial buckets:
 * - Profit (Withdrawable) - from completed trips
 * - Business Account - global business budget
 * - Trip Balances - sum of all active trip operating accounts
 * - Trip Reserves - sum of all active trip reserves
 *
 * Transfer Rules:
 * FROM: Profit, Business Account, Trip Balances, Trip Reserves
 * TO: Trip Balances, Business Account (NOT Profit or Trip Reserves)
 */

export type GlobalBucket =
  | "profit_withdrawable"
  | "business_account"
  | "trip_balances"
  | "trip_reserves";

export interface GlobalBalances {
  profit_withdrawable: number; // Total profit - withdrawals - transfers out
  business_account: number; // Business budget
  trip_balances: number; // Sum of active trips' operating_account
  trip_reserves: number; // Sum of active trips' trip_reserve_balance
}

export interface GlobalTransferValidation {
  isValid: boolean;
  error?: string;
  availableBalance: number;
}

export interface GlobalTransferImpact {
  newBalances: GlobalBalances;
  warning?: string;
  impactDescription: string;
}

/**
 * Check if a transfer path is allowed
 *
 * Rules:
 * - Cannot transfer TO profit_withdrawable or trip_reserves (they're outcomes/locked)
 * - Cannot transfer from/to same bucket
 * - All other paths are allowed
 */
export function isGlobalTransferAllowed(
  from: GlobalBucket,
  to: GlobalBucket
): boolean {
  // Cannot transfer to profit or reserves
  if (to === "profit_withdrawable" || to === "trip_reserves") {
    return false;
  }

  // Cannot transfer to same bucket
  if (from === to) {
    return false;
  }

  return true;
}

/**
 * Get allowed destination buckets for a source bucket
 */
export function getAllowedDestinations(
  from: GlobalBucket
): GlobalBucket[] {
  const allBuckets: GlobalBucket[] = [
    "profit_withdrawable",
    "business_account",
    "trip_balances",
    "trip_reserves",
  ];

  return allBuckets.filter(
    (bucket) => bucket !== from && isGlobalTransferAllowed(from, bucket)
  );
}

/**
 * Get available balance for a bucket
 */
export function getGlobalBucketBalance(
  bucket: GlobalBucket,
  balances: GlobalBalances
): number {
  return balances[bucket];
}

/**
 * Get user-friendly label for bucket
 */
export function getGlobalBucketLabel(bucket: GlobalBucket): string {
  const labels: Record<GlobalBucket, string> = {
    profit_withdrawable: "Profit (Withdrawable)",
    business_account: "Business Account",
    trip_balances: "Trip Balances",
    trip_reserves: "Trip Reserves",
  };
  return labels[bucket];
}

/**
 * Get description for bucket
 */
export function getGlobalBucketDescription(bucket: GlobalBucket): string {
  const descriptions: Record<GlobalBucket, string> = {
    profit_withdrawable:
      "Available profit from completed trips (after withdrawals)",
    business_account: "Global business budget for operating expenses",
    trip_balances: "Total spendable money across all active trips",
    trip_reserves: "Protected reserves for all active trips",
  };
  return descriptions[bucket];
}

/**
 * Validate if a transfer is possible
 */
export function validateGlobalTransfer(
  from: GlobalBucket,
  to: GlobalBucket,
  amount: number,
  balances: GlobalBalances
): GlobalTransferValidation {
  // Check if path is allowed
  if (!isGlobalTransferAllowed(from, to)) {
    const fromLabel = getGlobalBucketLabel(from);
    const toLabel = getGlobalBucketLabel(to);
    return {
      isValid: false,
      error: `Cannot transfer from ${fromLabel} to ${toLabel}. Transfers to Profit or Trip Reserves are not allowed.`,
      availableBalance: 0,
    };
  }

  // Check amount is positive
  if (amount <= 0) {
    return {
      isValid: false,
      error: "Transfer amount must be greater than 0",
      availableBalance: getGlobalBucketBalance(from, balances),
    };
  }

  // Check sufficient balance
  const availableBalance = getGlobalBucketBalance(from, balances);
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
 * Calculate the impact of a transfer
 */
export function calculateGlobalTransferImpact(
  from: GlobalBucket,
  to: GlobalBucket,
  amount: number,
  currentBalances: GlobalBalances
): GlobalTransferImpact {
  const newBalances = { ...currentBalances };
  let warning: string | undefined;
  let impactDescription: string;

  // Deduct from source
  newBalances[from] -= amount;

  // Add to destination
  newBalances[to] += amount;

  // Generate impact description and warnings
  const fromLabel = getGlobalBucketLabel(from);
  const toLabel = getGlobalBucketLabel(to);

  if (from === "profit_withdrawable") {
    if (to === "business_account") {
      impactDescription = `Moving ₹${amount.toFixed(2)} from your withdrawable profit to business expenses.`;
      warning =
        "This will reduce the profit available for personal withdrawal.";
    } else if (to === "trip_balances") {
      impactDescription = `Reinvesting ₹${amount.toFixed(2)} of your profit into active trips.`;
      warning =
        "This will reduce profit available for withdrawal and increase trip budgets.";
    } else {
      impactDescription = `Moving ₹${amount.toFixed(2)} from ${fromLabel} to ${toLabel}.`;
    }
  } else if (from === "business_account") {
    if (to === "trip_balances") {
      impactDescription = `Subsidizing active trips with ₹${amount.toFixed(2)} from business account.`;
      warning =
        "This will reduce your business budget and increase trip spending power.";
    } else {
      impactDescription = `Moving ₹${amount.toFixed(2)} from ${fromLabel} to ${toLabel}.`;
    }
  } else if (from === "trip_balances") {
    if (to === "business_account") {
      impactDescription = `Moving ₹${amount.toFixed(2)} from trip budgets to business account.`;
      warning =
        "This will reduce spending power for active trips and may affect trip profitability.";
    } else {
      impactDescription = `Moving ₹${amount.toFixed(2)} from ${fromLabel} to ${toLabel}.`;
    }
  } else if (from === "trip_reserves") {
    if (to === "trip_balances") {
      impactDescription = `Unlocking ₹${amount.toFixed(2)} from trip reserves to make it spendable.`;
      warning =
        "⚠️ This reduces protected reserves and may lower future profit when trips complete.";
    } else if (to === "business_account") {
      impactDescription = `Moving ₹${amount.toFixed(2)} from trip reserves to business account.`;
      warning =
        "⚠️ This borrows from future trip profit and will reduce profit when trips complete.";
    } else {
      impactDescription = `Moving ₹${amount.toFixed(2)} from ${fromLabel} to ${toLabel}.`;
      warning =
        "⚠️ This will reduce future profit when trips complete.";
    }
  } else {
    impactDescription = `Moving ₹${amount.toFixed(2)} from ${fromLabel} to ${toLabel}.`;
  }

  return {
    newBalances,
    warning,
    impactDescription,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}
