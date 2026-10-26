import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { Building2, ShieldCheck, Check, Edit2, Save, X } from 'lucide-react';
import { Provider } from '../../types';

export const ProviderProfile: React.FC = () => {
  const { providers, updateProvider } = useData();
  const { activeProviderId, showNotification } = useApp();

  const provider: Provider = providers.find((p) => p.id === activeProviderId) || providers[0];

  const [isEditing, setIsEditing] = useState(false);
  const [bizName, setBizName] = useState(provider.businessName);
  const [tagline, setTagline] = useState(provider.tagline);
  const [address, setAddress] = useState(provider.address);
  const [city, setCity] = useState(provider.city);
  const [contactPerson, setContactPerson] = useState(provider.contactPerson);
  const [phone, setPhone] = useState(provider.phone);
  const [email, setEmail] = useState(provider.email);
  const [serviceAreasInput, setServiceAreasInput] = useState(provider.serviceAreas.join(', '));
  const [description, setDescription] = useState(provider.description);

  // Sync state if active provider switches
  React.useEffect(() => {
    setBizName(provider.businessName);
    setTagline(provider.tagline);
    setAddress(provider.address);
    setCity(provider.city);
    setContactPerson(provider.contactPerson);
    setPhone(provider.phone);
    setEmail(provider.email);
    setServiceAreasInput(provider.serviceAreas.join(', '));
    setDescription(provider.description);
    setIsEditing(false);
  }, [provider.id]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateProvider(provider.id, {
      businessName: bizName.trim(),
      tagline: tagline.trim(),
      address: address.trim(),
      city: city.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      serviceAreas: serviceAreasInput.split(',').map((s) => s.trim()).filter(Boolean),
      description: description.trim()
    });

    showNotification(`Profile updated for ${bizName}!`, 'success');
    setIsEditing(false);
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="page-title">Provider Business Profile</h2>
          <p className="page-subtitle">
            Manage institutional credentials, contact details, and service delivery coverage displayed across the network.
          </p>
        </div>
        {!isEditing ? (
          <button className="btn btn-outline btn-sm" onClick={() => setIsEditing(true)}>
            <Edit2 size={14} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
            <X size={14} />
            <span>Cancel Editing</span>
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div
              className="provider-avatar"
              style={{ width: '56px', height: '56px', fontSize: '1.4rem', backgroundColor: 'var(--brand-navy)', color: '#FFF' }}
            >
              <Building2 size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  {provider.businessName}
                </h3>
                <span className="badge badge-success">
                  <ShieldCheck size={12} /> Verified Provider
                </span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>{provider.tagline}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                Operational Address
              </span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>
                {provider.address}
              </strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{provider.city}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                Authorized Contact
              </span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>
                {provider.contactPerson}
              </strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                📞 {provider.phone} • ✉️ {provider.email}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Service & Delivery Coverage Areas
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {provider.serviceAreas.map((area, idx) => (
                <span key={idx} className="badge badge-neutral" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  <Check size={12} color="var(--finance-green)" /> {area}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              About the Business & Capabilities
            </span>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {provider.description}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="card" style={{ padding: '28px' }}>
          <div className="form-group">
            <label className="form-label">Business Name <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tagline / Specialty</label>
            <input
              type="text"
              className="form-input"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input
                type="text"
                className="form-input"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Coverage Areas (comma separated)</label>
            <input
              type="text"
              className="form-input"
              value={serviceAreasInput}
              onChange={(e) => setServiceAreasInput(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={15} />
              <span>Save Changes</span>
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
