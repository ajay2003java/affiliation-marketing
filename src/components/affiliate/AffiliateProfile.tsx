import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { EarningMode } from '../../types';
import { UserCheck, ShieldCheck, CheckCircle2, Save } from 'lucide-react';

export const AffiliateProfile: React.FC = () => {
  const { affiliateProfile, updateAffiliateEarningModes } = useData();
  const { showNotification } = useApp();

  const [earningMode, setEarningMode] = useState<EarningMode>(affiliateProfile.earningModes);
  const [occupation, setOccupation] = useState(affiliateProfile.occupation);
  const [preferredArea, setPreferredArea] = useState(affiliateProfile.preferredArea);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAffiliateEarningModes(earningMode);
    showNotification('Affiliate profile & earning capabilities updated successfully!', 'success');
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
    </div>
  );
};
