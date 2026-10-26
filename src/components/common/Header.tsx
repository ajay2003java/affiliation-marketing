import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentRole, currentUser, logout, activeNotification, clearNotification } = useApp();

  return (
    <>
      <header className="header-bar">
        <div className="header-inner">
          {/* Brand */}
          <div className="brand-section">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#000000',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}
            >
              <img
                src="/sbloom-logo.jpg"
                alt="sBLOOM"
                style={{ height: '26px', width: 'auto', display: 'block', objectFit: 'contain' }}
              />
            </div>
            <div className="brand-titles">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h1 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  sBLOOM
                </h1>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#D97706',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    border: '1px solid rgba(245, 158, 11, 0.25)'
                  }}
                >
                  by Ottobon
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Affiliate Partner Network
              </span>
            </div>
          </div>

          {/* User Profile, Sign Out & Demo Reset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="user-profile-badge">
              <div className="user-avatar">
                {currentUser.name.charAt(0)}
              </div>
              <div className="user-info-text">
                <span className="user-name">{currentUser.name}</span>
                <span className="user-role-label">{currentRole.toUpperCase()}</span>
              </div>
            </div>

            <button
              id="btn-header-signout"
              className="btn btn-outline btn-sm"
              onClick={() => {
                logout();
              }}
              title="Sign out of current account"
              style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '5px', borderColor: 'var(--border-strong)' }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {activeNotification && (
        <div
          style={{
            maxWidth: '1320px',
            margin: '8px auto -4px',
            padding: '0 16px',
            width: '100%'
          }}
        >
          <div className={`notice-box ${activeNotification.type}`} style={{ margin: 0, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} />
              <span>{activeNotification.message}</span>
            </div>
            <button
              onClick={clearNotification}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};
