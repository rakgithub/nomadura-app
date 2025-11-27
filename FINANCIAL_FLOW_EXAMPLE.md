# Complete Financial Flow Example - Travel Company

## Initial Setup
**Settings Configuration:**
- Trip Reserve: 60%
- Early Unlock: 20%
- Locked: 20%

---

## Day 1: Customer Advance Payment

**Customer Priya books "Goa Beach Trip"** (Total price: ₹30,000)
- Priya pays advance: **₹15,000**

### Automatic Split:
```
Trip Reserve (60%):    ₹9,000  → Protected for Goa trip expenses only
Early Unlock (20%):    ₹3,000  → Moves to Operating Account (you can spend)
Locked (20%):          ₹3,000  → Locked until trip completes
```

### Dashboard After This:
```
┌─────────────────────────────────────────────────┐
│ Bank Balance:           ₹15,000                 │
│   ├─ Advance Received:  ₹15,000                 │
│   └─ Earned Revenue:    ₹0                      │
├─────────────────────────────────────────────────┤
│ Operating Account:      ₹3,000 ✅ (Safe to use) │
│   ├─ Early Unlock:      ₹3,000                  │
│   └─ Business Expenses: ₹0                      │
├─────────────────────────────────────────────────┤
│ Trip Reserves:          ₹9,000 🔒 (Trip only)   │
│ Locked Advance:         ₹3,000 🔒 (Locked)      │
│ Withdrawable Profit:    ₹0                      │
└─────────────────────────────────────────────────┘
```

**What you can spend:** ₹3,000 (Operating Account only!)

---

## Day 2: Business Expense (Facebook Ads)

You want to run Facebook ads for ₹2,000.

### Source: Operating Account
```
Operating Account: ₹3,000 - ₹2,000 = ₹1,000 ✅
```

### Dashboard After This:
```
┌─────────────────────────────────────────────────┐
│ Bank Balance:           ₹13,000                 │
│   (Physical money in bank)                      │
├─────────────────────────────────────────────────┤
│ Operating Account:      ₹1,000 ✅               │
│   ├─ Early Unlock:      ₹3,000                  │
│   └─ Business Expenses: -₹2,000                 │
├─────────────────────────────────────────────────┤
│ Trip Reserves:          ₹9,000 🔒               │
│ Locked Advance:         ₹3,000 🔒               │
│ Withdrawable Profit:    ₹0                      │
└─────────────────────────────────────────────────┘
```

**What you can spend NOW:** ₹1,000 (Operating Account balance)

---

## Day 3: Trip Expense (Hotel Booking)

You book hotel for Goa trip: ₹4,000

### Source: Trip Reserve (Goa Trip)
```
Trip Reserve: ₹9,000 - ₹4,000 = ₹5,000 ✅
```

### Dashboard After This:
```
┌─────────────────────────────────────────────────┐
│ Bank Balance:           ₹9,000                  │
├─────────────────────────────────────────────────┤
│ Operating Account:      ₹1,000 ✅               │
│ Trip Reserves:          ₹5,000 🔒               │
│   (₹4,000 spent on hotel)                       │
│ Locked Advance:         ₹3,000 🔒               │
│ Withdrawable Profit:    ₹0                      │
└─────────────────────────────────────────────────┘
```

**What you can spend:** ₹1,000 (Operating Account)
**What's protected:** ₹5,000 (Trip Reserve - for Goa trip only)

---

## Day 5: Another Customer Advance

**Customer Rahul books "Manali Snow Trek"** (Total: ₹40,000)
- Rahul pays advance: **₹20,000**

### Automatic Split:
```
Trip Reserve (60%):    ₹12,000 → Protected for Manali trip
Early Unlock (20%):    ₹4,000  → Moves to Operating Account
Locked (20%):          ₹4,000  → Locked until completion
```

### Dashboard After This:
```
┌─────────────────────────────────────────────────┐
│ Bank Balance:           ₹29,000                 │
│   ├─ Advances:          ₹35,000                 │
│   └─ Earned:            ₹0                      │
│   └─ Expenses:          -₹6,000                 │
├─────────────────────────────────────────────────┤
│ Operating Account:      ₹5,000 ✅               │
│   ├─ Early Unlock:      ₹7,000                  │
│   └─ Business Expenses: -₹2,000                 │
├─────────────────────────────────────────────────┤
│ Trip Reserves:          ₹17,000 🔒              │
│   ├─ Goa Trip:          ₹5,000                  │
│   └─ Manali Trip:       ₹12,000                 │
│ Locked Advance:         ₹7,000 🔒               │
│   ├─ Goa:               ₹3,000                  │
│   └─ Manali:            ₹4,000                  │
│ Withdrawable Profit:    ₹0                      │
└─────────────────────────────────────────────────┘
```

**What you can spend:** ₹5,000 (Operating Account)

---

## Day 10: Try to Overspend (PREVENTED!)

You try to add business expense: ₹8,000 for office rent.

### System Check:
```
Operating Account: ₹5,000
Expense:          ₹8,000
Shortfall:        -₹3,000 ❌
```

### ⚠️ WARNING SHOWN:
```
┌─────────────────────────────────────────────────┐
│ ⚠️  INSUFFICIENT OPERATING FUNDS                │
│                                                 │
│ Available Operating Cash:    ₹5,000            │
│ Expense Amount:              ₹8,000            │
│ Shortfall:                   ₹3,000            │
│                                                 │
│ You are about to use customer advance money!   │
│                                                 │
│ [ Cancel ]  [ Proceed Anyway ]                 │
└─────────────────────────────────────────────────┘
```

**This prevents accidental overspending!**

---

## Day 20: Goa Trip Completes ✅

Trip status changed to "Completed"

### What Happens:
```
1. Locked Advance → Earned Revenue
   ₹3,000 unlocks and becomes earned revenue

2. Leftover Trip Reserve → Operating Account
   ₹5,000 moves to Operating Account

3. Calculate Profit:
   Earned Revenue:   ₹15,000 (customer paid)
   - Trip Expenses:  -₹4,000 (hotel)
   = Profit:         ₹11,000

4. Apply 30/70 Split:
   Profit Pool (30%):     ₹4,500  → Withdrawable
   Operating (70%):       ₹10,500 → To Operating Account
```

### Dashboard After Completion:
```
┌─────────────────────────────────────────────────┐
│ Bank Balance:           ₹29,000                 │
│   ├─ Advances:          ₹20,000 (Manali only)   │
│   └─ Earned:            ₹15,000 (Goa completed) │
│   └─ Expenses:          -₹6,000                 │
├─────────────────────────────────────────────────┤
│ Operating Account:      ₹15,500 ✅              │
│   ├─ From Goa Profit:   ₹10,500                 │
│   ├─ Leftover Reserve:  ₹5,000                  │
│   ├─ Early Unlock:      ₹4,000 (Manali)         │
│   └─ Business Expenses: -₹2,000                 │
├─────────────────────────────────────────────────┤
│ Trip Reserves:          ₹12,000 🔒 (Manali)     │
│ Locked Advance:         ₹4,000 🔒 (Manali)      │
│ Withdrawable Profit:    ₹4,500 💰               │
└─────────────────────────────────────────────────┘
```

**What you can spend NOW:** ₹15,500 (Operating Account)
**What you can withdraw:** ₹4,500 (Profit)

---

## Summary: The Two Types of Expenses

### 🏢 Business Expenses (Debited from Operating Account)
- Facebook Ads
- Office Rent
- Internet/Tools
- Designer fees
- Salaries
- Marketing

**Source:** Operating Account ONLY
- Comes from: Early Unlock + Completed Trip Profits
- **Warning shown if insufficient!**

### 🏖️ Trip Expenses (Debited from Trip Reserve)
- Hotels
- Transport
- Guide fees
- Food for group
- Activity costs

**Source:** Trip Reserve for THAT specific trip
- Cannot be used for other trips
- Cannot be used for business expenses
- **Warning shown if exceeds reserve!**

---

## Key Protection Mechanisms

### 1. **Operating Account = Safe to Spend**
```
If Operating Account shows ₹5,000
→ You can safely spend up to ₹5,000 on business expenses
```

### 2. **Warnings Before Overspending**
```
Business Expense > Operating Account
→ ⚠️ "You are about to use advance money!"
```

### 3. **Trip Reserve Protection**
```
Trip Expense > Trip Reserve
→ ⚠️ "Trip reserve will go negative by ₹X"
```

### 4. **Clear Visibility**
```
Dashboard always shows:
- Bank Balance (real money)
- Operating Account (what you can spend)
- Trip Reserves (protected per trip)
- Locked (completely locked)
```

---

## Quick Decision Guide

### "Can I spend ₹X on Facebook Ads?"
👉 Check **Operating Account**
- If Operating Account ≥ ₹X → ✅ Safe to spend
- If Operating Account < ₹X → ❌ Will use advance money!

### "Can I book ₹Y hotel for Mumbai trip?"
👉 Check **Trip Reserve** for Mumbai trip
- If Trip Reserve (Mumbai) ≥ ₹Y → ✅ Safe to spend
- If Trip Reserve (Mumbai) < ₹Y → ⚠️ Over budget!

### "How much money do I actually have?"
👉 Check **Bank Balance** (real money in bank)

### "How much can I spend on business?"
👉 Check **Operating Account** (safe business spending limit)

### "How much profit can I take home?"
👉 Check **Withdrawable Profit** (safe to withdraw)

---

## The Golden Rule

**Never trust Bank Balance alone!**

✅ Always check **Operating Account** before business expenses
✅ Always check **Trip Reserve** before trip expenses
✅ System will warn you if you're about to overspend

This prevents mixing advance money with operating money! 🎯
