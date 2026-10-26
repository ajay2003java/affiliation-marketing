import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Filter, Users, Building, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const AdminReferralsView: React.FC = () => {
  const { referrals, providers, offerings, commissionLedger } = useData();

  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = referrals.filter((ref) => {
    if (filterClient !== 'all' && ref.providerId !== filterClient) return false;
    if (filterStatus === 'qualified' && ref.leadStatus !== 'qualified') return false;
    if (filterStatus === 'converted' && ref.conversionStatus !== 'converted') return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">All Customer Referrals Delivered to Clients</h2>
        <p className="page-subtitle">
          Complete log of prospective clients introduced by affiliates to each client business, along with verified delivery status and fee billing.
        </p>
      </div>

      <div className="filter-bar">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={15} /> Filter Client:
          </span>

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
          >
            <option value="all">All Client Businesses ({providers.length})</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>{p.businessName}</option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="qualified">Qualified Leads Only</option>
            <option value="converted">Converted Sales Only</option>
          </select>
        </div>

        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filtered.length}</strong> delivered referrals
        </span>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Referral Code</th>
              <th>Customer Information</th>
              <th>Client Business (Recipient)</th>
              <th>Service Offering</th>
              <th>Delivery Milestone</th>
              <th>Fee Client Must Pay Us</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ref) => {
              const provider = providers.find((p) => p.id === ref.providerId);
              const offering = offerings.find((o) => o.id === ref.offeringId);
              const comm = commissionLedger.find((c) => c.referralId === ref.id);

              const feeOwed = comm
                ? comm.providerFeeSnapshot
                : ref.earningModel === 'lead_generation' ? 500 : 1500;

              return (
                <tr key={ref.id}>
                  <td>
                    <strong style={{ color: 'var(--brand-navy)' }}>{ref.referralCode}</strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>
                      {new Date(ref.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </td>

                  <td>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'block' }}>
                      {ref.customerName}
                    </strong>
                    <span style={{ fontSize: '0.76rem', color: 'var(--brand-cobalt)', fontFamily: 'monospace' }}>
                      📞 {ref.clientPhoneMasked || ref.customerPhone} ({ref.customerCity})
                    </span>
                  </td>

                  <td>
                    <strong style={{ color: 'var(--brand-navy)', display: 'block' }}>
                      {provider?.businessName}
                    </strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      📍 {provider?.city}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontWeight: 600 }}>{offering?.title || 'Service Offering'}</span>
                  </td>

                  <td>
                    {ref.earningModel === 'lead_generation' ? (
                      <div>
                        {ref.leadStatus === 'qualified' ? (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} /> Qualified Lead
                          </span>
                        ) : (
                          <span className="badge badge-pending">
                            <Clock size={12} /> Lead In Review
                          </span>
                        )}
                      </div>
                    ) : (
                      <div>
                        {ref.conversionStatus === 'converted' ? (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} /> Converted Sale
                          </span>
                        ) : (
                          <span className="badge badge-pending">
                            <Clock size={12} /> Follow-up Active
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td>
                    <strong className="num-tabular" style={{ fontSize: '1rem', color: 'var(--accent-coral)' }}>
                      ₹{feeOwed.toLocaleString('en-IN')}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      {comm ? 'Payable under MoU' : 'Standard schedule'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
