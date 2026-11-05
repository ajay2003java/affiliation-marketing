import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, Mail, ArrowRight, Building2, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const ProviderLogin: React.FC = () => {
  const { login, showNotification } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your business / provider email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = login(cleanEmail, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials. Please verify your email and password.');
      } else {
        showNotification('Signed into Provider Portal successfully!', 'success');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        padding: '24px 16px',
        color: '#F8FAFC',
        fontFamily: 'Inter, -apple-system, sans-serif'
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#000000',
            padding: '8px 18px',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            marginBottom: '14px'
          }}
        >
          <img
            src="/sbloom-logo.jpg"
            alt="sBLOOM"
            style={{ height: '36px', width: 'auto', display: 'block', objectFit: 'contain' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#F59E0B',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              letterSpacing: '0.05em'
            }}
          >
            BY OTTOBON
          </span>
          <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 500 }}>
            Healthcare & Commercial Network
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', margin: '4px 0 6px' }}>
          Provider Partner Portal
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', maxWidth: '420px', margin: '0 auto' }}>
          Sign in to manage your clinic service packages, pricing, rate card, and patient referrals.
        </p>
      </div>

      {/* Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#1E293B',
          borderRadius: '16px',
          border: '1px solid #334155',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          padding: '32px 28px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60A5FA'
            }}
          >
            <Building2 size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#FFFFFF' }}>
              Service Provider Login
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Verified Bilateral Partner Access
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#FCA5A5',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#CBD5E1',
                marginBottom: '6px'
              }}
            >
              Registered Business Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748B'
                }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. dhanvikadiagnostics@gmail.com"
                style={{
                  width: '100%',
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '10px 12px 10px 38px',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#CBD5E1'
                }}
              >
                Password
              </label>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Assigned in onboarding message
              </span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  color: '#94A3B8',
                  pointerEvents: 'none'
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  backgroundColor: '#0F172A',
                  border: '1.5px solid #334155',
                  borderRadius: '8px',
                  padding: '11px 44px 11px 38px',
                  color: '#FFFFFF',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: showPassword ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                  border: showPassword ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                {showPassword ? <EyeOff size={18} color="#FBBF24" /> : <Eye size={18} color="#94A3B8" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.92rem',
              padding: '12px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '6px',
              transition: 'background-color 0.15s ease',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Provider Portal'}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick fill helper for Dhanvika Diagnostics */}
        <div
          style={{
            marginTop: '22px',
            paddingTop: '16px',
            borderTop: '1px solid #334155',
            fontSize: '0.78rem',
            color: '#94A3B8'
          }}
        >
          <div style={{ marginBottom: '8px', fontWeight: 600, color: '#CBD5E1' }}>
            Active Onboarded Provider:
          </div>
          <button
            type="button"
            onClick={() => handleQuickFill('dhanvikadiagnostics@gmail.com', 'Partner@2026')}
            style={{
              width: '100%',
              backgroundColor: 'rgba(51, 65, 85, 0.4)',
              border: '1px solid #475569',
              borderRadius: '6px',
              padding: '8px 10px',
              color: '#E2E8F0',
              fontSize: '0.78rem',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>
              <strong>Dhanvika Diagnostics:</strong> dhanvikadiagnostics@gmail.com
            </span>
            <span style={{ color: '#60A5FA', fontWeight: 600 }}>Fill</span>
          </button>
        </div>
      </div>

      {/* Footer Navigation */}
      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.82rem', color: '#94A3B8' }}>
        <span>Not a service provider? </span>
        <a
          href="/"
          style={{ color: '#F59E0B', textDecoration: 'none', fontWeight: 600 }}
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/';
          }}
        >
          Go to Affiliate Referral Network &rarr;
        </a>
      </div>
    </div>
  );
};

