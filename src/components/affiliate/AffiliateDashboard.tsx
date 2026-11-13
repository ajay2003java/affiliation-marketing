import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { ProviderOffering, Provider, getProviderSector } from '../../types';
import {
  TrendingUp,
  Wallet,
  Users,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Send,
  ArrowLeft,
  ArrowRight,
  Flame,
  Zap,
  Clock,
  MessageCircle,
  ExternalLink,
  HeartPulse,
  GraduationCap,
  Building2,
  MapPin,
  Search,
  Filter,
  Eye,
  Sparkles,
  RotateCcw,
  CheckCircle
} from 'lucide-react';
import { ReferralModal } from './ReferralModal';
import { OfferingDetailModal } from './OfferingDetailModal';
import { CustomerShareLandingModal } from './CustomerShareLandingModal';
import { ReferralsList } from './ReferralsList';
import { CommissionView } from './CommissionView';

interface AffiliateDashboardProps {
  initialSection?: 'submit_referral' | 'referrals_management' | 'payments';
}

export const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ initialSection }) => {
  const { offerings, providers, referrals, commissionLedger, affiliateProfile } = useData();
  const { currentUser, activeTab, setActiveTab, showNotification } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);
  const [modalOffering, setModalOffering] = useState<ProviderOffering | null>(null);
  const [referralOffering, setReferralOffering] = useState<ProviderOffering | null>(null);
  const [showShareLandingModal, setShowShareLandingModal] = useState(false);

  // Top Section View State matching the user layout diagram:
  // 1. Submit Referral (Healthcare, Education, Corporate)
  // 2. Referrals Management (all leads submitted here managed)
  // 3. Payments (all payments clearly seen)
  const [dashboardTab, setDashboardTab] = useState<'submit_referral' | 'referrals_management' | 'payments'>(() => {
    if (initialSection) return initialSection;
    if (activeTab === 'my_referrals') return 'referrals_management';
    if (activeTab === 'my_commissions') return 'payments';
    return 'submit_referral';
  });

  // Keep dashboardTab in sync with activeTab when navigated from other parts of the app
  useEffect(() => {
    if (activeTab === 'my_referrals') {
      setDashboardTab('referrals_management');
    } else if (activeTab === 'my_commissions') {
      setDashboardTab('payments');
    } else if (activeTab === 'affiliate_dashboard' || activeTab === 'affiliate_home') {
      setDashboardTab('submit_referral');
    }
  }, [activeTab]);

  const handleTabChange = (tab: 'submit_referral' | 'referrals_management' | 'payments') => {
    setDashboardTab(tab);
    if (tab === 'submit_referral') {
      setActiveTab('affiliate_dashboard');
    } else if (tab === 'referrals_management') {
      setActiveTab('my_referrals');
    } else if (tab === 'payments') {
      setActiveTab('my_commissions');
    }
  };

  // User operating city from onboarding
  const userCity =
    currentUser?.city ||
    affiliateProfile?.city ||
    affiliateProfile?.preferredArea ||
    localStorage.getItem('affiliate_selected_city') ||
    'Hyderabad';

  // Determine initial location based on onboarding city
  const getInitialLocation = () => {
    const c = userCity.toLowerCase();
    if (c.includes('vizag') || c.includes('visakhapatnam')) return 'visakhapatnam (vizag)';
    if (c.includes('vijayawada')) return 'vijayawada';
    if (c.includes('secunderabad')) return 'secunderabad';
    if (c.includes('hitec') || c.includes('madhapur')) return 'hitec city / madhapur';
    if (c.includes('gachibowli')) return 'gachibowli';
    if (c.includes('kukatpally')) return 'kukatpally';
    if (c.includes('jubilee')) return 'jubilee hills';
    if (c.includes('hyderabad')) return 'hyderabad';
    return 'all';
  };

  // Step-based screen navigation for Submit Referral:
  // Step 1: 'categories' -> Only 2 options (Healthcare, Educational Institutions)
  // Step 2: 'providers' -> Only providers for that category
  // Step 3: 'services' -> Only services for that provider
  const [referralFlowStep, setReferralFlowStep] = useState<'categories' | 'providers' | 'services'>('categories');
  const [selectedSector, setSelectedSector] = useState<'healthcare' | 'education' | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>(getInitialLocation);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);

  // Auto-launch ReferralModal if user came from landing page with a pending referral intent
  useEffect(() => {
    try {
      const pendingIntent = sessionStorage.getItem('pending_referral_intent');
      if (pendingIntent && offerings.length > 0) {
        sessionStorage.removeItem('pending_referral_intent');
        const serviceName = sessionStorage.getItem('pending_referral_service');
        sessionStorage.removeItem('pending_referral_service');

        let matched = offerings[0];
        if (serviceName) {
          const found = offerings.find(
            (o) =>
              o.title.toLowerCase().includes(serviceName.toLowerCase()) ||
              serviceName.toLowerCase().includes(o.title.toLowerCase())
          );
          if (found) matched = found;
        }
        setReferralOffering(matched);
      }
    } catch {
      // ignore
    }
  }, [offerings]);

  // Location matching helper
  const matchesLocationFilter = (provider: Provider, offering?: ProviderOffering, loc: string = 'all'): boolean => {
    if (loc === 'all') return true;
    const q = loc.toLowerCase().trim();

    const areaKeywords: Record<string, string[]> = {
      hyderabad: ['hyderabad', 'telangana'],
      'visakhapatnam (vizag)': ['visakhapatnam', 'vizag', 'waltair', 'siripuram', 'mvp colony', 'gajuwaka'],
      visakhapatnam: ['visakhapatnam', 'vizag', 'waltair', 'siripuram', 'mvp colony', 'gajuwaka'],
      vizag: ['visakhapatnam', 'vizag', 'waltair', 'siripuram', 'mvp colony', 'gajuwaka'],
      vijayawada: ['vijayawada', 'benz circle', 'amaravati'],
      secunderabad: ['secunderabad', 'marredpally', 'tarnaka'],
      'hitec city / madhapur': ['hitec', 'madhapur', 'cyber', 'kondapur'],
      gachibowli: ['gachibowli', 'financial district', 'nanakramguda', 'rayadurg'],
      kukatpally: ['kukatpally', 'kphb', 'ameerpet', 'miyapur', 'nizampet'],
      'jubilee hills': ['jubilee', 'banjara', 'film nagar']
    };

    const matchedKeywords = areaKeywords[q] || [q];
    const haystacks = [
      provider.city,
      provider.address,
      ...(provider.serviceAreas || []),
      offering?.serviceArea || ''
    ].map((s) => (s || '').toLowerCase());

    return matchedKeywords.some((kw) => haystacks.some((h) => h.includes(kw)));
  };

  // Provider sector counts
  const healthcareProvidersCount = providers.filter((p) => getProviderSector(p) === 'healthcare').length;
  const educationProvidersCount = providers.filter((p) => getProviderSector(p) === 'education').length;
  const corporateProvidersCount = providers.filter((p) => getProviderSector(p) === 'corporate').length;

  // Filtered Providers based on chosen Sector, Location, and Search Query
  const filteredProviders = useMemo(() => {
    if (!selectedSector) return [];
    return providers.filter((prov) => {
      // Sector filter
      const sector = getProviderSector(prov);
      if (sector !== selectedSector) return false;

      // Location filter
      if (!matchesLocationFilter(prov, undefined, selectedLocation)) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const provOfferings = offerings.filter((o) => o.providerId === prov.id);
        const matchName = prov.businessName.toLowerCase().includes(q);
        const matchTag = (prov.tagline || '').toLowerCase().includes(q);
        const matchDesc = (prov.description || '').toLowerCase().includes(q);
        const matchCity = prov.city.toLowerCase().includes(q);
        const matchOff = provOfferings.some(
          (o) => o.title.toLowerCase().includes(q) || (o.description || '').toLowerCase().includes(q)
        );
        return matchName || matchTag || matchDesc || matchCity || matchOff;
      }

      return true;
    });
  }, [providers, offerings, selectedSector, selectedLocation, searchQuery]);

  // Active selected provider: binds to selectedProviderId
  const activeProvider = useMemo(() => {
    if (!selectedProviderId) return null;
    return providers.find((p) => p.id === selectedProviderId) || null;
  }, [providers, selectedProviderId]);

  const activeProviderOfferings = useMemo(() => {
    if (!activeProvider) return [];
    return offerings.filter((o) => o.providerId === activeProvider.id && o.status === 'active');
  }, [offerings, activeProvider]);

  // Standard locations
  const locationOptions = [
    { id: 'all', label: '📍 All Locations' },
    { id: 'visakhapatnam (vizag)', label: 'Visakhapatnam (Vizag)' },
    { id: 'hyderabad', label: 'Hyderabad' },
    { id: 'vijayawada', label: 'Vijayawada' },
    { id: 'secunderabad', label: 'Secunderabad' },
    { id: 'hitec city / madhapur', label: 'Hitec City / Madhapur' },
    { id: 'gachibowli', label: 'Gachibowli' },
    { id: 'kukatpally', label: 'Kukatpally' },
    { id: 'jubilee hills', label: 'Jubilee Hills' }
  ];

  // Stats calculations
  const totalEarned = commissionLedger
    .filter((c) => c.status === 'paid' || c.status === 'approved')
    .reduce((sum, c) => sum + c.affiliateRewardSnapshot, 0);

  const pendingPayout = commissionLedger
    .filter((c) => c.status === 'approved')
    .reduce((sum, c) => sum + c.affiliateRewardSnapshot, 0);

  const activeReferralsCount = referrals.filter(
    (r) => r.leadStatus !== 'qualification_rejected' && r.conversionStatus !== 'not_converted'
  ).length;

  const qualifiedLeadsCount = referrals.filter((r) => r.leadStatus === 'qualified').length;
  const convertedSalesCount = referrals.filter((r) => r.conversionStatus === 'converted').length;
  const totalCompletedOutcomes = qualifiedLeadsCount + convertedSalesCount;
  const successRate = referrals.length > 0 ? Math.round((totalCompletedOutcomes / referrals.length) * 100) : 0;

  // Active Offerings sorted by highest affiliate rewards
  const activeOfferings = offerings.filter((o) => o.status === 'active');
  const hotOfferings = [...activeOfferings].sort((a, b) => {
    const maxRewardA = Math.max(...a.rewardRules.map((r) => r.affiliateRewardRupees), 0);
    const maxRewardB = Math.max(...b.rewardRules.map((r) => r.affiliateRewardRupees), 0);
    return maxRewardB - maxRewardA;
  }).slice(0, 3);

  // Recent 3 Referrals
  const recentReferrals = [...referrals].slice(0, 3);

  const masterReferralLink = `https://refer.opnetwork.in/u/${affiliateProfile.userId}?ref=AFF-7821`;

  const handleCopyMasterLink = () => {
    navigator.clipboard.writeText(masterReferralLink);
    setCopiedLink(true);
    showNotification('Universal referral link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppShare = (title?: string, link?: string) => {
    const shareText = title
      ? `Hey! Check out this verified service: "${title}". You can book with special partner priority here: ${link || masterReferralLink}`
      : `Hey! I am an accredited partner with our commercial referral network. If you need verified healthcare, diagnostics, or corporate services, visit my partner link: ${masterReferralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div>
      {/* =========================================================================
          TOP 3 PRIMARY DASHBOARD SECTIONS (AS SPECIFIED IN USER LAYOUT DIAGRAM)
          1. Submit Referral (Healthcare, Education, Corporate)
          2. Referrals Management (All leads submitted here managed)
          3. Payments (All payments here clearly seen)
          ========================================================================= */}
      <div
        className="affiliate-hub-navigation"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
          marginBottom: '26px'
        }}
      >
        {/* Option 1: Submit Referral */}
        <div
          id="hub-tab-submit-referral"
          onClick={() => {
            handleTabChange('submit_referral');
            setReferralFlowStep('categories');
            setSelectedSector(null);
            setSelectedProviderId(null);
          }}
          style={{
            backgroundColor: dashboardTab === 'submit_referral' ? '#F0FDF4' : '#FFFFFF',
            border: `2px solid ${dashboardTab === 'submit_referral' ? '#047857' : '#E2E8F0'}`,
            borderRadius: '14px',
            padding: '18px 20px',
            cursor: 'pointer',
            boxShadow: dashboardTab === 'submit_referral' ? '0 6px 20px rgba(4, 120, 87, 0.15)' : '0 2px 6px rgba(0,0,0,0.04)',
            transition: 'all 0.18s ease',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: dashboardTab === 'submit_referral' ? '#047857' : '#EFF6FF',
                  color: dashboardTab === 'submit_referral' ? '#FFFFFF' : '#047857',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}
              >
                <Send size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  Submit Referral
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700 }}>
                  Dual Cash Rewards • Lead + Sale
                </span>
              </div>
            </div>
            {dashboardTab === 'submit_referral' && (
              <span
                style={{
                  backgroundColor: '#047857',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '10px'
                }}
              >
                ✓ Active
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
            <span
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSector('healthcare');
                setSelectedProviderId(null);
                setReferralFlowStep('providers');
                handleTabChange('submit_referral');
              }}
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                color: selectedSector === 'healthcare' && dashboardTab === 'submit_referral' ? '#FFFFFF' : '#047857',
                backgroundColor: selectedSector === 'healthcare' && dashboardTab === 'submit_referral' ? '#047857' : '#DCFCE7',
                padding: '3px 8px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              → 1) Healthcare
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSector('education');
                setSelectedProviderId(null);
                setReferralFlowStep('providers');
                handleTabChange('submit_referral');
              }}
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                color: selectedSector === 'education' && dashboardTab === 'submit_referral' ? '#FFFFFF' : '#0052CC',
                backgroundColor: selectedSector === 'education' && dashboardTab === 'submit_referral' ? '#0052CC' : '#EFF6FF',
                padding: '3px 8px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              → 2) Education
            </span>
          </div>
        </div>

        {/* Option 2: Referrals Management */}
        <div
          id="hub-tab-referrals-management"
          onClick={() => handleTabChange('referrals_management')}
          style={{
            backgroundColor: dashboardTab === 'referrals_management' ? '#EFF6FF' : '#FFFFFF',
            border: `2px solid ${dashboardTab === 'referrals_management' ? '#0052CC' : '#E2E8F0'}`,
            borderRadius: '14px',
            padding: '18px 20px',
            cursor: 'pointer',
            boxShadow: dashboardTab === 'referrals_management' ? '0 6px 20px rgba(0, 82, 204, 0.15)' : '0 2px 6px rgba(0,0,0,0.04)',
            transition: 'all 0.18s ease',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: dashboardTab === 'referrals_management' ? '#0052CC' : '#EFF6FF',
                  color: dashboardTab === 'referrals_management' ? '#FFFFFF' : '#0052CC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}
              >
                <Users size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  Referrals Management
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#0052CC', fontWeight: 700 }}>
                  {referrals.length} Total Leads Tracked
                </span>
              </div>
            </div>
            {dashboardTab === 'referrals_management' ? (
              <span
                style={{
                  backgroundColor: '#0052CC',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '10px'
                }}
              >
                ✓ Active
              </span>
            ) : (
              <span
                style={{
                  backgroundColor: '#DBEAFE',
                  color: '#1E40AF',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}
              >
                {activeReferralsCount} Active
              </span>
            )}
          </div>

          <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
            All the leads submitted here are managed, tracked & reviewed with live milestone timeline.
          </p>
        </div>

        {/* Option 3: Payments */}
        <div
          id="hub-tab-payments"
          onClick={() => handleTabChange('payments')}
          style={{
            backgroundColor: dashboardTab === 'payments' ? '#ECFDF5' : '#FFFFFF',
            border: `2px solid ${dashboardTab === 'payments' ? '#059669' : '#E2E8F0'}`,
            borderRadius: '14px',
            padding: '18px 20px',
            cursor: 'pointer',
            boxShadow: dashboardTab === 'payments' ? '0 6px 20px rgba(5, 150, 105, 0.15)' : '0 2px 6px rgba(0,0,0,0.04)',
            transition: 'all 0.18s ease',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: dashboardTab === 'payments' ? '#059669' : '#ECFDF5',
                  color: dashboardTab === 'payments' ? '#FFFFFF' : '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}
              >
                <Wallet size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  Payments
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                  ₹{totalEarned.toLocaleString('en-IN')} Total Cash Earned
                </span>
              </div>
            </div>
            {dashboardTab === 'payments' ? (
              <span
                style={{
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '10px'
                }}
              >
                ✓ Active
              </span>
            ) : (
              <span
                style={{
                  backgroundColor: '#D1FAE5',
                  color: '#065F46',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}
              >
                UPI Direct
              </span>
            )}
          </div>

          <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
            All the payments here clearly seen: wallet balance, instant UPI payouts & commission ledger.
          </p>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: SUBMIT REFERRAL (SEPARATE SCREENS / PAGE-BY-PAGE PIPELINE)
          Screen 1: Only 2 options (1) Healthcare, 2) Educational Institutes)
          Screen 2: Dedicated Providers Directory in Area (with Back Button)
          Screen 3: Dedicated Provider Services Page with Original Price vs. Reward (with Back Button)
          Screen 4 (Modal): ReferralModal opens when user selects service to submit lead
          ========================================================================= */}
      {dashboardTab === 'submit_referral' && (
        <div style={{ marginBottom: '32px' }}>
          {/* ===================================================================
              SCREEN 1: CHOOSE CATEGORY (ONLY 2 OPTIONS: HEALTHCARE & EDUCATION)
              =================================================================== */}
          {referralFlowStep === 'categories' && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#EFF6FF',
                  color: 'var(--brand-cobalt)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  marginBottom: '10px'
                }}>
                  <span>Step 1 of 3</span>
                  <span>•</span>
                  <span>Select Category</span>
                </div>
                <h2 style={{ margin: '0 0 6px', fontSize: '1.45rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  1. Choose a Category to Submit Referral
                </h2>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Select one of the 2 verified partner sectors below to view all onboarded providers and service packages in your area:
                </p>
              </div>

              {/* Only 2 Options Cards: 1) Healthcare & Diagnostics, 2) Educational Institutes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '880px' }}>
                {/* Option 1: Healthcare & Diagnostics */}
                <div
                  id="cat-option-healthcare"
                  onClick={() => {
                    setSelectedSector('healthcare');
                    setSelectedProviderId(null);
                    setReferralFlowStep('providers');
                  }}
                  style={{
                    padding: '28px 24px',
                    borderRadius: '16px',
                    border: '2px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#047857';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(4, 120, 87, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '14px',
                        backgroundColor: '#DCFCE7',
                        color: '#047857',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <HeartPulse size={30} />
                      </div>
                      <span style={{
                        backgroundColor: '#DCFCE7',
                        color: '#047857',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '20px'
                      }}>
                        {healthcareProvidersCount} Verified Clinics & Labs
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                      1) Healthcare & Diagnostics
                    </h3>
                    <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Pathology blood tests, MRI / CT scans, full-body health checkup packages & specialized clinics.
                    </p>
                  </div>

                  <div style={{
                    paddingTop: '14px',
                    borderTop: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    color: '#047857'
                  }}>
                    <span>View Healthcare Providers</span>
                    <ArrowRight size={18} />
                  </div>
                </div>

                {/* Option 2: Educational Institutes */}
                <div
                  id="cat-option-education"
                  onClick={() => {
                    setSelectedSector('education');
                    setSelectedProviderId(null);
                    setReferralFlowStep('providers');
                  }}
                  style={{
                    padding: '28px 24px',
                    borderRadius: '16px',
                    border: '2px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0052CC';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 82, 204, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '14px',
                        backgroundColor: '#DBEAFE',
                        color: '#0052CC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <GraduationCap size={30} />
                      </div>
                      <span style={{
                        backgroundColor: '#DBEAFE',
                        color: '#0052CC',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '20px'
                      }}>
                        {educationProvidersCount} Verified Academies
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                      2) Educational Institutes
                    </h3>
                    <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Premier K-12 schools, IIT-JEE / NEET coaching academies, IT bootcamps & higher professional degrees.
                    </p>
                  </div>

                  <div style={{
                    paddingTop: '14px',
                    borderTop: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    color: '#0052CC'
                  }}>
                    <span>View Educational Institutes</span>
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              SCREEN 2: DEDICATED PROVIDERS DIRECTORY (NEW PAGE)
              =================================================================== */}
          {referralFlowStep === 'providers' && selectedSector && (
            <div>
              {/* Top Navigation Bar: Back Button & Step Breadcrumbs */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  onClick={() => {
                    setReferralFlowStep('categories');
                    setSelectedSector(null);
                    setSelectedProviderId(null);
                  }}
                  className="btn btn-outline"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.84rem',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 700
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>← Back to Categories</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748B' }}>
                  <span
                    onClick={() => {
                      setReferralFlowStep('categories');
                      setSelectedSector(null);
                      setSelectedProviderId(null);
                    }}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Submit Referral
                  </span>
                  <span>›</span>
                  <strong style={{ color: 'var(--brand-navy)' }}>
                    {selectedSector === 'healthcare' ? '1) Healthcare & Diagnostics' : '2) Educational Institutes'}
                  </strong>
                  <span>›</span>
                  <span style={{ backgroundColor: '#EFF6FF', color: 'var(--brand-cobalt)', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
                    Step 2 of 3: Select Provider
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div style={{ marginBottom: '18px' }}>
                <h2 style={{ margin: '0 0 6px', fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  {selectedSector === 'healthcare' ? '🏥 Verified Healthcare & Diagnostic Providers' : '🎓 Verified Educational Institutes & Academies'}
                </h2>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  Select a verified partner provider in your area to view all their service packages and commercial referral rewards:
                </p>
              </div>

              {/* Operating Area / City Filter & Search Bar */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '16px 20px',
                marginBottom: '22px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={16} color="var(--brand-cobalt)" />
                      <span>Filter by Operating City / Region:</span>
                    </div>
                    <span style={{ fontSize: '0.76rem', color: '#64748B', display: 'block', marginTop: '2px' }}>
                      📍 Your Registered Base: <strong>{userCity}</strong> (auto-filtering local verified providers)
                    </span>
                  </div>

                  {/* Search Bar */}
                  <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search provider, city, test, package..."
                      style={{
                        width: '100%',
                        padding: '7px 12px 7px 32px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.82rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* City Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {locationOptions.map((loc) => {
                    const isSelected = selectedLocation.toLowerCase() === loc.id.toLowerCase();
                    return (
                      <button
                        key={loc.id}
                        onClick={() => {
                          setSelectedLocation(loc.id);
                          setSelectedProviderId(null);
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 700 : 500,
                          border: `1.5px solid ${isSelected ? 'var(--brand-cobalt)' : '#CBD5E1'}`,
                          backgroundColor: isSelected ? 'var(--brand-cobalt)' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {loc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Providers Grid */}
              {filteredProviders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px dashed #CBD5E1' }}>
                  <Building2 size={36} color="#94A3B8" style={{ marginBottom: '10px' }} />
                  <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: 'var(--brand-navy)', fontWeight: 800 }}>
                    No partner providers found in this area
                  </h4>
                  <p style={{ margin: '0 0 16px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    Try selecting "All Locations" or clearing your search query.
                  </p>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setSelectedLocation('all');
                      setSearchQuery('');
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>Show All Locations</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {filteredProviders.map((provider) => {
                    const provOfferings = offerings.filter((o) => o.providerId === provider.id && o.status === 'active');
                    const sector = getProviderSector(provider);

                    return (
                      <div
                        key={provider.id}
                        onClick={() => {
                          setSelectedProviderId(provider.id);
                          setReferralFlowStep('services');
                        }}
                        style={{
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '14px',
                          backgroundColor: '#FFFFFF',
                          padding: '20px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = sector === 'healthcare' ? '#047857' : '#0052CC';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#E2E8F0';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                backgroundColor: sector === 'healthcare' ? '#DCFCE7' : '#DBEAFE',
                                color: sector === 'healthcare' ? '#047857' : '#0052CC',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                flexShrink: 0
                              }}>
                                {sector === 'healthcare' ? <HeartPulse size={24} /> : <GraduationCap size={24} />}
                              </div>
                              <div>
                                <h4 style={{ margin: '0 0 2px', fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                                  {provider.businessName}
                                </h4>
                                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                  📍 {provider.address ? `${provider.address}, ` : ''}{provider.city}
                                </span>
                              </div>
                            </div>

                            <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '3px 8px', whiteSpace: 'nowrap' }}>
                              ✓ MoU Verified
                            </span>
                          </div>

                          <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                            {provider.tagline || provider.description}
                          </p>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '12px',
                          borderTop: '1px solid #F1F5F9',
                          fontSize: '0.82rem'
                        }}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                            <strong>{provOfferings.length}</strong> service packages
                          </span>
                          <span style={{
                            color: sector === 'healthcare' ? '#047857' : '#0052CC',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <span>View Services</span>
                            <ArrowRight size={15} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================
              SCREEN 3: DEDICATED SERVICES PAGE (ORIGINAL PRICE & HOW MUCH YOU GET)
              =================================================================== */}
          {referralFlowStep === 'services' && activeProvider && (
            <div>
              {/* Top Navigation Bar: Back Button & Step Breadcrumbs */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  onClick={() => {
                    setReferralFlowStep('providers');
                    setSelectedProviderId(null);
                  }}
                  className="btn btn-outline"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.84rem',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 700
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>← Back to Providers</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748B' }}>
                  <span
                    onClick={() => {
                      setReferralFlowStep('categories');
                      setSelectedSector(null);
                      setSelectedProviderId(null);
                    }}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Categories
                  </span>
                  <span>›</span>
                  <span
                    onClick={() => {
                      setReferralFlowStep('providers');
                      setSelectedProviderId(null);
                    }}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {selectedSector === 'healthcare' ? 'Healthcare' : 'Education'}
                  </span>
                  <span>›</span>
                  <strong style={{ color: 'var(--brand-navy)' }}>{activeProvider.businessName}</strong>
                  <span>›</span>
                  <span style={{ backgroundColor: '#DCFCE7', color: '#047857', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
                    Step 3 of 3: Choose Service & Submit Lead
                  </span>
                </div>
              </div>

              {/* Provider Information Header Card */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                borderRadius: '16px',
                padding: '20px 24px',
                marginBottom: '24px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      backgroundColor: getProviderSector(activeProvider) === 'healthcare' ? '#DCFCE7' : '#DBEAFE',
                      color: getProviderSector(activeProvider) === 'healthcare' ? '#047857' : '#0052CC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {getProviderSector(activeProvider) === 'healthcare' ? <HeartPulse size={28} /> : <GraduationCap size={28} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                          {activeProvider.businessName}
                        </h2>
                        <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                          ✓ Official MoU Partner
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                        📍 {activeProvider.address ? `${activeProvider.address}, ` : ''}{activeProvider.city}
                        {activeProvider.phone ? ` • 📞 ${activeProvider.phone}` : ''}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => handleWhatsAppShare(activeProvider.businessName, masterReferralLink)}
                      className="btn btn-outline"
                      style={{ fontSize: '0.82rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <MessageCircle size={15} color="#25D366" />
                      <span>Share Provider on WhatsApp</span>
                    </button>
                  </div>
                </div>

                {activeProvider.tagline && (
                  <p style={{ margin: '14px 0 0', fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                    {activeProvider.tagline} {activeProvider.description && `— ${activeProvider.description}`}
                  </p>
                )}
              </div>

              {/* Services Listing Section */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  Available Services & Commission Details
                </h3>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Select a service package below to review original customer price and your verified affiliate referral earnings, then click <strong>Submit Lead Details</strong>:
                </p>
              </div>

              {activeProviderOfferings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px dashed #CBD5E1' }}>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    No active services listed for this provider yet.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
                  {activeProviderOfferings.map((offering) => {
                    const leadRule = offering.rewardRules.find((r) => r.eventType === 'qualified_lead' && r.isActive);
                    const convRule = offering.rewardRules.find((r) => r.eventType === 'successful_conversion' && r.isActive);
                    const totalAffiliateReward = (leadRule?.affiliateRewardRupees || 0) + (convRule?.affiliateRewardRupees || 0);
                    const offeringShareLink = `https://refer.opnetwork.in/s/${offering.id}?ref=AFF-7821`;

                    return (
                      <div
                        key={offering.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '14px',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 3px 12px rgba(0,0,0,0.04)',
                          position: 'relative'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                              {offering.title}
                            </h4>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              backgroundColor: '#F1F5F9',
                              color: '#475569',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              whiteSpace: 'nowrap'
                            }}>
                              {(offering.categoryId || 'service').replace('_', ' ').toUpperCase()}
                            </span>
                          </div>

                          <p style={{ margin: '0 0 14px', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                            {offering.description}
                          </p>

                          {/* Features checklist */}
                          {offering.features && offering.features.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                              {offering.features.map((f, fi) => (
                                <span
                                  key={fi}
                                  style={{
                                    fontSize: '0.74rem',
                                    backgroundColor: '#F8FAFC',
                                    color: '#334155',
                                    border: '1px solid #E2E8F0',
                                    padding: '3px 8px',
                                    borderRadius: '6px'
                                  }}
                                >
                                  ✓ {f}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* PRICING & AFFILIATE REWARD BREAKDOWN BOX */}
                          <div style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '12px',
                            padding: '14px',
                            marginBottom: '16px'
                          }}>
                            {/* Row 1: Original Customer Price vs Affiliate Cash Reward */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                              <div style={{ borderRight: '1px solid #E2E8F0', paddingRight: '8px' }}>
                                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
                                  Original Customer Price
                                </span>
                                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>
                                  ₹{offering.customerPriceRupees ? offering.customerPriceRupees.toLocaleString('en-IN') : 'N/A'}
                                </div>
                                <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                                  Standard price
                                </span>
                              </div>

                              <div style={{ paddingLeft: '4px' }}>
                                <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
                                  💰 How Much You Get
                                </span>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#047857', marginTop: '2px' }}>
                                  ₹{totalAffiliateReward.toLocaleString('en-IN')} <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Cash</span>
                                </div>
                                <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>
                                  Direct UPI payout
                                </span>
                              </div>
                            </div>

                            {/* Dual reward explanation */}
                            <div style={{
                              backgroundColor: '#ECFDF5',
                              border: '1px solid #A7F3D0',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.74rem',
                              color: '#065F46',
                              fontWeight: 600
                            }}>
                              <span>
                                📋 Lead: <strong>₹{leadRule?.affiliateRewardRupees || 0}</strong>
                              </span>
                              <span>+</span>
                              <span>
                                🎉 Sale: <strong>₹{convRule?.affiliateRewardRupees || 0}</strong>
                              </span>
                              <span>=</span>
                              <strong style={{ color: '#047857' }}>₹{totalAffiliateReward} Total</strong>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: '8px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                          <button
                            type="button"
                            title="Share on WhatsApp"
                            onClick={() => handleWhatsAppShare(offering.title, offeringShareLink)}
                            style={{
                              backgroundColor: '#F0FDF4',
                              border: '1px solid #86EFAC',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <MessageCircle size={18} color="#25D366" />
                          </button>

                          <button
                            className="btn btn-primary"
                            onClick={() => setReferralOffering(offering)}
                            style={{
                              fontSize: '0.88rem',
                              fontWeight: 800,
                              padding: '10px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              backgroundColor: 'var(--brand-cobalt)',
                              borderRadius: '8px'
                            }}
                          >
                            <Send size={15} />
                            <span>Submit Lead Details</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}


      {/* =========================================================================
          VIEW 2: REFERRALS MANAGEMENT (ALL SUBMITTED LEADS MANAGED HERE)
          ========================================================================= */}
      {dashboardTab === 'referrals_management' && (
        <ReferralsList onNewReferral={() => handleTabChange('submit_referral')} />
      )}

      {/* =========================================================================
          VIEW 3: PAYMENTS (ALL PAYMENTS CLEARLY SEEN)
          ========================================================================= */}
      {dashboardTab === 'payments' && (
        <CommissionView />
      )}

      {/* Modals */}
      {modalOffering && (
        <OfferingDetailModal
          offering={modalOffering}
          onClose={() => setModalOffering(null)}
          onReferClick={(o) => setReferralOffering(o)}
        />
      )}

      {referralOffering && (
        <ReferralModal
          offering={referralOffering}
          onClose={() => setReferralOffering(null)}
        />
      )}

      {showShareLandingModal && (
        <CustomerShareLandingModal
          onClose={() => setShowShareLandingModal(false)}
        />
      )}
    </div>
  );
};
