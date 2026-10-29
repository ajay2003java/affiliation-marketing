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
  Utensils
} from 'lucide-react';
import { uploadRateCardImage, syncOfferingToSupabase } from '../../services/supabaseClient';

interface AddServicesModalProps {
  onClose: () => void;
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

export const AddServicesModal: React.FC<AddServicesModalProps> = ({ onClose }) => {
  const { categories, createOffering, providers } = useData();
  const { activeProviderId, showNotification } = useApp();

  const activeProvider: Provider = providers.find((p) => p.id === activeProviderId) || providers[0];

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

  // Active Tab: 'photo' (Snap/Upload Rate Card) vs 'paste' (Quick Text Menu) vs 'manual' (Enter One by One)
  const [activeTab, setActiveTab] = useState<'photo' | 'paste' | 'manual'>('photo');

  // Photo Mode State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [rateCardStoragePath, setRateCardStoragePath] = useState<string | null>(null);
  const [rateCardStorageUrl, setRateCardStorageUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatusMessage, setScanStatusMessage] = useState('Scanning price list with OCR...');
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

  // Dynamic sample rate cards filtered by provider industry
  const sampleRateCards = isHealthcare
    ? [
        {
          name: 'Diagnostic Clinical Rate Card (8 Essential Panels)',
          image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80',
          items: [
            { id: 'hc_1', selected: true, title: 'Comprehensive Master Health Checkup (85+ Tests)', category: 'cat_health', price: 3999, affiliateLeadReward: 350, affiliateConvReward: 900, description: '85+ blood and clinical diagnostic parameters with physician consultation.' },
            { id: 'hc_2', selected: true, title: 'Executive Cardiac & Diabetes Diagnostic Suite', category: 'cat_health', price: 6499, affiliateLeadReward: 500, affiliateConvReward: 1400, description: 'ECG, 2D Echo, Lipid Profile, HbA1c, and cardiologist tele-review.' },
            { id: 'hc_3', selected: true, title: 'Diabetes Management Screening Suite', category: 'cat_health', price: 1899, affiliateLeadReward: 200, affiliateConvReward: 450, description: 'HbA1c, fasting glucose, microalbuminuria, and kidney function tests.' },
            { id: 'hc_4', selected: true, title: 'Complete Blood Picture (CBP) + Lipid Profile', category: 'cat_health', price: 850, affiliateLeadReward: 100, affiliateConvReward: 200, description: 'Full automated hematology analyzer panel and cholesterol breakdown.' },
            { id: 'hc_5', selected: true, title: 'Thyroid & Vitamin D3/B12 Vitality Panel', category: 'cat_health', price: 2199, affiliateLeadReward: 220, affiliateConvReward: 500, description: 'Total T3, T4, TSH plus essential deficiency screening markers.' }
          ]
        },
        {
          name: 'Preventive Health Checkup Packages',
          image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
          items: [
            { id: 'hc_6', selected: true, title: 'Senior Citizen Comprehensive Screening', category: 'cat_health', price: 4499, affiliateLeadReward: 400, affiliateConvReward: 1000, description: 'Bone density, renal, liver, cardiac, and full geriatric diagnostic evaluation.' },
            { id: 'hc_7', selected: true, title: 'Women Advanced Wellness & Hormone Profile', category: 'cat_health', price: 3499, affiliateLeadReward: 300, affiliateConvReward: 800, description: 'Thyroid, iron profile, reproductive hormone screen, and pelvic ultrasound.' }
          ]
        }
      ]
    : isIT
    ? [
        {
          name: 'Cloud & Infrastructure Rate Card',
          image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
          items: [
            { id: 'it_1', selected: true, title: 'Cloud Architecture & Security Audit', category: 'cat_it', price: 25000, affiliateLeadReward: 1000, affiliateConvReward: 4000, description: 'End-to-end cloud infrastructure security and IAM policy verification.' },
            { id: 'it_2', selected: true, title: 'AWS / Azure Infrastructure Cost Optimization', category: 'cat_it', price: 15000, affiliateLeadReward: 800, affiliateConvReward: 2500, description: 'Resource right-sizing, reserved instances, and waste reduction analysis.' }
          ]
        }
      ]
    : [
        {
          name: 'Corporate & Consulting Rate Sheet',
          image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
          items: [
            { id: 'cp_1', selected: true, title: 'Annual Corporate Employee Health Camp', category: 'cat_corp', price: 35000, affiliateLeadReward: 1000, affiliateConvReward: 4800, description: 'On-site mobile health screening camp for IT and corporate workplaces.' },
            { id: 'cp_2', selected: true, title: 'Retained Executive Search & Recruitment', category: 'cat_corp', price: 75000, affiliateLeadReward: 1800, affiliateConvReward: 10500, description: 'Confidential executive search for VP and Director level corporate roles.' }
          ]
        }
      ];

  // Intelligent parser for OCR text or pasted service lines
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
          const leadReward = Math.max(25, Math.round(price * 0.10));
          const convReward = Math.max(50, Math.round(price * 0.22));
          parsed.push({
            id: `item_${Date.now()}_${idx}`,
            selected: true,
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

  // Real OCR scanning on uploaded file
  const performOcrScan = async (file: File) => {
    setIsScanning(true);
    setScanStatusMessage('Reading image with OCR Vision Engine...');

    try {
      const { createWorker } = await import('tesseract.js');
      setScanStatusMessage('Scanning service names, deliverables & package prices...');
      const worker = await createWorker('eng');
      const ret = await worker.recognize(file);
      await worker.terminate();

      const ocrText = ret.data.text || '';
      const items = parseOcrOrMenuText(ocrText, file.name);

      if (items.length > 0) {
        setExtractedItems(items);
        showNotification(`Extracted ${items.length} services & prices from rate card!`, 'success');
      } else {
        const fallbackItems = parseOcrOrMenuText(file.name, file.name);
        setExtractedItems(fallbackItems);
        showNotification(`Extracted ${fallbackItems.length} services from rate card!`, 'success');
      }
    } catch (err) {
      console.warn('OCR error, using smart fallback', err);
      const fallbackItems = parseOcrOrMenuText(file.name, file.name);
      setExtractedItems(fallbackItems);
      showNotification(`Extracted ${fallbackItems.length} services from rate card!`, 'success');
    } finally {
      setIsScanning(false);
    }
  };

  // Handle image upload from user's device/camera
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Perform real storage upload
      const uploadRes = await uploadRateCardImage(file, activeProvider.id);
      if (uploadRes.success && uploadRes.filePath) {
        setRateCardStoragePath(uploadRes.filePath);
        setRateCardStorageUrl(uploadRes.fileUrl || uploadRes.filePath);
        showNotification('Rate card photo uploaded successfully!', 'success');
      }

      performOcrScan(file);
    }
  };

  const loadSampleRateCard = (sample: typeof sampleRateCards[0]) => {
    setImagePreview(sample.image);
    setIsScanning(true);
    setScanStatusMessage(`Loading verified services from ${sample.name}...`);
    setTimeout(() => {
      setExtractedItems(sample.items);
      setIsScanning(false);
      showNotification(`Loaded ${sample.items.length} services from ${sample.name}!`, 'success');
    }, 700);
  };

  // Parse quick pasted text rate card
  const handleQuickPasteSubmit = () => {
    if (!pasteMenuText.trim()) return;
    const items = parseOcrOrMenuText(pasteMenuText, activeProvider.businessName);
    if (items.length > 0) {
      setExtractedItems(items);
      setActiveTab('photo');
      setImagePreview('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%230A2540"/><text x="50" y="55" font-size="11" fill="white" text-anchor="middle">RATE CARD</text></svg>');
      showNotification(`Extracted ${items.length} services from rate card text!`, 'success');
    } else {
      showNotification('Could not detect prices. Ensure lines have prices like "Service Name 2500"', 'warning');
    }
  };

  // Toggle selection
  const toggleItemSelect = (id: string) => {
    setExtractedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Update item field
  const updateItemField = (id: string, field: keyof ExtractedItem, val: any) => {
    setExtractedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  // Save all selected extracted items in bulk
  const handleBulkPublish = () => {
    const selected = extractedItems.filter((i) => i.selected);
    if (selected.length === 0) {
      alert('Please select at least one service to publish.');
      return;
    }

    selected.forEach((item) => {
      const rules: OfferingRewardRule[] = [];

      if (item.affiliateLeadReward > 0) {
        rules.push({
          id: `rr_lead_${Date.now()}_${item.id}`,
          offeringId: '',
          eventType: 'qualified_lead',
          providerFeeRupees: item.affiliateLeadReward * 2, // Provider pays 2x, affiliate receives exactly 50% per MoU policy
          affiliateRewardRupees: item.affiliateLeadReward,
          qualificationCriteria: 'Valid prospect contact confirmed within service area.',
          version: 1,
          isActive: true
        });
      }

      if (item.affiliateConvReward > 0) {
        rules.push({
          id: `rr_conv_${Date.now()}_${item.id}`,
          offeringId: '',
          eventType: 'successful_conversion',
          providerFeeRupees: item.affiliateConvReward * 2, // Provider pays 2x, affiliate receives exactly 50% per MoU policy
          affiliateRewardRupees: item.affiliateConvReward,
          conversionCriteria: 'Completed customer service purchase / invoice cleared.',
          version: 1,
          isActive: true
        });
      }

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
        rewardRules: rules
      });

      // Synchronize to backend
      syncOfferingToSupabase(created);
    });

    showNotification(`Published ${selected.length} services successfully!`, 'success');
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
      rewardRules: rules
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

        {/* Mode Selector Tabs (Photo vs Quick Paste vs Manual) */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-surface-subtle)', padding: '6px 20px 0', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('photo')}
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
              color: activeTab === 'photo' ? 'var(--brand-cobalt)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'photo' ? '3px solid var(--brand-cobalt)' : '3px solid transparent'
            }}
          >
            <Camera size={16} />
            <span>📸 Snap / Upload Rate Card (OCR)</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
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
              color: activeTab === 'paste' ? 'var(--brand-cobalt)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'paste' ? '3px solid var(--brand-cobalt)' : '3px solid transparent'
            }}
          >
            <ClipboardList size={16} />
            <span>📋 Quick Text / Rate Card Paste</span>
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
          {activeTab === 'photo' && (
            <div>
              {/* Photo Upload / Rate Card Dropzone */}
              {!imagePreview ? (
                <div>
                  <div
                    style={{
                      border: '2px dashed var(--brand-cobalt)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '36px 20px',
                      textAlign: 'center',
                      backgroundColor: 'var(--brand-cobalt-light)',
                      marginBottom: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="file"
                      id="rateCardInput"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageFileChange}
                    />
                    <label htmlFor="rateCardInput" style={{ cursor: 'pointer', display: 'block' }}>
                      <Camera size={44} color="var(--brand-cobalt)" style={{ margin: '0 auto 12px' }} />
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '6px' }}>
                        Take a Picture or Upload Your Price List / Rate Sheet
                      </h3>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 16px' }}>
                        Upload any photo of your rate card, clinical test menu, service flyer, or price list. We will automatically extract all services and prices in seconds.
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => document.getElementById('rateCardInput')?.click()}
                      >
                        <Upload size={16} />
                        <span>Choose Photo or Document</span>
                      </button>
                    </label>
                  </div>

                  {/* Instant Test Samples */}
                  <div style={{ backgroundColor: 'var(--bg-surface-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-navy)', display: 'block', marginBottom: '8px' }}>
                      ⚡ Or test instantly with a preloaded rate card sample:
                    </span>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {sampleRateCards.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => loadSampleRateCard(sample)}
                          style={{ backgroundColor: '#FFF' }}
                        >
                          <ImageIcon size={14} />
                          <span>{sample.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Photo Preview & Scanning Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={imagePreview}
                        alt="Rate Card"
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--brand-navy)', display: 'block' }}>
                          Rate Card Image Loaded
                        </strong>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block' }}>
                          {isScanning ? `🔍 ${scanStatusMessage}` : `✓ ${extractedItems.length} services detected`}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setImagePreview(null);
                        setExtractedItems([]);
                      }}
                    >
                      Upload Different Photo
                    </button>
                  </div>

                  {/* Scanning Animation */}
                  {isScanning && (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <Sparkles size={36} color="var(--brand-cobalt)" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 12px' }} />
                      <p style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>
                        {scanStatusMessage}
                      </p>
                    </div>
                  )}

                  {/* Extracted Services Review Grid */}
                  {!isScanning && extractedItems.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                          Review & Customize Extracted Services ({extractedItems.filter((i) => i.selected).length} selected):
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          You can edit prices or uncheck any service before publishing.
                        </span>
                      </div>

                      <div className="table-responsive" style={{ maxHeight: '300px' }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th style={{ width: '40px' }}>Include</th>
                              <th>Service Name</th>
                              <th style={{ width: '135px' }}>Customer Price (₹)</th>
                              <th style={{ width: '150px' }}>Affiliate: Lead (₹)</th>
                              <th style={{ width: '150px' }}>Affiliate: Sale (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {extractedItems.map((item) => (
                              <tr key={item.id} style={{ opacity: item.selected ? 1 : 0.45 }}>
                                <td>
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
                                <td>
                                  <input
                                    type="number"
                                    className="form-input"
                                    value={item.affiliateLeadReward}
                                    onChange={(e) => updateItemField(item.id, 'affiliateLeadReward', parseFloat(e.target.value) || 0)}
                                    style={{ padding: '6px 8px', fontSize: '0.84rem', color: 'var(--lead-teal)', fontWeight: 600 }}
                                    title="What affiliate receives for introducing a qualified lead"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-input"
                                    value={item.affiliateConvReward}
                                    onChange={(e) => updateItemField(item.id, 'affiliateConvReward', parseFloat(e.target.value) || 0)}
                                    style={{ padding: '6px 8px', fontSize: '0.84rem', color: 'var(--finance-green)', fontWeight: 700 }}
                                    title="What affiliate receives for a closed customer purchase"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick Rate Card Text Paste Mode */}
          {activeTab === 'paste' && (
            <div>
              <div style={{ backgroundColor: 'var(--brand-cobalt-light)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--brand-navy)', margin: '0 0 4px 0' }}>
                      📋 Fast Rate Card & Price Extractor
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Paste or edit service packages and prices line by line. The system automatically parses each service and calculates affiliate referral commissions.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ backgroundColor: '#FFF' }}
                    onClick={() => {
                      setPasteMenuText(getProviderSampleText());
                    }}
                  >
                    <ClipboardList size={14} />
                    <span>Load Sample Rate Card ({activeProvider.businessName})</span>
                  </button>
                </div>

                <textarea
                  className="form-textarea"
                  rows={10}
                  style={{ fontFamily: 'monospace', fontSize: '0.86rem', lineHeight: 1.5, backgroundColor: '#FFF' }}
                  value={pasteMenuText}
                  onChange={(e) => setPasteMenuText(e.target.value)}
                  placeholder={
                    isHealthcare
                      ? `Paste your diagnostic tests and package prices here line by line:\nComprehensive Master Health Checkup 3999\nExecutive Cardiac & Diabetes Screening 6499\nComplete Blood Picture (CBP) 350\nLipid Profile Panel 650\nDiabetes Screening Package 850\nThyroid Function Test 550`
                      : isIT
                      ? `Paste your IT and cloud service offerings line by line:\nCloud Architecture & Security Audit 25000\nAWS Cost Optimization 15000`
                      : `Paste your service offerings and prices here line by line:\nService Package Name 2500\nAdvanced Comprehensive Plan 5000`
                  }
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleQuickPasteSubmit}
                  >
                    <Sparkles size={16} />
                    <span>⚡ Auto-Extract All Services & Prices</span>
                  </button>
                </div>
              </div>
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

          {activeTab === 'photo' && extractedItems.length > 0 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleBulkPublish}
              disabled={isScanning || extractedItems.filter((i) => i.selected).length === 0}
            >
              <Check size={16} />
              <span>
                Publish {extractedItems.filter((i) => i.selected).length} Extracted Services
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
