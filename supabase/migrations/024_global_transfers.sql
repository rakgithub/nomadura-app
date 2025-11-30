-- Migration: Global Transfers System
-- Purpose: Enable money transfers between global financial buckets
-- Supports: Profit → Trip Balances/Business, Business → Trip Balances, etc.
--
-- GLOBAL BUCKETS:
-- FROM: profit_withdrawable, business_account, trip_balances, trip_reserves
-- TO: trip_balances, business_account

-- Create global_transfers table
CREATE TABLE IF NOT EXISTS global_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Transfer details
  from_bucket TEXT NOT NULL CHECK (from_bucket IN (
    'profit_withdrawable',
    'business_account',
    'trip_balances',
    'trip_reserves'
  )),
  to_bucket TEXT NOT NULL CHECK (to_bucket IN (
    'trip_balances',
    'business_account'
  )),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),

  -- Transaction metadata
  notes TEXT,
  transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT different_buckets CHECK (from_bucket != to_bucket)
);

-- Indexes for performance
CREATE INDEX idx_global_transfers_user_id ON global_transfers(user_id);
CREATE INDEX idx_global_transfers_transfer_date ON global_transfers(transfer_date DESC);
CREATE INDEX idx_global_transfers_user_date ON global_transfers(user_id, transfer_date DESC);

-- Enable Row Level Security
ALTER TABLE global_transfers ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own transfers
CREATE POLICY "Users can view their own global transfers"
  ON global_transfers
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can create their own transfers
CREATE POLICY "Users can create their own global transfers"
  ON global_transfers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users cannot update or delete transfers (immutable history)
-- No UPDATE or DELETE policies - transfers are permanent audit records

-- Add helpful comments
COMMENT ON TABLE global_transfers IS 'Records money transfers between global financial buckets. Immutable history for audit trail.';
COMMENT ON COLUMN global_transfers.from_bucket IS 'Source bucket: profit_withdrawable, business_account, trip_balances, or trip_reserves';
COMMENT ON COLUMN global_transfers.to_bucket IS 'Destination bucket: trip_balances or business_account';
COMMENT ON COLUMN global_transfers.notes IS 'Optional user notes about the transfer';
