import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Mail, ArrowRight, Building2, Eye, EyeOff, AlertCircle, X } from 'lucide-react';

export interface ProviderLoginProps {
  isModal?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const ProviderLogin: React.FC<ProviderLoginProps> = ({ isModal = false, onClose, onSuccess }) => {
  const { login, showNotification } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isModal || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModal, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your business email or registered mobile number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = login(cleanEmail, password, undefined, undefined, 'provider');
      if (!res.success) {
        setError(res.error || 'Invalid credentials. Please verify your email and password.');
      } else {
        showNotification('Signed into Provider Portal successfully!', 'success');
        onSuccess?.();
      }
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div
      style={{
        width: '100%',
        maxWidth: '460px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Close Button */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Close login dialog"
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            backgroundColor: '#1E293B',
            color: '#94A3B8',
            border: '1px solid #334155',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.borderColor = '#64748B';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94A3B8';
            e.currentTarget.style.borderColor = '#334155';
          }}
        >
          <X size={20} />
        </button>
      )}

      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
        <p style={{ fontSize: '0.88rem', color: '#94A3B8', maxWidth: '420px', margin: '0 auto', lineHeight: 1.4 }}>
          Sign in to manage your clinic service packages, pricing, rate card, and patient referrals.
        </p>
      </div>

      {/* Login Card */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#1E293B',
          borderRadius: '16px',
          border: '1px solid #334155',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          padding: '28px 24px'
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
              Registered Business Email or Mobile Number
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
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. abc@gmail.com or 9876543210"
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
      </div>

      {/* Footer Navigation */}
      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.82rem', color: '#94A3B8' }}>
        <span>Not a service provider? </span>
        <a
          href="/"
          style={{ color: '#F59E0B', textDecoration: 'none', fontWeight: 600 }}
          onClick={(e) => {
            e.preventDefault();
            if (isModal && onClose) onClose();
            window.location.href = '/';
          }}
        >
          Go to Affiliate Referral Network &rarr;
        </a>
      </div>
    </div>
  );

  if (isModal) {
    return (
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
          padding: '24px 16px',
          overflowY: 'auto'
        }}
        onClick={onClose}
      >
        {content}
      </div>
    );
  }

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
      {content}
    </div>
  );
};

