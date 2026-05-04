-- Add tag column to categories table for marketing labels (e.g. Daily Wear, Bestseller)
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS tag TEXT;
