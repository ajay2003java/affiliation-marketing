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
  unifiedLogin: (emailOrPhone: string, password?: string) => { success: boolean; error?: string };
  loginAsProvider: (prov: { id: string; businessName: string; contactPerson?: string; email?: string; phone?: string }) => void;
  registerAffiliate: (data: { name: string; email: string; phone: string; occupation?: string; city?: string }) => { success: boolean; error?: string };
  registerProviderByAdmin: (user: User, providerId: string, tempPassword?: string) => void;
  registerProviderUser: (user: User, providerId: string) => void;
  changeUserPassword: (newPassword: string) => { success: boolean; error?: string };
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
  // Session initialization from localStorage with self-healing
  const savedSession = (() => {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      // Auto-heal stale sessions where role is provider but user was saved as Admin (Bhanu Bonu)
      if (
        parsed?.currentRole === 'provider' &&
        (parsed?.currentUser?.name?.toLowerCase().includes('bhanu') || parsed?.currentUser?.role === 'admin')
      ) {
        parsed.currentUser = {
          id: 'usr_prov_dhanvika',
          name: 'Dhanvika Diagnostics (Kumar Chenagalla)',
          email: 'dhanvikadiagnostics@gmail.com',
          role: 'provider',
          phone: '+91 8885282637',
          providerId: parsed.activeProviderId || '44d57460-17b7-48f4-bedd-5ef8dc84078b'
        };
        if (!parsed.activeProviderId) {
          parsed.activeProviderId = '44d57460-17b7-48f4-bedd-5ef8dc84078b';
        }
      }
      return parsed;
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
  const [currentRole, setCurrentRole] = useState<UserRole>(savedSession ? savedSession.currentRole : 'affiliate');
  const [currentUser, setCurrentUser] = useState<User>(
    savedSession?.currentUser || {
      id: 'usr_guest',
      name: 'Guest User',
      email: '',
      role: 'affiliate',
      phone: ''
    }
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
  const unifiedLogin = (emailOrPhone: string, password?: string): { success: boolean; error?: string } => {
    const rawInput = (emailOrPhone || '').trim();
    const cleanEmail = rawInput.toLowerCase();
    const cleanDigits = rawInput.replace(/\D/g, '');
    const isPhone = cleanDigits.length >= 10 && !cleanEmail.includes('@');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!rawInput) {
      return { success: false, error: 'Please enter your registered email address or mobile number.' };
    }

    if (!isPhone && !emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address or 10-digit mobile number.' };
    }

    const trimmedPassword = (password || '').trim();
    if (!trimmedPassword || trimmedPassword.length < 6) {
      return { success: false, error: 'Please enter a valid password (minimum 6 characters).' };
    }

    // 1. Admin role check
    if (!isPhone && (cleanEmail === MOCK_USERS.admin.email.toLowerCase() || cleanEmail === 'admin@ottobon.in' || cleanEmail === 'academy@ottobon.in')) {
      if (trimmedPassword !== 'Ottobon@Admin2026' && trimmedPassword !== 'Partner@2026' && trimmedPassword !== 'Admin@2026') {
        return { success: false, error: 'Invalid admin credentials. Please enter the correct password.' };
      }
      setCurrentUser(MOCK_USERS.admin);
      setCurrentRole('admin');
      setActiveTab('admin_clients');
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/admin');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      showNotification(`Welcome back, ${MOCK_USERS.admin.name}! Admin Operations Desk unlocked.`, 'success');
      return { success: true };
    }

    // 2. Provider accounts check (Registered Providers only)
    let foundSavedProvider = savedProviderUsers.find(
      (p) =>
        (p.email && p.email.toLowerCase() === cleanEmail) ||
        (cleanDigits.length >= 10 && (p.phone || '').replace(/\D/g, '').endsWith(cleanDigits.slice(-10)))
    );

    // Default onboarded provider fallback (Dhanvika Diagnostics)
    const isDhanvikaEmail = cleanEmail === 'dhanvikadiagnostics@gmail.com';
    const isDhanvikaPhone = cleanDigits.endsWith('8885282637');
    if (!foundSavedProvider && (isDhanvikaEmail || isDhanvikaPhone)) {
      foundSavedProvider = {
        id: 'usr_prov_dhanvika',
        name: 'Dhanvika Diagnostics (Kumar Chenagalla)',
        email: 'dhanvikadiagnostics@gmail.com',
        role: 'provider',
        phone: '+91 8885282637',
        providerId: '44d57460-17b7-48f4-bedd-5ef8dc84078b',
        password: 'Partner@2026'
      };
    }

    if (foundSavedProvider) {
      const expectedPassword = (foundSavedProvider.password || 'Partner@2026').trim();
      if (trimmedPassword !== expectedPassword) {
        return { success: false, error: 'Incorrect password for provider account. Please verify your password.' };
      }
      setCurrentUser(foundSavedProvider);
      setActiveProviderId(foundSavedProvider.providerId || '');
      setCurrentRole('provider');
      setActiveTab('provider_home');
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/provider');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      showNotification(`Signed in to Provider Portal (${foundSavedProvider.name}).`, 'success');
      return { success: true };
    }

    // 3. Affiliate accounts check (Self-Registered Affiliates only)
    const foundSavedAffiliate = savedAffiliateUsers.find(
      (a) =>
        (a.email && a.email.toLowerCase() === cleanEmail) ||
        (cleanDigits.length >= 10 && (a.phone || '').replace(/\D/g, '').endsWith(cleanDigits.slice(-10)))
    );
    if (foundSavedAffiliate) {
      const expectedPassword = (foundSavedAffiliate.password || 'Partner@2026').trim();
      if (foundSavedAffiliate.password && trimmedPassword !== expectedPassword) {
        return { success: false, error: 'Incorrect password for affiliate account.' };
      }
      setCurrentUser(foundSavedAffiliate);
      setCurrentRole('affiliate');
      setActiveTab('affiliate_dashboard');
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
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
    const rawInput = (emailOrPass || '').trim();
    const cleanEmail = rawInput.toLowerCase();
    const cleanDigits = rawInput.replace(/\D/g, '');
    const trimmedPass = (password || '').trim();

    // 1. Role: Affiliate
    if (role === 'affiliate') {
      const found = savedAffiliateUsers.find(
        (a) =>
          a.email.toLowerCase() === cleanEmail ||
          (cleanDigits.length >= 10 && (a.phone || '').replace(/\D/g, '').endsWith(cleanDigits.slice(-10)))
      );
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
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      showNotification(`Welcome back, ${found.name}! Connected to Affiliate Workspace.`, 'success');
      return { success: true };
    }

    // 2. Role: Provider
    if (role === 'provider') {
      let found = savedProviderUsers.find(
        (p) =>
          (p.email && p.email.toLowerCase() === cleanEmail) ||
          (cleanDigits.length >= 10 && (p.phone || '').replace(/\D/g, '').endsWith(cleanDigits.slice(-10)))
      );
      if (!found && (cleanEmail === 'dhanvikadiagnostics@gmail.com' || cleanDigits.endsWith('8885282637'))) {
        found = {
          id: 'usr_prov_dhanvika',
          name: 'Dhanvika Diagnostics (Kumar Chenagalla)',
          email: 'dhanvikadiagnostics@gmail.com',
          role: 'provider',
          phone: '+91 8885282637',
          providerId: '44d57460-17b7-48f4-bedd-5ef8dc84078b',
          password: 'Partner@2026'
        };
      }

      if (!found) {
        return {
          success: false,
          error: 'Provider account not registered. Please contact Admin or apply as a Provider.'
        };
      }

      const expectedPass = (found.password || 'Partner@2026').trim();
      if (trimmedPass && trimmedPass !== expectedPass) {
        return { success: false, error: 'Incorrect provider password. Please verify your password.' };
      }

      setCurrentUser(found);
      setActiveProviderId(found.providerId || providerId || '');
      setCurrentRole('provider');
      setActiveTab('provider_home');
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/provider');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
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

      const adminPass = (password || emailOrPass || '').trim();
      if (adminPass !== 'Ottobon@Admin2026' && adminPass !== 'Admin@2026' && adminPass !== 'Partner@2026') {
        return {
          success: false,
          error: 'Invalid admin credentials. Please enter the correct admin password.'
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
      providerId,
      password: tempPassword
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

  // User changes their password from business profile settings
  const changeUserPassword = (newPassword: string): { success: boolean; error?: string } => {
    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    const trimmedPassword = newPassword.trim();
    const updatedUser: User = { ...currentUser, password: trimmedPassword };
    setCurrentUser(updatedUser);

    if (currentRole === 'provider') {
      const updatedProviders = savedProviderUsers.map((p) =>
        p.email.toLowerCase() === currentUser.email.toLowerCase()
          ? { ...p, password: trimmedPassword }
          : p
      );
      if (!updatedProviders.some((p) => p.email.toLowerCase() === currentUser.email.toLowerCase())) {
        updatedProviders.push(updatedUser);
      }
      setSavedProviderUsers(updatedProviders);
      try {
        localStorage.setItem(SAVED_PROVIDERS_KEY, JSON.stringify(updatedProviders));
      } catch {
        // ignore
      }
    } else if (currentRole === 'affiliate') {
      const updatedAffiliates = savedAffiliateUsers.map((a) =>
        a.email.toLowerCase() === currentUser.email.toLowerCase()
          ? { ...a, password: trimmedPassword }
          : a
      );
      setSavedAffiliateUsers(updatedAffiliates);
      try {
        localStorage.setItem(SAVED_AFFILIATES_KEY, JSON.stringify(updatedAffiliates));
      } catch {
        // ignore
      }
    }

    showNotification('Password updated successfully! Keep your new password safe.', 'success');
    return { success: true };
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
    setCurrentUser({
      id: 'usr_guest',
      name: 'Guest User',
      email: '',
      role: 'affiliate',
      phone: ''
    });
    setActiveProviderId('');
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    showNotification('Signed out successfully.', 'info');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Admin explicitly logs in as a client/provider business to inspect their portal
  const loginAsProvider = (prov: { id: string; businessName: string; contactPerson?: string; email?: string; phone?: string }) => {
    const provUser: User = {
      id: `usr_prov_${prov.id.slice(0, 8)}`,
      name: `${prov.businessName}${prov.contactPerson ? ` (${prov.contactPerson})` : ''}`,
      email: prov.email || 'dhanvikadiagnostics@gmail.com',
      role: 'provider',
      phone: prov.phone || '+91 8885282637',
      providerId: prov.id
    };
    setCurrentUser(provUser);
    setActiveProviderId(prov.id);
    setCurrentRole('provider');
    setActiveTab('provider_home');
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/provider');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    showNotification(`Switched to Provider Portal for ${prov.businessName}`, 'success');
  };

  // Switch role (only accessible in admin or explicit workflows)
  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'affiliate') {
      setActiveTab('affiliate_dashboard');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } else if (role === 'provider') {
      if (currentUser.role !== 'provider') {
        setCurrentUser({
          id: 'usr_prov_dhanvika',
          name: 'Dhanvika Diagnostics (Kumar Chenagalla)',
          email: 'dhanvikadiagnostics@gmail.com',
          role: 'provider',
          phone: '+91 8885282637',
          providerId: activeProviderId || '44d57460-17b7-48f4-bedd-5ef8dc84078b'
        });
      }
      setActiveTab('provider_home');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/provider');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } else if (role === 'admin') {
      setCurrentUser(MOCK_USERS.admin);
      setActiveTab('admin_clients');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/admin');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
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
        loginAsProvider,
        registerAffiliate,
        registerProviderByAdmin,
        registerProviderUser,
        changeUserPassword,
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
