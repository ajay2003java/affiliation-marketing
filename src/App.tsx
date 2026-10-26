import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DataProvider } from './context/DataContext';
import { Header } from './components/common/Header';
import { SubNav } from './components/common/SubNav';

// Affiliate views
import { AffiliateDashboard } from './components/affiliate/AffiliateDashboard';
import { BrowseServices } from './components/affiliate/BrowseServices';
import { BrowseProviders } from './components/affiliate/BrowseProviders';
import { ReferralsList } from './components/affiliate/ReferralsList';
import { CommissionView } from './components/affiliate/CommissionView';
import { AffiliateProfile } from './components/affiliate/AffiliateProfile';
import { MyContacts } from './components/affiliate/MyContacts';

// Provider views
import { ProviderHome } from './components/provider/ProviderHome';
import { OfferingManager } from './components/provider/OfferingManager';
import { AgreementView } from './components/provider/AgreementView';
import { ProviderProfile } from './components/provider/ProviderProfile';

// Admin views (Our Company: Full Governance, Clients, Taxonomy & Ledger)
import { AdminClientManager } from './components/admin/AdminClientManager';
import { AdminReferralsView } from './components/admin/AdminReferralsView';
import { CommissionLedgerView } from './components/admin/CommissionLedgerView';
import { OfferingApproval } from './components/admin/OfferingApproval';
import { OutcomeVerification } from './components/admin/OutcomeVerification';
import { ServiceTaxonomyManager } from './components/admin/ServiceTaxonomyManager';
import { AuditTrailView } from './components/admin/AuditTrailView';

// Public Landing Page & Unified Auth Gateway
import { LandingPage } from './components/landing/LandingPage';

const MainRouter: React.FC = () => {
  const { currentRole, activeTab } = useApp();

  return (
    <main className="main-content">
      {/* Affiliate Routes */}
      {currentRole === 'affiliate' && (
        <>
          {(activeTab === 'affiliate_dashboard' || activeTab === 'affiliate_home') && <AffiliateDashboard />}
          {activeTab === 'browse_services' && <BrowseServices />}
          {activeTab === 'browse_providers' && <BrowseProviders />}
          {activeTab === 'my_referrals' && <ReferralsList />}
          {activeTab === 'my_commissions' && <CommissionView />}
          {activeTab === 'my_contacts' && <MyContacts />}
          {activeTab === 'affiliate_profile' && <AffiliateProfile />}
        </>
      )}

      {/* Provider Routes */}
      {currentRole === 'provider' && (
        <>
          {activeTab === 'provider_home' && <ProviderHome />}
          {activeTab === 'provider_offerings' && <OfferingManager />}
          {activeTab === 'provider_agreement' && <AgreementView />}
          {activeTab === 'provider_profile' && <ProviderProfile />}
        </>
      )}

      {/* Admin Routes: Our Company Command & Full Governance */}
      {currentRole === 'admin' && (
        <>
          {(activeTab === 'admin_clients' || activeTab === 'admin_dashboard') && <AdminClientManager />}
          {activeTab === 'admin_offerings' && <OfferingApproval />}
          {activeTab === 'admin_verification' && <OutcomeVerification />}
          {activeTab === 'admin_taxonomy' && <ServiceTaxonomyManager />}
          {activeTab === 'admin_referrals' && <AdminReferralsView />}
          {activeTab === 'admin_payouts' && <CommissionLedgerView />}
          {activeTab === 'admin_audit' && <AuditTrailView />}
        </>
      )}
    </main>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="app-container">
      <Header />
      <SubNav />
      <MainRouter />

      <footer
        style={{
          borderTop: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-surface)',
          padding: '24px 16px',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span>
            <strong>Ottobon Partner Network</strong> • PRD v0.2 Specification & Commercial MoU
          </span>
          <span>
            Multi-Tenant Isolation: Healthcare, Cloud & IT, HR Staffing, Corporate Services & All Partner Businesses
          </span>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <DataProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </DataProvider>
  );
}

export default App;
