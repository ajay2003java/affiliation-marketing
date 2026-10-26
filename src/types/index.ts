// Core Domain Types for Affiliate Referral Platform (PRD v0.2)

export type UserRole = 'affiliate' | 'provider' | 'admin';

export type EarningMode = 'lead_generation' | 'lead_conversion' | 'both';
export type ReferralEarningModel = 'lead_generation' | 'lead_conversion';

export type OfferingStatus = 'draft' | 'pending_review' | 'active' | 'paused' | 'rejected';
export type ProviderStatus = 'pending_verification' | 'active' | 'suspended';

export type LeadStatus = 'submitted' | 'provider_acknowledged' | 'qualification_pending' | 'qualified' | 'qualification_rejected';
export type ConversionStatus = 'not_applicable' | 'follow_up_in_progress' | 'converted' | 'not_converted';

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
  providerId?: string; // Binds provider users to their specific business tenant
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
  
  // Status tracking & Anti-Leakage
  leadStatus: LeadStatus;
  conversionStatus: ConversionStatus;
  qualificationNotes?: string;
  rejectionReason?: string;
  conversionNotes?: string;
  saleValueRupees?: number;
  finalAgreedPrice?: number;
  partnerInvoiceRef?: string;
  statusHistory?: ReferralStatusHistory[];
  callLogs?: CallLogEntry[];
  
  createdAt: string;
  updatedAt: string;
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
  entityType: 'offering' | 'provider' | 'referral' | 'commission' | 'payout' | 'user';
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
