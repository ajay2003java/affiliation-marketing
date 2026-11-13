-- =============================================================================
-- CREATE 'provider-bills' STORAGE BUCKET IN SUPABASE (5 Policies to Match)
-- Run this in your Supabase Dashboard -> SQL Editor
-- =============================================================================

-- 1. Create the public storage bucket for provider bill receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'provider-bills',
    'provider-bills',
    true,
    52428800, -- 50 MB limit
    null      -- Accepts images (JPG, PNG) and PDFs
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Public Access for provider-bills" ON storage.objects;
DROP POLICY IF EXISTS "Anon Select for provider-bills" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Select for provider-bills" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload for provider-bills" ON storage.objects;
DROP POLICY IF EXISTS "Public Update for provider-bills" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete for provider-bills" ON storage.objects;

-- 3. The 5 RLS Policies (Identical setup to provider-rate-cards & mou-documents):
-- Policy 1: Anon users can read/view receipts
CREATE POLICY "Anon Select for provider-bills"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'provider-bills');

-- Policy 2: Authenticated users can read/view receipts
CREATE POLICY "Authenticated Select for provider-bills"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'provider-bills');

-- Policy 3: Upload receipts (INSERT)
CREATE POLICY "Public Upload for provider-bills"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'provider-bills');

-- Policy 4: Update receipts (UPDATE)
CREATE POLICY "Public Update for provider-bills"
ON storage.objects FOR UPDATE
USING (bucket_id = 'provider-bills');

-- Policy 5: Delete receipts (DELETE)
CREATE POLICY "Public Delete for provider-bills"
ON storage.objects FOR DELETE
USING (bucket_id = 'provider-bills');
