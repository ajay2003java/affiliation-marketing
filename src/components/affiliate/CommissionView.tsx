import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Zap,
  ArrowRight,
  CreditCard,
  Check,
  FileText,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export const CommissionView: React.FC = () => {
  const {
    commissionLedger,
    payouts,
    affiliateProfile,
    executeInstantUpiPayout,
    updateAffiliateTaxProfile
  } = useData();
  const { showNotification } = useApp();

  const wallet = affiliateProfile.walletAccounts || {
    escrowLockedBal: 0,
    availableCashBal: 0,
    lifetimeTdsDeducted: 0
  };

  // Modals
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [payoutReceipt, setPayoutReceipt] = useState<{
    utr: string;
    amount: number;
    vpa: string;
    payoutRef: string;
    date: string;
  } | null>(null);

  // Form Inputs
  const [upiInput, setUpiInput] = useState(affiliateProfile.upiVpa || '');
  const [withdrawAmount, setWithdrawAmount] = useState(wallet.availableCashBal > 0 ? wallet.availableCashBal.toString() : '');
  const [panInput, setPanInput] = useState(affiliateProfile.panNumber || '');

  // Stats calculations
  const totalPaid = commissionLedger
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + (c.netPayable || c.affiliateRewardSnapshot), 0);

  const pendingPayout = commissionLedger
    .filter((c) => c.status === 'approved')
    .reduce((sum, c) => sum + (c.netPayable || c.affiliateRewardSnapshot), 0);

  const totalEarnedAllTime = totalPaid + pendingPayout + wallet.availableCashBal;

  const leadGenEarnings = commissionLedger
    .filter((c) => c.eventType === 'qualified_lead')
    .reduce((sum, c) => sum + c.affiliateRewardSnapshot, 0);

  const conversionEarnings = commissionLedger
    .filter((c) => c.eventType === 'successful_conversion')
    .reduce((sum, c) => sum + c.affiliateRewardSnapshot, 0);

  const handleUpiPayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) {
      showNotification('Please enter a valid withdrawal amount.', 'warning');
      return;
    }
    if (amt > wallet.availableCashBal) {
      showNotification(`Amount exceeds your available cash balance (₹${wallet.availableCashBal.toLocaleString('en-IN')}).`, 'warning');
      return;
    }

    const res = executeInstantUpiPayout(amt, upiInput.trim());
    if (res.success && res.payout) {
      showNotification(`₹${amt.toLocaleString('en-IN')} transferred to ${upiInput} via UPI Rail!`, 'success');
      setPayoutReceipt({
        utr: res.utr,
        amount: amt,
        vpa: upiInput,
        payoutRef: res.payout.payoutReference,
        date: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      });
      setShowUpiModal(false);
    } else {
      showNotification('Failed to process withdrawal.', 'warning');
    }
  };

  const handleTaxUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAffiliateTaxProfile(panInput, upiInput);
    showNotification('Tax PAN and default UPI VPA updated successfully!', 'success');
    setShowTaxModal(false);
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">My Commissions & Instant Payout Rail</h2>
        <p className="page-subtitle">
          Double-entry escrow accounting with Section 194H TDS compliance and instant UPI bank settlement.
        </p>
      </div>

      {/* Dual-Bucket Escrow & Cash Wallet Banner */}
      <div
        className="card"
        style={{
          padding: '24px',
          marginBottom: '26px',
          background: 'linear-gradient(135deg, #0A2540 0%, #0F375E 100%)',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  letterSpacing: '0.5px'
                }}
              >
                ESCROW-PROTECTED WALLET
              </span>
              <span
                style={{
                  backgroundColor: affiliateProfile.panVerified ? 'var(--finance-green)' : '#F59E0B',
                  color: '#FFF',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}
              >
                {affiliateProfile.panVerified ? '✓ PAN Verified (5% TDS)' : '⚠️ No PAN (20% TDS)'}
              </span>
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', margin: '4px 0 6px' }}>
              Commission Balances & Settlement Desk
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.85)', maxWidth: '580px', lineHeight: 1.4 }}>
              Rewards lock in <strong>Escrow</strong> upon lead qualification and unlock to <strong>Available Cash</strong> once invoice proof is approved.
            </p>
          </div>

          {/* Quick Cashout Action */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <button
              className="btn btn-primary"
              style={{
                backgroundColor: 'var(--finance-green)',
                color: '#FFF',
                fontWeight: 800,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                fontSize: '0.92rem',
                boxShadow: '0 4px 14px rgba(16,185,129,0.35)'
              }}
              onClick={() => {
                setWithdrawAmount(wallet.availableCashBal > 0 ? wallet.availableCashBal.toString() : '1000');
                setShowUpiModal(true);
              }}
              disabled={wallet.availableCashBal <= 0}
            >
              <Zap size={16} />
              <span>Withdraw to UPI (Instant)</span>
            </button>

            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: '#93C5FD',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
              onClick={() => setShowTaxModal(true)}
            >
              Manage PAN & UPI Settings
            </button>
          </div>
        </div>

        {/* 3 Wallet Buckets Grid */}
        <div
          style={{
            marginTop: '22px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.12)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#93C5FD' }}>
              <Lock size={14} />
              <span>LOCKED IN ESCROW</span>
            </div>
            <div className="num-tabular" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', margin: '4px 0' }}>
              ₹{wallet.escrowLockedBal.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>
              Active leads awaiting Maker-Checker invoice settlement
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(16,185,129,0.15)',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(74,222,128,0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#4ADE80' }}>
              <CheckCircle2 size={14} />
              <span>AVAILABLE CASH BALANCE</span>
            </div>
            <div className="num-tabular" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4ADE80', margin: '4px 0' }}>
              ₹{wallet.availableCashBal.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.85)' }}>
              Ready for 24/7 instant cashout via RazorpayX UPI Rail
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.12)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#CBD5E1' }}>
              <FileText size={14} />
              <span>LIFETIME TDS DEDUCTED</span>
            </div>
            <div className="num-tabular" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#E2E8F0', margin: '4px 0' }}>
              ₹{wallet.lifetimeTdsDeducted.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>
              Filed under Section 194H (Form 16A compliant)
            </span>
          </div>
        </div>
      </div>

      {/* Model Breakdown Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
          marginBottom: '28px'
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--lead-teal-light)',
            border: '1px solid var(--lead-teal-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--lead-teal)', textTransform: 'uppercase' }}>
              Lead Generator Rewards
            </span>
            <div className="num-tabular" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
              ₹{leadGenEarnings.toLocaleString('en-IN')}
            </div>
          </div>
          <span className="badge badge-lead-gen">Pay on Lead Acceptance</span>
        </div>

        <div
          style={{
            backgroundColor: 'var(--finance-green-light)',
            border: '1px solid var(--finance-green-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--finance-green)', textTransform: 'uppercase' }}>
              Lead Converter Rewards
            </span>
            <div className="num-tabular" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
              ₹{conversionEarnings.toLocaleString('en-IN')}
            </div>
          </div>
          <span className="badge badge-conversion">Pay on Verified Sale Invoice</span>
        </div>
      </div>

      {/* Commission Ledger Table */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
              Commission Ledger & Proof Tracking
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Auditable breakdown with client invoice references and statutory TDS tax deductions
            </p>
          </div>
        </div>

        {commissionLedger.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No commission records found yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event Date</th>
                  <th>Referral Code</th>
                  <th>Service Offering</th>
                  <th>Proof / Invoice Ref</th>
                  <th>Gross Reward</th>
                  <th>Sec 194H TDS</th>
                  <th>Net Payable</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {commissionLedger.map((comm) => (
                  <tr key={comm.id}>
                    <td>
                      <span className="num-tabular" style={{ fontSize: '0.84rem' }}>
                        {new Date(comm.triggeredAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short'
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
                      <span style={{ fontWeight: 600 }}>{comm.offeringTitle}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>
                        {comm.eventType === 'qualified_lead' ? 'Lead Acceptance' : 'Verified Purchase'}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.78rem', backgroundColor: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                        {comm.partnerInvoiceRef || 'LEAD-QUAL-PROOF'}
                      </code>
                    </td>
                    <td>
                      <strong className="num-tabular" style={{ fontSize: '0.92rem', color: 'var(--brand-navy)' }}>
                        ₹{comm.affiliateRewardSnapshot.toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>
                      {comm.tdsDeducted ? (
                        <span className="num-tabular" style={{ fontSize: '0.82rem', color: 'var(--status-rejected)' }}>
                          -{comm.tdsRate || 5}% (₹{comm.tdsDeducted})
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          5% on settlement
                        </span>
                      )}
                    </td>
                    <td>
                      <strong className="num-tabular" style={{ fontSize: '1rem', color: 'var(--finance-green)' }}>
                        ₹{(comm.netPayable || Math.round(comm.affiliateRewardSnapshot * 0.95)).toLocaleString('en-IN')}
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
                        {comm.status === 'pending' ? 'ESCROW LOCKED' : comm.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Disbursed Payouts Table */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '12px' }}>
          UPI Disbursal & Bank UTR Records
        </h3>

        {payouts.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No completed payouts recorded yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payout ID</th>
                  <th>Disbursed Date</th>
                  <th>Amount</th>
                  <th>Method & Destination</th>
                  <th>Bank UTR Reference</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((pay) => (
                  <tr key={pay.id}>
                    <td>
                      <strong style={{ color: 'var(--brand-navy)' }}>{pay.payoutReference}</strong>
                    </td>
                    <td>
                      <span className="num-tabular">
                        {pay.processedAt
                          ? new Date(pay.processedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <strong className="num-tabular" style={{ color: 'var(--finance-green)', fontSize: '1.05rem' }}>
                        ₹{pay.amountRupees.toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>
                      <span style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600 }}>{pay.paymentMethod}</span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {pay.vpa || pay.bankAccountMasked || 'UPI Rail'}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.82rem', color: 'var(--brand-navy)', fontWeight: 700, backgroundColor: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                        {pay.utrNumber || pay.transactionReference || 'UTR-CONFIRMED'}
                      </code>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                        onClick={() =>
                          setPayoutReceipt({
                            utr: pay.utrNumber || pay.transactionReference || 'UTR-8829104',
                            amount: pay.amountRupees,
                            vpa: pay.vpa || affiliateProfile.upiVpa || 'UPI',
                            payoutRef: pay.payoutReference,
                            date: pay.processedAt || new Date().toISOString()
                          })
                        }
                      >
                        <FileText size={12} />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Instant UPI Cashout */}
      {showUpiModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} color="var(--finance-green)" />
                <h2 className="modal-title">Instant UPI Cashout</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setShowUpiModal(false)}>✕</button>
            </div>

            <form onSubmit={handleUpiPayoutSubmit}>
              <div className="modal-body" style={{ padding: '20px' }}>
                <div
                  style={{
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    marginBottom: '16px',
                    fontSize: '0.82rem',
                    color: '#166534'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Available to Withdraw:</span>
                    <strong>₹{wallet.availableCashBal.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#15803D' }}>
                    ✓ 24/7 IMPS/UPI instant settlement via RazorpayX Rail
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Withdrawal Amount (₹) *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      className="form-input"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      max={wallet.availableCashBal}
                      min="100"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setWithdrawAmount(wallet.availableCashBal.toString())}
                    >
                      Max
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Destination UPI ID / VPA *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. mobile@upi or name@okhdfcbank"
                    value={upiInput}
                    onChange={(e) => setUpiInput(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                    Funds will credit directly to the bank account linked to this UPI VPA.
                  </span>
                </div>

                {/* Statutory Tax Notice */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    fontSize: '0.76rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span>Linked Tax PAN:</span>
                    <strong style={{ fontFamily: 'monospace' }}>{affiliateProfile.panNumber || 'ABCDE1234F'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>TDS Compliance:</span>
                    <span style={{ color: 'var(--finance-green)', fontWeight: 600 }}>Sec 194H Deducted at Settlement</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUpiModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--finance-green)', borderColor: 'var(--finance-green)' }}
                >
                  Confirm & Send ₹{parseFloat(withdrawAmount || '0').toLocaleString('en-IN')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Downloadable Official UTR Receipt */}
      {payoutReceipt && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center' }}>
            <div style={{ padding: '24px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <CheckCircle2 size={32} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                UPI Settlement Successful!
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Bank transfer initiated via RazorpayX Payment Rail
              </p>

              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Bank UTR Number:</span>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--brand-cobalt)' }}>{payoutReceipt.utr}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Net Disbursed Amount:</span>
                  <strong style={{ color: 'var(--finance-green)', fontSize: '1rem' }}>₹{payoutReceipt.amount.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Credited VPA:</span>
                  <span style={{ fontFamily: 'monospace' }}>{payoutReceipt.vpa}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payout Reference:</span>
                  <span>{payoutReceipt.payoutRef}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date & Timestamp:</span>
                  <span>{payoutReceipt.date}</span>
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => setPayoutReceipt(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tax PAN & UPI Settings */}
      {showTaxModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Tax PAN & UPI Settings</h2>
              <button className="modal-close-btn" onClick={() => setShowTaxModal(false)}>✕</button>
            </div>
            <form onSubmit={handleTaxUpdateSubmit}>
              <div className="modal-body" style={{ padding: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Permanent Account Number (PAN) *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={panInput}
                    onChange={(e) => setPanInput(e.target.value.toUpperCase())}
                    maxLength={10}
                    placeholder="e.g. ABCDE1234F"
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                    Valid 10-character Indian PAN enables statutory 5% Section 194H TDS rate instead of 20%.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Default UPI ID / VPA *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={upiInput}
                    onChange={(e) => setUpiInput(e.target.value)}
                    placeholder="e.g. name@okhdfcbank"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaxModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Tax Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
