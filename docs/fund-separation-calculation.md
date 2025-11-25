# Fund Separation Calculation Guide

This document outlines how to calculate and display the three key financial accounts for clear fund separation in Nomadura.

---

## The Three Accounts

### 1. Business Revenue (Total Income)
All money received from participants across all trips.

```
Business Revenue = SUM(all participant payments across all trips)
```

### 2. Operating Account (Operational Reserve)
70% of revenue allocated for all business operations and expenses.

```
Operating Account = (70% of Business Revenue) - Total Expenses
```

This pool covers:
- Trip expenses (transport, accommodation, food, activities, etc.)
- Business expenses (rent, software, marketing, etc.)

### 3. Withdrawable Profit
30% of revenue designated as owner profit.

```
Withdrawable Profit = (30% of Business Revenue) - Previous Withdrawals
```

---

## Complete Calculation Formula

### Step-by-Step Breakdown

```javascript
// Step 1: Calculate totals
Total Revenue         = SUM(payments from all trips)
Total Trip Expenses   = SUM(expenses from all trips)
Total Biz Expenses    = SUM(general business expenses)
Total Withdrawals     = SUM(all past withdrawals)

// Step 2: Split revenue into two pools
Profit Pool           = Total Revenue × 0.30    // Your money
Operating Pool        = Total Revenue × 0.70    // Business money

// Step 3: Calculate withdrawable profit
Withdrawable Profit   = Profit Pool - Total Withdrawals

// Step 4: Calculate operating account balance
Total Expenses        = Total Trip Expenses + Total Biz Expenses
Operating Account     = Operating Pool - Total Expenses
```

### Key Concept
- **30% is YOUR profit** - untouchable by expenses
- **70% is for operations** - all expenses come from here

### Edge Cases

- **Negative Withdrawable Profit**: Display as $0 (cannot withdraw negative amounts)
- **Negative Operating Account**: Warning! Expenses exceeded 70% allocation - eating into profit
- **No revenue**: All accounts show $0

---

## Example Calculations

### Example 1: Healthy Business

| Item | Amount |
|------|--------|
| Total Revenue | $10,000 |
| **Profit Pool (30%)** | **$3,000** |
| **Operating Pool (70%)** | **$7,000** |
| Trip Expenses | $4,000 |
| Business Expenses | $1,000 |
| Total Expenses | $5,000 |
| Past Withdrawals | $500 |
| **Withdrawable Profit** | **$2,500** |
| **Operating Account** | **$2,000** |

### Example 2: High Expense Business

| Item | Amount |
|------|--------|
| Total Revenue | $10,000 |
| **Profit Pool (30%)** | **$3,000** |
| **Operating Pool (70%)** | **$7,000** |
| Trip Expenses | $5,000 |
| Business Expenses | $3,000 |
| Total Expenses | $8,000 |
| Past Withdrawals | $0 |
| **Withdrawable Profit** | **$3,000** |
| **Operating Account** | **-$1,000** ⚠️ (over budget!) |

*Note: In Example 2, expenses exceeded the 70% operating budget by $1,000. The business is spending into the profit margin.*

### Example 3: After Withdrawal

| Item | Amount |
|------|--------|
| Total Revenue | $15,000 |
| **Profit Pool (30%)** | **$4,500** |
| **Operating Pool (70%)** | **$10,500** |
| Trip Expenses | $6,000 |
| Business Expenses | $1,500 |
| Total Expenses | $7,500 |
| Past Withdrawals | $2,000 |
| **Withdrawable Profit** | **$2,500** |
| **Operating Account** | **$3,000** |

---

## Database Requirements

### New Tables Needed

#### 1. `business_expenses`
For general business expenses not tied to specific trips.

```sql
CREATE TABLE business_expenses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT, -- rent, software, marketing, insurance, other
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `withdrawals`
Track profit withdrawals.

```sql
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoint Response Structure

The dashboard summary endpoint should return:

```typescript
interface FinancialSummary {
  businessRevenue: number;      // Total income
  profitPool: number;           // 30% of revenue
  operatingPool: number;        // 70% of revenue
  tripExpenses: number;         // Total trip-specific expenses
  businessExpenses: number;     // Total general expenses
  totalExpenses: number;        // Trip + business expenses
  operatingAccount: number;     // Operating pool - expenses
  operatingStatus: 'healthy' | 'warning' | 'critical';
  totalWithdrawals: number;     // Sum of past withdrawals
  withdrawableProfit: number;   // Profit pool - withdrawals
}
```

---

## UI Display Recommendations

### Dashboard Cards

1. **Business Revenue Card**
   - Show total revenue
   - Breakdown: 30% Profit | 70% Operations

2. **Operating Account Card**
   - Show current balance (70% pool minus expenses)
   - Color indicator:
     - Green: > 20% of operating pool remaining
     - Yellow: 5-20% remaining
     - Red: < 5% or negative (over budget)

3. **Withdrawable Profit Card**
   - Show available amount (30% pool minus withdrawals)
   - "Withdraw" button if amount > 0
   - Disabled state with explanation if $0

### Visual Hierarchy
- Operating Account shows business health
- Withdrawable Profit is your personal money
- Business Revenue provides the full picture

---

## Calculation Utility Function

```typescript
function calculateFundSeparation(
  totalRevenue: number,
  tripExpenses: number,
  businessExpenses: number,
  totalWithdrawals: number
): FinancialSummary {
  const profitPool = totalRevenue * 0.30;
  const operatingPool = totalRevenue * 0.70;
  const totalExpenses = tripExpenses + businessExpenses;

  const operatingAccount = operatingPool - totalExpenses;
  const withdrawableProfit = Math.max(0, profitPool - totalWithdrawals);

  let operatingStatus: 'healthy' | 'warning' | 'critical';
  const operatingRatio = operatingAccount / operatingPool;

  if (operatingRatio > 0.20) {
    operatingStatus = 'healthy';
  } else if (operatingRatio > 0.05) {
    operatingStatus = 'warning';
  } else {
    operatingStatus = 'critical';
  }

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
    withdrawableProfit
  };
}
```

---

## Business Rules

1. **30/70 split is immediate**: When payment is received, mentally allocate 30% as profit
2. **Expenses only from operating pool**: All costs come from the 70%
3. **Profit is protected**: The 30% should not be touched by expenses
4. **Monitor operating budget**: If operating account goes negative, expenses are eating into profit
5. **Withdrawals reduce available profit**: Track all withdrawals for tax/accounting
6. **Warning threshold**: Alert when expenses exceed 80% of operating pool (only 20% buffer left)
