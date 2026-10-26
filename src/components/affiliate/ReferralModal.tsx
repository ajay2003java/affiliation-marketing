import React, { useState } from 'react';
import { ProviderOffering, ReferralEarningModel } from '../../types';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { X, Send, ShieldCheck, CheckCircle2, AlertCircle, Users, Clock, ArrowRight } from 'lucide-react';

interface ReferralModalProps {
  offering: ProviderOffering;
  onClose: () => void;
  preselectedContact?: { name: string; phone: string; email: string; city: string };
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  offering,
  onClose,
  preselectedContact
}) => {
  const { providers, affiliateProfile, submitReferral, contacts, checkDuplicateReferral } = useData();
  const { showNotification } = useApp();

  const provider = providers.find((p) => p.id === offering.providerId);
  const leadRule = offering.rewardRules.find((r) => r.eventType === 'qualified_lead' && r.isActive);
  const convRule = offering.rewardRules.find((r) => r.eventType === 'successful_conversion' && r.isActive);

  // Determine initial earning model selection based on offering & profile
  const initialModel: ReferralEarningModel =
    leadRule && (affiliateProfile.earningModes === 'both' || affiliateProfile.earningModes === 'lead_generation')
      ? 'lead_generation'
      : convRule
      ? 'lead_conversion'
      : 'lead_generation';

  const [earningModel, setEarningModel] = useState<ReferralEarningModel>(initialModel);
  const [customerName, setCustomerName] = useState(preselectedContact?.name || '');
  const [customerPhone, setCustomerPhone] = useState(preselectedContact?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(preselectedContact?.email || '');
  const [customerCity, setCustomerCity] = useState(preselectedContact?.city || 'Hyderabad');
  const [customerNotes, setCustomerNotes] = useState('');
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [allowDuplicateOverride, setAllowDuplicateOverride] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const duplicateCheck = checkDuplicateReferral(customerPhone, customerEmail, offering.providerId);

  const canSelectLeadGen =
    Boolean(leadRule) &&
    (affiliateProfile.earningModes === 'both' || affiliateProfile.earningModes === 'lead_generation');

  const canSelectConv =
    Boolean(convRule) &&
    (affiliateProfile.earningModes === 'both' || affiliateProfile.earningModes === 'lead_conversion');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Customer name and contact phone number are required.');
      return;
    }

    if (!consentConfirmed) {
      setErrorMsg('You must confirm customer consent/authorization to proceed.');
      return;
    }

    if (duplicateCheck.isDuplicate && !allowDuplicateOverride) {
      setErrorMsg('Duplicate referral detected. Check the duplicate attribution notice below or acknowledge to proceed.');
      return;
    }

    try {
      const created = submitReferral({
        affiliateId: affiliateProfile.userId,
        providerId: offering.providerId,
        offeringId: offering.id,
        earningModel,
        rewardRuleVersion: offering.version,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        customerCity: customerCity.trim(),
        customerNotes: customerNotes.trim(),
        authorizationConfirmed: true
      }, allowDuplicateOverride);

      showNotification(
        `Referral ${created.referralCode} submitted successfully for ${created.customerName}!`,
        'success'
      );
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error submitting referral.';
      setErrorMsg(message);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '660px' }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Submit Customer Referral</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {offering.title} • {provider?.businessName}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMsg && (
              <div className="notice-box warning" style={{ marginBottom: '16px' }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Fill From Saved Address Book Bar (only if contacts exist) */}
            {contacts && contacts.length > 0 && (
              <div
                style={{
                  backgroundColor: 'var(--brand-cobalt-light)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  border: '1px solid rgba(0, 82, 204, 0.15)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={16} color="var(--brand-cobalt)" />
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                    Saved Contacts:
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    className="form-select"
                    style={{ width: 'auto', padding: '4px 10px', fontSize: '0.78rem', backgroundColor: '#FFF' }}
                    onChange={(e) => {
                      const c = contacts.find((item) => item.id === e.target.value);
                      if (c) {
                        setCustomerName(c.name);
                        setCustomerPhone(c.phone);
                        setCustomerEmail(c.email || '');
                        setCustomerCity(c.city || 'Hyderabad');
                        setConsentConfirmed(true);
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select contact ({contacts.length})...</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Economics Summary Bar */}
            <div className="offering-economics-box" style={{ marginBottom: '18px' }}>
              <div className="econ-row">
                <span className="econ-label">Customer Price</span>
                <span className="econ-price num-tabular" style={{ fontSize: '1.05rem', color: 'var(--brand-navy)' }}>
                  ₹{offering.customerPriceRupees.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="econ-row">
                <span className="econ-label">Provider Service Area</span>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{offering.serviceArea}</span>
              </div>
            </div>

            {/* Earning Model Selector */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">
                Choose Earning Model for this Referral <span className="required">*</span>
              </label>
              <span className="form-help" style={{ marginBottom: '8px', display: 'block' }}>
                Pick whether to earn immediately when the lead is qualified, or earn higher when the sale completes.
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Lead Generator Option */}
                <div
                  onClick={() => canSelectLeadGen && setEarningModel('lead_generation')}
                  style={{
                    border: `2px solid ${earningModel === 'lead_generation' ? 'var(--lead-teal)' : 'var(--border-light)'}`,
                    backgroundColor: earningModel === 'lead_generation' ? 'var(--lead-teal-light)' : 'var(--bg-surface)',
                    opacity: canSelectLeadGen ? 1 : 0.5,
                    cursor: canSelectLeadGen ? 'pointer' : 'not-allowed',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--lead-teal)' }}>
                      Lead Generator
                    </span>
                    {earningModel === 'lead_generation' && <CheckCircle2 size={16} color="var(--lead-teal)" />}
                  </div>
                  <div className="num-tabular" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '4px' }}>
                    ₹{leadRule ? leadRule.affiliateRewardRupees.toLocaleString('en-IN') : 'N/A'}
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                    Earn once lead contact & need are verified by provider. <strong>No customer purchase required.</strong>
                  </p>
                </div>

                {/* Lead Converter Option */}
                <div
                  onClick={() => canSelectConv && setEarningModel('lead_conversion')}
                  style={{
                    border: `2px solid ${earningModel === 'lead_conversion' ? 'var(--finance-green)' : 'var(--border-light)'}`,
                    backgroundColor: earningModel === 'lead_conversion' ? 'var(--finance-green-light)' : 'var(--bg-surface)',
                    opacity: canSelectConv ? 1 : 0.5,
                    cursor: canSelectConv ? 'pointer' : 'not-allowed',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--finance-green)' }}>
                      Lead Converter
                    </span>
                    {earningModel === 'lead_conversion' && <CheckCircle2 size={16} color="var(--finance-green)" />}
                  </div>
                  <div className="num-tabular" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '4px' }}>
                    ₹{convRule ? convRule.affiliateRewardRupees.toLocaleString('en-IN') : 'N/A'}
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                    Earn higher reward when you coordinate and customer <strong>completes transaction</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Details Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Customer Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Suresh Reddy"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number <span className="required">*</span></label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Email Address (Optional)</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="customer@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">City / Locality <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Hyderabad"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Customer Context & Special Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Mention why customer is interested, preferred contact hours, or special requirements..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
              />
            </div>

            {/* Customer Consent Checkbox */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                marginTop: '10px'
              }}
            >
              <input
                type="checkbox"
                id="consentCheck"
                style={{ marginTop: '3px', cursor: 'pointer' }}
                checked={consentConfirmed}
                onChange={(e) => setConsentConfirmed(e.target.checked)}
              />
              <label htmlFor="consentCheck" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', color: 'var(--finance-green)' }} />
                <strong>Customer Authorization:</strong> I have informed this customer and received their consent to share their contact details with {provider?.businessName}.
              </label>
            </div>

            {/* Duplicate Notice Box (PRD Section 6.4 & 13) */}
            {duplicateCheck.isDuplicate && (
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  marginTop: '12px'
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '0.84rem', color: '#92400e', display: 'block' }}>
                      Duplicate Attribution Notice (PRD Section 6.4)
                    </strong>
                    <p style={{ fontSize: '0.78rem', color: '#b45309', margin: '4px 0 8px 0' }}>
                      {duplicateCheck.message}
                    </p>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#92400e', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={allowDuplicateOverride}
                        onChange={(e) => setAllowDuplicateOverride(e.target.checked)}
                      />
                      <span>I acknowledge this prospect was already referred; submit as re-engagement follow-up</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Visual Process Milestone Flow */}
            <div
              style={{
                marginTop: '14px',
                padding: '10px 14px',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.74rem',
                color: 'var(--text-muted)'
              }}
            >
              <span>1. Instant Referral Code Generated</span>
              <ArrowRight size={12} />
              <span>2. Provider Follows Up (24h)</span>
              <ArrowRight size={12} />
              <span>3. Automatic Payout Credited</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-submit-referral-confirm">
              <Send size={15} />
              <span>Submit Referral Now</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
