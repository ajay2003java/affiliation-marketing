import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { Provider, ProviderOffering } from '../../types';
import { MOCK_PROVIDERS } from '../../services/mockData';
import { CheckCircle2, Clock, XCircle, Sparkles, Edit2, Pause, Play, Upload, Search, X } from 'lucide-react';
import { AddServicesModal } from './AddServicesModal';

export const OfferingManager: React.FC = () => {
  const { offerings, providers, updateOffering } = useData();
  const { activeProviderId, showNotification, currentUser, currentRole } = useApp();

  const activeProvider: Provider | undefined =
    providers.find(
      (p) =>
        p.id === activeProviderId ||
        p.userId === activeProviderId ||
        (currentUser.email && p.email?.toLowerCase() === currentUser.email?.toLowerCase())
    ) ||
    MOCK_PROVIDERS.find(
      (p) =>
        p.id === activeProviderId ||
        p.userId === activeProviderId ||
        (currentUser.email && p.email?.toLowerCase() === currentUser.email?.toLowerCase())
    ) ||
    (currentRole === 'provider' ? (providers.find(p => p.status === 'active') || providers[0] || MOCK_PROVIDERS[0]) : undefined);

  // Dynamic: Offerings belonging to the currently active provider
  const providerOfferings = activeProvider
    ? offerings.filter((o) => o.providerId === activeProvider.id || (activeProviderId && o.providerId === activeProviderId))
    : [];

  const [showModal, setShowModal] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'upload' | 'manual'>('upload');
  const [editingOffering, setEditingOffering] = useState<ProviderOffering | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

  if (!activeProvider) {
    return (
      <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--brand-navy)' }}>No Provider Business Found</h3>
        <p style={{ color: 'var(--text-muted)' }}>No provider business is registered in the database yet.</p>
      </div>
    );
  }

  // Filtered offerings based on search and status
  const filteredOfferings = providerOfferings.filter((offering) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      offering.title.toLowerCase().includes(q) ||
      offering.customerPriceRupees.toString().includes(q);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && offering.status === 'active') ||
      (statusFilter === 'paused' && offering.status === 'paused');

    return matchesSearch && matchesStatus;
  });

  // Toggle offering active/paused status
  const handleToggleOfferingStatus = (offering: ProviderOffering) => {
    const newStatus = offering.status === 'active' ? 'paused' : 'active';
    updateOffering(offering.id, { status: newStatus }, false);
    showNotification(
      newStatus === 'paused'
        ? `"${offering.title}" is now Paused. Affiliates cannot submit new referrals while paused.`
        : `"${offering.title}" is now Live & Active. Receiving affiliate referrals.`,
      newStatus === 'paused' ? 'warning' : 'success'
    );
  };

  // Edit Form Fields
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [branchNewVersion, setBranchNewVersion] = useState(true);

  const openEditModal = (offering: ProviderOffering) => {
    setEditingOffering(offering);
    setEditTitle(offering.title);
    setEditPrice(offering.customerPriceRupees);
    setBranchNewVersion(true);
  };

  const handleSaveOfferingEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffering) return;

    const mouPct = activeProvider.commissionPercent || activeProvider.activeAgreements?.[0]?.grossReferralPct || 40;
    const newPrice = Number(editPrice) || 0;
    const convFee = Math.round(newPrice * (mouPct / 100));
    const affiliateReward = Math.round(convFee * 0.5);

    const updatedRules = (editingOffering.rewardRules || []).map((r) => {
      if (r.eventType === 'qualified_lead') {
        return {
          ...r,
          version: branchNewVersion ? (r.version || 1) + 1 : r.version
        };
      }
      if (r.eventType === 'successful_conversion') {
        return {
          ...r,
          providerFeeRupees: convFee,
          affiliateRewardRupees: affiliateReward,
          version: branchNewVersion ? (r.version || 1) + 1 : r.version
        };
      }
      return r;
    });

    updateOffering(
      editingOffering.id,
      {
        title: editTitle.trim(),
        customerPriceRupees: newPrice,
        rewardRules: updatedRules
      },
      branchNewVersion
    );

    showNotification(
      `Service updated! Price ₹${newPrice.toLocaleString('en-IN')}${branchNewVersion ? ` saved as Version v${(editingOffering.version || 1) + 1}` : ''}.`,
      'success'
    );
    setEditingOffering(null);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 className="page-title">My Services & Pricing</h2>
          <p className="page-subtitle" style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Active diagnostic and clinical services with prices for {activeProvider.businessName}.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setModalInitialTab('upload');
              setShowModal(true);
            }}
            style={{
              borderRadius: '8px',
              padding: '10px 18px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Upload size={16} />
            <span>+ Upload Rate Card (PDF or Excel)</span>
          </button>
        </div>
      </div>

      {providerOfferings.length === 0 ? (
        <div
          style={{
            padding: '48px 20px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)'
          }}
        >
          <Sparkles size={32} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
          <h4 style={{ fontSize: '1.05rem', color: 'var(--brand-navy)', fontWeight: 700 }}>
            No services configured yet for {activeProvider.businessName}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '460px', margin: '4px auto 18px' }}>
            Upload your clinic or lab rate card in PDF or Excel format to list your services.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setModalInitialTab('upload');
                setShowModal(true);
              }}
              style={{
                borderRadius: '8px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Upload size={14} />
              <span>+ Upload Rate Card (PDF or Excel)</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Quick Search & Status Filter Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px',
              backgroundColor: '#FFFFFF',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            {/* Search Input */}
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search service name (e.g. Protein S, Cat-4, Anti CCP, Lipid...) or price..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 36px 9px 36px',
                  fontSize: '0.86rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  outline: 'none',
                  backgroundColor: '#F8FAFC'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Quick Status Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginRight: '4px' }}>
                Showing <strong>{filteredOfferings.length}</strong> of {providerOfferings.length}
              </span>

              <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: statusFilter === 'all' ? '#FFFFFF' : 'transparent',
                    color: statusFilter === 'all' ? 'var(--brand-navy)' : '#64748B',
                    boxShadow: statusFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  All ({providerOfferings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('active')}
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: statusFilter === 'active' ? '#FFFFFF' : 'transparent',
                    color: statusFilter === 'active' ? '#047857' : '#64748B',
                    boxShadow: statusFilter === 'active' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  Live ({providerOfferings.filter(o => o.status === 'active').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('paused')}
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: statusFilter === 'paused' ? '#FFFFFF' : 'transparent',
                    color: statusFilter === 'paused' ? '#B45309' : '#64748B',
                    boxShadow: statusFilter === 'paused' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  Paused ({providerOfferings.filter(o => o.status === 'paused').length})
                </button>
              </div>
            </div>
          </div>

          {/* Zero Results State */}
          {filteredOfferings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 10px', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                No services found matching "<strong>{searchQuery}</strong>"
                {statusFilter !== 'all' ? ` in ${statusFilter} services` : ''}.
              </p>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Clear Search & Show All
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {filteredOfferings.map((offering) => {
                return (
                  <div
                    key={offering.id}
                    className="card"
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>v{offering.version}</span>
                        {offering.status === 'active' && (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} /> Live / Active
                          </span>
                        )}
                        {offering.status === 'paused' && (
                          <span className="badge badge-pending" style={{ backgroundColor: '#FEF3C7', color: '#92400E', borderColor: '#FCD34D' }}>
                            <Pause size={12} /> Intake Paused
                          </span>
                        )}
                        {offering.status === 'pending_review' && (
                          <span className="badge badge-pending">
                            <Clock size={12} /> Pending Review
                          </span>
                        )}
                        {offering.status === 'rejected' && (
                          <span className="badge badge-rejected">
                            <XCircle size={12} /> Rejected
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0A2540', marginBottom: '14px', lineHeight: 1.35 }}>
                        {offering.title}
                      </h3>

                      <div
                        style={{
                          backgroundColor: '#F8FAFC',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '14px'
                        }}
                      >
                        <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>Customer Price (MRP)</span>
                        <span className="num-tabular" style={{ color: '#0A2540', fontWeight: 800, fontSize: '1.18rem' }}>
                          ₹{offering.customerPriceRupees.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Offering Action Buttons */}
                    <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      {(offering.status === 'active' || offering.status === 'paused') ? (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: offering.status === 'active' ? '#B45309' : '#047857',
                            borderColor: offering.status === 'active' ? '#FCD34D' : '#A7F3D0'
                          }}
                          onClick={() => handleToggleOfferingStatus(offering)}
                          title={offering.status === 'active' ? 'Temporarily pause receiving new referrals' : 'Resume live affiliate referral intake'}
                        >
                          {offering.status === 'active' ? (
                            <>
                              <Pause size={12} />
                              <span>Pause Intake</span>
                            </>
                          ) : (
                            <>
                              <Play size={12} />
                              <span>Resume Intake</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Status: {offering.status}</span>
                      )}

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                        onClick={() => openEditModal(offering)}
                      >
                        <Edit2 size={13} />
                        <span>Edit Price</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Add Services Modal: 📊 Excel Rate Card / 📸 Photo OCR / ✍️ Manual */}
      {showModal && (
        <AddServicesModal onClose={() => setShowModal(false)} initialTab={modalInitialTab} />
      )}

      {/* Edit Offering & Price Modal */}
      {editingOffering && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ fontSize: '1.15rem' }}>Edit Service & Price</h3>
              <button className="modal-close-btn" onClick={() => setEditingOffering(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveOfferingEdit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Service Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Customer Price (MRP in ₹) <span className="required">*</span></label>
                  <input
                    type="number"
                    className="form-input num-tabular"
                    style={{ fontSize: '1.05rem', fontWeight: 700 }}
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    required
                    min={1}
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer', marginTop: '12px' }}>
                  <input
                    type="checkbox"
                    checked={branchNewVersion}
                    onChange={(e) => setBranchNewVersion(e.target.checked)}
                  />
                  <span>
                    <strong>Publish as New Version Revision (v{(editingOffering.version || 1) + 1})</strong>
                  </span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingOffering(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
