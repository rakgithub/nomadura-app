# TODO List - Expense-Aware Trip Finance Dashboard (New PRD)

Based on the PRD in `docs/new_prd.md`, this document tracks the implementation tasks for updating the dashboard to match real travel business cash flow.

## Overview
The new approach focuses on:
- Reality-based cash flow tracking (not strict accounting rules)
- Every rupee accounted for
- Trip obligations clearly visible
- Reserve shortfalls instantly visible
- Locked advance tied to actual trip status (not percentages)
- Profit calculated only at trip completion

---

## 🎯 High Priority Tasks

### 1. Database Schema Updates

#### 1.1 Add Trip Cost Tracking
- [ ] Add `estimated_cost` field to `trips` table
- [ ] Add `actual_trip_expenses` calculated field (sum of trip expenses)
- [ ] Add `trip_status` enum if not exists (upcoming/in_progress/completed/cancelled)

#### 1.2 Remove Percentage-Based Advance Splitting
- [ ] Remove or deprecate percentage-based split columns from trips table
- [ ] Remove `trip_reserve_percentage`, `early_unlock_percentage`, `locked_percentage` from settings
- [ ] Migrate existing data: convert percentage-based reserves to trip-status-based

---

## 2. Financial Calculation Logic Updates

### 2.1 Locked Advance Calculation (NEW LOGIC)
- [ ] **Remove:** Percentage-based locking (20% locked)
- [ ] **Implement:** Status-based locking
  ```
  Locked Advance = Sum of all advances for trips with status = 'upcoming' or 'in_progress'
  Unlocked Advance = Sum of advances for trips with status = 'completed'
  ```
- [ ] Update `calculateAdvanceBasedFinancials()` to use trip status
- [ ] Remove `totalLockedAdvance` parameter (derive from trip status instead)

### 2.2 Trip Reserves Calculation (NEW LOGIC)
- [ ] **Remove:** Static reserve amount per trip
- [ ] **Implement:** Dynamic reserve requirement
  ```
  Reserve Required = Sum(estimated_cost of all upcoming trips)
  Reserve Available = Bank Balance - Business Expenses
  Reserve Shortfall = Reserve Required - Reserve Available
  ```
- [ ] Add `calculateReserveShortfall()` function
- [ ] Update dashboard summary API to include reserve calculations

### 2.3 Operating Account Calculation (NEW LOGIC)
- [ ] **Remove:** Operating Pool (70%) concept from advance
- [ ] **Implement:** Reality-based calculation
  ```
  Operating Account Balance = Bank Balance - Required Trip Reserves
  Available Operating Cash = Operating Account Balance (if positive)
  Reserve Shortfall = Operating Account Balance (if negative)
  ```
- [ ] Show total expenses (business + trip) separately
- [ ] Remove "Early Unlock" concept entirely

### 2.4 Earned Revenue (30/70 Split - ONLY ON COMPLETION)
- [ ] **Keep:** 30/70 split logic
- [ ] **Change:** Apply ONLY when trip is marked completed
- [ ] **Remove:** Any advance pre-splitting into 70/30
- [ ] Update trip completion flow to:
  1. Move advance to earned revenue
  2. Apply 30% to Profit Pool
  3. Apply 70% to Operating Pool

---

## 3. Dashboard UI Updates

### 3.1 Bank Balance Card (Card 1)
- [ ] **Text Change:** "Advance Received" → "Active Advances (Upcoming Trips)"
- [ ] Keep existing breakdown structure
- [ ] No logic changes needed

### 3.2 Earned Revenue Card (Card 2)
- [ ] **Remove:** Any assumption that advance gets 70/30 split
- [ ] **Update Description:** "Revenue from completed trips. Split into Operating and Profit pools only after a trip finishes."
- [ ] Show only completed trip revenue
- [ ] Display unearned advance separately

### 3.3 Operating Account Card (Card 3) - MAJOR CHANGES
- [ ] **Remove:** "Operating Pool (70%)" label
- [ ] **Add:** "Available Operating Cash" (if positive)
- [ ] **Add:** "Business Expenses" line item
- [ ] **Add:** "Trip Expenses" line item
- [ ] **Add:** "Reserve Shortfall" line (if negative, show in RED)
- [ ] **New Formula Display:**
  ```
  Operating Account Balance = Bank Balance - Required Reserves
  ```
- [ ] Show warning if balance < 0

### 3.4 Withdrawable Profit Card (Card 4)
- [ ] **Update Description:** "Profit becomes available only when a trip is completed and revenue is earned."
- [ ] No logic changes (already correct)
- [ ] Show $0 if no trips completed yet

### 3.5 Locked Advance Card (Card 5) - MAJOR CHANGES
- [ ] **Remove:** Percentage-based locking (30% concept)
- [ ] **Implement:** Trip-status-based locking
- [ ] **Old Text:** "Reserved portion of customer advances that will convert to earned revenue upon trip completion."
- [ ] **New Text:** "Advance amounts for all upcoming trips. These funds are still owed as service delivery."
- [ ] **New Calculation:** Sum of advances for trips NOT completed
- [ ] Show list of upcoming trips with their advances

### 3.6 Trip Reserves Card (Card 6) - MAJOR CHANGES
- [ ] **Remove:** Static reserve amount
- [ ] **Implement:** Dynamic reserve requirement calculation
- [ ] **Old Text:** "Protected funds reserved for trip expenses only."
- [ ] **New Text:** "Amount needed to safely deliver all upcoming trips. Shows whether current bank balance is enough to cover upcoming obligations."
- [ ] **Display:**
  - Required Reserves: ₹X
  - Available Cash: ₹Y
  - Shortfall: ₹Z (RED if > 0)
- [ ] Add shortfall warning

---

## 4. Warning System

### 4.1 Global Warnings
- [ ] **Reserve Shortfall Warning**
  - Color: Red
  - Message: "You are short by ₹X to deliver upcoming trips."
  - Trigger: When Reserve Available < Reserve Required

- [ ] **Low Operating Cash Warning**
  - Trigger: When Operating Account Balance < ₹5,000
  - Message: "Operating cash is running low."

- [ ] **Profit Unavailable Warning**
  - Trigger: User tries to withdraw profit with no completed trips
  - Message: "Profit becomes withdrawable only after trips are completed."

### 4.2 Update Existing Warnings
- [x] ~~Business expense warning (already implemented)~~
- [x] ~~Trip expense warning (already implemented)~~
- [ ] Update warnings to use new reserve shortfall logic

---

## 5. Trip Completion Flow (CRITICAL)

### 5.1 Backend API
- [ ] Create `/api/trips/[id]/complete` endpoint
- [ ] On trip completion:
  1. Set trip status to 'completed'
  2. Move advance to earned revenue
  3. Calculate profit: `total_price - actual_expenses`
  4. Apply 30/70 split:
     - 30% → Profit Pool (withdrawable)
     - 70% → Operating Pool
  5. Release remaining trip reserve to operating cash
  6. Update all financial totals

### 5.2 Frontend UI
- [ ] Add "Mark as Completed" button on trip details page
- [ ] Show confirmation dialog with:
  - Trip final cost
  - Revenue earned
  - Profit calculation preview
- [ ] Update trip status badge
- [ ] Refresh all dashboard cards after completion

---

## 6. Trip Details Page Updates

### 6.1 Add Trip Cost Tracking
- [ ] Add "Estimated Cost" field to trip form
- [ ] Show "Estimated Cost vs Actual Expenses" comparison
- [ ] Show reserve status:
  - Advance Received: ₹X
  - Estimated Cost: ₹Y
  - Actual Expenses So Far: ₹Z
  - Reserve Status: Sufficient / Short by ₹W

### 6.2 Enhanced Financial View
- [ ] Add "Financial Summary" section showing:
  - Advance Status (locked/unlocked)
  - Reserve Requirement
  - Actual Spend vs Estimate
  - Projected Profit (if completed now)

---

## 7. API Updates

### 7.1 Dashboard Summary API
- [ ] Remove percentage-based calculations
- [ ] Add trip-status-based calculations
- [ ] Add reserve requirement calculations
- [ ] Add shortfall calculations
- [ ] Return new fields:
  - `reserveRequired`
  - `reserveAvailable`
  - `reserveShortfall`
  - `lockedAdvanceByStatus`

### 7.2 Trip List API
- [ ] Include trip status in response
- [ ] Include estimated_cost in response
- [ ] Include actual expenses total
- [ ] Include reserve shortfall per trip

---

## 8. Settings Page Updates

### 8.1 Remove Deprecated Settings
- [ ] Remove "Advance Split Configuration" section
- [ ] Remove percentage sliders (Trip Reserve %, Early Unlock %, Locked %)
- [ ] Remove split preview

### 8.2 Add New Settings
- [ ] Add "Default Trip Cost Estimate" setting
- [ ] Add "Low Operating Cash Threshold" (default ₹5,000)
- [ ] Keep other alert thresholds

---

## 9. Migration & Data Cleanup

### 9.1 Data Migration
- [ ] Write migration script to:
  - Set all upcoming trips' locked advance = their total advance
  - Set all completed trips' locked advance = 0
  - Remove percentage-based split data
  - Populate estimated_cost field with reasonable defaults

### 9.2 Backward Compatibility
- [ ] Keep old advance_payments table for historical reference
- [ ] Ensure old data displays correctly in new system
- [ ] Add migration warnings if data inconsistency detected

---

## 10. Testing & Validation

### 10.1 Test Scenarios
- [ ] Test: Customer pays advance for upcoming trip
  - ✓ Bank balance increases
  - ✓ Locked advance increases
  - ✓ Required reserves increase
  - ✓ No profit yet

- [ ] Test: Add trip expense
  - ✓ Bank balance decreases
  - ✓ Operating Account adjusts
  - ✓ Reserve requirement decreases
  - ✓ Show warning if exceeds estimate

- [ ] Test: Add business expense
  - ✓ Bank balance decreases
  - ✓ Operating Account decreases
  - ✓ Show warning if causes reserve shortfall

- [ ] Test: Complete trip
  - ✓ Locked advance → 0
  - ✓ Earned revenue increases
  - ✓ Profit pool increases (30%)
  - ✓ Operating pool increases (70%)
  - ✓ Required reserves decrease
  - ✓ Profit becomes withdrawable

- [ ] Test: Reserve shortfall scenario
  - ✓ Red warning displays
  - ✓ Operating Account shows negative
  - ✓ Trip Reserves card shows shortfall

### 10.2 Edge Cases
- [ ] Multiple trips completing same day
- [ ] Trip with $0 advance (full payment later)
- [ ] Trip cancelled with advance already received
- [ ] Refund scenario handling

---

## 11. Documentation

- [ ] Update `FINANCIAL_FLOW_EXAMPLE.md` with new logic
- [ ] Create `RESERVE_CALCULATION_GUIDE.md`
- [ ] Update API documentation
- [ ] Add code comments explaining new calculations
- [ ] Update user guide/help section

---

## 📊 Implementation Priority

### Phase 1: Foundation (Week 1)
1. Database schema updates (trip cost, remove percentages)
2. Update calculation logic (locked advance by status)
3. Update dashboard summary API

### Phase 2: UI Updates (Week 2)
4. Update all 6 dashboard cards
5. Add new warnings
6. Update trip details page

### Phase 3: Trip Completion (Week 3)
7. Implement trip completion flow
8. Test profit calculation
9. Verify reserve release

### Phase 4: Polish (Week 4)
10. Data migration
11. Remove deprecated code
12. Comprehensive testing
13. Documentation

---

## ⚠️ Breaking Changes

**These changes are NOT backward compatible:**
1. Percentage-based advance splitting removed
2. Early unlock concept removed
3. Operating Pool (70%) concept changes meaning
4. Locked advance calculation completely different

**Migration Required:**
- Existing trips need status set correctly
- Locked advance needs recalculation
- Settings need to be reset/updated

---

## 🎯 Success Criteria

✅ Dashboard shows reality-based cash flow
✅ Trip obligations clearly visible at a glance
✅ Reserve shortfalls highlighted immediately
✅ No confusion about what money can be spent
✅ Profit only shows after trip completion
✅ Operating Account accurately reflects spendable cash
✅ All warnings work correctly
✅ Trip completion flow works smoothly

---

## Notes

- The new system is simpler conceptually (no percentages)
- Matches actual travel business operations
- More transparent about cash obligations
- Better alerts for financial risks
- Clearer profit calculation timeline
