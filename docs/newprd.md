PRODUCT REQUIREMENT DOCUMENT (PRD)
Feature: Trip Money Flow card updates. This is to update cards shown in trip detais page
1. Overview

The goal is to build a clear and intuitive money-flow system for each trip so you (the operator) always know:

How much money you can spend right now

How much is reserved

How much becomes profit

How much is locked until the trip ends

How the customer's advance gets split and tracked

This removes confusion that existed with words like Early Unlock, Operating Account, and Locked Revenue.

2. Core Concepts
2.1 Advance Amount

The total money collected upfront from the customer for a specific trip.

2.2 Trip Reserve (Locked)

A fixed percentage of the advance that:

Cannot be used until the trip ends

Is preserved ONLY for that specific trip

Becomes profit after trip completion if unused

Default example: 30% of the advance

2.3 Spendable for This Trip (Trip Spend Now)

A portion of the available amount that can be used immediately for trip-related expenses:

Hotels

Transport

Activities

Local logistics

2.4 Spendable for Business (Business Spend Now)

Budget available immediately for:

Ads

Tools

Software

Crew salaries

General business expenses

2.5 Locked Profit

Money that becomes profit only after the trip is marked completed.
Includes:

Trip Reserve amount

Any remaining unused trip spend

3. Money Flow Logic (with example)

Advance Received: ₹15,000
Reserve Percentage: 30%

3.1 Calculation

Trip Reserve
30% of 15,000 = ₹4,500

Available Now
Remaining 70% = ₹10,500

Split Available Now

Spendable for Trip: 50% = ₹5,250

Spendable for Business: 50% = ₹5,250

Locked Profit
Initially = Trip Reserve = ₹4,500
After trip ends:
Locked Profit = Trip Reserve + Unused Trip Spend

4. Trip Page UI Cards & Text

These cards appear on every individual trip page.

1. Total Advance

Value: ₹15,000
Description:
Money collected in advance for this trip.

2. Trip Reserve (Locked)

Value: ₹4,500
Description (UX text):
Saved for this trip only. This amount stays locked until the trip is completed. Any unused amount will turn into profit after the trip.

3. Spendable for This Trip

Value: ₹5,250
Description (UX text):
Amount you can use right now for trip expenses like stays, transport, and activities.

4. Spendable for Business

Value: ₹5,250
Description (UX text):
Amount you can use immediately for business expenses such as marketing, ads, tools, or operations.

5. Locked Profit

Value: ₹4,500 (initially)
Description (UX text):
This becomes your profit once the trip is marked completed. If any trip budget remains unused, it gets added here automatically.

5. Trip Completion Logic

When you mark a trip as completed:

Locked Profit = Trip Reserve + Unused Trip Spend


All locked profit now transfers to the global Profit Wallet on the dashboard.

6. Dashboard Structure

Your dashboard needs four global cards:

1. Total Profit

Description:
This is the total profit earned from all completed trips. You can withdraw this anytime.

Logic:
Sum of all Locked Profit released from completed trips.

2. Business Balance

Description:
Money available for your business activities right now.

Logic:
Sum of all Business Spend Now buckets from active and past trips minus business expenses spent.

3. Trip Balances

Description:
Combined total of all Spendable for Trip amounts across active trips.

Logic:
Sum of (Spendable for Trip - Trip Expenses Spent) for all active trips.

4. Upcoming Locked Reserve

Description:
Total reserved money across all ongoing trips that will convert to profit after completion.

Logic:
Sum of Trip Reserve values for all active trips.

7. User Stories
US1 – Setup

As the owner, I want to define the reserve percentage so that my system can auto-split future advances.

US2 – Advance Received

As the owner, when I enter an advance amount, the system should automatically split it into:

Trip Reserve

Spendable for Trip

Spendable for Business

Initial Locked Profit

US3 – Track Spending

As the owner, I want to record expenses against:

Trip budget

Business budget
So that I always know what remains.

US4 – Trip Completion

As the owner, I want to mark a trip completed so that:

All locked amounts convert to profit

Dashboard gets updated

US5 – View Dashboard

As the owner, I want a clean dashboard showing:

Profit

Spendable for Business

Spendable for Trip

Locked Reserve

8. Edge Cases
Case 1: Trip overshoots trip budget

If trip expenses > trip budget
→ Extra amount must be taken manually from Business Spend Now (confirmed through prompt).

Case 2: Customer pays additional amount

Apply the same splitting logic again.

Case 3: Refund is issued

Refund deducted proportionally from:

Trip Spend Now remaining

Trip Reserve

Business Spend Now remaining

9. Success Metrics

Clear visibility of budgets

No more confusion about locked/unlocked states

Less manual tracking

Operator always knows what is safe to spend

Trips become profitable organically