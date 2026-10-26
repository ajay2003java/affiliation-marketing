import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { Check, X, ShieldAlert, CheckCircle2, Building, Eye } from 'lucide-react';

export const OfferingApproval: React.FC = () => {
  const { offerings, providers, reviewOffering } = useData();
  const { showNotification } = useApp();

  const [feedbackInput, setFeedbackInput] = useState('');
  const [rejectOfferingId, setRejectOfferingId] = useState<string | null>(null);

  const pendingOfferings = offerings.filter((o) => o.status === 'pending_review');
  const allOtherOfferings = offerings.filter((o) => o.status !== 'pending_review');

  const handleApprove = (id: string, title: string) => {
    reviewOffering(id, 'active', 'Approved after commercial schedule validation.');
    showNotification(`Offering "${title}" approved and published to discovery catalog!`, 'success');
  };

  const handleRejectConfirm = (id: string) => {
    reviewOffering(id, 'rejected', feedbackInput || 'Price or fee split requires revision under Annexure A.');
    showNotification(`Offering proposal rejected with feedback.`, 'warning');
    setRejectOfferingId(null);
    setFeedbackInput('');
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Offering Review & Governance Queue</h2>
        <p className="page-subtitle">
          Admin oversight enforcing catalog standards, verified pricing, and compliant affiliate reward splits before offerings go live.
        </p>
      </div>

      {/* Pending Reviews Section */}
      <div style={{ marginBottom: '36px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '14px' }}>
          Pending Proposals Awaiting Decision ({pendingOfferings.length})
        </h3>

        {pendingOfferings.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)'
            }}
          >
            <CheckCircle2 size={32} color="var(--finance-green)" style={{ margin: '0 auto 8px' }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>All offering proposals have been reviewed!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
            {pendingOfferings.map((offering) => {
              const provider = providers.find((p) => p.id === offering.providerId);
              const leadRule = offering.rewardRules.find((r) => r.eventType === 'qualified_lead');
              const convRule = offering.rewardRules.find((r) => r.eventType === 'successful_conversion');

              return (
                <div key={offering.id} className="card" style={{ padding: '24px', border: '2px solid var(--status-pending-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className="badge badge-pending">PENDING ADMIN REVIEW</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{offering.serviceArea}</span>
                  </div>

                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '4px' }}>
                    {offering.title}
                  </h4>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Proposed by: <strong>{provider?.businessName}</strong>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
                    {offering.description}
                  </p>

                  {/* Economics Inspector */}
                  <div className="offering-economics-box" style={{ marginBottom: '18px' }}>
                    <div className="econ-row">
                      <span className="econ-label">Customer Price (Decided by Provider)</span>
                      <strong className="num-tabular" style={{ color: 'var(--brand-navy)', fontWeight: 800 }}>
                        ₹{offering.customerPriceRupees.toLocaleString('en-IN')}
                      </strong>
                    </div>

                    {leadRule && (
                      <div className="econ-row" style={{ marginTop: '4px' }}>
                        <span style={{ color: 'var(--lead-teal)', fontSize: '0.8rem' }}>Lead Referral Reward:</span>
                        <span className="num-tabular" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                          Affiliate receives ₹{leadRule.affiliateRewardRupees.toLocaleString('en-IN')} (Decided by Provider)
                        </span>
                      </div>
                    )}

                    {convRule && (
                      <div className="econ-row" style={{ marginTop: '4px' }}>
                        <span style={{ color: 'var(--finance-green)', fontSize: '0.8rem' }}>Sale Referral Reward:</span>
                        <span className="num-tabular" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                          Affiliate receives ₹{convRule.affiliateRewardRupees.toLocaleString('en-IN')} (Decided by Provider)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, backgroundColor: 'var(--finance-green)', borderColor: 'var(--finance-green)' }}
                      onClick={() => handleApprove(offering.id, offering.title)}
                    >
                      <Check size={15} />
                      <span>Approve & Publish</span>
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ flex: 1 }}
                      onClick={() => setRejectOfferingId(offering.id)}
                    >
                      <X size={15} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Currently Active Offerings Directory */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '14px' }}>
          Active Catalog Offerings ({allOtherOfferings.length})
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service Offering</th>
                <th>Provider</th>
                <th>Customer Price</th>
                <th>Enabled Reward Triggers</th>
                <th>Status</th>
                <th>Rule Version</th>
              </tr>
            </thead>
            <tbody>
              {allOtherOfferings.map((o) => {
                const prov = providers.find((p) => p.id === o.providerId);
                const leadRule = o.rewardRules.find((r) => r.eventType === 'qualified_lead');
                const convRule = o.rewardRules.find((r) => r.eventType === 'successful_conversion');

                return (
                  <tr key={o.id}>
                    <td>
                      <strong style={{ color: 'var(--brand-navy)', display: 'block' }}>{o.title}</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{o.serviceArea}</span>
                    </td>
                    <td>{prov?.businessName}</td>
                    <td>
                      <strong className="num-tabular">₹{o.customerPriceRupees.toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {leadRule && <span className="badge badge-lead-gen">Lead Gen: ₹{leadRule.affiliateRewardRupees}</span>}
                        {convRule && <span className="badge badge-conversion">Conv: ₹{convRule.affiliateRewardRupees}</span>}
                      </div>
                    </td>
                    <td>
                      {o.status === 'active' ? (
                        <span className="badge badge-success">ACTIVE</span>
                      ) : (
                        <span className="badge badge-rejected">{o.status.toUpperCase()}</span>
                      )}
                    </td>
                    <td>
                      <span className="num-tabular">v{o.version}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectOfferingId && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Reject Offering Proposal</h2>
              <button className="modal-close-btn" onClick={() => setRejectOfferingId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Feedback for Provider</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Explain why this proposal requires change (e.g. fee terms outside policy, description lacks NABL license ref)..."
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRejectOfferingId(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleRejectConfirm(rejectOfferingId)}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
