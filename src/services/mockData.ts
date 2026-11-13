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
export const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'cc2072e6-981f-4bc5-a0a7-1071b2e16d15',
    userId: 'usr_prov_sms',
    businessName: 'SMS Diagnostics',
    tagline: 'Leading Clinical Pathology & Diagnostic Services',
    contactPerson: 'Suresh Kumar',
    email: 'smsdiagnostics14@gmail.com',
    phone: '9059331954',
    address: '18-1-30/9, opp. KGH Op gate, Aditya complex, Visakhapatnam 530002',
    city: 'Visakhapatnam',
    serviceAreas: ['Visakhapatnam', 'Maharanipeta', 'KGH Area', 'Pan-City'],
    description: 'Premier clinical diagnostics lab providing pathology, blood investigations, and preventive health profiles.',
    status: 'active',
    agreementStatus: 'active',
    amountPaidRupees: 10000,
    category: 'healthcare',
    commissionPercent: 40,
    activeAgreements: [
      {
        id: 'agr_sms_001',
        providerId: 'cc2072e6-981f-4bc5-a0a7-1071b2e16d15',
        title: 'Bilateral Diagnostic Affiliate Partnership MoU (40% Model)',
        documentRef: 'SBL-MOU-2026-SMS-40',
        effectiveDate: '2026-01-01',
        expiryDate: '2027-12-31',
        status: 'active',
        grossReferralPct: 40.0,
        affiliateSplitPct: 50.0,
        companySplitPct: 50.0,
        notes: 'Signed MoU: 40% gross referral rate on MRP.'
      }
    ]
  },
  {
    id: '44d57460-17b7-48f4-bedd-test00000001',
    userId: 'usr_prov_test_apex',
    businessName: 'Apex Health Diagnostics Clinic',
    tagline: 'Premier Pathology & Advanced Diagnostic Center',
    contactPerson: 'Dr. R. Sharma',
    email: 'provider@test.com',
    phone: '9876543210',
    address: 'Plot 42, Road No. 36, Jubilee Hills',
    city: 'Hyderabad',
    serviceAreas: ['Hyderabad', 'Secunderabad', 'Jubilee Hills'],
    description: 'Comprehensive diagnostic lab offering blood tests, executive wellness packages, and pathology.',
    status: 'active',
    agreementStatus: 'active',
    amountPaidRupees: 5000,
    category: 'healthcare',
    commissionPercent: 40,
    activeAgreements: [
      {
        id: 'agr_test_apex_001',
        providerId: '44d57460-17b7-48f4-bedd-test00000001',
        title: 'Bilateral Diagnostic Affiliate Partnership Agreement',
        documentRef: 'SBL-MOU-2026-APEX',
        effectiveDate: '2026-01-01',
        expiryDate: '2027-12-31',
        status: 'active',
        grossReferralPct: 40.0,
        affiliateSplitPct: 50.0,
        companySplitPct: 50.0,
        notes: 'Commercial MoU governing diagnostic tests with standard 40% referral rate.'
      }
    ]
  },
  {
    id: 'prov_health_vizag_sevenhills',
    userId: 'usr_prov_vizag_sevenhills',
    businessName: 'SevenHills & Vizag Diagnostic Healthcare Center',
    tagline: 'Leading NABL Accredited Multi-Speciality Diagnostic Lab',
    contactPerson: 'Dr. K. Murthy (MD Pathology)',
    email: 'diagnostics@vizag-sevenhills.in',
    phone: '9848123456',
    address: 'Rockdale Layout, Waltair Uplands',
    city: 'Visakhapatnam',
    serviceAreas: ['Visakhapatnam', 'Vizag', 'Waltair Uplands', 'MVP Colony', 'Gajuwaka'],
    description: 'Premier diagnostic institution in Visakhapatnam providing advanced blood diagnostics, cardiology screenings, and executive full-body wellness packages.',
    status: 'active',
    agreementStatus: 'active',
    amountPaidRupees: 18000,
    category: 'healthcare',
    activeAgreements: [
      {
        id: 'agr_vizag_sevenhills_001',
        providerId: 'prov_health_vizag_sevenhills',
        title: 'Coastal Andhra Healthcare Affiliate MoU',
        documentRef: 'SBL-MOU-2026-VZ-01',
        effectiveDate: '2026-01-01',
        expiryDate: '2027-12-31',
        status: 'active',
        notes: 'Direct partner referral bonuses paid on verified diagnostic checkups.'
      }
    ]
  },
  {
    id: 'prov_health_vizag_care',
    userId: 'usr_prov_vizag_care',
    businessName: 'Care & Apollo Diagnostic Clinic Vizag',
    tagline: 'Advanced MRI, CT Scan & Comprehensive Health Lab',
    contactPerson: 'Suresh Varma',
    email: 'lab@vizagcareclinic.com',
    phone: '9848134567',
    address: 'VIP Road, Siripuram',
    city: 'Visakhapatnam',
    serviceAreas: ['Visakhapatnam', 'Vizag', 'Siripuram', 'Madhurawada', 'Pendurthi'],
    description: 'High-precision imaging and diagnostic lab trusted by top physicians across Visakhapatnam and North Andhra.',
    status: 'active',
    agreementStatus: 'active',
    amountPaidRupees: 22000,
    category: 'healthcare',
    activeAgreements: [
      {
        id: 'agr_vizag_care_001',
        providerId: 'prov_health_vizag_care',
        title: 'Diagnostic Imaging Commercial MoU',
        documentRef: 'SBL-MOU-2026-VZ-02',
        effectiveDate: '2026-01-01',
        expiryDate: '2027-12-31',
        status: 'active',
        notes: 'Guaranteed commission on executive master health checkups and scans.'
      }
    ]
  },
  {
    id: 'prov_health_vijayawada_manipal',
    userId: 'usr_prov_vja_manipal',
    businessName: 'Manipal & Amaravati Health Diagnostics',
    tagline: 'Premier Clinical Pathology & Preventative Wellness',
    contactPerson: 'Dr. C. Venkateswarlu',
    email: 'contact@vja-manipaldiag.in',
    phone: '9848145678',
    address: 'MG Road, Benz Circle',
    city: 'Vijayawada',
    serviceAreas: ['Vijayawada', 'Benz Circle', 'Guntur', 'Amaravati'],
    description: 'State-of-the-art pathology and diagnostic testing center serving Krishna and Guntur districts.',
    status: 'active',
    agreementStatus: 'active',
    amountPaidRupees: 16000,
    category: 'healthcare',
    activeAgreements: [
      {
        id: 'agr_vja_001',
        providerId: 'prov_health_vijayawada_manipal',
        title: 'Krishna District Commercial Partnership MoU',
        documentRef: 'SBL-MOU-2026-VJA-01',
        effectiveDate: '2026-01-01',
        expiryDate: '2027-12-31',
        status: 'active',
        notes: 'Guaranteed affiliate incentives on confirmed patient bookings.'
      }
    ]
  },
  {
    id: 'prov_edu_ottobon_academy',
    userId: 'usr_prov_ottobon_acad',
    businessName: 'Ottobon Tech & Skill Academy',
    tagline: 'AI, Full-Stack & Cloud Career Certifications',
    contactPerson: 'Prof. Vikram Rao',
    email: 'academy@ottobon.in',
    phone: '9848033221',
    address: 'Cyber Towers, Hitec City',
    city: 'Hyderabad',
    serviceAreas: ['Hyderabad', 'Secunderabad', 'Madhapur', 'Hitec City'],
    description: 'Premier technology academy offering career-accelerating certifications in AI, Full-Stack development, and Cloud engineering.',
    status: 'active',
    agreementStatus: 'active',
    amountPaidRupees: 15000,
    category: 'education',
    activeAgreements: [
      {
        id: 'agr_edu_001',
        providerId: 'prov_edu_ottobon_academy',
        title: 'Education & Student Referral Partnership MoU',
        documentRef: 'SBL-MOU-2026-ACAD',
        effectiveDate: '2026-01-01',
        expiryDate: '2027-12-31',
        status: 'active',
        notes: 'Guaranteed commission on verified student course enrollments.'
      }
    ]
  },
  {
    id: 'prov_edu_sri_chaitanya',
    userId: 'usr_prov_chaitanya',
    businessName: 'Sri Chaitanya & Narayana Integrated Academy',
    tagline: 'Premier IIT-JEE, NEET & Olympiad Entrance Coaching',
    contactPerson: 'K. Srinivasa Rao',
    email: 'admissions@srichaitanya-telangana.edu.in',
    phone: '9848055443',
    address: 'KPHB Colony, Road No. 1, Kukatpally',
    city: 'Hyderabad',
    serviceAreas: ['Hyderabad', 'Kukatpally', 'Ameerpet', 'Secunderabad'],
    description: 'Top entrance coaching academy in Telangana with proven track record in IIT-JEE and NEET national rankings.',
    status: 'active',
    agreementStatus: 'active',
    amountPaidRupees: 25000,
    category: 'education',
    activeAgreements: [
      {
        id: 'agr_edu_002',
        providerId: 'prov_edu_sri_chaitanya',
        title: 'Entrance Coaching Referral Partnership Agreement',
        documentRef: 'SBL-MOU-2026-JEE',
        effectiveDate: '2026-01-01',
        expiryDate: '2027-12-31',
        status: 'active',
        notes: 'High-value partner payout on confirmed classroom course admission.'
      }
    ]
  },
  {
    id: 'prov_edu_oakridge',
    userId: 'usr_prov_oakridge',
    businessName: 'Oakridge International Academy & High School',
    tagline: 'K-12 World-Class Day & Boarding Education (IB & Cambridge)',
    contactPerson: 'Meenakshi Iyer',
    email: 'admissions@oakridge-hyderabad.edu.in',
    phone: '9848077665',
    address: 'Nanakramguda, Financial District, Gachibowli',
    city: 'Hyderabad',
    serviceAreas: ['Hyderabad', 'Gachibowli', 'Jubilee Hills', 'Madhapur'],
    description: 'Accredited International School offering premier Cambridge IGCSE and IB Diploma curricula with Olympic sports facilities.',
    status: 'active',
    agreementStatus: 'active',
    amountPaidRupees: 35000,
    category: 'education',
    activeAgreements: [
      {
        id: 'agr_edu_003',
        providerId: 'prov_edu_oakridge',
        title: 'International School Student Admission Referral MoU',
        documentRef: 'SBL-MOU-2026-OAK',
        effectiveDate: '2026-01-01',
        expiryDate: '2027-12-31',
        status: 'active',
        notes: 'Premium partner referral bonus on student registration.'
      }
    ]
  },
  {
    id: 'prov_corp_ottobon_it',
    userId: 'usr_prov_corp_it',
    businessName: 'Ottobon Enterprise & IT Solutions',
    tagline: 'Custom Cloud, Web & ERP Software Development',
    contactPerson: 'Naveen Varma',
    email: 'solutions@ottobon.in',
    phone: '9848099887',
    address: 'Mindspace IT Park, Madhapur',
    city: 'Hyderabad',
    serviceAreas: ['Hyderabad', 'Hitec City', 'Gachibowli', 'Madhapur'],
    description: 'Digital transformation partner building scalable cloud infrastructure and enterprise software platforms.',
    status: 'active',
    agreementStatus: 'active',
    amountPaidRupees: 20000,
    category: 'corporate',
    activeAgreements: [
      {
        id: 'agr_corp_001',
        providerId: 'prov_corp_ottobon_it',
        title: 'B2B Enterprise Software Referral MoU',
        documentRef: 'SBL-MOU-2026-CORP',
        effectiveDate: '2026-01-01',
        expiryDate: '2027-12-31',
        status: 'active',
        notes: 'Commercial client contract commission split.'
      }
    ]
  }
];

export const MOCK_OFFERINGS: ProviderOffering[] = [
  {
    id: 'off_health_master_checkup',
    providerId: '44d57460-17b7-48f4-bedd-test00000001',
    serviceId: 'srv_health_01',
    categoryId: 'cat_health',
    title: 'Comprehensive Master Health Checkup (84 Tests)',
    description: 'Complete Hemogram, Lipid Profile, Liver Function, Kidney Function, Thyroid Profile, HbA1c & Physician Consultation.',
    features: ['84 Essential Diagnostic Tests', 'Free Home Sample Pickup', 'Digital Report within 24 Hours'],
    customerPriceRupees: 2500,
    currency: 'INR',
    serviceArea: 'Jubilee Hills, Hyderabad',
    status: 'active',
    version: 1,
    rewardRules: [
      {
        id: 'rr_health_01_lead',
        offeringId: 'off_health_master_checkup',
        eventType: 'qualified_lead',
        providerFeeRupees: 500,
        affiliateRewardRupees: 250,
        version: 1,
        isActive: true
      },
      {
        id: 'rr_health_01_conv',
        offeringId: 'off_health_master_checkup',
        eventType: 'successful_conversion',
        providerFeeRupees: 1000,
        affiliateRewardRupees: 500,
        version: 1,
        isActive: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'off_health_executive_mri',
    providerId: '44d57460-17b7-48f4-bedd-test00000001',
    serviceId: 'srv_health_02',
    categoryId: 'cat_health',
    title: 'Executive MRI & Advanced Pathology Screening',
    description: 'High-Field 1.5T MRI screening along with comprehensive 90+ blood tests, cardiac risk markers & doctor consultation.',
    features: ['High-Field 1.5T MRI', '90+ Essential Lab Tests', 'Specialist Review Included', 'Digital Report within 24 Hours'],
    customerPriceRupees: 4500,
    currency: 'INR',
    serviceArea: 'Jubilee Hills, Hyderabad',
    status: 'active',
    version: 1,
    rewardRules: [
      {
        id: 'rr_health_02_lead',
        offeringId: 'off_health_executive_mri',
        eventType: 'qualified_lead',
        providerFeeRupees: 1000,
        affiliateRewardRupees: 500,
        version: 1,
        isActive: true
      },
      {
        id: 'rr_health_02_conv',
        offeringId: 'off_health_executive_mri',
        eventType: 'successful_conversion',
        providerFeeRupees: 2000,
        affiliateRewardRupees: 1000,
        version: 1,
        isActive: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'off_vizag_fullbody',
    providerId: 'prov_health_vizag_sevenhills',
    serviceId: 'srv_vz_01',
    categoryId: 'cat_health',
    title: 'Complete Master Health Checkup (82 Tests) - Vizag Care',
    description: 'Comprehensive blood profile including Liver, Kidney, Lipid panel, HbA1c, Vitamin D/B12, ECG, and doctor review.',
    features: ['82 Laboratory Tests', 'Free Home Sample Pickup in Vizag', 'Same-Day Verified Reports'],
    customerPriceRupees: 1999,
    currency: 'INR',
    serviceArea: 'Waltair Uplands, Visakhapatnam',
    status: 'active',
    version: 1,
    rewardRules: [
      {
        id: 'rr_vz_01_lead',
        offeringId: 'off_vizag_fullbody',
        eventType: 'qualified_lead',
        providerFeeRupees: 600,
        affiliateRewardRupees: 350,
        version: 1,
        isActive: true
      },
      {
        id: 'rr_vz_01_conv',
        offeringId: 'off_vizag_fullbody',
        eventType: 'successful_conversion',
        providerFeeRupees: 1200,
        affiliateRewardRupees: 650,
        version: 1,
        isActive: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'off_vizag_cardiac',
    providerId: 'prov_health_vizag_sevenhills',
    serviceId: 'srv_vz_02',
    categoryId: 'cat_health',
    title: 'Advanced Cardiac & Diabetic Preventive Screening',
    description: '2D Echo, TMT, HbA1c, Cardiac Risk Markers, High-Sensitivity CRP, and Senior Cardiologist Teleconsultation.',
    features: ['Complete Heart & Sugar Evaluation', 'NABL Accredited Lab', 'Cardiologist Consultation Included'],
    customerPriceRupees: 3499,
    currency: 'INR',
    serviceArea: 'Visakhapatnam (Vizag)',
    status: 'active',
    version: 1,
    rewardRules: [
      {
        id: 'rr_vz_02_lead',
        offeringId: 'off_vizag_cardiac',
        eventType: 'qualified_lead',
        providerFeeRupees: 800,
        affiliateRewardRupees: 500,
        version: 1,
        isActive: true
      },
      {
        id: 'rr_vz_02_conv',
        offeringId: 'off_vizag_cardiac',
        eventType: 'successful_conversion',
        providerFeeRupees: 1800,
        affiliateRewardRupees: 1000,
        version: 1,
        isActive: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'off_vizag_executive',
    providerId: 'prov_health_vizag_care',
    serviceId: 'srv_vz_03',
    categoryId: 'cat_health',
    title: 'Executive MRI & Pathology Wellness Screening',
    description: 'Whole spine & brain MRI screening along with comprehensive 90+ blood biomarker analysis for executive health.',
    features: ['High-Field 1.5T MRI', 'Full Body Biochemical Profile', 'Consultant Radiologist Review'],
    customerPriceRupees: 4500,
    currency: 'INR',
    serviceArea: 'Siripuram, Visakhapatnam',
    status: 'active',
    version: 1,
    rewardRules: [
      {
        id: 'rr_vz_03_lead',
        offeringId: 'off_vizag_executive',
        eventType: 'qualified_lead',
        providerFeeRupees: 1000,
        affiliateRewardRupees: 600,
        version: 1,
        isActive: true
      },
      {
        id: 'rr_vz_03_conv',
        offeringId: 'off_vizag_executive',
        eventType: 'successful_conversion',
        providerFeeRupees: 2500,
        affiliateRewardRupees: 1400,
        version: 1,
        isActive: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'off_vja_wellness',
    providerId: 'prov_health_vijayawada_manipal',
    serviceId: 'srv_vja_01',
    categoryId: 'cat_health',
    title: 'Full Body Preventive Wellness & Blood Scan',
    description: 'Complete health checkup package covering blood sugar, lipid, liver, renal, thyroid, urine routine, and general physician consult.',
    features: ['75 Vital Blood Parameters', 'Home Sample Collection across Vijayawada', 'Online Reports via WhatsApp'],
    customerPriceRupees: 1799,
    currency: 'INR',
    serviceArea: 'Benz Circle, Vijayawada',
    status: 'active',
    version: 1,
    rewardRules: [
      {
        id: 'rr_vja_01_lead',
        offeringId: 'off_vja_wellness',
        eventType: 'qualified_lead',
        providerFeeRupees: 500,
        affiliateRewardRupees: 300,
        version: 1,
        isActive: true
      },
      {
        id: 'rr_vja_01_conv',
        offeringId: 'off_vja_wellness',
        eventType: 'successful_conversion',
        providerFeeRupees: 1100,
        affiliateRewardRupees: 600,
        version: 1,
        isActive: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'off_edu_fullstack_ai',
    providerId: 'prov_edu_ottobon_academy',
    serviceId: 'srv_edu_01',
    categoryId: 'cat_education',
    title: 'Full-Stack AI & Cloud Engineering Certification (6 Months)',
    description: 'Intensive career-transition program covering React, Node.js, Python, Generative AI integration, and AWS cloud deployment with 100% placement support.',
    features: ['Industry Mentor Led', 'Live Capstone Projects', 'Verified Certificate & Placement Cell'],
    customerPriceRupees: 45000,
    currency: 'INR',
    serviceArea: 'Hitec City, Hyderabad',
    status: 'active',
    version: 1,
    rewardRules: [
      {
        id: 'rr_edu_01_lead',
        offeringId: 'off_edu_fullstack_ai',
        eventType: 'qualified_lead',
        providerFeeRupees: 1000,
        affiliateRewardRupees: 500,
        version: 1,
        isActive: true
      },
      {
        id: 'rr_edu_01_conv',
        offeringId: 'off_edu_fullstack_ai',
        eventType: 'successful_conversion',
        providerFeeRupees: 10000,
        affiliateRewardRupees: 5000,
        version: 1,
        isActive: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'off_edu_datascience',
    providerId: 'prov_edu_ottobon_academy',
    serviceId: 'srv_edu_02',
    categoryId: 'cat_education',
    title: 'Executive Data Science & Machine Learning Bootcamp',
    description: 'Weekend practical boot camp on Python, SQL, Predictive Analytics, and real-time LLM agents for engineering & finance professionals.',
    features: ['Weekend Flexible Batches', 'Hands-on Jupyter Labs', '1-on-1 Career Mentoring'],
    customerPriceRupees: 30000,
    currency: 'INR',
    serviceArea: 'Madhapur, Hyderabad',
    status: 'active',
    version: 1,
    rewardRules: [
      {
        id: 'rr_edu_02_lead',
        offeringId: 'off_edu_datascience',
        eventType: 'qualified_lead',
        providerFeeRupees: 800,
        affiliateRewardRupees: 400,
        version: 1,
        isActive: true
      },
      {
        id: 'rr_edu_02_conv',
        offeringId: 'off_edu_datascience',
        eventType: 'successful_conversion',
        providerFeeRupees: 6000,
        affiliateRewardRupees: 3000,
        version: 1,
        isActive: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'off_edu_jee_advanced',
    providerId: 'prov_edu_sri_chaitanya',
    serviceId: 'srv_edu_03',
    categoryId: 'cat_education',
    title: 'IIT-JEE Advanced 2-Year Integrated Classroom Program',
    description: 'Comprehensive daily problem solving (DPP), all-India weekly mock rankings, and top IITian faculty coaching for Class 11 and 12 aspirants.',
    features: ['Top All-India Faculty', 'Hostel & Day Scholar Facility', 'Weekly All-India Test Series'],
    customerPriceRupees: 120000,
    currency: 'INR',
    serviceArea: 'Kukatpally, Hyderabad',
    status: 'active',
    version: 1,
    rewardRules: [
      {
        id: 'rr_edu_03_lead',
        offeringId: 'off_edu_jee_advanced',
        eventType: 'qualified_lead',
        providerFeeRupees: 2000,
        affiliateRewardRupees: 1000,
        version: 1,
        isActive: true
      },
      {
        id: 'rr_edu_03_conv',
        offeringId: 'off_edu_jee_advanced',
        eventType: 'successful_conversion',
        providerFeeRupees: 20000,
        affiliateRewardRupees: 10000,
        version: 1,
        isActive: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'off_edu_oakridge_school',
    providerId: 'prov_edu_oakridge',
    serviceId: 'srv_edu_04',
    categoryId: 'cat_education',
    title: 'Cambridge IGCSE & IB World School Academic Admission',
    description: 'Day boarding admissions for Grade 1 through Grade 12 with Olympic-standard sports, robotics, and arts.',
    features: ['Global IB & Cambridge Curriculum', 'International Faculty', '25+ Sports & Arts Studios'],
    customerPriceRupees: 180000,
    currency: 'INR',
    serviceArea: 'Gachibowli, Hyderabad',
    status: 'active',
    version: 1,
    rewardRules: [
      {
        id: 'rr_edu_04_lead',
        offeringId: 'off_edu_oakridge_school',
        eventType: 'qualified_lead',
        providerFeeRupees: 3000,
        affiliateRewardRupees: 1500,
        version: 1,
        isActive: true
      },
      {
        id: 'rr_edu_04_conv',
        offeringId: 'off_edu_oakridge_school',
        eventType: 'successful_conversion',
        providerFeeRupees: 24000,
        affiliateRewardRupees: 12000,
        version: 1,
        isActive: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'off_corp_cloud_erp',
    providerId: 'prov_corp_ottobon_it',
    serviceId: 'srv_corp_01',
    categoryId: 'cat_corporate',
    title: 'Enterprise Cloud ERP & Workflow Automation Deployment',
    description: 'Custom enterprise software setup, CRM integration, and automated accounts reconciliation platform for growing businesses.',
    features: ['Custom Workflow Architecture', '24/7 Enterprise SLA', 'SOC2 Compliant Cloud'],
    customerPriceRupees: 80000,
    currency: 'INR',
    serviceArea: 'Hitec City, Hyderabad',
    status: 'active',
    version: 1,
    rewardRules: [
      {
        id: 'rr_corp_01_lead',
        offeringId: 'off_corp_cloud_erp',
        eventType: 'qualified_lead',
        providerFeeRupees: 2000,
        affiliateRewardRupees: 1000,
        version: 1,
        isActive: true
      },
      {
        id: 'rr_corp_01_conv',
        offeringId: 'off_corp_cloud_erp',
        eventType: 'successful_conversion',
        providerFeeRupees: 16000,
        affiliateRewardRupees: 8000,
        version: 1,
        isActive: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
export const MOCK_REFERRALS: Referral[] = [
  {
    id: 'ref_test_001',
    referralCode: 'REF-2026-APEX-001',
    affiliateId: 'usr_aff_01',
    providerId: '44d57460-17b7-48f4-bedd-test00000001',
    offeringId: 'off_health_master_checkup',
    earningModel: 'lead_conversion',
    rewardRuleVersion: 1,
    customerName: 'Rahul Verma',
    customerPhone: '+91 98490 12345',
    clientPhoneMasked: '+91 98490 XXXXX',
    customerEmail: 'rahul.verma@example.com',
    customerCity: 'Hyderabad',
    customerNotes: 'Interested in annual master health checkup with home sample collection.',
    authorizationConfirmed: true,
    consentStatus: 'consent_given',
    leadStatus: 'submitted',
    conversionStatus: 'follow_up_in_progress',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'ref_test_002',
    referralCode: 'REF-2026-APEX-002',
    affiliateId: 'usr_aff_01',
    providerId: '44d57460-17b7-48f4-bedd-test00000001',
    offeringId: 'off_health_executive_mri',
    earningModel: 'lead_conversion',
    rewardRuleVersion: 1,
    customerName: 'Sneha Reddy',
    customerPhone: '+91 99890 54321',
    clientPhoneMasked: '+91 99890 XXXXX',
    customerEmail: 'sneha.reddy@example.com',
    customerCity: 'Hyderabad',
    customerNotes: 'Doctor recommended MRI spine scan and full biochemical profile.',
    authorizationConfirmed: true,
    consentStatus: 'consent_given',
    leadStatus: 'qualified',
    conversionStatus: 'follow_up_in_progress',
    qualificationNotes: 'Prescription verified. Client scheduled visit for tomorrow 10 AM.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];
export const MOCK_COMMISSION_LEDGER: CommissionLedgerEntry[] = [];
export const MOCK_PAYOUTS: PayoutRecord[] = [];
export const MOCK_AUDIT_LOGS: AuditEvent[] = [];
export const MOCK_CONTACTS: Contact[] = [];
