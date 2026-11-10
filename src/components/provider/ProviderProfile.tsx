import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { Building2, ShieldCheck, Check, Edit2, Save, X, Key, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Provider } from '../../types';

export const ProviderProfile: React.FC = () => {
  const { providers, updateProvider } = useData();
  const { activeProviderId, showNotification, changeUserPassword, currentUser } = useApp();

  const provider: Provider | undefined = providers.find((p) => p.id === activeProviderId);

  const [isEditing, setIsEditing] = useState(false);
  const [bizName, setBizName] = useState(provider?.businessName || '');
  const [tagline, setTagline] = useState(provider?.tagline || '');
  const [address, setAddress] = useState(provider?.address || '');
  const [city, setCity] = useState(provider?.city || '');
  const [contactPerson, setContactPerson] = useState(provider?.contactPerson || '');
  const [phone, setPhone] = useState(provider?.phone || '');
  const [email, setEmail] = useState(provider?.email || '');
  const [serviceAreasInput, setServiceAreasInput] = useState(provider?.serviceAreas?.join(', ') || '');
  const [description, setDescription] = useState(provider?.description || '');

  // Password management state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Sync state if active provider switches
  React.useEffect(() => {
    if (!provider) return;
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
  }, [provider?.id]);

  if (!provider) {
    return (
      <div style={{ maxWidth: '880px', margin: '40px auto', padding: '48px 24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <Building2 size={48} color="var(--brand-cobalt)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '8px' }}>
          Provider Account Not Found
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 24px' }}>
          Please verify that you are logged into your registered provider business account.
        </p>
      </div>
    );
  }

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

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter.');
      return;
    }

    const res = changeUserPassword(newPassword);
    if (res.success) {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordForm(false);
      }, 3500);
    } else {
      setPasswordError(res.error || 'Failed to update password.');
    }
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

      {/* Account Security & Password Management Card */}
      <div className="card" style={{ padding: '24px 28px', marginTop: '24px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: showPasswordForm ? '16px' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-cobalt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--brand-navy)', margin: 0 }}>
                Account Security & Portal Password
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Login Email: <strong>{provider.email || currentUser.email}</strong> • Role: Verified Client Provider
              </p>
            </div>
          </div>

          {!showPasswordForm ? (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setShowPasswordForm(true);
                setPasswordError(null);
                setPasswordSuccess(false);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
            >
              <Lock size={14} />
              <span>Change Portal Password</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setShowPasswordForm(false);
                setPasswordError(null);
                setNewPassword('');
                setConfirmPassword('');
              }}
            >
              <X size={14} />
              <span>Close</span>
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ maxWidth: '480px' }}>
              {passwordError && (
                <div className="notice-box error" style={{ padding: '8px 12px', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={15} />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="notice-box success" style={{ padding: '8px 12px', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} />
                  <span>Password updated successfully! Your account is now secured with your new password.</span>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>
                  New Password <span className="required">*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter new password (min. 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                    style={{ width: '100%', paddingRight: '42px', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      color: showNewPassword ? 'var(--brand-cobalt)' : '#64748B',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>
                  Confirm New Password <span className="required">*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                    style={{ width: '100%', paddingRight: '42px', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      color: showConfirmPassword ? 'var(--brand-cobalt)' : '#64748B',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={15} />
                  <span>Save New Password</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowPasswordForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
