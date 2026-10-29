import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { Referral, Provider, ProviderOffering } from '../../types';
import { AddServicesModal } from './AddServicesModal';
import {
  Users,
  CheckCircle2,
  Clock,
  Check,
  X,
  Plus,
  Tag,
  PhoneCall,
  PhoneOff,
  ShieldCheck,
  DollarSign,
  Search,
  Camera,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Calendar,
  AlertCircle,
  Building2
} from 'lucide-react';

export const ProviderHome: React.FC = () => {
  const {
    referrals,
    offerings,
    providers,
    updateLeadStatus,
    updateConversionStatus,
    logProxyCall,
    maskPhoneNumber
  } = useData();
  const { activeProviderId, showNotification } = useApp();

  const activeProvider: Provider | undefined =
    providers.find((p) => p.id === activeProviderId) ||
    providers[0];

  // Referrals and Offerings belonging to this provider
  const providerReferrals = activeProvider
    ? referrals.filter((r) => r.providerId === activeProvider.id)
    : [];
  const providerOfferings = activeProvider
    ? offerings.filter((o) => o.providerId === activeProvider.id)
    : [];

  // Modal: Add Service / Rate Card
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  // Search & Filter for Leads
  const [leadSearch, setLeadSearch] = useState('');
  const [leadFilter, setLeadFilter] = useState<'all' | 'needs_action' | 'converted'>('all');

  // Outcome Action Modal (Convert / Lost)
  const [activeModal, setActiveModal] = useState<{
    type: 'convert' | 'lost' | 'qualify';
    referral: Referral;
  } | null>(null);
  const [saleValueInput, setSaleValueInput] = useState('2000');
  const [invoiceRefInput, setInvoiceRefInput] = useState('INV-2026-');
  const [actionNotes, setActionNotes] = useState('');

  // Encrypted Cloud Telephony Proxy State
  const [callingReferral, setCallingReferral] = useState<Referral | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callNotes, setCallNotes] = useState('');

  useEffect(() => {
    let timer: any;
    if (callingReferral) {
      setCallDuration(0);
      setCallNotes('');
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callingReferral]);

  // Lead metrics
  const needsActionCount = providerReferrals.filter(
    (r) => r.conversionStatus === 'follow_up_in_progress' || r.leadStatus === 'submitted'
  ).length;
  const totalConverted = providerReferrals.filter((r) => r.conversionStatus === 'converted').length;

  // Filtered Leads
  const filteredReferrals = providerReferrals.filter((ref) => {
    if (leadSearch.trim()) {
      const q = leadSearch.toLowerCase();
      const matchName = ref.customerName.toLowerCase().includes(q);
      const matchCity = ref.customerCity.toLowerCase().includes(q);
      const offering = offerings.find((o) => o.id === ref.offeringId);
      const matchService = (offering?.title || '').toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchService) return false;
    }

    if (leadFilter === 'needs_action') {
      return ref.conversionStatus === 'follow_up_in_progress' || ref.leadStatus === 'submitted';
    }
    if (leadFilter === 'converted') {
      return ref.conversionStatus === 'converted';
    }

    return true;
  });

  // Handle Mark Converted / Lost Submit
  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    const { type, referral } = activeModal;

    if (type === 'convert') {
      const saleVal = parseFloat(saleValueInput) || 2000;
      updateConversionStatus(
        referral.id,
        'converted',
        saleVal,
        `Customer converted. Sale: ₹${saleVal}. Invoice: ${invoiceRefInput}. ${actionNotes}`,
        activeProvider.contactPerson
      );
      showNotification(`Referral for ${referral.customerName} marked as Converted (₹${saleVal.toLocaleString('en-IN')})!`, 'success');
    } else if (type === 'lost') {
      updateConversionStatus(
        referral.id,
        'not_converted',
        0,
        `Customer lost / declined: ${actionNotes || 'Customer opted out or did not proceed.'}`,
        activeProvider.contactPerson
      );
      showNotification(`Referral for ${referral.customerName} updated as Not Converted.`, 'info');
    } else if (type === 'qualify') {
      updateLeadStatus(
        referral.id,
        'qualified',
        actionNotes || 'Contact and interest verified by provider.',
        activeProvider.contactPerson
      );
      showNotification(`Lead for ${referral.customerName} qualified!`, 'success');
    }

    setActiveModal(null);
    setActionNotes('');
  };

  if (!activeProvider) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '48px 24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <Building2 size={48} color="var(--brand-cobalt)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '8px' }}>
          No Provider Business Onboarded Yet
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.55 }}>
          The system database is currently in clean production state. You can register your provider business on the landing page, or an Admin can onboard a business with an MoU agreement in the Admin Portal.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 20px 48px' }}>
      
      {/* =========================================================================
          TOP HEADER: Clean, uncluttered Partner identity
      ========================================================================= */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '20px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--border-light)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--brand-cobalt)',
                backgroundColor: '#EBF3FF',
                padding: '3px 8px',
                borderRadius: '6px'
              }}
            >
              Partner Portal
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              📍 {activeProvider.city}
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
            {activeProvider.businessName}
          </h1>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Authorized Signatory: <strong>{activeProvider.contactPerson}</strong> • {activeProvider.phone}
          </span>
        </div>

        {/* Quick Add Service Button */}
        <button
          id="btn-add-service-hero"
          onClick={() => setShowAddServiceModal(true)}
          className="btn btn-primary"
          style={{
            padding: '11px 20px',
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '8px',
            boxShadow: '0 4px 14px rgba(0, 82, 204, 0.2)'
          }}
        >
          <Camera size={16} />
          <span>+ Add Service or Upload Rate Card</span>
        </button>
      </div>

      {/* =========================================================================
          SECTION 1 (FIRST): How many leads they got & Actionable Lead Cards
      ========================================================================= */}
      <section style={{ marginBottom: '36px' }}>
        {/* Section 1 Header & Metrics */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                Customer Leads Received
              </h2>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  backgroundColor: 'var(--brand-navy)',
                  color: '#FFFFFF',
                  padding: '2px 10px',
                  borderRadius: '12px'
                }}
              >
                {providerReferrals.length} Total
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Inquiries submitted by affiliate partners recommending your services.
            </p>
          </div>

          {/* Quick Status Badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setLeadFilter('all')}
              style={{
                border: leadFilter === 'all' ? '1.5px solid var(--brand-cobalt)' : '1px solid var(--border-light)',
                backgroundColor: leadFilter === 'all' ? '#EFF6FF' : '#FFFFFF',
                color: leadFilter === 'all' ? 'var(--brand-cobalt)' : 'var(--text-secondary)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              All Leads ({providerReferrals.length})
            </button>

            <button
              type="button"
              onClick={() => setLeadFilter('needs_action')}
              style={{
                border: leadFilter === 'needs_action' ? '1.5px solid #D97706' : '1px solid var(--border-light)',
                backgroundColor: leadFilter === 'needs_action' ? '#FEF3C7' : '#FFFFFF',
                color: '#B45309',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {needsActionCount > 0 && <span className="pulse-indicator" style={{ backgroundColor: '#D97706' }} />}
              Needs Callback ({needsActionCount})
            </button>

            <button
              type="button"
              onClick={() => setLeadFilter('converted')}
              style={{
                border: leadFilter === 'converted' ? '1.5px solid #0E8A5E' : '1px solid var(--border-light)',
                backgroundColor: leadFilter === 'converted' ? '#ECFDF5' : '#FFFFFF',
                color: '#065F46',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ✓ Converted ({totalConverted})
            </button>
          </div>
        </div>

        {/* Search Input (if multiple leads) */}
        {providerReferrals.length > 2 && (
          <div style={{ marginBottom: '14px', maxWidth: '380px', position: 'relative' }}>
            <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search leads by customer name or city..."
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border-light)'
              }}
            />
          </div>
        )}

        {/* Lead Cards List */}
        {providerReferrals.length === 0 ? (
          /* Empty State: Clear and Encouraging */
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1.5px dashed #CBD5E1',
              borderRadius: '12px',
              padding: '36px 20px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: 'var(--brand-cobalt)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px'
              }}
            >
              <Users size={26} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-navy)', margin: '0 0 6px' }}>
              No Customer Leads Received Yet
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 18px' }}>
              When affiliates recommend your business to clients, leads will appear here with customer contact details and one-click callback buttons.
            </p>
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', fontWeight: 600 }}
            >
              <Plus size={15} />
              <span>Add Services to Receive Leads</span>
            </button>
          </div>
        ) : filteredReferrals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No leads match the selected filter.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredReferrals.map((ref) => {
              const offering = offerings.find((o) => o.id === ref.offeringId);
              const isNewLead = ref.leadStatus === 'submitted' || ref.conversionStatus === 'follow_up_in_progress';
              const isConverted = ref.conversionStatus === 'converted';
              const isLost = ref.conversionStatus === 'not_converted' || ref.leadStatus === 'qualification_rejected';

              return (
                <div
                  key={ref.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: isNewLead ? '1.5px solid #FCD34D' : '1px solid var(--border-light)',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Lead Info */}
                  <div style={{ flex: '1 1 320px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '1.02rem', color: 'var(--brand-navy)' }}>
                        {ref.customerName}
                      </strong>
                      
                      {/* Status Tag */}
                      {isNewLead && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '10px',
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span className="pulse-indicator" style={{ backgroundColor: '#D97706' }} />
                          Needs Callback
                        </span>
                      )}
                      {isConverted && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '10px',
                            backgroundColor: '#DCFCE7',
                            color: '#166534'
                          }}
                        >
                          ✓ Converted
                        </span>
                      )}
                      {isLost && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '10px',
                            backgroundColor: '#F1F5F9',
                            color: '#64748B'
                          }}
                        >
                          Closed / Dropped
                        </span>
                      )}
                    </div>

                    {/* Service & Location */}
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--brand-cobalt)' }}>
                        {offering?.title || 'Selected Service'}
                      </span>
                      {offering?.customerPriceRupees && (
                        <span style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>
                          {' '}• ₹{offering.customerPriceRupees.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span> • 📍 {ref.customerCity}</span>
                    </div>

                    {/* Customer Notes */}
                    {ref.customerNotes && (
                      <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        "{ref.customerNotes}"
                      </p>
                    )}

                    {/* Date stamp */}
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginTop: '6px' }}>
                      Received: {new Date(ref.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • Ref: {ref.referralCode}
                    </span>
                  </div>

                  {/* Actions Right Side */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* 1. Phone Call Action */}
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setCallingReferral(ref)}
                      style={{
                        backgroundColor: '#ECFDF5',
                        color: '#065F46',
                        border: '1px solid #A7F3D0',
                        padding: '8px 14px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Place masked proxy call to customer"
                    >
                      <PhoneCall size={14} color="#10B981" />
                      <span>{ref.clientPhoneMasked || maskPhoneNumber(ref.customerPhone)}</span>
                    </button>

                    {/* 2. Convert / Won Action */}
                    {!isConverted && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          setSaleValueInput((offering?.customerPriceRupees || 2000).toString());
                          setActiveModal({ type: 'convert', referral: ref });
                        }}
                        style={{
                          backgroundColor: 'var(--finance-green)',
                          borderColor: 'var(--finance-green)',
                          padding: '8px 14px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          borderRadius: '6px'
                        }}
                      >
                        <Check size={14} />
                        <span>Mark Converted</span>
                      </button>
                    )}

                    {/* 3. Not Converted Action */}
                    {!isConverted && !isLost && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setActiveModal({ type: 'lost', referral: ref })}
                        style={{
                          padding: '8px 12px',
                          fontSize: '0.82rem',
                          color: '#64748B',
                          borderRadius: '6px'
                        }}
                      >
                        <X size={14} />
                        <span>Not Interested</span>
                      </button>
                    )}

                    {/* Converted Summary */}
                    {isConverted && (
                      <div style={{ textAlign: 'right', fontSize: '0.82rem' }}>
                        <span style={{ color: '#166534', fontWeight: 700, display: 'block' }}>
                          ✓ Sale Cleared: ₹{(ref.saleValueRupees || offering?.customerPriceRupees || 2000).toLocaleString('en-IN')}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Completed Customer
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 2 (NEXT OPTION): Add & Manage Services (Rate Card)
      ========================================================================= */}
      <section
        style={{
          borderTop: '1px solid var(--border-light)',
          paddingTop: '28px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                My Services & Pricing
              </h2>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  backgroundColor: '#EFF6FF',
                  color: 'var(--brand-cobalt)',
                  padding: '2px 10px',
                  borderRadius: '12px'
                }}
              >
                {providerOfferings.length} Active
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Services currently active and promoted by affiliate partners.
            </p>
          </div>

          {/* Add Service Button */}
          <button
            id="btn-add-service-section"
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddServiceModal(true)}
            style={{
              padding: '10px 18px',
              fontSize: '0.86rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '8px'
            }}
          >
            <Plus size={16} />
            <span>+ Add Service or Upload Price List</span>
          </button>
        </div>

        {/* Services List / Grid */}
        {providerOfferings.length === 0 ? (
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1.5px dashed #CBD5E1',
              borderRadius: '12px',
              padding: '36px 20px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: 'var(--brand-cobalt)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px'
              }}
            >
              <Tag size={26} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-navy)', margin: '0 0 6px' }}>
              No Services Added Yet
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 16px' }}>
              Upload a photo of your rate card / price menu or type in your packages. Affiliates will start recommending them immediately.
            </p>
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="btn btn-primary"
              style={{ padding: '9px 18px', fontWeight: 700 }}
            >
              <Camera size={16} />
              <span>Snap / Upload Rate Card Photo</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {providerOfferings.map((offering) => {
              const leadRule = offering.rewardRules?.find((r) => r.eventType === 'qualified_lead');
              const convRule = offering.rewardRules?.find((r) => r.eventType === 'successful_conversion');

              return (
                <div
                  key={offering.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-light)',
                    borderRadius: '10px',
                    padding: '18px 20px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '0.98rem', color: 'var(--brand-navy)', lineHeight: 1.3 }}>
                        {offering.title}
                      </strong>
                      <span
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          color: 'var(--brand-navy)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ₹{offering.customerPriceRupees.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {offering.description || 'Verified commercial package.'}
                    </p>

                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      <span>📍 Service Area: <strong>{offering.serviceArea || activeProvider.city}</strong></span>
                    </div>
                  </div>

                  {/* Referral Split Info Strip */}
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      fontSize: '0.74rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>Affiliate Referral Reward:</span>
                    <strong style={{ color: 'var(--finance-green)' }}>
                      ₹{(convRule?.affiliateRewardRupees || leadRule?.affiliateRewardRupees || 500).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================================================================
          MODAL 1: Telephony Proxy Call
      ========================================================================= */}
      {callingReferral && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PhoneCall size={18} color="var(--finance-green)" />
                <h3 className="modal-title" style={{ fontSize: '1.05rem', margin: 0 }}>
                  Calling Customer
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setCallingReferral(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '4px' }}>
                {callingReferral.customerName}
              </div>
              <div style={{ fontSize: '1.05rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--finance-green)' }}>
                📞 {callingReferral.clientPhoneMasked || maskPhoneNumber(callingReferral.customerPhone)}
              </div>

              <div style={{ margin: '16px 0', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem', color: '#64748B' }}>
                <div>Gateway: +91 80-4567-9912</div>
                <div style={{ marginTop: '4px', fontWeight: 700, color: 'var(--brand-navy)' }}>
                  Connected: {Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}
                </div>
              </div>

              <div className="form-group" style={{ textAlign: 'left', marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Call Notes (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Discussed package; customer booking for tomorrow..."
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', backgroundColor: '#DC2626', borderColor: '#DC2626', padding: '10px', fontWeight: 700 }}
                onClick={() => {
                  logProxyCall(callingReferral.id, Math.max(callDuration, 15), callNotes || 'Consultation completed.');
                  showNotification(`Call logged (${callDuration}s). Status updated.`, 'success');
                  setCallingReferral(null);
                }}
              >
                <PhoneOff size={15} />
                <span>End & Log Call ({callDuration}s)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: Convert Outcome Dialog
      ========================================================================= */}
      {activeModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ fontSize: '1.05rem', margin: 0 }}>
                {activeModal.type === 'convert' ? 'Confirm Converted Customer' : 'Mark Customer Not Converted'}
              </h3>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <form onSubmit={handleActionSubmit}>
              <div className="modal-body" style={{ padding: '18px 20px' }}>
                <p style={{ margin: '0 0 14px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Customer: <strong>{activeModal.referral.customerName}</strong>
                </p>

                {activeModal.type === 'convert' ? (
                  <>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Final Service / Bill Amount (₹) <span className="required">*</span></label>
                      <input
                        type="number"
                        className="form-input"
                        value={saleValueInput}
                        onChange={(e) => setSaleValueInput(e.target.value)}
                        required
                        min="1"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Invoice / Receipt Reference</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="INV-2026-081"
                        value={invoiceRefInput}
                        onChange={(e) => setInvoiceRefInput(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Reason for not converting</label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      placeholder="e.g. Customer decided not to proceed / service not required."
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm"
                  style={{
                    backgroundColor: activeModal.type === 'convert' ? 'var(--finance-green)' : '#DC2626',
                    color: '#FFF',
                    fontWeight: 700
                  }}
                >
                  {activeModal.type === 'convert' ? 'Confirm Sale' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: Add Services Modal (Camera OCR or Manual)
      ========================================================================= */}
      {showAddServiceModal && (
        <AddServicesModal onClose={() => setShowAddServiceModal(false)} />
      )}
    </div>
  );
};
