# Database Migration Instructions

This guide explains how to run the fund separation feature migrations for your Supabase database.

## Option 1: Run via Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** from the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase/RUN_THIS_MIGRATION.sql`
6. Paste it into the SQL editor
7. Click **Run** (or press Cmd+Enter)
8. Wait for confirmation that all statements executed successfully

## Option 2: Install Supabase CLI and Link Project

### Step 1: Install Supabase CLI

```bash
# Using npm
npm install -g supabase

# Or using Homebrew (macOS)
brew install supabase/tap/supabase
```

### Step 2: Login to Supabase

```bash
npx supabase login
```

This will open a browser window to authenticate.

### Step 3: Link Your Project

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

You can find your project ref in your Supabase dashboard URL:
`https://app.supabase.com/project/YOUR_PROJECT_REF`

### Step 4: Push Migrations

```bash
npx supabase db push
```

This will apply all pending migrations including the new ones.

## Verify Migration Success

After running the migration, verify it worked by checking:

1. In Supabase Dashboard > **Table Editor**:
   - You should see `business_expenses` table
   - You should see `withdrawals` table

2. In Supabase Dashboard > **Database** > **Policies**:
   - You should see RLS policies for both tables

3. Test the app:
   - Visit `/dashboard` - should load without errors
   - Visit `/business-expenses` - should load without errors
   - Visit `/withdrawals` - should load without errors

## What These Migrations Do

### Migration 006: Business Expenses
- Creates `business_expense_category` enum (rent, software, marketing, insurance, other)
- Creates `business_expenses` table with RLS policies
- Adds indexes for performance
- Sets up auto-updating timestamps

### Migration 007: Withdrawals
- Creates `withdrawals` table with RLS policies
- Adds indexes for performance
- Sets up auto-updating timestamps
- Adds amount validation (must be > 0)

## Troubleshooting

### Error: "function update_updated_at_column() does not exist"

This means the trigger function wasn't created in earlier migrations. Add this before running the migration:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';
```

### Error: "type already exists"

This is usually safe to ignore if you're re-running migrations. The `IF NOT EXISTS` clauses will prevent duplicate table creation.

### Error: "auth.users does not exist"

Make sure you're running this on a Supabase project with authentication enabled.

## Need Help?

If you encounter any issues:
1. Check the Supabase logs in your dashboard
2. Verify your database connection in `.env.local`
3. Make sure your Supabase project has auth enabled
