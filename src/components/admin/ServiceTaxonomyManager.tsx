import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { ServiceCategory, Service } from '../../types';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  BookOpen,
  FolderPlus,
  Layers,
  X
} from 'lucide-react';

export const ServiceTaxonomyManager: React.FC = () => {
  const {
    categories,
    services,
    offerings,
    addCategory,
    updateCategory,
    deleteCategory,
    addService,
    updateService,
    deleteService
  } = useData();
  const { showNotification } = useApp();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || 'cat_health');
  const [searchTerm, setSearchTerm] = useState('');

  // Category Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('Activity');

  // Service Modal
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [srvName, setSrvName] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvSynonyms, setSrvSynonyms] = useState(''); // Comma-separated synonyms

  const activeCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];

  const filteredServices = services
    .filter((s) => s.categoryId === selectedCategoryId)
    .filter((s) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const matchName = s.canonicalName.toLowerCase().includes(q);
      const matchTerms = s.searchTerms.some((t) => t.toLowerCase().includes(q));
      return matchName || matchTerms;
    });

  // Handle Category submit
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: catName.trim(),
        description: catDesc.trim(),
        iconName: catIcon
      });
      showNotification(`Category "${catName}" updated!`, 'success');
    } else {
      const created = addCategory({
        name: catName.trim(),
        description: catDesc.trim(),
        iconName: catIcon,
        activeOfferingsCount: 0
      });
      setSelectedCategoryId(created.id);
      showNotification(`Category "${catName}" created!`, 'success');
    }

    setShowCategoryModal(false);
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
  };

  // Handle Service submit
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName.trim()) return;

    const parsedSynonyms = srvSynonyms
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingService) {
      updateService(editingService.id, {
        canonicalName: srvName.trim(),
        description: srvDesc.trim(),
        searchTerms: parsedSynonyms
      });
      showNotification(`Canonical service "${srvName}" updated!`, 'success');
    } else {
      addService({
        categoryId: selectedCategoryId,
        canonicalName: srvName.trim(),
        description: srvDesc.trim(),
        searchTerms: parsedSynonyms
      });
      showNotification(`Canonical service "${srvName}" added to catalog!`, 'success');
    }

    setShowServiceModal(false);
    setEditingService(null);
    setSrvName('');
    setSrvDesc('');
    setSrvSynonyms('');
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="page-title">Canonical Service Taxonomy & Synonyms</h2>
          <p className="page-subtitle">
            Admin catalog standard (PRD AD-02). Define universal categories, standard services, and colloquial search keywords/synonyms for affiliate discovery.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setEditingCategory(null);
              setCatName('');
              setCatDesc('');
              setCatIcon('Activity');
              setShowCategoryModal(true);
            }}
          >
            <FolderPlus size={15} />
            <span>+ New Category</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingService(null);
              setSrvName('');
              setSrvDesc('');
              setSrvSynonyms('');
              setShowServiceModal(true);
            }}
          >
            <Plus size={15} />
            <span>+ Canonical Service</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Categories Sidebar */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={16} color="var(--brand-cobalt)" />
            Catalog Categories ({categories.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {categories.map((cat) => {
              const offeringCount = offerings.filter((o) => o.categoryId === cat.id).length;
              const isSelected = cat.id === selectedCategoryId;
              return (
                <div
                  key={cat.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--brand-cobalt-light)' : 'transparent',
                    border: isSelected ? '1px solid var(--brand-cobalt)' : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'var(--transition)'
                  }}
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  <div>
                    <strong style={{ fontSize: '0.86rem', color: isSelected ? 'var(--brand-cobalt)' : 'var(--text-main)', display: 'block' }}>
                      {cat.name}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {offeringCount} provider offerings
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className="btn-icon"
                      style={{ padding: '4px', opacity: 0.7 }}
                      title="Edit Category"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCategory(cat);
                        setCatName(cat.name);
                        setCatDesc(cat.description);
                        setCatIcon(cat.iconName);
                        setShowCategoryModal(true);
                      }}
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Services & Synonym Manager for Selected Category */}
        <div>
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                  {activeCategory?.name}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  {activeCategory?.description}
                </p>
              </div>

              {/* Search within taxonomy */}
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '32px', height: '34px', fontSize: '0.82rem' }}
                  placeholder="Filter by keyword / synonym..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filteredServices.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed var(--border-medium)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No canonical services defined in this category.</p>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '10px' }}
                  onClick={() => {
                    setEditingService(null);
                    setSrvName('');
                    setSrvDesc('');
                    setSrvSynonyms('');
                    setShowServiceModal(true);
                  }}
                >
                  <Plus size={13} /> Add First Service
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredServices.map((srv) => (
                  <div
                    key={srv.id}
                    style={{
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      backgroundColor: 'var(--bg-surface-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ maxWidth: '80%' }}>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--brand-navy)', margin: '0 0 4px 0' }}>
                          {srv.canonicalName}
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
                          {srv.description}
                        </p>

                        {/* Search Synonyms Pill Bag */}
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Tag size={12} /> Searchable Synonyms & Aliases:
                          </span>
                          {srv.searchTerms.map((term, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: '0.74rem',
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border-light)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                color: 'var(--brand-navy)',
                                fontWeight: 500
                              }}
                            >
                              "{term}"
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          onClick={() => {
                            setEditingService(srv);
                            setSrvName(srv.canonicalName);
                            setSrvDesc(srv.description);
                            setSrvSynonyms(srv.searchTerms.join(', '));
                            setShowServiceModal(true);
                          }}
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.74rem', color: '#b91c1c' }}
                          onClick={() => {
                            if (window.confirm(`Delete canonical service "${srv.canonicalName}"?`)) {
                              deleteService(srv.id);
                              showNotification(`Deleted canonical service "${srv.canonicalName}".`, 'info');
                            }
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCategory ? 'Edit Service Category' : 'Create New Service Category'}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowCategoryModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveCategory}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Healthcare & Diagnostics"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Scope of services covered in this sector..."
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service & Synonyms Modal */}
      {showServiceModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">
                  {editingService ? 'Edit Canonical Service' : 'Add Canonical Service'}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Category: {activeCategory?.name}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowServiceModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveService}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Canonical Service Title <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Master Cardiac & Diabetes Screening"
                    value={srvName}
                    onChange={(e) => setSrvName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Standard Clinical / Service Description</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Define standardized service scope..."
                    value={srvDesc}
                    onChange={(e) => setSrvDesc(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Search Synonyms & Colloquial Keywords (PRD AD-02) <span className="required">*</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Enter comma-separated search terms, e.g.: ECG, echo, heart test, blood sugar, lipid profile, cardiac check"
                    value={srvSynonyms}
                    onChange={(e) => setSrvSynonyms(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Separate multiple aliases by comma. Affiliates typing any of these keywords will find matching provider offerings.
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowServiceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Canonical Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
