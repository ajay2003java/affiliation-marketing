import React from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Wallet,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { offerings, referrals, commissionLedger, payouts, providers } = useData();
  const { setActiveTab } = useApp();

  const totalProviderFees = commissionLedger.reduce((sum, c) => sum + c.providerFeeSnapshot, 0);
  const totalAffiliateRewards = commissionLedger.reduce((sum, c) => sum + c.affiliateRewardSnapshot, 0);
  const totalCompanyRetained = commissionLedger.reduce((sum, c) => sum + c.companyRetainedSnapshot, 0);

  const pendingOfferingsCount = offerings.filter((o) => o.status === 'pending_review').length;
  const approvedCommissionsAwaitingPayout = commissionLedger
    .filter((c) => c.status === 'approved')
    .reduce((sum, c) => sum + c.affiliateRewardSnapshot, 0);

  const totalCompletedPayouts = payouts.reduce((sum, p) => sum + p.amountRupees, 0);

  const qualifiedLeadsCount = referrals.filter((r) => r.leadStatus === 'qualified').length;
  const convertedSalesCount = referrals.filter((r) => r.conversionStatus === 'converted').length;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Executive Overview & Platform Economics</h2>
        <p className="page-subtitle">
          Command center managing provider agreements, catalog review queues, commission attribution, and financial margins.
        </p>
      </div>

      {/* Financial Health & Margin KPI Grid */}
      <div className="metrics-grid">
        <div className="metric-card" style={{ borderLeft: '4px solid var(--brand-navy)' }}>
          <div className="metric-header">
            <span>Provider Fees Incurred</span>
            <Building size={16} color="var(--brand-navy)" />
          </div>
          <div className="metric-value num-tabular" style={{ color: 'var(--brand-navy)' }}>
            ₹{totalProviderFees.toLocaleString('en-IN')}
          </div>
          <div className="metric-subtext">
            <span>Payable by providers for qualifying milestones</span>
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--accent-coral)' }}>
          <div className="metric-header">
            <span>Affiliate Rewards Allocated</span>
            <Wallet size={16} color="var(--accent-coral)" />
          </div>
          <div className="metric-value num-tabular" style={{ color: 'var(--accent-coral)' }}>
            ₹{totalAffiliateRewards.toLocaleString('en-IN')}
          </div>
          <div className="metric-subtext">
            <span>Total earned by referring affiliate partners</span>
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--finance-green)' }}>
          <div className="metric-header">
            <span>Company Retained Margin</span>
            <TrendingUp size={16} color="var(--finance-green)" />
          </div>
          <div className="metric-value num-tabular" style={{ color: 'var(--finance-green)' }}>
            ₹{totalCompanyRetained.toLocaleString('en-IN')}
          </div>
          <div className="metric-subtext">
            <span>Platform fee retained before operational taxes</span>
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--status-pending)' }}>
          <div className="metric-header">
            <span>Pending Payout Queue</span>
            <Clock size={16} color="var(--status-pending)" />
          </div>
          <div className="metric-value num-tabular" style={{ color: 'var(--status-pending)' }}>
            ₹{approvedCommissionsAwaitingPayout.toLocaleString('en-IN')}
          </div>
          <div className="metric-subtext">
            <span>Approved commission ready for disbursal</span>
          </div>
        </div>
      </div>

      {/* Action Banners & Operational Queues */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* Offering Queue Card */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
              Offering Review Queue
            </h3>
            {pendingOfferingsCount > 0 ? (
              <span className="badge badge-pending">{pendingOfferingsCount} Pending</span>
            ) : (
              <span className="badge badge-success">Up to Date</span>
            )}
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Review new service listings, verify pricing, customer deliverables, and ensure provider fee splits comply with commercial policy.
          </p>
          <button
            className="btn btn-navy btn-sm"
            onClick={() => setActiveTab('admin_offering_queue')}
          >
            <span>Open Review Queue</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Ledger & Payout Card */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
              Commission & Payout Desk
            </h3>
            <span className="badge badge-neutral">Audited</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Inspect dual earning triggers (Lead Gen vs Conversion), snapshot terms, and disburse bank transfers with immutable transaction references.
          </p>
          <button
            className="btn btn-navy btn-sm"
            onClick={() => setActiveTab('admin_ledger')}
          >
            <span>Open Payout Desk</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Operational Conversion Funnel */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '16px' }}>
          Platform Pipeline Summary
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Total Referrals Logged</span>
            <strong className="num-tabular" style={{ fontSize: '1.4rem', color: 'var(--brand-navy)' }}>
              {referrals.length}
            </strong>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--lead-teal-light)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--lead-teal)', fontWeight: 600, display: 'block' }}>
              Qualified Leads Accepted
            </span>
            <strong className="num-tabular" style={{ fontSize: '1.4rem', color: 'var(--brand-navy)' }}>
              {qualifiedLeadsCount}
            </strong>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--finance-green-light)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--finance-green)', fontWeight: 600, display: 'block' }}>
              Sales Verified & Converted
            </span>
            <strong className="num-tabular" style={{ fontSize: '1.4rem', color: 'var(--brand-navy)' }}>
              {convertedSalesCount}
            </strong>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Active Client Providers</span>
            <strong className="num-tabular" style={{ fontSize: '1.4rem', color: 'var(--brand-navy)' }}>
              {providers.filter((p) => p.status === 'active').length}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
