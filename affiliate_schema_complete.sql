-- =============================================================================
-- sBLOOM AFFILIATE & ADVISOR PLATFORM - COMPLETE PRODUCTION SCHEMA
-- Safely drops old empty tables and creates the full 8-table affiliate engine.
-- DOES NOT TOUCH: providers, provider_agreements, provider_offerings, admin_mou_uploads.
-- =============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop old empty placeholder tables (safe: providers & agreements are preserved)
DROP TABLE IF EXISTS public.invoice_commissions CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.commissions CASCADE;
DROP TABLE IF EXISTS public.lead_status_history CASCADE;
DROP TABLE IF EXISTS public.lead_services CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =============================================================================
-- 1. PROFILES (Affiliates & Advisors)
-- =============================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2),
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL CHECK (char_length(trim(phone)) >= 8),
    referral_code TEXT NOT NULL UNIQUE CHECK (char_length(trim(referral_code)) >= 3),
    category TEXT NOT NULL DEFAULT 'Tech & Digital Creators',
    payout_upi TEXT,
    role TEXT NOT NULL DEFAULT 'affiliate' CHECK (role IN ('affiliate', 'admin')),
    approval_status TEXT NOT NULL DEFAULT 'approved' CHECK (approval_status IN ('approved', 'suspended', 'rejected')),
    notification_whatsapp BOOLEAN NOT NULL DEFAULT TRUE,
    notification_email BOOLEAN NOT NULL DEFAULT TRUE,
    is_demo_account BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 2. SERVICES (Master Catalogue visible to Affiliates)
-- Connected to providers so services can be attributed to clinics/hospitals
-- =============================================================================
CREATE TABLE public.services (
    id TEXT PRIMARY KEY,
    provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    tagline TEXT NOT NULL,
    commission_rate_pct NUMERIC(5,2) NOT NULL CHECK (commission_rate_pct >= 0 AND commission_rate_pct <= 100),
    avg_payout_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    cookie_duration_days INTEGER NOT NULL DEFAULT 60 CHECK (cookie_duration_days > 0),
    description TEXT NOT NULL,
    features TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 3. LEADS (Submitted by Affiliates)
-- Connected to profiles (affiliate) AND providers (the clinic fulfilling it)
-- =============================================================================
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number TEXT NOT NULL UNIQUE,
    affiliate_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
    affiliate_code TEXT NOT NULL,
    business_name TEXT NOT NULL CHECK (char_length(trim(business_name)) >= 2),
    contact_name TEXT NOT NULL CHECK (char_length(trim(contact_name)) >= 2),
    email TEXT NOT NULL,
    phone TEXT NOT NULL CHECK (char_length(trim(phone)) >= 8),
    location TEXT NOT NULL CHECK (char_length(trim(location)) >= 2),
    sector TEXT NOT NULL,
    business_requirements TEXT NOT NULL CHECK (char_length(trim(business_requirements)) >= 10),
    preferred_meeting_datetime TIMESTAMPTZ,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    consent BOOLEAN NOT NULL CHECK (consent = TRUE),
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Contacted', 'Qualified', 'Converted', 'Rejected')),
    estimated_deal_value NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (estimated_deal_value >= 0),
    estimated_commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (estimated_commission_amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    notes TEXT,
    is_demo_sample BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 4. LEAD_SERVICES (Junction linking Leads to Services)
-- =============================================================================
CREATE TABLE public.lead_services (
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    service_id TEXT NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    PRIMARY KEY (lead_id, service_id)
);

-- =============================================================================
-- 5. LEAD_STATUS_HISTORY (Audit Trail of Lead Transitions)
-- =============================================================================
CREATE TABLE public.lead_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 6. COMMISSIONS (Calculated Earnings per Lead)
-- =============================================================================
CREATE TABLE public.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE RESTRICT,
    affiliate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    service_id TEXT NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    deal_value NUMERIC(12,2) NOT NULL CHECK (deal_value >= 0),
    commission_rate_pct NUMERIC(5,2) NOT NULL CHECK (commission_rate_pct >= 0 AND commission_rate_pct <= 100),
    commission_amount NUMERIC(12,2) NOT NULL CHECK (commission_amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Paid', 'Cancelled')),
    approval_date TIMESTAMPTZ,
    payment_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 7. INVOICES (Affiliate Payout Requests)
-- =============================================================================
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    affiliate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Paid', 'Void')),
    issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    paid_date TIMESTAMPTZ,
    payment_method TEXT,
    payment_transaction_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 8. INVOICE_COMMISSIONS (Junction linking Invoices to Commissions)
-- =============================================================================
CREATE TABLE public.invoice_commissions (
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    commission_id UUID NOT NULL UNIQUE REFERENCES public.commissions(id) ON DELETE RESTRICT,
    PRIMARY KEY (invoice_id, commission_id)
);

-- =============================================================================
-- 9. PERFORMANCE INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON public.services(provider_id);
CREATE INDEX IF NOT EXISTS idx_leads_affiliate_id ON public.leads(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_leads_provider_id ON public.leads(provider_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_reference_number ON public.leads(reference_number);
CREATE INDEX IF NOT EXISTS idx_commissions_affiliate_id ON public.commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);
CREATE INDEX IF NOT EXISTS idx_invoices_affiliate_id ON public.invoices(affiliate_id);

-- =============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access on profiles" ON public.profiles;
CREATE POLICY "Allow public all access on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access on services" ON public.services;
CREATE POLICY "Allow public all access on services" ON public.services FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access on leads" ON public.leads;
CREATE POLICY "Allow public all access on leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.lead_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access on lead_services" ON public.lead_services;
CREATE POLICY "Allow public all access on lead_services" ON public.lead_services FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.lead_status_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access on lead_status_history" ON public.lead_status_history;
CREATE POLICY "Allow public all access on lead_status_history" ON public.lead_status_history FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access on commissions" ON public.commissions;
CREATE POLICY "Allow public all access on commissions" ON public.commissions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access on invoices" ON public.invoices;
CREATE POLICY "Allow public all access on invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.invoice_commissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access on invoice_commissions" ON public.invoice_commissions;
CREATE POLICY "Allow public all access on invoice_commissions" ON public.invoice_commissions FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- 11. AUTOMATIC SYNC TRIGGER: Provider Offerings -> Affiliate Services
-- Whenever a Provider adds an offering, it immediately reflects in the
-- Affiliate Promotional Catalog!
-- =============================================================================
CREATE OR REPLACE FUNCTION public.sync_provider_offering_to_affiliate_service()
RETURNS TRIGGER AS $$
DECLARE
    prov_name TEXT;
    prov_tagline TEXT;
    aff_reward_pct NUMERIC(5,2);
    aff_payout NUMERIC(12,2);
BEGIN
    -- Fetch Provider business name & tagline
    SELECT business_name, tagline INTO prov_name, prov_tagline
    FROM public.providers
    WHERE id = NEW.provider_id;

    -- Calculate 50% split (Affiliate reward is 20% of MRP under a 40% MoU agreement)
    aff_reward_pct := 20.00;
    aff_payout := ROUND((COALESCE(NEW.customer_price_rupees, 0) * (aff_reward_pct / 100.0)), 2);

    -- Insert or Update into public.services
    INSERT INTO public.services (
        id,
        provider_id,
        name,
        category,
        tagline,
        commission_rate_pct,
        avg_payout_amount,
        cookie_duration_days,
        description,
        features,
        is_active,
        created_at
    ) VALUES (
        NEW.id::TEXT,
        NEW.provider_id,
        NEW.title,
        COALESCE(NEW.category_id, 'Healthcare'),
        COALESCE(prov_tagline, COALESCE(prov_name, 'Verified Provider Service')),
        aff_reward_pct,
        aff_payout,
        60,
        COALESCE(NEW.description, 'Standard verified provider offering'),
        ARRAY['Verified Clinic / Provider Service', 'Bilateral MoU Backed', 'Direct Lead Dispatch'],
        (NEW.status = 'active'),
        COALESCE(NEW.created_at, timezone('utc', now()))
    )
    ON CONFLICT (id) DO UPDATE SET
        provider_id = EXCLUDED.provider_id,
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        tagline = EXCLUDED.tagline,
        commission_rate_pct = EXCLUDED.commission_rate_pct,
        avg_payout_amount = EXCLUDED.avg_payout_amount,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_provider_offering_to_service ON public.provider_offerings;

CREATE TRIGGER trg_sync_provider_offering_to_service
AFTER INSERT OR UPDATE ON public.provider_offerings
FOR EACH ROW
EXECUTE FUNCTION public.sync_provider_offering_to_affiliate_service();

