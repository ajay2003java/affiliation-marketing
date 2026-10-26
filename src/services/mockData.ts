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

export const MOCK_USERS: Record<string, User> = {
  affiliate: {
    id: 'usr_aff_01',
    name: 'Arjun Verma',
    email: 'arjun.verma@networkhub.in',
    role: 'affiliate',
    phone: '+91 98490 12345',
  },
  provider: {
    id: 'usr_prov_01',
    name: 'Kumar Chenagalla',
    email: 'dhanvikadiagnostics@gmail.com',
    role: 'provider',
    phone: '+91 88852 82637',
    providerId: 'prov_dhanvika'
  },
  provider_apex: {
    id: 'usr_prov_02',
    name: 'Deepak Rao',
    email: 'partners@apexcloud.io',
    role: 'provider',
    phone: '+91 94401 22880',
    providerId: 'prov_apex'
  },
  admin: {
    id: 'usr_admin_01',
    name: 'Bhanu Bonu',
    email: 'academy@ottobon.in',
    role: 'admin',
    phone: '+91 99887 76655',
  }
};

export const MOCK_AFFILIATE_PROFILE: AffiliateProfile = {
  userId: 'usr_aff_01',
  earningModes: 'both', // Can participate in both Lead Gen and Conversion
  occupation: 'Senior Corporate Consultant & Community Lead',
  networkTypes: ['Corporate HRs', 'Doctors & Clinics', 'SME Business Owners', 'Alumni Association'],
  interests: ['Healthcare Diagnostics', 'Corporate Training', 'Executive Staffing'],
  preferredArea: 'Hyderabad & Visakhapatnam',
  totalEarnedRupees: 18350,
  pendingRewardRupees: 4200,
  referralCount: 7,
  panNumber: 'ABCDE1234F',
  panVerified: true,
  upiVpa: 'arjun.verma@okhdfcbank',
  walletAccounts: {
    escrowLockedBal: 4800,
    availableCashBal: 13550,
    lifetimeTdsDeducted: 712
  }
};

export const MOCK_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat_health',
    name: 'Healthcare & Diagnostics',
    iconName: 'Activity',
    description: 'Preventive health checkups, imaging scans, and pathology packages',
    activeOfferingsCount: 3
  },
  {
    id: 'cat_corp',
    name: 'Corporate & HR Services',
    iconName: 'Briefcase',
    description: 'Executive search, legal compliance, and workforce development',
    activeOfferingsCount: 2
  },
  {
    id: 'cat_it',
    name: 'Cloud & IT Solutions',
    iconName: 'Server',
    description: 'Architecture consulting, infrastructure audits, and cybersecurity',
    activeOfferingsCount: 2
  },
  {
    id: 'cat_edu',
    name: 'Professional Training',
    iconName: 'GraduationCap',
    description: 'Leadership workshops, technical certifications, and sales training',
    activeOfferingsCount: 1
  },
  {
    id: 'cat_food',
    name: 'Food & Dining Services',
    iconName: 'Utensils',
    description: 'Multi-cuisine dining, party catering, bulk orders, and restaurant meals',
    activeOfferingsCount: 4
  }
];

export const MOCK_SERVICES: Service[] = [
  {
    id: 'srv_full_checkup',
    categoryId: 'cat_health',
    canonicalName: 'Full Body Health Checkup',
    searchTerms: ['master checkup', 'blood test package', 'wellness screen', 'pathology', 'dhanvika'],
    description: 'Comprehensive 85+ parameter biochemical and clinical diagnostic screen.'
  },
  {
    id: 'srv_cardiac_screen',
    categoryId: 'cat_health',
    canonicalName: 'Executive Cardiac & Diabetes Screen',
    searchTerms: ['heart check', 'ecg', 'echo', 'hba1c', 'lipid profile', 'cardiology'],
    description: 'Cardiovascular assessment including 2D Echo, TMT, and advanced metabolic markers.'
  },
  {
    id: 'srv_exec_search',
    categoryId: 'cat_corp',
    canonicalName: 'Executive Leadership Recruitment',
    searchTerms: ['talent acquisition', 'headhunting', 'c-suite hiring', 'ottobon staffing'],
    description: 'End-to-end retained executive recruitment for leadership & specialized roles.'
  },
  {
    id: 'srv_cloud_audit',
    categoryId: 'cat_it',
    canonicalName: 'Cloud Security & Compliance Audit',
    searchTerms: ['aws security', 'azure audit', 'iso compliance', 'vulnerability assessment'],
    description: 'Comprehensive cloud architecture vulnerability and regulatory compliance audit.'
  }
];

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'prov_dhanvika',
    userId: 'usr_prov_01',
    businessName: 'Dhanvika Diagnostics',
    tagline: 'Precision Diagnostics & Preventive Health Specialists',
    contactPerson: 'Kumar Chenagalla',
    email: 'dhanvikadiagnostics@gmail.com',
    phone: '+91 88852 82637',
    address: 'Plot No. 797, Road No. 3, Vaidehinagar, Vanasthalipuram',
    city: 'Hyderabad',
    serviceAreas: ['Hyderabad', 'Secunderabad', 'Rangareddy'],
    status: 'active',
    agreementStatus: 'active',
    description: 'State-of-the-art diagnostic center providing accurate clinical pathology, digital imaging, and customized corporate wellness packages.',
    amountPaidRupees: 6500,
    activeAgreements: [
      {
        id: 'agr_dh_01',
        providerId: 'prov_dhanvika',
        title: 'Affiliate Marketing & Referral Agreement (MoU)',
        documentRef: 'MoU-OTT-DHAN-2026.pdf',
        status: 'active',
        effectiveDate: '2026-10-09',
        expiryDate: '2027-10-08',
        notes: 'Commercial terms accepted under Annexure A.'
      }
    ]
  },
  {
    id: 'prov_ottobon',
    userId: 'usr_admin_01',
    businessName: 'Ottobon Professional Services',
    tagline: 'Strategic Talent & Enterprise Advisory Partners',
    contactPerson: 'Bhanu Bonu',
    email: 'academy@ottobon.in',
    phone: '+91 891 254 8899',
    address: 'Suite 102, A Square Business Centre, Waltair Main Road',
    city: 'Visakhapatnam',
    serviceAreas: ['Visakhapatnam', 'Vijayawada', 'Hyderabad', 'Bangalore'],
    status: 'active',
    agreementStatus: 'active',
    description: 'Premier talent solutions firm specializing in leadership search, executive mentoring, and organizational compliance.',
    activeAgreements: [
      {
        id: 'agr_ott_01',
        providerId: 'prov_ottobon',
        title: 'Master Agency & Referral Charter',
        documentRef: 'MoU-OTT-MASTER-2026.pdf',
        status: 'active',
        effectiveDate: '2026-01-01',
        notes: 'Direct founding partner listing.'
      }
    ]
  },
  {
    id: 'prov_apex',
    userId: 'usr_prov_02',
    businessName: 'Apex Cloud & Cyber Systems',
    tagline: 'Enterprise Cloud Transformation & Zero-Trust Security',
    contactPerson: 'Deepak Rao',
    email: 'partners@apexcloud.io',
    phone: '+91 94401 22880',
    address: 'Level 4, Cyber Gateway, HITEC City',
    city: 'Hyderabad',
    serviceAreas: ['Pan-India', 'Remote'],
    status: 'active',
    agreementStatus: 'active',
    description: 'Certified AWS & Azure Solutions Partner helping growing businesses migrate securely with certified ISO 27001 readiness.',
    activeAgreements: []
  }
];

export const MOCK_OFFERINGS: ProviderOffering[] = [
  {
    id: 'off_master_health',
    providerId: 'prov_dhanvika',
    serviceId: 'srv_full_checkup',
    categoryId: 'cat_health',
    title: 'Comprehensive Master Health Checkup (85+ Tests)',
    description: 'Complete metabolic panel, liver & kidney function, thyroid profile, CBC, vitamin D/B12, and doctor consultation.',
    features: ['Home sample collection included', 'Same-day NABL verified report', 'Free physician consultation review'],
    customerPriceRupees: 3999,
    currency: 'INR',
    serviceArea: 'Hyderabad & Secunderabad (Home Visit Available)',
    status: 'active',
    version: 1,
    createdAt: '2026-10-10T10:00:00Z',
    updatedAt: '2026-10-10T10:00:00Z',
    rewardRules: [
      {
        id: 'rr_mh_lead',
        offeringId: 'off_master_health',
        eventType: 'qualified_lead',
        providerFeeRupees: 500,
        affiliateRewardRupees: 250, // Strict 50% MoU policy
        qualificationCriteria: 'Prospect contact verified, resident in Hyderabad/Secunderabad, explicitly expressed interest in health package booking within 14 days.',
        version: 1,
        isActive: true
      },
      {
        id: 'rr_mh_conv',
        offeringId: 'off_master_health',
        eventType: 'successful_conversion',
        providerFeeRupees: 1200,
        affiliateRewardRupees: 600, // Strict 50% MoU policy
        qualificationCriteria: 'Customer completes test sample booking and payment.',
        conversionCriteria: 'Package paid and sample successfully collected by diagnostic team.',
        version: 1,
        isActive: true
      }
    ]
  },
  {
    id: 'off_cardiac_diabetes',
    providerId: 'prov_dhanvika',
    serviceId: 'srv_cardiac_screen',
    categoryId: 'cat_health',
    title: 'Executive Cardiac & Diabetes Diagnostic Suite',
    description: 'In-depth cardiovascular risk assessment: 2D Echocardiogram, Computerized TMT, HbA1c, hs-CRP, Lipid Subfractions, and Cardiologist tele-eval.',
    features: ['Specialized center-based evaluation', 'Supervised stress test', 'Direct report review by Senior Cardiologist'],
    customerPriceRupees: 6499,
    currency: 'INR',
    serviceArea: 'Hyderabad (Center Visit)',
    status: 'active',
    version: 1,
    createdAt: '2026-10-10T11:30:00Z',
    updatedAt: '2026-10-10T11:30:00Z',
    rewardRules: [
      {
        id: 'rr_cd_lead',
        offeringId: 'off_cardiac_diabetes',
        eventType: 'qualified_lead',
        providerFeeRupees: 700,
        affiliateRewardRupees: 350, // Strict 50% MoU policy
        qualificationCriteria: 'Adult 30+ years, confirmed phone number, scheduled preliminary consultation window.',
        version: 1,
        isActive: true
      },
      {
        id: 'rr_cd_conv',
        offeringId: 'off_cardiac_diabetes',
        eventType: 'successful_conversion',
        providerFeeRupees: 1800,
        affiliateRewardRupees: 900, // Strict 50% MoU policy
        conversionCriteria: 'Completed screening appointment and paid invoice at Dhanvika Diagnostics.',
        version: 1,
        isActive: true
      }
    ]
  },
  {
    id: 'off_corporate_wellness',
    providerId: 'prov_dhanvika',
    serviceId: 'srv_full_checkup',
    categoryId: 'cat_health',
    title: 'Annual Corporate Employee Health Camp (Min 25 Employees)',
    description: 'On-site mobile health screening camp for IT parks, factories, and corporate offices with custom HR executive dashboards.',
    features: ['On-site phlebotomy camp', 'Aggregated corporate health risk report for HR', 'Dedicated camp coordinator'],
    customerPriceRupees: 35000,
    currency: 'INR',
    serviceArea: 'Telangana & Andhra Pradesh',
    status: 'active',
    version: 1,
    createdAt: '2026-10-11T09:00:00Z',
    updatedAt: '2026-10-11T09:00:00Z',
    rewardRules: [
      {
        id: 'rr_cw_lead',
        offeringId: 'off_corporate_wellness',
        eventType: 'qualified_lead',
        providerFeeRupees: 1500,
        affiliateRewardRupees: 750, // Strict 50% MoU policy
        qualificationCriteria: 'Corporate HR / Operations Head contact verified, company employee size > 25, active discussion for camp dates.',
        version: 1,
        isActive: true
      },
      {
        id: 'rr_cw_conv',
        offeringId: 'off_corporate_wellness',
        eventType: 'successful_conversion',
        providerFeeRupees: 6500,
        affiliateRewardRupees: 3250, // Strict 50% MoU policy
        conversionCriteria: 'Executed corporate camp purchase order and booking advance received.',
        version: 1,
        isActive: true
      }
    ]
  },
  {
    id: 'off_exec_hiring',
    providerId: 'prov_ottobon',
    serviceId: 'srv_exec_search',
    categoryId: 'cat_corp',
    title: 'Retained CXO & Senior Leadership Talent Search',
    description: 'Confidential executive headhunting with comprehensive 360-degree psychometric and background verification for VP/Director/C-Suite positions.',
    features: ['Guaranteed shortlists within 21 days', '6-month free candidate replacement clause', 'Confidential board-level search process'],
    customerPriceRupees: 85000,
    currency: 'INR',
    serviceArea: 'Pan-India',
    status: 'active',
    version: 1,
    createdAt: '2026-10-09T14:00:00Z',
    updatedAt: '2026-10-09T14:00:00Z',
    rewardRules: [
      {
        id: 'rr_eh_lead',
        offeringId: 'off_exec_hiring',
        eventType: 'qualified_lead',
        providerFeeRupees: 2500,
        affiliateRewardRupees: 1250, // Strict 50% MoU policy
        qualificationCriteria: 'Managing Director or HR Director referral with open leadership role (CTC >= 25LPA).',
        version: 1,
        isActive: true
      },
      {
        id: 'rr_eh_conv',
        offeringId: 'off_exec_hiring',
        eventType: 'successful_conversion',
        providerFeeRupees: 14000,
        affiliateRewardRupees: 7000, // Strict 50% MoU policy
        conversionCriteria: 'Search engagement agreement signed with retainer fee deposited.',
        version: 1,
        isActive: true
      }
    ]
  },
  {
    id: 'off_cloud_sec',
    providerId: 'prov_apex',
    serviceId: 'srv_cloud_audit',
    categoryId: 'cat_it',
    title: 'Cloud Security Posture & Vulnerability Audit',
    description: 'Thorough review of AWS/Azure production infrastructure covering IAM roles, S3 access, network perimeters, and CIS Benchmark compliance.',
    features: ['Detailed executive summary & remediation roadmap', 'Penetration testing of public endpoints', 'Certified CISSP auditor sign-off'],
    customerPriceRupees: 45000,
    currency: 'INR',
    serviceArea: 'Remote / All India',
    status: 'active',
    version: 1,
    createdAt: '2026-10-11T12:00:00Z',
    updatedAt: '2026-10-11T12:00:00Z',
    rewardRules: [
      {
        id: 'rr_cs_conv',
        offeringId: 'off_cloud_sec',
        eventType: 'successful_conversion',
        providerFeeRupees: 6000,
        affiliateRewardRupees: 3000, // Strict 50% MoU policy
        conversionCriteria: 'Client signs statement of work and makes 50% project kickoff payment.',
        version: 1,
        isActive: true
      }
    ]
  }
];

export const MOCK_REFERRALS: Referral[] = [
  {
    id: 'ref_001',
    referralCode: 'REF-2026-1082',
    affiliateId: 'usr_aff_01',
    providerId: 'prov_dhanvika',
    offeringId: 'off_master_health',
    earningModel: 'lead_generation',
    rewardRuleVersion: 1,
    customerName: 'Suresh Nambiar',
    customerPhone: '+91 97011 44552',
    customerEmail: 'suresh.nambiar@techsol.com',
    customerCity: 'Hyderabad (Kondapur)',
    customerNotes: 'Looking for full family wellness checkup before overseas travel.',
    authorizationConfirmed: true,
    leadStatus: 'qualified',
    conversionStatus: 'not_applicable',
    qualificationNotes: 'Customer contacted, location confirmed within delivery zone, package details shared.',
    statusHistory: [
      {
        id: 'hist_001_1',
        referralId: 'ref_001',
        changedBy: 'Arjun Verma',
        actorRole: 'affiliate',
        fromStatus: 'none',
        toStatus: 'submitted',
        reason: 'Referral submitted with customer consent.',
        timestamp: '2026-10-11T14:30:00Z'
      },
      {
        id: 'hist_001_2',
        referralId: 'ref_001',
        changedBy: 'Kumar Chenagalla',
        actorRole: 'provider',
        fromStatus: 'submitted',
        toStatus: 'qualified',
        reason: 'Contacted customer; package confirmed within delivery zone.',
        timestamp: '2026-10-12T10:15:00Z'
      }
    ],
    createdAt: '2026-10-11T14:30:00Z',
    updatedAt: '2026-10-12T10:15:00Z'
  },
  {
    id: 'ref_002',
    referralCode: 'REF-2026-1083',
    affiliateId: 'usr_aff_01',
    providerId: 'prov_dhanvika',
    offeringId: 'off_corporate_wellness',
    earningModel: 'lead_conversion',
    rewardRuleVersion: 1,
    customerName: 'Priya Rajendran',
    customerPhone: '+91 98492 88712',
    customerEmail: 'priya.r@innovexsoftware.in',
    customerCity: 'Hyderabad (Gachibowli)',
    customerNotes: 'Head of People at Innovex Software (45 employees) booking annual health drive.',
    authorizationConfirmed: true,
    leadStatus: 'qualified',
    conversionStatus: 'converted',
    conversionNotes: 'Corporate wellness agreement executed for 45 employees. PO received and camp scheduled.',
    saleValueRupees: 45000,
    statusHistory: [
      {
        id: 'hist_002_1',
        referralId: 'ref_002',
        changedBy: 'Arjun Verma',
        actorRole: 'affiliate',
        fromStatus: 'none',
        toStatus: 'submitted',
        reason: 'Referral submitted for corporate wellness camp.',
        timestamp: '2026-10-10T16:00:00Z'
      },
      {
        id: 'hist_002_2',
        referralId: 'ref_002',
        changedBy: 'Kumar Chenagalla',
        actorRole: 'provider',
        fromStatus: 'submitted',
        toStatus: 'qualified',
        reason: 'Corporate HR contact verified (>25 employees). Discussion active.',
        timestamp: '2026-10-11T11:00:00Z'
      },
      {
        id: 'hist_002_3',
        referralId: 'ref_002',
        changedBy: 'Kumar Chenagalla',
        actorRole: 'provider',
        fromStatus: 'follow_up_in_progress',
        toStatus: 'converted',
        reason: 'Executed agreement for 45 employees. PO received and camp scheduled.',
        timestamp: '2026-10-12T16:45:00Z'
      }
    ],
    createdAt: '2026-10-10T16:00:00Z',
    updatedAt: '2026-10-12T16:45:00Z'
  },
  {
    id: 'ref_003',
    referralCode: 'REF-2026-1084',
    affiliateId: 'usr_aff_01',
    providerId: 'prov_ottobon',
    offeringId: 'off_exec_hiring',
    earningModel: 'lead_generation',
    rewardRuleVersion: 1,
    customerName: 'Dr. Raghavendra Rao',
    customerPhone: '+91 99088 12300',
    customerEmail: 'raghavendra@raopharmatech.com',
    customerCity: 'Visakhapatnam',
    customerNotes: 'Managing Director hiring Chief Scientific Officer for formulation R&D.',
    authorizationConfirmed: true,
    leadStatus: 'qualification_pending',
    conversionStatus: 'not_applicable',
    statusHistory: [
      {
        id: 'hist_003_1',
        referralId: 'ref_003',
        changedBy: 'Arjun Verma',
        actorRole: 'affiliate',
        fromStatus: 'none',
        toStatus: 'submitted',
        reason: 'Referral submitted for executive search.',
        timestamp: '2026-10-12T18:20:00Z'
      }
    ],
    createdAt: '2026-10-12T18:20:00Z',
    updatedAt: '2026-10-12T18:20:00Z'
  },
  {
    id: 'ref_004',
    referralCode: 'REF-2026-1085',
    affiliateId: 'usr_aff_01',
    providerId: 'prov_dhanvika',
    offeringId: 'off_cardiac_diabetes',
    earningModel: 'lead_conversion',
    rewardRuleVersion: 1,
    customerName: 'Anil K. Reddy',
    customerPhone: '+91 98850 77119',
    customerEmail: 'anilreddy.k@outlook.com',
    customerCity: 'Hyderabad (Banjara Hills)',
    customerNotes: 'Advised comprehensive cardiovascular evaluation after routine health screening.',
    authorizationConfirmed: true,
    leadStatus: 'qualified',
    conversionStatus: 'follow_up_in_progress',
    conversionNotes: 'Appointment booked for coming Saturday morning at Vanasthalipuram diagnostic center.',
    statusHistory: [
      {
        id: 'hist_004_1',
        referralId: 'ref_004',
        changedBy: 'Arjun Verma',
        actorRole: 'affiliate',
        fromStatus: 'none',
        toStatus: 'submitted',
        reason: 'Referral submitted for cardiac screening package.',
        timestamp: '2026-10-12T11:00:00Z'
      },
      {
        id: 'hist_004_2',
        referralId: 'ref_004',
        changedBy: 'Kumar Chenagalla',
        actorRole: 'provider',
        fromStatus: 'submitted',
        toStatus: 'qualified',
        reason: 'Patient confirmed clinical need and schedule interest.',
        timestamp: '2026-10-13T08:30:00Z'
      }
    ],
    createdAt: '2026-10-12T11:00:00Z',
    updatedAt: '2026-10-13T08:30:00Z'
  }
];

export const MOCK_COMMISSION_LEDGER: CommissionLedgerEntry[] = [
  {
    id: 'comm_001',
    referralId: 'ref_001',
    referralCode: 'REF-2026-1082',
    affiliateId: 'usr_aff_01',
    providerId: 'prov_dhanvika',
    offeringTitle: 'Comprehensive Master Health Checkup',
    customerName: 'Suresh Nambiar',
    eventType: 'qualified_lead',
    providerFeeSnapshot: 500,
    affiliateRewardSnapshot: 350,
    companyRetainedSnapshot: 150,
    status: 'approved',
    ruleVersionSnapshot: 1,
    triggeredAt: '2026-10-12T10:15:00Z',
    approvedAt: '2026-10-12T14:00:00Z'
  },
  {
    id: 'comm_002',
    referralId: 'ref_002',
    referralCode: 'REF-2026-1083',
    affiliateId: 'usr_aff_01',
    providerId: 'prov_dhanvika',
    offeringTitle: 'Annual Corporate Employee Health Camp',
    customerName: 'Priya Rajendran (Innovex Software)',
    eventType: 'successful_conversion',
    providerFeeSnapshot: 6500,
    affiliateRewardSnapshot: 4800,
    companyRetainedSnapshot: 1700,
    status: 'paid',
    payoutId: 'pay_oct_01',
    ruleVersionSnapshot: 1,
    triggeredAt: '2026-10-12T16:45:00Z',
    approvedAt: '2026-10-12T17:30:00Z',
    paidAt: '2026-10-13T07:15:00Z'
  }
];

export const MOCK_PAYOUTS: PayoutRecord[] = [
  {
    id: 'pay_oct_01',
    payoutReference: 'PAY-2026-9921',
    affiliateId: 'usr_aff_01',
    affiliateName: 'Arjun Verma',
    amountRupees: 4800,
    status: 'completed',
    paymentMethod: 'IMPS Direct Bank Transfer',
    bankAccountMasked: 'HDFC Bank - •••• 4192',
    transactionReference: 'UTR-HDFC-994821033',
    commissionEntryIds: ['comm_002'],
    createdAt: '2026-10-12T18:00:00Z',
    processedAt: '2026-10-13T07:15:00Z',
    notes: 'Disbursed for verified corporate conversion referral REF-2026-1083.'
  }
];

export const MOCK_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'aud_001',
    actorId: 'usr_admin_01',
    actorName: 'Bhanu Bonu',
    actorRole: 'admin',
    action: 'APPROVED_OFFERING',
    entityType: 'offering',
    entityId: 'off_master_health',
    details: 'Verified provider MoU & activated dual reward rules (Lead Gen: ₹350, Conversion: ₹900).',
    timestamp: '2026-10-10T10:10:00Z'
  },
  {
    id: 'aud_002',
    actorId: 'usr_prov_01',
    actorName: 'Kumar Chenagalla',
    actorRole: 'provider',
    action: 'QUALIFIED_LEAD',
    entityType: 'referral',
    entityId: 'ref_001',
    details: 'Validated prospect contact within service area. Lead status updated to Qualified.',
    timestamp: '2026-10-12T10:15:00Z'
  },
  {
    id: 'aud_003',
    actorId: 'usr_admin_01',
    actorName: 'Bhanu Bonu',
    actorRole: 'admin',
    action: 'VERIFIED_CONVERSION',
    entityType: 'referral',
    entityId: 'ref_002',
    details: 'Verified PO from Innovex Software for corporate health camp. Commission ₹4,800 triggered.',
    timestamp: '2026-10-12T16:45:00Z'
  },
  {
    id: 'aud_004',
    actorId: 'usr_admin_01',
    actorName: 'Bhanu Bonu',
    actorRole: 'admin',
    action: 'DISBURSED_PAYOUT',
    entityType: 'payout',
    entityId: 'pay_oct_01',
    details: 'Disbursed payout PAY-2026-9921 for ₹4,800 to Arjun Verma via IMPS.',
    timestamp: '2026-10-13T07:15:00Z'
  }
];

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 'cnt_001',
    affiliateId: 'usr_aff_01',
    name: 'Suresh Nambiar',
    phone: '+91 97011 44552',
    email: 'suresh.nambiar@techsol.com',
    city: 'Hyderabad',
    occupation: 'Engineering Director',
    tags: ['Healthcare', 'Corporate Network'],
    notes: 'Interested in preventive diagnostics for family.',
    createdAt: '2026-10-08T09:00:00Z'
  },
  {
    id: 'cnt_002',
    affiliateId: 'usr_aff_01',
    name: 'Priya Rajendran',
    phone: '+91 98492 88712',
    email: 'priya.r@innovexsoftware.in',
    city: 'Hyderabad',
    occupation: 'VP Human Resources',
    tags: ['Corporate HR', 'Corporate Wellness', 'Executive Search'],
    notes: 'Coordinates annual employee wellness camps.',
    createdAt: '2026-10-09T11:00:00Z'
  },
  {
    id: 'cnt_003',
    affiliateId: 'usr_aff_01',
    name: 'Dr. Raghavendra Rao',
    phone: '+91 99088 12300',
    email: 'raghavendra@raopharmatech.com',
    city: 'Visakhapatnam',
    occupation: 'Pharma Founder / MD',
    tags: ['Pharma', 'Leadership Hiring'],
    notes: 'Looking for senior talent recruitment partner.',
    createdAt: '2026-10-10T14:30:00Z'
  }
];
