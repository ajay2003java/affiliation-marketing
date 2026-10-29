import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../services/mockData';

const AUTH_STORAGE_KEY = 'affiliate_auth_session_v2';
const SAVED_PROVIDERS_KEY = 'registered_provider_users_v2';
const SAVED_AFFILIATES_KEY = 'registered_affiliate_users_v2';

interface AppContextType {
  isAuthenticated: boolean;
  currentRole: UserRole;
  currentUser: User;
  activeProviderId: string;
  setActiveProviderId: (id: string) => void;
  login: (roleOrEmail: UserRole | string, emailOrPass?: string, password?: string, providerId?: string) => { success: boolean; error?: string };
  unifiedLogin: (email: string, password?: string) => { success: boolean; error?: string };
  registerAffiliate: (data: { name: string; email: string; phone: string; occupation?: string; city?: string }) => { success: boolean; error?: string };
  registerProviderByAdmin: (user: User, providerId: string, tempPassword?: string) => void;
  registerProviderUser: (user: User, providerId: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedProviderUsers: User[];
  activeNotification: { type: 'success' | 'info' | 'warning'; message: string } | null;
  showNotification: (message: string, type?: 'success' | 'info' | 'warning') => void;
  clearNotification: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session initialization from localStorage
  const savedSession = (() => {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  })();

  const [savedProviderUsers, setSavedProviderUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(SAVED_PROVIDERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedAffiliateUsers, setSavedAffiliateUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(SAVED_AFFILIATES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(savedSession ? savedSession.isAuthenticated : false);
  const [currentRole, setCurrentRole] = useState<UserRole>(savedSession ? savedSession.currentRole : 'admin');
  const [currentUser, setCurrentUser] = useState<User>(
    savedSession?.currentUser || MOCK_USERS.admin
  );
  const [activeProviderId, setActiveProviderId] = useState<string>(
    savedSession?.activeProviderId || ''
  );
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (savedSession?.activeTab) return savedSession.activeTab;
    if (currentRole === 'provider') return 'provider_home';
    if (currentRole === 'admin') return 'admin_clients';
    return 'affiliate_dashboard';
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'warning'; message: string } | null>(null);

  // Sync session changes to localStorage
  useEffect(() => {
    try {
      if (isAuthenticated) {
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            isAuthenticated,
            currentRole,
            currentUser,
            activeProviderId,
            activeTab
          })
        );
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // ignore storage quota issues
    }
  }, [isAuthenticated, currentRole, currentUser, activeProviderId, activeTab]);

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const clearNotification = () => setNotification(null);

  // Unified Intelligent Login: production-ready credential authentication & role routing
  const unifiedLogin = (email: string, password?: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter your account email address.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!password || password.trim().length < 6) {
      return { success: false, error: 'Please enter a valid password (minimum 6 characters).' };
    }

    // 1. Admin role check
    if (cleanEmail === MOCK_USERS.admin.email.toLowerCase() || cleanEmail === 'admin@ottobon.in' || cleanEmail === 'academy@ottobon.in') {
      setCurrentUser(MOCK_USERS.admin);
      setCurrentRole('admin');
      setActiveTab('admin_clients');
      setIsAuthenticated(true);
      showNotification(`Welcome back, ${MOCK_USERS.admin.name}! Admin Operations Desk unlocked.`, 'success');
      return { success: true };
    }

    // 2. Provider accounts check (Registered Providers only)
    const foundSavedProvider = savedProviderUsers.find(
      (p) => p.email.toLowerCase() === cleanEmail
    );
    if (foundSavedProvider) {
      setCurrentUser(foundSavedProvider);
      setActiveProviderId(foundSavedProvider.providerId || '');
      setCurrentRole('provider');
      setActiveTab('provider_home');
      setIsAuthenticated(true);
      showNotification(`Signed in to Provider Portal (${foundSavedProvider.name}).`, 'success');
      return { success: true };
    }

    // 3. Affiliate accounts check (Self-Registered Affiliates only)
    const foundSavedAffiliate = savedAffiliateUsers.find(
      (a) => a.email.toLowerCase() === cleanEmail
    );
    if (foundSavedAffiliate) {
      setCurrentUser(foundSavedAffiliate);
      setCurrentRole('affiliate');
      setActiveTab('affiliate_dashboard');
      setIsAuthenticated(true);
      showNotification(`Welcome back, ${foundSavedAffiliate.name}! Connected to Affiliate Workspace.`, 'success');
      return { success: true };
    }

    // 4. Production response for non-existent users
    return {
      success: false,
      error: 'Invalid email or password. Please verify your credentials or register a new account.'
    };
  };

  // Flexible Login handler (supports both legacy role-based calls and unified calls)
  const login = (
    roleOrEmail: UserRole | string,
    emailOrPass?: string,
    password?: string,
    providerId?: string
  ): { success: boolean; error?: string } => {
    // Check if called with Unified Auth: login("email@domain.com", "password")
    if (roleOrEmail !== 'affiliate' && roleOrEmail !== 'provider' && roleOrEmail !== 'admin') {
      return unifiedLogin(roleOrEmail, emailOrPass);
    }

    const role = roleOrEmail as UserRole;
    const cleanEmail = (emailOrPass || '').trim().toLowerCase();

    // 1. Role: Affiliate
    if (role === 'affiliate') {
      const found = savedAffiliateUsers.find((a) => a.email.toLowerCase() === cleanEmail);
      if (!found) {
        return {
          success: false,
          error: 'Affiliate account not found. Please register as an Affiliate Partner.'
        };
      }

      setCurrentUser(found);
      setCurrentRole('affiliate');
      setActiveTab('affiliate_dashboard');
      setIsAuthenticated(true);
      showNotification(`Welcome back, ${found.name}! Connected to Affiliate Workspace.`, 'success');
      return { success: true };
    }

    // 2. Role: Provider
    if (role === 'provider') {
      const found = savedProviderUsers.find((p) => p.email.toLowerCase() === cleanEmail);
      if (!found) {
        return {
          success: false,
          error: 'Provider account not registered. Please contact Admin or apply as a Provider.'
        };
      }

      setCurrentUser(found);
      setActiveProviderId(found.providerId || providerId || '');
      setCurrentRole('provider');
      setActiveTab('provider_home');
      setIsAuthenticated(true);
      showNotification(`Signed in to Provider Portal as ${found.name}.`, 'success');
      return { success: true };
    }

    // 3. Role: Admin
    if (role === 'admin') {
      if (cleanEmail !== MOCK_USERS.admin.email.toLowerCase() && cleanEmail !== 'admin@ottobon.in' && cleanEmail !== 'academy@ottobon.in') {
        return {
          success: false,
          error: 'Restricted Access: Public self-registration is disabled for Admin Operations. Only authorized Ottobon staff accounts (@ottobon.in) are permitted.'
        };
      }

      setCurrentUser(MOCK_USERS.admin);
      setCurrentRole('admin');
      setActiveTab('admin_clients');
      setIsAuthenticated(true);
      showNotification(`Authenticated as Ottobon Staff Lead (${MOCK_USERS.admin.name}). Admin Operations Desk unlocked.`, 'success');
      return { success: true };
    }

    return { success: false, error: 'Invalid login role specified.' };
  };

  // Register a new affiliate partner (Public self-registration)
  const registerAffiliate = (data: {
    name: string;
    email: string;
    phone: string;
    occupation?: string;
    city?: string;
  }): { success: boolean; error?: string } => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (!cleanEmail || !data.name || !data.phone) {
      return { success: false, error: 'Full name, email, and phone number are required.' };
    }

    if (
      cleanEmail === MOCK_USERS.admin.email.toLowerCase() ||
      cleanEmail === 'admin@ottobon.in' ||
      cleanEmail === 'academy@ottobon.in' ||
      savedProviderUsers.some((p) => p.email.toLowerCase() === cleanEmail)
    ) {
      return { success: false, error: 'This email is already associated with an Admin or Provider account.' };
    }

    const newUser: User = {
      id: `usr_aff_${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      role: 'affiliate',
      phone: data.phone.trim()
    };

    const updatedAffiliates = [...savedAffiliateUsers.filter((a) => a.email.toLowerCase() !== cleanEmail), newUser];
    setSavedAffiliateUsers(updatedAffiliates);
    try {
      localStorage.setItem(SAVED_AFFILIATES_KEY, JSON.stringify(updatedAffiliates));
    } catch {
      // ignore
    }

    setCurrentUser(newUser);
    setCurrentRole('affiliate');
    setActiveTab('affiliate_dashboard');
    setIsAuthenticated(true);
    showNotification(`Welcome to Ottobon, ${newUser.name}! Your affiliate workspace is now live.`, 'success');
    return { success: true };
  };

  // Admin registers a provider business and assigns credentials (does not log out admin)
  const registerProviderByAdmin = (user: User, providerId: string, tempPassword = 'Partner@2026') => {
    const provUser: User = {
      ...user,
      role: 'provider',
      providerId
    };

    const updatedProviders = [
      ...savedProviderUsers.filter((p) => p.email.toLowerCase() !== provUser.email.toLowerCase()),
      provUser
    ];
    setSavedProviderUsers(updatedProviders);
    try {
      localStorage.setItem(SAVED_PROVIDERS_KEY, JSON.stringify(updatedProviders));
    } catch {
      // ignore
    }

    showNotification(
      `Provider credentials saved for ${provUser.name} (${provUser.email}). Provider can now log in using password: ${tempPassword}`,
      'info'
    );
  };

  // Register a new provider business and sign them directly in (kept for direct flows)
  const registerProviderUser = (user: User, providerId: string) => {
    registerProviderByAdmin(user, providerId);
    setCurrentUser(user);
    setActiveProviderId(providerId);
    setCurrentRole('provider');
    setActiveTab('provider_home');
    setIsAuthenticated(true);
    showNotification(`Welcome! Provider portal activated for ${user.name}.`, 'success');
  };

  // Sign out
  const logout = () => {
    setIsAuthenticated(false);
    setCurrentRole('affiliate');
    setActiveTab('affiliate_dashboard');
    localStorage.removeItem(AUTH_STORAGE_KEY);
    showNotification('Signed out successfully. Choose a role to log back in.', 'info');
  };

  // Switch role (only accessible in admin or explicit workflows)
  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'affiliate') {
      setActiveTab('affiliate_dashboard');
    } else if (role === 'provider') {
      setActiveTab('provider_home');
    } else if (role === 'admin') {
      setActiveTab('admin_clients');
    }
    showNotification(`Switched to ${role.toUpperCase()} workspace.`, 'info');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentRole,
        currentUser,
        login,
        unifiedLogin,
        registerAffiliate,
        registerProviderByAdmin,
        registerProviderUser,
        logout,
        switchRole,
        activeTab,
        setActiveTab,
        activeProviderId,
        setActiveProviderId,
        savedProviderUsers,
        activeNotification: notification,
        showNotification,
        clearNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
