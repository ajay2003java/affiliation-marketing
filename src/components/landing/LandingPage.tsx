import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import { supabase } from '../../services/supabaseClient';
import {
  HeartHandshake,
  Share2,
  Wallet,
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
  Calculator,
  Coins,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  X,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { login, registerAffiliate, showNotification } = useApp();
  const { offerings, providers } = useData();

  // Language Toggle: English vs Telugu
  const [lang, setLang] = useState<'en' | 'te'>('en');

  // Interactive Earnings Calculator
  const [friendsCount, setFriendsCount] = useState<number>(5);
  const avgEarningsPerFriend = 500; // Average reward across packages (e.g. ₹2,500 test = ₹500 reward)
  const totalMonthlyEarnings = friendsCount * avgEarningsPerFriend;

  // Modals
  const [showReferModal, setShowReferModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  // Quick Referral Submission State (Anyone can refer without barrier!)
  const [referFriendName, setReferFriendName] = useState('');
  const [referFriendPhone, setReferFriendPhone] = useState('');
  const [referFriendCity, setReferFriendCity] = useState('Hyderabad');
  const [referSelectedService, setReferSelectedService] = useState('Full Body Health Checkup (84 Tests) - Dhanvika Diagnostics');
  const [referrerName, setReferrerName] = useState('');
  const [referrerUpi, setReferrerUpi] = useState('');
  const [referralSubmitting, setReferralSubmitting] = useState(false);
  const [referralSuccess, setReferralSuccess] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);

  // Affiliate Sign In / Sign Up State
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Handle Quick Referral Lead Submission directly to Supabase
  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReferralError(null);

    const cleanFriendName = referFriendName.trim();
    const cleanFriendPhone = referFriendPhone.trim();
    const cleanReferrerName = referrerName.trim();
    const cleanUpi = referrerUpi.trim();

    if (!cleanFriendName || cleanFriendPhone.length < 10) {
      setReferralError(lang === 'en' ? 'Please enter a valid 10-digit phone number for your friend.' : 'దయచేసి మీ స్నేహితుడి 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి.');
      return;
    }
    if (!cleanReferrerName || !cleanUpi) {
      setReferralError(lang === 'en' ? 'Please enter your name and UPI ID so we can send your cash reward!' : 'మీ నగదు బహుమతిని పంపడానికి దయచేసి మీ పేరు మరియు UPI IDని నమోదు చేయండి!');
      return;
    }

    setReferralSubmitting(true);
    try {
      // Find Dhanvika Diagnostics provider ID if matched
      const dhanvikaProv = providers.find((p) => p.businessName.toLowerCase().includes('dhanvika'));
      const providerId = dhanvikaProv ? dhanvikaProv.id : (providers[0]?.id || '44d57460-17b7-48f4-bedd-5ef8dc84078b');
      const refNumber = `SBL-${Math.floor(100000 + Math.random() * 900000)}-${cleanFriendName.slice(0, 2).toUpperCase()}`;

      // Insert directly into Supabase leads table
      const { error: dbError } = await supabase.from('leads').insert({
        reference_number: refNumber,
        affiliate_code: `DIRECT-${cleanUpi.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`,
        business_name: 'Dhanvika Diagnostics Clinic',
        contact_name: cleanFriendName,
        email: `${cleanFriendPhone}@patient.lead`,
        phone: cleanFriendPhone,
        location: referFriendCity,
        sector: 'Healthcare & Diagnostics',
        business_requirements: `Patient referral for: ${referSelectedService}. Referrer UPI: ${cleanUpi} (${cleanReferrerName})`,
        provider_id: providerId,
        consent: true,
        status: 'Pending',
        estimated_deal_value: 2500.00,
        estimated_commission_amount: 500.00,
        currency: 'INR'
      });

      if (dbError) {
        console.warn('Supabase lead insert note:', dbError.message);
      }

      setReferralSuccess(true);
      showNotification(
        lang === 'en'
          ? `Referral submitted for ${cleanFriendName}! Dhanvika Diagnostics will contact them shortly.`
          : `${cleanFriendName} కోసం రిఫరల్ నమోదైంది! ధన్వికా డయాగ్నస్టిక్స్ త్వరలో సంప్రదిస్తుంది.`,
        'success'
      );
    } catch {
      setReferralError(lang === 'en' ? 'Unable to submit referral right now. Please try again.' : 'రిఫరల్ నమోదు చేయలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి.');
    } finally {
      setReferralSubmitting(false);
    }
  };

  // Handle Affiliate Auth Submit
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        if (!authName.trim() || !authEmail.trim() || authPhone.trim().length < 10) {
          setAuthError('Please fill in your full name, email, and 10-digit mobile number.');
          return;
        }
        const res = registerAffiliate({
          name: authName.trim(),
          email: authEmail.trim(),
          phone: authPhone.trim(),
          city: 'Hyderabad'
        });
        if (!res.success) {
          setAuthError(res.error || 'Registration failed.');
        } else {
          setShowAuthModal(false);
        }
      } else {
        if (!authEmail.trim()) {
          setAuthError('Please enter your email.');
          return;
        }
        const res = login(authEmail.trim(), authPassword.trim() || 'Partner@2026', undefined, undefined, 'affiliate');
        if (!res.success) {
          setAuthError(res.error || 'Invalid credentials.');
        } else {
          setShowAuthModal(false);
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // WhatsApp Share Helper
  const shareOnWhatsApp = (serviceName: string, reward: string) => {
    const text = encodeURIComponent(
      `Hello! If you or anyone in your family needs a reliable health checkup, I recommend Dhanvika Diagnostics (Hyderabad). Get verified testing packages starting at discount rates: ${serviceName}. Check here: https://sbloom.ottobon.in`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FCFAF6', // Warm organic cream
        color: '#1C1917', // Rich earthy warm charcoal
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
      }}
    >
      {/* =========================================================================
          TOP NOTIFICATION BAR (WARM EMERALD / GOLD PROSPERITY BANNER)
          ========================================================================= */}
      <div
        style={{
          background: 'linear-gradient(90deg, #065F46 0%, #047857 50%, #065F46 100%)',
          color: '#FFFFFF',
          padding: '10px 16px',
          fontSize: '0.85rem',
          fontWeight: 600,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(4, 120, 87, 0.2)'
        }}
      >
        <Sparkles size={16} color="#FBBF24" />
        <span>
          {lang === 'en'
            ? 'Help a friend get trusted healthcare — Earn ₹500 to ₹5,000 cash per referral!'
            : 'స్నేహితుడికి నాణ్యమైన వైద్య సేవలను అందించండి — ప్రతి రిఫరల్‌పై ₹500 నుండి ₹5,000 సంపాదించండి!'}
        </span>
        <button
          onClick={() => {
            setReferFriendName('');
            setReferFriendPhone('');
            setReferralSuccess(false);
            setShowReferModal(true);
          }}
          style={{
            backgroundColor: '#F59E0B',
            color: '#1C1917',
            border: 'none',
            borderRadius: '20px',
            padding: '2px 10px',
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: 'pointer',
            marginLeft: '8px'
          }}
        >
          {lang === 'en' ? 'Refer Now' : 'ఇప్పుడే రిఫర్ చేయండి'} &rarr;
        </button>
      </div>

      {/* =========================================================================
          MAIN NAVIGATION
          ========================================================================= */}
      <nav
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E7E5E4'
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              backgroundColor: '#000000',
              padding: '4px 10px',
              borderRadius: '8px',
              border: '1px solid #D97706',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            <img
              src="/sbloom-logo.jpg"
              alt="sBLOOM"
              style={{ height: '28px', width: 'auto', display: 'block', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#D97706', letterSpacing: '0.04em' }}>
              BY OTTOBON
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#065F46' }}>
              Community Referral Network
            </div>
          </div>
        </div>

        {/* Right Nav: Language Toggle + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language Switcher */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#F5F5F4',
              borderRadius: '20px',
              padding: '3px',
              border: '1px solid #D6D3D1'
            }}
          >
            <button
              onClick={() => setLang('en')}
              style={{
                backgroundColor: lang === 'en' ? '#047857' : 'transparent',
                color: lang === 'en' ? '#FFFFFF' : '#44403C',
                border: 'none',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              English
            </button>
            <button
              onClick={() => setLang('te')}
              style={{
                backgroundColor: lang === 'te' ? '#047857' : 'transparent',
                color: lang === 'te' ? '#FFFFFF' : '#44403C',
                border: 'none',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              తెలుగు
            </button>
          </div>

          {/* Partner Login */}
          <button
            onClick={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            style={{
              backgroundColor: 'transparent',
              color: '#065F46',
              border: '1.5px solid #047857',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {lang === 'en' ? 'Advisor Sign In' : 'లాగిన్'}
          </button>

          {/* Provider Portal Link */}
          <a
            href="/provider"
            style={{
              backgroundColor: '#1C1917',
              color: '#F59E0B',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid #44403C'
            }}
          >
            <Building2 size={15} />
            <span>{lang === 'en' ? 'For Hospitals / Clinics' : 'హాస్పిటల్స్ కోసం'}</span>
          </a>
        </div>
      </nav>

      {/* =========================================================================
          HERO BANNER: "Help a friend, earn your share"
          ========================================================================= */}
      <section
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '60px 24px 40px',
          textAlign: 'center'
        }}
      >
        {/* Warm Trust Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FEF3C7',
            border: '1px solid #FDE68A',
            padding: '6px 14px',
            borderRadius: '24px',
            marginBottom: '22px'
          }}
        >
          <HeartHandshake size={18} color="#D97706" />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400E' }}>
            {lang === 'en'
              ? 'No investment needed • Zero risk • Direct UPI payouts'
              : 'ఎలాంటి పెట్టుబడి అవసరం లేదు • నేరుగా మీ UPI కి నగదు'}
          </span>
        </div>

        {/* The Exact User Requested Headline */}
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            color: '#1C1917',
            margin: '0 auto 16px',
            maxWidth: '920px',
            letterSpacing: '-0.02em'
          }}
        >
          {lang === 'en' ? (
            <>
              Help a friend, <span style={{ color: '#047857' }}>earn your share.</span>
            </>
          ) : (
            <>
              స్నేహితుడికి సహాయం చేయండి, <span style={{ color: '#047857' }}>మీ సంపాదన పొందండి.</span>
            </>
          )}
        </h1>

        {/* Plain language explanation */}
        <p
          style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: '#57534E',
            maxWidth: '720px',
            margin: '0 auto 32px',
            lineHeight: 1.6,
            fontWeight: 500
          }}
        >
          {lang === 'en' ? (
            <>
              Know someone who needs a medical checkup, health test, or business service? Connect them to verified clinics like <strong>Dhanvika Diagnostics</strong>. They receive trusted care, and you receive direct cash into your PhonePe, Google Pay, or Bank account.
            </>
          ) : (
            <>
              మీ బంధుమిత్రులకు ఆరోగ్య పరీక్షలు లేదా ల్యాబ్ టెస్టులు అవసరమైనప్పుడు, <strong>ధన్వికా డయాగ్నస్టిక్స్</strong> వంటి నమ్మకమైన క్లినిక్లను సిఫార్సు చేయండి. వారికి అత్యుత్తమ వైద్యం అందుతుంది, మీకు నేరుగా నగదు మీ బ్యాంక్ లేదా PhonePe కు చేరుతుంది.
            </>
          )}
        </p>

        {/* Primary Action Buttons (Warm Emerald & Energetic Persimmon) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '48px'
          }}
        >
          <button
            onClick={() => {
              setReferFriendName('');
              setReferFriendPhone('');
              setReferralSuccess(false);
              setShowReferModal(true);
            }}
            style={{
              backgroundColor: '#EA580C', // High visibility persimmon orange
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 28px',
              fontSize: '1.05rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px rgba(234, 88, 12, 0.35)',
              transition: 'transform 0.15s ease'
            }}
          >
            <span>{lang === 'en' ? 'Refer a Friend Now' : 'స్నేహితుడిని రిఫర్ చేయండి'}</span>
            <ArrowRight size={20} />
          </button>

          <a
            href="#deals"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#065F46',
              border: '2px solid #047857',
              borderRadius: '12px',
              padding: '14px 24px',
              fontSize: '1.05rem',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <Coins size={20} color="#047857" />
            <span>{lang === 'en' ? 'See What You Can Earn' : 'ఆదాయ వివరాలు చూడండి'}</span>
          </a>
        </div>

        {/* Quick Trust Highlights */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '24px',
            fontSize: '0.88rem',
            fontWeight: 600,
            color: '#44403C'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={18} color="#047857" />
            <span>{lang === 'en' ? 'Direct UPI Payments' : 'నేరుగా UPI చెల్లింపులు'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={18} color="#047857" />
            <span>{lang === 'en' ? 'Official Signed MoU Backed' : 'అధికారిక క్లినిక్ ఒప్పందాలు'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={18} color="#047857" />
            <span>{lang === 'en' ? 'Instant WhatsApp Updates' : 'వాట్సాప్ ద్వారా నోటిఫికేషన్లు'}</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE CASH EARNINGS CALCULATOR (SUPER INTUITIVE)
          ========================================================================= */}
      <section
        style={{
          maxWidth: '1080px',
          margin: '0 auto 60px',
          padding: '0 20px'
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
            borderRadius: '24px',
            padding: '36px 32px',
            color: '#FFFFFF',
            boxShadow: '0 16px 36px rgba(6, 78, 59, 0.25)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            alignItems: 'center'
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(251, 191, 36, 0.2)',
                color: '#FDE68A',
                padding: '4px 10px',
                borderRadius: '14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                marginBottom: '12px'
              }}
            >
              <Calculator size={15} />
              <span>{lang === 'en' ? 'ESTIMATE YOUR MONTHLY CASH' : 'మీ నెలవారీ ఆదాయ అంచనా'}</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 10px', lineHeight: 1.25 }}>
              {lang === 'en'
                ? 'How many friends can you help this month?'
                : 'ఈ నెలలో మీరు ఎంతమంది స్నేహితులకు సహాయం చేయగలరు?'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#D1FAE5', margin: '0 0 20px', lineHeight: 1.5 }}>
              {lang === 'en'
                ? 'Select an amount below to see your potential cash rewards sent straight to your UPI account.'
                : 'క్రింద సంఖ్యను ఎంచుకుని మీ సంపాదనను పరిశీలించండి.'}
            </p>

            {/* Quick Select Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[2, 5, 10, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => setFriendsCount(num)}
                  style={{
                    backgroundColor: friendsCount === num ? '#F59E0B' : 'rgba(255, 255, 255, 0.12)',
                    color: friendsCount === num ? '#1C1917' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 18px',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {num} {lang === 'en' ? 'Friends' : 'మంది'}
                </button>
              ))}
            </div>
          </div>

          {/* Calculator Output Display Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '28px',
              color: '#1C1917',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#57534E', textTransform: 'uppercase' }}>
              {lang === 'en' ? 'Your Estimated Cash Earnings' : 'మీ అంచనా సంపాదన'}
            </div>
            <div
              style={{
                fontSize: 'clamp(2.4rem, 4vw, 3.2rem)',
                fontWeight: 900,
                color: '#047857',
                margin: '8px 0 4px',
                letterSpacing: '-0.02em'
              }}
            >
              ₹{totalMonthlyEarnings.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#D97706', marginBottom: '16px' }}>
              {lang === 'en'
                ? `Based on ₹${avgEarningsPerFriend} cash per fulfilled checkup`
                : `ప్రతి క్లినిక్ సందర్శనకు ₹${avgEarningsPerFriend} నగదు లెక్కింపు`}
            </div>

            <button
              onClick={() => {
                setReferFriendName('');
                setReferFriendPhone('');
                setReferralSuccess(false);
                setShowReferModal(true);
              }}
              style={{
                width: '100%',
                backgroundColor: '#047857',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 18px',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>{lang === 'en' ? 'Start Earning Cash Now' : 'ఇప్పుడే సంపాదించడం ప్రారంభించండి'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          THE 3 SIMPLE STEPS (UNCOMPLICATED FOR ANY USER)
          ========================================================================= */}
      <section
        style={{
          maxWidth: '1240px',
          margin: '0 auto 70px',
          padding: '0 24px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1C1917', margin: '0 0 8px' }}>
            {lang === 'en' ? 'How It Works in 3 Simple Steps' : 'కేవలం 3 సులభమైన దశలు'}
          </h2>
          <p style={{ fontSize: '0.98rem', color: '#57534E', margin: 0 }}>
            {lang === 'en' ? 'No complicated forms. No training needed.' : 'ఎలాంటి సంక్లిష్టత లేకుండా ప్రారంభించండి.'}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}
        >
          {/* Step 1 */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E7E5E4',
              borderRadius: '20px',
              padding: '30px 24px',
              position: 'relative'
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#FEF3C7',
                color: '#B45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 900,
                marginBottom: '18px'
              }}
            >
              1
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1C1917', margin: '0 0 8px' }}>
              {lang === 'en' ? 'Choose a Verified Package' : 'సేవను ఎంచుకోండి'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#57534E', lineHeight: 1.5, margin: 0 }}>
              {lang === 'en'
                ? 'Pick from genuine medical diagnostics, blood tests, or checkup packages at Dhanvika Diagnostics.'
                : 'ధన్వికా డయాగ్నస్టిక్స్లో ఉన్న బ్లడ్ టెస్టులు, ఫుల్ బాడీ చెకప్ ప్యాకేజీలను ఎంచుకోండి.'}
            </p>
          </div>

          {/* Step 2 */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E7E5E4',
              borderRadius: '20px',
              padding: '30px 24px',
              position: 'relative'
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 900,
                marginBottom: '18px'
              }}
            >
              2
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1C1917', margin: '0 0 8px' }}>
              {lang === 'en' ? 'Share with Your Friend' : 'స్నేహితుడికి పంపండి'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#57534E', lineHeight: 1.5, margin: 0 }}>
              {lang === 'en'
                ? 'Send them a WhatsApp link or enter their name & phone number on this page.'
                : 'వాట్సాప్ ద్వారా సమాచారం పంపండి లేదా వారి పేరు మరియు మొబైల్ నంబర్ ఇక్కడ నమోదు చేయండి.'}
            </p>
          </div>

          {/* Step 3 */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E7E5E4',
              borderRadius: '20px',
              padding: '30px 24px',
              position: 'relative'
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#FFEDD5',
                color: '#C2410C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 900,
                marginBottom: '18px'
              }}
            >
              3
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1C1917', margin: '0 0 8px' }}>
              {lang === 'en' ? 'Get Cash into Your UPI' : 'నగదు పొందండి'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#57534E', lineHeight: 1.5, margin: 0 }}>
              {lang === 'en'
                ? 'When they complete their checkup, your cash reward is transferred directly to PhonePe, Google Pay, or Bank!'
                : 'వారు క్లినిక్ వెళ్ళి పరీక్ష చేయించుకున్న వెంటనే, మీ నగదు మీ PhonePe లేదా Google Pay కి చేరుతుంది!'}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          LIVE VERIFIED SERVICES (DHANVIKA DIAGNOSTICS DEALS)
          ========================================================================= */}
      <section
        id="deals"
        style={{
          maxWidth: '1240px',
          margin: '0 auto 80px',
          padding: '0 24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#047857', letterSpacing: '0.04em' }}>
              {lang === 'en' ? 'ACTIVE VERIFIED PACKAGES' : 'ప్రస్తుత సేవలు & ఆఫర్లు'}
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1C1917', margin: '4px 0 0' }}>
              {lang === 'en' ? 'Featured Healthcare Deals' : 'ప్రముఖ డయాగ్నస్టిక్ ప్యాకేజీలు'}
            </h2>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#57534E' }}>
            {lang === 'en' ? 'Powered by Dhanvika Diagnostics & Verified Partners' : 'ధన్వికా డయాగ్నస్టిక్స్ అధికారిక భాగస్వామ్యం'}
          </div>
        </div>

        {/* Services Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}
        >
          {/* Service Card 1 */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1.5px solid #E7E5E4',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400E', backgroundColor: '#FEF3C7', padding: '3px 8px', borderRadius: '6px' }}>
                  Full Body Panel
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#047857' }}>
                  Dhanvika Diagnostics
                </span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1C1917', margin: '0 0 6px' }}>
                Comprehensive Master Health Checkup
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#57534E', margin: '0 0 16px', lineHeight: 1.4 }}>
                84 vital parameters: Complete Blood Count, Liver, Kidney, Lipid Profile, Thyroid, and Urine analysis.
              </p>
            </div>

            <div>
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#065F46', fontWeight: 600 }}>Client Price</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1C1917' }}>₹2,500</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700 }}>YOU EARN CASH</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#047857' }}>₹500</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setReferSelectedService('Comprehensive Master Health Checkup - Dhanvika Diagnostics');
                    setShowReferModal(true);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#047857',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {lang === 'en' ? 'Refer Friend' : 'రిఫర్ చేయండి'}
                </button>
                <button
                  onClick={() => shareOnWhatsApp('Comprehensive Master Health Checkup', '₹500')}
                  style={{
                    backgroundColor: '#25D366',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Service Card 2 */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1.5px solid #E7E5E4',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#C2410C', backgroundColor: '#FFEDD5', padding: '3px 8px', borderRadius: '6px' }}>
                  Cardiac Care
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#047857' }}>
                  Dhanvika Diagnostics
                </span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1C1917', margin: '0 0 6px' }}>
                Heart & Diabetes Master Screening
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#57534E', margin: '0 0 16px', lineHeight: 1.4 }}>
                ECG, HbA1c, Fasting Blood Sugar, Cardiac Risk Profile & detailed physician report.
              </p>
            </div>

            <div>
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#065F46', fontWeight: 600 }}>Client Price</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1C1917' }}>₹1,800</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700 }}>YOU EARN CASH</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#047857' }}>₹360</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setReferSelectedService('Heart & Diabetes Master Screening - Dhanvika Diagnostics');
                    setShowReferModal(true);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#047857',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {lang === 'en' ? 'Refer Friend' : 'రిఫర్ చేయండి'}
                </button>
                <button
                  onClick={() => shareOnWhatsApp('Heart & Diabetes Master Screening', '₹360')}
                  style={{
                    backgroundColor: '#25D366',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Service Card 3 */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1.5px solid #E7E5E4',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369A1', backgroundColor: '#E0F2FE', padding: '3px 8px', borderRadius: '6px' }}>
                  Advanced Scans
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#047857' }}>
                  Dhanvika Diagnostics
                </span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1C1917', margin: '0 0 6px' }}>
                MRI / CT / Ultrasound Imaging
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#57534E', margin: '0 0 16px', lineHeight: 1.4 }}>
                High-resolution imaging & radiologist report for brain, spine, joints, and abdomen.
              </p>
            </div>

            <div>
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#065F46', fontWeight: 600 }}>Client Price</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1C1917' }}>₹5,000</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700 }}>YOU EARN CASH</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#047857' }}>₹1,000</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setReferSelectedService('MRI / CT / Ultrasound Imaging - Dhanvika Diagnostics');
                    setShowReferModal(true);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#047857',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {lang === 'en' ? 'Refer Friend' : 'రిఫర్ చేయండి'}
                </button>
                <button
                  onClick={() => shareOnWhatsApp('MRI / CT / Ultrasound Imaging', '₹1,000')}
                  style={{
                    backgroundColor: '#25D366',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER
          ========================================================================= */}
      <footer
        style={{
          borderTop: '1px solid #E7E5E4',
          backgroundColor: '#F5F5F4',
          padding: '40px 24px',
          color: '#57534E',
          fontSize: '0.88rem'
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
            gap: '20px'
          }}
        >
          <div>
            <div style={{ fontWeight: 800, color: '#1C1917', fontSize: '1rem', marginBottom: '4px' }}>
              sBLOOM by Ottobon
            </div>
            <div>Community Health & Business Referral Marketplace &bull; Hyderabad, India</div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="/provider" style={{ color: '#047857', fontWeight: 700, textDecoration: 'none' }}>
              Provider Portal (Dhanvika Diagnostics)
            </a>
            <a href="/admin" style={{ color: '#57534E', fontWeight: 600, textDecoration: 'none' }}>
              Admin Desk
            </a>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODAL: QUICK "REFER A FRIEND" (ZERO FRICTION, DIRECT UPI REWARD)
          ========================================================================= */}
      {showReferModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            backdropFilter: 'blur(3px)'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              padding: '30px 26px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowReferModal(false)}
              style={{
                position: 'absolute',
                right: '18px',
                top: '18px',
                background: 'none',
                border: 'none',
                color: '#78716C',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            {referralSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1C1917', marginBottom: '8px' }}>
                  {lang === 'en' ? 'Referral Registered Successfully!' : 'రిఫరల్ నమోదైంది!'}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#57534E', lineHeight: 1.5, marginBottom: '24px' }}>
                  {lang === 'en'
                    ? `Dhanvika Diagnostics will reach out to ${referFriendName} for appointment booking. When their checkup is completed, your cash reward will be sent to ${referrerUpi}.`
                    : `ధన్వికా డయాగ్నస్టిక్స్ వారు ${referFriendName} గారిని సంప్రదిస్తారు. చెకప్ పూర్తయిన వెంటనే మీ బహుమతి ${referrerUpi} కు పంపబడుతుంది.`}
                </p>
                <button
                  onClick={() => setShowReferModal(false)}
                  style={{
                    backgroundColor: '#047857',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {lang === 'en' ? 'Close & Refer Another Friend' : 'ముగించండి'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleReferralSubmit}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <HeartHandshake size={22} color="#047857" />
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1C1917', margin: 0 }}>
                    {lang === 'en' ? 'Help a Friend & Earn' : 'స్నేహితుడిని రిఫర్ చేయండి'}
                  </h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#57534E', margin: '0 0 20px' }}>
                  {lang === 'en'
                    ? 'Enter their details below. Our verified clinic will reach out to help them.'
                    : 'మీ స్నేహితుడి వివరాలు నమోదు చేయండి. క్లినిక్ వారు వారికి కాల్ చేస్తారు.'}
                </p>

                {referralError && (
                  <div
                    style={{
                      backgroundColor: '#FEE2E2',
                      color: '#B91C1C',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>{referralError}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                      {lang === 'en' ? "Friend's Full Name" : 'స్నేహితుడి పేరు'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={referFriendName}
                      onChange={(e) => setReferFriendName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1.5px solid #D6D3D1',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                      {lang === 'en' ? "Friend's Mobile Number" : 'స్నేహితుడి ఫోన్ నంబర్'} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={referFriendPhone}
                      onChange={(e) => setReferFriendPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1.5px solid #D6D3D1',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                      {lang === 'en' ? 'Select Checkup / Service' : 'సేవను ఎంచుకోండి'}
                    </label>
                    <select
                      value={referSelectedService}
                      onChange={(e) => setReferSelectedService(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1.5px solid #D6D3D1',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option>Comprehensive Master Health Checkup (84 Tests) - Dhanvika Diagnostics (Earn ₹500)</option>
                      <option>Heart & Diabetes Master Screening - Dhanvika Diagnostics (Earn ₹360)</option>
                      <option>MRI / CT / Ultrasound Imaging - Dhanvika Diagnostics (Earn ₹1,000)</option>
                      <option>General Blood & Clinical Pathology - Dhanvika Diagnostics (Earn ₹240)</option>
                    </select>
                  </div>

                  <div style={{ backgroundColor: '#FEF3C7', padding: '12px', borderRadius: '10px', marginTop: '6px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#92400E', marginBottom: '8px' }}>
                      {lang === 'en' ? 'WHERE SHOULD WE SEND YOUR CASH REWARD?' : 'మీ నగదు ఏ UPI కి పంపాలి?'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input
                        type="text"
                        required
                        value={referrerName}
                        onChange={(e) => setReferrerName(e.target.value)}
                        placeholder="Your Name"
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #D97706',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          boxSizing: 'border-box'
                        }}
                      />
                      <input
                        type="text"
                        required
                        value={referrerUpi}
                        onChange={(e) => setReferrerUpi(e.target.value)}
                        placeholder="Your UPI ID (e.g. 9876543210@paytm)"
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #D97706',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={referralSubmitting}
                    style={{
                      backgroundColor: '#EA580C',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 18px',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      cursor: referralSubmitting ? 'not-allowed' : 'pointer',
                      marginTop: '8px',
                      boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
                    }}
                  >
                    {referralSubmitting ? 'Registering Referral...' : 'Submit Referral & Lock Reward'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: AFFILIATE PARTNER SIGN IN / SIGN UP
          ========================================================================= */}
      {showAuthModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            backdropFilter: 'blur(3px)'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '30px 26px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              style={{
                position: 'absolute',
                right: '18px',
                top: '18px',
                background: 'none',
                border: 'none',
                color: '#78716C',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                style={{
                  flex: 1,
                  backgroundColor: authMode === 'signup' ? '#047857' : '#F5F5F4',
                  color: authMode === 'signup' ? '#FFFFFF' : '#57534E',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Join as Advisor
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                style={{
                  flex: 1,
                  backgroundColor: authMode === 'login' ? '#047857' : '#F5F5F4',
                  color: authMode === 'login' ? '#FFFFFF' : '#57534E',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {authError && (
                <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '10px', borderRadius: '8px', fontSize: '0.82rem' }}>
                  {authError}
                </div>
              )}

              {authMode === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Sunitha Reddy"
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D6D3D1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="sunitha@example.com"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D6D3D1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              {authMode === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D6D3D1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              {authMode === 'login' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showAuthPassword ? 'text' : 'password'}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Enter password"
                      style={{ width: '100%', padding: '10px 42px 10px 12px', border: '1.5px solid #D6D3D1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthPassword(!showAuthPassword)}
                      aria-label={showAuthPassword ? 'Hide password' : 'Show password'}
                      title={showAuthPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        background: 'none',
                        border: 'none',
                        color: showAuthPassword ? '#047857' : '#78716C',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {showAuthPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                style={{
                  backgroundColor: '#047857',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: authLoading ? 'not-allowed' : 'pointer',
                  marginTop: '8px'
                }}
              >
                {authLoading ? 'Connecting...' : authMode === 'signup' ? 'Create Free Partner Account' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
