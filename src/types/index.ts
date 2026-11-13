// Core Domain Types for Affiliate Referral Platform (PRD v0.2)

export type UserRole = 'affiliate' | 'provider' | 'admin';

export type EarningMode = 'lead_generation' | 'lead_conversion' | 'both';
export type ReferralEarningModel = 'lead_generation' | 'lead_conversion';

export type OfferingStatus = 'draft' | 'pending_review' | 'active' | 'paused' | 'rejected';
export type ProviderStatus = 'pending_verification' | 'active' | 'suspended';

export type LeadStatus = 'submitted' | 'provider_acknowledged' | 'qualification_pending' | 'qualified' | 'qualification_rejected';
export type ConversionStatus =
  | 'not_applicable'
  | 'follow_up_in_progress'
  | 'converted'
  | 'not_converted'
  | 'converted_pending_clearance'
  | 'cleared_ready_for_payout'
  | 'paid_and_settled'
  | 'review_cooling_off'
  | 'disputed';

export type CommissionEventType = 'qualified_lead' | 'successful_conversion';
export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'adjusted' | 'reversed';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  city?: string;
  providerId?: string; // Binds provider users to their specific business tenant
  password?: string;
}

export interface CallLogEntry {
  id: string;
  referralId: string;
  timestamp: string;
  durationSeconds: number;
  status: 'completed' | 'no_answer' | 'busy';
  callerMaskedBridge: string; // e.g. "+91 80-4567-9912 (Virtual Gateway)"
  targetMaskedPhone: string;  // e.g. "+91 98XXX-XX210"
  notes?: string;
}

export interface WalletAccounts {
  escrowLockedBal: number;
  availableCashBal: number;
  lifetimeTdsDeducted: number;
}

export interface AffiliateProfile {
  userId: string;
  earningModes: EarningMode;
  occupation: string;
  networkTypes: string[];
  interests: string[];
  preferredArea: string;
  city?: string;
  totalEarnedRupees: number;
  pendingRewardRupees: number;
  referralCount: number;
  panNumber?: string;
  panVerified?: boolean;
  upiVpa?: string;
  walletAccounts?: WalletAccounts;
}

export interface ProviderAgreement {
  id: string;
  providerId: string;
  title: string;
  documentRef: string;
  status: 'active' | 'pending_signature' | 'expired';
  effectiveDate: string;
  expiryDate?: string;
  grossReferralPct?: number; // e.g. 40.0 for 40% on MRP
  affiliateSplitPct?: number;
  companySplitPct?: number;
  notes?: string;
}

export interface Provider {
  id: string;
  userId: string;
  businessName: string;
  tagline: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  serviceAreas: string[];
  logoUrl?: string;
  status: ProviderStatus;
  agreementStatus: 'active' | 'pending' | 'suspended';
  activeAgreements: ProviderAgreement[];
  description: string;
  amountPaidRupees?: number; // Total amount this client has paid our company
  commissionPercent?: number; // MoU agreed percentage, e.g. 40 for 40% on MRP
  category?: 'healthcare' | 'education' | 'corporate' | string;
}

export function getProviderSector(provider: {
  businessName?: string;
  tagline?: string;
  description?: string;
  category?: string;
}): 'healthcare' | 'education' | 'corporate' {
  if (provider.category) {
    const c = provider.category.toLowerCase();
    if (c.includes('health') || c.includes('diag') || c.includes('clinic') || c.includes('medic') || c.includes('dental')) return 'healthcare';
    if (c.includes('edu') || c.includes('acad') || c.includes('school') || c.includes('college') || c.includes('train')) return 'education';
    return 'corporate';
  }
  const text = `${provider.businessName || ''} ${provider.tagline || ''} ${provider.description || ''}`.toLowerCase();
  if (
    text.includes('diagnostic') ||
    text.includes('laboratory') ||
    text.includes('clinic') ||
    text.includes('hospital') ||
    text.includes('health') ||
    text.includes('pathology') ||
    text.includes('dental') ||
    text.includes('medical') ||
    text.includes('scan') ||
    text.includes('checkup')
  ) {
    return 'healthcare';
  }
  if (
    text.includes('academy') ||
    text.includes('institute') ||
    text.includes('school') ||
    text.includes('college') ||
    text.includes('education') ||
    text.includes('coaching') ||
    text.includes('training') ||
    text.includes('university')
  ) {
    return 'education';
  }
  return 'corporate';
}

export interface ServiceCategory {
  id: string;
  name: string;
  iconName: string;
  description: string;
  activeOfferingsCount?: number;
}

export interface Service {
  id: string;
  categoryId: string;
  canonicalName: string;
  searchTerms: string[];
  description: string;
}

export interface OfferingRewardRule {
  id: string;
  offeringId: string;
  eventType: CommissionEventType;
  providerFeeRupees: number;     // What the provider pays the platform
  affiliateRewardRupees: number; // What the affiliate receives
  qualificationCriteria?: string;// Specific rule for lead acceptance
  conversionCriteria?: string;   // Specific rule for verified sale
  version: number;
  isActive: boolean;
}

export interface ProviderOffering {
  id: string;
  providerId: string;
  serviceId: string;
  categoryId: string;
  title: string;
  description: string;
  features: string[];
  customerPriceRupees: number;
  currency: string;
  serviceArea: string;
  status: OfferingStatus;
  version: number;
  adminFeedback?: string;
  rewardRules: OfferingRewardRule[];
  createdAt: string;
  updatedAt: string;
}

export interface Referral {
  id: string;
  referralCode: string;
  affiliateId: string;
  providerId: string;
  offeringId: string;
  earningModel: ReferralEarningModel;
  rewardRuleVersion: number;
  
  // Customer details
  customerName: string;
  customerPhone: string;
  clientPhoneMasked?: string;
  customerEmail: string;
  customerCity: string;
  customerNotes?: string;
  authorizationConfirmed: boolean;
  consentStatus?: 'awaiting_consent' | 'consent_given' | 'declined';
  
  // Status tracking, Billing & Anti-Leakage
  leadStatus: LeadStatus;
  conversionStatus: ConversionStatus;
  qualificationNotes?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  conversionNotes?: string;
  saleValueRupees?: number;
  actualBillAmount?: number;
  finalAgreedPrice?: number;
  partnerInvoiceRef?: string;
  billProofUrl?: string;
  disputeNotes?: string;
  disputeProofUrl?: string;
  disputedAt?: string;
  providerInvoiceId?: string;
  providerFeeCalculated?: number;
  affiliateRewardCalculated?: number;
  platformMarginCalculated?: number;
  statusHistory?: ReferralStatusHistory[];
  callLogs?: CallLogEntry[];
  
  createdAt: string;
  updatedAt: string;
}

export interface ProviderMonthlyInvoiceItem {
  referralId: string;
  referralCode: string;
  customerName: string;
  affiliateId: string;
  affiliateName: string;
  billedAmount: number;
  providerFee: number;
  affiliateShare: number;
  platformRetained: number;
  invoiceRef?: string;
  billProofUrl?: string;
  convertedAt: string;
}

export interface ProviderMonthlyInvoice {
  id: string;
  invoiceNumber: string;            // e.g. "INV-AJAY-2026-11"
  providerId: string;
  providerBusinessName: string;
  billingMonth: string;             // e.g. "November 2026"
  billingYear: number;              // 2026
  totalBilledCustomers: number;     // e.g. 2
  totalPatientBilledAmount: number; // e.g. ₹140 (₹100 + ₹40)
  mouCommissionPercent: number;     // e.g. 30%
  totalFeeOwedToPlatform: number;   // e.g. ₹42 (30% of ₹140)
  affiliateShareTotal: number;      // e.g. ₹21 (50% of ₹42)
  platformRetainedTotal: number;    // e.g. ₹21 (50% of ₹42)
  status: 'unpaid' | 'paid';
  generatedAt: string;
  paidAt?: string;
  paymentReference?: string;        // UTR / Transaction ID
  referralIds: string[];
  items: ProviderMonthlyInvoiceItem[];
}

export interface ReferralStatusHistory {
  id: string;
  referralId: string;
  changedBy: string;
  actorRole: UserRole;
  fromStatus: string;
  toStatus: string;
  reason: string;
  timestamp: string;
}

export interface CommissionLedgerEntry {
  id: string;
  referralId: string;
  referralCode: string;
  affiliateId: string;
  providerId: string;
  offeringTitle: string;
  customerName: string;
  eventType: CommissionEventType;
  
  // Financial Snapshot
  providerFeeSnapshot: number;
  affiliateRewardSnapshot: number;
  companyRetainedSnapshot: number;
  
  // Section 194H Compliance & Maker-Checker Proof
  partnerInvoiceRef?: string;
  tdsRate?: number;       // 5% with PAN or 20% without PAN
  tdsDeducted?: number;   // Amount withheld
  netPayable?: number;     // Post-TDS amount released to available cash
  utrNumber?: string;
  paidViaVpa?: string;
  
  status: CommissionStatus;
  payoutId?: string;
  ruleVersionSnapshot: number;
  
  triggeredAt: string;
  approvedAt?: string;
  paidAt?: string;
  adjustmentReason?: string;
}

export interface PayoutRecord {
  id: string;
  payoutReference: string;
  affiliateId: string;
  affiliateName: string;
  amountRupees: number;
  grossAmountRupees?: number;
  tdsWithheldRupees?: number;
  netAmountRupees?: number;
  status: PayoutStatus;
  paymentMethod: string;
  vpa?: string;
  utrNumber?: string;
  bankAccountMasked?: string;
  transactionReference?: string;
  commissionEntryIds: string[];
  createdAt: string;
  processedAt?: string;
  notes?: string;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'offering' | 'provider' | 'referral' | 'commission' | 'payout' | 'user' | 'invoice';
  entityId: string;
  details: string;
  timestamp: string;
}

export interface Contact {
  id: string;
  affiliateId: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  occupation?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
}
