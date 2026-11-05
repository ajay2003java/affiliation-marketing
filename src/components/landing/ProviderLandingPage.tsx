import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import {
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  Users
} from 'lucide-react';
import { WaterBackground } from './WaterBackground';
import { ProviderLogin } from '../provider/ProviderLogin';

export const ProviderLandingPage: React.FC = () => {
  const { showNotification } = useApp();
  const { addProvider } = useData();

  // Modals
  const [showLoginModal, setShowLoginModal] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return search.includes('login') || hash.includes('login');
  });
  const [showProviderModal, setShowProviderModal] = useState<boolean>(false);

  // Provider Application Form State (Simple & Friendly)
  const [provBizName, setProvBizName] = useState('');
  const [provContactPerson, setProvContactPerson] = useState('');
  const [provPhone, setProvPhone] = useState('');
  const [provCategory, setProvCategory] = useState('Diagnostic Lab / Clinic');
  const [provCity, setProvCity] = useState('Hyderabad');
  const [provAgreementChecked, setProvAgreementChecked] = useState(true);
  const [provSubmitted, setProvSubmitted] = useState(false);
  const [provError, setProvError] = useState<string | null>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
                For Service Providers
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="desktop-nav-links" style={{ alignItems: 'center', gap: '28px', fontSize: '0.88rem', fontWeight: 600, color: '#CBD5E1' }}>
            <a href="#provider-how" style={{ color: '#E2E8F0', textDecoration: 'none' }}>How It Works</a>
            <a href="#provider-benefits" style={{ color: '#E2E8F0', textDecoration: 'none' }}>Why Partner</a>
            <a href="#provider-who" style={{ color: '#E2E8F0', textDecoration: 'none' }}>Who Can Join</a>
            <a href="#provider-faq" style={{ color: '#E2E8F0', textDecoration: 'none' }}>FAQ</a>
          </div>

          {/* Actions */}
          <div className="b2b-nav-actions">
            <button
              onClick={() => setShowLoginModal(true)}
              className="nav-btn-cta"
            >
              <span>Log In</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="b2b-hero-banner">
        {/* Real-time Interactive Liquid Surface & Water Ripples */}
        <WaterBackground />

        {/* PROVIDER HERO (Ultra-Simple, Crystal Clear, Low Cognitive Load) */}
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
                onClick={() => setShowLoginModal(true)}
                className="hero-primary-btn"
              >
                <span>Log In to Increase Your Revenue</span>
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
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* 4. WHY PARTNER / TRUST */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* 5. WHO CAN JOIN */}
      {/* ========================================================================= */}
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
              Category Focus: <strong>Pathology, Imaging & Diagnostics</strong>
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
              Category Focus: <strong>Cloud Architecture, IT & Security</strong>
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
              Category Focus: <strong>Legal, Tax & Corporate Compliance</strong>
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
            onClick={() => setShowLoginModal(true)}
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
            <span>Log In to Increase Your Revenue</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. HONEST, CLEAN FAQ */}
      {/* ========================================================================= */}
      <section id="provider-faq" className="landing-section" style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0A2540', letterSpacing: '-0.02em' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: '#64748B', marginTop: '6px', fontSize: '0.94rem' }}>
            Everything you need to know about getting customer leads with us.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {providerFaqs.map((faq, idx) => (
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
            © 2026 Ottobon Professional Services Network • Provider Partner Network
          </span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Affiliate Marketplace</a>
            <a href="/admin" style={{ color: '#64748B', textDecoration: 'none' }}>Admin Operations</a>
          </div>
        </div>
      </footer>

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
                    <label className="form-label">Business / Clinic / Company Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Apollo Diagnostics Center"
                      value={provBizName}
                      onChange={(e) => setProvBizName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label">Your Name (Owner / Manager) *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Suresh Kumar"
                      value={provContactPerson}
                      onChange={(e) => setProvContactPerson(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label">Mobile Number (We send customer leads here) *</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91 98480 12345"
                      value={provPhone}
                      onChange={(e) => setProvPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">Main Service Category</label>
                      <select
                        className="form-input"
                        value={provCategory}
                        onChange={(e) => setProvCategory(e.target.value)}
                      >
                        <option value="Diagnostic Lab / Clinic">Diagnostic Lab / Clinic</option>
                        <option value="IT, Cloud & Software">IT, Cloud & Software</option>
                        <option value="CA, Tax & Legal Services">CA, Tax & Legal Services</option>
                        <option value="HR & Staffing Services">HR & Staffing Services</option>
                        <option value="Other Business Services">Other Business Services</option>
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

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
                      <input
                        type="checkbox"
                        checked={provAgreementChecked}
                        onChange={(e) => setProvAgreementChecked(e.target.checked)}
                        style={{ marginTop: '2px' }}
                      />
                      <span>
                        I confirm this is my genuine business and I want to receive customer leads. No charges to join.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="b2b-btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                  >
                    <span>Start Receiving Customers (100% Free)</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROVIDER LOGIN MODAL (THE EXACT SCREENSHOT COMPONENT)                      */}
      {/* ========================================================================= */}
      {showLoginModal && (
        <ProviderLogin
          isModal={true}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
};
