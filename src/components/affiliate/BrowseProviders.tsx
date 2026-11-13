import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { Provider, ProviderOffering, getProviderSector } from '../../types';
import {
  Building2,
  ShieldCheck,
  MapPin,
  Send,
  Eye,
  ChevronRight,
  HeartPulse,
  GraduationCap,
  Search,
  RotateCcw,
  CheckCircle,
  MessageCircle,
  Zap,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { ReferralModal } from './ReferralModal';
import { OfferingDetailModal } from './OfferingDetailModal';

export const BrowseProviders: React.FC = () => {
  const { providers, offerings, affiliateProfile } = useData();
  const { currentUser } = useApp();

  const userCity =
    currentUser?.city ||
    affiliateProfile?.city ||
    affiliateProfile?.preferredArea ||
    localStorage.getItem('affiliate_selected_city') ||
    'Hyderabad';

  const getInitialLocation = () => {
    const c = userCity.toLowerCase();
    if (c.includes('vizag') || c.includes('visakhapatnam')) return 'visakhapatnam (vizag)';
    if (c.includes('vijayawada')) return 'vijayawada';
    if (c.includes('secunderabad')) return 'secunderabad';
    if (c.includes('hitec') || c.includes('madhapur')) return 'hitec city / madhapur';
    if (c.includes('gachibowli')) return 'gachibowli';
    if (c.includes('kukatpally')) return 'kukatpally';
    if (c.includes('jubilee')) return 'jubilee hills';
    if (c.includes('hyderabad')) return 'hyderabad';
    return 'all';
  };

  const [selectedSector, setSelectedSector] = useState<'all' | 'healthcare' | 'education' | 'corporate'>('healthcare');
  const [selectedLocation, setSelectedLocation] = useState<string>(getInitialLocation);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [modalOffering, setModalOffering] = useState<ProviderOffering | null>(null);
  const [referralOffering, setReferralOffering] = useState<ProviderOffering | null>(null);

  // Location filter helper
  const matchesLocation = (provider: Provider, loc: string = 'all'): boolean => {
    if (loc === 'all') return true;
    const q = loc.toLowerCase().trim();

    const areaKeywords: Record<string, string[]> = {
      hyderabad: ['hyderabad', 'telangana'],
      'visakhapatnam (vizag)': ['visakhapatnam', 'vizag', 'waltair', 'siripuram', 'mvp colony', 'gajuwaka'],
      visakhapatnam: ['visakhapatnam', 'vizag', 'waltair', 'siripuram', 'mvp colony', 'gajuwaka'],
      vizag: ['visakhapatnam', 'vizag', 'waltair', 'siripuram', 'mvp colony', 'gajuwaka'],
      vijayawada: ['vijayawada', 'benz circle', 'amaravati'],
      secunderabad: ['secunderabad', 'marredpally', 'tarnaka'],
      'hitec city / madhapur': ['hitec', 'madhapur', 'cyber', 'kondapur'],
      gachibowli: ['gachibowli', 'financial district', 'nanakramguda', 'rayadurg'],
      kukatpally: ['kukatpally', 'kphb', 'ameerpet', 'miyapur', 'nizampet'],
      'jubilee hills': ['jubilee', 'banjara', 'film nagar']
    };

    const matchedKeywords = areaKeywords[q] || [q];
    const haystacks = [
      provider.city,
      provider.address,
      ...(provider.serviceAreas || [])
    ].map((s) => (s || '').toLowerCase());

    return matchedKeywords.some((kw) => haystacks.some((h) => h.includes(kw)));
  };

  // Sector Counts
  const healthcareCount = providers.filter((p) => getProviderSector(p) === 'healthcare').length;
  const educationCount = providers.filter((p) => getProviderSector(p) === 'education').length;
  const corporateCount = providers.filter((p) => getProviderSector(p) === 'corporate').length;

  const locationOptions = [
    { id: 'all', label: '📍 All Locations' },
    { id: 'visakhapatnam (vizag)', label: 'Visakhapatnam (Vizag)' },
    { id: 'hyderabad', label: 'Hyderabad' },
    { id: 'vijayawada', label: 'Vijayawada' },
    { id: 'secunderabad', label: 'Secunderabad' },
    { id: 'hitec city / madhapur', label: 'Hitec City / Madhapur' },
    { id: 'gachibowli', label: 'Gachibowli' },
    { id: 'kukatpally', label: 'Kukatpally' },
    { id: 'jubilee hills', label: 'Jubilee Hills' }
  ];

  // Filtered providers
  const filteredProviders = useMemo(() => {
    return providers.filter((prov) => {
      if (selectedSector !== 'all') {
        const sector = getProviderSector(prov);
        if (sector !== selectedSector) return false;
      }
      if (!matchesLocation(prov, selectedLocation)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const provOfferings = offerings.filter((o) => o.providerId === prov.id);
        const matchName = prov.businessName.toLowerCase().includes(q);
        const matchTag = (prov.tagline || '').toLowerCase().includes(q);
        const matchDesc = (prov.description || '').toLowerCase().includes(q);
        const matchCity = prov.city.toLowerCase().includes(q);
        const matchOff = provOfferings.some(
          (o) => o.title.toLowerCase().includes(q) || (o.description || '').toLowerCase().includes(q)
        );
        return matchName || matchTag || matchDesc || matchCity || matchOff;
      }
      return true;
    });
  }, [providers, offerings, selectedSector, selectedLocation, searchQuery]);

  const selectedProvider = providers.find((p) => p.id === selectedProviderId);

  // Filtered offerings based on selected provider or all filtered providers
  const activeOfferings = useMemo(() => {
    const validProviderIds = new Set(filteredProviders.map((p) => p.id));
    return offerings.filter((o) => {
      if (o.status !== 'active') return false;
      if (selectedProviderId) return o.providerId === selectedProviderId;
      return validProviderIds.has(o.providerId);
    });
  }, [offerings, filteredProviders, selectedProviderId]);

  const handleWhatsAppShare = (title: string, offeringId: string) => {
    const link = `https://refer.opnetwork.in/s/${offeringId}?ref=AFF-7821`;
    const shareText = `Hey! Check out this verified partner service: "${title}". You can book with special partner priority here: ${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2 className="page-title">Client Partners Directory</h2>
        <p className="page-subtitle">
          Explore accredited institutions, verified legal agreements (MoU), and high-reward service offerings across Telangana.
        </p>
      </div>

      {/* 1. SECTOR SELECTION CARDS */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--brand-navy)', color: '#FFF', fontSize: '0.75rem', fontWeight: 800 }}>1</span>
          <span>Select Sector:</span>
          {selectedSector !== 'all' && (
            <button
              onClick={() => {
                setSelectedSector('all');
                setSelectedProviderId(null);
              }}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--brand-cobalt)', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Show All Sectors ({providers.length} Partners)
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {/* Healthcare */}
          <div
            onClick={() => {
              setSelectedSector('healthcare');
              setSelectedProviderId(null);
            }}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: `2px solid ${selectedSector === 'healthcare' ? '#047857' : '#E2E8F0'}`,
              backgroundColor: selectedSector === 'healthcare' ? '#F0FDF4' : '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: selectedSector === 'healthcare' ? '#047857' : '#E2E8F0',
                color: selectedSector === 'healthcare' ? '#FFFFFF' : '#047857',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HeartPulse size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  Healthcare
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700 }}>
                  {healthcareCount} Verified Clinics & Labs
                </span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Diagnostic pathology labs, medical checkups, blood tests, and scans.
            </p>
            {selectedSector === 'healthcare' && (
              <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#047857' }}>
                <CheckCircle size={16} />
              </div>
            )}
          </div>

          {/* Educational Institutes */}
          <div
            onClick={() => {
              setSelectedSector('education');
              setSelectedProviderId(null);
            }}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: `2px solid ${selectedSector === 'education' ? '#0052CC' : '#E2E8F0'}`,
              backgroundColor: selectedSector === 'education' ? '#EFF6FF' : '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: selectedSector === 'education' ? '#0052CC' : '#E2E8F0',
                color: selectedSector === 'education' ? '#FFFFFF' : '#0052CC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <GraduationCap size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  Educational Institutes
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#0052CC', fontWeight: 700 }}>
                  {educationCount} Verified Academies
                </span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              K-12 international schools, IIT-JEE / NEET academies, and tech certifications.
            </p>
            {selectedSector === 'education' && (
              <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#0052CC' }}>
                <CheckCircle size={16} />
              </div>
            )}
          </div>

          {/* Corporate Services */}
          <div
            onClick={() => {
              setSelectedSector('corporate');
              setSelectedProviderId(null);
            }}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: `2px solid ${selectedSector === 'corporate' ? '#D97706' : '#E2E8F0'}`,
              backgroundColor: selectedSector === 'corporate' ? '#FFFBEB' : '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: selectedSector === 'corporate' ? '#D97706' : '#E2E8F0',
                color: selectedSector === 'corporate' ? '#FFFFFF' : '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  Corporate Services
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 700 }}>
                  {corporateCount} B2B Partners
                </span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Cloud ERP platforms, custom software development, and executive services.
            </p>
            {selectedSector === 'corporate' && (
              <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#D97706' }}>
                <CheckCircle size={16} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. LOCATION & SEARCH BAR */}
      <div style={{
        backgroundColor: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        padding: '12px 16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--brand-navy)', color: '#FFF', fontSize: '0.75rem', fontWeight: 800 }}>2</span>
            <MapPin size={15} color="var(--brand-cobalt)" />
            <span>Select Location / Area:</span>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search partner, course, test..."
              style={{
                width: '100%',
                padding: '6px 12px 6px 32px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '0.82rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Location Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {locationOptions.map((loc) => {
            const isSelected = selectedLocation.toLowerCase() === loc.id.toLowerCase();
            return (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc.id)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.76rem',
                  fontWeight: isSelected ? 700 : 500,
                  border: `1.5px solid ${isSelected ? 'var(--brand-cobalt)' : '#CBD5E1'}`,
                  backgroundColor: isSelected ? 'var(--brand-cobalt)' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {loc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. FILTERED PROVIDER CARDS */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
            Showing {filteredProviders.length} matching institutions
          </div>
          {selectedProviderId && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setSelectedProviderId(null)}
              style={{ fontSize: '0.76rem' }}
            >
              Clear Selected Partner (View All)
            </button>
          )}
        </div>

        {filteredProviders.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '36px 20px',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px dashed #CBD5E1'
            }}
          >
            <Building2 size={36} color="#94A3B8" style={{ marginBottom: '10px' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-navy)', margin: '0 0 6px' }}>
              No institutions found in this location
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 14px' }}>
              Reset location filter to explore all verified Telangana partners.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setSelectedLocation('all');
                setSearchQuery('');
              }}
            >
              <RotateCcw size={13} />
              <span>Show All Locations</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredProviders.map((prov) => {
              const provActiveCount = offerings.filter((o) => o.providerId === prov.id && o.status === 'active').length;
              const isSelected = selectedProviderId === prov.id;
              const sector = getProviderSector(prov);

              return (
                <div
                  key={prov.id}
                  onClick={() => setSelectedProviderId(isSelected ? null : prov.id)}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: `2px solid ${isSelected ? 'var(--brand-cobalt)' : 'var(--border-light)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '18px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? 'var(--shadow-elevated)' : 'var(--shadow-card)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        className="provider-avatar"
                        style={{
                          width: '42px',
                          height: '42px',
                          fontSize: '1.1rem',
                          backgroundColor:
                            sector === 'healthcare'
                              ? '#047857'
                              : sector === 'education'
                              ? '#0052CC'
                              : '#D97706',
                          color: '#FFF'
                        }}
                      >
                        {sector === 'healthcare' ? (
                          <HeartPulse size={20} />
                        ) : sector === 'education' ? (
                          <GraduationCap size={20} />
                        ) : (
                          <Building2 size={20} />
                        )}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-navy)', margin: 0 }}>
                          {prov.businessName}
                        </h3>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          <MapPin size={11} style={{ display: 'inline', marginRight: '2px' }} />
                          {prov.address ? `${prov.address}, ` : ''}{prov.city}
                        </span>
                      </div>
                    </div>

                    <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                      <ShieldCheck size={11} /> MoU Verified
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
                    {prov.tagline}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-light)',
                      fontSize: '0.78rem'
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>
                      Active Packages: <strong>{provActiveCount}</strong>
                    </span>
                    <span style={{ color: 'var(--brand-cobalt)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isSelected ? 'Viewing Packages' : 'View Packages'}
                      <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. ACTIVE OFFERINGS SECTION */}
      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
              {selectedProvider ? `Approved Packages by ${selectedProvider.businessName}` : 'Service Packages & Offerings'}
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Showing {activeOfferings.length} active service listings
            </span>
          </div>
          {selectedProviderId && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setSelectedProviderId(null)}
            >
              Clear Selection (Show All)
            </button>
          )}
        </div>

        <div className="offerings-grid">
          {activeOfferings.map((offering) => {
            const provider = providers.find((p) => p.id === offering.providerId);
            const leadRule = offering.rewardRules.find((r) => r.eventType === 'qualified_lead' && r.isActive);
            const convRule = offering.rewardRules.find((r) => r.eventType === 'successful_conversion' && r.isActive);

            return (
              <div key={offering.id} className="offering-card">
                <div className="offering-provider-meta">
                  <span className="provider-name">{provider?.businessName}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                    📍 {offering.serviceArea}
                  </span>
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
                        <Zap size={11} />
                        <span>Lead Reward:</span>
                        <strong className="num-tabular">₹{leadRule.affiliateRewardRupees.toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                    {convRule && (
                      <div className="reward-pill-badge conv">
                        <TrendingUp size={11} />
                        <span>Sale Reward:</span>
                        <strong className="num-tabular">₹{convRule.affiliateRewardRupees.toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1.2fr', gap: '6px', marginTop: 'auto' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleWhatsAppShare(offering.title, offering.id)}
                    title="Share via WhatsApp"
                    style={{ padding: '6px 10px' }}
                  >
                    <MessageCircle size={14} color="#25D366" />
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setModalOffering(offering)}
                    style={{ fontSize: '0.76rem' }}
                  >
                    <Eye size={13} />
                    <span>Details</span>
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setReferralOffering(offering)}
                    style={{ fontSize: '0.76rem', fontWeight: 700 }}
                  >
                    <Send size={13} />
                    <span>Submit Lead Details</span>
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
