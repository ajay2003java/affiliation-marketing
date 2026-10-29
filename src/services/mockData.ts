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

export const MOCK_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat_health',
    name: 'Healthcare & Diagnostics',
    iconName: 'Activity',
    description: 'Preventive health checkups, imaging scans, and clinical pathology packages',
    activeOfferingsCount: 0
  },
  {
    id: 'cat_corp',
    name: 'Corporate & HR Services',
    iconName: 'Briefcase',
    description: 'Executive search, legal compliance, and workforce development',
    activeOfferingsCount: 0
  },
  {
    id: 'cat_it',
    name: 'Cloud & IT Solutions',
    iconName: 'Server',
    description: 'Architecture consulting, infrastructure audits, and cybersecurity',
    activeOfferingsCount: 0
  },
  {
    id: 'cat_edu',
    name: 'Professional Training',
    iconName: 'GraduationCap',
    description: 'Leadership workshops, technical certifications, and corporate training',
    activeOfferingsCount: 0
  }
];

// Production Clean Slate: Zero mock entities
export const MOCK_SERVICES: Service[] = [];
export const MOCK_PROVIDERS: Provider[] = [];
export const MOCK_OFFERINGS: ProviderOffering[] = [];
export const MOCK_REFERRALS: Referral[] = [];
export const MOCK_COMMISSION_LEDGER: CommissionLedgerEntry[] = [];
export const MOCK_PAYOUTS: PayoutRecord[] = [];
export const MOCK_AUDIT_LOGS: AuditEvent[] = [];
export const MOCK_CONTACTS: Contact[] = [];
