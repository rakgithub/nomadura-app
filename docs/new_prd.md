
Product Requirements Document (PRD)
Feature: Expense-Aware Trip Finance Dashboard Purpose: Give travel business owners a single place to understand:
* How much cash is actually available
* How much cash is tied to upcoming trips
* How much they have already spent
* Whether they are running into reserve shortfalls
* When profit becomes withdrawable
This PRD aligns the UI with real-life travel business cash flow instead of strict accounting rules.

1. Core Problem
The current dashboard assumes:
* Advance money should stay untouched
* Operating money only comes from earned revenue
* Reserves stay constant
* Advance gets locked by percentage instead of by actual pending trips
This doesn't match how a travel agency works day-to-day.
Business owners do use advance for expenses temporarily. What they really need is clarity, not restriction.
This PRD fixes that gap.

2. High-Level Solution
Modify dashboard logic and card meanings so that:
1. Every rupee is accounted for
2. Trip obligations are clearly visible
3. Reserve shortfalls show up instantly
4. Locked advance = money tied to future trips
5. Profit is only calculated at trip completion

3. Dashboard Cards (Revised)
Below is exactly what each card should show, how to calculate values, and what text changes to make.

3.1 Bank Balance (Card 1)
Purpose: Show actual liquid cash.
Display:
* Actual money in bank
* Total Advance Received
* Earned Revenue
Logic:
Bank Balance = total amount currently in bank

Advance Received = sum of advance payments for trips not yet completed

Earned Revenue = revenue from completed trips only
Changes:
No structural changes. Text stays mostly the same.
Just re-label: "Advance Received" → "Active Advances (Upcoming Trips)"

3.2 Earned Revenue (Card 2)
Purpose: Show earnings only from completed trips.
Logic:
Earned Revenue = total price of completed trips
Profit Pool = Earned Revenue × 0.30
Operating Pool = Earned Revenue × 0.70
Unearned Advance = total advance from upcoming trips
Changes:
* Remove any assumption that advance gets split into 70/30.
* Make 70/30 apply only when a trip is completed.
Text Change:
Replace description with: "Revenue from completed trips. Split into Operating and Profit pools only after a trip finishes."

3.3 Operating Account (Card 3)
Purpose: Show all expenses paid from the bank and how much cash is available for operations.
Logic:
Operating Account Balance = Bank Balance - Required Trip Reserves

Total Expenses (cumulative)
    - Business Expenses
    - Trip Expenses
If Operating Account Balance < 0 → Show warning.
Changes Needed:
* Remove "Operating Pool (70%)" from this card.
* Add "Available Operating Cash".
* Add "Reserve Shortfall" line.
New Lines in Card:
* Available Operating Cash
* Business Expenses
* Trip Expenses
* Reserve Shortfall (if negative)

3.4 Withdrawable Profit (Card 4)
Purpose: Show profit that can be withdrawn.
Logic:
Withdrawable Profit = Profit Pool - Total Withdrawn
Profit Pool comes only from completed trips.
Changes:
No major logic change. Just update the description:
"Profit becomes available only when a trip is completed and revenue is earned."

3.5 Locked Advance (Card 5)
Purpose: Show advance money still tied to upcoming trips.
New Logic (Important):
Locked Advance = sum of all advances for trips not yet completed
Unlocked Advance = total advance for trips completed
We stop using percentage-based locking.
Changes Needed:
* Completely remove the idea of 30% lock.
* Lock is now tied to actual trip status (upcoming vs. completed).
Text Change:
Old: "Reserved portion of customer advances that will convert to earned revenue upon trip completion."
New: "Advance amounts for all upcoming trips. These funds are still owed as service delivery."

3.6 Trip Reserves (Card 6)
Purpose: Show how much money is required to deliver all pending trips and whether the bank has enough.
New Logic:
Reserve Required = sum(expected cost of all upcoming trips)

Reserve Available = Bank Balance - (Operating Expenses to date)

Reserve Shortfall = Reserve Required - Reserve Available
If Reserve Shortfall > 0 → Show an alert: "You are short by ₹X to fulfill upcoming trips."
Changes Needed:
* Replace static reserve amount with calculated reserve requirement.
* Show the gap between required reserve and available cash.
* Add shortfall warning.
Text Change:
Old: "Protected funds reserved for trip expenses only."
New: "Amount needed to safely deliver all upcoming trips. Shows whether current bank balance is enough to cover upcoming obligations."

4. How Example Fits into This Dashboard
With the Goa + Kerala example:
* Bank balance = ₹18,000
* Reserve required (only Kerala left) = ₹20,000
* Shortfall = ₹2,000
This appears in:
Operating Account
Reserve Shortfall: ₹2,000
Trip Reserves
Required: ₹20,000 Available: ₹18,000 Shortfall: ₹2,000
Locked Advance
₹20,000 (Kerala advance)
Everything updates organically.

5. Additional Warnings & UX
Add global warnings:
1. Reserve Shortfall Warning Color: Red Message: "You are short by ₹X to deliver upcoming trips."
2. Low Operating Cash Warning Trigger when operating balance < ₹5,000.
3. Profit Unavailable Until Trips Complete Shown when user tries to withdraw profit while no completed trips exist.

6. Developer Notes
Data needed from backend:
For each trip:
* Trip status (upcoming or completed)
* Trip cost estimate
* Advance received
* Total price
* Trip expenses logged
Calculations should run in real-time whenever:
* A payment is logged
* An expense is added
* A trip is marked completed

7. Summary of Required Text Changes
Here’s a compact list you can hand directly to a designer:
Card	Old Text	New Text
Bank Balance	Advance Received	Active Advances (Upcoming Trips)
Earned Revenue	Existing description	Revenue from completed trips. Split into Operating and Profit pools only after trip completion.
Operating Account	Operating Pool (70%)	Remove. Add Available Operating Cash + Reserve Shortfall.
Locked Advance	Reserved portion of customer advances…	Advance amounts for upcoming trips that are still owed as service delivery.
Trip Reserves	Protected funds for trip expenses	Amount required to safely deliver upcoming trips, plus shortfall if any.
Make a todo list based on this PRD and save it in .md file