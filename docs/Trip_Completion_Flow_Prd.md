Alright Rakesh, here’s a clean, detailed PRD for the **Trip Completion Flow**, fully aligned with the money logic you’re using:
Trip Reserve + Trip Spend Remaining → moves to Profit when a trip ends.

I'm writing this as a real PRD you can give to a developer.

---

# **PRODUCT REQUIREMENT DOCUMENT (PRD)**

## **Feature: Trip Completion Flow**

---

# **1. Overview**

When a trip is marked as completed, the system needs to finalize all money allocations for that trip and move any remaining balances into the company Profit Wallet.

The flow must be consistent, predictable, and easy for the user to understand. After completion:

* Trip expenses cannot be edited.
* All remaining money assigned to that trip becomes profit.
* Trip-specific balances are cleared out.
* Global Profit Wallet is updated instantly.

---

# **2. Goals**

1. Make trip completion a single, safe, intentional action.
2. Ensure all trip-related money is reconciled using the correct formula.
3. Update dashboard and trip details automatically without manual work.
4. Maintain transparency for where every rupee went.

---

# **3. Definitions**

### **Trip Reserve**

Amount locked for the trip from the initial advance.
Protected and not spendable until trip completes or expenses need it.

### **Trip Spend (Spendable for Trip)**

Amount you can use immediately for trip-related expenses.

### **Business Spend (Spendable for Business)**

Amount available for general business expenses.

### **Locked Profit**

Portion of the advance not spendable now and only becomes profit when the trip ends.

### **Profit Wallet**

Global wallet showing total accumulated profit across all trips.
Money here can be withdrawn anytime.

### **Final Profit Formula**

```
Final Profit = Trip Reserve + Remaining Trip Spend
```

---

# **4. Incentive Behind This Logic**

* Reserves protect the trip from overspending.
* Spendable Trip ensures flexibility.
* Spendable Business helps you run your operations.
* Profit only gets counted after the trip ends to keep finances clean.

---

# **5. Preconditions Before Trip Completion**

When user taps **Mark Trip Completed**, system must run validations:

### **Validation 1: Expense Check**

If no expenses added:

* Show soft warning:
  *You haven't added any expenses for this trip. You can continue, but remaining budget will become profit.*

### **Validation 2: Overspend Check**

If trip expenses > Trip Spend:

* The Business wallet already covered the extra amount.
* Show info message:
  *This trip exceeded the planned trip budget. Extra expenses were deducted from your Business Balance.*

### **Validation 3: Locked Amount Check**

If Trip Reserve or Locked Profit still > 0:

* No issue; they will be released during completion.

---

# **6. Trip Completion Flow (Step-by-Step)**

### **STEP 1: User taps Mark Trip Completed**

### **STEP 2: Show Final Summary Modal**

**Modal Title:**
Complete Trip?

**Modal Body:**
Show:

* Total Advance Received
* Total Trip Expenses
* Remaining Trip Spend
* Trip Reserve
* Final Profit Release Amount

**Profit Release Formula:**

```
Final Profit = Trip Reserve + Remaining Trip Spend
```

**Action Buttons:**

* Cancel
* Confirm Completion

---

# **7. System Actions on Confirmation**

Once the user confirms:

---

### **Action 1: Freeze the trip**

* Trip status becomes Completed
* No more editing of expenses, payments, or trip data
* Add read-only badge: *Trip Closed*

---

### **Action 2: Calculate Final Profit**

```
finalProfit = tripReserve + remainingTripSpend
```

#### **Example Calculation**

Advance: ₹15,000
Breakdown:

* Trip Reserve: ₹4,500
* Spendable Trip: ₹5,250
* Spendable Business: ₹5,250

Expenses added: ₹3,000
Remaining Trip Spend = 5,250 - 3,000 = ₹2,250

Final Profit = 4,500 + 2,250 = **₹6,750**

---

### **Action 3: Move Profit Into Global Profit Wallet**

* Profit Wallet += finalProfit
* Trip-level "Locked" disappears
* Dashboard updates instantly

---

### **Action 4: Zero Out Trip-Level Balances**

The following must reset to zero for that trip:

* Trip Reserve → 0
* Remaining Trip Spend → 0
* Locked Profit → 0
* Total Advance → preserved historically but not spendable
* Trip Budget → 0

Trip page should show the final snapshot only.

---

### **Action 5: Log the transaction**

Create a system log entry:

* Trip ID
* Final Profit Released
* Date/time
* Breakdown of amounts

This supports audit, history, and future reporting.

---

# **8. Post-Completion UI**

After completion, the trip page should show a clean summary with no clutter.

### **SECTION: Final Summary**

#### Card 1: **Total Profit Released**

Amount: ₹6,750

Small text:
This amount has been added to your Profit Wallet.

---

#### Card 2: **Breakdown**

* Trip Reserve Released: ₹4,500
* Unused Trip Budget: ₹2,250
* Total Profit: ₹6,750

---

#### Card 3: **Trip Status**

Completed
This trip is closed. No further updates can be made.

---

# **9. Dashboard Updates**

### **Profit Wallet**

Increase by finalProfit.

### **Locked Advance**

Decrease based on this trip’s locked portion.

### **Trip Reserves**

Decrease only for this trip.

### **Trip Count**

Moves from Active Trips → Past Trips.

---

# **10. Edge Cases**

### **Case 1: Trip overspent**

Expenses > Trip Spend

* Extra amount already deducted from Business Balance
* Trip Reserve still releases fully to Profit
* Remaining Trip Spend is 0

### **Case 2: No expenses added**

Remaining Trip Spend = full original Spendable Trip
Profit = Trip Reserve + full Spendable Trip

### **Case 3: User tries to reopen trip**

Not allowed.
Trips become fully read-only.

---

# **11. API Requirements**

### **POST /trip/{id}/complete**

**Body:** none
**Server actions:**

* Validate
* Calculate
* Update balances
* Log
* Return final snapshot

### **Response Example**

```
{
  "tripId": "T001",
  "status": "completed",
  "finalProfit": 6750,
  "reserveReleased": 4500,
  "tripSpendReleased": 2250,
  "profitWalletBalance": 16750
}
```

---

# **12. Success Criteria**

* Users understand exactly how much profit they made and why.
* No leftover locked balances after completion.
* Dashboard reflects changes instantly.
* No inconsistencies in money movements.
* Trip is cleanly archived.

---

If you want, I can also write the **exact UI text**, **modal designs**, and **developer notes for database schema updates**.
