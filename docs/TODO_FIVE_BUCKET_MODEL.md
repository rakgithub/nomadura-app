# TODO: Five-Bucket Financial Model Implementation

Based on `newprd.md` - Dashboard Redesign with Five-Bucket Model

## Status: Not Started
**Last Updated:** 2025-11-27

---

## Overview

This todo list tracks the implementation of the new five-bucket financial model that replaces the current complex multi-bucket system with a simpler, clearer approach.

### Current Model Issues
- Too many overlapping buckets (Unlocked Operating, Early Unlock, Locked Advance, etc.)
- Confusing split logic with multiple percentages
- Hard to understand what money can be spent where

### New Model (Five Buckets)
1. **Bank Balance** - Total real money in bank
2. **Trip Reserve** - Protected money for trip (configurable %)
3. **Operating Account** - 50% of spendable amount (70%) for trip expenses
4. **Business Account** - 50% of spendable amount (70%) for business expenses
5. **Profit (Withdrawable)** - Real profit after trip completion (initially ₹0)

---

## Phase 1: Database Schema Changes

### 1.1 Update Trips Table
- [ ] Remove old columns if they exist:
  - `early_unlock_total`
  - `locked_advance_total`
  - `unlocked_operating` (if exists as column)
- [ ] Ensure these columns exist:
  - `reserve_percentage` DECIMAL(3,2) - Already exists ✓
  - `trip_reserve_balance` DECIMAL(12,2) - Already exists ✓
  - `total_advance_received` DECIMAL(12,2) - Already exists ✓
- [ ] Add new computed columns (or calculate in code):
  - `operating_account` DECIMAL(12,2)
  - `business_account` DECIMAL(12,2)

**Files to modify:**
- `supabase/migrations/XXX_five_bucket_model.sql` (new migration)

---

### 1.2 Update Advance Payments Table
- [ ] Simplify advance_payments table structure
- [ ] Remove old split columns:
  - `early_unlock_amount`
  - `locked_amount`
- [ ] Keep only:
  - `amount` (total advance)
  - `trip_reserve_amount` (reserve_percentage × amount)
  - `operating_amount` (35% of amount - half of spendable 70%)
  - `business_amount` (35% of amount - half of spendable 70%)

**Files to modify:**
- `supabase/migrations/XXX_update_advance_payments_structure.sql` (new migration)

---

### 1.3 Update Database Triggers
- [ ] Update trigger `update_trip_advance_totals_on_advance_payment`
  - Calculate `trip_reserve_balance` correctly
  - Calculate `operating_account` = SUM(operating_amount from advances) - trip_expenses
  - Calculate `business_account` = SUM(business_amount from advances) - business_expenses

- [ ] Update trigger `update_trip_totals_on_advance_payment_delete`
  - Recalculate all buckets when advance is deleted

**Files to modify:**
- `supabase/migrations/013_advance_money_tracking.sql` (review and update)

---

## Phase 2: Backend API Updates

### 2.1 Dashboard Summary API
**File:** `src/app/api/dashboard/summary/route.ts`

- [ ] Remove old calculations:
  - `unlockedOperating`
  - `totalEarlyUnlock`
  - `totalLockedAdvance`
  - `earlyUnlockAmount`
  - `lockedAmount`

- [ ] Implement new five-bucket logic:
  ```typescript
  // 1. Bank Balance
  bankBalance = totalAdvanceReceived + earnedRevenue - totalExpenses - totalWithdrawals

  // 2. Trip Reserve
  tripReserve = SUM(advance × reserve_percentage) for all trips

  // 3. Operating Account
  operatingAccount = SUM(advance × 70% × 50%) - tripExpenses

  // 4. Business Account
  businessAccount = SUM(advance × 70% × 50%) - businessExpenses

  // 5. Profit (Withdrawable)
  profit = completedTripReserves + leftoverOperating + leftoverBusiness
  // For upcoming/in-progress trips: profit = 0
  ```

- [ ] Update response structure to match new model
- [ ] Remove `operatingStatus` and `reserveShortfall` (no longer needed)

---

### 2.2 Advance Payment Creation API
**File:** `src/app/api/advance-payments/route.ts`

- [ ] Update split calculation logic:
  ```typescript
  const tripReserveAmount = amount × trip.reserve_percentage;
  const spendableAmount = amount - tripReserveAmount; // 70% if reserve is 30%
  const operatingAmount = spendableAmount × 0.5; // Half for operations
  const businessAmount = spendableAmount × 0.5; // Half for business
  ```

- [ ] Update insertData to use new fields:
  ```typescript
  {
    amount,
    trip_reserve_amount: tripReserveAmount,
    operating_amount: operatingAmount,
    business_amount: businessAmount,
    // Remove: early_unlock_amount, locked_amount
  }
  ```

---

### 2.3 Trip Expenses API
**File:** `src/app/api/trips/[id]/expenses/route.ts`

- [ ] Update expense validation logic:
  - Check against `operating_account` balance (not trip_reserve_balance)
  - Warning if expense > available operating_account

- [ ] Update warning response:
  ```typescript
  {
    warning: true,
    message: "Expense exceeds available Operating Account",
    tripName,
    operatingAccount,
    expenseAmount,
    shortfall
  }
  ```

---

### 2.4 Business Expenses API
**File:** `src/app/api/business-expenses/route.ts`

- [ ] Update expense validation logic:
  - Check against `business_account` balance (not operating_account)
  - Block if expense > available business_account

- [ ] Update error/warning response

---

## Phase 3: Frontend Component Updates

### 3.1 Dashboard Cards - Remove Old Cards
**File:** `src/app/(dashboard)/page.tsx`

- [ ] Remove old dashboard cards:
  - `<UnlockedOperatingCard />` (if exists)
  - `<EarlyUnlockCard />` (if exists)
  - `<LockedAdvanceCard />` - REMOVE
  - `<OperatingAccountCard />` - UPDATE (not remove)
  - `<TripReservesCard />` - UPDATE (not remove)

---

### 3.2 Dashboard Cards - Create/Update New Cards
**Files:** `src/components/dashboard/*.tsx`

#### 3.2.1 Update Bank Balance Card
- [x] Already exists - verify logic matches new formula
- [ ] Update description text per PRD:
  > "Actual money available in your bank."

**File:** `src/components/dashboard/bank-balance-card.tsx`

---

#### 3.2.2 Update Trip Reserve Card
- [x] Already exists
- [ ] Update description text per PRD:
  > "Protected funds saved for your upcoming trip. Untouched until the trip starts."
- [ ] Show trip-by-trip breakdown if multiple trips
- [ ] Update calculation to use new logic

**File:** `src/components/dashboard/trip-reserves-card.tsx`

---

#### 3.2.3 Update Operating Account Card
- [ ] Change calculation display:
  - OLD: "Unlocked Operating - Trip Expenses - Business Expenses"
  - NEW: "Available for trip spending (hotels, cabs, transport, guides)"
- [ ] Update description per PRD:
  > "Money available for on-trip spending. Hotels, cabs, local transport, guides — use it anytime."
- [ ] Formula: `70% of Advance × 50% - Trip Expenses`

**File:** `src/components/dashboard/operating-account-card.tsx`

---

#### 3.2.4 Create Business Account Card
- [ ] Create new component `business-account-card.tsx`
- [ ] Display:
  - Title: "Business Account"
  - Amount: businessAccount balance
  - Description per PRD:
    > "Money available for business expenses like ads and tools."
- [ ] Formula: `70% of Advance × 50% - Business Expenses`
- [ ] Color scheme: Purple/violet to differentiate from operations

**File:** `src/components/dashboard/business-account-card.tsx` (NEW)

---

#### 3.2.5 Create/Update Profit Card
- [ ] Create new component `profit-card.tsx`
- [ ] Display:
  - Title: "Profit (Withdrawable)"
  - Amount: withdrawable profit
  - Description per PRD:
    > "Your total earned profit from all completed trips."
- [ ] Logic:
  - For upcoming/in-progress trips: Show ₹0
  - For completed trips: Show trip_reserve + leftover operating + leftover business
- [ ] Show withdrawal history/link

**File:** `src/components/dashboard/profit-card.tsx` (NEW)

---

### 3.3 Update Dashboard Layout
**File:** `src/app/(dashboard)/page.tsx`

- [ ] Update card grid to show five cards:
  ```tsx
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <BankBalanceCard />
    <TripReserveCard />
    <OperatingAccountCard />
    <BusinessAccountCard />
    <ProfitCard />
  </div>
  ```

- [ ] Remove all old cards
- [ ] Update summary API call to use new structure
- [ ] Update prop passing to match new API response

---

### 3.4 Trip Details Page - Payment Split Preview
**File:** `src/app/(dashboard)/trips/[id]/page.tsx`

- [ ] Update advance payment split preview (lines 662-728):
  - Remove "Early Unlock" and "Locked" sections
  - Show new split:
    ```
    Trip Reserve (X%)
    Operating (Y%)
    Business (Y%)
    ```
  - Where Y = (100 - X) / 2

- [ ] Update split calculation logic:
  ```typescript
  const tripReserveAmount = amount × reservePercentage;
  const spendableAmount = amount - tripReserveAmount;
  const operatingAmount = spendableAmount × 0.5;
  const businessAmount = spendableAmount × 0.5;
  ```

---

### 3.5 Trip Overview - Advance Breakdown
**File:** `src/app/(dashboard)/trips/[id]/page.tsx` (lines 354-423)

- [ ] Update "Advance Money Breakdown" section:
  - Remove "Early Unlock" card
  - Remove "Locked" card
  - Show:
    - Total Advance
    - Trip Reserve (X%)
    - Operating Account (Y%)
    - Business Account (Y%)

---

### 3.6 Business Expenses Page
**File:** `src/app/(dashboard)/business-expenses/page.tsx`

- [ ] Update "Available for Business Expenses" display:
  - Change from "Operating Account" to "Business Account"
  - Show businessAccount balance from API
- [ ] Update validation when adding expense:
  - Block if businessAccount <= 0
  - Show warning if expense > businessAccount

---

## Phase 4: Type Definitions

### 4.1 Update Database Types
**File:** `src/types/database.ts`

- [ ] Update Trip type:
  ```typescript
  trips: {
    Row: {
      // ... existing fields
      reserve_percentage: number;
      trip_reserve_balance: number;
      operating_account: number; // NEW
      business_account: number;  // NEW
      total_advance_received: number;
      // Remove: early_unlock_total, locked_advance_total, unlocked_operating
    }
  }
  ```

- [ ] Update AdvancePayment type:
  ```typescript
  advance_payments: {
    Row: {
      amount: number;
      trip_reserve_amount: number;
      operating_amount: number;    // NEW
      business_amount: number;     // NEW
      // Remove: early_unlock_amount, locked_amount
    }
  }
  ```

---

### 4.2 Update Financial Types
**File:** `src/types/financial.ts`

- [ ] Update DashboardSummary type:
  ```typescript
  export interface DashboardSummary {
    bankBalance: number;
    tripReserve: number;           // NEW name
    operatingAccount: number;
    businessAccount: number;       // NEW
    profit: number;                // NEW
    withdrawableProfit: number;    // NEW

    // Keep for reference:
    earnedRevenue: number;
    totalAdvanceReceived: number;
    tripExpenses: number;
    businessExpenses: number;
    totalExpenses: number;
    totalWithdrawals: number;

    // Remove:
    // unlockedOperating, totalEarlyUnlock, totalLockedAdvance,
    // operatingStatus, reserveShortfall, reserveRequirement
  }
  ```

---

## Phase 5: Testing & Validation

### 5.1 Test Scenarios

#### Scenario 1: New Trip with Advance Payment
- [ ] Create trip with 30% reserve
- [ ] Record advance of ₹15,000
- [ ] Verify dashboard shows:
  - Bank Balance: ₹15,000
  - Trip Reserve: ₹4,500 (30%)
  - Operating Account: ₹5,250 (35%)
  - Business Account: ₹5,250 (35%)
  - Profit: ₹0

#### Scenario 2: Add Trip Expense
- [ ] Add trip expense of ₹2,000
- [ ] Verify:
  - Bank Balance: ₹13,000
  - Operating Account: ₹3,250 (₹5,250 - ₹2,000)
  - Business Account: ₹5,250 (unchanged)
  - Trip Reserve: ₹4,500 (unchanged)
  - Profit: ₹0

#### Scenario 3: Add Business Expense
- [ ] Add business expense of ₹1,000
- [ ] Verify:
  - Bank Balance: ₹12,000
  - Operating Account: ₹3,250 (unchanged)
  - Business Account: ₹4,250 (₹5,250 - ₹1,000)
  - Trip Reserve: ₹4,500 (unchanged)
  - Profit: ₹0

#### Scenario 4: Complete Trip
- [ ] Mark trip as "completed"
- [ ] Verify:
  - Trip Reserve (₹4,500) moves to Profit
  - Leftover Operating (₹3,250) moves to Profit
  - Leftover Business (₹4,250) stays in Business Account
  - Profit: ₹7,750 (trip reserve + leftover operating)
  - Bank Balance: ₹12,000 (unchanged)

#### Scenario 5: Validation Checks
- [ ] Try adding trip expense > Operating Account → Should show warning
- [ ] Try adding business expense > Business Account → Should block/warn
- [ ] Verify Trip Reserve is never deducted before trip completion

---

### 5.2 Data Migration Testing
- [ ] Test with existing data (backup first!)
- [ ] Verify old advances are correctly converted to new structure
- [ ] Check all dashboard totals match expected values
- [ ] Validate no data loss during migration

---

## Phase 6: UI/UX Polish

### 6.1 Dashboard Visual Design
- [ ] Ensure five cards have distinct colors:
  - Bank Balance: Blue
  - Trip Reserve: Blue (protected shade)
  - Operating Account: Green
  - Business Account: Purple/Violet
  - Profit: Gold/Yellow

- [ ] Add icons for each card:
  - Bank Balance: Bank/Wallet icon
  - Trip Reserve: Shield icon ✓
  - Operating Account: Briefcase/Trip icon
  - Business Account: Building/Chart icon
  - Profit: Trophy/Money icon

---

### 6.2 Tooltips & Help Text
- [ ] Add tooltips explaining each bucket
- [ ] Add help icon/modal with example calculation
- [ ] Use exact text from PRD section 8 (UX Text)

---

### 6.3 Mobile Responsiveness
- [ ] Verify all five cards display well on mobile
- [ ] Test grid layout on different screen sizes
- [ ] Ensure breakdown sections are readable on small screens

---

## Phase 7: Documentation

### 7.1 Update Technical Docs
- [ ] Update `IMPLEMENTATION_SUMMARY.md` with new model
- [ ] Document new database schema
- [ ] Document new API endpoints/responses
- [ ] Add calculation examples

---

### 7.2 User Documentation
- [ ] Create user guide explaining the five buckets
- [ ] Add FAQ section
- [ ] Create example scenarios with screenshots

---

## Phase 8: Cleanup

### 8.1 Remove Old Code
- [ ] Delete unused components:
  - `early-unlock-card.tsx` (if exists)
  - `locked-advance-card.tsx`
  - `unlocked-operating-card.tsx` (if exists)

- [ ] Remove unused API endpoints
- [ ] Clean up unused database columns (after migration)
- [ ] Remove old type definitions

---

### 8.2 Remove Console Logs
- [ ] Remove debug console.logs added during development:
  - `src/components/trips/trip-form.tsx` (lines 70, 73, 94)
  - `src/app/api/trips/route.ts` (lines 62, 78, 83)
  - `src/app/(dashboard)/trips/[id]/page.tsx` (line 666)

---

## Notes & Considerations

### Breaking Changes
⚠️ This is a significant refactor that changes core financial logic.
- Requires database migration
- Existing advance payments need to be recalculated
- Dashboard completely restructured
- API response structure changes

### Backward Compatibility
- [ ] Consider adding feature flag to switch between old/new model
- [ ] Add migration script to convert existing data
- [ ] Keep old columns temporarily for rollback capability

### Performance
- [ ] Optimize dashboard API query (reduce multiple queries)
- [ ] Consider caching calculated values
- [ ] Add database indexes if needed

---

## Progress Tracking

**Phase 1 (Database):** 0/3 completed
**Phase 2 (Backend API):** 0/4 completed
**Phase 3 (Frontend):** 0/6 completed
**Phase 4 (Types):** 0/2 completed
**Phase 5 (Testing):** 0/2 completed
**Phase 6 (UI/UX):** 0/3 completed
**Phase 7 (Docs):** 0/2 completed
**Phase 8 (Cleanup):** 0/2 completed

**Overall Progress:** 0% (0/24 sections completed)

---

## Questions for Rakesh

1. Should we implement a feature flag to toggle between old and new model during transition?
2. Do you want to keep profit calculation separate for each trip or aggregate across all completed trips?
3. Should Business Account funds carry over between trips or reset?
4. When a trip completes, should leftover Operating Account move to Profit or stay in Operating?
5. Do you want to migrate all existing data or start fresh with new trips only?

---

**Created:** 2025-11-27
**Based on:** `docs/newprd.md` v1.0
