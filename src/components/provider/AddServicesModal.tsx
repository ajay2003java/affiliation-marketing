import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { OfferingRewardRule, Provider } from '../../types';
import {
  Camera,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  X,
  Edit2,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  ClipboardList,
  Utensils,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { uploadRateCardImage, syncOfferingToSupabase } from '../../services/supabaseClient';
import { extractRawTextFromMouFile } from '../../services/mouParser';
import { scanRateCardWithClaude, scanExcelWithClaude, isClaudeConfigured } from '../../services/aiRateCardScanner';
import { parseExcelRateCard, downloadSampleRateCardTemplate } from '../../services/excelRateCardParser';

interface AddServicesModalProps {
  onClose: () => void;
  initialTab?: 'upload' | 'manual';
}

interface ExtractedItem {
  id: string;
  selected: boolean;
  title: string;
  category: string;
  price: number;
  affiliateLeadReward: number; // exact reward affiliate receives for lead
  affiliateConvReward: number; // exact reward affiliate receives for conversion
  description: string;
}

export const AddServicesModal: React.FC<AddServicesModalProps> = ({ onClose, initialTab }) => {
  const { categories, createOffering, providers } = useData();
  const { activeProviderId, showNotification } = useApp();

  const matchedProvider = providers.find((p) => p.id === activeProviderId);
  const activeProvider: Provider = matchedProvider || ({
    id: activeProviderId || 'prov_custom',
    businessName: 'Service Provider',
    city: 'Hyderabad',
    description: '',
    contactPerson: 'Authorized Signatory',
    email: '',
    phone: '',
    serviceAreas: ['Hyderabad'],
    status: 'active',
    agreementStatus: 'active',
    amountPaidRupees: 0
  } as Provider);

  // Determine provider business category based on name & description
  const isHealthcare = /diag|health|clinic|medic|fetal|care|hospital|pathol|scan|doctor/i.test(
    `${activeProvider.businessName} ${activeProvider.description}`
  );
  const isIT = /cloud|it|tech|soft|system|cyber|dev|infra/i.test(
    `${activeProvider.businessName} ${activeProvider.description}`
  );
  const isFood = /restaurant|food|biryani|dining|cafe|kitchen|cater/i.test(
    `${activeProvider.businessName} ${activeProvider.description}`
  );

  const defaultCategory = isHealthcare
    ? (categories.find((c) => c.id === 'cat_health')?.id || 'cat_health')
    : isIT
    ? (categories.find((c) => c.id === 'cat_it')?.id || 'cat_it')
    : isFood
    ? (categories.find((c) => c.id === 'cat_food')?.id || 'cat_food')
    : (categories.find((c) => c.id === 'cat_corp')?.id || categories[0]?.id || 'cat_health');

  // Active Provider's Onboarded MoU Commission / Referral Percentage (e.g. 40% for SMS Diagnostics)
  const agreedMouPct: number =
    activeProvider?.commissionPercent ||
    activeProvider?.activeAgreements?.[0]?.grossReferralPct ||
    40;
  const leadPct: number = Math.min(10, Math.round(agreedMouPct * 0.25)); // e.g. 10%
  const convPct: number = agreedMouPct - leadPct; // e.g. 30% for 40% MoU

  // Active Tab: 'upload' (PDF, Excel, or Photo) vs 'manual'
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');

  // Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingRateCardFile, setPendingRateCardFile] = useState<File | null>(null);
  const [rateCardStoragePath, setRateCardStoragePath] = useState<string | null>(null);
  const [rateCardStorageUrl, setRateCardStorageUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatusMessage, setScanStatusMessage] = useState('Reading rate card...');
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);

  // Industry-specific sample generator
  const getProviderSampleText = () => {
    if (isHealthcare) {
      return `Comprehensive Master Health Checkup (85+ Tests) 3999
Executive Cardiac & Diabetes Diagnostic Suite 6499
Complete Blood Picture (CBP) with ESR 350
Lipid Profile Panel (Cholesterol, HDL, LDL, Triglycerides) 650
Diabetes Screening Package (HbA1c + Fasting Blood Sugar) 850
Thyroid Function Test (Total T3, T4, TSH) 550
Liver Function Test (LFT - 11 Parameters) 750
Renal / Kidney Function Test (KFT / RFT) 750
Vitamin D3 & Vitamin B12 Screening 1499
Senior Citizen Preventive Wellness Screening 4499`;
    }
    if (isIT) {
      return `Cloud Architecture & Security Audit 25000
AWS / Azure Infrastructure Cost Optimization 15000
DevOps CI/CD Automation & Docker Migration 35000
Enterprise Vulnerability & Penetration Testing 45000`;
    }
    if (isFood) {
      return `Family Feast Dinner Combo (Serves 4-5) 1499
Corporate & Party Bulk Catering (10-15 Pax) 3999
Weekend Special Chef Tasting Menu 850`;
    }
    return `Annual Corporate Employee Health Camp 35000
Retained Executive Search & Recruitment 75000
Corporate Compliance & Legal Audit 25000`;
  };

  // Quick Text Paste Mode State (Starts clean and empty so no foreign items are shown)
  const [pasteMenuText, setPasteMenuText] = useState('');

  // Manual Mode State (Provider decides price and affiliate reward)
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState(defaultCategory);
  const [manualDesc, setManualDesc] = useState('');
  const [manualPrice, setManualPrice] = useState(isHealthcare ? '1999' : isIT ? '15000' : '1500');
  const [manualArea, setManualArea] = useState(activeProvider.city || 'Hyderabad');
  const [manualEnableLead, setManualEnableLead] = useState(true);
  const [manualAffiliateLeadReward, setManualAffiliateLeadReward] = useState(isHealthcare ? '200' : isIT ? '1000' : '150');
  const [manualEnableConv, setManualEnableConv] = useState(true);
  const [manualAffiliateConvReward, setManualAffiliateConvReward] = useState(isHealthcare ? '450' : isIT ? '2500' : '350');

  // Intelligent parser for OCR text, PDF streams, or pasted service lines
  const parseOcrOrMenuText = (text: string, sourceName: string): ExtractedItem[] => {
    const combinedContext = `${text} ${sourceName} ${activeProvider.businessName}`.toLowerCase();
    const isDetectedHealth = /health|diag|blood|scan|test|checkup|clinic|cardiac|liver|kidney|ecg|echo|mri|xray|sugar|thyroid|urine/i.test(combinedContext);
    const isDetectedIT = /cloud|audit|server|aws|azure|devops|docker|software|api|security/i.test(combinedContext);
    
    const targetCat = isDetectedHealth
      ? (categories.find((c) => c.id === 'cat_health')?.id || 'cat_health')
      : isDetectedIT
      ? (categories.find((c) => c.id === 'cat_it')?.id || 'cat_it')
      : defaultCategory;

    // Generic line-by-line regex parser for any uploaded rate card or pasted text
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 2);
    const parsed: ExtractedItem[] = [];

    lines.forEach((line, idx) => {
      // Matches: "Item Name ... 286" or "Item Name - ₹350" or "Item Name 1500"
      const match = line.match(/^(.*?)(?:[:=\-–—\t]|(?:\s{2,})|(?:[₹Rs\.]+\s*))\s*(\d{2,6})(?:\s*\/-\s*)?$/i) ||
                    line.match(/^(.*?)[\s]+(\d{2,6})(?:[^\d]*)$/);
      if (match) {
        const title = match[1].replace(/[₹Rs\.\:\-\t]/g, '').trim();
        const price = parseInt(match[2], 10);
        if (title.length > 2 && price > 10 && price < 500000) {
          const leadReward = Math.max(25, Math.round(price * (leadPct / 100)));
          const convReward = Math.max(50, Math.round(price * (convPct / 100)));
          parsed.push({
            id: `item_${Date.now()}_${idx}`,
            selected: true, // Pre-selected for provider review
            title,
            category: targetCat,
            price,
            affiliateLeadReward: leadReward,
            affiliateConvReward: convReward,
            description: `${title} offered by ${activeProvider.businessName}.`
          });
        }
      }
    });

    return parsed;
  };

  // Unified File Upload Handler: Accepts PDF, Excel (.xlsx, .xls, .csv), Images, or Text
  const handleUnifiedFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingRateCardFile(file);
    setUploadedFileName(file.name);
    setIsScanning(true);
    setScanStatusMessage(`Reading "${file.name}" & extracting services with ${agreedMouPct}% MoU agreement...`);

    const isExcel = /\.(xlsx|xls|csv)$/i.test(file.name);
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name);

    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(
        isExcel
          ? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%230E8A5E"/><text x="50" y="55" font-size="12" font-weight="bold" fill="white" text-anchor="middle">EXCEL</text></svg>'
          : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%230A2540"/><text x="50" y="45" font-size="11" font-weight="bold" fill="white" text-anchor="middle">RATE CARD</text><text x="50" y="62" font-size="9" fill="%2394A3B8" text-anchor="middle">PDF</text></svg>'
      );
    }

    try {
      let items: ExtractedItem[] | null = null;

      if (isExcel) {
        // TIER B UPFRONT: Use Claude AI API Key first for Excel rate cards
        if (isClaudeConfigured()) {
          setScanStatusMessage(`Claude AI is extracting services & prices from "${file.name}" via API key (${agreedMouPct}% MoU)...`);
          items = await scanExcelWithClaude(
            file,
            activeProvider.businessName,
            defaultCategory,
            agreedMouPct,
            (msg) => setScanStatusMessage(msg)
          );
        }

        // Graceful local fallback if API key is not present or API call fails
        if (!items || items.length === 0) {
          setScanStatusMessage(`Reading "${file.name}" with spreadsheet parser (${agreedMouPct}% MoU)...`);
          const parsedXl = await parseExcelRateCard(file, agreedMouPct);
          items = parsedXl.map((it) => ({
            ...it,
            selected: true,
            category: it.category || defaultCategory
          }));
        }
      } else {
        // TIER B UPFRONT: Use Claude AI Vision / PDF Document processing first
        if (isClaudeConfigured()) {
          setScanStatusMessage(`Claude AI Vision is reading "${file.name}" via API key (${agreedMouPct}% MoU)...`);
          items = await scanRateCardWithClaude(
            file,
            activeProvider.businessName,
            defaultCategory,
            agreedMouPct,
            (msg) => setScanStatusMessage(msg)
          );
        }

        // Graceful local fallback if API key is not present or API call fails
        if (!items || items.length === 0) {
          setScanStatusMessage(`Scanning "${file.name}" with document parser (${agreedMouPct}% MoU)...`);
          const rawText = await extractRawTextFromMouFile(file, (msg) => setScanStatusMessage(msg));
          items = parseOcrOrMenuText(rawText, file.name);
        }
      }

      if (items && items.length > 0) {
        setExtractedItems(items);
        showNotification(`Extracted ${items.length} services & MRP prices from "${file.name}"!`, 'success');
      } else {
        setExtractedItems([]);
        showNotification(
          'No service names and prices could be detected from this file. Please verify file content or use manual entry.',
          'warning'
        );
      }
    } catch (err: any) {
      console.warn('Rate card parse error:', err);
      setExtractedItems([]);
      showNotification(err?.message || 'Could not read file. Please try another format or manual entry.', 'warning');
    } finally {
      setIsScanning(false);
    }
  };

  // Parse quick pasted text rate card
  const handleQuickPasteSubmit = () => {
    if (!pasteMenuText.trim()) return;
    const items = parseOcrOrMenuText(pasteMenuText, activeProvider.businessName);
    if (items.length > 0) {
      setExtractedItems(items);
      setActiveTab('upload');
      setImagePreview('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%230A2540"/><text x="50" y="55" font-size="11" fill="white" text-anchor="middle">RATE CARD</text></svg>');
      showNotification(`Extracted ${items.length} services from rate card text!`, 'success');
    } else {
      showNotification('Could not detect prices. Ensure lines have prices like "Service Name 2500"', 'warning');
    }
  };

  // Toggle selection for a single item
  const toggleItemSelect = (id: string) => {
    setExtractedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Toggle select all / deselect all
  const toggleSelectAll = () => {
    const allSelected = extractedItems.length > 0 && extractedItems.every((i) => i.selected);
    setExtractedItems((prev) => prev.map((item) => ({ ...item, selected: !allSelected })));
  };

  // Update item field (with dynamic MoU affiliate percentage calculation on price change)
  const updateItemField = (id: string, field: keyof ExtractedItem, val: any) => {
    setExtractedItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === 'price') {
          const numPrice = typeof val === 'number' ? val : parseFloat(val) || 0;
          const lead = Math.max(25, Math.round(numPrice * (leadPct / 100)));
          const conv = Math.max(50, Math.round(numPrice * (convPct / 100)));
          return {
            ...item,
            price: numPrice,
            affiliateLeadReward: lead,
            affiliateConvReward: conv
          };
        }
        return { ...item, [field]: val };
      })
    );
  };

  // Shared Review & Commission Configuration Table for Extracted Items
  const renderExtractedTable = () => (
    <div>
      {/* MoU Split Explanation Banner */}
      <div
        style={{
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '8px',
          padding: '9px 14px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          color: '#166534',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <span>
          🤝 <strong>Commercial MoU ({activeProvider.businessName}):</strong> Platform referral fee of <strong>{agreedMouPct}%</strong> applies to converted patient/customer bills.
        </span>
        <span style={{ fontSize: '0.74rem', color: '#15803D', fontWeight: 600 }}>
          Billed monthly upon verified sales
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Extracted Services ({extractedItems.filter((i) => i.selected).length} ticked of {extractedItems.length})
          </span>
          <span style={{ fontSize: '0.78rem', color: '#0E8A5E', fontWeight: 600, display: 'block', marginTop: '2px' }}>
            ✓ Tick the checkbox next to the services you want to store in your database.
          </span>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={toggleSelectAll}
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
        >
          {extractedItems.every((i) => i.selected) ? 'Untick All' : 'Tick All'}
        </button>
      </div>

      <div className="table-responsive" style={{ maxHeight: '340px', overflowY: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '46px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={extractedItems.length > 0 && extractedItems.every((i) => i.selected)}
                  onChange={toggleSelectAll}
                  title="Tick all / Untick all"
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th>Service / Item Name</th>
              <th style={{ width: '160px' }}>Price / MRP (₹)</th>
              <th style={{ width: '200px' }}>Platform Referral Fee ({agreedMouPct}% MoU)</th>
            </tr>
          </thead>
          <tbody>
            {extractedItems.map((item) => {
              const mrp = Number(item.price) || 0;
              const providerFee = Math.round(mrp * (agreedMouPct / 100));

              return (
                <tr key={item.id} style={{ opacity: item.selected ? 1 : 0.45 }}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleItemSelect(item.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      value={item.title}
                      onChange={(e) => updateItemField(item.id, 'title', e.target.value)}
                      style={{ padding: '6px 8px', fontSize: '0.84rem' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-input"
                      value={item.price}
                      onChange={(e) => updateItemField(item.id, 'price', parseFloat(e.target.value) || 0)}
                      style={{ padding: '6px 8px', fontSize: '0.84rem', fontWeight: 700 }}
                    />
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <span style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0A2540' }}>
                        ₹{providerFee.toLocaleString('en-IN')}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#F1F5F9',
                          color: '#475569',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          border: '1px solid #CBD5E1'
                        }}
                      >
                        {agreedMouPct}% of MRP
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Save ONLY selected (ticked) extracted items to database
  const handleBulkPublish = () => {
    const selected = extractedItems.filter((i) => i.selected);
    if (selected.length === 0) {
      alert('Please tick at least one service to store into the database.');
      return;
    }

    // Now upload rate card document to storage bucket since user confirmed publishing
    if (pendingRateCardFile) {
      uploadRateCardImage(pendingRateCardFile, activeProvider.id).then((uploadRes) => {
        if (uploadRes.success && uploadRes.filePath) {
          setRateCardStoragePath(uploadRes.filePath);
          setRateCardStorageUrl(uploadRes.fileUrl || uploadRes.filePath);
        }
      });
    }

    selected.forEach((item) => {
      const mrp = Number(item.price) || 0;
      const totalProviderFee = Math.round(mrp * (agreedMouPct / 100)); // e.g. ₹30 for 30% on ₹100
      const totalAffiliateReward = Math.round(totalProviderFee * 0.5);  // e.g. ₹15 (50% of ₹30)

      const rules: OfferingRewardRule[] = [
        {
          id: `rr_conv_${Date.now()}_${item.id}`,
          offeringId: '',
          eventType: 'successful_conversion',
          providerFeeRupees: totalProviderFee,
          affiliateRewardRupees: totalAffiliateReward,
          conversionCriteria: 'Completed customer service purchase / invoice cleared.',
          version: 1,
          isActive: true
        }
      ];

      const created = createOffering({
        providerId: activeProvider.id,
        serviceId: 'srv_custom',
        categoryId: item.category,
        title: item.title,
        description: item.description,
        features: ['Verified Commercial Service', 'Direct Provider Support'],
        customerPriceRupees: item.price,
        currency: 'INR',
        serviceArea: activeProvider.city || 'Pan-India',
        rewardRules: rules,
        status: 'active'
      });

      // Synchronize strictly only ticked items to Supabase database
      syncOfferingToSupabase(created);
    });

    showNotification(`Stored ${selected.length} ticked services in your database!`, 'success');
    onClose();
  };

  // Manual Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const rules: OfferingRewardRule[] = [];
    const affLead = parseFloat(manualAffiliateLeadReward) || 0;
    const affConv = parseFloat(manualAffiliateConvReward) || 0;

    if (manualEnableLead && affLead > 0) {
      rules.push({
        id: `rr_lead_${Date.now()}`,
        offeringId: '',
        eventType: 'qualified_lead',
        providerFeeRupees: affLead * 2, // Strict 50% MoU policy: Provider pays 2x, affiliate gets 50%
        affiliateRewardRupees: affLead,
        qualificationCriteria: 'Prospect contact and need verified.',
        version: 1,
        isActive: true
      });
    }

    if (manualEnableConv && affConv > 0) {
      rules.push({
        id: `rr_conv_${Date.now()}`,
        offeringId: '',
        eventType: 'successful_conversion',
        providerFeeRupees: affConv * 2, // Strict 50% MoU policy: Provider pays 2x, affiliate gets 50%
        affiliateRewardRupees: affConv,
        conversionCriteria: 'Completed client contract / invoice paid.',
        version: 1,
        isActive: true
      });
    }

    const created = createOffering({
      providerId: activeProvider.id,
      serviceId: 'srv_custom',
      categoryId: manualCategory,
      title: manualTitle.trim(),
      description: manualDesc.trim() || 'Custom commercial service offering.',
      features: ['Verified Quality', 'Dedicated Support'],
      customerPriceRupees: parseFloat(manualPrice) || 0,
      currency: 'INR',
      serviceArea: manualArea,
      rewardRules: rules,
      status: 'active'
    });

    // Synchronize to backend
    syncOfferingToSupabase(created);

    showNotification(`Added service "${manualTitle}" successfully!`, 'success');
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '820px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Add Services for {activeProvider.businessName}</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Choose whether to upload a photo of your price list / rate card, or type services in manually
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Mode Selector Tabs (Unified Upload vs Manual) */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-surface-subtle)', padding: '6px 20px 0', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              padding: '10px 16px',
              fontSize: '0.86rem',
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: activeTab === 'upload' ? 'var(--brand-cobalt)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'upload' ? '3px solid var(--brand-cobalt)' : '3px solid transparent'
            }}
          >
            <Upload size={16} />
            <span>📁 Upload Rate Card (PDF, Excel, or Photo)</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            style={{
              padding: '10px 16px',
              fontSize: '0.86rem',
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: activeTab === 'manual' ? 'var(--brand-cobalt)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'manual' ? '3px solid var(--brand-cobalt)' : '3px solid transparent'
            }}
          >
            <Edit2 size={15} />
            <span>✍️ Type Manually</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* 1. UNIFIED UPLOAD MODE (Accepts PDF, Excel .xlsx, .xls, .csv, and Photos) */}
          {activeTab === 'upload' && (
            <div>
              {extractedItems.length === 0 ? (
                <div>
                  <div
                    style={{
                      border: '2px dashed var(--brand-cobalt)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '36px 20px',
                      textAlign: 'center',
                      backgroundColor: 'var(--brand-cobalt-light)',
                      marginBottom: '20px',
                      position: 'relative'
                    }}
                  >
                    <input
                      type="file"
                      id="rateCardUnifiedInput"
                      accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp,.txt"
                      style={{ display: 'none' }}
                      onChange={handleUnifiedFileUpload}
                    />

                    {isScanning ? (
                      <div style={{ textAlign: 'center', padding: '24px 20px' }}>
                        <Sparkles size={36} color="var(--brand-cobalt)" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 12px' }} />
                        <p style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>
                          {scanStatusMessage}
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload size={44} color="var(--brand-cobalt)" style={{ margin: '0 auto 12px' }} />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '8px' }}>
                          Upload Tariff Sheet or Rate Card
                        </h3>
                        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 20px', lineHeight: 1.55 }}>
                          Upload your price list as a <strong>PDF</strong>, <strong>Excel spreadsheet (.xlsx, .csv)</strong>, or photo scan. Only the <strong>Service Name</strong> and <strong>MRP Price</strong> are extracted with agreed MoU % calculation.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => document.getElementById('rateCardUnifiedInput')?.click()}
                          >
                            <Upload size={16} />
                            <span>Choose File (PDF, Excel, or Photo)</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => downloadSampleRateCardTemplate(activeProvider.businessName)}
                          >
                            <Download size={16} />
                            <span>Download 2-Column Excel Template</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 3-Column Extraction Guidance Box */}
                  <div style={{ backgroundColor: '#F8FAFC', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '8px' }}>
                      ⚡ AI Extraction with API Key & MoU Commercial Rules:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <div style={{ background: '#FFF', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                        <strong style={{ color: 'var(--brand-navy)', display: 'block', marginBottom: '2px' }}>1. Service / Test Name</strong>
                        Extracted directly from document
                      </div>
                      <div style={{ background: '#FFF', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                        <strong style={{ color: 'var(--brand-navy)', display: 'block', marginBottom: '2px' }}>2. Price / MRP (₹)</strong>
                        Customer retail price
                      </div>
                      <div style={{ background: '#FFF', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                        <strong style={{ color: '#047857', display: 'block', marginBottom: '2px' }}>3. Affiliate Share ({agreedMouPct}%)</strong>
                        {leadPct}% lead (min ₹25) + {convPct}% sale (min ₹50)
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {/* File Loaded Status Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F0F9FF', padding: '12px 18px', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid #BAE6FD', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={26} color="var(--brand-cobalt)" />
                      <div>
                        <strong style={{ fontSize: '0.92rem', color: 'var(--brand-navy)', display: 'block' }}>
                          {uploadedFileName || 'Rate Card Document Loaded'}
                        </strong>
                        <span style={{ fontSize: '0.78rem', color: '#0369A1', fontWeight: 600 }}>
                          ✓ {extractedItems.length} services extracted with agreed MoU % rates
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="file"
                        id="rateCardUnifiedInputReplace"
                        accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp,.txt"
                        style={{ display: 'none' }}
                        onChange={handleUnifiedFileUpload}
                      />
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => document.getElementById('rateCardUnifiedInputReplace')?.click()}
                      >
                        <Upload size={14} />
                        <span>Upload Different File</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => downloadSampleRateCardTemplate(activeProvider.businessName)}
                      >
                        <Download size={14} />
                        <span>Template (.xlsx)</span>
                      </button>
                    </div>
                  </div>

                  {/* Render the clean 2-column review table */}
                  {renderExtractedTable()}
                </div>
              )}
            </div>
          )}

          {/* Manual Mode View */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit}>
              <div className="form-group">
                <label className="form-label">Service Title <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Master Cardiac & Diabetes Diagnostic Suite, Cloud Security Review"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Customer Price (₹) <span className="required">*</span></label>
                  <input
                    type="number"
                    className="form-input"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    required
                  />
                  <span className="form-help">What customer pays you</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Service Description</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Describe tests, deliverables, or consultations included..."
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Coverage / Delivery Area</label>
                <input
                  type="text"
                  className="form-input"
                  value={manualArea}
                  onChange={(e) => setManualArea(e.target.value)}
                />
              </div>

              {/* Referral Fees Setup */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px', marginTop: '10px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--brand-navy)', display: 'block', marginBottom: '2px' }}>
                  Affiliate Referral Rewards (Decided Solely by You):
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                  Specify exactly how much money the affiliate will receive for bringing you a customer referral.
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ backgroundColor: 'var(--lead-teal-light)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--lead-teal-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <input
                        type="checkbox"
                        id="mLeadCheck"
                        checked={manualEnableLead}
                        onChange={(e) => setManualEnableLead(e.target.checked)}
                      />
                      <label htmlFor="mLeadCheck" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--lead-teal)', cursor: 'pointer' }}>
                        Affiliate Reward: Qualified Lead (₹)
                      </label>
                    </div>
                    {manualEnableLead && (
                      <div>
                        <input
                          type="number"
                          className="form-input"
                          value={manualAffiliateLeadReward}
                          onChange={(e) => setManualAffiliateLeadReward(e.target.value)}
                          placeholder="e.g. 350"
                          style={{ padding: '6px 10px', fontSize: '0.88rem' }}
                        />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                          Cash affiliate earns for verified prospect
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ backgroundColor: 'var(--finance-green-light)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--finance-green-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <input
                        type="checkbox"
                        id="mConvCheck"
                        checked={manualEnableConv}
                        onChange={(e) => setManualEnableConv(e.target.checked)}
                      />
                      <label htmlFor="mConvCheck" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--finance-green)', cursor: 'pointer' }}>
                        Affiliate Reward: Closed Sale (₹)
                      </label>
                    </div>
                    {manualEnableConv && (
                      <div>
                        <input
                          type="number"
                          className="form-input"
                          value={manualAffiliateConvReward}
                          onChange={(e) => setManualAffiliateConvReward(e.target.value)}
                          placeholder="e.g. 900"
                          style={{ padding: '6px 10px', fontSize: '0.88rem' }}
                        />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                          Cash affiliate earns on completed purchase
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>

          {activeTab === 'upload' && extractedItems.length > 0 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleBulkPublish}
              disabled={isScanning || extractedItems.filter((i) => i.selected).length === 0}
            >
              <Check size={16} />
              <span>
                {extractedItems.filter((i) => i.selected).length === 0
                  ? 'Tick services above to save to database'
                  : `Store ${extractedItems.filter((i) => i.selected).length} Ticked Services in Database`}
              </span>
            </button>
          )}

          {activeTab === 'manual' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleManualSubmit}
            >
              <Plus size={16} />
              <span>Publish Service & Pricing</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
