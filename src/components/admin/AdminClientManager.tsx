import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { Provider, Referral, OfferingRewardRule } from '../../types';
import {
  Building2,
  Plus,
  Users,
  Wallet,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  CreditCard,
  X,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  AlertCircle,
  LogIn,
  Key,
  Copy,
  Check,
  Send,
  FileText,
  Upload,
  Sparkles,
  Percent,
  ShieldCheck,
  FileCheck,
  Info
} from 'lucide-react';

import {
  uploadMouDocument,
  recordAdminMouUpload,
  syncProviderToSupabase
} from '../../services/supabaseClient';
import {
  extractRawTextFromMouFile,
  parseMouDetails
} from '../../services/mouParser';

export const AdminClientManager: React.FC = () => {
  const { providers, referrals, commissionLedger, addProvider, recordClientPayment } = useData();
  const { showNotification, switchRole, setActiveProviderId, registerProviderByAdmin, savedProviderUsers } = useApp();

  // Selected client to view detailed referrals & billing breakdown
  const [selectedClient, setSelectedClient] = useState<Provider | null>(null);

  // Modal: Record Payment Received from Client
  const [paymentClient, setPaymentClient] = useState<Provider | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank NEFT / RTGS');
  const [paymentNotes, setPaymentNotes] = useState('Monthly referral reconciliation invoice settlement.');

  // Modal: Add New Client Business via MoU Onboarding
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [onboardMode, setOnboardMode] = useState<'mou' | 'manual'>('mou');
  const [mouFileName, setMouFileName] = useState<string | null>(null);
  const [mouStoragePath, setMouStoragePath] = useState<string | null>(null);
  const [mouStorageUrl, setMouStorageUrl] = useState<string | null>(null);
  const [isScanningMou, setIsScanningMou] = useState(false);
  const [scanStepText, setScanStepText] = useState('');
  const [mouDocRef, setMouDocRef] = useState('Signed-MoU-Commercial-Agreement.pdf');
  const [extractedSuccess, setExtractedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bizName, setBizName] = useState('');
  const [tagline, setTagline] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [provPassword, setProvPassword] = useState('Partner@2026');
  const [city, setCity] = useState('Hyderabad');
  const [address, setAddress] = useState('');

  // Provider Credentials Handover Modal State
  const [handoverCard, setHandoverCard] = useState<{
    businessName: string;
    contactPerson: string;
    email: string;
    password: string;
    providerId: string;
    phone: string;
    mouDocRef?: string;
    mouCommissionPercent?: number;
  } | null>(null);
  const [copiedHandover, setCopiedHandover] = useState(false);
  const [serviceAreas, setServiceAreas] = useState('Hyderabad, Secunderabad');
  const [description, setDescription] = useState('');

  // Agreed Commercial Referral Fee % from executed MoU (% of MRP model)
  // Only the Provider adds their specific services & retail prices in their own portal!
  const [mouCommissionPercent, setMouCommissionPercent] = useState('40'); // Client gives agreed % of MRP across their services



  const handleMouFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMouFileName(file.name);
    setMouDocRef(file.name);
    setIsScanningMou(true);
    setExtractedSuccess(false);

    setScanStepText(`Uploading document "${file.name}" to secure storage...`);

    // Perform real storage upload to Supabase bucket
    const cleanDocName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
    const uploadRes = await uploadMouDocument(file, cleanDocName);
    if (uploadRes.success && uploadRes.filePath) {
      setMouStoragePath(uploadRes.filePath);
      setMouStorageUrl(uploadRes.fileUrl || uploadRes.filePath);
    }

    setScanStepText(`Parsing agreement text & extracting client email from "${file.name}"...`);

    try {
      const rawText = await extractRawTextFromMouFile(file, (msg) => setScanStepText(msg));
      const details = parseMouDetails(rawText, file.name);

      setBizName(details.businessName || cleanDocName);
      setTagline(details.tagline);
      setContactPerson(details.contactPerson || '');
      setEmail(details.email || '');
      setPhone(details.phone || '');
      setCity(details.city || 'Hyderabad');
      setAddress(details.address || `${details.city || 'Hyderabad'} Commercial Hub`);
      setServiceAreas(details.serviceAreas || `${details.city || 'Hyderabad'}, Pan-City`);
      setMouCommissionPercent(details.commissionPercent || '40');
      setDescription(details.description);
      setProvPassword('Partner@2026');

      setIsScanningMou(false);
      setExtractedSuccess(true);

      if (details.hasExtractedEmail) {
        showNotification(
          `Extracted client email "${details.email}" and partner terms from MoU!`,
          'success'
        );
      } else {
        showNotification(
          `MoU text parsed! Please enter the client's official email address below.`,
          'info'
        );
      }
    } catch (parseErr) {
      console.warn('MoU parse error:', parseErr);
      setIsScanningMou(false);
      setExtractedSuccess(true);
      showNotification('MoU uploaded. Please review and enter client details.', 'info');
    }
  };

  // Calculations across all clients
  const clientBillingSummary = providers.map((prov) => {
    const provReferrals = referrals.filter((r) => r.providerId === prov.id);
    const qualifiedLeads = provReferrals.filter((r) => r.leadStatus === 'qualified').length;
    const conversions = provReferrals.filter((r) => r.conversionStatus === 'converted').length;

    // Sum of provider fees owed from commission ledger for this provider
    const provCommissions = commissionLedger.filter((c) => c.providerId === prov.id);
    const totalAccruedFee = provCommissions.reduce((sum, c) => sum + c.providerFeeSnapshot, 0);

    const amountPaid = prov.amountPaidRupees || 0;
    const balanceOwed = Math.max(0, totalAccruedFee - amountPaid);

    return {
      provider: prov,
      referralsCount: provReferrals.length,
      qualifiedLeads,
      conversions,
      totalAccruedFee,
      amountPaid,
      balanceOwed,
      provReferrals,
      provCommissions
    };
  });

  const totalOwedByAllClients = clientBillingSummary.reduce((sum, c) => sum + c.totalAccruedFee, 0);
  const totalCollectedFromClients = clientBillingSummary.reduce((sum, c) => sum + c.amountPaid, 0);
  const totalOutstandingBalance = Math.max(0, totalOwedByAllClients - totalCollectedFromClients);

  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim()) {
      showNotification('Client legal business name is required.', 'warning');
      return;
    }
    if (!contactPerson.trim()) {
      showNotification('Authorized signatory / contact person is required.', 'warning');
      return;
    }
    if (!email.trim()) {
      showNotification('Official client login email from the MoU is required.', 'warning');
      return;
    }

    const provUserEmail = email.trim().toLowerCase();
    const assignedPassword = provPassword.trim() || 'Partner@2026';
    const pct = parseFloat(mouCommissionPercent) || 40;

    // 1. Add the new client business with the exact email from the MoU
    const newProv = addProvider({
      userId: `usr_prov_${Date.now()}`,
      businessName: bizName.trim(),
      tagline: tagline.trim() || 'Client Partner Business',
      contactPerson: contactPerson.trim(),
      email: provUserEmail,
      phone: phone.trim() || '+91 98888 77665',
      address: address.trim() || `${city} Commercial Center`,
      city: city.trim(),
      serviceAreas: serviceAreas.split(',').map((s) => s.trim()).filter(Boolean),
      agreementStatus: 'active',
      description: description.trim() || 'Verified client business on the affiliate platform.',
      amountPaidRupees: 0
    });

    // Sync Provider & Agreement to Supabase live DB
    syncProviderToSupabase(newProv);

    // If MoU file was uploaded, store in admin_mou_uploads table
    if (mouStoragePath || mouFileName) {
      recordAdminMouUpload({
        fileUrl: mouStorageUrl || `mous/${mouFileName}`,
        providerName: newProv.businessName,
        contactEmail: provUserEmail,
        contactPhone: newProv.phone,
        extractedReferralPct: pct,
        extractedRateCard: []
      });
    }

    // 2. Register Provider user account with credentials using the exact MoU email ID
    const provUser = {
      id: newProv.userId,
      name: contactPerson.trim(),
      email: provUserEmail,
      role: 'provider' as const,
      phone: phone.trim() || '+91 98888 77665',
      providerId: newProv.id
    };
    registerProviderByAdmin(provUser, newProv.id, assignedPassword);

    // 3. Set credentials handover card modal
    setHandoverCard({
      businessName: newProv.businessName,
      contactPerson: newProv.contactPerson,
      email: provUserEmail,
      password: assignedPassword,
      providerId: newProv.id,
      phone: newProv.phone,
      mouDocRef: mouDocRef || 'Signed MoU on File',
      mouCommissionPercent: pct
    });

    showNotification(`New client "${newProv.businessName}" onboarded with official email "${provUserEmail}"!`, 'success');
    setShowAddClientModal(false);

    // Reset fields
    setBizName('');
    setTagline('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setProvPassword('Partner@2026');
    setMouCommissionPercent('40');
    setMouFileName(null);
    setMouStoragePath(null);
    setMouStorageUrl(null);
    setExtractedSuccess(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentClient) return;

    const amt = parseFloat(paymentAmount) || 0;
    if (amt <= 0) return;

    recordClientPayment(paymentClient.id, amt, `${paymentMethod} - ${paymentNotes}`);
    showNotification(`Recorded payment of ₹${amt.toLocaleString('en-IN')} received from ${paymentClient.businessName}!`, 'success');

    setPaymentClient(null);
    setPaymentAmount('');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="page-title">Client Businesses & Accounts Receivable</h2>
          <p className="page-subtitle">
            Administer client businesses, track how many customer referrals were delivered to each client, and monitor fees owed to our company.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowAddClientModal(true);
            setOnboardMode('mou');
          }}
          id="btn-add-client-business"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FileText size={16} />
          <span>+ Onboard Client via Signed MoU</span>
        </button>
      </div>

      {/* Financial Health & Receivables Summary */}
      <div className="metrics-grid">
        <div className="metric-card" style={{ borderLeft: '4px solid var(--brand-navy)' }}>
          <div className="metric-header">
            <span>Client Businesses</span>
            <Building2 size={16} color="var(--brand-navy)" />
          </div>
          <div className="metric-value num-tabular" style={{ color: 'var(--brand-navy)' }}>
            {providers.length}
          </div>
          <div className="metric-subtext">
            <span>Active client partners on our platform</span>
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--brand-cobalt)' }}>
          <div className="metric-header">
            <span>Total Referrals Delivered</span>
            <Users size={16} color="var(--brand-cobalt)" />
          </div>
          <div className="metric-value num-tabular" style={{ color: 'var(--brand-cobalt)' }}>
            {referrals.length}
          </div>
          <div className="metric-subtext">
            <span>Customer introductions handed to clients</span>
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--accent-coral)' }}>
          <div className="metric-header">
            <span>Total Fees Owed by Clients</span>
            <TrendingUp size={16} color="var(--accent-coral)" />
          </div>
          <div className="metric-value num-tabular" style={{ color: 'var(--accent-coral)' }}>
            ₹{totalOwedByAllClients.toLocaleString('en-IN')}
          </div>
          <div className="metric-subtext">
            <span>What clients must pay us for delivered referrals</span>
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--finance-green)' }}>
          <div className="metric-header">
            <span>Total Payments Collected</span>
            <CheckCircle2 size={16} color="var(--finance-green)" />
          </div>
          <div className="metric-value num-tabular" style={{ color: 'var(--finance-green)' }}>
            ₹{totalCollectedFromClients.toLocaleString('en-IN')}
          </div>
          <div className="metric-subtext">
            <span>Received into company bank account</span>
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--status-pending)' }}>
          <div className="metric-header">
            <span>Outstanding Balance Owed to Us</span>
            <Clock size={16} color="var(--status-pending)" />
          </div>
          <div className="metric-value num-tabular" style={{ color: totalOutstandingBalance > 0 ? 'var(--status-pending)' : 'var(--finance-green)' }}>
            ₹{totalOutstandingBalance.toLocaleString('en-IN')}
          </div>
          <div className="metric-subtext">
            <span>Pending collection from client businesses</span>
          </div>
        </div>
      </div>

      {/* Client Businesses Table: Referrals Given & Amount Owed */}
      <div style={{ marginBottom: '36px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '14px' }}>
          Client Businesses & Referral Accounting
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client Business / Location</th>
                <th>Contact Person</th>
                <th>Referrals Given</th>
                <th>Amount Client Must Pay Us</th>
                <th>Amount Client Paid</th>
                <th>Balance Owed to Us</th>
                <th>Billing Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clientBillingSummary.map((item) => {
                const { provider, referralsCount, qualifiedLeads, conversions, totalAccruedFee, amountPaid, balanceOwed } = item;

                return (
                  <tr key={provider.id}>
                    <td>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--brand-navy)', display: 'block' }}>
                        {provider.businessName}
                      </strong>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        📍 {provider.city} • {provider.tagline}
                      </span>
                    </td>

                    <td>
                      <strong style={{ fontSize: '0.86rem', display: 'block' }}>{provider.contactPerson}</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{provider.phone}</span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span className="badge badge-neutral" style={{ width: 'fit-content', fontWeight: 700 }}>
                          {referralsCount} Referrals Given
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {qualifiedLeads} Qualified • {conversions} Converted
                        </span>
                      </div>
                    </td>

                    <td>
                      <strong className="num-tabular" style={{ fontSize: '1.05rem', color: 'var(--brand-navy)' }}>
                        ₹{totalAccruedFee.toLocaleString('en-IN')}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                        Earned on qualifying events
                      </span>
                    </td>

                    <td>
                      <strong className="num-tabular" style={{ fontSize: '1.05rem', color: 'var(--finance-green)' }}>
                        ₹{amountPaid.toLocaleString('en-IN')}
                      </strong>
                    </td>

                    <td>
                      {balanceOwed > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong className="num-tabular" style={{ fontSize: '1.05rem', color: 'var(--accent-coral)' }}>
                            ₹{balanceOwed.toLocaleString('en-IN')}
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-coral)', fontWeight: 600 }}>
                            PENDING FROM CLIENT
                          </span>
                        </div>
                      ) : (
                        <span className="badge badge-success">
                          ✓ ALL CLEARED
                        </span>
                      )}
                    </td>

                    <td>
                      {balanceOwed > 0 ? (
                        <span className="badge badge-pending">
                          Payment Due
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          Cleared / Up to Date
                        </span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          onClick={() => setSelectedClient(provider)}
                          title="Inspect all referrals given to this client"
                        >
                          <Eye size={13} />
                          <span>View Referrals</span>
                        </button>

                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.74rem', backgroundColor: 'var(--finance-green)', borderColor: 'var(--finance-green)' }}
                          onClick={() => {
                            setPaymentClient(provider);
                            setPaymentAmount(balanceOwed > 0 ? balanceOwed.toString() : '1000');
                          }}
                          title="Record payment received from client"
                        >
                          <CreditCard size={13} />
                          <span>Record Payment</span>
                        </button>

                        <button
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.74rem', color: 'var(--brand-cobalt)', borderColor: '#BAE6FD' }}
                          onClick={() => {
                            const provUser = savedProviderUsers.find((u) => u.providerId === provider.id);

                            setHandoverCard({
                              businessName: provider.businessName,
                              contactPerson: provider.contactPerson,
                              email: provUser?.email || provider.email || '',
                              password: 'Partner@2026',
                              providerId: provider.id,
                              phone: provider.phone
                            });
                          }}
                          title="View and share login credentials for this provider"
                        >
                          <Key size={13} />
                          <span>Share Credentials</span>
                        </button>

                        <button
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          onClick={() => {
                            setActiveProviderId(provider.id);
                            switchRole('provider');
                            showNotification(`Logged into private workspace for ${provider.businessName}`, 'info');
                          }}
                          title="Open this client's isolated provider portal"
                        >
                          <LogIn size={13} />
                          <span>Login as Client</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Client Business via Signed MoU */}
      {showAddClientModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '720px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={20} color="var(--brand-cobalt)" />
                  <span>Onboard Client Business via Signed MoU</span>
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Upload executed agreement to auto-populate company details, credentials email, and agreed referral rates (Strict 50% Affiliate Split)
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddClientModal(false)}>✕</button>
            </div>

            {/* Mode Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', backgroundColor: '#F8FAFC' }}>
              <button
                type="button"
                onClick={() => setOnboardMode('mou')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  borderBottom: onboardMode === 'mou' ? '3px solid var(--brand-cobalt)' : '3px solid transparent',
                  backgroundColor: onboardMode === 'mou' ? '#FFFFFF' : 'transparent',
                  fontWeight: onboardMode === 'mou' ? 700 : 500,
                  color: onboardMode === 'mou' ? 'var(--brand-cobalt)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '0.86rem'
                }}
              >
                <FileCheck size={16} />
                <span>Upload Signed MoU (Auto-Extract)</span>
              </button>
              <button
                type="button"
                onClick={() => setOnboardMode('manual')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  borderBottom: onboardMode === 'manual' ? '3px solid var(--brand-cobalt)' : '3px solid transparent',
                  backgroundColor: onboardMode === 'manual' ? '#FFFFFF' : 'transparent',
                  fontWeight: onboardMode === 'manual' ? 700 : 500,
                  color: onboardMode === 'manual' ? 'var(--brand-cobalt)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '0.86rem'
                }}
              >
                <Plus size={16} />
                <span>Manual Form Entry</span>
              </button>
            </div>

            <form onSubmit={handleAddClientSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="modal-body" style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
                
                {/* MoU Upload / Scanner Section */}
                {onboardMode === 'mou' && (
                  <div style={{ marginBottom: '20px' }}>
                    <div
                      style={{
                        border: '2px dashed #93C5FD',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center',
                        backgroundColor: '#EFF6FF',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleMouFileUpload}
                        accept=".pdf,.png,.jpg,.jpeg,.docx"
                        style={{ display: 'none' }}
                      />
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: '#DBEAFE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 10px auto',
                          color: 'var(--brand-cobalt)'
                        }}
                      >
                        <Upload size={22} />
                      </div>
                      <strong style={{ display: 'block', fontSize: '0.94rem', color: 'var(--brand-navy)', marginBottom: '4px' }}>
                        {mouFileName ? `Selected: ${mouFileName}` : 'Drop Signed MoU Document or Click to Upload'}
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Supports PDF, scanned images (PNG/JPG), and Word agreements (.docx)
                      </span>
                    </div>

                    {/* Scanning Progress Animation */}
                    {isScanningMou && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '14px 16px',
                          backgroundColor: '#FEF3C7',
                          border: '1px solid #FCD34D',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <Sparkles size={20} color="#D97706" />
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: '#92400E', display: 'block' }}>
                            Scanning & Parsing Signed MoU...
                          </strong>
                          <span style={{ fontSize: '0.78rem', color: '#B45309' }}>
                            {scanStepText || 'Analyzing document clauses and extracting rates...'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Extraction Success Banner */}
                    {extractedSuccess && !isScanningMou && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '12px 16px',
                          backgroundColor: email ? '#DCFCE7' : '#FEF3C7',
                          border: email ? '1px solid #86EFAC' : '1px solid #FCD34D',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <CheckCircle2 size={18} color={email ? '#16A34A' : '#D97706'} />
                          <span style={{ fontSize: '0.82rem', color: email ? '#166534' : '#92400E', fontWeight: 600 }}>
                            {email
                              ? `✓ Client official email "${email}" extracted from MoU! Credentials mapped for provider.`
                              : `⚠️ MoU text parsed. No email detected in document — please verify and enter the client's official email below.`}
                          </span>
                        </div>
                      </div>
                    )}



                  </div>
                )}

                {/* Form Fields: Entity & Contact */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Client Legal Entity Name <span className="required">*</span></span>
                      {extractedSuccess && (
                        <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 600 }}>✓ From MoU</span>
                      )}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. HealthSphere Diagnostics Ltd"
                      value={bizName}
                      onChange={(e) => setBizName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Specialty / Industry Tagline</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. NABH Diagnostic Center, CyberSec Audits"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Authorized Signatory / Contact Person <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Dr. Rajesh Sharma / Managing Director"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Phone (for WhatsApp Handover) <span className="required">*</span></label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91 98490 12345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Login Email ID Highlight */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: 'var(--brand-cobalt)' }}>Official Login Email ID (Username) *</span>
                      {email ? (
                        <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600 }}>✓ Extracted from MoU</span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 600 }}>Required</span>
                      )}
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      style={{ fontWeight: 600, borderColor: '#93C5FD', backgroundColor: '#F0F9FF' }}
                      placeholder="signatory@business.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                      This official email ID from the MoU will be used by the partner to log into their workspace.
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Temporary Password *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Partner@2026"
                      value={provPassword}
                      onChange={(e) => setProvPassword(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                      Default password for initial login.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">City / Headquarters</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Hyderabad, Bangalore, Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Operational Address</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Road / Suite / Commercial Hub"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                {/* MoU Commercial Referral Terms (% of MRP Model) */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--brand-navy)', margin: 0 }}>
                        Agreed MoU Commercial Terms (% of MRP Referral Model)
                      </h4>
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                        The gross referral fee percentage the client agreed to pay on their services per the executed MoU.
                      </p>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                      MoU Doc: <strong>{mouDocRef}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '14px', alignItems: 'center', marginBottom: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: 'var(--brand-cobalt)', fontWeight: 700 }}>
                        Agreed Referral Fee (% of MRP) *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          className="form-input num-tabular"
                          value={mouCommissionPercent}
                          onChange={(e) => setMouCommissionPercent(e.target.value)}
                          placeholder="40"
                          min="1"
                          max="100"
                          style={{ paddingRight: '32px', fontSize: '1.05rem', fontWeight: 700 }}
                          required
                        />
                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>
                          %
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        e.g. 40% of retail price
                      </span>
                    </div>

                    {/* Clean 50/50 Revenue Split Explanation Pill */}
                    {(() => {
                      const pct = parseFloat(mouCommissionPercent) || 40;
                      const halfPct = (pct / 2).toFixed(pct % 2 === 0 ? 0 : 1);
                      return (
                        <div
                          style={{
                            background: 'linear-gradient(135deg, rgba(240, 253, 244, 0.95) 0%, rgba(238, 242, 255, 0.95) 100%)',
                            border: '1px solid #86EFAC',
                            borderRadius: '8px',
                            padding: '10px 14px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <Percent size={15} color="#16A34A" />
                            <strong style={{ fontSize: '0.82rem', color: '#166534' }}>
                              Automatic 50/50 Revenue Split
                            </strong>
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#334155', lineHeight: 1.4 }}>
                            👤 <strong>{halfPct}% of MRP</strong> goes to the Referring Affiliate<br />
                            🏢 <strong>{halfPct}% of MRP</strong> is retained as Platform Margin
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Informational Note: Provider Adds Services Self-Service */}
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px dashed #CBD5E1',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}
                  >
                    <Info size={16} color="var(--brand-cobalt)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
                      <strong>Provider Self-Service:</strong> You do not need to enter the client's individual services or retail prices here. Once onboarded, the client logs in to their dedicated Provider Portal and adds their own test packages and retail pricing via <strong>"+ Add Service or Upload Rate Card"</strong>. The {mouCommissionPercent || 40}% MoU rate will apply automatically!
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)', padding: '14px 24px', backgroundColor: '#F8FAFC' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddClientModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={16} />
                  <span>Onboard Client & Generate Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Referrals Given to Selected Client */}
      {selectedClient && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Referrals Given to {selectedClient.businessName}</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Breakdown of customer leads delivered and the fee owed for each referral
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedClient(null)}>✕</button>
            </div>
            <div className="modal-body">
              {(() => {
                const clientRefs = referrals.filter((r) => r.providerId === selectedClient.id);
                const clientComms = commissionLedger.filter((c) => c.providerId === selectedClient.id);

                if (clientRefs.length === 0) {
                  return (
                    <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No referrals have been given to this client yet.
                    </p>
                  );
                }

                return (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Referral Code</th>
                          <th>Customer Details</th>
                          <th>Model</th>
                          <th>Status</th>
                          <th>Fee Client Must Pay Us</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientRefs.map((ref) => {
                          const comm = clientComms.find((c) => c.referralId === ref.id);
                          const fee = comm ? comm.providerFeeSnapshot : (ref.earningModel === 'lead_generation' ? 500 : 1500);

                          return (
                            <tr key={ref.id}>
                              <td>
                                <strong style={{ color: 'var(--brand-navy)' }}>{ref.referralCode}</strong>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                                  {new Date(ref.createdAt).toLocaleDateString('en-IN')}
                                </span>
                              </td>
                              <td>
                                <strong style={{ display: 'block' }}>{ref.customerName}</strong>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {ref.customerPhone} ({ref.customerCity})
                                </span>
                              </td>
                              <td>
                                {ref.earningModel === 'lead_generation' ? (
                                  <span className="badge badge-lead-gen">Lead Gen</span>
                                ) : (
                                  <span className="badge badge-conversion">Conversion</span>
                                )}
                              </td>
                              <td>
                                {ref.leadStatus === 'qualified' || ref.conversionStatus === 'converted' ? (
                                  <span className="badge badge-success">✓ Verified & Payable</span>
                                ) : (
                                  <span className="badge badge-pending">In Progress</span>
                                )}
                              </td>
                              <td>
                                <strong className="num-tabular" style={{ color: 'var(--accent-coral)', fontSize: '1rem' }}>
                                  ₹{fee.toLocaleString('en-IN')}
                                </strong>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedClient(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Record Client Payment Received */}
      {paymentClient && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Record Payment Received from Client</h2>
              <button className="modal-close-btn" onClick={() => setPaymentClient(null)}>✕</button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="modal-body">
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Client Business:</span>
                    <strong>{paymentClient.businessName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Contact:</span>
                    <span>{paymentClient.contactPerson}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Amount Received (₹) <span className="required">*</span></label>
                  <input
                    type="number"
                    className="form-input"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Mode / Transfer Channel</label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Bank NEFT / RTGS">Bank NEFT / RTGS Transfer</option>
                    <option value="UPI / IMPS">UPI / IMPS Immediate Transfer</option>
                    <option value="Cheque / DD">Bank Cheque / Demand Draft</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Reference / Transaction ID / Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setPaymentClient(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--finance-green)', borderColor: 'var(--finance-green)' }}>
                  Confirm Payment Received
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Provider Credentials Handover Card (PRD Enterprise Onboarding) */}
      {handoverCard && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#DCFCE7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#16A34A'
                  }}
                >
                  <Key size={20} />
                </div>
                <div>
                  <h2 className="modal-title" style={{ fontSize: '1.15rem' }}>
                    Provider Credentials & MoU Handover
                  </h2>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {handoverCard.businessName} • Onboarded via Signed MoU
                  </span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setHandoverCard(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <div
                style={{
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <CheckCircle2 size={18} color="#16A34A" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#166534', lineHeight: 1.5 }}>
                  <strong>Account Active & Credentials Generated:</strong> Provide these details to <strong>{handoverCard.contactPerson}</strong>. Their login username is set to their official email from the signed MoU.
                </p>
              </div>

              {/* Credentials Card Box */}
              <div
                style={{
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Client Business:</span>
                  <strong style={{ color: 'var(--brand-navy)' }}>{handoverCard.businessName}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Signatory Contact:</span>
                  <span>{handoverCard.contactPerson} ({handoverCard.phone})</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>MoU Document Reference:</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--brand-navy)', fontFamily: 'monospace' }}>
                    {handoverCard.mouDocRef || 'Signed-MoU-Onboarding.pdf'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Login Email ID (Username):</span>
                  <strong style={{ color: 'var(--brand-cobalt)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {handoverCard.email}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Assigned Password:</span>
                  <strong style={{ color: 'var(--status-pending)', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                    {handoverCard.password}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Portal Web Link:</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    {window.location.origin}
                  </span>
                </div>
              </div>

              {/* Commercial Split Summary */}
              {(() => {
                const pct = handoverCard.mouCommissionPercent || 40;
                const halfPct = pct / 2;
                const handoverMsg = `🏢 *sBLOOM (by Ottobon) - Provider Portal Access*\n\nHello ${handoverCard.contactPerson},\nYour business account for *${handoverCard.businessName}* has been officially activated on the sBLOOM Referral Marketplace under our executed MoU (${handoverCard.mouDocRef || 'Signed MoU'}).\n\n🌐 *Portal Link:* ${window.location.origin}\n📧 *Login Email:* ${handoverCard.email}\n🔑 *Temporary Password:* ${handoverCard.password}\n\n💼 *Agreed Commercial Terms (% of MRP Model):*\n• Referral Fee Client Gives Us: ${pct}% of MRP\n• 50/50 Revenue Split:\n  - Affiliate Reward: ${halfPct}% of MRP\n  - sBLOOM Platform Margin: ${halfPct}% of MRP\n\nPlease log in to your Provider Portal to add your service packages, prices, and upload your rate card!`;

                return (
                  <>
                    <div style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--brand-navy)', textTransform: 'uppercase' }}>
                          MoU Commercial Terms (% of MRP Model)
                        </span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#DCFCE7', color: '#15803D' }}>
                          {pct}% of MRP Agreement
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr', gap: '8px', fontSize: '0.78rem', backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        <div>
                          <span style={{ color: '#D97706', display: 'block', fontSize: '0.7rem' }}>Agreed Referral Rate:</span>
                          <strong style={{ fontSize: '0.95rem', color: '#B45309' }}>{pct}% of MRP</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Across all provider services</span>
                        </div>
                        <div>
                          <span style={{ color: '#16A34A', display: 'block', fontSize: '0.7rem' }}>50/50 Revenue Split:</span>
                          <span style={{ color: '#16A34A', fontWeight: 700, display: 'block' }}>
                            👤 Affiliate: {halfPct}% of MRP
                          </span>
                          <span style={{ color: 'var(--brand-cobalt)', fontWeight: 600, display: 'block', fontSize: '0.74rem' }}>
                            🏢 Platform: {halfPct}% of MRP
                          </span>
                        </div>
                      </div>
                      <p style={{ margin: '8px 0 0 0', fontSize: '0.73rem', color: '#64748B' }}>
                        💡 <em>The provider can log in immediately to enter their test packages, services, and retail prices.</em>
                      </p>
                    </div>

                    {/* 1-Click Actions: Copy Handover, WhatsApp Direct Send, & Instant Login */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{
                          padding: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          backgroundColor: copiedHandover ? '#16A34A' : 'var(--brand-navy)',
                          borderColor: copiedHandover ? '#16A34A' : 'var(--brand-navy)'
                        }}
                        onClick={() => {
                          navigator.clipboard.writeText(handoverMsg);
                          setCopiedHandover(true);
                          showNotification('Provider credentials message copied to clipboard!', 'success');
                          setTimeout(() => setCopiedHandover(false), 3000);
                        }}
                      >
                        {copiedHandover ? (
                          <>
                            <Check size={16} />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            <span>Copy Credentials</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`https://wa.me/${handoverCard.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(handoverMsg)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                        style={{
                          padding: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          borderColor: '#22C55E',
                          color: '#15803D',
                          backgroundColor: '#F0FDF4',
                          textDecoration: 'none'
                        }}
                      >
                        <Send size={16} />
                        <span>Send via WhatsApp</span>
                      </a>
                    </div>
                  </>
                );
              })()}

              {/* 1-Click Instant Login As Provider */}
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--brand-cobalt)' }}
                onClick={() => {
                  setActiveProviderId(handoverCard.providerId);
                  switchRole('provider');
                  setHandoverCard(null);
                  showNotification(`Switched to Provider Portal for ${handoverCard.businessName}`, 'success');
                }}
              >
                <LogIn size={16} />
                <span>Log In As This Provider Now (Open Provider Workspace)</span>
              </button>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setHandoverCard(null)}
              >
                Close & Return to Client Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
