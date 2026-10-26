import { createClient } from '@supabase/supabase-js';
import {
  Provider,
  ProviderOffering,
  Referral,
  CommissionLedgerEntry,
  CallLogEntry
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hkovcvqhzjlcetotplcl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhrb3ZjdnFoempsY2V0b3RwbGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzODAzMTYsImV4cCI6MjEwNzk1NjMxNn0.ZGBCOFNmFYy8vXwatFMrNzpMmXXwGi1cBQ_iz5XCI1Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Helper to generate valid UUID or keep existing valid UUID */
export const toValidUuid = (id?: string): string => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (id && uuidRegex.test(id)) return id;
  // Browser crypto UUID
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Health check helper to verify Supabase connectivity
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.from('providers').select('id, business_name').limit(1);
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: `Connected to Supabase! Found ${data?.length || 0} provider records.` };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed' };
  }
}

// =========================================================================
// 1. STORAGE UPLOAD HELPERS (mou-documents & provider-rate-cards)
// =========================================================================

export interface StorageUploadResult {
  success: boolean;
  filePath?: string;
  fileUrl?: string;
  error?: string;
}

/**
 * Upload an executed MoU document (PDF or image) to 'mou-documents' bucket
 */
export async function uploadMouDocument(
  file: File,
  providerName: string = 'client'
): Promise<StorageUploadResult> {
  try {
    const cleanPrefix = providerName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
    const cleanFileName = `${cleanPrefix}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `mous/${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from('mou-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn('Supabase storage upload warning (mou-documents):', error.message);
      return { success: false, error: error.message };
    }

    // Attempt to get public or signed URL
    const { data: publicData } = supabase.storage
      .from('mou-documents')
      .getPublicUrl(data.path);

    return {
      success: true,
      filePath: data.path,
      fileUrl: publicData?.publicUrl || filePath
    };
  } catch (err: any) {
    console.error('Upload exception for mou-documents:', err);
    return { success: false, error: err?.message || 'Upload failed' };
  }
}

/**
 * Upload a service rate card / price menu photo to 'provider-rate-cards' bucket
 */
export async function uploadRateCardImage(
  file: File,
  providerId: string = 'general'
): Promise<StorageUploadResult> {
  try {
    const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `${providerId}/${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from('provider-rate-cards')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn('Supabase storage upload warning (provider-rate-cards):', error.message);
      return { success: false, error: error.message };
    }

    const { data: publicData } = supabase.storage
      .from('provider-rate-cards')
      .getPublicUrl(data.path);

    return {
      success: true,
      filePath: data.path,
      fileUrl: publicData?.publicUrl || filePath
    };
  } catch (err: any) {
    console.error('Upload exception for provider-rate-cards:', err);
    return { success: false, error: err?.message || 'Upload failed' };
  }
}

// =========================================================================
// 2. LIVE DATABASE SYNC HELPERS (POSTGRES READS / WRITES)
// =========================================================================

/**
 * Record an Admin MoU Upload entry in `admin_mou_uploads`
 */
export async function recordAdminMouUpload(record: {
  fileUrl: string;
  providerName: string;
  contactEmail: string;
  contactPhone: string;
  extractedReferralPct: number;
  extractedRateCard?: any[];
}): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('admin_mou_uploads')
      .insert({
        file_url: record.fileUrl,
        provider_name: record.providerName,
        contact_email: record.contactEmail,
        contact_phone: record.contactPhone,
        extracted_referral_pct: record.extractedReferralPct,
        extracted_rate_card: record.extractedRateCard || [],
        status: 'approved'
      })
      .select('id')
      .single();

    if (error) {
      console.warn('Could not record admin_mou_upload in DB:', error.message);
      return null;
    }
    return data?.id || null;
  } catch {
    return null;
  }
}

/**
 * Insert or update a Provider and their Agreement in Supabase
 */
export async function syncProviderToSupabase(provider: Provider): Promise<boolean> {
  try {
    const validId = toValidUuid(provider.id);
    const { error: provErr } = await supabase
      .from('providers')
      .upsert({
        id: validId,
        business_name: provider.businessName,
        tagline: provider.tagline,
        contact_person: provider.contactPerson,
        email: provider.email,
        phone: provider.phone,
        address: provider.address,
        city: provider.city,
        service_areas: provider.serviceAreas || ['All Areas'],
        description: provider.description,
        status: provider.status || 'active',
        amount_paid_rupees: provider.amountPaidRupees || 0,
        logo_url: provider.logoUrl || null
      }, { onConflict: 'id' });

    if (provErr) {
      console.warn('Supabase provider upsert error:', provErr.message);
      return false;
    }

    // Sync active agreement if present
    const agreement = provider.activeAgreements?.[0];
    if (agreement) {
      const validAgrId = toValidUuid(agreement.id);
      await supabase
        .from('provider_agreements')
        .upsert({
          id: validAgrId,
          provider_id: validId,
          title: agreement.title,
          document_ref: agreement.documentRef,
          gross_referral_pct: 40.0,
          affiliate_split_pct: 50.0,
          company_split_pct: 50.0,
          status: 'active'
        }, { onConflict: 'id' });
    }

    return true;
  } catch (err) {
    console.warn('Exception syncing provider to Supabase:', err);
    return false;
  }
}

/**
 * Insert or update a Provider Offering and its 50/50 Reward Rules in Supabase
 */
export async function syncOfferingToSupabase(offering: ProviderOffering): Promise<boolean> {
  try {
    const validOfferingId = toValidUuid(offering.id);
    const validProviderId = toValidUuid(offering.providerId);

    const { error: offErr } = await supabase
      .from('provider_offerings')
      .upsert({
        id: validOfferingId,
        provider_id: validProviderId,
        title: offering.title,
        description: offering.description,
        customer_price_rupees: offering.customerPriceRupees,
        service_area: offering.serviceArea || 'Hyderabad',
        category_id: offering.categoryId || 'cat_health',
        status: offering.status || 'active',
        version: offering.version || 1
      }, { onConflict: 'id' });

    if (offErr) {
      console.warn('Supabase offering upsert error:', offErr.message);
      return false;
    }

    // Upsert each reward rule
    if (offering.rewardRules && offering.rewardRules.length > 0) {
      for (const rule of offering.rewardRules) {
        await supabase
          .from('offering_reward_rules')
          .upsert({
            id: toValidUuid(rule.id),
            offering_id: validOfferingId,
            event_type: rule.eventType,
            provider_fee_rupees: rule.providerFeeRupees,
            affiliate_reward_rupees: rule.affiliateRewardRupees,
            version: rule.version || 1,
            is_active: rule.isActive ?? true
          }, { onConflict: 'id' });
      }
    }

    return true;
  } catch (err) {
    console.warn('Exception syncing offering to Supabase:', err);
    return false;
  }
}

/**
 * Insert a new Referral into Supabase
 */
export async function syncReferralToSupabase(referral: Referral): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('referrals')
      .upsert({
        id: toValidUuid(referral.id),
        referral_code: referral.referralCode,
        provider_id: toValidUuid(referral.providerId),
        offering_id: toValidUuid(referral.offeringId),
        earning_model: referral.earningModel,
        customer_name: referral.customerName,
        customer_phone: referral.customerPhone,
        client_phone_masked: referral.clientPhoneMasked,
        customer_email: referral.customerEmail || 'customer@example.com',
        customer_city: referral.customerCity,
        customer_notes: referral.customerNotes,
        lead_status: referral.leadStatus,
        conversion_status: referral.conversionStatus,
        sale_value_rupees: referral.saleValueRupees || null,
        partner_invoice_ref: referral.partnerInvoiceRef || null,
        qualification_notes: referral.qualificationNotes || null,
        authorization_confirmed: true
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase referral upsert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exception syncing referral to Supabase:', err);
    return false;
  }
}

/**
 * Record a proxy call entry in `referral_call_logs`
 */
export async function syncCallLogToSupabase(log: CallLogEntry): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('referral_call_logs')
      .insert({
        id: toValidUuid(log.id),
        referral_id: toValidUuid(log.referralId),
        caller_masked_bridge: log.callerMaskedBridge || '+91 80-4567-9912',
        target_masked_phone: log.targetMaskedPhone,
        duration_seconds: log.durationSeconds,
        status: log.status || 'completed',
        notes: log.notes || ''
      });

    if (error) {
      console.warn('Supabase call log error:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Insert a commission ledger entry in `commission_ledger`
 */
export async function syncCommissionToSupabase(entry: CommissionLedgerEntry): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('commission_ledger')
      .upsert({
        id: toValidUuid(entry.id),
        referral_id: toValidUuid(entry.referralId),
        provider_id: toValidUuid(entry.providerId),
        event_type: entry.eventType,
        provider_fee_amount: entry.providerFeeSnapshot,
        affiliate_gross_reward: entry.affiliateRewardSnapshot,
        tds_rate_pct: entry.tdsRate || 5.0,
        tds_deducted: entry.tdsDeducted || 0.0,
        affiliate_net_payable: entry.netPayable || entry.affiliateRewardSnapshot,
        company_retained_margin: entry.companyRetainedSnapshot,
        status: entry.status || 'pending',
        partner_invoice_ref: entry.partnerInvoiceRef || null,
        gross_sale_value: null
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase commission ledger error:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

