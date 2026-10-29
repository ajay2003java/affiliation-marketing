import React from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, FileText, CheckCircle2, Building, Clock } from 'lucide-react';
import { Provider } from '../../types';

export const AgreementView: React.FC = () => {
  const { providers, offerings } = useData();
  const { activeProviderId } = useApp();

  const activeProvider: Provider | undefined = providers.find((p) => p.id === activeProviderId) || providers[0];

  if (!activeProvider) {
    return (
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--brand-navy)' }}>No Active MoU Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>No provider business is registered in the database yet.</p>
        </div>
      </div>
    );
  }

  const activeAgreement = activeProvider.activeAgreements && activeProvider.activeAgreements[0];

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      <div className="page-header">
        <h2 className="page-title">Partnership Agreement & Memorandum of Understanding (MoU)</h2>
        <p className="page-subtitle">
          Commercial agreement between the affiliate platform network and <strong>{activeProvider.businessName}</strong>.
        </p>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        {/* Agreement Status Banner */}
        {activeAgreement ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              backgroundColor: '#E6F7F0',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #A3E6CD',
              marginBottom: '28px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={24} color="#0E8A5E" />
              <div>
                <strong style={{ fontSize: '0.98rem', color: '#0E8A5E' }}>
                  {activeAgreement.title}
                </strong>
                <p style={{ fontSize: '0.8rem', color: '#475569' }}>
                  Effective Date: <strong>{activeAgreement.effectiveDate}</strong> • Ref: <strong>{activeAgreement.documentRef}</strong>
                </p>
              </div>
            </div>
            <span className="badge badge-success" style={{ fontSize: '0.8rem' }}>
              ACTIVE & VERIFIED
            </span>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              backgroundColor: '#EBF3FF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #BFDBFE',
              marginBottom: '28px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={24} color="#0052CC" />
              <div>
                <strong style={{ fontSize: '0.98rem', color: '#0052CC' }}>
                  Standard Affiliate Partnership Terms Accepted
                </strong>
                <p style={{ fontSize: '0.8rem', color: '#475569' }}>
                  Commercial terms govern approved offerings under Annexure A.
                </p>
              </div>
            </div>
            <span className="badge badge-lead-gen" style={{ fontSize: '0.8rem' }}>
              ONLINE EXECUTION
            </span>
          </div>
        )}

        {/* Parties to the Agreement */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
          {/* Party A */}
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              PARTY A — AFFILIATE NETWORK FACILITATOR
            </span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--brand-navy)', marginTop: '4px' }}>
              Ottobon Professional Services
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
              Suite 102, A Square Business Centre, Waltair Main Road, Visakhapatnam, Andhra Pradesh
            </p>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Representative: <strong>Bhanu Bonu</strong> (Chief Executive)<br />
              Email: <code>academy@ottobon.in</code>
            </div>
          </div>

          {/* Party B: Dynamic to ANY active provider */}
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              PARTY B — CLIENT / PROVIDER PARTNER
            </span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--brand-navy)', marginTop: '4px' }}>
              {activeProvider.businessName}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
              {activeProvider.address}, {activeProvider.city}
            </p>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Representative: <strong>{activeProvider.contactPerson}</strong><br />
              Email: <code>{activeProvider.email}</code> • Phone: <code>{activeProvider.phone}</code>
            </div>
          </div>
        </div>

        {/* Core MoU Clauses Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <div>
            <strong style={{ color: 'var(--brand-navy)', display: 'block', fontSize: '0.92rem' }}>
              1. Purpose & Referral Facilitation
            </strong>
            <p>
              Establishes a non-exclusive collaboration under which affiliate partners introduce prospective clients and leads for {activeProvider.businessName}'s approved service offerings. The provider manages client consultation, fulfillment, and reconciles agreed referral fees.
            </p>
          </div>

          <div>
            <strong style={{ color: 'var(--brand-navy)', display: 'block', fontSize: '0.92rem' }}>
              2. Commercial Schedule & Annexure A Terms (% of MRP Model)
            </strong>
            <p style={{ marginBottom: '12px' }}>
              Under this signed agreement, {activeProvider.businessName} provides an agreed percentage of the service retail / MRP price as the gross referral fee. In accordance with the sBLOOM bilateral charter, this fee is strictly distributed on a 50/50 basis between the referring affiliate and the platform facilitator.
            </p>

            {/* Live Offering Rate Card */}
            {offerings.filter((o) => o.providerId === activeProvider.id).length > 0 && (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden', marginTop: '10px', marginBottom: '14px' }}>
                <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0A2540', textTransform: 'uppercase' }}>
                    Annexure A: Active Services & Executed MoU Referral Rates
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#0E8A5E', fontWeight: 600 }}>
                    50/50 Split Model Enforced
                  </span>
                </div>
                <div className="table-responsive">
                  <table className="data-table" style={{ fontSize: '0.8rem', margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Service Package</th>
                        <th>Retail MRP Price</th>
                        <th>Client Referral Fee</th>
                        <th>50/50 Distribution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offerings.filter((o) => o.providerId === activeProvider.id).map((offering) => {
                        const conv = offering.rewardRules.find((r) => r.eventType === 'successful_conversion');
                        const pFee = conv?.providerFeeRupees || 800;
                        const aReward = conv?.affiliateRewardRupees || 400;
                        const sMargin = pFee - aReward;
                        const mrp = offering.customerPriceRupees || 2000;
                        const pct = mrp > 0 ? Math.round((pFee / mrp) * 100) : 40;
                        const halfPct = (pct / 2).toFixed(pct % 2 === 0 ? 0 : 1);

                        return (
                          <tr key={offering.id}>
                            <td>
                              <strong style={{ color: '#0A2540' }}>{offering.title}</strong>
                            </td>
                            <td className="num-tabular" style={{ color: '#0F172A', fontWeight: 600 }}>
                              ₹{mrp.toLocaleString('en-IN')}
                            </td>
                            <td>
                              <span style={{ color: '#B45309', fontWeight: 700 }}>
                                {pct}% of MRP (₹{pFee.toLocaleString('en-IN')})
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.74rem' }}>
                                <span style={{ color: '#0E8A5E', fontWeight: 600 }}>
                                  👤 Affiliate: {halfPct}% (₹{aReward.toLocaleString('en-IN')})
                                </span>
                                <span style={{ color: '#0052CC', fontWeight: 600 }}>
                                  🏢 sBLOOM: {halfPct}% (₹{sMargin.toLocaleString('en-IN')})
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div>
            <strong style={{ color: 'var(--brand-navy)', display: 'block', fontSize: '0.92rem' }}>
              3. Attribution & Audit Rights
            </strong>
            <p>
              Referral status updates, lead qualification decisions, and conversion confirmations submitted by {activeProvider.businessName} are recorded directly in the shared referral register and financial ledger for multi-party reconciliation. Real-time telephony logs and customer consent timestamps are immutably archived.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
