import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { Referral, Provider, ProviderOffering, ProviderMonthlyInvoice, ProviderMonthlyInvoiceItem } from '../../types';
import { MOCK_PROVIDERS } from '../../services/mockData';
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
  Building2,
  FileSpreadsheet,
  Download,
  Upload,
  FileText
} from 'lucide-react';
import {
  downloadReferralReconciliationWorksheet,
  parseReferralReconciliationExcel
} from '../../services/excelReferralReconciliation';
import { analyzeCustomerBillWithClaude } from '../../services/aiBillAnalyzer';
import { uploadProviderBillReceipt } from '../../services/supabaseClient';

export const ProviderHome: React.FC = () => {
  const {
    referrals,
    offerings,
    providers,
    providerMonthlyInvoices,
    updateLeadStatus,
    updateConversionStatus,
    updateRejectionStatus,
    generateProviderMonthlyInvoice,
    markProviderMonthlyInvoicePaid,
    logProxyCall,
    maskPhoneNumber
  } = useData();
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

  // Referrals and Offerings belonging to this provider
  const providerReferrals = activeProvider
    ? referrals.filter((r) => r.providerId === activeProvider.id || (activeProviderId && r.providerId === activeProviderId))
    : [];
  const providerOfferings = activeProvider
    ? offerings.filter((o) => o.providerId === activeProvider.id || (activeProviderId && o.providerId === activeProviderId))
    : [];

  // Modal: Add Service / Rate Card
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'upload' | 'manual'>('upload');

  // Excel Referral Reconciliation Upload Handler
  const handleReconcileExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseReferralReconciliationExcel(file);
      let updatedCount = 0;
      rows.forEach((row) => {
        const matchingRef = providerReferrals.find(
          (r) =>
            r.referralCode?.toLowerCase() === row.referralCode.toLowerCase() ||
            (row.customerName && r.customerName.toLowerCase() === row.customerName.toLowerCase())
        );
        if (matchingRef) {
          if (row.action === 'convert') {
            const sale = row.saleAmount || matchingRef.saleValueRupees || 2000;
            updateConversionStatus(
              matchingRef.id,
              'converted',
              sale,
              row.notes
                ? `${row.notes} (Reconciled from Excel)`
                : `Customer converted. Sale: ₹${sale}. Invoice: ${row.invoiceRef || 'N/A'}. (Reconciled from Excel)`,
              activeProvider?.contactPerson || 'Provider Billing'
            );
            updatedCount++;
          } else if (row.action === 'qualify') {
            updateLeadStatus(
              matchingRef.id,
              'qualified',
              row.notes || 'Contact and interest verified via Excel reconciliation.',
              activeProvider?.contactPerson || 'Provider Billing'
            );
            updatedCount++;
          } else if (row.action === 'reject') {
            updateConversionStatus(
              matchingRef.id,
              'not_converted',
              0,
              row.notes || 'Customer lost / declined (Reconciled from Excel).',
              activeProvider?.contactPerson || 'Provider Billing'
            );
            updatedCount++;
          }
        }
      });

      if (updatedCount > 0) {
        showNotification(`Bulk reconciliation complete: Updated ${updatedCount} referrals from "${file.name}"!`, 'success');
      } else {
        showNotification(`Read ${rows.length} rows from Excel, but no matching referral codes found.`, 'info');
      }
    } catch (err: any) {
      console.warn('Reconciliation error:', err);
      showNotification(err?.message || 'Failed to read reconciliation spreadsheet.', 'warning');
    }
  };

  // Search & Filter for Leads
  const [leadSearch, setLeadSearch] = useState('');
  const [leadFilter, setLeadFilter] = useState<'all' | 'needs_action' | 'converted'>('all');

  // Outcome Action Modal (Convert / Lost)
  const [activeModal, setActiveModal] = useState<{
    type: 'convert' | 'lost' | 'qualify';
    referral: Referral;
  } | null>(null);
  const [saleValueInput, setSaleValueInput] = useState('100');
  const [invoiceRefInput, setInvoiceRefInput] = useState('INV-2026-');
  const [actionNotes, setActionNotes] = useState('');
  const [billProofPreview, setBillProofPreview] = useState<string | null>(null);
  const [selectedBillFile, setSelectedBillFile] = useState<File | null>(null);
  const [isAnalyzingBill, setIsAnalyzingBill] = useState(false);
  const [claudeScanFeedback, setClaudeScanFeedback] = useState<string | null>(null);
  const [isUploadingBill, setIsUploadingBill] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('Customer cancelled / did not visit');

  // Provider View Tabs: 'leads' vs 'invoices'
  const [providerViewTab, setProviderViewTab] = useState<'leads' | 'invoices'>('leads');
  const [viewInvoiceModal, setViewInvoiceModal] = useState<ProviderMonthlyInvoice | null>(null);
  const [paymentRefInput, setPaymentRefInput] = useState('');

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
  const totalConverted = providerReferrals.filter(
    (r) =>
      r.conversionStatus === 'converted' ||
      r.conversionStatus === 'converted_pending_clearance' ||
      r.conversionStatus === 'cleared_ready_for_payout' ||
      r.conversionStatus === 'paid_and_settled'
  ).length;

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
      return (
        ref.conversionStatus === 'converted' ||
        ref.conversionStatus === 'converted_pending_clearance' ||
        ref.conversionStatus === 'cleared_ready_for_payout' ||
        ref.conversionStatus === 'paid_and_settled'
      );
    }

    return true;
  });

  // Handle Bill Receipt file selection & automatic Claude Vision AI analysis
  const handleBillFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedBillFile(file);
    setClaudeScanFeedback(null);

    // Instant local preview
    const reader = new FileReader();
    reader.onload = () => setBillProofPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Call Claude Vision to analyze the receipt
    setIsAnalyzingBill(true);
    try {
      const res = await analyzeCustomerBillWithClaude(file);
      if (res.success && res.totalBilledAmount) {
        setSaleValueInput(res.totalBilledAmount.toString());
        if (res.invoiceNumber) {
          setInvoiceRefInput(res.invoiceNumber);
        }
        const itemsList = res.itemsDetected && res.itemsDetected.length > 0
          ? ` • Items: ${res.itemsDetected.join(', ')}`
          : '';
        setClaudeScanFeedback(`✨ Claude AI extracted: Total Bill ₹${res.totalBilledAmount}${itemsList}`);
        showNotification(`Claude AI detected bill total: ₹${res.totalBilledAmount}!`, 'success');
      } else if (res.error) {
        setClaudeScanFeedback(`ℹ️ ${res.error}`);
      }
    } catch (err: any) {
      console.warn('Claude bill scan error:', err);
      setClaudeScanFeedback('⚠️ Could not complete Claude AI bill scan. Please verify amount manually.');
    } finally {
      setIsAnalyzingBill(false);
    }
  };

  // Handle Mark Converted / Lost Submit
  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    const { type, referral } = activeModal;

    if (type === 'convert') {
      const saleVal = parseFloat(saleValueInput) || 100;
      let finalBillProofUrl = billProofPreview || undefined;

      // Upload receipt file to Supabase storage 'provider-bills' bucket
      if (selectedBillFile) {
        setIsUploadingBill(true);
        try {
          const uploadRes = await uploadProviderBillReceipt(
            selectedBillFile,
            activeProvider?.id || 'general',
            referral.referralCode
          );
          if (uploadRes.success && uploadRes.fileUrl) {
            finalBillProofUrl = uploadRes.fileUrl;
          }
        } catch (err) {
          console.warn('Bill storage upload warning:', err);
        } finally {
          setIsUploadingBill(false);
        }
      }

      updateConversionStatus(
        referral.id,
        'converted_pending_clearance',
        saleVal,
        `Customer converted. Sale: ₹${saleVal}. Invoice: ${invoiceRefInput || 'N/A'}. ${actionNotes}`,
        activeProvider?.contactPerson || 'Provider Billing',
        finalBillProofUrl,
        invoiceRefInput || undefined
      );
      showNotification(`Referral for ${referral.customerName} marked as Converted (Bill: ₹${saleVal.toLocaleString('en-IN')})! Added to monthly billing.`, 'success');
    } else if (type === 'lost') {
      updateRejectionStatus(
        referral.id,
        rejectionReasonInput || 'Customer cancelled / did not visit',
        actionNotes,
        activeProvider?.contactPerson || 'Provider Billing'
      );
      showNotification(`Referral for ${referral.customerName} marked as Not Converted. 7-day review window active.`, 'info');
    } else if (type === 'qualify') {
      updateLeadStatus(
        referral.id,
        'qualified',
        actionNotes || 'Contact and interest verified by provider.',
        activeProvider?.contactPerson || 'Provider Billing'
      );
      showNotification(`Lead for ${referral.customerName} qualified!`, 'success');
    }

    setActiveModal(null);
    setActionNotes('');
    setBillProofPreview(null);
    setSelectedBillFile(null);
    setClaudeScanFeedback(null);
    setIsAnalyzingBill(false);
    setRejectionReasonInput('Customer cancelled / did not visit');
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
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            id="btn-add-service-hero"
            onClick={() => {
              setModalInitialTab('upload');
              setShowAddServiceModal(true);
            }}
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
            <Upload size={16} />
            <span>+ Upload Rate Card (PDF / Excel / Photo)</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1 (FIRST): Leads or Monthly Invoices
      ========================================================================= */}
      <section style={{ marginBottom: '36px' }}>
        {/* Navigation Switcher: Leads vs Monthly Invoices */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid var(--border-light)', paddingBottom: '2px' }}>
          <button
            type="button"
            onClick={() => setProviderViewTab('leads')}
            style={{
              padding: '10px 18px',
              fontSize: '0.90rem',
              fontWeight: 800,
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: providerViewTab === 'leads' ? '3px solid var(--brand-cobalt)' : '3px solid transparent',
              color: providerViewTab === 'leads' ? 'var(--brand-cobalt)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '-2px'
            }}
          >
            <Users size={16} />
            <span>Customer Leads ({providerReferrals.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setProviderViewTab('invoices')}
            style={{
              padding: '10px 18px',
              fontSize: '0.90rem',
              fontWeight: 800,
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: providerViewTab === 'invoices' ? '3px solid var(--brand-cobalt)' : '3px solid transparent',
              color: providerViewTab === 'invoices' ? 'var(--brand-cobalt)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '-2px'
            }}
          >
            <FileText size={16} />
            <span>Monthly Platform Invoices ({providerMonthlyInvoices.filter((i) => i.providerId === activeProvider.id).length})</span>
            {providerMonthlyInvoices.some((i) => i.providerId === activeProvider.id && i.status === 'unpaid') && (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC2626' }} />
            )}
          </button>
        </div>

        {providerViewTab === 'leads' ? (
          <div>
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

        {/* Search & Excel Reconciliation Actions Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div style={{ flex: 1, minWidth: '220px', maxWidth: '380px', position: 'relative' }}>
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

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => downloadReferralReconciliationWorksheet(activeProvider.businessName, providerReferrals, offerings)}
              style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px' }}
              title="Download all leads in an Excel sheet to check patient visits and enter bill numbers"
            >
              <Download size={13} />
              <span>Export Leads (.xlsx)</span>
            </button>

            <label
              className="btn btn-outline btn-sm"
              style={{
                fontSize: '0.78rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                cursor: 'pointer',
                borderColor: '#0E8A5E',
                color: '#0E8A5E'
              }}
              title="Upload the completed reconciliation spreadsheet to bulk-update conversion and billing outcomes"
            >
              <FileSpreadsheet size={13} />
              <span>Bulk Reconcile via Excel</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                onChange={handleReconcileExcelUpload}
              />
            </label>
          </div>
        </div>

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
                      {ref.conversionStatus === 'converted_pending_clearance' && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '10px',
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            border: '1px solid #FCD34D'
                          }}
                        >
                          ⏳ Converted (Awaiting Month-End Clearance)
                        </span>
                      )}
                      {(ref.conversionStatus === 'cleared_ready_for_payout' || ref.conversionStatus === 'paid_and_settled') && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '10px',
                            backgroundColor: '#DCFCE7',
                            color: '#166534',
                            border: '1px solid #86EFAC'
                          }}
                        >
                          ✓ Cleared & Reconciled
                        </span>
                      )}
                      {ref.conversionStatus === 'review_cooling_off' && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '10px',
                            backgroundColor: '#FEE2E2',
                            color: '#991B1B',
                            border: '1px solid #FCA5A5'
                          }}
                        >
                          ⚠️ Marked Lost: {ref.rejectionReason || 'No-Show'} (7-Day Review)
                        </span>
                      )}
                      {ref.conversionStatus === 'disputed' && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '10px',
                            backgroundColor: '#FEF2F2',
                            color: '#B91C1C',
                            border: '1px solid #F87171'
                          }}
                        >
                          🚨 Attribution Disputed by Affiliate
                        </span>
                      )}
                      {ref.conversionStatus === 'not_converted' && (
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
                          ✓ Billed: ₹{(ref.actualBillAmount || ref.saleValueRupees || offering?.customerPriceRupees || 100).toLocaleString('en-IN')}
                        </span>
                        {ref.partnerInvoiceRef && (
                          <span style={{ fontSize: '0.72rem', color: '#475569', display: 'block' }}>
                            Ref: <strong>{ref.partnerInvoiceRef}</strong>
                          </span>
                        )}
                        {ref.billProofUrl && (
                          <a
                            href={ref.billProofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.72rem', color: 'var(--brand-cobalt)', fontWeight: 600, textDecoration: 'underline', display: 'block', marginTop: '2px' }}
                          >
                            📄 View Bill Receipt
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    ) : (
      <div>
        {/* Invoices Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                  Consolidated Monthly Invoices
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Monthly billing statements for platform referral fees ({activeProvider.commissionPercent || 30}% MoU). Cleared payments disburse rewards to affiliates.
                </p>
              </div>

              {/* Check for unbilled conversions */}
              {(() => {
                const unbilled = providerReferrals.filter(
                  (r) =>
                    (r.conversionStatus === 'converted_pending_clearance' || r.conversionStatus === 'converted') &&
                    !r.providerInvoiceId
                );
                const mouPct = activeProvider.commissionPercent || activeProvider.activeAgreements?.[0]?.grossReferralPct || 30;
                const unbilledTotal = unbilled.reduce((sum, r) => sum + (r.actualBillAmount || r.saleValueRupees || 100), 0);
                const unbilledFee = Math.round(unbilledTotal * (mouPct / 100));

                if (unbilled.length === 0) return null;

                return (
                  <div
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#FEF3C7',
                      borderRadius: '8px',
                      border: '1px solid #FCD34D',
                      fontSize: '0.80rem',
                      color: '#92400E',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Clock size={16} color="#D97706" />
                    <span>
                      <strong>{unbilled.length} recent customer visits</strong> recorded (₹{unbilledTotal.toLocaleString('en-IN')} total sales). Monthly statement for <strong>₹{unbilledFee.toLocaleString('en-IN')}</strong> ({mouPct}% MoU) will be issued by platform admin at billing cycle close.
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* List of Invoices */}
            {providerMonthlyInvoices.filter((i) => i.providerId === activeProvider.id).length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <FileText size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1rem', color: 'var(--brand-navy)', marginBottom: '4px' }}>No Monthly Invoices Issued Yet</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto' }}>
                  When customer leads convert and have receipts uploaded, you can generate your consolidated statement at the end of each billing cycle.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {providerMonthlyInvoices
                  .filter((i) => i.providerId === activeProvider.id)
                  .map((inv) => (
                    <div
                      key={inv.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '10px',
                        border: inv.status === 'unpaid' ? '1.5px solid #FCD34D' : '1px solid var(--border-light)',
                        padding: '20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <strong style={{ fontSize: '1.05rem', color: 'var(--brand-navy)' }}>
                              {inv.invoiceNumber}
                            </strong>
                            {inv.status === 'unpaid' ? (
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                                🔴 PAYMENT DUE
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC' }}>
                                ✓ CLEARED & PAID
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                            Billing Month: <strong>{inv.billingMonth}</strong> • Issued: {new Date(inv.generatedAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>
                            Total Fee Owed ({inv.mouCommissionPercent}% MoU)
                          </span>
                          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                            ₹{inv.totalFeeOwedToPlatform.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Itemized Table of Customers */}
                      <div className="table-responsive" style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '14px' }}>
                        <table className="data-table" style={{ fontSize: '0.8rem', margin: 0 }}>
                          <thead>
                            <tr>
                              <th>Customer Name</th>
                              <th>Bill Reference</th>
                              <th>Billed Amount</th>
                              <th>MoU Fee ({inv.mouCommissionPercent}%)</th>
                              <th>Receipt Photo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inv.items.map((item: ProviderMonthlyInvoiceItem) => (
                              <tr key={item.referralId}>
                                <td><strong>{item.customerName}</strong></td>
                                <td><code>{item.invoiceRef || item.referralCode}</code></td>
                                <td style={{ fontWeight: 600 }}>₹{item.billedAmount.toLocaleString('en-IN')}</td>
                                <td style={{ fontWeight: 700, color: '#0A2540' }}>₹{item.providerFee.toLocaleString('en-IN')}</td>
                                <td>
                                  {item.billProofUrl ? (
                                    <a href={item.billProofUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-cobalt)', fontWeight: 600, textDecoration: 'underline' }}>
                                      View Receipt
                                    </a>
                                  ) : (
                                    <span style={{ color: '#94A3B8' }}>None</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Payment Action Bar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          Total Customer Sales Billed: <strong>₹{inv.totalPatientBilledAmount.toLocaleString('en-IN')}</strong> across <strong>{inv.totalBilledCustomers}</strong> customers.
                        </div>

                        {inv.status === 'unpaid' ? (
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => {
                              setViewInvoiceModal(inv);
                              setPaymentRefInput('');
                            }}
                            style={{ backgroundColor: 'var(--finance-green)', color: '#FFF', fontWeight: 700, padding: '7px 16px' }}
                          >
                            💳 Clear Statement / Enter UTR (₹{inv.totalFeeOwedToPlatform})
                          </button>
                        ) : (
                          <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>
                            Paid on {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString('en-IN') : 'Confirmed'} • Ref: {inv.paymentReference || 'UTR-CLEARED'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
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
                        placeholder="e.g. BILL-1049"
                        value={invoiceRefInput}
                        onChange={(e) => setInvoiceRefInput(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Upload Bill / Cash Memo Photo <span className="required">*</span></span>
                        {isAnalyzingBill && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--brand-cobalt)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            <Sparkles size={12} /> Claude AI Analyzing Receipt...
                          </span>
                        )}
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="form-input"
                        style={{ fontSize: '0.78rem', padding: '6px' }}
                        onChange={handleBillFileChange}
                      />

                      {/* AI Verification Extract Banner */}
                      {claudeScanFeedback && (
                        <div style={{
                          marginTop: '8px',
                          padding: '8px 10px',
                          backgroundColor: '#EFF6FF',
                          borderRadius: '6px',
                          border: '1px solid #BFDBFE',
                          fontSize: '0.76rem',
                          color: '#1E40AF',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '6px'
                        }}>
                          <Sparkles size={14} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--brand-cobalt)' }} />
                          <div>{claudeScanFeedback}</div>
                        </div>
                      )}

                      {billProofPreview && (
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={billProofPreview} alt="Receipt Preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                          <div>
                            <span style={{ fontSize: '0.74rem', color: '#16A34A', fontWeight: 700, display: 'block' }}>
                              ✓ Receipt attached & ready
                            </span>
                            <span style={{ fontSize: '0.70rem', color: '#64748B' }}>
                              Saved to Supabase storage bucket 'provider-bills' upon submit
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Live Calculation Preview */}
                    {(() => {
                      const mouPct = activeProvider?.commissionPercent || activeProvider?.activeAgreements?.[0]?.grossReferralPct || 30;
                      const bill = parseFloat(saleValueInput) || 0;
                      const fee = Math.round(bill * (mouPct / 100));
                      return (
                        <div style={{ padding: '8px 12px', backgroundColor: '#F0FDF4', borderRadius: '6px', border: '1px solid #BBF7D0', fontSize: '0.78rem', color: '#166534', marginBottom: '12px' }}>
                          <div>💰 <strong>Billed: ₹{bill.toLocaleString('en-IN')}</strong></div>
                          <div>🤝 <strong>Platform MoU Fee ({mouPct}%): ₹{fee.toLocaleString('en-IN')}</strong></div>
                          <span style={{ fontSize: '0.7rem', color: '#15803D' }}>Included in your consolidated month-end invoice</span>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Reason for not converting</label>
                      <select
                        className="form-select"
                        value={rejectionReasonInput}
                        onChange={(e) => setRejectionReasonInput(e.target.value)}
                        style={{ fontSize: '0.82rem', marginBottom: '8px' }}
                      >
                        <option value="Customer cancelled / did not visit">Customer cancelled / did not visit</option>
                        <option value="Pricing was too high / customer declined">Pricing was too high / customer declined</option>
                        <option value="Customer visited another provider">Customer visited another provider</option>
                        <option value="Wrong contact details / unreachable">Wrong contact details / unreachable</option>
                        <option value="Other">Other</option>
                      </select>
                      <textarea
                        className="form-textarea"
                        rows={2}
                        placeholder="Additional details / notes..."
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                      />
                    </div>
                    <div style={{ padding: '8px 12px', backgroundColor: '#FEF2F2', borderRadius: '6px', border: '1px solid #FECACA', fontSize: '0.75rem', color: '#991B1B' }}>
                      ⚠️ <strong>7-Day Review Active:</strong> The affiliate has 7 days to review and dispute if the customer visited.
                    </div>
                  </>
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
          MODAL 4: Pay Monthly Invoice Dialog
      ========================================================================= */}
      {viewInvoiceModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ fontSize: '1.05rem', margin: 0 }}>
                Clear Monthly Invoice: {viewInvoiceModal.invoiceNumber}
              </h3>
              <button className="modal-close-btn" onClick={() => setViewInvoiceModal(null)}>✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                markProviderMonthlyInvoicePaid(viewInvoiceModal.id, paymentRefInput || `UTR-${Date.now().toString().slice(-6)}`);
                showNotification(`Invoice ${viewInvoiceModal.invoiceNumber} (₹${viewInvoiceModal.totalFeeOwedToPlatform}) marked as PAID! Affiliate rewards unlocked.`, 'success');
                setViewInvoiceModal(null);
                setPaymentRefInput('');
              }}
            >
              <div className="modal-body" style={{ padding: '18px 20px' }}>
                <div style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Billing Month:</span>
                    <strong style={{ fontSize: '0.84rem', color: '#0A2540' }}>{viewInvoiceModal.billingMonth}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Total Customer Bills:</span>
                    <strong style={{ fontSize: '0.84rem', color: '#0A2540' }}>₹{viewInvoiceModal.totalPatientBilledAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '6px' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0A2540' }}>Total Fee Due ({viewInvoiceModal.mouCommissionPercent}% MoU):</span>
                    <strong style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-cobalt)' }}>₹{viewInvoiceModal.totalFeeOwedToPlatform.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div style={{ padding: '10px 14px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE', fontSize: '0.78rem', color: '#1E40AF', marginBottom: '16px' }}>
                  <div>🏦 <strong>Platform Settlement Account (sBLOOM):</strong></div>
                  <div>UPI VPA: <code>academy@ottobon.in</code></div>
                  <div>Account: <strong>Ottobon Professional Services</strong></div>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Bank / UPI UTR Transaction Reference <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. UTR-432890128912 or UPI Ref"
                    value={paymentRefInput}
                    onChange={(e) => setPaymentRefInput(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                    Enter transaction ID from your banking or UPI app after transferring the fee.
                  </span>
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewInvoiceModal(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm"
                  style={{ backgroundColor: 'var(--finance-green)', color: '#FFF', fontWeight: 700 }}
                >
                  ✓ Confirm Payment & Clear Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: Add Services Modal (Excel Rate Card / Camera OCR / Manual)
      ========================================================================= */}
      {showAddServiceModal && (
        <AddServicesModal onClose={() => setShowAddServiceModal(false)} initialTab={modalInitialTab} />
      )}
    </div>
  );
};
