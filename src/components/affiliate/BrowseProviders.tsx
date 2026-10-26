import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Provider, ProviderOffering } from '../../types';
import { Building2, ShieldCheck, MapPin, Send, Eye, FileText, ChevronRight } from 'lucide-react';
import { ReferralModal } from './ReferralModal';
import { OfferingDetailModal } from './OfferingDetailModal';

export const BrowseProviders: React.FC = () => {
  const { providers, offerings } = useData();

  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [modalOffering, setModalOffering] = useState<ProviderOffering | null>(null);
  const [referralOffering, setReferralOffering] = useState<ProviderOffering | null>(null);

  const selectedProvider = providers.find((p) => p.id === selectedProviderId);
  const providerOfferings = offerings.filter(
    (o) => o.status === 'active' && (!selectedProviderId || o.providerId === selectedProviderId)
  );

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Browse by Provider</h2>
        <p className="page-subtitle">
          Explore trusted client institutions, verified legal agreements (MoU), and their active service listings.
        </p>
      </div>

      {/* Provider Brand Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {providers.map((prov) => {
          const provActiveCount = offerings.filter((o) => o.providerId === prov.id && o.status === 'active').length;
          const isSelected = selectedProviderId === prov.id;

          return (
            <div
              key={prov.id}
              onClick={() => setSelectedProviderId(isSelected ? null : prov.id)}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: `2px solid ${isSelected ? 'var(--brand-cobalt)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                cursor: 'pointer',
                boxShadow: isSelected ? 'var(--shadow-elevated)' : 'var(--shadow-card)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    className="provider-avatar"
                    style={{ width: '44px', height: '44px', fontSize: '1.2rem', backgroundColor: 'var(--brand-navy)', color: '#FFF' }}
                  >
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                      {prov.businessName}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <MapPin size={12} style={{ display: 'inline', marginRight: '2px' }} />
                      {prov.city}
                    </span>
                  </div>
                </div>

                {prov.agreementStatus === 'active' && (
                  <span className="badge badge-success">
                    <ShieldCheck size={12} /> MoU Verified
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
                {prov.tagline}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-light)',
                  fontSize: '0.8rem'
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>
                  Active Offerings: <strong>{provActiveCount}</strong>
                </span>
                <span style={{ color: 'var(--brand-cobalt)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isSelected ? 'Viewing Listings' : 'View Services'}
                  <ChevronRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Provider Offerings Section */}
      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
              {selectedProvider ? `Approved Offerings by ${selectedProvider.businessName}` : 'All Provider Offerings'}
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Showing {providerOfferings.length} active service listings
            </span>
          </div>
          {selectedProviderId && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setSelectedProviderId(null)}
            >
              Clear Filter (View All)
            </button>
          )}
        </div>

        <div className="offerings-grid">
          {providerOfferings.map((offering) => {
            const provider = providers.find((p) => p.id === offering.providerId);
            const leadRule = offering.rewardRules.find((r) => r.eventType === 'qualified_lead' && r.isActive);
            const convRule = offering.rewardRules.find((r) => r.eventType === 'successful_conversion' && r.isActive);

            return (
              <div key={offering.id} className="offering-card">
                <div className="offering-provider-meta">
                  <span className="provider-name">{provider?.businessName}</span>
                </div>
                <h4 className="offering-title">{offering.title}</h4>
                <p className="offering-description">{offering.description}</p>

                <div className="offering-economics-box">
                  <div className="econ-row">
                    <span className="econ-label">Customer Price</span>
                    <span className="econ-price num-tabular">
                      ₹{offering.customerPriceRupees.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="reward-pills-row">
                    {leadRule && (
                      <div className="reward-pill-badge lead">
                        <span>Lead Gen:</span>
                        <strong className="num-tabular">₹{leadRule.affiliateRewardRupees.toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                    {convRule && (
                      <div className="reward-pill-badge conv">
                        <span>Conversion:</span>
                        <strong className="num-tabular">₹{convRule.affiliateRewardRupees.toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => setModalOffering(offering)}
                  >
                    <Eye size={14} />
                    <span>Details</span>
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1.3 }}
                    onClick={() => setReferralOffering(offering)}
                  >
                    <Send size={14} />
                    <span>Refer Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
    </div>
  );
};
