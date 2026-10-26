import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { ProviderOffering } from '../../types';
import {
  TrendingUp,
  Wallet,
  Users,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Send,
  ArrowRight,
  Flame,
  Zap,
  Clock,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { ReferralModal } from './ReferralModal';
import { OfferingDetailModal } from './OfferingDetailModal';
import { CustomerShareLandingModal } from './CustomerShareLandingModal';

export const AffiliateDashboard: React.FC = () => {
  const { offerings, providers, referrals, commissionLedger, affiliateProfile } = useData();
  const { currentUser, setActiveTab, showNotification } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);
  const [modalOffering, setModalOffering] = useState<ProviderOffering | null>(null);
  const [referralOffering, setReferralOffering] = useState<ProviderOffering | null>(null);
  const [showShareLandingModal, setShowShareLandingModal] = useState(false);

  // Stats calculations
  const totalEarned = commissionLedger
    .filter((c) => c.status === 'paid' || c.status === 'approved')
    .reduce((sum, c) => sum + c.affiliateRewardSnapshot, 0);

  const pendingPayout = commissionLedger
    .filter((c) => c.status === 'approved')
    .reduce((sum, c) => sum + c.affiliateRewardSnapshot, 0);

  const activeReferralsCount = referrals.filter(
    (r) => r.leadStatus !== 'qualification_rejected' && r.conversionStatus !== 'not_converted'
  ).length;

  const qualifiedLeadsCount = referrals.filter((r) => r.leadStatus === 'qualified').length;
  const convertedSalesCount = referrals.filter((r) => r.conversionStatus === 'converted').length;
  const totalCompletedOutcomes = qualifiedLeadsCount + convertedSalesCount;
  const successRate = referrals.length > 0 ? Math.round((totalCompletedOutcomes / referrals.length) * 100) : 0;

  // Active Offerings sorted by highest affiliate rewards
  const activeOfferings = offerings.filter((o) => o.status === 'active');
  const hotOfferings = [...activeOfferings].sort((a, b) => {
    const maxRewardA = Math.max(...a.rewardRules.map((r) => r.affiliateRewardRupees), 0);
    const maxRewardB = Math.max(...b.rewardRules.map((r) => r.affiliateRewardRupees), 0);
    return maxRewardB - maxRewardA;
  }).slice(0, 3);

  // Recent 3 Referrals
  const recentReferrals = [...referrals].slice(0, 3);

  const masterReferralLink = `https://refer.opnetwork.in/u/${affiliateProfile.userId}?ref=AFF-7821`;

  const handleCopyMasterLink = () => {
    navigator.clipboard.writeText(masterReferralLink);
    setCopiedLink(true);
    showNotification('Universal referral link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppShare = (title?: string, link?: string) => {
    const shareText = title
      ? `Hey! Check out this verified service: "${title}". You can book with special partner priority here: ${link || masterReferralLink}`
      : `Hey! I am an accredited partner with our commercial referral network. If you need verified healthcare, diagnostics, or corporate services, visit my partner link: ${masterReferralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div>
      {/* Welcome Banner & Master Link Bar */}
      <div
        className="card"
        style={{
          padding: '28px 24px',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #0A2540 0%, #0F375E 100%)',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span
                style={{
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.5px'
                }}
              >
                AFFILIATE PARTNER ID: AFF-7821
              </span>
              <span
                style={{
                  backgroundColor: 'var(--lead-teal)',
                  color: '#FFF',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}
              >
                Dual Earning Active
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', margin: '4px 0 6px' }}>
              Welcome back, {currentUser.name}! 👋
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', maxWidth: '600px', lineHeight: 1.4 }}>
              Monetize your personal and professional network. Earn transparent commissions for both <strong>qualified lead introductions</strong> and <strong>verified customer sales</strong>.
            </p>
          </div>

          {/* Bank payout status pill */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.18)',
              textAlign: 'right'
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block' }}>
              Payout Settlement Account
            </span>
            <strong style={{ fontSize: '0.9rem', color: '#FFFFFF' }}>
              HDFC Bank •••• 4092
            </strong>
            <span style={{ fontSize: '0.72rem', color: '#4ADE80', display: 'block', marginTop: '2px', fontWeight: 600 }}>
              ✓ KYC & UPI Auto-Pay Ready
            </span>
          </div>
        </div>

        {/* Master Instant Sharing Link Bar */}
        <div
          style={{
            marginTop: '22px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
              Your Master Share Link:
            </span>
            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.3)',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                color: '#E0F2FE',
                border: '1px solid rgba(255,255,255,0.2)',
                userSelect: 'all'
              }}
            >
              {masterReferralLink}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleCopyMasterLink}
              className="btn btn-sm"
              style={{
                backgroundColor: '#FFFFFF',
                color: 'var(--brand-navy)',
                fontWeight: 700,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              id="btn-copy-master-link"
            >
              {copiedLink ? <Check size={14} color="var(--finance-green)" /> : <Copy size={14} />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={() => handleWhatsAppShare()}
              className="btn btn-sm"
              style={{
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                fontWeight: 700,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              id="btn-share-whatsapp-master"
            >
              <MessageCircle size={14} />
              <span>Share on WhatsApp</span>
            </button>

            <button
              onClick={() => setShowShareLandingModal(true)}
              className="btn btn-sm"
              style={{
                backgroundColor: 'rgba(255,255,255,0.16)',
                color: '#FFFFFF',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.28)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              id="btn-preview-landing-page"
            >
              <ExternalLink size={14} />
              <span>Preview Customer Page</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Performance Bar */}
      <div className="metrics-grid" style={{ marginBottom: '28px' }}>
        <div className="metric-card" style={{ borderLeft: '4px solid var(--finance-green)' }}>
          <div className="metric-header">
            <span>Total Earnings (All-Time)</span>
            <Wallet size={16} color="var(--finance-green)" />
          </div>
          <div className="metric-value num-tabular" style={{ color: 'var(--finance-green)' }}>
            ₹{totalEarned.toLocaleString('en-IN')}
          </div>
          <div className="metric-subtext">
            <span>Approved & paid direct into your bank</span>
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--status-pending)' }}>
          <div className="metric-header">
            <span>Next Payout Pending</span>
            <Clock size={16} color="var(--status-pending)" />
          </div>
          <div className="metric-value num-tabular" style={{ color: 'var(--status-pending)' }}>
            ₹{pendingPayout.toLocaleString('en-IN')}
          </div>
          <div className="metric-subtext">
            <span>Scheduled for upcoming disbursal cycle</span>
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--brand-cobalt)' }}>
          <div className="metric-header">
            <span>Active Referrals in Pipeline</span>
            <TrendingUp size={16} color="var(--brand-cobalt)" />
          </div>
          <div className="metric-value num-tabular" style={{ color: 'var(--brand-cobalt)' }}>
            {activeReferralsCount}
          </div>
          <div className="metric-subtext">
            <span>Customer contacts progressing with providers</span>
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--lead-teal)' }}>
          <div className="metric-header">
            <span>Qualification Success Rate</span>
            <CheckCircle2 size={16} color="var(--lead-teal)" />
          </div>
          <div className="metric-value num-tabular" style={{ color: 'var(--lead-teal)' }}>
            {successRate}%
          </div>
          <div className="metric-subtext">
            <span>{totalCompletedOutcomes} of {referrals.length} leads successfully rewarded</span>
          </div>
        </div>
      </div>


      {/* Top High-Reward Opportunities */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={20} color="var(--accent-coral)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                Hot Referral Opportunities
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Top client offerings paying the highest rewards right now for qualified leads and closed sales
            </p>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('browse_services')}
          >
            <span>View All ({activeOfferings.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {hotOfferings.map((offering) => {
            const provider = providers.find((p) => p.id === offering.providerId);
            const leadRule = offering.rewardRules.find((r) => r.eventType === 'qualified_lead' && r.isActive);
            const convRule = offering.rewardRules.find((r) => r.eventType === 'successful_conversion' && r.isActive);
            const offeringShareLink = `https://refer.opnetwork.in/s/${offering.id}?ref=AFF-7821`;

            return (
              <div key={offering.id} className="offering-card">
                <div className="offering-provider-meta">
                  <div className="provider-avatar">
                    {provider?.businessName.charAt(0) || 'P'}
                  </div>
                  <div>
                    <span className="provider-name">{provider?.businessName}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      📍 {offering.serviceArea}
                    </span>
                  </div>
                </div>

                <h4 className="offering-title" style={{ fontSize: '1.05rem', marginBottom: '4px' }}>
                  {offering.title}
                </h4>
                <p className="offering-description" style={{ fontSize: '0.82rem', marginBottom: '14px', WebkitLineClamp: 2 }}>
                  {offering.description}
                </p>

                {/* Economics and Reward Badges */}
                <div className="offering-economics-box" style={{ marginBottom: '14px' }}>
                  <div className="econ-row">
                    <span className="econ-label">Customer Price</span>
                    <span className="econ-price num-tabular" style={{ fontSize: '0.95rem' }}>
                      ₹{offering.customerPriceRupees.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="reward-pills-row" style={{ marginTop: '8px' }}>
                    {leadRule && (
                      <div className="reward-pill-badge lead">
                        <Zap size={12} />
                        <span>Lead Reward:</span>
                        <strong className="num-tabular">₹{leadRule.affiliateRewardRupees.toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                    {convRule && (
                      <div className="reward-pill-badge conv">
                        <TrendingUp size={12} />
                        <span>Sale Reward:</span>
                        <strong className="num-tabular">₹{convRule.affiliateRewardRupees.toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleWhatsAppShare(offering.title, offeringShareLink)}
                    style={{ fontSize: '0.78rem' }}
                  >
                    <MessageCircle size={14} color="#25D366" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setReferralOffering(offering)}
                    style={{ fontSize: '0.78rem' }}
                  >
                    <Send size={13} />
                    <span>Refer Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Referrals Mini Tracker */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
              Recent Referrals Progress
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Live status milestones for customer leads you have sent to client partners
            </p>
          </div>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => setActiveTab('my_referrals')}
          >
            <span>View All Referrals ({referrals.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Referral Code</th>
                <th>Customer Contact</th>
                <th>Target Provider / Service</th>
                <th>Earning Model</th>
                <th>Live Status</th>
              </tr>
            </thead>
            <tbody>
              {recentReferrals.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    No referrals submitted yet. Browse active service offerings above to submit your first client referral and start earning rewards.
                  </td>
                </tr>
              ) : (
                recentReferrals.map((ref) => {
                const offering = offerings.find((o) => o.id === ref.offeringId);
                const provider = providers.find((p) => p.id === ref.providerId);

                return (
                  <tr key={ref.id}>
                    <td>
                      <strong style={{ color: 'var(--brand-navy)' }}>{ref.referralCode}</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>
                        {new Date(ref.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.88rem', display: 'block' }}>{ref.customerName}</strong>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>📞 {ref.customerPhone}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--brand-navy)', display: 'block' }}>
                        {offering?.title || 'Service Offering'}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        {provider?.businessName}
                      </span>
                    </td>
                    <td>
                      {ref.earningModel === 'lead_generation' ? (
                        <span className="badge badge-lead-gen">Lead Gen Reward</span>
                      ) : (
                        <span className="badge badge-conversion">Conversion Reward</span>
                      )}
                    </td>
                    <td>
                      {ref.earningModel === 'lead_generation' ? (
                        ref.leadStatus === 'qualified' ? (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} /> Lead Qualified
                          </span>
                        ) : (
                          <span className="badge badge-pending">Provider Reviewing</span>
                        )
                      ) : ref.conversionStatus === 'converted' ? (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} /> Sale Converted
                        </span>
                      ) : (
                        <span className="badge badge-pending">Follow-up in Progress</span>
                      )}
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modalOffering && (
        <OfferingDetailModal
          offering={modalOffering}
          onClose={() => setModalOffering(null)}
          onReferClick={(o) => setReferralOffering(o)}
        />
      )}

      {referralOffering && (
        <ReferralModal
          offering={referralOffering}
          onClose={() => setReferralOffering(null)}
        />
      )}

      {showShareLandingModal && (
        <CustomerShareLandingModal
          onClose={() => setShowShareLandingModal(false)}
        />
      )}
    </div>
  );
};
