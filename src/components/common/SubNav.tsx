import React from 'react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import { MOCK_PROVIDERS } from '../../services/mockData';
import {
  Compass,
  Building,
  Send,
  Wallet,
  UserCheck,
  Users,
  LayoutDashboard,
  Tag,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  History,
  Building2
} from 'lucide-react';

export const SubNav: React.FC = () => {
  const { currentRole, activeTab, setActiveTab, activeProviderId, currentUser } = useApp();
  const { providers } = useData();

  const activeProvider =
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
    (currentRole === 'provider' ? MOCK_PROVIDERS[0] : undefined);

  return (
    <div className="role-subbar">
      <div className="role-subbar-inner">
        {/* Context Label */}
        <div className="role-context-info">
          <span className="role-tag-pill">
            {currentRole === 'affiliate' && 'AFFILIATE WORKSPACE'}
            {currentRole === 'provider' && 'CLIENT PROVIDER PORTAL'}
            {currentRole === 'admin' && 'ADMIN & OPERATIONS DESK'}
          </span>

          {currentRole === 'provider' && activeProvider && (
            <span style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
              {activeProvider.businessName} ({activeProvider.city})
            </span>
          )}
        </div>

        {/* Dynamic Role Navigation Tabs */}
        <nav className="sub-nav-tabs">
          {currentRole === 'affiliate' && (
            <>
              <button
                id="tab-affiliate-dashboard"
                className={`sub-nav-tab ${(activeTab === 'affiliate_dashboard' || activeTab === 'affiliate_home') ? 'active' : ''}`}
                onClick={() => setActiveTab('affiliate_dashboard')}
              >
                <Send size={15} />
                <span>Submit Referral</span>
              </button>
              <button
                id="tab-my-referrals"
                className={`sub-nav-tab ${activeTab === 'my_referrals' ? 'active' : ''}`}
                onClick={() => setActiveTab('my_referrals')}
              >
                <Users size={15} />
                <span>Referrals Management</span>
              </button>
              <button
                id="tab-my-commissions"
                className={`sub-nav-tab ${activeTab === 'my_commissions' ? 'active' : ''}`}
                onClick={() => setActiveTab('my_commissions')}
              >
                <Wallet size={15} />
                <span>Payments</span>
              </button>
              <button
                id="tab-browse-providers"
                className={`sub-nav-tab ${activeTab === 'browse_providers' ? 'active' : ''}`}
                onClick={() => setActiveTab('browse_providers')}
              >
                <Building size={15} />
                <span>Client Partners</span>
              </button>
              <button
                id="tab-affiliate-profile"
                className={`sub-nav-tab ${activeTab === 'affiliate_profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('affiliate_profile')}
              >
                <UserCheck size={15} />
                <span>Profile & Settings</span>
              </button>
            </>
          )}

          {currentRole === 'provider' && (
            <>
              <button
                id="tab-provider-home"
                className={`sub-nav-tab ${activeTab === 'provider_home' ? 'active' : ''}`}
                onClick={() => setActiveTab('provider_home')}
              >
                <Users size={15} />
                <span>Leads & Referral Pipeline</span>
              </button>
              <button
                id="tab-provider-offerings"
                className={`sub-nav-tab ${activeTab === 'provider_offerings' ? 'active' : ''}`}
                onClick={() => setActiveTab('provider_offerings')}
              >
                <Tag size={15} />
                <span>My Services & Rate Card</span>
              </button>
              <button
                id="tab-provider-agreement"
                className={`sub-nav-tab ${activeTab === 'provider_agreement' ? 'active' : ''}`}
                onClick={() => setActiveTab('provider_agreement')}
              >
                <FileText size={15} />
                <span>Partnership Agreement</span>
              </button>
              <button
                id="tab-provider-profile"
                className={`sub-nav-tab ${activeTab === 'provider_profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('provider_profile')}
              >
                <UserCheck size={15} />
                <span>Business Profile & Password</span>
              </button>
            </>
          )}

          {currentRole === 'admin' && (
            <>
              <button
                id="tab-admin-clients"
                className={`sub-nav-tab ${(activeTab === 'admin_clients' || activeTab === 'admin_dashboard') ? 'active' : ''}`}
                onClick={() => setActiveTab('admin_clients')}
              >
                <Building2 size={15} />
                <span>Client Receivables</span>
              </button>
              <button
                id="tab-admin-offerings"
                className={`sub-nav-tab ${activeTab === 'admin_offerings' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin_offerings')}
              >
                <Tag size={15} />
                <span>Offering Approvals</span>
              </button>
              <button
                id="tab-admin-verification"
                className={`sub-nav-tab ${activeTab === 'admin_verification' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin_verification')}
              >
                <ShieldCheck size={15} />
                <span>Outcome Audit Desk</span>
              </button>
              <button
                id="tab-admin-taxonomy"
                className={`sub-nav-tab ${activeTab === 'admin_taxonomy' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin_taxonomy')}
              >
                <Compass size={15} />
                <span>Service Taxonomy</span>
              </button>
              <button
                id="tab-admin-referrals"
                className={`sub-nav-tab ${activeTab === 'admin_referrals' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin_referrals')}
              >
                <Users size={15} />
                <span>All Referrals</span>
              </button>
              <button
                id="tab-admin-payouts"
                className={`sub-nav-tab ${activeTab === 'admin_payouts' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin_payouts')}
              >
                <Wallet size={15} />
                <span>Payouts & Ledger</span>
              </button>
              <button
                id="tab-admin-audit"
                className={`sub-nav-tab ${activeTab === 'admin_audit' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin_audit')}
              >
                <History size={15} />
                <span>Audit Trail</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </div>
  );
};
