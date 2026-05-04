-- Add metadata column to orders table to store payment references
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
