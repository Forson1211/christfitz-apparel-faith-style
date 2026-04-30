
-- =========================
-- CONTENT TABLE
-- =========================
-- This table tracks managed site content, including media uploads
CREATE TABLE IF NOT EXISTS public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'image', -- 'image', 'video', 'text', 'section'
  category TEXT NOT NULL DEFAULT 'general', -- 'hero', 'about', 'instagram', 'footer', 'media_library'
  url TEXT NOT NULL,
  file_path TEXT, -- Path in storage bucket
  metadata JSONB DEFAULT '{}'::jsonb,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read content"
  ON public.content FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage content"
  ON public.content FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_updated_at
    BEFORE UPDATE ON public.content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
