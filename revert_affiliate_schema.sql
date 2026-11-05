-- =============================================================================
-- REVERT AFFILIATE SCHEMA ADDITIONS
-- Safely removes all 8 affiliate tables, sync triggers, and functions.
-- 100% PRESERVES: providers (Dhanvika Diagnostics), provider_agreements,
-- admin_mou_uploads, provider_offerings, and all core provider/admin data.
-- =============================================================================

-- 1. Remove the Auto-Sync Trigger & Function on provider_offerings
DROP TRIGGER IF EXISTS trg_sync_provider_offering_to_service ON public.provider_offerings;
DROP FUNCTION IF EXISTS public.sync_provider_offering_to_affiliate_service();

-- 2. Drop the 8 Affiliate Tables in dependency order (CASCADE ensures clean removal)
DROP TABLE IF EXISTS public.invoice_commissions CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.commissions CASCADE;
DROP TABLE IF EXISTS public.lead_status_history CASCADE;
DROP TABLE IF EXISTS public.lead_services CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

