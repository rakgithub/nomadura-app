# TODO: Trip Completion Flow Implementation

Based on `Trip_Completion_Flow_Prd.md`

## Phase 1: Database & Backend Foundation

### 1.1 Database Schema Updates
- [ ] Review existing trip status field (should support: upcoming, in_progress, completed, cancelled)
- [ ] Verify `released_profit` field exists in trips table (added in migration 018)
- [ ] Create trip_completion_logs table for audit trail
  - trip_id (foreign key)
  - final_profit
  - reserve_released
  - trip_spend_released
  - completed_at
  - completed_by (user_id)
  - breakdown (JSON)

### 1.2 API Endpoint - Trip Completion
- [ ] Create `POST /api/trips/{id}/complete` endpoint
- [ ] Implement validation checks:
  - Trip must be in "upcoming" or "in_progress" status
  - Trip must belong to authenticated user
  - Trip cannot already be completed
- [ ] Implement pre-completion checks:
  - Check if no expenses added (soft warning)
  - Check if trip overspent (info message)
  - Calculate final numbers for confirmation modal
- [ ] Return pre-completion summary data for modal display

### 1.3 Trip Completion Logic
- [ ] Implement final profit calculation:
  - `finalProfit = trip_reserve_balance + operating_account (remaining trip spend)`
- [ ] Update trip record:
  - Set status to 'completed'
  - Set released_profit field
  - Zero out trip_reserve_balance
  - Zero out operating_account
  - Preserve business_account (already moved to global)
- [ ] Create completion log entry
- [ ] Return completion response with final snapshot

## Phase 2: Frontend - Completion Flow UI

### 2.1 Trip Details Page - Complete Button
- [ ] Add "Mark as Completed" button to trip details header
- [ ] Show button only for upcoming/in_progress trips
- [ ] Disable button if trip has no advances received
- [ ] Add loading state during completion process

### 2.2 Pre-Completion Summary Modal
- [ ] Create CompleteTripModal component
- [ ] Display trip summary:
  - Total Advance Received
  - Total Trip Expenses
  - Remaining Trip Spend
  - Trip Reserve
  - **Final Profit Release Amount** (highlighted)
- [ ] Show formula explanation: "Trip Reserve + Remaining Trip Spend"
- [ ] Display warnings if applicable:
  - No expenses added
  - Trip overspent
- [ ] Add Cancel and Confirm buttons
- [ ] Implement confirmation flow

### 2.3 Completion API Integration
- [ ] Create `useCompleteTrip` hook with React Query
- [ ] Call pre-completion endpoint to get summary data
- [ ] Call completion endpoint on user confirmation
- [ ] Handle loading and error states
- [ ] Invalidate queries on success:
  - Trip details query
  - Dashboard summary query
  - Trips list query

## Phase 3: Post-Completion UI

### 3.1 Completed Trip Badge & Status
- [ ] Add "Trip Closed" badge to completed trips
- [ ] Show read-only state indicator on trip details page
- [ ] Disable all edit buttons for completed trips:
  - Cannot add/edit expenses
  - Cannot add/edit payments
  - Cannot add/edit participants
  - Cannot change trip details

### 3.2 Completed Trip Summary Cards
- [ ] Create CompletedTripSummary component
- [ ] Card 1: Total Profit Released
  - Show final profit amount
  - Subtitle: "This amount has been added to your Profit Wallet"
- [ ] Card 2: Breakdown
  - Trip Reserve Released
  - Unused Trip Budget
  - Total Profit
- [ ] Card 3: Trip Status
  - "Completed" status
  - "This trip is closed. No further updates can be made."
- [ ] Replace regular trip money flow cards with completed summary

### 3.3 Completion Success Message
- [ ] Show success toast/notification after completion
- [ ] Display completion timestamp
- [ ] Show link to view updated Profit Wallet on dashboard

## Phase 4: Dashboard Integration

### 4.1 Dashboard Updates on Completion
- [ ] Verify Profit Wallet auto-updates (already implemented via released_profit)
- [ ] Verify Trip Reserves decreases for completed trip
- [ ] Verify Trip Balances excludes completed trips
- [ ] Update active trips count
- [ ] Move trip from Active to Completed in trips list

### 4.2 Completion History
- [ ] Add "Completed Trips" section to trips page
- [ ] Show completion date for each trip
- [ ] Display profit released per trip
- [ ] Add filter to view only completed trips

## Phase 5: Edge Cases & Validation

### 5.1 Overspent Trips
- [ ] Handle case where trip_expenses > operating_account
- [ ] Show info message: "This trip exceeded planned budget. Extra expenses were deducted from Business Balance"
- [ ] Ensure Trip Reserve still releases fully to profit
- [ ] Ensure remaining trip spend is 0

### 5.2 No Expenses Added
- [ ] Detect trips with 0 expenses
- [ ] Show warning: "You haven't added any expenses. Remaining budget will become profit"
- [ ] Allow user to continue or cancel to add expenses first

### 5.3 Re-opening Trips (Not Allowed)
- [ ] Ensure no "Reopen Trip" functionality exists
- [ ] Make completed trips fully read-only
- [ ] Document this limitation in UI/help text

### 5.4 Partial Advances
- [ ] Handle trips where not all participants have paid
- [ ] Calculate profit based on actual advances received
- [ ] Show summary of unpaid amounts (informational only)

## Phase 6: Testing & Verification

### 6.1 Unit Tests
- [ ] Test final profit calculation logic
- [ ] Test completion validation checks
- [ ] Test database updates during completion
- [ ] Test error handling for invalid states

### 6.2 Integration Tests
- [ ] Test complete flow end-to-end:
  1. Create trip
  2. Add advance payments
  3. Add some expenses
  4. Complete trip
  5. Verify dashboard updates
  6. Verify trip is read-only

### 6.3 Edge Case Testing
- [ ] Test overspent trip completion
- [ ] Test trip with no expenses
- [ ] Test trip with 100% expenses (no remainder)
- [ ] Test simultaneous completions (if applicable)

### 6.4 UI/UX Testing
- [ ] Test modal flows
- [ ] Test loading states
- [ ] Test error messages
- [ ] Test success notifications
- [ ] Test read-only state enforcement

## Phase 7: Documentation & Polish

### 7.1 User Documentation
- [ ] Create help text explaining completion flow
- [ ] Add tooltips to completion modal
- [ ] Document what happens when trip is completed
- [ ] Explain why completed trips are read-only

### 7.2 Developer Documentation
- [ ] Document completion API endpoints
- [ ] Document database schema changes
- [ ] Document completion logic and formulas
- [ ] Add code comments for complex calculations

### 7.3 Polish
- [ ] Add animations for completion flow
- [ ] Improve modal design and spacing
- [ ] Add confirmation step before irreversible action
- [ ] Add keyboard shortcuts (Esc to cancel, Enter to confirm)

## Success Criteria Checklist

- [ ] Users can complete trips with one button click
- [ ] Completion modal shows clear breakdown of profit calculation
- [ ] Final profit is correctly calculated: `Trip Reserve + Remaining Trip Spend`
- [ ] Dashboard Profit Wallet updates instantly
- [ ] Completed trips are completely read-only
- [ ] All trip balances are zeroed out correctly
- [ ] Completion is logged for audit purposes
- [ ] UI clearly shows trip is completed with badge/status
- [ ] No money inconsistencies or leftover locked balances
- [ ] Edge cases (overspend, no expenses) are handled gracefully

## Notes

- The `released_profit` field was already added in migration 018 with automatic trigger
- Need to verify trigger is working correctly for manual completions via UI
- Consider adding bulk completion feature for multiple trips later
- May want to add "undo" feature within 24 hours (future enhancement)
