# Clear All Data Scripts

These scripts will **DELETE ALL DATA** from your database tables. Use them when you want to start fresh with real test data.

## ⚠️ WARNING

**These scripts are DESTRUCTIVE and IRREVERSIBLE!**
- All trip data will be deleted
- All participants will be deleted
- All payments will be deleted
- All expenses will be deleted
- All business expenses will be deleted
- All withdrawals will be deleted

**Table structures will remain intact** - only the data is deleted.

---

## Which Script to Use?

### Option 1: `CLEAR_ALL_DATA.sql` (DELETE)
**Use this if:** You want a safer, more controlled deletion

**Pros:**
- Can be rolled back (if in a transaction)
- More control over the process
- Respects foreign key order explicitly

**Cons:**
- Slower for large datasets

### Option 2: `CLEAR_ALL_DATA_TRUNCATE.sql` (TRUNCATE) ⚡
**Use this if:** You want the fastest way to clear everything

**Pros:**
- Much faster than DELETE
- Automatically handles foreign keys with CASCADE
- Resets auto-increment sequences

**Cons:**
- Cannot be rolled back
- More aggressive

---

## How to Run

### Method 1: Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of your chosen script
4. **DOUBLE CHECK you want to delete everything**
5. Click **Run**
6. Verify the results show 0 rows for all tables

### Method 2: Supabase CLI

```bash
# Using TRUNCATE version (faster)
npx supabase db execute --file supabase/CLEAR_ALL_DATA_TRUNCATE.sql

# Using DELETE version (safer)
npx supabase db execute --file supabase/CLEAR_ALL_DATA.sql
```

---

## After Clearing Data

Your database is now empty and ready for real data! You can:

1. **Create trips** via the UI at `/trips`
2. **Add participants and payments** to those trips
3. **Track trip expenses**
4. **Add business expenses** at `/business-expenses`
5. **Record withdrawals** at `/withdrawals`

The dashboard will calculate your 30/70 fund separation automatically!

---

## Verification

After running either script, you should see output like:

```
table_name          | row_count
--------------------|----------
trips               | 0
participants        | 0
payments            | 0
expenses            | 0
business_expenses   | 0
withdrawals         | 0
```

All counts should be **0**.

---

## Need to Restore Data?

If you accidentally cleared your production data:

1. Check if you have a Supabase backup
2. Go to **Database** → **Backups** in your dashboard
3. Restore from the most recent backup

**Pro tip:** Always test on a development/staging database first!
