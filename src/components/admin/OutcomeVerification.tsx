import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { Referral, CommissionLedgerEntry } from '../../types';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  X,
  ShieldCheck,
  FileText,
  Lock,
  Zap,
  Building
} from 'lucide-react';

export const OutcomeVerification: React.FC = () => {
  const {
    referrals,
    offerings,
    providers,
    commissionLedger,
    affiliateProfile,
    updateLeadStatus,
    updateConversionStatus,
    approveSettlementWithTds
  } = useData();
  const { showNotification } = useApp();

  const [verifyModal, setVerifyModal] = useState<{
    referral: Referral;
    action: 'approve_lead' | 'reject_lead' | 'approve_conv' | 'reject_conv';
  } | null>(null);

  const [checkerCommission, setCheckerCommission] = useState<CommissionLedgerEntry | null>(null);
  const [auditNotes, setAuditNotes] = useState('');

  // Pending Checker Approvals (Maker conversions awaiting Finance release)
  const pendingCheckerCommissions = commissionLedger.filter(
    (c) => c.eventType === 'successful_conversion' && c.status === 'pending'
  );

  const handleConfirmDecision = () => {
    if (!verifyModal) return;
    const { referral, action } = verifyModal;

    if (action === 'approve_lead') {
      updateLeadStatus(referral.id, 'qualified', auditNotes || 'Admin confirmed qualification criteria met.', 'Bhanu Bonu (Admin)');
      showNotification(`Referral ${referral.referralCode} verified as Qualified!`, 'success');
    } else if (action === 'reject_lead') {
      updateLeadStatus(referral.id, 'qualification_rejected', auditNotes || 'Admin rejected lead qualification.', 'Bhanu Bonu (Admin)');
      showNotification(`Referral ${referral.referralCode} lead rejected.`, 'warning');
    } else if (action === 'approve_conv') {
      updateConversionStatus(referral.id, 'converted', referral.saleValueRupees || 45000, auditNotes || 'Admin verified invoice & client payment.', 'Bhanu Bonu (Admin)');
      showNotification(`Referral ${referral.referralCode} conversion verified!`, 'success');
    } else if (action === 'reject_conv') {
      updateConversionStatus(referral.id, 'not_converted', 0, auditNotes || 'Admin invalidated conversion claim.', 'Bhanu Bonu (Admin)');
      showNotification(`Referral ${referral.referralCode} conversion rejected.`, 'warning');
    }

    setVerifyModal(null);
    setAuditNotes('');
  };

  const handleCheckerApprove = (comm: CommissionLedgerEntry) => {
    approveSettlementWithTds(comm.id, affiliateProfile.panVerified);
    const tdsRate = affiliateProfile.panVerified ? 5 : 20;
    const tdsAmt = Math.round((comm.affiliateRewardSnapshot * tdsRate) / 100);
    const net = comm.affiliateRewardSnapshot - tdsAmt;
    showNotification(
      `Checker Approved! Released ₹${net.toLocaleString('en-IN')} to cash (Deducted ₹${tdsAmt} TDS @ ${tdsRate}% under Sec 194H).`,
      'success'
    );
    setCheckerCommission(null);
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Outcome Verification & Finance Checker Desk</h2>
        <p className="page-subtitle">
          Maker-Checker financial audit: verify client invoice proof, apply statutory Section 194H TDS, and release escrow rewards.
        </p>
      </div>

      {/* Maker-Checker Conversion Settlements Queue */}
      <div
        className="card"
        style={{
          padding: '24px',
          marginBottom: '28px',
          borderLeft: '4px solid var(--finance-green)',
          backgroundColor: '#FFF'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="var(--finance-green)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                Maker-Checker Conversion Queue ({pendingCheckerCommissions.length} Pending Settlement)
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Client providers (Maker) reported these sales with official invoices. Finance Checker must verify proof to release Escrow to Cash.
            </p>
          </div>

          <span
            style={{
              backgroundColor: affiliateProfile.panVerified ? '#DCFCE7' : '#FEF3C7',
              color: affiliateProfile.panVerified ? '#15803D' : '#B45309',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            {affiliateProfile.panVerified ? 'Affiliate PAN: ABCDE1234F (5% TDS Active)' : '⚠️ PAN Missing (20% TDS)'}
          </span>
        </div>

        {pendingCheckerCommissions.length === 0 ? (
          <div
            style={{
              padding: '28px 16px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}
          >
            <CheckCircle2 size={24} color="var(--finance-green)" style={{ margin: '0 auto 6px' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--brand-navy)', fontWeight: 600, display: 'block' }}>
              All conversion settlements are up to date!
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              When a provider reports a conversion with an invoice reference, it will appear here for Finance Checker approval.
            </span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Referral Code</th>
                  <th>Customer & Provider</th>
                  <th>Client Invoice Ref (Proof)</th>
                  <th>Gross Reward</th>
                  <th>Sec 194H TDS</th>
                  <th>Net Cash Released</th>
                  <th>Checker Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingCheckerCommissions.map((comm) => {
                  const tdsRate = affiliateProfile.panVerified ? 5 : 20;
                  const tdsAmt = Math.round((comm.affiliateRewardSnapshot * tdsRate) / 100);
                  const netPayable = comm.affiliateRewardSnapshot - tdsAmt;
                  const prov = providers.find((p) => p.id === comm.providerId);

                  return (
                    <tr key={comm.id}>
                      <td>
                        <strong style={{ color: 'var(--brand-navy)' }}>{comm.referralCode}</strong>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>
                          {new Date(comm.triggeredAt).toLocaleDateString('en-IN')}
                        </span>
                      </td>

                      <td>
                        <strong style={{ fontSize: '0.88rem', display: 'block' }}>{comm.customerName}</strong>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                          {prov?.businessName || 'Client Provider'}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={14} color="var(--brand-cobalt)" />
                          <code style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                            {comm.partnerInvoiceRef || 'INV-2026-9042'}
                          </code>
                        </div>
                      </td>

                      <td>
                        <strong className="num-tabular" style={{ fontSize: '0.92rem', color: 'var(--brand-navy)' }}>
                          ₹{comm.affiliateRewardSnapshot.toLocaleString('en-IN')}
                        </strong>
                      </td>

                      <td>
                        <span className="num-tabular" style={{ color: 'var(--status-rejected)', fontSize: '0.82rem', fontWeight: 600 }}>
                          -{tdsRate}% (₹{tdsAmt})
                        </span>
                      </td>

                      <td>
                        <strong className="num-tabular" style={{ color: 'var(--finance-green)', fontSize: '1.05rem' }}>
                          ₹{netPayable.toLocaleString('en-IN')}
                        </strong>
                      </td>

                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{
                            backgroundColor: 'var(--finance-green)',
                            borderColor: 'var(--finance-green)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onClick={() => handleCheckerApprove(comm)}
                        >
                          <Check size={13} />
                          <span>Approve & Release Escrow</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* All Referrals Audit Desk */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '12px' }}>
          All Submitted Referrals & Milestones
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Referral Code</th>
                <th>Customer & Masked Contact</th>
                <th>Target Provider</th>
                <th>Earning Model</th>
                <th>Current State</th>
                <th>Invoice Proof</th>
                <th>Audit Action</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((ref) => {
                const offering = offerings.find((o) => o.id === ref.offeringId);
                const provider = providers.find((p) => p.id === ref.providerId);

                return (
                  <tr key={ref.id}>
                    <td>
                      <strong style={{ color: 'var(--brand-navy)' }}>{ref.referralCode}</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>
                        {new Date(ref.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </td>

                    <td>
                      <strong style={{ fontSize: '0.88rem', display: 'block' }}>{ref.customerName}</strong>
                      <span style={{ fontSize: '0.76rem', color: 'var(--brand-cobalt)', fontFamily: 'monospace' }}>
                        📞 {ref.clientPhoneMasked || ref.customerPhone}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--brand-navy)', display: 'block' }}>
                        {provider?.businessName}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {offering?.title}
                      </span>
                    </td>

                    <td>
                      {ref.earningModel === 'lead_generation' ? (
                        <span className="badge badge-lead-gen">Lead Gen</span>
                      ) : (
                        <span className="badge badge-conversion">Lead Converter</span>
                      )}
                    </td>

                    <td>
                      {ref.earningModel === 'lead_generation' ? (
                        <div>
                          {ref.leadStatus === 'qualified' && (
                            <span className="badge badge-success">
                              <CheckCircle2 size={12} /> Qualified
                            </span>
                          )}
                          {ref.leadStatus === 'qualification_pending' && (
                            <span className="badge badge-pending">
                              <Clock size={12} /> Pending Review
                            </span>
                          )}
                          {ref.leadStatus === 'submitted' && (
                            <span className="badge badge-neutral">Submitted</span>
                          )}
                          {ref.leadStatus === 'qualification_rejected' && (
                            <span className="badge badge-rejected">Rejected</span>
                          )}
                        </div>
                      ) : (
                        <div>
                          {ref.conversionStatus === 'converted' && (
                            <span className="badge badge-success">
                              <CheckCircle2 size={12} /> Converted (₹{ref.saleValueRupees?.toLocaleString('en-IN')})
                            </span>
                          )}
                          {ref.conversionStatus === 'follow_up_in_progress' && (
                            <span className="badge badge-pending">Follow-up Active</span>
                          )}
                          {ref.conversionStatus === 'not_converted' && (
                            <span className="badge badge-rejected">Lost</span>
                          )}
                        </div>
                      )}
                    </td>

                    <td>
                      {ref.partnerInvoiceRef ? (
                        <code style={{ fontSize: '0.78rem', backgroundColor: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                          {ref.partnerInvoiceRef}
                        </code>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>None</span>
                      )}
                    </td>

                    <td>
                      {ref.earningModel === 'lead_generation' && ref.leadStatus === 'qualification_pending' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ backgroundColor: 'var(--lead-teal)', borderColor: 'var(--lead-teal)' }}
                            onClick={() => {
                              setVerifyModal({ referral: ref, action: 'approve_lead' });
                              setAuditNotes('Admin verified valid contact & geographic scope.');
                            }}
                          >
                            <Check size={12} /> Verify
                          </button>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => {
                              setVerifyModal({ referral: ref, action: 'reject_lead' });
                              setAuditNotes('Does not satisfy Annexure A lead criteria.');
                            }}
                          >
                            <X size={12} /> Reject
                          </button>
                        </div>
                      )}

                      {ref.earningModel === 'lead_conversion' && ref.conversionStatus === 'follow_up_in_progress' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ backgroundColor: 'var(--finance-green)', borderColor: 'var(--finance-green)' }}
                            onClick={() => {
                              setVerifyModal({ referral: ref, action: 'approve_conv' });
                              setAuditNotes('Corporate purchase order confirmed.');
                            }}
                          >
                            <Check size={12} /> Verify Sale
                          </button>
                        </div>
                      )}

                      {((ref.earningModel === 'lead_generation' && ref.leadStatus === 'qualified') ||
                        (ref.earningModel === 'lead_conversion' && ref.conversionStatus === 'converted')) && (
                        <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                          <ShieldCheck size={12} /> Verified & Locked
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {verifyModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Admin Outcome Audit</h2>
              <button className="modal-close-btn" onClick={() => setVerifyModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Referral: <strong>{verifyModal.referral.referralCode}</strong> • Customer: <strong>{verifyModal.referral.customerName}</strong>
              </p>
              <div className="form-group">
                <label className="form-label">Audit Verification Log Notes</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setVerifyModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirmDecision}>Confirm Verification</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
