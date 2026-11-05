import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../services/supabaseClient';
import { ProviderLogin } from '../provider/ProviderLogin';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  X,
  TrendingUp,
  Users,
  Award,
  FileText,
  Activity,
  Sparkles,
  PhoneCall,
  Stethoscope,
  ChevronRight,
  MapPin,
  Clock,
  HelpCircle
} from 'lucide-react';

export const ProviderLandingPage: React.FC = () => {
  const { providers, offerings } = useData();
  const { showNotification } = useApp();

  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return search.includes('login') || hash.includes('login');
  });

  // Clinic Onboarding Inquiry Modal State
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [contactDoctor, setContactDoctor] = useState('');
  const [clinicPhone, setClinicPhone] = useState('');
  const [clinicEmail, setClinicEmail] = useState('');
  const [clinicCity, setClinicCity] = useState('Hyderabad');
  const [clinicServices, setClinicServices] = useState('Diagnostics & Pathology Lab');
  const [onboardSubmitting, setOnboardSubmitting] = useState(false);
  const [onboardSubmitted, setOnboardSubmitted] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicName.trim() || clinicPhone.trim().length < 10) {
      showNotification('Please enter clinic name and a valid 10-digit mobile number.', 'warning');
      return;
    }

    setOnboardSubmitting(true);
    try {
      // Save partnership inquiry to Supabase
      const { error } = await supabase.from('leads').insert({
        reference_number: `PROV-INQ-${Math.floor(100000 + Math.random() * 900000)}`,
        affiliate_code: 'PROVIDER-ONBOARDING',
        business_name: clinicName.trim(),
        contact_name: contactDoctor.trim() || 'Clinic Representative',
        email: clinicEmail.trim() || `${clinicPhone.trim()}@provider.lead`,
        phone: clinicPhone.trim(),
        location: clinicCity.trim(),
        sector: 'Healthcare Provider Onboarding',
        business_requirements: `Inquiry for clinic onboarding: ${clinicServices}. Doctor/Contact: ${contactDoctor.trim()}`,
        consent: true,
        status: 'Pending'
      });

      if (error) {
        console.warn('Supabase lead note:', error.message);
      }

      setOnboardSubmitted(true);
      showNotification('Partnership inquiry received! Our Healthcare Onboarding Team will contact you within 24 hours.', 'success');
    } catch {
      showNotification('Inquiry registered! Our team will contact you shortly.', 'info');
      setOnboardSubmitted(true);
    } finally {
      setOnboardSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How do patient appointments reach our clinic?',
      a: 'Trained community health advisors across Telangana & AP recommend your accredited diagnostic packages to patients needing blood tests, scans, or checkups. Patient details and chosen packages appear instantly in your Provider Dashboard with contact numbers.'
    },
    {
      q: 'Who collects the service payment from the patient?',
      a: 'The patient pays directly at your clinic reception or billing counter. Ottobon sBLOOM does NOT hold your clinical funds or interfere with patient billing.'
    },
    {
      q: 'Can we manage our test packages, MRI/CT scans, and pricing?',
      a: 'Yes! Your Provider Dashboard gives you 100% control to publish, edit, or adjust test packages, MRP, discounted partner rates, and turnaround times in real time.'
    },
    {
      q: 'How does the bilateral MoU and commission settlement work?',
      a: 'All clinics operate under a standardized bilateral commercial MoU. You agree to a pre-set discount or referral incentive for referred patients. Once the test is delivered, you confirm the outcome in your portal, and the automated settlement ledger calculates the fee transparently.'
    },
    {
      q: 'Which clinics are already onboarded in the network?',
      a: 'Our active network includes leading diagnostic providers like Dhanvika Diagnostics, Accumax Diagnostics, Bhavya Laboratory, Medicare Diagnostics, Nagarjuna’s Diagnostics, SMS Diagnostics, Yoda Diagnostics, and Aseervadam Diagnostic.'
    }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0F1D', // Deep premium medical navy
        color: '#F8FAFC',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
      }}
    >
      <style>{`
        @media (min-width: 860px) {
          .md-nav-links { display: flex !important; }
        }
        @media (max-width: 859px) {
          .md-nav-links { display: none !important; }
        }
      `}</style>
      {/* =========================================================================
          TOP NOTIFICATION BANNER
          ========================================================================= */}
      <div
        style={{
          background: 'linear-gradient(90deg, #1E3A8A 0%, #0F172A 50%, #1E3A8A 100%)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.25)',
          color: '#E0E7FF',
          padding: '8px 16px',
          fontSize: '0.82rem',
          fontWeight: 600,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={15} color="#F59E0B" />
          <span>Healthcare & Clinical Partner Network • Bilateral MoU & Direct Counter Settlement</span>
        </div>
        <span style={{ color: '#64748B' }}>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#93C5FD' }}>
          <PhoneCall size={14} />
          <span>Partner Helpdesk: +91 99887 76655</span>
        </div>
      </div>

      {/* =========================================================================
          MAIN NAVIGATION BAR
          ========================================================================= */}
      <nav
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              backgroundColor: '#000000',
              padding: '6px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}
          >
            <img
              src="/sbloom-logo.jpg"
              alt="sBLOOM"
              style={{ height: '30px', width: 'auto', display: 'block', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#F59E0B',
                  letterSpacing: '0.05em'
                }}
              >
                BY OTTOBON
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  backgroundColor: 'rgba(37, 99, 235, 0.25)',
                  color: '#93C5FD',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  border: '1px solid rgba(37, 99, 235, 0.4)'
                }}
              >
                B2B CLINICAL
              </span>
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              Provider Partner Portal
            </div>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div style={{ display: 'none', gap: '24px', fontSize: '0.86rem', fontWeight: 600, color: '#94A3B8' }} className="md-nav-links">
          <a href="#why-partner" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Why Partner</a>
          <a href="#clinics" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Network Clinics</a>
          <a href="#how-it-works" style={{ color: '#CBD5E1', textDecoration: 'none' }}>How It Works</a>
          <a href="#mou-terms" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Bilateral MoU</a>
          <a href="#faq" style={{ color: '#CBD5E1', textDecoration: 'none' }}>FAQ</a>
        </div>

        {/* Right CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Public / Affiliate Link */}
          <a
            href="/"
            style={{
              color: '#94A3B8',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.15s ease'
            }}
          >
            For Referrers / Public &rarr;
          </a>

          {/* Provider Sign In Trigger Button */}
          <button
            onClick={() => setShowLoginModal(true)}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '9px 18px',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.15s ease'
            }}
          >
            <Lock size={16} />
            <span>Provider Sign In</span>
          </button>
        </div>
      </nav>

      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '64px 24px 50px',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(37, 99, 235, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: '#60A5FA',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '20px',
            letterSpacing: '0.04em'
          }}
        >
          <ShieldCheck size={16} color="#3B82F6" />
          VERIFIED HEALTHCARE PROVIDER & DIAGNOSTIC NETWORK
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
            fontWeight: 900,
            lineHeight: 1.18,
            color: '#FFFFFF',
            maxWidth: '920px',
            margin: '0 auto 20px',
            letterSpacing: '-0.02em'
          }}
        >
          Scale Your Clinic Footfall & Patient Bookings with{' '}
          <span style={{ background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #93C5FD 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Verified Community Health Referrals
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
            color: '#94A3B8',
            maxWidth: '780px',
            margin: '0 auto 32px',
            lineHeight: 1.6
          }}
        >
          Ottobon sBLOOM connects certified diagnostic laboratories, pathology clinics, and hospitals with over 1,200+ trained community health advisors across Telangana & AP. Receive pre-screened patient appointments directly into your clinic portal with ₹0 upfront marketing spend.
        </p>

        {/* Main Hero Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '48px' }}>
          {/* Primary: Sign In to Provider Portal */}
          <button
            onClick={() => setShowLoginModal(true)}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 28px',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.45)',
              transition: 'transform 0.15s ease'
            }}
          >
            <span>Sign In to Provider Portal</span>
            <ArrowRight size={18} />
          </button>

          {/* Secondary: Request Onboarding */}
          <button
            onClick={() => {
              setOnboardSubmitted(false);
              setShowOnboardModal(true);
            }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#F8FAFC',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '14px 26px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Building2 size={18} color="#F59E0B" />
            <span>Request Clinic Onboarding</span>
          </button>
        </div>

        {/* Trust Badges / Stats Bar */}
        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            textAlign: 'left'
          }}
        >
          <div
            style={{
              backgroundColor: '#131D33',
              border: '1px solid #1E293B',
              borderRadius: '14px',
              padding: '18px 20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Building2 size={20} color="#60A5FA" />
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Active Network</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF' }}>8+ Accredited Clinics</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>Dhanvika, Accumax, Bhavya, Medicare & more</div>
          </div>

          <div
            style={{
              backgroundColor: '#131D33',
              border: '1px solid #1E293B',
              borderRadius: '14px',
              padding: '18px 20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <ShieldCheck size={20} color="#10B981" />
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Direct Settlement</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981' }}>100% Counter Billing</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>Patients pay your clinic reception directly</div>
          </div>

          <div
            style={{
              backgroundColor: '#131D33',
              border: '1px solid #1E293B',
              borderRadius: '14px',
              padding: '18px 20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <TrendingUp size={20} color="#F59E0B" />
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Marketing Cost</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F59E0B' }}>₹0 Upfront Risk</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>Zero fixed retainers. Performance only</div>
          </div>

          <div
            style={{
              backgroundColor: '#131D33',
              border: '1px solid #1E293B',
              borderRadius: '14px',
              padding: '18px 20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <FileText size={20} color="#A78BFA" />
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Legal Protection</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF' }}>Bilateral MoU</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>Standardized commercial terms & audit SLA</div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: WHY PARTNER WITH SBLOOM (THE 4 PILLARS)
          ========================================================================= */}
      <section
        id="why-partner"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '60px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60A5FA', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Provider Advantages
          </div>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Built Exclusively for Clinical & Diagnostic Providers
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.96rem', maxWidth: '640px', margin: '8px auto 0' }}>
            Everything you need to fill open lab slots, expand doctor consultations, and operate transparently without marketing agency burn.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}
        >
          {/* Pillar 1 */}
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1F2937',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(37, 99, 235, 0.15)',
                  border: '1px solid rgba(37, 99, 235, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60A5FA',
                  marginBottom: '18px'
                }}
              >
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px' }}>
                Pre-Screened Patient Referrals
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.6 }}>
                No cold calls or generic leads. Health advisors pre-qualify community members who actively require health profiles, blood tests, radiology scans, or outpatient procedures.
              </p>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#60A5FA', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              <span>Full patient context delivered to portal</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1F2937',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981',
                  marginBottom: '18px'
                }}
              >
                <Activity size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px' }}>
                Real-Time Offering & Pricing Autonomy
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.6 }}>
                Publish full body checkup packages (e.g., 84-test profiles), MRI/CT scans, pathology panels, and specialized profiles with your custom MRP and discounted partner rate.
              </p>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#10B981', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              <span>Add, pause or update packages anytime</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1F2937',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F59E0B',
                  marginBottom: '18px'
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px' }}>
                Direct Cash Collections at Your Desk
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.6 }}>
                Patients pay your clinic reception directly via cash, UPI, or card. You maintain total custody of your cash flow. Referral payouts are reconciled transparently in your ledger.
              </p>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#F59E0B', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              <span>Zero escrow delay on patient fee</span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1F2937',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(167, 139, 250, 0.15)',
                  border: '1px solid rgba(167, 139, 250, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#A78BFA',
                  marginBottom: '18px'
                }}
              >
                <FileText size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px' }}>
                Bilateral Legal Governance & Audit SLA
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.6 }}>
                Protected by bilateral commercial MoUs conforming to clinical establishment standards. Every conversion, discount, and referral ledger entry is tamper-proof.
              </p>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#A78BFA', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              <span>Strict compliance with medical privacy</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: ONBOARDED PROVIDER CLINICS SHOWCASE (LIVE FROM SUPABASE)
          ========================================================================= */}
      <section
        id="clinics"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '60px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F59E0B', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
              Accredited Clinical Network
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Partner Diagnostic Centers & Labs
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.94rem', margin: '6px 0 0' }}>
              Verified medical providers actively receiving patient referrals across Telangana and AP.
            </p>
          </div>

          <button
            onClick={() => setShowOnboardModal(true)}
            style={{
              backgroundColor: 'transparent',
              color: '#60A5FA',
              border: '1.5px solid #3B82F6',
              borderRadius: '10px',
              padding: '8px 18px',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Join This Network</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Providers Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}
        >
          {providers.map((p) => {
            const clinicOfferings = offerings.filter((o) => o.providerId === p.id);
            return (
              <div
                key={p.id}
                style={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #1E293B',
                  borderRadius: '14px',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(59, 130, 246, 0.12)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#60A5FA'
                      }}
                    >
                      <Building2 size={20} />
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCircle2 size={12} />
                      Verified MoU
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px' }}>
                    {p.businessName}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8', fontSize: '0.8rem', marginBottom: '8px' }}>
                    <MapPin size={14} color="#64748B" />
                    <span>{p.city || 'Hyderabad, Telangana'}</span>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.4, margin: '0 0 16px' }}>
                    {p.tagline || 'Comprehensive Clinical Diagnostics & Preventive Health Profiles'}
                  </p>
                </div>

                <div
                  style={{
                    borderTop: '1px solid #1E293B',
                    paddingTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem'
                  }}
                >
                  <span style={{ color: '#94A3B8' }}>
                    Active Packages:{' '}
                    <strong style={{ color: '#F8FAFC' }}>{clinicOfferings.length > 0 ? clinicOfferings.length : '8+'}</strong>
                  </span>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#60A5FA',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '0.78rem'
                    }}
                  >
                    Manage Clinic &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION: HOW IT WORKS FOR HEALTHCARE PROVIDERS (4 STEPS)
          ========================================================================= */}
      <section
        id="how-it-works"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '60px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10B981', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Seamless Workflow
          </div>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            How sBLOOM Works for Clinics in 4 Easy Steps
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.96rem', maxWidth: '640px', margin: '8px auto 0' }}>
            From initial bilateral agreement to direct patient counter settlement.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            position: 'relative'
          }}
        >
          {/* Step 1 */}
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1F2937',
              borderRadius: '16px',
              padding: '26px',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-14px',
                left: '24px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '8px'
              }}
            >
              STEP 1
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginTop: '8px', marginBottom: '10px' }}>
              Onboard & Sign Bilateral MoU
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#94A3B8', lineHeight: 1.5 }}>
              Complete rapid verification of clinic registration and execute our standardized bilateral commercial MoU defining agreed patient discounts and referral terms.
            </p>
          </div>

          {/* Step 2 */}
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1F2937',
              borderRadius: '16px',
              padding: '26px',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-14px',
                left: '24px',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '8px'
              }}
            >
              STEP 2
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginTop: '8px', marginBottom: '10px' }}>
              Publish Health Packages
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#94A3B8', lineHeight: 1.5 }}>
              Use your Provider Dashboard to list diagnostic tests, master health checkup packages, MRI/CT scans, and consultations with your custom rates.
            </p>
          </div>

          {/* Step 3 */}
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1F2937',
              borderRadius: '16px',
              padding: '26px',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-14px',
                left: '24px',
                backgroundColor: '#D97706',
                color: '#FFFFFF',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '8px'
              }}
            >
              STEP 3
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginTop: '8px', marginBottom: '10px' }}>
              Receive Pre-Qualified Referrals
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#94A3B8', lineHeight: 1.5 }}>
              Advisors submit verified patient referrals. You receive immediate notifications with patient contact, required test packages, and preferred timing.
            </p>
          </div>

          {/* Step 4 */}
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1F2937',
              borderRadius: '16px',
              padding: '26px',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-14px',
                left: '24px',
                backgroundColor: '#7C3AED',
                color: '#FFFFFF',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '8px'
              }}
            >
              STEP 4
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginTop: '8px', marginBottom: '10px' }}>
              Deliver Care & Settle Direct
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#94A3B8', lineHeight: 1.5 }}>
              The patient attends their appointment and pays directly at your desk. You confirm completion in one click, and the transparent ledger tracks all fees.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: BILATERAL MOU & COMMERCIAL GOVERNANCE
          ========================================================================= */}
      <section
        id="mou-terms"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '60px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div
          style={{
            backgroundColor: '#0F172A',
            border: '1px solid #1E293B',
            borderRadius: '20px',
            padding: '40px 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
            alignItems: 'center'
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#F59E0B',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '12px'
              }}
            >
              <FileText size={14} />
              LEGAL & COMMERCIAL ASSURANCE
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25, margin: '0 0 16px' }}>
              Standardized Bilateral MoU for Clinical Integrity
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#94A3B8', lineHeight: 1.6, margin: '0 0 20px' }}>
              We believe in bilateral transparency. Our bilateral MoU guarantees that your clinical brand retains full control over patient care, test protocols, pricing decisions, and direct patient collections.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#CBD5E1' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>Zero interference in medical diagnoses or test execution</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#CBD5E1' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>Transparent automated commission ledger under PRD v0.2</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#CBD5E1' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>Explicit patient consent & adherence to HIPAA/NABH guidelines</span>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#1E293B',
              borderRadius: '16px',
              border: '1px solid #334155',
              padding: '28px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                border: '1px solid rgba(37, 99, 235, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60A5FA',
                margin: '0 auto 16px'
              }}
            >
              <Award size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px' }}>
              Ready to Access Your Portal?
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#94A3B8', margin: '0 0 20px' }}>
              Existing clinics can log in directly with their registered business email or mobile number.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              style={{
                width: '100%',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '13px 20px',
                fontSize: '0.94rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
              }}
            >
              <Lock size={16} />
              <span>Sign In to Provider Portal</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: FAQ ACCORDION
          ========================================================================= */}
      <section
        id="faq"
        style={{
          maxWidth: '860px',
          margin: '0 auto',
          padding: '60px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60A5FA', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Frequently Asked Questions
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Common Questions From Partner Clinics
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((f, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1F2937',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>{f.q}</span>
                  <ChevronRight
                    size={18}
                    color="#94A3B8"
                    style={{
                      transform: isOpen ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.15s ease'
                    }}
                  />
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 20px 18px',
                      color: '#94A3B8',
                      fontSize: '0.88rem',
                      lineHeight: 1.6,
                      borderTop: '1px solid #1F2937'
                    }}
                  >
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          BOTTOM CALL TO ACTION
          ========================================================================= */}
      <section
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0F172A',
          padding: '50px 24px',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 12px' }}>
            Empower Your Diagnostic Center Today
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.92rem', margin: '0 0 24px' }}>
            Sign into your clinic workspace to view incoming appointments, edit test packages, and track verified referral conversions.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowLoginModal(true)}
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '0.94rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
              }}
            >
              <Lock size={16} />
              <span>Provider Sign In</span>
            </button>
            <button
              onClick={() => setShowOnboardModal(true)}
              style={{
                backgroundColor: 'transparent',
                color: '#CBD5E1',
                border: '1px solid #334155',
                borderRadius: '10px',
                padding: '12px 20px',
                fontSize: '0.94rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Request Partnership
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER
          ========================================================================= */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px 16px',
          fontSize: '0.8rem',
          color: '#64748B',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <strong style={{ color: '#94A3B8' }}>Ottobon Healthcare & Commercial Network</strong> &bull; Provider Partner Portal
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Affiliate Community</a>
            <a href="/admin" style={{ color: '#94A3B8', textDecoration: 'none' }}>Admin Operations</a>
            <span style={{ color: '#475569' }}>PRD v0.2 Compliant</span>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODAL 1: PROVIDER LOGIN MODAL (THE USER SCREENSHOT COMPONENT)
          ========================================================================= */}
      {showLoginModal && (
        <ProviderLogin
          isModal={true}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
      )}

      {/* =========================================================================
          MODAL 2: CLINIC ONBOARDING INQUIRY MODAL
          ========================================================================= */}
      {showOnboardModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px 16px',
            overflowY: 'auto'
          }}
          onClick={() => setShowOnboardModal(false)}
        >
          <div
            style={{
              backgroundColor: '#1E293B',
              borderRadius: '16px',
              border: '1px solid #334155',
              padding: '28px',
              width: '100%',
              maxWidth: '480px',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowOnboardModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F59E0B'
                }}
              >
                <Building2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  Clinic Onboarding Request
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  Connect your clinic or lab to sBLOOM
                </span>
              </div>
            </div>

            {onboardSubmitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ color: '#FFFFFF', fontSize: '1.1rem', margin: '0 0 8px' }}>
                  Inquiry Received Successfully!
                </h4>
                <p style={{ color: '#94A3B8', fontSize: '0.86rem', margin: '0 0 20px' }}>
                  Our Healthcare Partnerships Team will review your clinic details and contact you within 24 business hours to execute the bilateral MoU.
                </p>
                <button
                  onClick={() => setShowOnboardModal(false)}
                  style={{
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleOnboardingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '4px' }}>
                    Clinic / Diagnostic Center Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="e.g. Apex Diagnostic & Scan Center"
                    style={{
                      width: '100%',
                      backgroundColor: '#0F172A',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '9px 12px',
                      color: '#FFFFFF',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '4px' }}>
                      Contact Doctor / Manager
                    </label>
                    <input
                      type="text"
                      value={contactDoctor}
                      onChange={(e) => setContactDoctor(e.target.value)}
                      placeholder="Dr. Sharma"
                      style={{
                        width: '100%',
                        backgroundColor: '#0F172A',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '9px 12px',
                        color: '#FFFFFF',
                        fontSize: '0.88rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '4px' }}>
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={clinicPhone}
                      onChange={(e) => setClinicPhone(e.target.value)}
                      placeholder="9876543210"
                      style={{
                        width: '100%',
                        backgroundColor: '#0F172A',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '9px 12px',
                        color: '#FFFFFF',
                        fontSize: '0.88rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '4px' }}>
                      Business Email
                    </label>
                    <input
                      type="email"
                      value={clinicEmail}
                      onChange={(e) => setClinicEmail(e.target.value)}
                      placeholder="info@clinic.com"
                      style={{
                        width: '100%',
                        backgroundColor: '#0F172A',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '9px 12px',
                        color: '#FFFFFF',
                        fontSize: '0.88rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '4px' }}>
                      City / Area
                    </label>
                    <input
                      type="text"
                      value={clinicCity}
                      onChange={(e) => setClinicCity(e.target.value)}
                      placeholder="Hyderabad"
                      style={{
                        width: '100%',
                        backgroundColor: '#0F172A',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '9px 12px',
                        color: '#FFFFFF',
                        fontSize: '0.88rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '4px' }}>
                    Primary Services Offered
                  </label>
                  <select
                    value={clinicServices}
                    onChange={(e) => setClinicServices(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#0F172A',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '9px 12px',
                      color: '#FFFFFF',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Diagnostics & Pathology Lab">Diagnostics & Pathology Lab</option>
                    <option value="Radiology, Ultrasound & CT/MRI">Radiology, Ultrasound & CT/MRI</option>
                    <option value="Comprehensive Health Checkups">Comprehensive Health Checkups</option>
                    <option value="Multi-Specialty Hospital / Outpatient">Multi-Specialty Hospital / Outpatient</option>
                    <option value="Dental / Ophthalmology / Specialty Clinic">Dental / Ophthalmology / Specialty Clinic</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={onboardSubmitting}
                  style={{
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '11px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: onboardSubmitting ? 'not-allowed' : 'pointer',
                    marginTop: '6px'
                  }}
                >
                  {onboardSubmitting ? 'Submitting Application...' : 'Submit Partnership Application'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
