import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { Contact, ProviderOffering } from '../../types';
import { Users, Plus, Send, Sparkles, Trash2, X, Phone, Mail, MapPin } from 'lucide-react';
import { ReferralModal } from './ReferralModal';

export const MyContacts: React.FC = () => {
  const { contacts, offerings, addContact, deleteContact } = useData();
  const { showNotification } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [occupation, setOccupation] = useState('');
  const [tagsInput, setTagsInput] = useState('Healthcare, Corporate');

  // Referral trigger with pre-filled contact
  const [referralOffering, setReferralOffering] = useState<ProviderOffering | null>(null);
  const [targetContact, setTargetContact] = useState<Contact | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    addContact({
      affiliateId: 'usr_aff_01',
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      occupation: occupation.trim(),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    });

    showNotification(`Contact ${name} saved to your private address book!`, 'success');
    setShowAddModal(false);
    setName('');
    setPhone('');
    setEmail('');
    setOccupation('');
  };

  // Find recommended offerings based on contact tags
  const getSuggestionsForContact = (contact: Contact) => {
    return offerings.filter((o) => {
      if (o.status !== 'active') return false;
      const matchTag = contact.tags.some(
        (t) =>
          o.title.toLowerCase().includes(t.toLowerCase()) ||
          o.description.toLowerCase().includes(t.toLowerCase())
      );
      return matchTag;
    });
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="page-title">My Contacts & Smart Match</h2>
          <p className="page-subtitle">
            Securely save trusted contacts from your network and review non-intrusive service recommendations.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>Add New Contact</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {contacts.map((contact) => {
          const suggestions = getSuggestionsForContact(contact);

          return (
            <div key={contact.id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                    {contact.name}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {contact.occupation || 'Network Contact'}
                  </span>
                </div>
                <button
                  onClick={() => deleteContact(contact.id)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                  title="Remove contact"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={13} color="var(--text-muted)" />
                  <span>{contact.phone}</span>
                </div>
                {contact.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={13} color="var(--text-muted)" />
                    <span>{contact.email}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} color="var(--text-muted)" />
                  <span>{contact.city}</span>
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {contact.tags.map((tag, idx) => (
                  <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Suggestions Box */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                  <Sparkles size={14} color="var(--brand-cobalt)" />
                  <span>Recommended Offering Matches:</span>
                </div>

                {suggestions.length === 0 ? (
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>No direct offering matches found.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {suggestions.slice(0, 2).map((off) => (
                      <div
                        key={off.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: '#FFF',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-light)'
                        }}
                      >
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                          {off.title.length > 28 ? off.title.substring(0, 28) + '...' : off.title}
                        </span>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          onClick={() => {
                            setTargetContact(contact);
                            setReferralOffering(off);
                          }}
                        >
                          <Send size={12} />
                          <span>Refer</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Save Contact to Address Book</h2>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
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
                <div className="form-group">
                  <label className="form-label">Profession / Role</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. HR Director, Hospital Administrator"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Interest Tags (comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pre-filled Referral Modal */}
      {referralOffering && (
        <ReferralModal
          offering={referralOffering}
          onClose={() => {
            setReferralOffering(null);
            setTargetContact(null);
          }}
          preselectedContact={
            targetContact
              ? {
                  name: targetContact.name,
                  phone: targetContact.phone,
                  email: targetContact.email,
                  city: targetContact.city
                }
              : undefined
          }
        />
      )}
    </div>
  );
};
