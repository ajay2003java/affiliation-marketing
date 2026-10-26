import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { CommissionLedgerEntry } from '../../types';
import { Wallet, Send, ShieldCheck, CheckCircle2, RotateCcw, X } from 'lucide-react';

export const CommissionLedgerView: React.FC = () => {
  const { commissionLedger, payouts, createPayout, createAdjustmentEntry } = useData();
  const { showNotification } = useApp();

  const [payoutModal, setPayoutModal] = useState<CommissionLedgerEntry | null>(null);
  const [payMethod, setPayMethod] = useState('IMPS Direct Bank Transfer');
  const [bankRef, setBankRef] = useState(`UTR-HDFC-${Math.floor(100000000 + Math.random() * 900000000)}`);
  const [payNotes, setPayNotes] = useState('Automated monthly affiliate commission settlement.');

  const [adjustmentModal, setAdjustmentModal] = useState<CommissionLedgerEntry | null>(null);
  const [adjustmentReason, setAdjustmentReason] = useState('Customer cancellation / qualification invalidated upon audit');
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);

  const handleDisburse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutModal) return;

    createPayout(
      payoutModal.affiliateId,
      [payoutModal.id],
      payoutModal.affiliateRewardSnapshot,
      payMethod,
      bankRef,
      payNotes
    );

    showNotification(
      `Disbursed payout of ₹${payoutModal.affiliateRewardSnapshot} to affiliate via ${payMethod}!`,
      'success'
    );
    setPayoutModal(null);
  };

  const handlePostAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustmentModal) return;

    createAdjustmentEntry(
      adjustmentModal.id,
      adjustmentAmount || adjustmentModal.affiliateRewardSnapshot,
      adjustmentReason,
      'Bhanu Bonu (Admin)'
    );

    showNotification(
      `Compensating financial adjustment posted against ${adjustmentModal.referralCode}!`,
      'warning'
    );
    setAdjustmentModal(null);
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Financial Commission Ledger & Payouts</h2>
        <p className="page-subtitle">
          Auditable multi-party ledger. Tracks provider fee collections, platform retained margins, and affiliate bank transfers.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '14px' }}>
          Commission Entitlement Records
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Triggered Date</th>
                <th>Referral / Client</th>
                <th>Reward Trigger</th>
                <th>Invoice Proof</th>
                <th>Provider Fee</th>
                <th>Affiliate Reward</th>
                <th>Sec 194H TDS</th>
                <th>Company Retained</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {commissionLedger.map((comm) => (
                <tr key={comm.id}>
                  <td>
                    <span className="num-tabular" style={{ fontSize: '0.82rem' }}>
                      {new Date(comm.triggeredAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </td>

                  <td>
                    <strong style={{ color: 'var(--brand-navy)' }}>{comm.referralCode}</strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>
                      {comm.customerName}
                    </span>
                  </td>

                  <td>
                    {comm.eventType === 'qualified_lead' ? (
                      <span className="badge badge-lead-gen">Lead Acceptance</span>
                    ) : (
                      <span className="badge badge-conversion">Verified Conversion</span>
                    )}
                  </td>

                  <td>
                    <code style={{ fontSize: '0.78rem', backgroundColor: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                      {comm.partnerInvoiceRef || 'LEAD-QUAL'}
                    </code>
                  </td>

                  <td>
                    <span className="num-tabular" style={{ fontWeight: 600 }}>
                      ₹{comm.providerFeeSnapshot.toLocaleString('en-IN')}
                    </span>
                  </td>

                  <td>
                    <strong className="num-tabular" style={{ color: 'var(--accent-coral)', fontSize: '1rem' }}>
                      ₹{comm.affiliateRewardSnapshot.toLocaleString('en-IN')}
                    </strong>
                  </td>

                  <td>
                    {comm.tdsDeducted ? (
                      <span className="num-tabular" style={{ color: 'var(--status-rejected)', fontSize: '0.82rem', fontWeight: 600 }}>
                        -{comm.tdsRate || 5}% (₹{comm.tdsDeducted})
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        5% at settlement
                      </span>
                    )}
                  </td>

                  <td>
                    <strong className="num-tabular" style={{ color: 'var(--finance-green)' }}>
                      ₹{comm.companyRetainedSnapshot.toLocaleString('en-IN')}
                    </strong>
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        comm.status === 'paid'
                          ? 'badge-success'
                          : comm.status === 'approved'
                          ? 'badge-lead-gen'
                          : 'badge-pending'
                      }`}
                    >
                      {comm.status.toUpperCase()}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {comm.status === 'approved' && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                          onClick={() => setPayoutModal(comm)}
                        >
                          <Wallet size={12} />
                          <span>Disburse</span>
                        </button>
                      )}
                      {comm.status === 'paid' && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--finance-green)', fontWeight: 600 }}>
                          ✓ Paid Out
                        </span>
                      )}
                      {comm.status !== 'reversed' && comm.status !== 'adjusted' && comm.affiliateRewardSnapshot > 0 && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#b91c1c' }}
                          title="Post compensating financial adjustment / reversal entry"
                          onClick={() => {
                            setAdjustmentModal(comm);
                            setAdjustmentAmount(comm.affiliateRewardSnapshot);
                          }}
                        >
                          <RotateCcw size={11} />
                          <span>Reverse / Adjust</span>
                        </button>
                      )}
                      {comm.status === 'reversed' && (
                        <span style={{ fontSize: '0.72rem', color: '#b91c1c', fontStyle: 'italic' }}>
                          Reversal Compensated
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disbursed History */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '14px' }}>
          Historical Payout Records
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payout Ref</th>
                <th>Affiliate Beneficiary</th>
                <th>Disbursed Amount</th>
                <th>Banking Channel</th>
                <th>UTR Reference</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((pay) => (
                <tr key={pay.id}>
                  <td>
                    <strong style={{ color: 'var(--brand-navy)' }}>{pay.payoutReference}</strong>
                  </td>
                  <td>{pay.affiliateName}</td>
                  <td>
                    <strong className="num-tabular" style={{ color: 'var(--finance-green)', fontSize: '1rem' }}>
                      ₹{pay.amountRupees.toLocaleString('en-IN')}
                    </strong>
                  </td>
                  <td>{pay.paymentMethod}</td>
                  <td>
                    <code style={{ fontSize: '0.78rem' }}>{pay.transactionReference || 'N/A'}</code>
                  </td>
                  <td>
                    <span className="num-tabular" style={{ fontSize: '0.82rem' }}>
                      {pay.processedAt ? new Date(pay.processedAt).toLocaleString('en-IN') : 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disbursal Modal */}
      {payoutModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Disburse Commission Payout</h2>
              <button className="modal-close-btn" onClick={() => setPayoutModal(null)}>✕</button>
            </div>
            <form onSubmit={handleDisburse}>
              <div className="modal-body">
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Affiliate:</span>
                    <strong>Arjun Verma</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Referral Code:</span>
                    <strong>{payoutModal.referralCode}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Net Disbursal:</span>
                    <strong className="num-tabular" style={{ fontSize: '1.2rem', color: 'var(--finance-green)' }}>
                      ₹{payoutModal.affiliateRewardSnapshot.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                  >
                    <option value="IMPS Direct Bank Transfer">IMPS Direct Bank Transfer (Instant)</option>
                    <option value="NEFT Corporate Transfer">NEFT Corporate Transfer</option>
                    <option value="UPI Instant Settlement">UPI Instant Settlement</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Banking Transaction Reference / UTR Number <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payout Notes / Remarks</label>
                  <input
                    type="text"
                    className="form-input"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setPayoutModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--finance-green)', borderColor: 'var(--finance-green)' }}>
                  Confirm Bank Disbursal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Compensating Financial Adjustment Modal (PRD Section 7.3, 10 & 13) */}
      {adjustmentModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RotateCcw size={18} color="#b91c1c" />
                  Post Compensating Financial Adjustment
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Ledger Entry #{adjustmentModal.id} • {adjustmentModal.referralCode}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setAdjustmentModal(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePostAdjustment}>
              <div className="modal-body">
                <div className="notice-box warning" style={{ marginBottom: '16px' }}>
                  <ShieldCheck size={16} />
                  <span>
                    <strong>PRD Data Integrity Policy:</strong> Historical financial rows are never overwritten or deleted. This will record a signed compensating negative entry of -₹{adjustmentAmount || adjustmentModal.affiliateRewardSnapshot} in the auditable general ledger.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Adjustment / Reversal Rupee Amount</label>
                  <input
                    type="number"
                    className="form-input num-tabular"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                    required
                  />
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Original Reward: ₹{adjustmentModal.affiliateRewardSnapshot.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Audit Reason for Reversal <span className="required">*</span></label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Provide detailed justification (e.g. Customer canceled test before phlebotomy / Clinical criteria not fulfilled / Mutual refund)..."
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAdjustmentModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#b91c1c', borderColor: '#b91c1c' }}>
                  Post Compensating Reversal Line
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
