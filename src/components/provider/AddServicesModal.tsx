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
  Check
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

  // Active Tab: 'photo' (Snap/Upload Rate Card) vs 'manual' (Enter One by One)
  const [activeTab, setActiveTab] = useState<'photo' | 'manual'>('photo');

  // Photo Mode State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [rateCardStoragePath, setRateCardStoragePath] = useState<string | null>(null);
  const [rateCardStorageUrl, setRateCardStorageUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);

  // Manual Mode State (Provider decides price and affiliate reward)
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState(categories[0]?.id || 'cat_health');
  const [manualDesc, setManualDesc] = useState('');
  const [manualPrice, setManualPrice] = useState('3999');
  const [manualArea, setManualArea] = useState(activeProvider.city || 'Hyderabad');
  const [manualEnableLead, setManualEnableLead] = useState(true);
  const [manualAffiliateLeadReward, setManualAffiliateLeadReward] = useState('350');
  const [manualEnableConv, setManualEnableConv] = useState(true);
  const [manualAffiliateConvReward, setManualAffiliateConvReward] = useState('900');

  // Demo samples for quick testing
  const sampleRateCards = [
    {
      name: 'Diagnostic Clinical Rate Card (8 Tests)',
      image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80',
      items: [
        { id: '1', selected: true, title: 'Comprehensive Master Health Checkup', category: 'cat_health', price: 3999, affiliateLeadReward: 350, affiliateConvReward: 900, description: '85+ blood and clinical diagnostic parameters with physician tele-consult.' },
        { id: '2', selected: true, title: 'Cardiac Wellness & Lipid Risk Panel', category: 'cat_health', price: 2499, affiliateLeadReward: 250, affiliateConvReward: 600, description: 'ECG, Lipid Profile, Troponin, and specialized cardiac risk evaluation.' },
        { id: '3', selected: true, title: 'Diabetes Management Screening Suite', category: 'cat_health', price: 1899, affiliateLeadReward: 200, affiliateConvReward: 450, description: 'HbA1c, fasting glucose, microalbuminuria, and kidney function tests.' },
        { id: '4', selected: true, title: 'Executive Whole Body MRI / Imaging', category: 'cat_health', price: 8500, affiliateLeadReward: 600, affiliateConvReward: 1600, description: 'High-definition digital scanning with radiologist verified reporting.' }
      ]
    },
    {
      name: 'Corporate & Consulting Rate Sheet',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
      items: [
        { id: '1', selected: true, title: 'Annual Corporate Employee Health Camp', category: 'cat_corp', price: 35000, affiliateLeadReward: 1000, affiliateConvReward: 4800, description: 'On-site mobile health screening camp for IT and corporate workplaces.' },
        { id: '2', selected: true, title: 'Retained Executive Search & Recruitment', category: 'cat_corp', price: 75000, affiliateLeadReward: 1800, affiliateConvReward: 10500, description: 'Confidential executive search for VP and Director level corporate roles.' },
        { id: '3', selected: true, title: 'Corporate Compliance & Legal Audit', category: 'cat_corp', price: 25000, affiliateLeadReward: 800, affiliateConvReward: 3500, description: 'End-to-end statutory and employment compliance verification.' }
      ]
    }
  ];

  // Handle image upload from user's device/camera
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Perform real storage upload to Supabase bucket 'provider-rate-cards'
      const uploadRes = await uploadRateCardImage(file, activeProvider.id);
      if (uploadRes.success && uploadRes.filePath) {
        setRateCardStoragePath(uploadRes.filePath);
        setRateCardStorageUrl(uploadRes.fileUrl || uploadRes.filePath);
        showNotification(`Rate card image uploaded to Supabase storage ("provider-rate-cards/${uploadRes.filePath}")!`, 'success');
      }

      simulateOcrScan(file.name);
    }
  };

  const loadSampleRateCard = (sample: typeof sampleRateCards[0]) => {
    setImagePreview(sample.image);
    setIsScanning(true);
    setTimeout(() => {
      setExtractedItems(sample.items);
      setIsScanning(false);
      showNotification(`Extracted ${sample.items.length} services from rate card!`, 'success');
    }, 900);
  };

  const simulateOcrScan = (fileName: string) => {
    setIsScanning(true);
    setTimeout(() => {
      // Intelligently parse items based on provider industry or image
      const generatedItems: ExtractedItem[] = [
        {
          id: 'gen_1',
          selected: true,
          title: `${activeProvider.businessName} - Standard Package`,
          category: categories[0]?.id || 'cat_health',
          price: 4500,
          affiliateLeadReward: 400,
          affiliateConvReward: 1000,
          description: 'Standard comprehensive offering extracted from price list.'
        },
        {
          id: 'gen_2',
          selected: true,
          title: `${activeProvider.businessName} - Premium / Executive Tier`,
          category: categories[0]?.id || 'cat_health',
          price: 9900,
          affiliateLeadReward: 800,
          affiliateConvReward: 2000,
          description: 'Specialized diagnostic package extracted from rate sheet.'
        },
        {
          id: 'gen_3',
          selected: true,
          title: `${activeProvider.businessName} - Express Consultation / Scan`,
          category: categories[0]?.id || 'cat_health',
          price: 1999,
          affiliateLeadReward: 200,
          affiliateConvReward: 500,
          description: 'Direct priority booking service detected from photo.'
        }
      ];

      setExtractedItems(generatedItems);
      setIsScanning(false);
      showNotification(`Successfully extracted 3 services from "${fileName}"!`, 'success');
    }, 1200);
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

      // Synchronize directly with Supabase DB
      syncOfferingToSupabase(created);
    });

    showNotification(`Published ${selected.length} services with strict 50% affiliate referral split! Synced to Supabase DB.`, 'success');
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

    // Synchronize directly with Supabase DB
    syncOfferingToSupabase(created);

    showNotification(`Added service "${manualTitle}"! Service Price: ₹${manualPrice}, Affiliate Reward: ₹${affConv || affLead} (Synced to Supabase DB).`, 'success');
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

        {/* Mode Selector Tabs (Photo vs Manual) */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-surface-subtle)', padding: '6px 20px 0', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('photo')}
            style={{
              padding: '10px 18px',
              fontSize: '0.88rem',
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: activeTab === 'photo' ? 'var(--brand-cobalt)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'photo' ? '3px solid var(--brand-cobalt)' : '3px solid transparent'
            }}
          >
            <Camera size={18} />
            <span>📸 Snap / Upload Price List Photo (Fast)</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            style={{
              padding: '10px 18px',
              fontSize: '0.88rem',
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: activeTab === 'manual' ? 'var(--brand-cobalt)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'manual' ? '3px solid var(--brand-cobalt)' : '3px solid transparent'
            }}
          >
            <Edit2 size={16} />
            <span>✍️ Type In Service Manually</span>
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
                          {isScanning ? '🔍 AI OCR Scanning & Extracting prices...' : `✓ ${extractedItems.length} services detected`}
                        </span>
                        {rateCardStoragePath && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--finance-green)', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                            ✓ Stored in Supabase Bucket: <code>provider-rate-cards/{rateCardStoragePath}</code>
                          </span>
                        )}
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
                        Detecting service items, prices (₹), and calculating suggested referral fees...
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
