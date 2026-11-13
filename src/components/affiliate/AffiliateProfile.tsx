import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { EarningMode } from '../../types';
import { UserCheck, ShieldCheck, CheckCircle2, Save, Lock, Eye, EyeOff, X, AlertCircle } from 'lucide-react';

export const AffiliateProfile: React.FC = () => {
  const { affiliateProfile, updateAffiliateEarningModes } = useData();
  const { showNotification, currentUser, changeUserPassword } = useApp();

  const [earningMode, setEarningMode] = useState<EarningMode>(affiliateProfile.earningModes);
  const [occupation, setOccupation] = useState(affiliateProfile.occupation);
  const [preferredArea, setPreferredArea] = useState(affiliateProfile.preferredArea);

  // Password management state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAffiliateEarningModes(earningMode);
    showNotification('Affiliate profile & earning capabilities updated successfully!', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter.');
      return;
    }

    const res = changeUserPassword(newPassword);
    if (res.success) {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordForm(false);
      }, 3500);
    } else {
      setPasswordError(res.error || 'Failed to update password.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <h2 className="page-title">Affiliate Profile & Earning Modes</h2>
        <p className="page-subtitle">
          Configure how you monetize your network. Choose whether you want to introduce qualified leads, convert opportunities, or both.
        </p>
      </div>

      <form onSubmit={handleSave} className="card" style={{ padding: '28px' }}>
        {/* Core PRD Earning Mode Selector */}
        <div style={{ marginBottom: '32px' }}>
          <label className="form-label" style={{ fontSize: '1rem', color: 'var(--brand-navy)', marginBottom: '8px', display: 'block' }}>
            Supported Earning Capabilities <span className="required">*</span>
          </label>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            According to the platform architecture, this defines which earning models you can activate when submitting client referrals.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {/* Mode: Both */}
            <div
              onClick={() => setEarningMode('both')}
              style={{
                border: `2px solid ${earningMode === 'both' ? 'var(--brand-cobalt)' : 'var(--border-light)'}`,
                backgroundColor: earningMode === 'both' ? 'var(--brand-cobalt-light)' : 'var(--bg-surface)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ color: 'var(--brand-navy)' }}>Both Models (Recommended)</strong>
                {earningMode === 'both' && <CheckCircle2 size={18} color="var(--brand-cobalt)" />}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Full flexibility. You can refer leads for quick qualification payouts OR guide corporate deals for higher conversion rewards.
              </p>
            </div>

            {/* Mode: Lead Gen Only */}
            <div
              onClick={() => setEarningMode('lead_generation')}
              style={{
                border: `2px solid ${earningMode === 'lead_generation' ? 'var(--lead-teal)' : 'var(--border-light)'}`,
                backgroundColor: earningMode === 'lead_generation' ? 'var(--lead-teal-light)' : 'var(--bg-surface)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ color: 'var(--lead-teal)' }}>Lead Generator Only</strong>
                {earningMode === 'lead_generation' && <CheckCircle2 size={18} color="var(--lead-teal)" />}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                You introduce prospects with verified intent. You earn once the provider validates contact & criteria. No sales involvement.
              </p>
            </div>

            {/* Mode: Converter Only */}
            <div
              onClick={() => setEarningMode('lead_conversion')}
              style={{
                border: `2px solid ${earningMode === 'lead_conversion' ? 'var(--finance-green)' : 'var(--border-light)'}`,
                backgroundColor: earningMode === 'lead_conversion' ? 'var(--finance-green-light)' : 'var(--bg-surface)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ color: 'var(--finance-green)' }}>Lead Converter Only</strong>
                {earningMode === 'lead_conversion' && <CheckCircle2 size={18} color="var(--finance-green)" />}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                You work closely with high-value opportunities to close contracts or package sales. You earn upon verified sale.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Attributes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Professional Background / Occupation</label>
            <input
              type="text"
              className="form-input"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Primary Operational Geography</label>
            <input
              type="text"
              className="form-input"
              value={preferredArea}
              onChange={(e) => setPreferredArea(e.target.value)}
            />
          </div>
        </div>

        {/* Network Sectors */}
        <div className="form-group" style={{ marginBottom: '28px' }}>
          <label className="form-label">Your Strongest Network Sectors</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            {affiliateProfile.networkTypes.map((net, i) => (
              <span key={i} className="badge badge-neutral" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                ✓ {net}
              </span>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          <Save size={16} />
          <span>Save Preferences</span>
        </button>
      </form>

      {/* Account Security & Password Management */}
      <div className="card" style={{ padding: '28px', marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: showPasswordForm ? '16px' : '0' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Lock size={18} color="var(--brand-cobalt)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--brand-navy)', margin: 0 }}>
                Account Security & Password
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              Login Email: <strong>{currentUser?.email || 'Registered Email'}</strong> • Role: Affiliate Partner
            </p>
          </div>

          {!showPasswordForm ? (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setShowPasswordForm(true);
                setPasswordError(null);
                setPasswordSuccess(false);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
            >
              <Lock size={14} />
              <span>Change Account Password</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setShowPasswordForm(false);
                setPasswordError(null);
                setNewPassword('');
                setConfirmPassword('');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <X size={14} />
              <span>Close</span>
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ maxWidth: '480px' }}>
              {passwordError && (
                <div className="notice-box error" style={{ padding: '8px 12px', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={15} />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="notice-box success" style={{ padding: '8px 12px', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} />
                  <span>Password updated successfully! Your affiliate account is secured with your new password.</span>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>
                  New Password <span className="required">*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter new password (min. 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                    style={{ width: '100%', paddingRight: '42px', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      color: showNewPassword ? 'var(--brand-cobalt)' : '#64748B',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>
                  Confirm New Password <span className="required">*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                    style={{ width: '100%', paddingRight: '42px', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      color: showConfirmPassword ? 'var(--brand-cobalt)' : '#64748B',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Lock size={14} />
                  <span>Update Password</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordError(null);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
