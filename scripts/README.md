# Database Scripts

This directory contains utility scripts for managing your database.

## Purge All Data Script

**File:** `purge-data.sql`

### Purpose
Deletes ALL data from all tables while preserving the database schema. Useful for:
- Resetting development/staging environments
- Starting fresh with test data
- Clearing out old test records

### ⚠️ WARNING
**This script is IRREVERSIBLE!** It will permanently delete all data from your database.
- **DO NOT** run this on production
- **ALWAYS** create a backup before running
- Only use in development or testing environments

### How to Use

#### Option 1: Via Supabase SQL Editor (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `purge-data.sql`
5. Review the script carefully
6. Click **Run** to execute

#### Option 2: Via Supabase CLI
```bash
# Make sure you're connected to the correct database
supabase db reset --local  # For local development

# For remote (staging/dev only - NEVER production)
# First, verify you're targeting the correct project
supabase link --project-ref <your-project-ref>

# Run the purge script
supabase db execute < scripts/purge-data.sql
```

### What the Script Does

1. **Disables triggers** temporarily to prevent cascading issues
2. **Deletes data** from all tables in the correct order (respecting foreign keys):
   - Child tables first (payments, advance_payments, expenses, participants)
   - Parent tables next (trips, business_expenses, withdrawals, transfers, destinations, settings)
3. **Re-enables triggers** after deletion
4. **Verifies** the purge by showing record counts (should all be 0)

### Tables Affected

- ✅ trips
- ✅ participants
- ✅ payments
- ✅ advance_payments
- ✅ expenses
- ✅ business_expenses
- ✅ withdrawals
- ✅ transfers
- ✅ destinations
- ✅ settings

### After Running the Script

After purging data, you may want to:
1. Create fresh test data
2. Run seed scripts if available
3. Verify the application works with empty state

### Verification

The script includes a verification query at the end that shows the count of records in each table. All counts should be **0** after successful execution.

Example output:
```
table_name         | record_count
-------------------+-------------
trips              | 0
participants       | 0
payments           | 0
advance_payments   | 0
expenses           | 0
business_expenses  | 0
withdrawals        | 0
transfers          | 0
destinations       | 0
settings           | 0
```

### Safety Features

- Script does NOT delete the schema (tables, columns, triggers, functions remain)
- Row-Level Security (RLS) policies are preserved
- Database structure remains intact
- Only data is removed

### Troubleshooting

**Error: "foreign key constraint violation"**
- The script disables triggers, but if you still see this error, check for any custom constraints
- Run the DELETE statements manually in the correct order

**Error: "permission denied"**
- Ensure you have sufficient database permissions
- You may need to be the table owner or have DELETE privileges

**Some records remain**
- Check if there are additional tables not included in this script
- Verify that triggers are properly disabled before deletion

## Creating Backups

Before running the purge script, always create a backup:

```bash
# Via Supabase CLI
supabase db dump -f backup-$(date +%Y%m%d-%H%M%S).sql

# Or via Supabase Dashboard
# Navigate to Database → Backups → Create backup
```

## Restoring from Backup

If you need to restore after purging:

```bash
# Via Supabase CLI
supabase db reset --db-url <your-database-url>
psql -h <host> -U <user> -d <database> -f backup-20250101-120000.sql
```
