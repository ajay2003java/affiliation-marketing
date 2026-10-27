import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import {
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Building2,
  ArrowRight,
  PhoneCall,
  Lock,
  Zap,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Users
} from 'lucide-react';
import { WaterBackground } from './WaterBackground';

const getInitialLandingMode = (): 'affiliate' | 'provider' => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const view = (params.get('view') || params.get('role') || '').toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (
      path === '/provider' ||
      path.startsWith('/provider/') ||
      path === '/providers' ||
      path.startsWith('/providers/') ||
      path === '/partner' ||
      path.startsWith('/partner/') ||
      view === 'provider' ||
      view === 'partner' ||
      hash === '#provider' ||
      hash.startsWith('#provider')
    ) {
      return 'provider';
    }
  }
  return 'affiliate';
};

export const LandingPage: React.FC = () => {
  const { login, registerAffiliate, showNotification } = useApp();
  const { offerings, providers, addProvider } = useData();

  // Landing Page Mode is determined solely by the link / URL visited
  // Affiliate Link -> Affiliate Landing Page ONLY
  // Provider Link -> Provider Landing Page ONLY
  const [landingMode, setLandingMode] = useState<'affiliate' | 'provider'>(getInitialLandingMode);

  useEffect(() => {
    const handleUrlChange = () => {
      setLandingMode(getInitialLandingMode());
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Affiliate Sign Up Form State
  const [affName, setAffName] = useState('');
  const [affEmail, setAffEmail] = useState('');
  const [affPhone, setAffPhone] = useState('');
  const [affOccupation, setAffOccupation] = useState('Corporate Consultant');
  const [affCity, setAffCity] = useState('Hyderabad');
  const [affAgreementChecked, setAffAgreementChecked] = useState(true);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  // Provider Application Form State (Simple & Friendly)
  const [provBizName, setProvBizName] = useState('');
  const [provContactPerson, setProvContactPerson] = useState('');
  const [provPhone, setProvPhone] = useState('');
  const [provCategory, setProvCategory] = useState('Diagnostic Lab / Clinic');
  const [provCity, setProvCity] = useState('Hyderabad');
  const [provAgreementChecked, setProvAgreementChecked] = useState(true);
  const [provSubmitted, setProvSubmitted] = useState(false);
  const [provError, setProvError] = useState<string | null>(null);

  // Catalog Category Filter (Affiliate View)
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Filter offerings for affiliate view
  const filteredOfferings = offerings.filter((o) => {
    if (selectedCategory === 'all') return true;
    return o.categoryId === selectedCategory;
  }).slice(0, 4);

  // Handle Unified Login Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim()) {
      setLoginError('Please enter your account email.');
      return;
    }

    const res = login(loginEmail, loginPassword);
    if (!res.success && res.error) {
      setLoginError(res.error);
    } else {
      setShowLoginModal(false);
    }
  };

  // Handle Affiliate Self-Registration
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    if (!affName.trim() || !affEmail.trim() || !affPhone.trim()) {
      setSignUpError('Please fill in your name, email, and phone number.');
      return;
    }

    if (!affAgreementChecked) {
      setSignUpError('Please accept the Partner Agreement.');
      return;
    }

    const res = registerAffiliate({
      name: affName.trim(),
      email: affEmail.trim(),
      phone: affPhone.trim(),
      occupation: affOccupation.trim(),
      city: affCity.trim()
    });

    if (!res.success && res.error) {
      setSignUpError(res.error);
    } else {
      setShowSignUpModal(false);
    }
  };

  // Handle Provider Partnership Application (Clean, simple, no friction)
  const handleProviderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProvError(null);

    if (!provBizName.trim() || !provContactPerson.trim() || !provPhone.trim()) {
      setProvError('Please fill in your business name, your name, and phone number.');
      return;
    }

    if (!provAgreementChecked) {
      setProvError('Please check the box to confirm you want to receive customer leads.');
      return;
    }

    try {
      addProvider({
        userId: `usr_${Date.now()}`,
        businessName: provBizName.trim(),
        contactPerson: provContactPerson.trim(),
        email: `${provBizName.toLowerCase().replace(/\s+/g, '')}@partner.in`,
        phone: provPhone.trim(),
        tagline: `${provCategory} partner`,
        description: `Local provider for ${provCategory} in ${provCity}`,
        address: `${provCity}, India`,
        city: provCity.trim(),
        serviceAreas: [provCity.trim()],
        agreementStatus: 'active',
        amountPaidRupees: 0
      });
    } catch (err) {
      console.warn('Local provider record logged:', err);
    }

    setProvSubmitted(true);
    showNotification(`Welcome! We received your details for ${provBizName}. We will call you today.`, 'success');
  };

  const affiliateFaqs = [
    {
      q: 'How does the Ottobon referral program work?',
      a: 'We connect accredited regional service businesses (diagnostic labs, enterprise cloud teams, corporate legal & executive search) with independent consultants and connectors. When you refer a prospective client with their consent, you earn a verified reward when the lead is qualified or when the sale closes.'
    },
    {
      q: 'How much do affiliates earn per referral?',
      a: 'Affiliate rewards are set directly and transparently by each service provider. Typical rewards range from ₹350 to ₹1,500 for an accepted qualified consultation inquiry, and ₹2,500 to ₹10,500 for a completed service sale.'
    },
    {
      q: 'How is customer phone privacy handled?',
      a: 'When a provider contacts your referred client, the call is placed through our recorded business PBX gateway (+91 80-4567-9912). Both numbers remain masked. The customer is never spammed, and your contact relationship remains protected.'
    },
    {
      q: 'When and how do I receive commission payouts?',
      a: 'Once a provider confirms the lead or transaction, earnings are credited to your platform wallet. You can withdraw directly to your bank account via UPI or IMPS within 60 seconds. We automatically withhold statutory 5% Section 194H TDS for PAN-verified accounts and provide Form 16A certificates.'
    },
    {
      q: 'Can any business register as a provider?',
      a: 'No. To ensure high service quality for our affiliates, providers cannot publicly self-register without review. Every business is vetted, verified, and onboarded by the Ottobon operations team with formal service agreements.'
    }
  ];

  // Ultra-simple, everyday human provider FAQs
  const providerFaqs = [
    {
      q: 'Is joining really free?',
      a: 'Yes, 100% free. No monthly subscription, no registration charges, and no hidden fees. You never pay a single rupee upfront.'
    },
    {
      q: 'Where do these customer leads come from?',
      a: 'They are real people, companies, and HR teams in your city who need your services. Our network of verified professionals and consultants recommend your business directly to them.'
    },
    {
      q: 'Do I keep my own prices and customer relationship?',
      a: 'Yes. You decide your own prices and service packages. You talk directly with the customer, deliver the service, and collect the payment.'
    },
    {
      q: 'How do I receive leads?',
      a: 'As soon as a client requests your service, you get their name, phone number, and requirements right on your dashboard so you can call them immediately.'
    },
    {
      q: 'When do I pay any commission?',
      a: 'Only after the customer confirms the booking and pays you. If a customer does not buy, you owe nothing.'
    }
  ];

  return (
    <div className="b2b-landing">
      {/* 1. Clean Enterprise Navigation */}
      <nav className="b2b-nav">
        <div className="b2b-nav-inner">
          {/* sBLOOM Brand Logo */}
          <div className="nav-brand-group">
            <div className="nav-logo-box">
              <img
                src="/sbloom-logo.jpg"
                alt="sBLOOM"
                className="nav-logo-img"
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="nav-brand-badge">
                  by Ottobon
                </span>
              </div>
              <span className="nav-subtext-hide" style={{ fontSize: '0.72rem', color: '#94A3B8', letterSpacing: '0.02em', display: 'block' }}>
                {landingMode === 'affiliate' ? 'B2B Referral Marketplace' : 'For Service Providers'}
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="desktop-nav-links" style={{ alignItems: 'center', gap: '28px', fontSize: '0.88rem', fontWeight: 600, color: '#CBD5E1' }}>
            {landingMode === 'affiliate' ? (
              <>
                <a href="#how-it-works" style={{ color: '#E2E8F0', textDecoration: 'none' }}>How It Works</a>
                <a href="#marketplace" style={{ color: '#E2E8F0', textDecoration: 'none' }}>Services Catalog</a>
                <a href="#trust" style={{ color: '#E2E8F0', textDecoration: 'none' }}>Trust & Escrow</a>
                <a href="#faq" style={{ color: '#E2E8F0', textDecoration: 'none' }}>FAQ</a>
              </>
            ) : (
              <>
                <a href="#provider-how" style={{ color: '#E2E8F0', textDecoration: 'none' }}>How It Works</a>
                <a href="#provider-benefits" style={{ color: '#E2E8F0', textDecoration: 'none' }}>Why Partner</a>
                <a href="#provider-who" style={{ color: '#E2E8F0', textDecoration: 'none' }}>Who Can Join</a>
                <a href="#provider-faq" style={{ color: '#E2E8F0', textDecoration: 'none' }}>FAQ</a>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="b2b-nav-actions">
            <button
              onClick={() => {
                setLoginError(null);
                setLoginEmail('');
                setLoginPassword('');
                setShowLoginModal(true);
              }}
              className="nav-btn-signin"
            >
              Sign In
            </button>

            {landingMode === 'affiliate' ? (
              <button
                onClick={() => {
                  setSignUpError(null);
                  setShowSignUpModal(true);
                }}
                className="nav-btn-cta"
              >
                <span>Join Partner</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                onClick={() => {
                  setProvError(null);
                  setProvSubmitted(false);
                  setShowProviderModal(true);
                }}
                className="nav-btn-cta"
              >
                <span>Grow Free</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="b2b-hero-banner">
        {/* Real-time Interactive Liquid Surface & Water Ripples */}
        <WaterBackground />

        {landingMode === 'affiliate' ? (
          /* ===================================================================== */
          /* AFFILIATE HERO (Responsive & Clean)                                   */
          /* ===================================================================== */
          <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: '780px', margin: '0 auto 40px', textAlign: 'center' }}>
              <h1 className="hero-heading">
                Monetize your professional network with verified referral rewards
              </h1>
              <p className="hero-subtitle">
                Connect your business contacts to accredited diagnostic centers, cloud infrastructure teams, and corporate advisors. Earn <strong style={{ color: '#FFFFFF' }}>₹500 to ₹10,500</strong> per verified client with automated escrow protection and same-day UPI payouts.
              </p>
              <div className="hero-cta-group">
                <button
                  onClick={() => setShowSignUpModal(true)}
                  className="hero-primary-btn"
                >
                  <span>Register as Affiliate Partner (Free)</span>
                  <ArrowRight size={16} />
                </button>
                <a
                  href="#marketplace"
                  className="hero-secondary-btn"
                >
                  <span>Browse Service Offerings</span>
                </a>
              </div>
            </div>

            {/* Realistic SaaS Product Card Preview (Affiliate) */}
            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
              <div className="b2b-card" style={{ padding: '26px 30px', backgroundColor: '#FFFFFF', borderRadius: '14px', boxShadow: '0 25px 50px -12px rgba(6, 19, 37, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#EBF3FF', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                        Affiliate Partner Dashboard
                      </span>
                      <strong style={{ fontSize: '1.05rem', color: '#0A2540', display: 'block' }}>
                        Recent Referral Payout Summary
                      </strong>
                    </div>
                  </div>

                  <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                    ✓ Escrow Verified
                  </span>
                </div>

                {/* Data Row */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '16px 20px', marginBottom: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.84rem' }}>
                    <div>
                      <span style={{ color: '#64748B', fontSize: '0.74rem', display: 'block' }}>Client / Company:</span>
                      <strong style={{ color: '#0F172A' }}>Innovex Software Pvt Ltd</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', fontSize: '0.74rem', display: 'block' }}>Service Requested:</span>
                      <strong style={{ color: '#0A2540' }}>Annual Corporate Health Camp</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', fontSize: '0.74rem', display: 'block' }}>Verified Payout:</span>
                      <strong style={{ color: '#0E8A5E', fontSize: '0.98rem' }}>₹4,800.00</strong>
                    </div>
                  </div>
                </div>

                {/* Status footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#64748B', flexWrap: 'wrap', gap: '8px' }}>
                  <span>Paid directly to Google Pay (UPI: arjun@okaxis • UTR: SBIN202690412)</span>
                  <span style={{ color: '#0A2540', fontWeight: 600 }}>TDS Deducted: ₹240 (Sec 194H)</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ===================================================================== */
          /* PROVIDER HERO (Ultra-Simple, Crystal Clear, Low Cognitive Load)        */
          /* ===================================================================== */
          <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
              <div className="hero-pill-badge">
                <TrendingUp size={14} color="#F59E0B" />
                <span>Zero Upfront Cost • Grow Monthly Revenue</span>
              </div>

              <h1 className="hero-heading">
                Increase Your Business Revenue.<br className="desktop-break" /> Pay Only When You Make Money.
              </h1>

              <p className="hero-subtitle">
                Get paying customers sent directly to you. Zero upfront cost, zero monthly fees.
              </p>

              <div className="hero-cta-group">
                <button
                  onClick={() => {
                    setProvError(null);
                    setProvSubmitted(false);
                    setShowProviderModal(true);
                  }}
                  className="hero-primary-btn"
                >
                  <span>Increase Your Revenue (Free)</span>
                  <ArrowRight size={16} />
                </button>

                <a
                  href="#provider-how"
                  className="hero-secondary-btn"
                >
                  <span>See How It Works</span>
                </a>
              </div>

              {/* Verified Value Metrics Strip */}
              <div className="hero-trust-bar">
                <div className="hero-trust-item">
                  <span className="hero-trust-val">₹0 Upfront</span>
                  <span className="hero-trust-lbl">No Registration Fee</span>
                </div>
                <div className="hero-trust-sep" />
                <div className="hero-trust-item">
                  <span className="hero-trust-val">100% Direct Pay</span>
                  <span className="hero-trust-lbl">Customer Pays You</span>
                </div>
                <div className="hero-trust-sep" />
                <div className="hero-trust-item">
                  <span className="hero-trust-val">Zero Lock-in</span>
                  <span className="hero-trust-lbl">Pay Only When Paid</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS */}
      {/* ========================================================================= */}
      {landingMode === 'affiliate' ? (
        /* AFFILIATE STEPS */
        <section id="how-it-works" className="landing-section">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <h2 className="section-title">
              How the platform works in 3 clear steps
            </h2>
            <p className="section-subtitle">
              Built for clean attribution, complete privacy, and zero disputes.
            </p>
          </div>

          <div className="landing-grid-cards">
            {/* Step 1 */}
            <div className="b2b-card" style={{ padding: '28px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#0A2540', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '18px' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
                Browse Vetted Offerings
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.55 }}>
                Explore accredited diagnostic centers, cloud architects, and corporate advisors. Each service clearly displays customer retail pricing and your exact referral commission.
              </p>
            </div>

            {/* Step 2 */}
            <div className="b2b-card" style={{ padding: '28px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#0A2540', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '18px' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
                Introduce Your Client
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.55 }}>
                Submit prospective clients with their explicit consent. Phone numbers are protected through our private telephony bridge (+91 80-4567-9912) to prevent spam and disintermediation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="b2b-card" style={{ padding: '28px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#0A2540', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '18px' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
                Receive Same-Day UPI Payout
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.55 }}>
                Once the lead is verified or the service is delivered, the provider confirms the outcome. Escrow releases your commission directly to your UPI or bank account with automated TDS receipts.
              </p>
            </div>
          </div>
        </section>
      ) : (
        /* PROVIDER STEPS (Ultra-Simple) */
        <section id="provider-how" className="landing-section">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
            <h2 className="section-title">
              How You Increase Your Revenue
            </h2>
            <p className="section-subtitle">
              3 simple steps. No advertising costs. Zero marketing hassle.
            </p>
          </div>

          <div className="landing-grid-cards">
            {/* Step 1 */}
            <div className="b2b-card" style={{ padding: '28px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#0A2540', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '18px' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
                List What You Offer
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.55 }}>
                Enter your services or packages and your standard prices. It takes only 2 minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="b2b-card" style={{ padding: '28px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#0A2540', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '18px' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
                Receive Paying Customers
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.55 }}>
                When someone in your city needs your service, we send their contact info and requirements directly to your phone.
              </p>
            </div>

            {/* Step 3 */}
            <div className="b2b-card" style={{ padding: '28px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#0A2540', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '18px' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
                Collect Payment & Keep Profit
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.55 }}>
                Deliver the service, collect 100% payment directly into your account, and only share a small fee after you get paid.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. WHY PARTNER / TRUST */}
      {/* ========================================================================= */}
      {landingMode === 'affiliate' ? (
        /* AFFILIATE TRUST */
        <section id="trust" className="landing-section" style={{ backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
              <span className="b2b-badge" style={{ marginBottom: '10px' }}>
                Enterprise Compliance
              </span>
              <h2 className="section-title">
                Institutional security and statutory compliance
              </h2>
              <p className="section-subtitle" style={{ marginTop: '8px' }}>
                Built for commercial partnerships that require legal enforceability, audit trails, and tax compliance.
              </p>
            </div>

            <div className="landing-grid-cards">
              {/* Trust Pillar 1 */}
              <div className="b2b-card" style={{ padding: '28px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#E6F7F0', color: '#0E8A5E', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <ShieldCheck size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
                  Escrow Reconciliation
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.55 }}>
                  Providers maintain escrow reserves with the platform. Once a consultation or sale is verified, funds are released immediately—preventing unearned non-payment or delayed settlements.
                </p>
              </div>

              {/* Trust Pillar 2 */}
              <div className="b2b-card" style={{ padding: '28px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#EBF3FF', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <FileCheck size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
                  Section 194H Tax Withholding
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.55 }}>
                  Full statutory compliance with automated 5% TDS deduction for PAN-verified accounts (20% for unverified). Digital Form 16A certificates are automatically generated quarterly.
                </p>
              </div>

              {/* Trust Pillar 3 */}
              <div className="b2b-card" style={{ padding: '28px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Lock size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
                  Double-Blind Contact Protection
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.55 }}>
                  Service providers only see the customer’s name, requirements, and a masked phone bridge (+91 80-4567-9912). Referrer identities remain strictly confidential to eliminate platform disintermediation.
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* PROVIDER - WHY WORK WITH US (Ultra-Clear) */
        <section id="provider-benefits" className="landing-section" style={{ backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
              <span className="b2b-badge" style={{ marginBottom: '10px' }}>
                Zero Risk Growth
              </span>
              <h2 className="section-title">
                The Risk-Free Way To Increase Revenue
              </h2>
              <p className="section-subtitle" style={{ marginTop: '8px' }}>
                Grow your sales without risking your hard-earned money on marketing agencies or ads.
              </p>
            </div>

            <div className="landing-grid-cards">
              {/* Benefit 1 */}
              <div className="b2b-card" style={{ padding: '28px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#E6F7F0', color: '#0E8A5E', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <ShieldCheck size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
                  Pure Profit Protection
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.55 }}>
                  No monthly subscriptions, no registration fees, and no ad spend. It is 100% free to join and stay on the platform.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="b2b-card" style={{ padding: '28px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#EBF3FF', color: '#0052CC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Users size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
                  High-Value Business Clients
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.55 }}>
                  We send you serious inquiries from companies, HR leaders, and verified individuals ready to book.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="b2b-card" style={{ padding: '28px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <PhoneCall size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
                  Direct Customer Payment
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.55 }}>
                  Customers pay you directly at your standard prices. You keep full control of your rates and customer relationships.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. SERVICES CATALOG (Affiliate) OR WHO CAN JOIN (Provider) */}
      {/* ========================================================================= */}
      {landingMode === 'affiliate' ? (
        /* AFFILIATE CATALOG */
        <section id="marketplace" className="landing-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '36px' }}>
            <div>
              <h2 className="section-title">
                Featured Service Catalog
              </h2>
              <p className="section-subtitle" style={{ marginTop: '6px' }}>
                Verified offerings currently accepting affiliate customer referrals.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="category-filter-strip">
              {[
                { id: 'all', label: 'All Services' },
                { id: 'cat_health', label: 'Healthcare & Diagnostics' },
                { id: 'cat_corp', label: 'Corporate & HR' },
                { id: 'cat_it', label: 'Cloud & IT Security' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '6px',
                    border: '1px solid',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    transition: 'all 0.15s',
                    backgroundColor: selectedCategory === cat.id ? '#0A2540' : '#FFFFFF',
                    color: selectedCategory === cat.id ? '#FFFFFF' : '#475569',
                    borderColor: selectedCategory === cat.id ? '#0A2540' : '#CBD5E1'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Offerings Grid */}
          <div className="landing-grid-cards">
            {filteredOfferings.map((offering) => {
              const provider = providers.find((p) => p.id === offering.providerId);
              const leadRule = offering.rewardRules.find((r) => r.eventType === 'qualified_lead');
              const convRule = offering.rewardRules.find((r) => r.eventType === 'successful_conversion');

              return (
                <div key={offering.id} className="b2b-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{provider?.businessName || 'Verified Provider'}</span>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        Verified Partner
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px', lineHeight: 1.35 }}>
                      {offering.title}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, marginBottom: '18px' }}>
                      {offering.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.82rem' }}>
                        <span style={{ color: '#64748B' }}>Retail Service Price:</span>
                        <strong style={{ color: '#0F172A' }}>₹{offering.customerPriceRupees.toLocaleString('en-IN')}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                        <span style={{ color: '#0052CC', fontWeight: 600 }}>Affiliate Reward:</span>
                        <strong style={{ color: '#0E8A5E', fontSize: '0.92rem' }}>
                          {convRule ? `₹${convRule.affiliateRewardRupees.toLocaleString('en-IN')}` : leadRule ? `₹${leadRule.affiliateRewardRupees.toLocaleString('en-IN')}` : 'Variable'}
                        </strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowSignUpModal(true)}
                      className="b2b-btn-primary"
                      style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '10px 16px' }}
                    >
                      <span>Refer a Client</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        /* PROVIDER - WHO CAN JOIN (Clear & Visual) */
        <section id="provider-who" className="landing-section">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <h2 className="section-title">
              Who Can Partner With Us?
            </h2>
            <p className="section-subtitle" style={{ marginTop: '6px' }}>
              If you offer quality services in your city, we have customers for you.
            </p>
          </div>

          <div className="landing-grid-cards">
            <div className="b2b-card" style={{ padding: '28px', borderTop: '4px solid #0052CC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.6rem' }}>🩺</span>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2540', margin: 0 }}>
                    Diagnostic Labs & Clinics
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Frequent Customer Inquiries</span>
                </div>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.55, marginBottom: '16px' }}>
                Blood tests, scans, full body checkups, and company health camps.
              </p>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', fontSize: '0.8rem', color: '#0F172A', border: '1px solid #E2E8F0' }}>
                Active Partner: <strong>Dhanvika Diagnostics</strong>
              </div>
            </div>

            <div className="b2b-card" style={{ padding: '28px', borderTop: '4px solid #0E8A5E' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.6rem' }}>💻</span>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2540', margin: 0 }}>
                    IT, Software & Web Teams
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Corporate Contracts</span>
                </div>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.55, marginBottom: '16px' }}>
                Websites, cloud support, custom software, and cyber security.
              </p>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', fontSize: '0.8rem', color: '#0F172A', border: '1px solid #E2E8F0' }}>
                Active Partner: <strong>Ottobon Cloud Labs</strong>
              </div>
            </div>

            <div className="b2b-card" style={{ padding: '28px', borderTop: '4px solid #F59E0B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.6rem' }}>📊</span>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2540', margin: 0 }}>
                    CA, Legal & Business Experts
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>High-Paying Clients</span>
                </div>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.55, marginBottom: '16px' }}>
                Company registration, GST, tax filings, legal agreements, and audits.
              </p>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', fontSize: '0.8rem', color: '#0F172A', border: '1px solid #E2E8F0' }}>
                Active Partner: <strong>Vertex Corporate Advisory</strong>
              </div>
            </div>
          </div>

          {/* Simple CTA Callout */}
          <div className="cta-callout-card">
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px' }}>
                Ready to increase your business revenue this month?
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.92rem', maxWidth: '600px' }}>
                Join local service providers who grow their sales every week without spending money on ads. Free forever.
              </p>
            </div>
            <button
              onClick={() => {
                setProvError(null);
                setProvSubmitted(false);
                setShowProviderModal(true);
              }}
              style={{
                padding: '12px 26px',
                fontSize: '0.94rem',
                backgroundColor: '#FFFFFF',
                color: '#0A2540',
                fontWeight: 700,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Increase Your Revenue (Free)</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. HONEST, CLEAN FAQ */}
      {/* ========================================================================= */}
      <section id={landingMode === 'affiliate' ? 'faq' : 'provider-faq'} className="landing-section" style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0A2540', letterSpacing: '-0.02em' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: '#64748B', marginTop: '6px', fontSize: '0.94rem' }}>
            {landingMode === 'affiliate'
              ? 'Answers to common questions regarding lead qualification, payments, and compliance.'
              : 'Everything you need to know about getting customer leads with us.'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(landingMode === 'affiliate' ? affiliateFaqs : providerFaqs).map((faq, idx) => (
            <div
              key={idx}
              className="b2b-card"
              style={{ overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0A2540' }}>
                  {faq.q}
                </span>
                {openFaq === idx ? <ChevronUp size={18} color="#0052CC" /> : <ChevronDown size={18} color="#64748B" />}
              </div>
              {openFaq === idx && (
                <div style={{ padding: '0 22px 18px', color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. Footer */}
      <footer style={{ borderTop: '1px solid #E2E8F0', padding: '32px 20px', color: '#64748B', fontSize: '0.82rem', backgroundColor: '#F8FAFC' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span>
            © 2026 Ottobon Professional Services Network • {landingMode === 'affiliate' ? 'Affiliate Marketplace' : 'Provider Partner Network'}
          </span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ color: '#0E8A5E' }}>● Verified Partner Network</span>
            <span>Zero Upfront Risk</span>
            <span>Direct Client Referrals</span>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* UNIFIED AUTH MODAL: Intelligent Role Routing (Affiliate, Provider, Admin) */}
      {/* ========================================================================= */}
      {showLoginModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Portal Sign In</h2>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                  Enter your credentials to access your dashboard
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowLoginModal(false)}>✕</button>
            </div>

            <form onSubmit={handleLoginSubmit}>
              <div className="modal-body">
                {loginError && (
                  <div className="notice-box danger" style={{ marginBottom: '16px' }}>
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@business.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="b2b-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                >
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </button>

                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle, #E2E8F0)', textAlign: 'center', fontSize: '0.82rem', color: '#64748B' }}>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowSignUpModal(true);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--brand-cobalt, #0052CC)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Join as Affiliate
                  </button>
                  {' · '}
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowProviderModal(true);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--lead-teal, #0D9488)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Register Business
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AFFILIATE SELF-REGISTRATION MODAL */}
      {/* ========================================================================= */}
      {showSignUpModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Join as an Affiliate Partner</h2>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                  Free registration for consultants, advisors, and connectors
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowSignUpModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSignUpSubmit}>
              <div className="modal-body">
                {signUpError && (
                  <div className="notice-box danger" style={{ marginBottom: '16px' }}>
                    <span>{signUpError}</span>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rahul Sharma"
                    value={affName}
                    onChange={(e) => setAffName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="rahul@advisory.in"
                    value={affEmail}
                    onChange={(e) => setAffEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Phone Number (For UPI Settlements) *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98490 00000"
                    value={affPhone}
                    onChange={(e) => setAffPhone(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Profession / Role</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. IT Consultant"
                      value={affOccupation}
                      onChange={(e) => setAffOccupation(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Hyderabad"
                      value={affCity}
                      onChange={(e) => setAffCity(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.78rem', color: '#64748B', lineHeight: 1.4 }}>
                    <input
                      type="checkbox"
                      checked={affAgreementChecked}
                      onChange={(e) => setAffAgreementChecked(e.target.checked)}
                      style={{ marginTop: '2px' }}
                    />
                    <span>
                      I agree to the <strong style={{ color: '#0F172A' }}>Affiliate Partner Code of Conduct</strong> and consent to statutory Section 194H TDS deduction on earned referral commissions.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="b2b-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                >
                  <span>Complete Free Registration</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROVIDER PARTNERSHIP APPLICATION MODAL (Super Easy & Frictionless)        */}
      {/* ========================================================================= */}
      {showProviderModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Increase Your Business Revenue</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                  Start receiving new paying customers • Free to join • Pay only when you earn
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowProviderModal(false)}>✕</button>
            </div>

            {provSubmitted ? (
              <div className="modal-body" style={{ textAlign: 'center', padding: '26px 20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#E6F7F0', color: '#0E8A5E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A2540', marginBottom: '8px' }}>
                  Welcome, {provBizName}!
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                  We received your details. We will call you within 24 hours to help you start receiving customer leads.
                </p>
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', marginBottom: '22px', textAlign: 'left', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Service:</span>
                    <strong>{provCategory}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Contact:</span>
                    <strong>{provContactPerson} ({provPhone})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Fee to Join:</span>
                    <strong style={{ color: '#0E8A5E' }}>100% Free</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProviderModal(false);
                      setLoginEmail('');
                      setLoginPassword('');
                      setShowLoginModal(true);
                    }}
                    className="b2b-btn-primary"
                    style={{ fontSize: '0.86rem', padding: '10px 18px' }}
                  >
                    <span>Sign In to Portal</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProviderModal(false)}
                    className="b2b-btn-secondary"
                    style={{ fontSize: '0.86rem', padding: '10px 18px' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProviderSubmit}>
                <div className="modal-body">
                  {provError && (
                    <div className="notice-box danger" style={{ marginBottom: '16px' }}>
                      <span>{provError}</span>
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label">Business / Clinic Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Dhanvika Diagnostics"
                      value={provBizName}
                      onChange={(e) => setProvBizName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Your Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Dr. Kumar"
                        value={provContactPerson}
                        onChange={(e) => setProvContactPerson(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mobile Number *</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="e.g. 98490 12345"
                        value={provPhone}
                        onChange={(e) => setProvPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px', marginBottom: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">What service do you provide?</label>
                      <select
                        className="form-input"
                        value={provCategory}
                        onChange={(e) => setProvCategory(e.target.value)}
                      >
                        <option value="Diagnostic Lab / Clinic">Diagnostic Lab / Clinic</option>
                        <option value="IT & Software Services">IT & Software Services</option>
                        <option value="CA / Legal / Taxes">CA / Legal / Taxes</option>
                        <option value="Other Services">Other Services</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Your City</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Hyderabad"
                        value={provCity}
                        onChange={(e) => setProvCity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
                      <input
                        type="checkbox"
                        checked={provAgreementChecked}
                        onChange={(e) => setProvAgreementChecked(e.target.checked)}
                        style={{ marginTop: '2px' }}
                      />
                      <span>
                        I want to receive customer leads and agree to pay a small referral fee <strong style={{ color: '#0F172A' }}>only after clients confirm and pay for services</strong>.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="b2b-btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.94rem' }}
                  >
                    <span>Start Getting Leads (Free)</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
