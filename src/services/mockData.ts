import {
  User,
  AffiliateProfile,
  Provider,
  ServiceCategory,
  Service,
  ProviderOffering,
  Referral,
  CommissionLedgerEntry,
  PayoutRecord,
  AuditEvent,
  Contact
} from '../types';

// Production: Only the admin user exists. All other data is real and created at runtime.
export const ADMIN_USER: User = {
  id: 'usr_admin_01',
  name: 'Bhanu Bonu',
  email: 'admin@ottobon.in',
  role: 'admin',
  phone: '+91 99887 76655'
};

export const MOCK_USERS: Record<string, User> = {
  admin: ADMIN_USER
};

export const MOCK_AFFILIATE_PROFILE: AffiliateProfile = {
  userId: '',
  earningModes: 'both',
  occupation: '',
  networkTypes: [],
  interests: [],
  preferredArea: '',
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

// Production Clean Slate: Zero mock entities — everything is created by admin/providers at runtime
export const MOCK_CATEGORIES: ServiceCategory[] = [];
export const MOCK_SERVICES: Service[] = [];
export const MOCK_PROVIDERS: Provider[] = [];
export const MOCK_OFFERINGS: ProviderOffering[] = [];
export const MOCK_REFERRALS: Referral[] = [];
export const MOCK_COMMISSION_LEDGER: CommissionLedgerEntry[] = [];
export const MOCK_PAYOUTS: PayoutRecord[] = [];
export const MOCK_AUDIT_LOGS: AuditEvent[] = [];
export const MOCK_CONTACTS: Contact[] = [];
