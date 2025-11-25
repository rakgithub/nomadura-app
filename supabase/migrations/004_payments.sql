-- Create payments table for tracking payment history
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_participant_id ON public.payments(participant_id);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage payments for their trip participants
CREATE POLICY "Users can manage payments for their participants"
  ON public.payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.participants p
      JOIN public.trips t ON t.id = p.trip_id
      WHERE p.id = payments.participant_id
      AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.participants p
      JOIN public.trips t ON t.id = p.trip_id
      WHERE p.id = payments.participant_id
      AND t.user_id = auth.uid()
    )
  );
