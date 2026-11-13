import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
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
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { WaterBackground } from './WaterBackground';

export const LandingPage: React.FC = () => {
  const { login, registerAffiliate, showNotification } = useApp();
  const { providers } = useData();

  // Language Toggle: English vs Telugu
  const [lang, setLang] = useState<'en' | 'te'>('en');

  // Interactive Earnings Calculator
  const [friendsCount, setFriendsCount] = useState<number>(5);
  const avgEarningsPerFriend = 500; // Average reward across packages (e.g. ₹2,500 test = ₹500 reward)
  const totalMonthlyEarnings = friendsCount * avgEarningsPerFriend;

  // Modals
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [authContextMessage, setAuthContextMessage] = useState<{
    title: string;
    subtitle: string;
    serviceTitle?: string;
  } | null>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Affiliate Sign In / Sign Up State
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authCity, setAuthCity] = useState('Hyderabad');
  const [authPassword, setAuthPassword] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Prompt Auth before referring a friend
  const promptAuthToRefer = (serviceTitle?: string, initialMode: 'signup' | 'login' = 'signup') => {
    try {
      sessionStorage.setItem('pending_referral_intent', 'true');
      if (serviceTitle) {
        sessionStorage.setItem('pending_referral_service', serviceTitle);
      } else {
        sessionStorage.removeItem('pending_referral_service');
      }
    } catch {
      // ignore
    }

    setAuthMode(initialMode);
    setAuthContextMessage({
      title: lang === 'en' ? 'Create an Account or Sign In to Refer' : 'రిఫర్ చేయడానికి అకౌంట్ తెరవండి లేదా లాగిన్ అవ్వండి',
      subtitle:
        lang === 'en'
          ? 'Please create a free account or sign in first. Once logged in, your referrals, earnings, and direct UPI payouts are securely tracked!'
          : 'ముందుగా మీ ఉచిత ఖాతాను సృష్టించండి లేదా లాగిన్ అవ్వండి. మీ రిఫరల్స్ మరియు నగదు బహుమతులు సురక్షితంగా ట్రాక్ చేయబడతాయి!',
      serviceTitle
    });
    setAuthError(null);
    setShowAuthModal(true);
  };

  // Standard Sign In / Advisor Join modal without pending referral
  const openStandardAuth = (mode: 'login' | 'signup') => {
    try {
      sessionStorage.removeItem('pending_referral_intent');
      sessionStorage.removeItem('pending_referral_service');
    } catch {
      // ignore
    }
    setAuthMode(mode);
    setAuthContextMessage(null);
    setAuthError(null);
    setShowAuthModal(true);
  };

  // Handle Affiliate Auth Submit
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        if (!authName.trim() || !authEmail.trim() || authPhone.trim().length < 10) {
          setAuthError(
            lang === 'en'
              ? 'Please fill in your full name, email, and 10-digit mobile number.'
              : 'దయచేసి మీ పూర్తి పేరు, ఈమెయిల్ మరియు 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి.'
          );
          return;
        }
        const res = registerAffiliate({
          name: authName.trim(),
          email: authEmail.trim(),
          phone: authPhone.trim(),
          city: authCity.trim() || 'Hyderabad',
          password: authPassword.trim() || 'Partner@2026'
        });
        if (!res.success) {
          setAuthError(res.error || (lang === 'en' ? 'Registration failed.' : 'రిజిస్ట్రేషన్ విఫలమైంది.'));
        } else {
          setShowAuthModal(false);
        }
      } else {
        if (!authEmail.trim()) {
          setAuthError(
            lang === 'en'
              ? 'Please enter your email address or mobile number.'
              : 'దయచేసి మీ ఈమెయిల్ లేదా మొబైల్ నంబర్‌ను నమోదు చేయండి.'
          );
          return;
        }
        const res = login(authEmail.trim(), authPassword.trim() || 'Partner@2026', undefined, undefined, 'affiliate');
        if (!res.success) {
          setAuthError(
            res.error ||
              (lang === 'en'
                ? 'Invalid credentials. If you are new, please switch to Create Account.'
                : 'వివరాలు సరైనవి కావు. మీరు కొత్తవారైతే దయచేసి ఖాతా తెరవండి.')
          );
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
      `Hello! If you or anyone in your family needs a health checkup or diagnostic test, check out this verified package: ${serviceName}. Book with partner benefits: https://sbloom.ottobon.in`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Affiliate FAQs
  const affiliateFaqs = [
    {
      q: lang === 'en' ? 'How do I get paid?' : 'నాకు నగదు చెల్లింపులు ఎలా అందుతాయి?',
      a:
        lang === 'en'
          ? 'Your rewards are transferred directly to your Google Pay, PhonePe, Paytm, or Bank Account via instant UPI transfer once the clinic confirms the test or service.'
          : 'మీ స్నేహితుడు లేదా బంధువు క్లినిక్ సందర్శించి పరీక్ష చేయించుకున్న వెంటనే, మీ నగదు నేరుగా మీ Google Pay, PhonePe లేదా బ్యాంక్ అకౌంట్ కి UPI ద్వారా పంపబడుతుంది.'
    },
    {
      q: lang === 'en' ? 'Do I need to pay any fee or investment?' : 'నేను ఏదైనా పెట్టుబడి లేదా ఫీజు చెల్లించాలా?',
      a:
        lang === 'en'
          ? 'Zero. It is 100% free to join and recommend services. There is no registration fee, no investment, and zero financial risk.'
          : 'ఎలాంటి ఫీజు లేదు. ఇది 100% ఉచితం. రిజిస్ట్రేషన్ ఫీజు లేదా ఎలాంటి ముందస్తు పెట్టుబడి అవసరం లేదు.'
    },
    {
      q: lang === 'en' ? 'Who provides the medical services?' : 'వైద్య సేవలను ఎవరు అందిస్తారు?',
      a:
        lang === 'en'
          ? 'All medical and diagnostic services are fulfilled directly by licensed partner labs, clinics, and healthcare centers operating under formal commercial MoUs.'
          : 'అన్ని వైద్య పరీక్షలు మరియు ల్యాబ్ సేవలు లైసెన్స్ పొందిన అధికారిక భాగస్వామ్య ల్యాబ్‌లు మరియు క్లినిక్‌ల ద్వారా నేరుగా నిర్వహించబడతాయి.'
    },
    {
      q: lang === 'en' ? 'How does the clinic know I referred the person?' : 'నేనే రిఫర్ చేశానని క్లినిక్ వారికి ఎలా తెలుస్తుంది?',
      a:
        lang === 'en'
          ? 'Every referral you submit creates a verified tracking record tagged with your unique partner identifier and UPI details. You also receive real-time updates.'
          : 'మీరు సమర్పించిన ప్రతి రిఫరల్‌కు ఒక ప్రత్యేక ట్రాకింగ్ కోడ్ ఉంటుంది, దీని ద్వారా మీ పేరు మరియు UPI వివరాలు ఆటోమేటిక్‌గా జతచేయబడతాయి.'
    },
    {
      q: lang === 'en' ? 'Can I refer companies or corporate wellness checkups?' : 'నేను కంపెనీలు లేదా కార్పొరేట్ చెకప్‌లను రిఫర్ చేయవచ్చా?',
      a:
        lang === 'en'
          ? 'Yes! You can refer company employee health packages, executive panels, and corporate camps, which earn significantly higher cash rewards (up to ₹5,000+ per deal).'
          : 'తప్పకుండా! కంపెనీ హెల్త్ చెకప్‌లు లేదా ఉద్యోగుల వెల్నెస్ ప్యాకేజీలను కూడా రిఫర్ చేయవచ్చు, వీటిపై అధిక మొత్తంలో నగదు బహుమతులు (ఒక్కో డీల్‌కు ₹5,000 వరకు) లభిస్తాయి.'
    }
  ];

  return (
    <div className="b2b-landing">
      {/* =========================================================================
          1. CLEAN ENTERPRISE B2B NAVIGATION (MATCHING PROVIDER LANDING)
          ========================================================================= */}
      <nav className="b2b-nav">
        <div className="b2b-nav-inner">
          {/* sBLOOM Brand Logo */}
          <div className="nav-brand-group">
            <div className="nav-logo-box">
              <img src="/sbloom-logo.jpg" alt="sBLOOM" className="nav-logo-img" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="nav-brand-badge">by Ottobon</span>
              </div>
              <span
                className="nav-subtext-hide"
                style={{ fontSize: '0.72rem', color: '#94A3B8', letterSpacing: '0.02em', display: 'block' }}
              >
                Community Referral Network
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <div
            className="desktop-nav-links"
            style={{ alignItems: 'center', gap: '28px', fontSize: '0.88rem', fontWeight: 600, color: '#CBD5E1' }}
          >
            <a href="#how" style={{ color: '#E2E8F0', textDecoration: 'none' }}>
              {lang === 'en' ? 'How It Works' : 'ఎలా పనిచేస్తుంది'}
            </a>
            <a href="#calculator" style={{ color: '#E2E8F0', textDecoration: 'none' }}>
              {lang === 'en' ? 'Earnings Calculator' : 'ఆదాయ అంచనా'}
            </a>
            <a href="#deals" style={{ color: '#E2E8F0', textDecoration: 'none' }}>
              {lang === 'en' ? 'Verified Packages' : 'ఆఫర్లు & ప్యాకేజీలు'}
            </a>
            <a href="#benefits" style={{ color: '#E2E8F0', textDecoration: 'none' }}>
              {lang === 'en' ? 'Why Partner' : 'లాభాలు'}
            </a>
            <a href="#faq" style={{ color: '#E2E8F0', textDecoration: 'none' }}>
              FAQ
            </a>
          </div>

          {/* Actions: Language Switcher + Log In + For Providers */}
          <div className="b2b-nav-actions">
            {/* Language Switcher */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '2px',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                flexShrink: 0
              }}
            >
              <button
                type="button"
                onClick={() => setLang('en')}
                style={{
                  backgroundColor: lang === 'en' ? '#FFFFFF' : 'transparent',
                  color: lang === 'en' ? '#0A2540' : '#CBD5E1',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('te')}
                style={{
                  backgroundColor: lang === 'te' ? '#FFFFFF' : 'transparent',
                  color: lang === 'te' ? '#0A2540' : '#CBD5E1',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                తెలుగు
              </button>
            </div>

            {/* Partner Sign In */}
            <button
              onClick={() => openStandardAuth('login')}
              className="nav-btn-signin"
            >
              <span>{lang === 'en' ? 'Sign In' : 'లాగిన్'}</span>
            </button>

            {/* Quick Refer CTA (Desktop only to prevent mobile header collision) */}
            <button
              onClick={() => promptAuthToRefer()}
              className="nav-btn-cta desktop-only-btn"
            >
              <span>{lang === 'en' ? 'Refer Friend' : 'రిఫర్ చేయండి'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </nav>

      {/* =========================================================================
          2. HERO SECTION WITH INTERACTIVE WATER RIPPLES (IDENTICAL TO PROVIDER PAGE)
          ========================================================================= */}
      <section className="b2b-hero-banner">
        {/* Real-time Interactive Liquid Surface & Water Ripples */}
        <WaterBackground />

        <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            {/* Pill Badge */}
            <div className="hero-pill-badge">
              <Sparkles size={14} color="#F59E0B" />
              <span>
                {lang === 'en'
                  ? 'Zero Investment • Direct UPI Payouts • Official MoU Backed'
                  : 'ఎలాంటి పెట్టుబడి అవసరం లేదు • నేరుగా మీ UPI కి నగదు • అధికారిక భాగస్వామ్యం'}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="hero-heading">
              {lang === 'en' ? (
                <>
                  Help a friend, <br className="desktop-break" />
                  <span style={{ color: '#FCD34D' }}>earn your share.</span>
                </>
              ) : (
                <>
                  స్నేహితుడికి సహాయం చేయండి, <br className="desktop-break" />
                  <span style={{ color: '#FCD34D' }}>మీ సంపాదన పొందండి.</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle">
              {lang === 'en'
                ? 'Recommend verified health checkups and diagnostic tests to friends. Earn direct cash on every completed booking.'
                : 'మీ బంధుమిత్రులకు నమ్మకమైన వైద్య సేవలను సిఫార్సు చేయండి. ప్రతి బుకింగ్‌పై నేరుగా నగదు పొందండి.'}
            </p>

            {/* Hero CTAs */}
            <div className="hero-cta-group">
              <button
                onClick={() => promptAuthToRefer()}
                className="hero-primary-btn"
              >
                <span>{lang === 'en' ? 'Refer a Friend & Earn Cash' : 'స్నేహితుడిని రిఫర్ చేసి సంపాదించండి'}</span>
                <ArrowRight size={16} />
              </button>

              <a href="#calculator" className="hero-secondary-btn">
                <Coins size={16} color="#FEF3C7" style={{ marginRight: '6px' }} />
                <span>{lang === 'en' ? 'Calculate Your Earnings' : 'ఆదాయ అంచనా చూడండి'}</span>
              </a>
            </div>

            {/* Hero Value & Trust Bar */}
            <div className="hero-trust-bar">
              <div className="hero-trust-item">
                <span className="hero-trust-val">₹500 - ₹5,000</span>
                <span className="hero-trust-lbl">{lang === 'en' ? 'Cash Per Referral' : 'ప్రతి రిఫరల్‌కు'}</span>
              </div>
              <div className="hero-trust-sep" />
              <div className="hero-trust-item">
                <span className="hero-trust-val">Direct UPI</span>
                <span className="hero-trust-lbl">{lang === 'en' ? 'GPay / PhonePe / Paytm' : 'నేరుగా అకౌంట్‌కు'}</span>
              </div>
              <div className="hero-trust-sep" />
              <div className="hero-trust-item">
                <span className="hero-trust-val">100% Free</span>
                <span className="hero-trust-lbl">{lang === 'en' ? 'No Investment Ever' : 'ఎలాంటి ఖర్చు లేదు'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. HOW IT WORKS (3 SIMPLE STEPS)
          ========================================================================= */}
      <section id="how" className="landing-section">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
          <h2 className="section-title">
            {lang === 'en' ? 'How You Earn Cash in 3 Simple Steps' : 'కేవలం 3 సులభమైన దశల్లో సంపాదన'}
          </h2>
          <p className="section-subtitle">
            {lang === 'en'
              ? 'No complicated registration. No training needed. Start earning immediately.'
              : 'ఎలాంటి సంక్లిష్టత లేకుండా మీ స్నేహితులకు సహాయం చేస్తూ వెంటనే సంపాదించండి.'}
          </p>
        </div>

        <div className="landing-grid-cards">
          {/* Step 1 */}
          <div className="b2b-card" style={{ padding: '28px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#0A2540',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                marginBottom: '18px'
              }}
            >
              1
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
              {lang === 'en' ? 'Choose a Verified Package' : 'సేవను లేదా ప్యాకేజీని ఎంచుకోండి'}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.55 }}>
              {lang === 'en'
                ? 'Pick from verified diagnostic tests, full body checkups, or healthcare scans from accredited partner labs.'
                : 'అత్యుత్తమ ల్యాబ్‌ల నుండి నాణ్యమైన హెల్త్ చెకప్‌లు మరియు బ్లడ్ టెస్టులను ఎంచుకోండి.'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="b2b-card" style={{ padding: '28px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#0A2540',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                marginBottom: '18px'
              }}
            >
              2
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
              {lang === 'en' ? 'Share with Your Friend' : 'స్నేహితుడికి వాట్సాప్ లేదా లింక్ పంపండి'}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.55 }}>
              {lang === 'en'
                ? 'Send a 1-click WhatsApp message or enter their details. Our partner clinics handle booking and sample pickup.'
                : 'వాట్సాప్ ద్వారా 1-క్లిక్‌తో సమాచారం పంపండి లేదా వారి వివరాలను నమోదు చేయండి.'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="b2b-card" style={{ padding: '28px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#0A2540',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                marginBottom: '18px'
              }}
            >
              3
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
              {lang === 'en' ? 'Get Direct Cash into UPI' : 'నేరుగా మీ UPI కి నగదు అందుకోండి'}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.55 }}>
              {lang === 'en'
                ? 'Once the checkup is complete, cash is transferred directly to your PhonePe, Google Pay, or Bank account!'
                : 'సేవ పూర్తయిన వెంటనే మీ నగదు నేరుగా మీ PhonePe లేదా Google Pay కి చేరుతుంది!'}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. INTERACTIVE CASH EARNINGS CALCULATOR
          ========================================================================= */}
      <section id="calculator" className="landing-section" style={{ paddingTop: 0 }}>
        <div
          className="cta-callout-card"
          style={{
            margin: 0,
            background: 'linear-gradient(135deg, #061325 0%, #0A2540 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '40px 32px'
          }}
        >
          <div style={{ flex: '1 1 360px', maxWidth: '580px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(245, 158, 11, 0.16)',
                color: '#FEF3C7',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                marginBottom: '14px',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}
            >
              <Calculator size={14} color="#F59E0B" />
              <span>{lang === 'en' ? 'ESTIMATE YOUR MONTHLY CASH' : 'మీ నెలవారీ ఆదాయ అంచనా'}</span>
            </div>

            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)', fontWeight: 800, color: '#FFFFFF', margin: '0 0 10px', lineHeight: 1.25 }}>
              {lang === 'en' ? 'How many friends can you help this month?' : 'ఈ నెలలో మీరు ఎంతమంది స్నేహితులకు సహాయం చేయగలరు?'}
            </h2>

            <p style={{ fontSize: '0.92rem', color: '#94A3B8', margin: '0 0 24px', lineHeight: 1.6 }}>
              {lang === 'en'
                ? 'Select a number below to see your potential cash rewards sent straight to your UPI account.'
                : 'క్రింద సంఖ్యను ఎంచుకుని మీ సంపాదనను పరిశీలించండి. నగదు నేరుగా మీ UPI కి చేరుతుంది.'}
            </p>

            {/* Quick Select Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[2, 5, 10, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFriendsCount(num)}
                  style={{
                    backgroundColor: friendsCount === num ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
                    color: friendsCount === num ? '#0A2540' : '#FFFFFF',
                    border: '1px solid ' + (friendsCount === num ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)'),
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '0.92rem',
                    fontWeight: 700,
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
              borderRadius: '12px',
              padding: '28px 24px',
              color: '#0A2540',
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              minWidth: '260px'
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {lang === 'en' ? 'Estimated Cash Earnings' : 'మీ అంచనా సంపాదన'}
            </div>
            <div
              style={{
                fontSize: 'clamp(2.4rem, 4vw, 3.2rem)',
                fontWeight: 900,
                color: '#0E8A5E',
                margin: '8px 0 4px',
                letterSpacing: '-0.02em'
              }}
            >
              ₹{totalMonthlyEarnings.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#B45309', marginBottom: '18px' }}>
              {lang === 'en'
                ? `Based on ~₹${avgEarningsPerFriend} cash per completed checkup`
                : `ప్రతి క్లినిక్ సందర్శనకు ~₹${avgEarningsPerFriend} నగదు లెక్కింపు`}
            </div>

            <button
              onClick={() => promptAuthToRefer()}
              className="hero-primary-btn"
              style={{ width: '100%', padding: '12px 18px', fontSize: '0.92rem', backgroundColor: '#0A2540', color: '#FFFFFF' }}
            >
              <span>{lang === 'en' ? 'Start Earning Cash Now' : 'ఇప్పుడే ప్రారంభించండి'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. VERIFIED DIAGNOSTIC PACKAGES
          ========================================================================= */}
      <section id="deals" className="landing-section" style={{ backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '36px' }}>
          <div>
            <span className="b2b-badge" style={{ marginBottom: '8px' }}>
              {lang === 'en' ? 'Verified Marketplace Packages' : 'అధికారిక హెల్త్ ప్యాకేజీలు'}
            </span>
            <h2 className="section-title">
              {lang === 'en' ? 'Featured Healthcare Deals' : 'ప్రముఖ డయాగ్నస్టిక్ ప్యాకేజీలు'}
            </h2>
          </div>
          <div style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: 500 }}>
            {lang === 'en' ? 'Fulfilled by Licensed Partner Clinics & Accredited Labs' : 'అధికారిక ల్యాబ్‌లు మరియు భాగస్వామ్య క్లినిక్‌ల ద్వారా'}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="landing-grid-cards">
          {/* Package 1 */}
          <div className="b2b-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#B45309', backgroundColor: '#FEF3C7', padding: '3px 8px', borderRadius: '4px' }}>
                  Full Body Panel
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0E8A5E' }}>
                  Accredited Pathology Lab
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2540', margin: '0 0 8px' }}>
                Comprehensive Master Health Checkup
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '0 0 16px', lineHeight: 1.5 }}>
                84 vital parameters: Complete Blood Count, Liver, Kidney, Lipid Profile, Thyroid, and Urine analysis.
              </p>
            </div>

            <div>
              <div
                style={{
                  backgroundColor: '#E6F7F0',
                  border: '1px solid #A3E6CD',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#0E8A5E', fontWeight: 600 }}>Client Price</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0A2540' }}>₹2,500</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#0E8A5E', fontWeight: 700 }}>YOU EARN CASH</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0E8A5E' }}>₹500</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => promptAuthToRefer('Comprehensive Master Health Checkup (84 Tests)')}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, padding: '10px 12px' }}
                >
                  {lang === 'en' ? 'Refer Friend' : 'రిఫర్ చేయండి'}
                </button>
                <button
                  type="button"
                  onClick={() => shareOnWhatsApp('Comprehensive Master Health Checkup (84 Tests)', '₹500')}
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
                  title="Share on WhatsApp"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Package 2 */}
          <div className="b2b-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#C2410C', backgroundColor: '#FFEDD5', padding: '3px 8px', borderRadius: '4px' }}>
                  Cardiac & Diabetes
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0E8A5E' }}>
                  Premier Cardiology Clinic
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2540', margin: '0 0 8px' }}>
                Heart & Diabetes Master Screening
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '0 0 16px', lineHeight: 1.5 }}>
                ECG, HbA1c, Fasting Blood Sugar, Cardiac Risk Profile & detailed physician pathology report.
              </p>
            </div>

            <div>
              <div
                style={{
                  backgroundColor: '#E6F7F0',
                  border: '1px solid #A3E6CD',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#0E8A5E', fontWeight: 600 }}>Client Price</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0A2540' }}>₹1,800</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#0E8A5E', fontWeight: 700 }}>YOU EARN CASH</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0E8A5E' }}>₹360</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => promptAuthToRefer('Heart & Diabetes Master Screening')}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, padding: '10px 12px' }}
                >
                  {lang === 'en' ? 'Refer Friend' : 'రిఫర్ చేయండి'}
                </button>
                <button
                  type="button"
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
                  title="Share on WhatsApp"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Package 3 */}
          <div className="b2b-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0369A1', backgroundColor: '#E0F2FE', padding: '3px 8px', borderRadius: '4px' }}>
                  Advanced Radiology
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0E8A5E' }}>
                  Advanced Imaging Center
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2540', margin: '0 0 8px' }}>
                MRI / CT / Ultrasound Imaging
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '0 0 16px', lineHeight: 1.5 }}>
                High-resolution imaging & radiologist consultation for brain, spine, joints, and abdominal scans.
              </p>
            </div>

            <div>
              <div
                style={{
                  backgroundColor: '#E6F7F0',
                  border: '1px solid #A3E6CD',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#0E8A5E', fontWeight: 600 }}>Client Price</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0A2540' }}>₹5,000</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#0E8A5E', fontWeight: 700 }}>YOU EARN CASH</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0E8A5E' }}>₹1,000</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => promptAuthToRefer('MRI / CT / Ultrasound Imaging')}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, padding: '10px 12px' }}
                >
                  {lang === 'en' ? 'Refer Friend' : 'రిఫర్ చేయండి'}
                </button>
                <button
                  type="button"
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
                  title="Share on WhatsApp"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. WHY PARTNER WITH US (BENEFITS & TRUST)
          ========================================================================= */}
      <section id="benefits" className="landing-section">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
          <span className="b2b-badge" style={{ marginBottom: '10px' }}>
            {lang === 'en' ? 'Transparent & Verified' : 'పూర్తి పారదర్శకత'}
          </span>
          <h2 className="section-title">
            {lang === 'en' ? 'Why Thousands Recommend Through sBLOOM' : 'sBLOOM ద్వారా ఎందుకు సిఫార్సు చేయాలి?'}
          </h2>
          <p className="section-subtitle" style={{ marginTop: '8px' }}>
            {lang === 'en'
              ? 'Real clinics. Real payments. Backed by verified commercial agreements.'
              : 'నిజమైన క్లినిక్‌లు, తక్షణ నగదు బదిలీలు, చట్టబద్ధమైన ఒప్పందాలు.'}
          </p>
        </div>

        <div className="landing-grid-cards">
          {/* Benefit 1 */}
          <div className="b2b-card" style={{ padding: '28px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#E6F7F0',
                color: '#0E8A5E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}
            >
              <Wallet size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
              {lang === 'en' ? 'Direct UPI Disbursal' : 'నేరుగా మీ UPI కి నగదు'}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.55 }}>
              {lang === 'en'
                ? 'No waiting for weeks. Once the diagnostic package is fulfilled, your cash reward is transferred via Google Pay, PhonePe, or Bank.'
                : 'ఎలాంటి ఆలస్యం లేకుండా, పరీక్ష పూర్తయిన వెంటనే మీ నగదు నేరుగా మీ PhonePe లేదా Google Pay కి చేరుతుంది.'}
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="b2b-card" style={{ padding: '28px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#EBF3FF',
                color: '#0052CC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
              {lang === 'en' ? 'Signed Bilateral MoUs' : 'అధికారిక ల్యాబ్ ఒప్పందాలు'}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.55 }}>
              {lang === 'en'
                ? 'All clinics on the platform operate under signed commercial agreements, ensuring standard patient pricing and reliable reward payouts.'
                : 'అన్ని క్లినిక్‌లు సంతకం చేసిన భాగస్వామ్య ఒప్పందాలతో పనిచేస్తాయి, తద్వారా రోగులకు నాణ్యమైన సేవలు మరియు మీకు సరైన బహుమతి లభిస్తాయి.'}
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="b2b-card" style={{ padding: '28px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#FEF3C7',
                color: '#B45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}
            >
              <PhoneCall size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
              {lang === 'en' ? 'Customer Privacy Protection' : 'గోప్యత మరియు రక్షణ'}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.55 }}>
              {lang === 'en'
                ? 'Customer numbers are masked and protected. Clinics only contact the patient for appointment confirmation and home sample pickup.'
                : 'రోగుల ఫోన్ నంబర్లు భద్రపరచబడతాయి. కేవలం అపాయింట్‌మెంట్ మరియు నమూనా సేకరణ కోసం మాత్రమే క్లినిక్ వారు కాల్ చేస్తారు.'}
            </p>
          </div>
        </div>

        {/* Callout Card */}
        <div className="cta-callout-card">
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px' }}>
              {lang === 'en'
                ? 'Ready to start earning cash by recommending trusted clinics?'
                : 'నమ్మకమైన క్లినిక్లను సిఫార్సు చేస్తూ వెంటనే సంపాదించాలనుకుంటున్నారా?'}
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.92rem', maxWidth: '600px' }}>
              {lang === 'en'
                ? 'Help your circle find genuine healthcare packages in Hyderabad while earning cash on every single visit.'
                : 'హైదరాబాద్‌లో మీ బంధుమిత్రులకు సరైన వైద్య సేవలను అందిస్తూ ప్రతి పరీక్షపై నగదు బహుమతులు అందుకోండి.'}
            </p>
          </div>
          <button
            onClick={() => promptAuthToRefer()}
            className="hero-primary-btn"
            style={{ padding: '12px 24px', fontSize: '0.92rem' }}
          >
            <span>{lang === 'en' ? 'Refer a Friend Now' : 'ఇప్పుడే రిఫర్ చేయండి'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* =========================================================================
          7. HONEST, CLEAN FAQ ACCORDION (MATCHING PROVIDER LANDING)
          ========================================================================= */}
      <section id="faq" className="landing-section" style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0A2540', letterSpacing: '-0.02em' }}>
            {lang === 'en' ? 'Frequently Asked Questions' : 'తరచుగా అడిగే ప్రశ్నలు'}
          </h2>
          <p style={{ color: '#64748B', marginTop: '6px', fontSize: '0.94rem' }}>
            {lang === 'en'
              ? 'Everything you need to know about referring friends and receiving cash rewards.'
              : 'రిఫరల్స్ మరియు నగదు చెల్లింపుల గురించిన పూర్తి సమాచారం.'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {affiliateFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="b2b-card"
              style={{ overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div
                style={{
                  padding: '18px 22px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <span style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0A2540' }}>{faq.q}</span>
                {openFaq === idx ? <ChevronUp size={18} color="#64748B" /> : <ChevronDown size={18} color="#64748B" />}
              </div>
              {openFaq === idx && (
                <div style={{ padding: '0 22px 20px', color: '#64748B', fontSize: '0.88rem', lineHeight: 1.6, borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          8. CLEAN ENTERPRISE FOOTER
          ========================================================================= */}
      <footer
        style={{
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#061325',
          padding: '40px 20px',
          color: '#94A3B8',
          fontSize: '0.86rem'
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
            <div style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '4px' }}>
              sBLOOM by Ottobon
            </div>
            <div>Community Health & Business Referral Marketplace &bull; Hyderabad, India</div>
          </div>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="/provider" style={{ color: '#FCD34D', fontWeight: 700, textDecoration: 'none' }}>
              {lang === 'en' ? 'Provider Portal (For Clinics)' : 'క్లినిక్‌ల కొరకు'}
            </a>
            <a href="/admin" style={{ color: '#CBD5E1', fontWeight: 600, textDecoration: 'none' }}>
              Admin Operations
            </a>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MANDATORY AUTH MODAL: CREATE ACCOUNT OR SIGN IN BEFORE REFERRAL
          ========================================================================= */}
      {showAuthModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(6, 19, 37, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div
            className="b2b-card"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '30px 26px',
              boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
              position: 'relative',
              backgroundColor: '#FFFFFF',
              maxHeight: '92vh',
              overflowY: 'auto'
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
                color: '#64748B',
                cursor: 'pointer',
                padding: '4px'
              }}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Contextual Banner: Why Auth is Required to Refer */}
            {authContextMessage && (
              <div
                style={{
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '18px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: '#DBEAFE',
                    color: '#1D4ED8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <HeartHandshake size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1E40AF', marginBottom: '3px' }}>
                    {authContextMessage.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#1E3A8A', lineHeight: 1.45 }}>
                    {authContextMessage.subtitle}
                  </div>
                  {authContextMessage.serviceTitle && (
                    <div
                      style={{
                        marginTop: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#0369A1',
                        backgroundColor: '#E0F2FE',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      <span>Package:</span>
                      <span>{authContextMessage.serviceTitle}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode Switch Tabs: Create Account vs Sign In */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError(null);
                }}
                style={{
                  flex: 1,
                  backgroundColor: authMode === 'signup' ? '#0A2540' : '#F1F5F9',
                  color: authMode === 'signup' ? '#FFFFFF' : '#64748B',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {lang === 'en' ? 'Create Account' : 'కొత్త ఖాతా'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                }}
                style={{
                  flex: 1,
                  backgroundColor: authMode === 'login' ? '#0A2540' : '#F1F5F9',
                  color: authMode === 'login' ? '#FFFFFF' : '#64748B',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {lang === 'en' ? 'Sign In' : 'లాగిన్'}
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {authError && (
                <div
                  style={{
                    backgroundColor: '#FEE2E2',
                    color: '#B91C1C',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{authError}</span>
                </div>
              )}

              {authMode === 'signup' && (
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>
                    {lang === 'en' ? 'Full Name' : 'పూర్తి పేరు'} <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. Ramesh Kumar' : 'ఉదా. రమేష్ కుమార్'}
                    className="form-input"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem' }}>
                  {authMode === 'signup'
                    ? lang === 'en'
                      ? 'Email Address'
                      : 'ఈమెయిల్ చిరునామా'
                    : lang === 'en'
                    ? 'Email Address or 10-digit Mobile Number'
                    : 'ఈమెయిల్ లేదా 10 అంకెల మొబైల్ నంబర్'}{' '}
                  <span className="required">*</span>
                </label>
                <input
                  type={authMode === 'signup' ? 'email' : 'text'}
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder={
                    authMode === 'signup'
                      ? 'ramesh@example.com'
                      : lang === 'en'
                      ? 'Email or 10-digit mobile number'
                      : 'ఈమెయిల్ లేదా మొబైల్ నంబర్'
                  }
                  className="form-input"
                />
              </div>

              {authMode === 'signup' && (
                <>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>
                      {lang === 'en' ? 'Mobile Number' : 'మొబైల్ నంబర్'} <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>
                      {lang === 'en' ? 'Your Operating City / Area' : 'మీ నగరం / ప్రాంతం'} <span className="required">*</span>
                    </label>
                    <select
                      value={authCity}
                      onChange={(e) => setAuthCity(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.86rem', padding: '10px 12px' }}
                    >
                      <option value="Hyderabad">Hyderabad (హైదరాబాద్)</option>
                      <option value="Visakhapatnam (Vizag)">Visakhapatnam / Vizag (విశాఖపట్నం)</option>
                      <option value="Vijayawada">Vijayawada (విజయవాడ)</option>
                      <option value="Secunderabad">Secunderabad (సికింద్రాబాద్)</option>
                      <option value="Warangal">Warangal (వరంగల్)</option>
                      <option value="Guntur">Guntur (గుంటూరు)</option>
                      <option value="Tirupati">Tirupati (తిరుపతి)</option>
                      <option value="Bangalore">Bangalore (బెంగళూరు)</option>
                    </select>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: '3px' }}>
                      {lang === 'en'
                        ? 'Accredited healthcare and education partners in your area will be prioritized for you.'
                        : 'మీ ప్రాంతంలోని ఆమోదిత ఆసుపత్రులు మరియు విద్యా సంస్థలు మీకు ప్రాధాన్యతగా కనిపిస్తాయి.'}
                    </span>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem' }}>
                  {lang === 'en' ? 'Password' : 'పాస్‌వర్డ్'} <span className="required">*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showAuthPassword ? 'text' : 'password'}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder={
                      authMode === 'signup'
                        ? lang === 'en'
                          ? 'Create a secure password'
                          : 'పాస్‌వర్డ్ సృష్టించండి'
                        : lang === 'en'
                        ? 'Enter your password'
                        : 'పాస్‌వర్డ్ నమోదు చేయండి'
                    }
                    required
                    className="form-input"
                    style={{ width: '100%', paddingRight: '40px' }}
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
                      color: showAuthPassword ? '#0052CC' : '#64748B',
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

              <button
                type="submit"
                disabled={authLoading}
                className="btn btn-primary"
                style={{ padding: '12px', fontSize: '0.94rem', marginTop: '6px' }}
              >
                {authLoading
                  ? lang === 'en'
                    ? 'Processing...'
                    : 'ప్రాసెస్ అవుతోంది...'
                  : authContextMessage
                  ? authMode === 'signup'
                    ? lang === 'en'
                      ? 'Create Account & Continue to Referral'
                      : 'ఖాతా సృష్టించి రిఫర్ చేయండి'
                    : lang === 'en'
                    ? 'Sign In & Continue to Referral'
                    : 'లాగిన్ అయ్యి రిఫర్ చేయండి'
                  : authMode === 'signup'
                  ? lang === 'en'
                    ? 'Create Free Partner Account'
                    : 'ఉచిత ఖాతా తెరవండి'
                  : lang === 'en'
                  ? 'Sign In'
                  : 'లాగిన్'}
              </button>

              {/* Bottom Switch Link */}
              <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.84rem', color: '#64748B' }}>
                {authMode === 'signup' ? (
                  <>
                    <span>{lang === 'en' ? 'Already have an account?' : 'ఇప్పటికే ఖాతా ఉందా?'} </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError(null);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0052CC',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      {lang === 'en' ? 'Sign In' : 'లాగిన్ అవ్వండి'}
                    </button>
                  </>
                ) : (
                  <>
                    <span>{lang === 'en' ? "Don't have an account yet?" : 'ఇంకా ఖాతా లేదా?'} </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setAuthError(null);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0052CC',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      {lang === 'en' ? 'Create Account' : 'కొత్త ఖాతా తెరవండి'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
