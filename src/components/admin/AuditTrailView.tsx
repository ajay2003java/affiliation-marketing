import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { History, Shield, Filter } from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useData();
  const [filterRole, setFilterRole] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterRole !== 'all' && log.actorRole !== filterRole) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">System Audit Log & State Integrity</h2>
        <p className="page-subtitle">
          Immutable chronological audit log capturing sensitive operations, role transitions, commercial terms changes, and financial triggers.
        </p>
      </div>

      <div className="filter-bar">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={15} /> Filter Actor:
          </span>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Actor Roles</option>
            <option value="admin">Admin Operations Only</option>
            <option value="provider">Provider Actions Only</option>
            <option value="affiliate">Affiliate Actions Only</option>
          </select>
        </div>

        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredLogs.length}</strong> recorded audit events
        </span>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Operation / Action</th>
              <th>Entity</th>
              <th>Audit Narrative & Context</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>
                  <span className="num-tabular" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {new Date(log.timestamp).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </td>

                <td>
                  <strong style={{ fontSize: '0.86rem', color: 'var(--brand-navy)', display: 'block' }}>
                    {log.actorName}
                  </strong>
                  <span
                    className={`badge ${
                      log.actorRole === 'admin'
                        ? 'badge-neutral'
                        : log.actorRole === 'provider'
                        ? 'badge-lead-gen'
                        : 'badge-conversion'
                    }`}
                    style={{ fontSize: '0.65rem', marginTop: '2px' }}
                  >
                    {log.actorRole.toUpperCase()}
                  </span>
                </td>

                <td>
                  <code style={{ fontSize: '0.78rem', color: 'var(--brand-navy)', fontWeight: 600 }}>
                    {log.action}
                  </code>
                </td>

                <td>
                  <span style={{ textTransform: 'capitalize', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {log.entityType} ({log.entityId})
                  </span>
                </td>

                <td>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
                    {log.details}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
