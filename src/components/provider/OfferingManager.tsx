import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { Provider, ProviderOffering } from '../../types';
import { Plus, CheckCircle2, Clock, XCircle, Sparkles, Edit2, ShieldAlert, X, Pause, Play } from 'lucide-react';
import { AddServicesModal } from './AddServicesModal';

export const OfferingManager: React.FC = () => {
  const { offerings, providers, updateOffering } = useData();
  const { activeProviderId, showNotification } = useApp();

  const activeProvider: Provider | undefined = providers.find((p) => p.id === activeProviderId) || providers[0];

  // Dynamic: Offerings belonging to the currently active provider
  const providerOfferings = activeProvider ? offerings.filter((o) => o.providerId === activeProvider.id) : [];

  const [showModal, setShowModal] = useState(false);
  const [editingOffering, setEditingOffering] = useState<ProviderOffering | null>(null);

  if (!activeProvider) {
    return (
      <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--brand-navy)' }}>No Provider Business Found</h3>
        <p style={{ color: 'var(--text-muted)' }}>No provider business is registered in the database yet.</p>
      </div>
    );
  }

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
  const [editArea, setEditArea] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAffiliateLeadReward, setEditAffiliateLeadReward] = useState(0);
  const [editAffiliateConvReward, setEditAffiliateConvReward] = useState(0);
  const [editLeadFee, setEditLeadFee] = useState(0);
  const [editConvFee, setEditConvFee] = useState(0);
  const [branchNewVersion, setBranchNewVersion] = useState(true);

  const openEditModal = (offering: ProviderOffering) => {
    setEditingOffering(offering);
    setEditTitle(offering.title);
    setEditPrice(offering.customerPriceRupees);
    setEditArea(offering.serviceArea);
    setEditDesc(offering.description);
    const lead = offering.rewardRules.find((r) => r.eventType === 'qualified_lead');
    const conv = offering.rewardRules.find((r) => r.eventType === 'successful_conversion');
    setEditAffiliateLeadReward(lead ? lead.affiliateRewardRupees : 350);
    setEditAffiliateConvReward(conv ? conv.affiliateRewardRupees : 900);
    setEditLeadFee(lead ? lead.providerFeeRupees : 400);
    setEditConvFee(conv ? conv.providerFeeRupees : 1000);
    setBranchNewVersion(true);
  };

  const handleSaveOfferingEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffering) return;

    const updatedRules = editingOffering.rewardRules.map((r) => {
      if (r.eventType === 'qualified_lead') {
        const pFee = Number(editLeadFee) || 0;
        const aReward = Math.round(pFee * 0.5); // Strict 50% MoU policy
        return {
          ...r,
          providerFeeRupees: pFee,
          affiliateRewardRupees: aReward,
          version: branchNewVersion ? (r.version || 1) + 1 : r.version
        };
      }
      if (r.eventType === 'successful_conversion') {
        const pFee = Number(editConvFee) || 0;
        const aReward = Math.round(pFee * 0.5); // Strict 50% MoU policy
        return {
          ...r,
          providerFeeRupees: pFee,
          affiliateRewardRupees: aReward,
          version: branchNewVersion ? (r.version || 1) + 1 : r.version
        };
      }
      return r;
    });

    updateOffering(
      editingOffering.id,
      {
        title: editTitle.trim(),
        description: editDesc.trim(),
        customerPriceRupees: Number(editPrice), // Decided directly by the provider
        serviceArea: editArea.trim(),
        rewardRules: updatedRules
      },
      branchNewVersion
    );

    showNotification(
      `Offering updated! Service price ₹${Number(editPrice).toLocaleString('en-IN')} and affiliate referral rewards saved${branchNewVersion ? ` as Version v${(editingOffering.version || 1) + 1}` : ''}.`,
      'success'
    );
    setEditingOffering(null);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="page-title">Offerings & Referral Economics</h2>
          <p className="page-subtitle">
            You have full pricing autonomy: As the service provider, only you decide the customer service price and the exact referral reward paid to the affiliate.
          </p>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => setShowModal(true)}
          style={{
            backgroundColor: '#0A2540',
            color: '#FFFFFF',
            border: '1px solid #0A2540',
            borderRadius: '8px',
            padding: '10px 18px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(10, 37, 64, 0.25)',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          <span>New Offering Proposal</span>
        </button>
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
            No offerings configured yet for {activeProvider.businessName}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '440px', margin: '4px auto 16px' }}>
            Publish your first offering with customer pricing and referral fee incentives to start receiving qualified leads.
          </p>
          <button
            className="btn btn-sm"
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: '#0A2540',
              color: '#FFFFFF',
              border: '1px solid #0A2540',
              borderRadius: '8px',
              fontWeight: 600
            }}
          >
            <Plus size={14} />
            <span>Create First Offering</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {providerOfferings.map((offering) => {
            const leadRule = offering.rewardRules.find((r) => r.eventType === 'qualified_lead');
            const convRule = offering.rewardRules.find((r) => r.eventType === 'successful_conversion');

            return (
              <div key={offering.id} className="card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span className="badge badge-neutral">v{offering.version}</span>
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
                      <Clock size={12} /> Pending Admin Review
                    </span>
                  )}
                  {offering.status === 'rejected' && (
                    <span className="badge badge-rejected">
                      <XCircle size={12} /> Rejected
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2540', marginBottom: '6px' }}>
                  {offering.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '14px', lineHeight: 1.4 }}>
                  {offering.description}
                </p>

                <div className="offering-economics-box" style={{ marginBottom: '12px' }}>
                  <div className="econ-row">
                    <span className="econ-label">Customer MRP (Retail Price)</span>
                    <span className="econ-price num-tabular" style={{ color: '#0A2540', fontWeight: 800 }}>
                      ₹{offering.customerPriceRupees.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {convRule && (() => {
                    const pct = offering.customerPriceRupees > 0
                      ? Math.round((convRule.providerFeeRupees / offering.customerPriceRupees) * 100)
                      : 40;
                    return (
                      <div className="econ-row">
                        <span className="econ-label">Agreed MoU Referral Fee</span>
                        <span className="num-tabular" style={{ color: '#B45309', fontWeight: 700, fontSize: '0.85rem' }}>
                          ₹{convRule.providerFeeRupees.toLocaleString('en-IN')} ({pct}% of MRP)
                        </span>
                      </div>
                    );
                  })()}
                  <div className="econ-row">
                    <span className="econ-label">Coverage Area</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{offering.serviceArea}</span>
                  </div>
                </div>

                {/* Configured Affiliate Rewards */}
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ color: '#0F172A' }}>
                      50/50 Referral Split Distribution:
                    </strong>
                    <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>Strict 50/50 Split</span>
                  </div>
                  {leadRule && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', backgroundColor: '#EBF3FF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                      <span style={{ color: '#0052CC', fontWeight: 600 }}>🎯 Qualified Lead Reward:</span>
                      <span className="num-tabular" style={{ fontWeight: 800, color: '#0052CC' }}>
                        Affiliate receives ₹{leadRule.affiliateRewardRupees.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  {convRule && (() => {
                    const halfPct = offering.customerPriceRupees > 0
                      ? Math.round((convRule.affiliateRewardRupees / offering.customerPriceRupees) * 100)
                      : 20;
                    return (
                      <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#E6F7F0', padding: '6px 10px', borderRadius: '6px', border: '1px solid #A3E6CD' }}>
                        <span style={{ color: '#0E8A5E', fontWeight: 600 }}>🏆 Closed Sale Conversion:</span>
                        <span className="num-tabular" style={{ fontWeight: 800, color: '#0E8A5E' }}>
                          Affiliate receives ₹{convRule.affiliateRewardRupees.toLocaleString('en-IN')} ({halfPct}% of MRP)
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Offering Action Buttons */}
                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  {(offering.status === 'active' || offering.status === 'paused') ? (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{
                        padding: '5px 10px',
                        fontSize: '0.76rem',
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
                          <span>Resume Live Intake</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Status: {offering.status}</span>
                  )}

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                    onClick={() => openEditModal(offering)}
                  >
                    <Edit2 size={13} />
                    <span>Edit Price & Rewards</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Services Modal: 📸 Snap / Upload Price List Photo OR ✍️ Type in Manually */}
      {showModal && (
        <AddServicesModal onClose={() => setShowModal(false)} />
      )}

      {/* Edit Offering & Version Branching Modal (PRD PR-04 & Section 10) */}
      {editingOffering && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Edit Service Price & Affiliate Referral Rewards</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Current Version: v{editingOffering.version} • {activeProvider.businessName}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setEditingOffering(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveOfferingEdit}>
              <div className="modal-body">
                <div className="notice-box info" style={{ marginBottom: '16px' }}>
                  <ShieldAlert size={16} />
                  <span>
                    <strong>Provider Authority:</strong> Only you decide the retail customer price and the exact referral reward paid to the affiliate. Updates publish as a new version revision (v{(editingOffering.version || 1) + 1}).
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Offering Title <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Customer Service Retail Price (₹) <span className="required">*</span></label>
                    <input
                      type="number"
                      className="form-input num-tabular"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      required
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      What customers pay you for this service.
                    </span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Service Area / Coverage</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editArea}
                      onChange={(e) => setEditArea(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Service Description</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                  />
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '14px' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--brand-navy)', display: 'block' }}>
                      Affiliate Referral Rewards (Decided by You):
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Specify exactly how much money the affiliate receives for introducing a client to this service.
                    </span>
                  </div>

                  <div className="form-row" style={{ marginBottom: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--lead-teal)', fontWeight: 700 }}>
                        Affiliate Reward for Qualified Lead (₹) <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-input num-tabular"
                        value={editAffiliateLeadReward}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditAffiliateLeadReward(val);
                          if (editLeadFee < val) setEditLeadFee(val + 50);
                        }}
                        placeholder="e.g. 350"
                        required
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Paid when prospect contact is verified.
                      </span>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--finance-green)', fontWeight: 700 }}>
                        Affiliate Reward for Closed Sale / Conversion (₹) <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-input num-tabular"
                        value={editAffiliateConvReward}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditAffiliateConvReward(val);
                          if (editConvFee < val) setEditConvFee(val + 100);
                        }}
                        placeholder="e.g. 900"
                        required
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Paid when customer purchase is complete.
                      </span>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Total Provider Lead Escrow Allocation (₹)
                      </label>
                      <input
                        type="number"
                        className="form-input num-tabular"
                        style={{ fontSize: '0.82rem' }}
                        value={editLeadFee}
                        onChange={(e) => setEditLeadFee(Number(e.target.value))}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Total Provider Conversion Escrow Allocation (₹)
                      </label>
                      <input
                        type="number"
                        className="form-input num-tabular"
                        style={{ fontSize: '0.82rem' }}
                        value={editConvFee}
                        onChange={(e) => setEditConvFee(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={branchNewVersion}
                    onChange={(e) => setBranchNewVersion(e.target.checked)}
                  />
                  <span>
                    <strong>Publish as New Version Revision (v{(editingOffering.version || 1) + 1})</strong> and route to Admin review queue
                  </span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingOffering(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Update Offering
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
