import React from 'react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
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
  const { currentRole, activeTab, setActiveTab, activeProviderId } = useApp();
  const { providers } = useData();

  const activeProvider = providers.find((p) => p.id === activeProviderId) || providers[0];

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

          {currentRole === 'provider' && (
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
                <LayoutDashboard size={15} />
                <span>Dashboard & Share Hub</span>
              </button>
              <button
                id="tab-browse-services"
                className={`sub-nav-tab ${activeTab === 'browse_services' ? 'active' : ''}`}
                onClick={() => setActiveTab('browse_services')}
              >
                <Compass size={15} />
                <span>Explore Services & Rewards</span>
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
                id="tab-my-referrals"
                className={`sub-nav-tab ${activeTab === 'my_referrals' ? 'active' : ''}`}
                onClick={() => setActiveTab('my_referrals')}
              >
                <Send size={15} />
                <span>My Referrals Track</span>
              </button>
              <button
                id="tab-my-commissions"
                className={`sub-nav-tab ${activeTab === 'my_commissions' ? 'active' : ''}`}
                onClick={() => setActiveTab('my_commissions')}
              >
                <Wallet size={15} />
                <span>My Commissions & Ledger</span>
              </button>
              <button
                id="tab-my-contacts"
                className={`sub-nav-tab ${activeTab === 'my_contacts' ? 'active' : ''}`}
                onClick={() => setActiveTab('my_contacts')}
              >
                <Users size={15} />
                <span>My Address Book</span>
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
                className={`sub-nav-tab active`}
                onClick={() => setActiveTab('provider_home')}
              >
                <Users size={15} />
                <span>Leads & Services Overview</span>
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
