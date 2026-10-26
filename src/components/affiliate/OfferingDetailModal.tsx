import React from 'react';
import { ProviderOffering } from '../../types';
import { useData } from '../../context/DataContext';
import { X, Send, MapPin, Building, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface OfferingDetailModalProps {
  offering: ProviderOffering;
  onClose: () => void;
  onReferClick: (offering: ProviderOffering) => void;
}

export const OfferingDetailModal: React.FC<OfferingDetailModalProps> = ({
  offering,
  onClose,
  onReferClick
}) => {
  const { providers } = useData();
  const provider = providers.find((p) => p.id === offering.providerId);

  const leadRule = offering.rewardRules.find((r) => r.eventType === 'qualified_lead' && r.isActive);
  const convRule = offering.rewardRules.find((r) => r.eventType === 'successful_conversion' && r.isActive);

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-neutral">Approved Offering v{offering.version}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <MapPin size={13} style={{ display: 'inline', marginRight: '3px' }} />
                {offering.serviceArea}
              </span>
            </div>
            <h2 className="modal-title">{offering.title}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Provider Card Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              marginBottom: '20px'
            }}
          >
            <div className="provider-avatar" style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>
              <Building size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--brand-navy)' }}>{provider?.businessName}</strong>
                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                  <ShieldCheck size={11} /> Verified Partner
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{provider?.tagline}</p>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              Service Overview
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {offering.description}
            </p>
          </div>

          {/* Included Features */}
          {offering.features && offering.features.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                What Customer Gets
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {offering.features.map((feat, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={15} color="var(--finance-green)" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Customer Price Box */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              marginBottom: '20px'
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Customer Retail Price (Decided by Provider)</span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--brand-navy)' }}>₹{offering.customerPriceRupees.toLocaleString('en-IN')}</strong>
            </div>
            <span className="badge badge-neutral">Priced by {provider?.businessName}</span>
          </div>

          {/* Economics & Earning Opportunities */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ marginBottom: '10px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '2px' }}>
                Your Referral Payouts (Decided by {provider?.businessName})
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Only the provider sets the service price and the exact cash reward you receive for giving a referral.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {/* Lead Gen Box */}
              {leadRule ? (
                <div
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--lead-teal-border)',
                    backgroundColor: 'var(--lead-teal-light)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--lead-teal)' }}>
                      LEAD GENERATOR REWARD
                    </span>
                    <span className="badge badge-lead-gen">No Sale Required</span>
                  </div>
                  <div className="num-tabular" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                    ₹{leadRule.affiliateRewardRupees.toLocaleString('en-IN')}
                  </div>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <strong>Qualification Rule:</strong> {leadRule.qualificationCriteria || 'Prospect verified within delivery zone.'}
                  </p>
                </div>
              ) : null}

              {/* Conversion Box */}
              {convRule ? (
                <div
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--finance-green-border)',
                    backgroundColor: 'var(--finance-green-light)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--finance-green)' }}>
                      LEAD CONVERTER REWARD
                    </span>
                    <span className="badge badge-conversion">Verified Sale</span>
                  </div>
                  <div className="num-tabular" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '6px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span>₹{convRule.affiliateRewardRupees.toLocaleString('en-IN')}</span>
                    {offering.customerPriceRupees > 0 && Math.round((convRule.affiliateRewardRupees / offering.customerPriceRupees) * 100) > 0 && (
                      <span style={{ fontSize: '0.85rem', color: '#16A34A', fontWeight: 700 }}>
                        ({Math.round((convRule.affiliateRewardRupees / offering.customerPriceRupees) * 100)}% of MRP)
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <strong>Conversion Trigger:</strong> {convRule.conversionCriteria || 'Completed customer purchase verified.'}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Customer Price:</span>{' '}
            <strong className="num-tabular" style={{ fontSize: '1.1rem', color: 'var(--brand-navy)' }}>
              ₹{offering.customerPriceRupees.toLocaleString('en-IN')}
            </strong>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onReferClick(offering);
              }}
            >
              <Send size={15} />
              <span>Refer a Contact</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
