import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import {
  Send,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Check,
  TrendingUp,
  Wallet,
  Users,
  History
} from 'lucide-react';

import { Referral, ReferralStatusHistory } from '../../types';

export const ReferralsList: React.FC = () => {
  const { referrals, offerings, providers, commissionLedger } = useData();
  const { setActiveTab } = useApp();

  const [selectedTimelineRef, setSelectedTimelineRef] = useState<Referral | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModel, setFilterModel] = useState<'all' | 'lead_generation' | 'lead_conversion'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = referrals.filter((ref) => {
    if (filterModel !== 'all' && ref.earningModel !== filterModel) return false;
    if (filterStatus !== 'all') {
      if (filterStatus === 'qualified' && ref.leadStatus !== 'qualified') return false;
      if (filterStatus === 'converted' && ref.conversionStatus !== 'converted') return false;
      if (filterStatus === 'pending') {
        const isDone = ref.leadStatus === 'qualified' || ref.conversionStatus === 'converted';
        if (isDone) return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ref.customerName.toLowerCase().includes(q);
      const matchCode = ref.referralCode.toLowerCase().includes(q);
      const matchPhone = ref.customerPhone.includes(q);
      return matchName || matchCode || matchPhone;
    }

    return true;
  });

  const qualifiedCount = referrals.filter((r) => r.leadStatus === 'qualified').length;
  const convertedCount = referrals.filter((r) => r.conversionStatus === 'converted').length;
  const totalEarnedCommissions = commissionLedger
    .filter((c) => c.status === 'paid' || c.status === 'approved')
    .reduce((sum, c) => sum + c.affiliateRewardSnapshot, 0);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="page-title">My Referrals & Pipeline Milestones</h2>
          <p className="page-subtitle">
            Track real-time progress, lead qualification decisions, and conversion verifications across all your client introductions.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setActiveTab('browse_services')}
        >
          <Send size={15} />
          <span>+ New Referral</span>
        </button>
      </div>

      {/* Mini Stats Row */}
      <div className="metrics-grid" style={{ marginBottom: '20px' }}>
        <div className="metric-card" style={{ padding: '16px 20px' }}>
          <div className="metric-header">
            <span>Total Referrals Sent</span>
            <Users size={15} color="var(--brand-cobalt)" />
          </div>
          <div className="metric-value num-tabular" style={{ fontSize: '1.4rem', color: 'var(--brand-navy)' }}>
            {referrals.length}
          </div>
        </div>

        <div className="metric-card" style={{ padding: '16px 20px' }}>
          <div className="metric-header">
            <span>Qualified Leads</span>
            <CheckCircle2 size={15} color="var(--lead-teal)" />
          </div>
          <div className="metric-value num-tabular" style={{ fontSize: '1.4rem', color: 'var(--lead-teal)' }}>
            {qualifiedCount}
          </div>
        </div>

        <div className="metric-card" style={{ padding: '16px 20px' }}>
          <div className="metric-header">
            <span>Converted Sales</span>
            <TrendingUp size={15} color="var(--finance-green)" />
          </div>
          <div className="metric-value num-tabular" style={{ fontSize: '1.4rem', color: 'var(--finance-green)' }}>
            {convertedCount}
          </div>
        </div>

        <div className="metric-card" style={{ padding: '16px 20px' }}>
          <div className="metric-header">
            <span>Accrued Rewards</span>
            <Wallet size={15} color="var(--finance-green)" />
          </div>
          <div className="metric-value num-tabular" style={{ fontSize: '1.4rem', color: 'var(--finance-green)' }}>
            ₹{totalEarnedCommissions.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="search-input-wrapper" style={{ minWidth: '240px', flex: 1 }}>
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Search customer name, phone, or referral code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={filterModel}
            onChange={(e) => setFilterModel(e.target.value as any)}
          >
            <option value="all">All Earning Models</option>
            <option value="lead_generation">Lead Generator (Pay on Qualification)</option>
            <option value="lead_conversion">Lead Converter (Pay on Verified Sale)</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="qualified">Qualified Leads Only</option>
            <option value="converted">Converted Sales Only</option>
            <option value="pending">In Progress / Pending</option>
          </select>
        </div>

        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filtered.length}</strong> of {referrals.length} referrals
        </span>
      </div>

      {/* Table with Step Progress Bar */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: '50px 20px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)'
          }}
        >
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No referrals match your search or filters.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Referral ID / Date</th>
                <th>Customer Contact</th>
                <th>Target Offering & Provider</th>
                <th>Earning Model</th>
                <th>Pipeline Milestones</th>
                <th>Your Reward</th>
                <th>Audit Trail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ref) => {
                const offering = offerings.find((o) => o.id === ref.offeringId);
                const provider = providers.find((p) => p.id === ref.providerId);
                const commission = commissionLedger.find((c) => c.referralId === ref.id);

                const rule = offering?.rewardRules.find(
                  (r) =>
                    r.eventType ===
                    (ref.earningModel === 'lead_generation' ? 'qualified_lead' : 'successful_conversion')
                );

                const rewardAmount = commission
                  ? commission.affiliateRewardSnapshot
                  : rule?.affiliateRewardRupees || 0;

                const isLeadGen = ref.earningModel === 'lead_generation';
                const isQualified = ref.leadStatus === 'qualified';
                const isConverted = ref.conversionStatus === 'converted';

                return (
                  <tr key={ref.id}>
                    <td>
                      <strong style={{ color: 'var(--brand-navy)', display: 'block', fontSize: '0.86rem' }}>
                        {ref.referralCode}
                      </strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {new Date(ref.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>

                    <td>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'block' }}>
                        {ref.customerName}
                      </strong>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block' }}>
                        📞 {ref.customerPhone}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        📍 {ref.customerCity}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--brand-navy)', display: 'block' }}>
                        {offering?.title || 'Offering'}
                      </span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {provider?.businessName}
                      </span>
                    </td>

                    <td>
                      {isLeadGen ? (
                        <span className="badge badge-lead-gen">
                          Lead Generator
                        </span>
                      ) : (
                        <span className="badge badge-conversion">
                          Lead Converter
                        </span>
                      )}
                    </td>

                    <td>
                      {/* Visual Milestone Stepper */}
                      <div style={{ minWidth: '220px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--finance-green)',
                              color: '#FFF',
                              fontSize: '0.65rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700
                            }}
                          >
                            ✓
                          </span>
                          <span style={{ height: '2px', width: '20px', backgroundColor: 'var(--finance-green)' }} />
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: (isQualified || isConverted) ? 'var(--finance-green)' : 'var(--status-pending)',
                              color: '#FFF',
                              fontSize: '0.65rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700
                            }}
                          >
                            {(isQualified || isConverted) ? '✓' : '2'}
                          </span>
                          <span style={{ height: '2px', width: '20px', backgroundColor: (isQualified || isConverted) ? 'var(--finance-green)' : 'var(--border-light)' }} />
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: (isQualified || isConverted) ? 'var(--finance-green)' : 'var(--border-medium)',
                              color: '#FFF',
                              fontSize: '0.65rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700
                            }}
                          >
                            {(isQualified || isConverted) ? '✓' : '3'}
                          </span>
                        </div>

                        {isLeadGen ? (
                          isQualified ? (
                            <span className="badge badge-success">
                              <CheckCircle2 size={12} /> Lead Qualified & Verified
                            </span>
                          ) : ref.leadStatus === 'qualification_rejected' ? (
                            <span className="badge badge-rejected">
                              <AlertCircle size={12} /> Disqualified
                            </span>
                          ) : (
                            <span className="badge badge-pending">
                              <Clock size={12} /> Provider Contacting Lead
                            </span>
                          )
                        ) : isConverted ? (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} /> Sale Closed & Verified
                          </span>
                        ) : ref.conversionStatus === 'not_converted' ? (
                          <span className="badge badge-rejected">
                            <AlertCircle size={12} /> Not Converted
                          </span>
                        ) : (
                          <span className="badge badge-pending">
                            <Clock size={12} /> Sales Discussions in Progress
                          </span>
                        )}

                        {ref.qualificationNotes && (
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '240px', fontStyle: 'italic' }}>
                            "{ref.qualificationNotes}"
                          </p>
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong className="num-tabular" style={{ fontSize: '1rem', color: 'var(--brand-navy)' }}>
                          ₹{rewardAmount.toLocaleString('en-IN')}
                        </strong>
                        {commission ? (
                          commission.status === 'paid' ? (
                            <span style={{ fontSize: '0.72rem', color: 'var(--finance-green)', fontWeight: 700 }}>
                              ✓ Disbursed to Bank
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--status-pending)', fontWeight: 700 }}>
                              • Approved (Queued)
                            </span>
                          )
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            • Pending Qualification
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                        onClick={() => setSelectedTimelineRef(ref)}
                      >
                        <History size={13} />
                        <span>Timeline</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Interactive Status History Timeline Modal (PRD Section 10 referral_status_history) */}
      {selectedTimelineRef && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={18} color="var(--brand-cobalt)" />
                  Referral Audit Timeline: {selectedTimelineRef.referralCode}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Customer: <strong>{selectedTimelineRef.customerName}</strong> • {selectedTimelineRef.customerPhone}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedTimelineRef(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '16px', padding: '10px 14px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  <strong>Earning Trigger:</strong> {selectedTimelineRef.earningModel === 'lead_generation' ? 'Lead Generator (Verified Qualified Lead)' : 'Lead Converter (Verified Customer Sale)'}
                </span>
              </div>

              <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid var(--border-medium)', marginLeft: '12px' }}>
                {(selectedTimelineRef.statusHistory || [
                  {
                    id: 'hist_fallback',
                    referralId: selectedTimelineRef.id,
                    changedBy: 'Arjun Verma',
                    actorRole: 'affiliate' as const,
                    fromStatus: 'none',
                    toStatus: 'submitted',
                    reason: 'Referral submitted with confirmed customer authorization.',
                    timestamp: selectedTimelineRef.createdAt
                  }
                ]).map((hist: ReferralStatusHistory, idx: number) => (
                  <div key={hist.id || idx} style={{ position: 'relative', marginBottom: '22px' }}>
                    {/* Timeline Node Dot */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-31px',
                        top: '2px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: hist.toStatus.includes('reject') ? '#ef4444' : hist.toStatus === 'qualified' || hist.toStatus === 'converted' ? 'var(--finance-green)' : 'var(--brand-cobalt)',
                        border: '2px solid #FFF',
                        boxShadow: '0 0 0 2px var(--border-medium)'
                      }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          {new Date(hist.timestamp).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand-navy)', margin: '2px 0' }}>
                          Status: <span style={{ textTransform: 'capitalize' }}>{hist.toStatus.replace(/_/g, ' ')}</span>
                        </h4>
                      </div>
                      <span className={`badge ${hist.actorRole === 'admin' ? 'badge-primary' : hist.actorRole === 'provider' ? 'badge-info' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                        {hist.changedBy} ({hist.actorRole})
                      </span>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                      {hist.reason || 'Milestone updated.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedTimelineRef(null)}>
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
