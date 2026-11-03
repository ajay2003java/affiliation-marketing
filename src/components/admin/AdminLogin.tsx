import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, Mail, ArrowRight, ShieldAlert, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
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
      setError('Please enter your staff email address.');
      return;
    }
    if (!password) {
      setError('Please enter your administrative password.');
      return;
    }

    setLoading(true);
    try {
      const res = login(cleanEmail, password);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please verify your admin credentials.');
      } else {
        showNotification('Authenticated as Ottobon Staff Lead. Admin Desk unlocked.', 'success');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #090D16 0%, #0F172A 50%, #090D16 100%)',
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
            border: '1px solid rgba(220, 38, 38, 0.4)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
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
              color: '#EF4444',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              letterSpacing: '0.05em'
            }}
          >
            INTERNAL GOVERNANCE
          </span>
          <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 500 }}>
            Executive Operations Desk
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', margin: '4px 0 6px' }}>
          Ottobon Staff Administration
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', maxWidth: '420px', margin: '0 auto' }}>
          Authorized staff personnel only. Strict role-based authentication required.
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
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          padding: '32px 28px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F87171'
            }}
          >
            <ShieldAlert size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#FFFFFF' }}>
              Administrator Credentials
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Requires @ottobon.in staff authorization
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
              Ottobon Staff Email
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
                placeholder="admin@ottobon.in"
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
                Security Key / Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
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
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter staff security key"
                style={{
                  width: '100%',
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '10px 38px 10px 38px',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#DC2626',
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
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
            }}
          >
            {loading ? 'Verifying Authorization...' : 'Sign In as Staff Administrator'}
            <ArrowRight size={18} />
          </button>
        </form>
      </div>

      {/* Footer Navigation */}
      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.82rem', color: '#94A3B8' }}>
        <a
          href="/"
          style={{ color: '#F59E0B', textDecoration: 'none', fontWeight: 600 }}
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/';
          }}
        >
          &larr; Return to Public Platform
        </a>
      </div>
    </div>
  );
};

