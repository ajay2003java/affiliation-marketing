import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Provider,
  ProviderOffering,
  ServiceCategory,
  Service,
  Referral,
  CommissionLedgerEntry,
  PayoutRecord,
  AuditEvent,
  Contact,
  AffiliateProfile,
  LeadStatus,
  ConversionStatus,
  OfferingStatus,
  EarningMode,
  CommissionStatus,
  ReferralStatusHistory,
  CallLogEntry
} from '../types';
import {
  MOCK_PROVIDERS,
  MOCK_OFFERINGS,
  MOCK_CATEGORIES,
  MOCK_SERVICES
} from '../services/mockData';
import {
  supabase,
  syncProviderToSupabase,
  syncOfferingToSupabase,
  syncReferralToSupabase,
  syncCallLogToSupabase,
  syncCommissionToSupabase
} from '../services/supabaseClient';

export const maskPhoneNumber = (phone: string): string => {
  if (!phone) return '+91 98XXX-XXXXX';
  const clean = phone.replace(/\D/g, '');
  if (clean.length >= 10) {
    const first2 = clean.slice(-10, -8);
    const last3 = clean.slice(-3);
    return `+91 ${first2}XXX-XX${last3}`;
  }
  return '+91 98XXX-XXXXX';
};

interface DataContextType {
  providers: Provider[];
  offerings: ProviderOffering[];
  categories: ServiceCategory[];
  services: Service[];
  referrals: Referral[];
  commissionLedger: CommissionLedgerEntry[];
  payouts: PayoutRecord[];
  auditLogs: AuditEvent[];
  contacts: Contact[];
  affiliateProfile: AffiliateProfile;
  
  // Actions
  maskPhoneNumber: (phone: string) => string;
  checkDuplicateReferral: (phone: string, email: string, providerId: string) => { isDuplicate: boolean; existingReferral?: Referral; message?: string };
  submitReferral: (data: Omit<Referral, 'id' | 'referralCode' | 'createdAt' | 'updatedAt' | 'leadStatus' | 'conversionStatus'>, forceDuplicate?: boolean) => Referral;
  updateLeadStatus: (referralId: string, status: LeadStatus, notes?: string, actorName?: string) => void;
  updateConversionStatus: (referralId: string, status: ConversionStatus, saleValue?: number, notes?: string, actorName?: string) => void;
  logProxyCall: (referralId: string, durationSeconds: number, notes?: string) => void;
  reportConversionOutcome: (referralId: string, status: ConversionStatus, partnerInvoiceRef?: string, finalAgreedPrice?: number, notes?: string) => void;
  approveSettlementWithTds: (commissionId: string, panVerifiedOverride?: boolean) => void;
  executeInstantUpiPayout: (amount: number, upiVpa: string) => { success: boolean; utr: string; payout?: PayoutRecord };
  updateAffiliateTaxProfile: (panNumber: string, upiVpa: string) => void;
  createOffering: (offering: Omit<ProviderOffering, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'status'>) => ProviderOffering;
  updateOffering: (offeringId: string, data: Partial<ProviderOffering>, createNewVersion?: boolean) => void;
  reviewOffering: (offeringId: string, decision: 'active' | 'rejected', feedback?: string) => void;
  updateAffiliateEarningModes: (modes: EarningMode) => void;
  updateCommissionStatus: (commissionId: string, status: CommissionStatus, reason?: string) => void;
  createAdjustmentEntry: (commissionId: string, amountRupees: number, reason: string, actorName?: string) => void;
  createPayout: (affiliateId: string, commissionIds: string[], amount: number, method: string, reference: string, notes?: string) => PayoutRecord;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => Contact;
  deleteContact: (id: string) => void;
  addProvider: (data: Omit<Provider, 'id' | 'status' | 'activeAgreements'>) => Provider;
  updateProvider: (id: string, data: Partial<Provider>) => void;
  recordClientPayment: (providerId: string, amount: number, notes?: string) => void;
  addCategory: (data: Omit<ServiceCategory, 'id'>) => ServiceCategory;
  updateCategory: (id: string, data: Partial<ServiceCategory>) => void;
  deleteCategory: (id: string) => void;
  addService: (data: Omit<Service, 'id'>) => Service;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'affiliate_platform_prod_v1';

// One-time purge of legacy mock data stored during development
try {
  const legacyKeys = [
    'affiliate_referral_platform_data_v2',
    'affiliate_referral_platform_data_v2_providers',
    'affiliate_referral_platform_data_v2_offerings',
    'affiliate_referral_platform_data_v2_categories',
    'affiliate_referral_platform_data_v2_services',
    'affiliate_referral_platform_data_v2_referrals',
    'affiliate_referral_platform_data_v2_commissions',
    'affiliate_referral_platform_data_v2_payouts',
    'affiliate_referral_platform_data_v2_audits',
    'affiliate_referral_platform_data_v2_contacts',
    'affiliate_referral_platform_data_v2_affiliate_profile'
  ];
  legacyKeys.forEach((key) => localStorage.removeItem(key));
} catch {
  // ignore
}

export const INITIAL_AFFILIATE_PROFILE: AffiliateProfile = {
  userId: 'usr_aff_01',
  earningModes: 'both',
  occupation: 'Affiliate Partner',
  networkTypes: ['Professional Network'],
  interests: ['Healthcare Diagnostics', 'Corporate Training'],
  preferredArea: 'Hyderabad',
  totalEarnedRupees: 0,
  pendingRewardRupees: 0,
  referralCount: 0,
  panNumber: '',
  panVerified: false,
  upiVpa: '',
  walletAccounts: {
    escrowLockedBal: 0,
    availableCashBal: 0,
    lifetimeTdsDeducted: 0
  }
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [providers, setProviders] = useState<Provider[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_providers`);
    return saved ? JSON.parse(saved) : MOCK_PROVIDERS;
  });

  const [offerings, setOfferings] = useState<ProviderOffering[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_offerings`);
    return saved ? JSON.parse(saved) : MOCK_OFFERINGS;
  });

  const [categories, setCategories] = useState<ServiceCategory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_categories`);
    return saved ? JSON.parse(saved) : MOCK_CATEGORIES;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_services`);
    return saved ? JSON.parse(saved) : MOCK_SERVICES;
  });

  // Production Clean Slate: Transactional collections initialize empty
  const [referrals, setReferrals] = useState<Referral[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_referrals`);
    if (saved) {
      const parsed: Referral[] = JSON.parse(saved);
      return parsed.map((r) => ({
        ...r,
        clientPhoneMasked: r.clientPhoneMasked || maskPhoneNumber(r.customerPhone)
      }));
    }
    return [];
  });

  const [commissionLedger, setCommissionLedger] = useState<CommissionLedgerEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_commissions`);
    return saved ? JSON.parse(saved) : [];
  });

  const [payouts, setPayouts] = useState<PayoutRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payouts`);
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audits`);
    return saved ? JSON.parse(saved) : [];
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_contacts`);
    return saved ? JSON.parse(saved) : [];
  });

  const [affiliateProfile, setAffiliateProfile] = useState<AffiliateProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_affiliate_profile`);
    return saved ? JSON.parse(saved) : INITIAL_AFFILIATE_PROFILE;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_providers`, JSON.stringify(providers));
  }, [providers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_offerings`, JSON.stringify(offerings));
  }, [offerings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_referrals`, JSON.stringify(referrals));
  }, [referrals]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_commissions`, JSON.stringify(commissionLedger));
  }, [commissionLedger]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_payouts`, JSON.stringify(payouts));
  }, [payouts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_audits`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_contacts`, JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_affiliate_profile`, JSON.stringify(affiliateProfile));
  }, [affiliateProfile]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_categories`, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_services`, JSON.stringify(services));
  }, [services]);

  // Load live records from Supabase on mount (seamless merge)
  useEffect(() => {
    let isMounted = true;
    async function loadSupabaseData() {
      try {
        // 1. Providers from Supabase
        const { data: dbProviders } = await supabase.from('providers').select('*');
        if (isMounted && dbProviders && dbProviders.length > 0) {
          setProviders((prev) => {
            const dbProviderIds = new Set(dbProviders.map((p) => p.id));
            const hasDbDhanvika = dbProviders.some((p) => p.business_name?.toLowerCase().includes('dhanvika'));
            
            // Filter out mock Dhanvika if Supabase has Dhanvika
            const filteredPrev = prev.filter((p) => {
              if (dbProviderIds.has(p.id)) return false;
              if (hasDbDhanvika && (p.id === 'prov_dhanvika' || p.businessName.toLowerCase().includes('dhanvika'))) return false;
              return true;
            });

            const newOnes: Provider[] = dbProviders.map((dbp) => ({
              id: dbp.id,
              userId: dbp.user_id || `usr_prov_${dbp.id.slice(0, 8)}`,
              businessName: dbp.business_name,
              tagline: dbp.tagline || 'Commercial Service Provider',
              contactPerson: dbp.contact_person,
              email: dbp.email,
              phone: dbp.phone,
              address: dbp.address || '',
              city: dbp.city,
              serviceAreas: dbp.service_areas || ['All Areas'],
              description: dbp.description || '',
              status: dbp.status || 'active',
              agreementStatus: 'active' as const,
              amountPaidRupees: Number(dbp.amount_paid_rupees) || 0,
              logoUrl: dbp.logo_url || undefined,
              activeAgreements: []
            }));
            return [...newOnes, ...filteredPrev];
          });
        }

        // 2. Offerings & Reward Rules from Supabase
        const { data: dbOfferings } = await supabase.from('provider_offerings').select('*, offering_reward_rules(*)');
        if (isMounted && dbOfferings && dbOfferings.length > 0) {
          setOfferings((prev) => {
            const dbOfferingIds = new Set(dbOfferings.map((o) => o.id));
            const hasDhanvikaDbOfferings = dbOfferings.some(
              (o) => o.provider_id === 'b1111111-1111-1111-1111-111111111111'
            );

            const filteredPrev = prev.filter((o) => {
              if (dbOfferingIds.has(o.id)) return false;
              if (hasDhanvikaDbOfferings && o.providerId === 'prov_dhanvika') return false;
              return true;
            });

            const newOnes: ProviderOffering[] = dbOfferings.map((dbo) => ({
              id: dbo.id,
              providerId: dbo.provider_id,
              serviceId: 'srv_custom',
              categoryId: dbo.category_id || 'cat_health',
              title: dbo.title,
              description: dbo.description || '',
              features: ['Verified Commercial Service', 'Direct Support'],
              customerPriceRupees: Number(dbo.customer_price_rupees) || 0,
              currency: dbo.currency || 'INR',
              serviceArea: dbo.service_area || 'Hyderabad',
              status: dbo.status || 'active',
              version: dbo.version || 1,
              rewardRules: (dbo.offering_reward_rules || []).map((rr: any) => ({
                id: rr.id,
                offeringId: rr.offering_id,
                eventType: rr.event_type,
                providerFeeRupees: Number(rr.provider_fee_rupees) || 0,
                affiliateRewardRupees: Number(rr.affiliate_reward_rupees) || 0,
                version: rr.version || 1,
                isActive: rr.is_active ?? true
              })),
              createdAt: dbo.created_at || new Date().toISOString(),
              updatedAt: dbo.updated_at || new Date().toISOString()
            }));
            return [...newOnes, ...filteredPrev];
          });
        }

        // 3. Referrals from Supabase
        const { data: dbReferrals } = await supabase.from('referrals').select('*');
        if (isMounted && dbReferrals && dbReferrals.length > 0) {
          setReferrals((prev) => {
            const dbReferralIds = new Set(dbReferrals.map((r) => r.id));
            const hasDhanvikaDbReferrals = dbReferrals.some(
              (r) => r.provider_id === 'b1111111-1111-1111-1111-111111111111'
            );

            const filteredPrev = prev.filter((r) => {
              if (dbReferralIds.has(r.id)) return false;
              if (hasDhanvikaDbReferrals && r.providerId === 'prov_dhanvika') return false;
              return true;
            });

            const newOnes: Referral[] = dbReferrals.map((dbr) => ({
              id: dbr.id,
              referralCode: dbr.referral_code,
              affiliateId: 'usr_aff_01',
              providerId: dbr.provider_id,
              offeringId: dbr.offering_id,
              earningModel: dbr.earning_model || 'lead_conversion',
              rewardRuleVersion: 1,
              customerName: dbr.customer_name,
              customerPhone: dbr.customer_phone,
              clientPhoneMasked: dbr.client_phone_masked || maskPhoneNumber(dbr.customer_phone),
              customerEmail: dbr.customer_email || 'customer@example.com',
              customerCity: dbr.customer_city || 'Hyderabad',
              customerNotes: dbr.customer_notes || undefined,
              authorizationConfirmed: true,
              consentStatus: 'consent_given',
              leadStatus: dbr.lead_status || 'submitted',
              conversionStatus: dbr.conversion_status || 'follow_up_in_progress',
              saleValueRupees: dbr.sale_value_rupees ? Number(dbr.sale_value_rupees) : undefined,
              partnerInvoiceRef: dbr.partner_invoice_ref || undefined,
              qualificationNotes: dbr.qualification_notes || undefined,
              createdAt: dbr.created_at || new Date().toISOString(),
              updatedAt: dbr.updated_at || new Date().toISOString()
            }));
            return [...newOnes, ...filteredPrev];
          });
        }
      } catch (err) {
        console.warn('Initial Supabase fetch warning:', err);
      }
    }
    loadSupabaseData();
    return () => {
      isMounted = false;
    };
  }, []);

  const addAuditLog = (
    actorId: string,
    actorName: string,
    actorRole: 'affiliate' | 'provider' | 'admin',
    action: string,
    entityType: 'offering' | 'provider' | 'referral' | 'commission' | 'payout' | 'user',
    entityId: string,
    details: string
  ) => {
    const newLog: AuditEvent = {
      id: `aud_${Date.now()}`,
      actorId,
      actorName,
      actorRole,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Duplicate Referral Detection (PRD Section 6.4 & 13)
  const normalizePhone = (phone: string) => phone.replace(/\D/g, '').slice(-10);
  const normalizeEmail = (email: string) => email.trim().toLowerCase();

  const checkDuplicateReferral = (phone: string, email: string, providerId: string) => {
    const cleanPhone = normalizePhone(phone);
    const cleanEmail = normalizeEmail(email);

    if (!cleanPhone && !cleanEmail) {
      return { isDuplicate: false };
    }

    const match = referrals.find((r) => {
      if (r.providerId !== providerId) return false;
      const rPhone = normalizePhone(r.customerPhone);
      const rEmail = normalizeEmail(r.customerEmail);

      const phoneMatch = Boolean(cleanPhone && rPhone && cleanPhone === rPhone);
      const emailMatch = Boolean(cleanEmail && rEmail && cleanEmail === rEmail);

      return phoneMatch || emailMatch;
    });

    if (match) {
      return {
        isDuplicate: true,
        existingReferral: match,
        message: `Duplicate Notice: A referral for this customer (${match.customerName}, ${match.referralCode}) was already submitted to this client on ${new Date(match.createdAt).toLocaleDateString('en-IN')}. Current milestone: ${match.leadStatus}.`
      };
    }

    return { isDuplicate: false };
  };

  // Submit Referral with Duplicate Check & Initial Status History
  const submitReferral = (
    data: Omit<Referral, 'id' | 'referralCode' | 'createdAt' | 'updatedAt' | 'leadStatus' | 'conversionStatus'>,
    forceDuplicate = false
  ): Referral => {
    if (!forceDuplicate) {
      const dupCheck = checkDuplicateReferral(data.customerPhone, data.customerEmail, data.providerId);
      if (dupCheck.isDuplicate) {
        throw new Error(dupCheck.message || 'Duplicate referral detected for this client within the active attribution period.');
      }
    }

    const now = new Date().toISOString();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referralCode = `REF-2026-${randomSuffix}`;
    const refId = `ref_${Date.now()}`;

    const initialHistory: ReferralStatusHistory = {
      id: `hist_${Date.now()}_1`,
      referralId: refId,
      changedBy: 'Arjun Verma',
      actorRole: 'affiliate',
      fromStatus: 'none',
      toStatus: 'submitted',
      reason: 'Referral submitted with confirmed customer authorization.',
      timestamp: now
    };

    const newReferral: Referral = {
      ...data,
      id: refId,
      referralCode,
      clientPhoneMasked: maskPhoneNumber(data.customerPhone),
      consentStatus: 'consent_given',
      leadStatus: 'submitted',
      conversionStatus: data.earningModel === 'lead_conversion' ? 'follow_up_in_progress' : 'not_applicable',
      statusHistory: [initialHistory],
      callLogs: [],
      createdAt: now,
      updatedAt: now
    };

    setReferrals((prev) => [newReferral, ...prev]);

    addAuditLog(
      data.affiliateId,
      'Arjun Verma',
      'affiliate',
      'SUBMITTED_REFERRAL',
      'referral',
      newReferral.id,
      `Submitted referral ${referralCode} for customer ${data.customerName} under earning model: ${data.earningModel}`
    );

    // Synchronize referral to live Supabase DB
    syncReferralToSupabase(newReferral);

    return newReferral;
  };

  // Update Lead Status (e.g., Qualified or Rejected) with Status History
  const updateLeadStatus = (
    referralId: string,
    status: LeadStatus,
    notes?: string,
    actorName = 'Provider Admin'
  ) => {
    const ref = referrals.find((r) => r.id === referralId);
    if (!ref) return;

    const now = new Date().toISOString();
    const actorRole = actorName.toLowerCase().includes('admin') ? 'admin' : 'provider';

    const newHistoryItem: ReferralStatusHistory = {
      id: `hist_${Date.now()}`,
      referralId,
      changedBy: actorName,
      actorRole,
      fromStatus: ref.leadStatus,
      toStatus: status,
      reason: notes || `Lead qualification milestone changed to ${status}`,
      timestamp: now
    };

    const updatedRef: Referral = {
      ...ref,
      leadStatus: status,
      qualificationNotes: notes || ref.qualificationNotes,
      statusHistory: [...(ref.statusHistory || []), newHistoryItem],
      updatedAt: now
    };

    setReferrals((prev) =>
      prev.map((r) => (r.id === referralId ? updatedRef : r))
    );

    // Sync updated referral to Supabase live database
    syncReferralToSupabase(updatedRef);

    addAuditLog(
      ref.providerId,
      actorName,
      actorRole,
      'UPDATED_LEAD_STATUS',
      'referral',
      referralId,
      `Lead status updated to ${status}. Notes: ${notes || 'None'}`
    );

    // If Qualified AND referral earning model is lead_generation, trigger Commission Ledger Entry!
    if (status === 'qualified' && ref.earningModel === 'lead_generation') {
      const offering = offerings.find((o) => o.id === ref.offeringId);
      const leadRule = offering?.rewardRules.find((rr) => rr.eventType === 'qualified_lead' && rr.isActive);

      if (leadRule) {
        // Enforce idempotency: check if ledger entry already exists
        const exists = commissionLedger.some(
          (c) => c.referralId === referralId && c.eventType === 'qualified_lead'
        );

        if (!exists) {
          const providerFee = leadRule.providerFeeRupees;
          const affiliateReward = leadRule.affiliateRewardRupees;
          const companyRetained = providerFee - affiliateReward;

          const newCommission: CommissionLedgerEntry = {
            id: `comm_${Date.now()}`,
            referralId: ref.id,
            referralCode: ref.referralCode,
            affiliateId: ref.affiliateId,
            providerId: ref.providerId,
            offeringTitle: offering?.title || 'Approved Offering',
            customerName: ref.customerName,
            eventType: 'qualified_lead',
            providerFeeSnapshot: providerFee,
            affiliateRewardSnapshot: affiliateReward,
            companyRetainedSnapshot: companyRetained,
            status: 'approved', // Verified lead criteria creates approved entitlement
            ruleVersionSnapshot: leadRule.version,
            triggeredAt: now,
            approvedAt: now
          };

          setCommissionLedger((prev) => [newCommission, ...prev]);

          // Sync Commission to Supabase live DB
          syncCommissionToSupabase(newCommission);

          addAuditLog(
            'system',
            'Commission Engine',
            'admin',
            'TRIGGERED_LEAD_COMMISSION',
            'commission',
            newCommission.id,
            `Commission of ₹${affiliateReward} approved for Lead Gen referral ${ref.referralCode} (Provider Fee: ₹${providerFee}, Retained: ₹${companyRetained}).`
          );
        }
      }
    }
  };

  // Update Conversion Status (e.g., Converted or Not Converted) with Status History
  const updateConversionStatus = (
    referralId: string,
    status: ConversionStatus,
    saleValue?: number,
    notes?: string,
    actorName = 'Provider Admin'
  ) => {
    const ref = referrals.find((r) => r.id === referralId);
    if (!ref) return;

    const now = new Date().toISOString();
    const actorRole = actorName.toLowerCase().includes('admin') ? 'admin' : 'provider';

    const newHistoryItem: ReferralStatusHistory = {
      id: `hist_${Date.now()}`,
      referralId,
      changedBy: actorName,
      actorRole,
      fromStatus: ref.conversionStatus,
      toStatus: status,
      reason: notes || `Conversion milestone status changed to ${status}${saleValue ? ` (Sale Value: ₹${saleValue})` : ''}`,
      timestamp: now
    };

    const updatedRef: Referral = {
      ...ref,
      conversionStatus: status,
      saleValueRupees: saleValue ?? ref.saleValueRupees,
      conversionNotes: notes || ref.conversionNotes,
      statusHistory: [...(ref.statusHistory || []), newHistoryItem],
      updatedAt: now
    };

    setReferrals((prev) =>
      prev.map((r) => (r.id === referralId ? updatedRef : r))
    );

    // Sync updated referral outcome to Supabase live database
    syncReferralToSupabase(updatedRef);

    addAuditLog(
      ref.providerId,
      actorName,
      actorRole,
      'UPDATED_CONVERSION_STATUS',
      'referral',
      referralId,
      `Conversion outcome marked as ${status}. Sale Value: ₹${saleValue || 0}. Notes: ${notes || 'None'}`
    );

    // If Converted AND earning model is lead_conversion, trigger Commission Ledger Entry!
    if (status === 'converted' && ref.earningModel === 'lead_conversion') {
      const offering = offerings.find((o) => o.id === ref.offeringId);
      const convRule = offering?.rewardRules.find((rr) => rr.eventType === 'successful_conversion' && rr.isActive);

      if (convRule) {
        // Enforce idempotency: check if ledger entry already exists
        const exists = commissionLedger.some(
          (c) => c.referralId === referralId && c.eventType === 'successful_conversion'
        );

        if (!exists) {
          const providerFee = convRule.providerFeeRupees;
          const affiliateReward = convRule.affiliateRewardRupees;
          const companyRetained = providerFee - affiliateReward;

          const newCommission: CommissionLedgerEntry = {
            id: `comm_${Date.now()}`,
            referralId: ref.id,
            referralCode: ref.referralCode,
            affiliateId: ref.affiliateId,
            providerId: ref.providerId,
            offeringTitle: offering?.title || 'Approved Offering',
            customerName: ref.customerName,
            eventType: 'successful_conversion',
            providerFeeSnapshot: providerFee,
            affiliateRewardSnapshot: affiliateReward,
            companyRetainedSnapshot: companyRetained,
            status: 'approved', // Verified conversion creates approved entitlement
            ruleVersionSnapshot: convRule.version,
            triggeredAt: now,
            approvedAt: now
          };

          setCommissionLedger((prev) => [newCommission, ...prev]);

          // Sync Commission to Supabase live DB
          syncCommissionToSupabase(newCommission);

          addAuditLog(
            'system',
            'Commission Engine',
            'admin',
            'TRIGGERED_CONVERSION_COMMISSION',
            'commission',
            newCommission.id,
            `Commission of ₹${affiliateReward} approved for Converted referral ${ref.referralCode} (Provider Fee: ₹${providerFee}, Retained: ₹${companyRetained}).`
          );
        }
      }
    }
  };

  // Masked Cloud Telephony Proxy Call (Option A - Zero-Trust Anti-Leakage)
  const logProxyCall = (referralId: string, durationSeconds: number, notes?: string) => {
    const ref = referrals.find((r) => r.id === referralId);
    if (!ref) return;

    const now = new Date().toISOString();
    const newCallLog: CallLogEntry = {
      id: `call_${Date.now()}`,
      referralId,
      timestamp: now,
      durationSeconds,
      status: durationSeconds > 0 ? 'completed' : 'no_answer',
      callerMaskedBridge: '+91 80-4567-9912 (Cloud Telephony Gateway)',
      targetMaskedPhone: ref.clientPhoneMasked || maskPhoneNumber(ref.customerPhone),
      notes: notes || `Proxy call bridged via cloud telephony. Duration: ${durationSeconds}s`
    };

    const newHistoryItem: ReferralStatusHistory = {
      id: `hist_${Date.now()}`,
      referralId,
      changedBy: 'Provider Desk (Masked Telephony Bridge)',
      actorRole: 'provider',
      fromStatus: ref.leadStatus,
      toStatus: ref.leadStatus === 'submitted' ? 'provider_acknowledged' : ref.leadStatus,
      reason: `Masked outbound call (${durationSeconds}s) via Telephony Gateway. Auto-logged.`,
      timestamp: now
    };

    setReferrals((prev) =>
      prev.map((r) =>
        r.id === referralId
          ? {
              ...r,
              leadStatus: r.leadStatus === 'submitted' ? 'provider_acknowledged' : r.leadStatus,
              callLogs: [newCallLog, ...(r.callLogs || [])],
              statusHistory: [...(r.statusHistory || []), newHistoryItem],
              updatedAt: now
            }
          : r
      )
    );

    addAuditLog(
      ref.providerId,
      'Provider Desk',
      'provider',
      'MASKED_TELEPHONY_CALL',
      'referral',
      referralId,
      `Outbound masked proxy call placed to ${ref.clientPhoneMasked}. Duration: ${durationSeconds}s. Gateway: +91 80-4567-9912.`
    );

    // Synchronize proxy call log to Supabase
    syncCallLogToSupabase(newCallLog);
  };

  // Maker Step: Provider reports conversion with mandatory partner_invoice_ref
  const reportConversionOutcome = (
    referralId: string,
    status: ConversionStatus,
    partnerInvoiceRef?: string,
    finalAgreedPrice?: number,
    notes?: string
  ) => {
    const ref = referrals.find((r) => r.id === referralId);
    if (!ref) return;

    const now = new Date().toISOString();
    const newHistoryItem: ReferralStatusHistory = {
      id: `hist_${Date.now()}`,
      referralId,
      changedBy: 'Provider Intake Desk (Maker)',
      actorRole: 'provider',
      fromStatus: ref.conversionStatus,
      toStatus: status,
      reason: `Maker Step: Reported outcome as ${status}${partnerInvoiceRef ? ` (Invoice #${partnerInvoiceRef})` : ''}`,
      timestamp: now
    };

    const updatedRef: Referral = {
      ...ref,
      conversionStatus: status,
      partnerInvoiceRef: partnerInvoiceRef || ref.partnerInvoiceRef,
      finalAgreedPrice: finalAgreedPrice ?? ref.finalAgreedPrice,
      saleValueRupees: finalAgreedPrice ?? ref.saleValueRupees,
      conversionNotes: notes || ref.conversionNotes,
      statusHistory: [...(ref.statusHistory || []), newHistoryItem],
      updatedAt: now
    };

    setReferrals((prev) =>
      prev.map((r) => (r.id === referralId ? updatedRef : r))
    );

    // Sync reported outcome to Supabase live database
    syncReferralToSupabase(updatedRef);

    addAuditLog(
      ref.providerId,
      'Provider Intake (Maker)',
      'provider',
      'REPORTED_CONVERSION_MAKER',
      'referral',
      referralId,
      `Maker reported conversion as ${status}. Invoice: ${partnerInvoiceRef || 'N/A'}. Agreed Price: ₹${finalAgreedPrice || 0}.`
    );

    // If converted, create commission with status 'pending' (Maker-Checker workflow)
    if (status === 'converted' && ref.earningModel === 'lead_conversion') {
      const offering = offerings.find((o) => o.id === ref.offeringId);
      const convRule = offering?.rewardRules.find((rr) => rr.eventType === 'successful_conversion' && rr.isActive);

      if (convRule) {
        const exists = commissionLedger.some(
          (c) => c.referralId === referralId && c.eventType === 'successful_conversion'
        );

        if (!exists) {
          const providerFee = convRule.providerFeeRupees;
          const affiliateReward = convRule.affiliateRewardRupees;
          const companyRetained = providerFee - affiliateReward;

          const newCommission: CommissionLedgerEntry = {
            id: `comm_${Date.now()}`,
            referralId: ref.id,
            referralCode: ref.referralCode,
            affiliateId: ref.affiliateId,
            providerId: ref.providerId,
            offeringTitle: offering?.title || 'Approved Offering',
            customerName: ref.customerName,
            eventType: 'successful_conversion',
            providerFeeSnapshot: providerFee,
            affiliateRewardSnapshot: affiliateReward,
            companyRetainedSnapshot: companyRetained,
            partnerInvoiceRef: partnerInvoiceRef || 'INV-PENDING-CHECKER',
            status: 'pending', // Awaiting Finance Checker verification!
            ruleVersionSnapshot: convRule.version,
            triggeredAt: now
          };

          setCommissionLedger((prev) => [newCommission, ...prev]);

          // Increment Escrow balance in affiliate profile
          setAffiliateProfile((prev) => {
            const currentWallet = prev.walletAccounts || { escrowLockedBal: 0, availableCashBal: 0, lifetimeTdsDeducted: 0 };
            return {
              ...prev,
              walletAccounts: {
                ...currentWallet,
                escrowLockedBal: currentWallet.escrowLockedBal + affiliateReward
              }
            };
          });

          addAuditLog(
            'system',
            'Escrow Engine',
            'admin',
            'ESCROW_REWARD_LOCKED',
            'commission',
            newCommission.id,
            `Locked ₹${affiliateReward} in Escrow for referral ${ref.referralCode}. Awaiting Finance Checker verification.`
          );
        }
      }
    }
  };

  // Checker Step: Finance Admin verifies proof & releases Escrow with Section 194H TDS
  const approveSettlementWithTds = (commissionId: string, panVerifiedOverride?: boolean) => {
    const comm = commissionLedger.find((c) => c.id === commissionId);
    if (!comm) return;

    const isPanValid = panVerifiedOverride !== undefined ? panVerifiedOverride : (affiliateProfile.panVerified ?? true);
    const tdsRate = isPanValid ? 5 : 20; // Section 194H: 5% with PAN, 20% without PAN (Sec 206AA)
    const grossAmount = comm.affiliateRewardSnapshot;
    const tdsDeducted = Math.round((grossAmount * tdsRate) / 100);
    const netPayable = grossAmount - tdsDeducted;
    const now = new Date().toISOString();

    setCommissionLedger((prev) =>
      prev.map((c) =>
        c.id === commissionId
          ? {
              ...c,
              status: 'approved',
              tdsRate,
              tdsDeducted,
              netPayable,
              approvedAt: now
            }
          : c
      )
    );

    // Release Escrow -> Available Cash in wallet
    setAffiliateProfile((prev) => {
      const currentWallet = prev.walletAccounts || { escrowLockedBal: 0, availableCashBal: 0, lifetimeTdsDeducted: 0 };
      return {
        ...prev,
        walletAccounts: {
          escrowLockedBal: Math.max(0, currentWallet.escrowLockedBal - grossAmount),
          availableCashBal: currentWallet.availableCashBal + netPayable,
          lifetimeTdsDeducted: currentWallet.lifetimeTdsDeducted + tdsDeducted
        }
      };
    });

    addAuditLog(
      'usr_admin_01',
      'Finance Checker (Admin)',
      'admin',
      'SETTLEMENT_APPROVED_WITH_TDS',
      'commission',
      commissionId,
      `Checker approved settlement for ${comm.referralCode}. Gross: ₹${grossAmount}, Section 194H TDS (${tdsRate}%): ₹${tdsDeducted}, Net Released to Cash: ₹${netPayable}.`
    );
  };

  // Instant UPI Disbursement Rail (RazorpayX / Cashfree Simulation)
  const executeInstantUpiPayout = (amount: number, upiVpa: string) => {
    const currentWallet = affiliateProfile.walletAccounts || { escrowLockedBal: 0, availableCashBal: 0, lifetimeTdsDeducted: 0 };
    if (amount <= 0 || amount > currentWallet.availableCashBal) {
      return { success: false, utr: '' };
    }

    const now = new Date().toISOString();
    const utr = `UTR-UPI-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const payoutRef = `PAY-UPI-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayout: PayoutRecord = {
      id: `pay_${Date.now()}`,
      payoutReference: payoutRef,
      affiliateId: affiliateProfile.userId,
      affiliateName: 'Arjun Verma',
      amountRupees: amount,
      grossAmountRupees: amount,
      netAmountRupees: amount,
      status: 'completed',
      paymentMethod: 'Instant UPI (RazorpayX Rail)',
      vpa: upiVpa,
      utrNumber: utr,
      transactionReference: utr,
      commissionEntryIds: commissionLedger.filter((c) => c.status === 'approved').map((c) => c.id),
      createdAt: now,
      processedAt: now,
      notes: `Instant UPI settlement credited to VPA: ${upiVpa}. Bank Reference: ${utr}.`
    };

    setPayouts((prev) => [newPayout, ...prev]);

    // Debit available cash balance
    setAffiliateProfile((prev) => ({
      ...prev,
      walletAccounts: {
        ...prev.walletAccounts!,
        availableCashBal: Math.max(0, (prev.walletAccounts?.availableCashBal || 0) - amount)
      }
    }));

    // Mark approved commissions as paid
    setCommissionLedger((prev) =>
      prev.map((c) =>
        c.status === 'approved'
          ? {
              ...c,
              status: 'paid',
              payoutId: newPayout.id,
              paidAt: now,
              utrNumber: utr,
              paidViaVpa: upiVpa
            }
          : c
      )
    );

    addAuditLog(
      affiliateProfile.userId,
      'Arjun Verma (Affiliate)',
      'affiliate',
      'INSTANT_UPI_WITHDRAWAL',
      'payout',
      newPayout.id,
      `Instant UPI withdrawal of ₹${amount} executed to ${upiVpa}. Confirmed UTR: ${utr}.`
    );

    return { success: true, utr, payout: newPayout };
  };

  // Update Affiliate Tax Profile (PAN & UPI VPA)
  const updateAffiliateTaxProfile = (panNumber: string, upiVpa: string) => {
    const cleanPan = panNumber.trim().toUpperCase();
    const isValidPan = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan);

    setAffiliateProfile((prev) => ({
      ...prev,
      panNumber: cleanPan,
      panVerified: isValidPan,
      upiVpa: upiVpa.trim()
    }));

    addAuditLog(
      affiliateProfile.userId,
      'Arjun Verma',
      'affiliate',
      'UPDATED_TAX_PAN_PROFILE',
      'user',
      affiliateProfile.userId,
      `Updated tax profile: PAN ${cleanPan} (${isValidPan ? 'Verified' : 'Invalid Format'}), UPI VPA: ${upiVpa}`
    );
  };

  // Create Provider Offering (Starts as pending_review)
  const createOffering = (
    offeringData: Omit<ProviderOffering, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'status'>
  ): ProviderOffering => {
    const now = new Date().toISOString();
    const newOffering: ProviderOffering = {
      ...offeringData,
      id: `off_${Date.now()}`,
      version: 1,
      status: 'pending_review',
      createdAt: now,
      updatedAt: now
    };

    setOfferings((prev) => [newOffering, ...prev]);

    addAuditLog(
      offeringData.providerId,
      'Provider',
      'provider',
      'CREATED_OFFERING',
      'offering',
      newOffering.id,
      `Submitted offering "${newOffering.title}" for admin approval.`
    );

    // Synchronize offering & reward rules to Supabase
    syncOfferingToSupabase(newOffering);

    return newOffering;
  };

  // Admin Review Offering
  const reviewOffering = (offeringId: string, decision: 'active' | 'rejected', feedback?: string) => {
    setOfferings((prev) =>
      prev.map((o) =>
        o.id === offeringId
          ? {
              ...o,
              status: decision,
              adminFeedback: feedback,
              updatedAt: new Date().toISOString()
            }
          : o
      )
    );

    addAuditLog(
      'usr_admin_01',
      'Bhanu Bonu (Admin)',
      'admin',
      decision === 'active' ? 'APPROVED_OFFERING' : 'REJECTED_OFFERING',
      'offering',
      offeringId,
      `Offering review decision: ${decision}. Feedback: ${feedback || 'None'}`
    );
  };

  // Affiliate capability update
  const updateAffiliateEarningModes = (modes: EarningMode) => {
    setAffiliateProfile((prev) => ({
      ...prev,
      earningModes: modes
    }));

    addAuditLog(
      affiliateProfile.userId,
      'Arjun Verma',
      'affiliate',
      'UPDATED_EARNING_MODES',
      'user',
      affiliateProfile.userId,
      `Affiliate earning capability updated to: ${modes}`
    );
  };

  // Update Commission Status
  const updateCommissionStatus = (commissionId: string, status: CommissionStatus, reason?: string) => {
    setCommissionLedger((prev) =>
      prev.map((c) =>
        c.id === commissionId
          ? {
              ...c,
              status,
              adjustmentReason: reason || c.adjustmentReason
            }
          : c
      )
    );

    addAuditLog(
      'usr_admin_01',
      'Bhanu Bonu (Admin)',
      'admin',
      'UPDATED_COMMISSION_STATUS',
      'commission',
      commissionId,
      `Commission status set to ${status}. Reason: ${reason || 'Normal cycle'}`
    );
  };

  // Record Payout
  const createPayout = (
    affiliateId: string,
    commissionIds: string[],
    amount: number,
    method: string,
    reference: string,
    notes?: string
  ): PayoutRecord => {
    const now = new Date().toISOString();
    const newPayout: PayoutRecord = {
      id: `pay_${Date.now()}`,
      payoutReference: `PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      affiliateId,
      affiliateName: 'Arjun Verma',
      amountRupees: amount,
      status: 'completed',
      paymentMethod: method,
      transactionReference: reference,
      commissionEntryIds: commissionIds,
      createdAt: now,
      processedAt: now,
      notes
    };

    setPayouts((prev) => [newPayout, ...prev]);

    // Mark the linked commissions as 'paid'
    setCommissionLedger((prev) =>
      prev.map((c) =>
        commissionIds.includes(c.id)
          ? {
              ...c,
              status: 'paid',
              payoutId: newPayout.id,
              paidAt: now
            }
          : c
      )
    );

    addAuditLog(
      'usr_admin_01',
      'Bhanu Bonu (Admin)',
      'admin',
      'DISBURSED_PAYOUT',
      'payout',
      newPayout.id,
      `Disbursed payout ${newPayout.payoutReference} of ₹${amount} via ${method}. Txn Ref: ${reference}`
    );

    return newPayout;
  };

  // Contacts
  const addContact = (contact: Omit<Contact, 'id' | 'createdAt'>): Contact => {
    const newContact: Contact = {
      ...contact,
      id: `cnt_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setContacts((prev) => [newContact, ...prev]);
    return newContact;
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // Providers
  const addProvider = (data: Omit<Provider, 'id' | 'status' | 'activeAgreements'>): Provider => {
    const newProv: Provider = {
      ...data,
      id: `prov_${Date.now()}`,
      status: 'active',
      activeAgreements: [
        {
          id: `agr_${Date.now()}`,
          providerId: `prov_${Date.now()}`,
          title: `Standard Affiliate Partnership Charter (${data.businessName})`,
          documentRef: `MoU-ONBOARD-${Date.now().toString().slice(-4)}.pdf`,
          status: 'active',
          effectiveDate: new Date().toISOString().split('T')[0],
          notes: 'Standard marketplace commercial schedule accepted.'
        }
      ]
    };

    setProviders((prev) => [newProv, ...prev]);

    addAuditLog(
      newProv.userId,
      newProv.contactPerson,
      'provider',
      'ONBOARDED_PROVIDER',
      'provider',
      newProv.id,
      `New provider registered: "${newProv.businessName}" (${newProv.city})`
    );

    // Synchronize provider and agreements to Supabase
    syncProviderToSupabase(newProv);

    return newProv;
  };

  const updateProvider = (id: string, data: Partial<Provider>) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );

    addAuditLog(
      id,
      'Provider Admin',
      'provider',
      'UPDATED_PROVIDER_PROFILE',
      'provider',
      id,
      `Updated provider business profile`
    );
  };

  const recordClientPayment = (providerId: string, amount: number, notes?: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId
          ? { ...p, amountPaidRupees: (p.amountPaidRupees || 0) + amount }
          : p
      )
    );

    const prov = providers.find((p) => p.id === providerId);
    addAuditLog(
      'usr_admin_01',
      'Ottobon Finance Desk',
      'admin',
      'RECORDED_CLIENT_PAYMENT',
      'provider',
      providerId,
      `Received payment of ₹${amount} from client "${prov?.businessName || providerId}". Notes: ${notes || 'Settlement'}`
    );
  };

  // Update Provider Offering (PR-04 with Version Snapshotting)
  const updateOffering = (
    offeringId: string,
    data: Partial<ProviderOffering>,
    createNewVersion = false
  ) => {
    const now = new Date().toISOString();
    setOfferings((prev) =>
      prev.map((o) => {
        if (o.id !== offeringId) return o;
        if (createNewVersion) {
          return {
            ...o,
            ...data,
            version: (o.version || 1) + 1,
            status: 'pending_review',
            updatedAt: now
          };
        }
        return {
          ...o,
          ...data,
          updatedAt: now
        };
      })
    );

    addAuditLog(
      data.providerId || 'prov_admin',
      'Provider Admin',
      'provider',
      'UPDATED_OFFERING',
      'offering',
      offeringId,
      `Offering terms updated. Version: ${createNewVersion ? 'incremented (routed to pending_review)' : 'modified in-place'}.`
    );
  };

  // Create Compensating Financial Adjustment / Reversal Entry (PRD Sec 7.3, 10 & 13)
  const createAdjustmentEntry = (
    commissionId: string,
    amountRupees: number,
    reason: string,
    actorName = 'Bhanu Bonu (Admin)'
  ) => {
    const orig = commissionLedger.find((c) => c.id === commissionId);
    if (!orig) return;

    const now = new Date().toISOString();
    const adjustmentEntry: CommissionLedgerEntry = {
      id: `adj_${Date.now()}`,
      referralId: orig.referralId,
      referralCode: orig.referralCode,
      affiliateId: orig.affiliateId,
      providerId: orig.providerId,
      offeringTitle: `[COMPENSATING ADJUSTMENT] ${orig.offeringTitle}`,
      customerName: orig.customerName,
      eventType: orig.eventType,
      providerFeeSnapshot: -Math.abs(amountRupees),
      affiliateRewardSnapshot: -Math.abs(amountRupees),
      companyRetainedSnapshot: 0,
      status: 'adjusted',
      ruleVersionSnapshot: orig.ruleVersionSnapshot,
      triggeredAt: now,
      approvedAt: now,
      adjustmentReason: `Compensating reversal against #${orig.id}: ${reason}`
    };

    setCommissionLedger((prev) => [
      adjustmentEntry,
      ...prev.map((c) => (c.id === commissionId ? { ...c, status: 'reversed' as CommissionStatus, adjustmentReason: reason } : c))
    ]);

    addAuditLog(
      'usr_admin_01',
      actorName,
      'admin',
      'POSTED_FINANCIAL_ADJUSTMENT',
      'commission',
      adjustmentEntry.id,
      `Posted compensating financial adjustment of -₹${amountRupees} against commission ${orig.id}. Reason: ${reason}`
    );
  };

  // Canonical Service Taxonomy Management (PRD AD-02)
  const addCategory = (data: Omit<ServiceCategory, 'id'>): ServiceCategory => {
    const newCat: ServiceCategory = {
      ...data,
      id: `cat_${Date.now()}`
    };
    setCategories((prev) => [...prev, newCat]);
    addAuditLog('usr_admin_01', 'Bhanu Bonu (Admin)', 'admin', 'CREATED_CATEGORY', 'offering', newCat.id, `Created service category "${newCat.name}"`);
    return newCat;
  };

  const updateCategory = (id: string, data: Partial<ServiceCategory>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    addAuditLog('usr_admin_01', 'Bhanu Bonu (Admin)', 'admin', 'UPDATED_CATEGORY', 'offering', id, `Updated service category ${id}`);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addAuditLog('usr_admin_01', 'Bhanu Bonu (Admin)', 'admin', 'DELETED_CATEGORY', 'offering', id, `Deleted category ${id}`);
  };

  const addService = (data: Omit<Service, 'id'>): Service => {
    const newSrv: Service = {
      ...data,
      id: `srv_${Date.now()}`
    };
    setServices((prev) => [...prev, newSrv]);
    addAuditLog('usr_admin_01', 'Bhanu Bonu (Admin)', 'admin', 'CREATED_SERVICE', 'offering', newSrv.id, `Created canonical service "${newSrv.canonicalName}"`);
    return newSrv;
  };

  const updateService = (id: string, data: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    addAuditLog('usr_admin_01', 'Bhanu Bonu (Admin)', 'admin', 'UPDATED_SERVICE', 'offering', id, `Updated canonical service details ${id}`);
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    addAuditLog('usr_admin_01', 'Bhanu Bonu (Admin)', 'admin', 'DELETED_SERVICE', 'offering', id, `Deleted canonical service ${id}`);
  };

  const resetToDefaults = () => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(STORAGE_KEY)) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // ignore
    }
    setProviders(MOCK_PROVIDERS);
    setOfferings(MOCK_OFFERINGS);
    setCategories(MOCK_CATEGORIES);
    setServices(MOCK_SERVICES);
    setReferrals([]);
    setCommissionLedger([]);
    setPayouts([]);
    setAuditLogs([]);
    setContacts([]);
    setAffiliateProfile(INITIAL_AFFILIATE_PROFILE);
  };

  return (
    <DataContext.Provider
      value={{
        providers,
        offerings,
        categories,
        services,
        referrals,
        commissionLedger,
        payouts,
        auditLogs,
        contacts,
        affiliateProfile,
        maskPhoneNumber,
        checkDuplicateReferral,
        submitReferral,
        updateLeadStatus,
        updateConversionStatus,
        logProxyCall,
        reportConversionOutcome,
        approveSettlementWithTds,
        executeInstantUpiPayout,
        updateAffiliateTaxProfile,
        createOffering,
        updateOffering,
        reviewOffering,
        updateAffiliateEarningModes,
        updateCommissionStatus,
        createAdjustmentEntry,
        createPayout,
        addContact,
        deleteContact,
        addProvider,
        updateProvider,
        recordClientPayment,
        addCategory,
        updateCategory,
        deleteCategory,
        addService,
        updateService,
        deleteService,
        resetToDefaults
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
};
