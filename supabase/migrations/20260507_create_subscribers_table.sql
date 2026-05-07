-- Create subscribers table
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed'))
);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (subscribe)
CREATE POLICY "Allow anonymous subscription" ON public.subscribers
    FOR INSERT WITH CHECK (true);

-- Policy: Allow admins to select/view subscribers
CREATE POLICY "Allow admins to manage subscribers" ON public.subscribers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE subscribers;
