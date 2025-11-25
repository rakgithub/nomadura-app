# Fund Separation Implementation TODO

Implementation checklist for the 30/70 fund separation system.

---

## Phase 1: Database Schema

- [ ] **1.1** Create migration `006_business_expenses.sql`
  - Add `business_expenses` table
  - Include: id, user_id, description, amount, category, date, created_at
  - Set up RLS policies for user isolation
  - Add indexes on user_id and date

- [ ] **1.2** Create migration `007_withdrawals.sql`
  - Add `withdrawals` table
  - Include: id, user_id, amount, date, notes, created_at
  - Set up RLS policies for user isolation
  - Add indexes on user_id and date

---

## Phase 2: TypeScript Types

- [ ] **2.1** Add new types to `src/types/database.ts`
  - `BusinessExpenseCategory` enum type
  - `business_expenses` table types (Row, Insert, Update)
  - `withdrawals` table types (Row, Insert, Update)
  - Helper types: `BusinessExpense`, `Withdrawal`, etc.

- [ ] **2.2** Create `src/types/financial.ts`
  - `FinancialSummary` interface
  - Export all financial-related types

---

## Phase 3: Utility Functions

- [ ] **3.1** Create `src/lib/calculations/fund-separation.ts`
  - Implement `calculateFundSeparation()` function
  - Add TypeScript types and JSDoc comments
  - Include unit test examples in comments

---

## Phase 4: API Endpoints - Dashboard Summary

- [ ] **4.1** Create `src/app/api/dashboard/summary/route.ts`
  - GET endpoint to fetch financial summary
  - Aggregate all trips payments (total revenue)
  - Aggregate all trip expenses
  - Aggregate all business expenses
  - Aggregate all withdrawals
  - Apply `calculateFundSeparation()` function
  - Return `FinancialSummary` object

---

## Phase 5: API Endpoints - Business Expenses

- [ ] **5.1** Create `src/app/api/business-expenses/route.ts`
  - GET: List all business expenses for authenticated user
  - POST: Create new business expense
  - Validate required fields
  - Include error handling

- [ ] **5.2** Create `src/app/api/business-expenses/[id]/route.ts`
  - GET: Get single business expense
  - PUT: Update business expense
  - DELETE: Delete business expense

---

## Phase 6: API Endpoints - Withdrawals

- [ ] **6.1** Create `src/app/api/withdrawals/route.ts`
  - GET: List all withdrawals for authenticated user
  - POST: Create new withdrawal
  - Validate withdrawal amount doesn't exceed withdrawable profit
  - Include error handling

- [ ] **6.2** Create `src/app/api/withdrawals/[id]/route.ts`
  - GET: Get single withdrawal
  - PUT: Update withdrawal
  - DELETE: Delete withdrawal

---

## Phase 7: React Hooks

- [ ] **7.1** Create `src/hooks/use-financial-summary.ts`
  - Custom hook to fetch financial summary
  - Handle loading and error states
  - Return `FinancialSummary` data

- [ ] **7.2** Create `src/hooks/use-business-expenses.ts`
  - Hook for fetching business expenses list
  - Hook for creating business expense
  - Hook for updating business expense
  - Hook for deleting business expense

- [ ] **7.3** Create `src/hooks/use-withdrawals.ts`
  - Hook for fetching withdrawals list
  - Hook for creating withdrawal
  - Hook for updating withdrawal
  - Hook for deleting withdrawal

---

## Phase 8: UI Components - Dashboard Cards

- [ ] **8.1** Create `src/components/dashboard/business-revenue-card.tsx`
  - Display total revenue
  - Show 30% | 70% split visualization
  - Add trend indicator (future enhancement)

- [ ] **8.2** Create `src/components/dashboard/operating-account-card.tsx`
  - Display current balance
  - Show status indicator (healthy/warning/critical)
  - Display remaining percentage of operating pool

- [ ] **8.3** Create `src/components/dashboard/withdrawable-profit-card.tsx`
  - Display available profit
  - "Withdraw" button (opens modal)
  - Disabled state when $0

- [ ] **8.4** Create `src/components/dashboard/financial-summary.tsx`
  - Container component for all three cards
  - Responsive grid layout
  - Loading skeleton states
  - Error handling

---

## Phase 9: UI Components - Withdrawal Modal

- [ ] **9.1** Create `src/components/withdrawals/withdrawal-modal.tsx`
  - Form to record withdrawal
  - Amount input with validation
  - Date picker
  - Notes textarea
  - Submit and cancel actions

---

## Phase 10: UI Components - Business Expenses

- [ ] **10.1** Create `src/components/business-expenses/business-expense-form.tsx`
  - Form to add business expense
  - Fields: description, amount, category, date
  - Category dropdown (rent, software, marketing, insurance, other)
  - Validation

- [ ] **10.2** Create `src/components/business-expenses/business-expense-list.tsx`
  - Table/list view of business expenses
  - Sort by date
  - Edit and delete actions
  - Total sum display

---

## Phase 11: Dashboard Page Update

- [ ] **11.1** Update `src/app/(dashboard)/dashboard/page.tsx`
  - Remove hardcoded stat cards
  - Add `<FinancialSummary />` component
  - Add loading states
  - Add error handling with retry

---

## Phase 12: Navigation & Routes

- [ ] **12.1** Add business expenses page
  - Create `src/app/(dashboard)/business-expenses/page.tsx`
  - Display list and form
  - Use hooks for data fetching/mutations

- [ ] **12.2** Add withdrawals page
  - Create `src/app/(dashboard)/withdrawals/page.tsx`
  - Display withdrawal history
  - Add withdrawal button/modal

- [ ] **12.3** Update sidebar navigation
  - Add "Business Expenses" link in `src/components/layout/sidebar.tsx`
  - Add "Withdrawals" link
  - Add icons for both

---

## Phase 13: Testing & Validation

- [ ] **13.1** Test database migrations
  - Run migrations on development database
  - Verify tables created correctly
  - Test RLS policies

- [ ] **13.2** Test API endpoints
  - Test all CRUD operations
  - Test authentication requirements
  - Test validation and error handling

- [ ] **13.3** Test calculations
  - Verify 30/70 split calculation
  - Test edge cases (negative operating account, zero withdrawals)
  - Test with sample data

- [ ] **13.4** Test UI components
  - Test all dashboard cards display correctly
  - Test withdrawal flow
  - Test business expense CRUD
  - Test responsive design

---

## Phase 14: Documentation

- [ ] **14.1** Update README
  - Document new features
  - Add setup instructions for new tables

- [ ] **14.2** Add inline code comments
  - Document complex calculations
  - Add JSDoc to public functions

---

## Estimated Implementation Order

1. **Database** (Phase 1) - Foundation
2. **Types** (Phase 2) - Type safety
3. **Calculations** (Phase 3) - Core logic
4. **API - Summary** (Phase 4) - Dashboard data
5. **Hooks - Summary** (Phase 7.1) - Data fetching
6. **Dashboard Cards** (Phase 8) - UI display
7. **Dashboard Update** (Phase 11) - Integration
8. **API - Expenses/Withdrawals** (Phase 5, 6) - Full CRUD
9. **Hooks - Expenses/Withdrawals** (Phase 7.2, 7.3) - Mutations
10. **Withdrawal Modal** (Phase 9) - User interaction
11. **Business Expenses UI** (Phase 10) - Management
12. **New Pages** (Phase 12) - Full feature access
13. **Testing** (Phase 13) - Quality assurance
14. **Documentation** (Phase 14) - Finalization

---

## Dependencies Between Phases

- Phase 2 depends on Phase 1 (types need DB schema)
- Phase 3 depends on Phase 2 (calculations need types)
- Phase 4 depends on Phase 1, 2, 3 (API needs DB, types, calculations)
- Phase 7 depends on Phase 4 (hooks need API)
- Phase 8 depends on Phase 2, 7 (UI needs types and hooks)
- Phase 11 depends on Phase 8 (dashboard needs cards)
- Everything else can be done in parallel after Phase 4
