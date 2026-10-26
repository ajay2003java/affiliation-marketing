import React, { useState } from 'react';
import { ProviderOffering } from '../../types';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import {
  Search,
  MapPin,
  Send,
  Eye,
  Sparkles,
  MessageCircle,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { ReferralModal } from './ReferralModal';
import { OfferingDetailModal } from './OfferingDetailModal';

export const BrowseServices: React.FC = () => {
  const { offerings, providers, categories, services, affiliateProfile } = useData();
  const { showNotification } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [rewardFilter, setRewardFilter] = useState<'all' | 'lead' | 'high_conv'>('all');
  const [sortBy, setSortBy] = useState<'reward_desc' | 'price_asc' | 'price_desc'>('reward_desc');

  const [copiedOfferingId, setCopiedOfferingId] = useState<string | null>(null);
  const [modalOffering, setModalOffering] = useState<ProviderOffering | null>(null);
  const [referralOffering, setReferralOffering] = useState<ProviderOffering | null>(null);

  // Filter only active approved offerings
  const activeOfferings = offerings.filter((o) => o.status === 'active');

  const filteredOfferings = activeOfferings.filter((offering) => {
    const provider = providers.find((p) => p.id === offering.providerId);
    const service = services.find((s) => s.id === offering.serviceId);

    // Category match
    if (selectedCategory !== 'all' && offering.categoryId !== selectedCategory) {
      return false;
    }

    // Location match
    if (selectedLocation !== 'all') {
      const matchCity =
        offering.serviceArea.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        provider?.city.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        offering.serviceArea.toLowerCase().includes('pan-india') ||
        offering.serviceArea.toLowerCase().includes('remote');
      if (!matchCity) return false;
    }

    // Reward type filter
    if (rewardFilter === 'lead') {
      const hasLeadReward = offering.rewardRules.some((r) => r.eventType === 'qualified_lead' && r.affiliateRewardRupees > 0);
      if (!hasLeadReward) return false;
    } else if (rewardFilter === 'high_conv') {
      const hasHighConv = offering.rewardRules.some((r) => r.eventType === 'successful_conversion' && r.affiliateRewardRupees >= 2000);
      if (!hasHighConv) return false;
    }

    // Search query match (Title, description, provider name, search keywords)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = offering.title.toLowerCase().includes(q);
      const matchDesc = offering.description.toLowerCase().includes(q);
      const matchProvider = provider?.businessName.toLowerCase().includes(q);
      const matchTerms = service?.searchTerms.some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchDesc || matchProvider || matchTerms;
    }

    return true;
  });

  // Sorting
  const sortedOfferings = [...filteredOfferings].sort((a, b) => {
    const maxRewardA = Math.max(...a.rewardRules.map((r) => r.affiliateRewardRupees), 0);
    const maxRewardB = Math.max(...b.rewardRules.map((r) => r.affiliateRewardRupees), 0);

    if (sortBy === 'reward_desc') {
      return maxRewardB - maxRewardA;
    } else if (sortBy === 'price_asc') {
      return a.customerPriceRupees - b.customerPriceRupees;
    } else if (sortBy === 'price_desc') {
      return b.customerPriceRupees - a.customerPriceRupees;
    }
    return 0;
  });

  const handleCopyLink = (offering: ProviderOffering) => {
    const link = `https://refer.opnetwork.in/s/${offering.id}?ref=${affiliateProfile.userId}`;
    navigator.clipboard.writeText(link);
    setCopiedOfferingId(offering.id);
    showNotification(`Trackable referral link for "${offering.title}" copied!`, 'success');
    setTimeout(() => setCopiedOfferingId(null), 2500);
  };

  const handleWhatsAppShare = (offering: ProviderOffering) => {
    const link = `https://refer.opnetwork.in/s/${offering.id}?ref=${affiliateProfile.userId}`;
    const text = `Hi! I recommend checking out "${offering.title}" (₹${offering.customerPriceRupees.toLocaleString('en-IN')}) with verified priority booking: ${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="page-title">Explore Verified Services & Rewards</h2>
          <p className="page-subtitle">
            Choose from client services across healthcare, IT, corporate and consulting. Share instantly via WhatsApp or submit client referrals directly.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar" style={{ gap: '12px', flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ minWidth: '280px', flex: 1 }}>
          <Search size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by test name, consultation, corporate role, or provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Reward Type Quick Filter */}
        <div style={{ minWidth: '190px' }}>
          <select
            className="form-select"
            value={rewardFilter}
            onChange={(e) => setRewardFilter(e.target.value as any)}
          >
            <option value="all">⚡ All Reward Types</option>
            <option value="lead">🎯 Pay on Lead (No sale needed)</option>
            <option value="high_conv">🔥 High Payouts (&gt; ₹2,000)</option>
          </select>
        </div>

        {/* Location selector */}
        <div style={{ minWidth: '160px' }}>
          <select
            className="form-select"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="all">📍 All Locations</option>
            <option value="hyderabad">Hyderabad</option>
            <option value="visakhapatnam">Visakhapatnam</option>
            <option value="pan-india">Pan-India / Remote</option>
          </select>
        </div>

        {/* Sort By selector */}
        <div style={{ minWidth: '170px' }}>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="reward_desc">Sort: Highest Reward</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-pills" style={{ marginBottom: '24px' }}>
        <button
          className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All Categories ({activeOfferings.length})
        </button>
        {categories.map((cat) => {
          const count = activeOfferings.filter((o) => o.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Results Count Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
        <span>Showing <strong>{sortedOfferings.length}</strong> available offerings</span>
        <span style={{ color: 'var(--lead-teal)', fontWeight: 600 }}>✓ Verified Partner Pricing & MoUs</span>
      </div>

      {/* Offerings Grid */}
      {sortedOfferings.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)'
          }}
        >
          <Sparkles size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--brand-navy)' }}>No matching offerings found</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Try clearing filters or adjusting your search keywords.
          </p>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedLocation('all');
              setRewardFilter('all');
            }}
            style={{ marginTop: '12px' }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="offerings-grid">
          {sortedOfferings.map((offering) => {
            const provider = providers.find((p) => p.id === offering.providerId);
            const leadRule = offering.rewardRules.find((r) => r.eventType === 'qualified_lead' && r.isActive);
            const convRule = offering.rewardRules.find((r) => r.eventType === 'successful_conversion' && r.isActive);
            const maxAffiliateReward = Math.max(
              (leadRule?.affiliateRewardRupees || 0) + (convRule?.affiliateRewardRupees || 0),
              convRule?.affiliateRewardRupees || 0,
              leadRule?.affiliateRewardRupees || 0
            );

            return (
              <div key={offering.id} className="offering-card" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Provider Header */}
                <div className="offering-provider-meta">
                  <div className="provider-avatar">
                    {provider?.businessName.charAt(0) || 'P'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="provider-name">{provider?.businessName}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      <MapPin size={11} />
                      <span className="truncate">{offering.serviceArea}</span>
                    </div>
                  </div>
                  {maxAffiliateReward > 0 && (
                    <span
                      style={{
                        backgroundColor: 'var(--finance-green-light)',
                        color: 'var(--finance-green)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '10px',
                        border: '1px solid var(--finance-green-border)'
                      }}
                      title="Maximum potential earnings per referral"
                    >
                      Up to ₹{maxAffiliateReward.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* Offering Title & Description */}
                <h3 className="offering-title" style={{ fontSize: '1.05rem', lineHeight: 1.3 }}>
                  {offering.title}
                </h3>
                <p className="offering-description" style={{ fontSize: '0.82rem', marginBottom: '14px' }}>
                  {offering.description}
                </p>

                {/* Transparent Economics Box */}
                <div className="offering-economics-box" style={{ marginBottom: '16px' }}>
                  <div className="econ-row">
                    <span className="econ-label">Customer Price (Set by Provider)</span>
                    <span className="econ-price num-tabular" style={{ fontSize: '1rem', color: 'var(--brand-navy)', fontWeight: 800 }}>
                      ₹{offering.customerPriceRupees.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Your Referral Rewards (Decided by {provider?.businessName}):
                    </span>
                    <div className="reward-pills-row">
                      {leadRule && (
                        <div className="reward-pill-badge lead" title="Direct reward paid by provider when customer contact & interest are verified">
                          <Zap size={11} />
                          <span>Lead:</span>
                          <strong className="num-tabular">₹{leadRule.affiliateRewardRupees.toLocaleString('en-IN')}</strong>
                        </div>
                      )}
                      {convRule && (() => {
                        const convPct = offering.customerPriceRupees > 0
                          ? Math.round((convRule.affiliateRewardRupees / offering.customerPriceRupees) * 100)
                          : 0;
                        return (
                          <div className="reward-pill-badge conv" title={`Direct reward paid by provider when customer purchase completes (${convPct}% of MRP)`}>
                            <TrendingUp size={11} />
                            <span>Sale:</span>
                            <strong className="num-tabular">₹{convRule.affiliateRewardRupees.toLocaleString('en-IN')}</strong>
                            {convPct > 0 && (
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, opacity: 0.9 }}>
                                ({convPct}%)
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Instant Share Bar: WhatsApp & Copy Link */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '12px'
                  }}
                >
                  <button
                    className="btn btn-sm"
                    style={{
                      flex: 1,
                      backgroundColor: '#25D366',
                      color: '#FFF',
                      fontSize: '0.74rem',
                      padding: '5px 8px',
                      border: 'none',
                      fontWeight: 700
                    }}
                    onClick={() => handleWhatsAppShare(offering)}
                    title="Share this service to WhatsApp contacts"
                  >
                    <MessageCircle size={13} />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    className="btn btn-outline btn-sm"
                    style={{
                      flex: 1,
                      fontSize: '0.74rem',
                      padding: '5px 8px',
                      backgroundColor: '#FFF'
                    }}
                    onClick={() => handleCopyLink(offering)}
                    title="Copy your personal referral link"
                  >
                    {copiedOfferingId === offering.id ? (
                      <>
                        <Check size={13} color="var(--finance-green)" />
                        <span style={{ color: 'var(--finance-green)' }}>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Card Primary Actions: Details & Direct Refer */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, fontSize: '0.82rem' }}
                    onClick={() => setModalOffering(offering)}
                  >
                    <Eye size={13} />
                    <span>Details</span>
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1.5, fontSize: '0.82rem' }}
                    onClick={() => setReferralOffering(offering)}
                  >
                    <Send size={13} />
                    <span>Refer Contact</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
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
