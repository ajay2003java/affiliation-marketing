import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Send,
  Building,
  Phone,
  Sparkles,
  ExternalLink,
  X,
  Star
} from 'lucide-react';

interface CustomerShareLandingModalProps {
  onClose: () => void;
}

export const CustomerShareLandingModal: React.FC<CustomerShareLandingModalProps> = ({ onClose }) => {
  const { offerings, providers, affiliateProfile, submitReferral } = useData();
  const { currentUser, showNotification } = useApp();

  const activeOfferings = offerings.filter((o) => o.status === 'active');

  const [selectedOfferingId, setSelectedOfferingId] = useState(activeOfferings[0]?.id || '');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerCity, setCustomerCity] = useState('Hyderabad');
  const [preferredSlot, setPreferredSlot] = useState('Morning (9 AM - 12 PM)');
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const selectedOffering = offerings.find((o) => o.id === selectedOfferingId) || activeOfferings[0];
  const selectedProvider = providers.find((p) => p.id === selectedOffering?.providerId);

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !selectedOffering) return;

    try {
      const created = submitReferral({
        affiliateId: affiliateProfile.userId,
        providerId: selectedOffering.providerId,
        offeringId: selectedOffering.id,
        earningModel: selectedOffering.rewardRules.some((r) => r.eventType === 'qualified_lead')
          ? 'lead_generation'
          : 'lead_conversion',
        rewardRuleVersion: selectedOffering.version,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        customerCity: customerCity.trim(),
        customerNotes: `Self-registered via affiliate share link. Preferred callback slot: ${preferredSlot}`,
        authorizationConfirmed: true
      });

      setSubmittedCode(created.referralCode);
      showNotification(`Customer inquiry registered! Assigned referral code: ${created.referralCode}`, 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error submitting inquiry.';
      alert(message);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}>
        {/* Customer View Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0A2540 0%, #17497A 100%)',
            color: '#FFFFFF',
            padding: '24px 28px',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.74rem',
                backgroundColor: 'rgba(255,255,255,0.18)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontWeight: 600
              }}
            >
              <ShieldCheck size={13} color="#22C55E" />
              Accredited Referral Invitation
            </span>
            <button className="modal-close-btn" style={{ color: '#FFF' }} onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '10px 0 4px 0' }}>
            Special Partner Access & Priority Booking
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
            Referred directly by <strong>{currentUser.name}</strong> • Trusted Partner Network
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 28px' }}>
          {submittedCode ? (
            <div style={{ textAlign: 'center', padding: '36px 16px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--finance-green-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <CheckCircle2 size={36} color="var(--finance-green)" />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '8px' }}>
                Priority Callback Confirmed!
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto 16px' }}>
                Your request has been delivered to <strong>{selectedProvider?.businessName}</strong>. A dedicated service coordinator will call you during your requested window.
              </p>
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px dashed var(--border-medium)',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '24px'
                }}
              >
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Your Priority Reference Code:</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--brand-cobalt)' }}>{submittedCode}</strong>
              </div>
              <div>
                <button className="btn btn-primary" onClick={onClose}>
                  Done & Close Preview
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Left Column: Service Highlight */}
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                  Select Service You Need:
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                  {activeOfferings.map((offering) => {
                    const isSelected = offering.id === selectedOfferingId;
                    const prov = providers.find((p) => p.id === offering.providerId);
                    return (
                      <div
                        key={offering.id}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--brand-cobalt)' : '1px solid var(--border-light)',
                          backgroundColor: isSelected ? 'var(--brand-cobalt-light)' : 'var(--bg-surface)',
                          cursor: 'pointer',
                          transition: 'var(--transition)'
                        }}
                        onClick={() => setSelectedOfferingId(offering.id)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <strong style={{ fontSize: '0.88rem', color: isSelected ? 'var(--brand-cobalt)' : 'var(--text-main)' }}>
                            {offering.title}
                          </strong>
                          <span className="num-tabular" style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--brand-navy)' }}>
                            ₹{offering.customerPriceRupees.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                          Provided by {prov?.businessName} • {offering.serviceArea}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {selectedOffering && (
                  <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.8rem' }}>
                    <strong style={{ color: 'var(--brand-navy)', display: 'block', marginBottom: '6px' }}>
                      Certified Package Highlights:
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)' }}>
                      {selectedOffering.features.map((feat, i) => (
                        <li key={i} style={{ marginBottom: '3px' }}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column: Callback Request Form */}
              <form onSubmit={handleSubmitInquiry} style={{ backgroundColor: 'var(--bg-surface-subtle)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="var(--accent-coral)" />
                  Request Verified Partner Callback
                </h4>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  No payment required now. {selectedProvider?.businessName} will contact you to answer queries and schedule.
                </p>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Phone Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="10-digit mobile number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@example.com (optional)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>City</label>
                    <input
                      type="text"
                      className="form-input"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Preferred Call Slot</label>
                    <select
                      className="form-select"
                      value={preferredSlot}
                      onChange={(e) => setPreferredSlot(e.target.value)}
                    >
                      <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                      <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                      <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '8px' }}
                >
                  <Send size={15} />
                  <span>Request Callback & Priority Price</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
