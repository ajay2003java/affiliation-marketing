import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import { UserRole } from '../../types';
import {
  UserCheck,
  Building2,
  ShieldCheck,
  Zap,
  Lock,
  Mail,
  Phone,
  User,
  MapPin,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Shield,
  FileCheck,
  Building,
  KeyRound
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, registerAffiliate, registerProviderUser, showNotification } = useApp();
  const { providers, addProvider, createOffering, categories } = useData();

  // Selected Role Tab: 'affiliate' | 'provider' | 'admin'
  const [activeRole, setActiveRole] = useState<UserRole>('affiliate');

  // Submode for Affiliate & Provider: 'login' | 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Common Error / Alert
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields - Affiliate Login
  const [affLoginEmail, setAffLoginEmail] = useState('');
  const [affLoginPassword, setAffLoginPassword] = useState('');

  // Form Fields - Affiliate Sign Up
  const [affName, setAffName] = useState('');
  const [affEmail, setAffEmail] = useState('');
  const [affPhone, setAffPhone] = useState('');
  const [affOccupation, setAffOccupation] = useState('');
  const [affCity, setAffCity] = useState('Hyderabad');
  const [affPassword, setAffPassword] = useState('');
  const [affAgreementChecked, setAffAgreementChecked] = useState(true);

  // Form Fields - Provider Login
  const [provSelectId, setProvSelectId] = useState('');
  const [provLoginEmail, setProvLoginEmail] = useState('');
  const [provLoginPassword, setProvLoginPassword] = useState('');

  // Form Fields - Provider Onboard / Sign Up
  const [provBizName, setProvBizName] = useState('');
  const [provCategory, setProvCategory] = useState('cat_health');
  const [provCity, setProvCity] = useState('Hyderabad');
  const [provContactPerson, setProvContactPerson] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provPhone, setProvPhone] = useState('');
  const [provAddress, setProvAddress] = useState('');
  const [provTagline, setProvTagline] = useState('');
  const [provInitialService, setProvInitialService] = useState('');
  const [provPrice, setProvPrice] = useState('4999');
  const [provLeadFee, setProvLeadFee] = useState('500');
  const [provConvFee, setProvConvFee] = useState('1200');
  const [provPassword, setProvPassword] = useState('');

  // Form Fields - Admin Login (Our Company Staff Desk Only)
  const [adminEmail, setAdminEmail] = useState('academy@ottobon.in');
  const [adminKey, setAdminKey] = useState('admin123');

  // Role Tab Switching
  const handleRoleTabChange = (role: UserRole) => {
    setActiveRole(role);
    setErrorMessage(null);
    if (role === 'admin') {
      setAuthMode('login'); // Admin is internal staff only; no public signup
    }
  };

  // Quick Admin Staff Fill Handler
  const fillDemoAdmin = () => {
    setActiveRole('admin');
    setAuthMode('login');
    setAdminEmail('academy@ottobon.in');
    setAdminKey('admin123');
    setErrorMessage(null);
    showNotification('Loaded staff credentials for Admin Bhanu Bonu.', 'info');
  };

  // 1. Submit Affiliate Login
  const handleAffiliateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!affLoginEmail.trim()) {
      setErrorMessage('Please enter your affiliate registered email address.');
      return;
    }
    const res = login('affiliate', affLoginEmail, affLoginPassword);
    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  // 2. Submit Affiliate Registration (Sign Up)
  const handleAffiliateSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!affName.trim() || !affEmail.trim() || !affPhone.trim()) {
      setErrorMessage('Please provide your full legal name, email address, and mobile number.');
      return;
    }
    if (!affAgreementChecked) {
      setErrorMessage('Please accept the Commercial Referral MoU to proceed.');
      return;
    }

    const res = registerAffiliate({
      name: affName,
      email: affEmail,
      phone: affPhone,
      occupation: affOccupation,
      city: affCity
    });

    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  // 3. Submit Provider Login
  const handleProviderLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!provLoginEmail.trim()) {
      setErrorMessage('Please provide your authorized business email.');
      return;
    }

    const res = login('provider', provLoginEmail, provLoginPassword, provSelectId);
    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  // 4. Submit Provider Onboarding / Registration (Sign Up)
  const handleProviderSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!provBizName.trim() || !provContactPerson.trim() || !provEmail.trim() || !provPhone.trim()) {
      setErrorMessage('Please fill in business name, contact person, business email, and phone number.');
      return;
    }

    try {
      // 1. Register new Provider in DataContext
      const newProv = addProvider({
        userId: `usr_prov_${Date.now()}`,
        businessName: provBizName.trim(),
        tagline: provTagline.trim() || `${provCity} Partner Business`,
        contactPerson: provContactPerson.trim(),
        email: provEmail.trim().toLowerCase(),
        phone: provPhone.trim(),
        address: provAddress.trim() || `${provCity}, India`,
        city: provCity.trim(),
        serviceAreas: [provCity.trim()],
        agreementStatus: 'active',
        description: `Direct provider registered on platform for ${provCity}. Sector: ${provCategory}`,
        amountPaidRupees: 0
      });

      // 2. If initial offering provided, create it automatically
      if (provInitialService.trim()) {
        const affLeadReward = parseFloat(provLeadFee) || 350;
        const affConvReward = parseFloat(provConvFee) || 900;

        createOffering({
          providerId: newProv.id,
          serviceId: 'srv_custom',
          categoryId: provCategory,
          title: provInitialService.trim(),
          description: `Certified service offering from ${newProv.businessName}`,
          features: ['Direct Provider Guarantee', 'Verified Service Quality'],
          customerPriceRupees: parseFloat(provPrice) || 3999, // Decided solely by provider
          currency: 'INR',
          serviceArea: provCity,
          rewardRules: [
            {
              id: `rr_lead_${Date.now()}`,
              offeringId: '',
              eventType: 'qualified_lead',
              providerFeeRupees: affLeadReward + 50,
              affiliateRewardRupees: affLeadReward, // Decided solely by provider
              qualificationCriteria: 'Prospect contact verified within city service area.',
              version: 1,
              isActive: true
            },
            {
              id: `rr_conv_${Date.now()}`,
              offeringId: '',
              eventType: 'successful_conversion',
              providerFeeRupees: affConvReward + 100,
              affiliateRewardRupees: affConvReward, // Decided solely by provider
              conversionCriteria: 'Customer completes purchase & invoice is cleared.',
              version: 1,
              isActive: true
            }
          ]
        });
      }

      // 3. Register user and authenticate immediately
      const provUser = {
        id: newProv.userId,
        name: provContactPerson.trim(),
        email: provEmail.trim().toLowerCase(),
        role: 'provider' as const,
        phone: provPhone.trim(),
        providerId: newProv.id
      };

      registerProviderUser(provUser, newProv.id);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error onboarding provider. Please check your inputs.');
    }
  };

  // 5. Submit Admin Login (Internal Staff Only - "admin ourself")
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!adminEmail.trim()) {
      setErrorMessage('Please enter authorized company staff email.');
      return;
    }
    const res = login('admin', adminEmail, adminKey);
    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Authority Header Bar */}
      <header
        style={{
          backgroundColor: 'var(--brand-navy)',
          color: '#FFFFFF',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0052CC 0%, #0E8A5E 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(0,82,204,0.3)'
              }}
            >
              OP
            </div>
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#FFFFFF' }}>
                Ottobon Partner Network
              </h1>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                Enterprise Affiliate & Commercial Referral Marketplace • PRD v0.2
              </p>
            </div>
          </div>

          {/* Compliance & Trust Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Shield size={14} color="#A3E6CD" />
              <span>Multi-Tenant Role Isolation</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FileCheck size={14} color="#A3E6CD" />
              <span>TDS 194H & Escrow Rail</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Lock size={14} color="#A3E6CD" />
              <span>Masked Telephony Proxy</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 16px 60px',
          maxWidth: '960px',
          margin: '0 auto',
          width: '100%'
        }}
      >
        {/* Hero Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px', maxWidth: '680px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '8px', letterSpacing: '-0.03em' }}>
            Choose Your Portal to Sign In
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Select your organization type below. Affiliate partners only access affiliate rewards, client businesses access their private operational portal, and Admin is reserved for our company staff.
          </p>
        </div>

        {/* Quick Staff Admin Access Pill */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
            <ShieldCheck size={16} color="var(--brand-navy)" />
            <span>Authorized Operations Desk:</span>
          </div>
          <div>
            <button
              type="button"
              id="pill-demo-admin"
              className="btn btn-outline btn-sm"
              onClick={fillDemoAdmin}
              style={{ fontSize: '0.78rem', padding: '6px 14px', borderColor: 'var(--brand-navy)', color: 'var(--brand-navy)', fontWeight: 700 }}
            >
              🛡️ Admin Staff Access (academy@ottobon.in)
            </button>
          </div>
        </div>

        {/* 3 Main Role Selector Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            width: '100%',
            marginBottom: '24px'
          }}
        >
          {/* Tab 1: Affiliate Partner */}
          <div
            id="tab-btn-affiliate-auth"
            onClick={() => handleRoleTabChange('affiliate')}
            style={{
              padding: '20px',
              backgroundColor: activeRole === 'affiliate' ? '#FFFFFF' : 'var(--bg-surface-subtle)',
              border: activeRole === 'affiliate' ? '2px solid var(--brand-cobalt)' : '1px solid var(--border-light)',
              borderRadius: '14px',
              cursor: 'pointer',
              boxShadow: activeRole === 'affiliate' ? 'var(--shadow-elevated)' : 'none',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {activeRole === 'affiliate' && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  backgroundColor: 'var(--brand-cobalt)'
                }}
              />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: activeRole === 'affiliate' ? 'var(--brand-cobalt-light)' : '#E2E8F0',
                  color: 'var(--brand-cobalt)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <UserCheck size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                  Affiliate Partner
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Network Lead & Consultant
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              Share verified services with contacts, track qualified referrals, and receive TDS-compliant cashouts.
            </p>
          </div>

          {/* Tab 2: Client Provider */}
          <div
            id="tab-btn-provider-auth"
            onClick={() => handleRoleTabChange('provider')}
            style={{
              padding: '20px',
              backgroundColor: activeRole === 'provider' ? '#FFFFFF' : 'var(--bg-surface-subtle)',
              border: activeRole === 'provider' ? '2px solid var(--lead-teal)' : '1px solid var(--border-light)',
              borderRadius: '14px',
              cursor: 'pointer',
              boxShadow: activeRole === 'provider' ? 'var(--shadow-elevated)' : 'none',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {activeRole === 'provider' && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  backgroundColor: 'var(--lead-teal)'
                }}
              />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: activeRole === 'provider' ? 'var(--lead-teal-light)' : '#E2E8F0',
                  color: 'var(--lead-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Building2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                  Client Provider
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Business & Diagnostic Centers
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              Receive prospective clients via masked proxy, manage service packages, and report conversion outcomes.
            </p>
          </div>

          {/* Tab 3: Admin Operations Desk ("admin ourself") */}
          <div
            id="tab-btn-admin-auth"
            onClick={() => handleRoleTabChange('admin')}
            style={{
              padding: '20px',
              backgroundColor: activeRole === 'admin' ? '#FFFFFF' : 'var(--bg-surface-subtle)',
              border: activeRole === 'admin' ? '2px solid var(--brand-navy)' : '1px solid var(--border-light)',
              borderRadius: '14px',
              cursor: 'pointer',
              boxShadow: activeRole === 'admin' ? 'var(--shadow-elevated)' : 'none',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {activeRole === 'admin' && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  backgroundColor: 'var(--brand-navy)'
                }}
              />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: activeRole === 'admin' ? '#E2E8F0' : '#E2E8F0',
                  color: 'var(--brand-navy)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                  Admin Operations Desk
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--accent-coral)', fontWeight: 700 }}>
                  Ottobon Internal Staff Only
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              Platform governance, fee invoicing, double-blind verification, and master commission disbursement.
            </p>
          </div>
        </div>

        {/* Main Auth Form Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-elevated)',
            padding: '32px',
            width: '100%',
            position: 'relative'
          }}
        >
          {/* Error Banner */}
          {errorMessage && (
            <div
              className="notice-box danger"
              style={{
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '0.85rem'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Authentication Notice:</strong> {errorMessage}
              </div>
            </div>
          )}

          {/* ========================================================
              ROLE 1: AFFILIATE PARTNER (LOGIN & SIGN UP)
             ======================================================== */}
          {activeRole === 'affiliate' && (
            <div>
              {/* Segmented Sign In / Sign Up Switcher */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  padding: '4px',
                  borderRadius: '10px',
                  marginBottom: '24px',
                  maxWidth: '360px'
                }}
              >
                <button
                  type="button"
                  id="btn-submode-aff-login"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    backgroundColor: authMode === 'login' ? '#FFFFFF' : 'transparent',
                    color: authMode === 'login' ? 'var(--brand-navy)' : 'var(--text-muted)',
                    boxShadow: authMode === 'login' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Sign In to Workspace
                </button>
                <button
                  type="button"
                  id="btn-submode-aff-signup"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMessage(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    backgroundColor: authMode === 'signup' ? '#FFFFFF' : 'transparent',
                    color: authMode === 'signup' ? 'var(--brand-navy)' : 'var(--text-muted)',
                    boxShadow: authMode === 'signup' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Join as New Affiliate
                </button>
              </div>

              {authMode === 'login' ? (
                /* Affiliate Login Form */
                <form onSubmit={handleAffiliateLogin}>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                      Affiliate Registered Email / Mobile
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="text"
                        id="input-affiliate-login-email"
                        className="form-input"
                        style={{ paddingLeft: '38px', width: '100%' }}
                        value={affLoginEmail}
                        onChange={(e) => setAffLoginEmail(e.target.value)}
                        placeholder="e.g. partner@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                      Security Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="password"
                        id="input-affiliate-login-password"
                        className="form-input"
                        style={{ paddingLeft: '38px', width: '100%' }}
                        value={affLoginPassword}
                        onChange={(e) => setAffLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <button
                      type="submit"
                      id="btn-submit-affiliate-login"
                      className="btn btn-primary"
                      style={{ padding: '12px 24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span>Sign In to Affiliate Dashboard</span>
                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      style={{ background: 'none', border: 'none', color: 'var(--brand-cobalt)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      Don't have an affiliate account? Join now →
                    </button>
                  </div>
                </form>
              ) : (
                /* Affiliate Sign Up Form */
                <form onSubmit={handleAffiliateSignUp}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                        Full Legal Name *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input
                          type="text"
                          id="input-affiliate-signup-name"
                          className="form-input"
                          style={{ paddingLeft: '38px', width: '100%' }}
                          value={affName}
                          onChange={(e) => setAffName(e.target.value)}
                          placeholder="e.g. Sneha Kulkarni"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                        Email Address *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input
                          type="email"
                          id="input-affiliate-signup-email"
                          className="form-input"
                          style={{ paddingLeft: '38px', width: '100%' }}
                          value={affEmail}
                          onChange={(e) => setAffEmail(e.target.value)}
                          placeholder="e.g. sneha.k@corpservices.in"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                        Mobile Phone (for OTP & Disbursal) *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input
                          type="tel"
                          id="input-affiliate-signup-phone"
                          className="form-input"
                          style={{ paddingLeft: '38px', width: '100%' }}
                          value={affPhone}
                          onChange={(e) => setAffPhone(e.target.value)}
                          placeholder="+91 98450 67890"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                        Primary Operating City
                      </label>
                      <div style={{ position: 'relative' }}>
                        <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input
                          type="text"
                          id="input-affiliate-signup-city"
                          className="form-input"
                          style={{ paddingLeft: '38px', width: '100%' }}
                          value={affCity}
                          onChange={(e) => setAffCity(e.target.value)}
                          placeholder="Hyderabad, Bangalore, Visakhapatnam..."
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                      Professional Network / Occupation
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Briefcase size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="text"
                        id="input-affiliate-signup-occupation"
                        className="form-input"
                        style={{ paddingLeft: '38px', width: '100%' }}
                        value={affOccupation}
                        onChange={(e) => setAffOccupation(e.target.value)}
                        placeholder="e.g. Senior Corporate HR / Physician Network / Business Consultant"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                      Choose Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="password"
                        id="input-affiliate-signup-password"
                        className="form-input"
                        style={{ paddingLeft: '38px', width: '100%' }}
                        value={affPassword}
                        onChange={(e) => setAffPassword(e.target.value)}
                        placeholder="Create a secure password"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={affAgreementChecked}
                        onChange={(e) => setAffAgreementChecked(e.target.checked)}
                      />
                      <span>
                        I accept the Standard Affiliate Referral MoU, Code of Conduct, and Data Privacy terms under PRD v0.2.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    id="btn-submit-affiliate-signup"
                    className="btn btn-primary"
                    style={{ padding: '12px 28px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <span>Create Affiliate Account & Open Dashboard</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================
              ROLE 2: CLIENT PROVIDER (LOGIN & ONBOARD BUSINESS)
             ======================================================== */}
          {activeRole === 'provider' && (
            <div>
              {/* Segmented Sign In / Onboard Switcher */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  padding: '4px',
                  borderRadius: '10px',
                  marginBottom: '24px',
                  maxWidth: '400px'
                }}
              >
                <button
                  type="button"
                  id="btn-submode-prov-login"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    backgroundColor: authMode === 'login' ? '#FFFFFF' : 'transparent',
                    color: authMode === 'login' ? 'var(--brand-navy)' : 'var(--text-muted)',
                    boxShadow: authMode === 'login' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Provider Sign In
                </button>
                <button
                  type="button"
                  id="btn-submode-prov-signup"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMessage(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    backgroundColor: authMode === 'signup' ? '#FFFFFF' : 'transparent',
                    color: authMode === 'signup' ? 'var(--brand-navy)' : 'var(--text-muted)',
                    boxShadow: authMode === 'signup' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Onboard Business (Sign Up)
                </button>
              </div>

              {authMode === 'login' ? (
                /* Provider Login Form */
                <form onSubmit={handleProviderLogin}>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                      Select Onboarded Provider Business
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Building2 size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <select
                        id="select-provider-tenant"
                        className="form-input"
                        style={{ paddingLeft: '38px', width: '100%', appearance: 'auto' }}
                        value={provSelectId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setProvSelectId(id);
                          const p = providers.find((prov) => prov.id === id);
                          if (p) setProvLoginEmail(p.email);
                        }}
                      >
                        {providers.length > 0 ? (
                          providers.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.businessName} ({p.city}) — SPOC: {p.contactPerson}
                            </option>
                          ))
                        ) : (
                          <option value="">No onboarded provider businesses yet</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                      Authorized Business Official Email
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="email"
                        id="input-provider-login-email"
                        className="form-input"
                        style={{ paddingLeft: '38px', width: '100%' }}
                        value={provLoginEmail}
                        onChange={(e) => setProvLoginEmail(e.target.value)}
                        placeholder="e.g. partner@business.com"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                      Security Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="password"
                        id="input-provider-login-password"
                        className="form-input"
                        style={{ paddingLeft: '38px', width: '100%' }}
                        value={provLoginPassword}
                        onChange={(e) => setProvLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <button
                      type="submit"
                      id="btn-submit-provider-login"
                      className="btn btn-primary"
                      style={{ padding: '12px 24px', fontSize: '0.9rem', backgroundColor: 'var(--lead-teal)', borderColor: 'var(--lead-teal)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span>Access Provider Portal</span>
                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      style={{ background: 'none', border: 'none', color: 'var(--lead-teal)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      New client business? Onboard your clinic or firm →
                    </button>
                  </div>
                </form>
              ) : (
                /* Provider Onboarding / Sign Up Form */
                <form onSubmit={handleProviderSignUp}>
                  <div style={{ marginBottom: '16px' }}>
                    <div className="notice-box info" style={{ fontSize: '0.82rem', margin: 0 }}>
                      <Building2 size={16} />
                      <span>
                        <strong>Client Business Onboarding:</strong> Enter your official business registration details. Once onboarded, your portal will allow you to receive masked referral leads and configure commercial service packages.
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                        Business / Center Legal Name *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Building2 size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input
                          type="text"
                          id="input-prov-signup-bizname"
                          className="form-input"
                          style={{ paddingLeft: '38px', width: '100%' }}
                          value={provBizName}
                          onChange={(e) => setProvBizName(e.target.value)}
                          placeholder="e.g. City Neuro Care & Diagnostics"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                        Sector / Industry Category *
                      </label>
                      <select
                        id="select-prov-signup-category"
                        className="form-input"
                        style={{ width: '100%', appearance: 'auto' }}
                        value={provCategory}
                        onChange={(e) => setProvCategory(e.target.value)}
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                        Authorized Signatory / SPOC *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input
                          type="text"
                          id="input-prov-signup-spoc"
                          className="form-input"
                          style={{ paddingLeft: '38px', width: '100%' }}
                          value={provContactPerson}
                          onChange={(e) => setProvContactPerson(e.target.value)}
                          placeholder="e.g. Dr. Ramesh Babu, MD"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                        Operational Territory / City *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input
                          type="text"
                          id="input-prov-signup-city"
                          className="form-input"
                          style={{ paddingLeft: '38px', width: '100%' }}
                          value={provCity}
                          onChange={(e) => setProvCity(e.target.value)}
                          placeholder="Hyderabad, Secunderabad, Visakhapatnam..."
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                        Official Business Email *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input
                          type="email"
                          id="input-prov-signup-email"
                          className="form-input"
                          style={{ paddingLeft: '38px', width: '100%' }}
                          value={provEmail}
                          onChange={(e) => setProvEmail(e.target.value)}
                          placeholder="partners@cityneurocare.in"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                        Official Phone / WhatsApp *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input
                          type="tel"
                          id="input-prov-signup-phone"
                          className="form-input"
                          style={{ paddingLeft: '38px', width: '100%' }}
                          value={provPhone}
                          onChange={(e) => setProvPhone(e.target.value)}
                          placeholder="+91 88850 12345"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                      Business Address & Facility Details
                    </label>
                    <input
                      type="text"
                      id="input-prov-signup-address"
                      className="form-input"
                      style={{ width: '100%' }}
                      value={provAddress}
                      onChange={(e) => setProvAddress(e.target.value)}
                      placeholder="e.g. Plot No. 12, Main Road, KPHB Colony, Hyderabad"
                    />
                  </div>

                  {/* Initial Offering (Optional Quick Start) */}
                  <div
                    style={{
                      border: '1px solid var(--border-light)',
                      borderRadius: '10px',
                      padding: '16px',
                      backgroundColor: 'var(--bg-app)',
                      marginBottom: '20px'
                    }}
                  >
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '4px' }}>
                      Initial Service Offering (Decided Solely by Provider)
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      As the provider, you decide the customer service price and the exact referral reward paid to the affiliate.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Service Title</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ width: '100%', fontSize: '0.82rem' }}
                          value={provInitialService}
                          onChange={(e) => setProvInitialService(e.target.value)}
                          placeholder="e.g. Master Neuro Diagnostic Package"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--brand-navy)' }}>Customer Retail Price (₹)</label>
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: '100%', fontSize: '0.82rem', fontWeight: 700 }}
                          value={provPrice}
                          onChange={(e) => setProvPrice(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--lead-teal)' }}>Affiliate Reward: Lead (₹)</label>
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: '100%', fontSize: '0.82rem', color: 'var(--lead-teal)', fontWeight: 600 }}
                          value={provLeadFee}
                          onChange={(e) => setProvLeadFee(e.target.value)}
                          title="What the affiliate receives for bringing a qualified lead"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--finance-green)' }}>Affiliate Reward: Sale (₹)</label>
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: '100%', fontSize: '0.82rem', color: 'var(--finance-green)', fontWeight: 700 }}
                          value={provConvFee}
                          onChange={(e) => setProvConvFee(e.target.value)}
                          title="What the affiliate receives for a paying customer"
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                      Portal Access Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="password"
                        id="input-prov-signup-password"
                        className="form-input"
                        style={{ paddingLeft: '38px', width: '100%' }}
                        value={provPassword}
                        onChange={(e) => setProvPassword(e.target.value)}
                        placeholder="Choose a strong password"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="btn-submit-provider-signup"
                    className="btn btn-primary"
                    style={{ padding: '12px 28px', fontSize: '0.9rem', backgroundColor: 'var(--lead-teal)', borderColor: 'var(--lead-teal)', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <span>Submit Onboarding & Launch Provider Portal</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================
              ROLE 3: ADMIN OPERATIONS DESK ("ADMIN OURSELF")
             ======================================================== */}
          {activeRole === 'admin' && (
            <div>
              {/* Security Banner for Admin Desk */}
              <div
                style={{
                  backgroundColor: 'rgba(10, 37, 64, 0.04)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px'
                }}
              >
                <KeyRound size={22} color="var(--brand-navy)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--brand-navy)', margin: '0 0 4px' }}>
                    Confidential Internal Desk • Ottobon Operations & Fiscal Audit
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    <strong>Public registration is strictly disabled.</strong> The Admin Operations Desk oversees dual-bucket commission escrow, Section 194H TDS compliance audits, and commercial client receivables. Authorized personnel only.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAdminLogin}>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                    Authorized Ottobon Staff Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="email"
                      id="input-admin-email"
                      className="form-input"
                      style={{ paddingLeft: '38px', width: '100%' }}
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="academy@ottobon.in"
                      required
                    />
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Staff account: <code style={{ color: 'var(--brand-navy)' }}>academy@ottobon.in</code>
                  </span>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                    Staff Passkey / Security Key
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="password"
                      id="input-admin-key"
                      className="form-input"
                      style={{ paddingLeft: '38px', width: '100%' }}
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-submit-admin-login"
                  className="btn btn-primary"
                  style={{
                    padding: '12px 28px',
                    fontSize: '0.9rem',
                    backgroundColor: 'var(--brand-navy)',
                    borderColor: 'var(--brand-navy)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <ShieldCheck size={18} />
                  <span>Authenticate & Open Admin Operations Desk</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-light)',
          backgroundColor: '#FFFFFF',
          padding: '20px 24px',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span>
            <strong>Ottobon Partner Network</strong> • PRD v0.2 Compliant Multi-Tenant Marketplace
          </span>
          <span>
            Healthcare Diagnostics • Cloud & IT • Executive HR • Professional Training
          </span>
        </div>
      </footer>
    </div>
  );
};
