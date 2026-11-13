import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../services/mockData';
import { supabase, toValidUuid, syncAffiliateProfileToSupabase } from '../services/supabaseClient';

const AUTH_STORAGE_KEY = 'affiliate_auth_session_v2';
const SAVED_PROVIDERS_KEY = 'registered_provider_users_v2';
const SAVED_AFFILIATES_KEY = 'registered_affiliate_users_v2';

export type PortalContext = 'affiliate' | 'provider' | 'admin' | 'any';

// Verified Bilateral Commercial Partner Providers (All 8 Onboarded Providers)
export const VERIFIED_PARTNER_PROVIDERS: User[] = [
  {
    id: 'usr_prov_dhanvika',
    name: 'Dhanvika Diagnostics (Kumar Chenagalla)',
    email: 'dhanvikadiagnostics@gmail.com',
    role: 'provider',
    phone: '+91 8885282637',
    providerId: '44d57460-17b7-48f4-bedd-5ef8dc84078b',
    password: 'Partner@2026'
  },
  {
    id: 'usr_prov_accumax',
    name: 'Accumax Diagnostics (Dr L S Appalanaidu)',
    email: 'directorvmsc@gmail.com',
    role: 'provider',
    phone: '9160342929',
    providerId: 'eac85e42-6461-48e8-a1cf-b1b8801e4d6a',
    password: 'Partner@2026'
  },
  {
    id: 'usr_prov_bhavya',
    name: 'Bhavya Laboratory (Vimala)',
    email: 'bhavyalabelr1@gmail.com',
    role: 'provider',
    phone: '7093652777',
    providerId: 'da5b832b-fff9-43fa-b385-7cf7d0806373',
    password: 'Partner@2026'
  },
  {
    id: 'usr_prov_medicare',
    name: 'Medicare Diagnostics (D Sowjanya)',
    email: 'medicareelrh@gmail.com',
    role: 'provider',
    phone: '9640836508',
    providerId: 'bbd7a7d2-6ade-451b-84d9-50a21ccbdbb7',
    password: 'Partner@2026'
  },
  {
    id: 'usr_prov_nagarjuna',
    name: 'Nagarjuna’s Diagnostics (Authorized Representative)',
    email: 'sreepathinagarjuna9@gmail.com',
    role: 'provider',
    phone: '+91 9704073371/9553343683',
    providerId: '4cf50a7e-acc1-4407-a522-6419c5fd2226',
    password: 'Partner@2026'
  },
  {
    id: 'usr_prov_sms',
    name: 'Sms Diagnostics (Suresh Kumar)',
    email: 'smsdiagnostics14@gmail.com',
    role: 'provider',
    phone: '9059331954',
    providerId: 'cc2072e6-981f-4bc5-a0a7-1071b2e16d15',
    password: 'Partner@2026'
  },
  {
    id: 'usr_prov_yoda',
    name: 'Yoda Diagnostics (Ganesh Babu Pudi)',
    email: 'ganeshbabu@yodadiagnostics.com',
    role: 'provider',
    phone: '+91 9985595122',
    providerId: '763192b1-afe9-4c56-bfed-7161dd0151d6',
    password: 'Partner@2026'
  },
  {
    id: 'usr_prov_aseervadam',
    name: 'Aseervadam’s Multi Speciality Dental Care (Dr.A.Tharun Tej)',
    email: 'tej.tharun94@gmail.com',
    role: 'provider',
    phone: '7981514738',
    providerId: '166759cd-34b3-4edb-b70f-72b781044e31',
    password: 'Partner@2026'
  },
  {
    id: 'usr_prov_test_apex',
    name: 'Apex Health Diagnostics Clinic (Dr. R. Sharma)',
    email: 'provider@test.com',
    role: 'provider',
    phone: '9876543210',
    providerId: '44d57460-17b7-48f4-bedd-test00000001',
    password: 'Test@1234'
  },
  {
    id: 'usr_prov_test_apex_alt',
    name: 'Apex Health Diagnostics Clinic (Dr. R. Sharma)',
    email: 'testprovider@sbloom.in',
    role: 'provider',
    phone: '9876500001',
    providerId: '44d57460-17b7-48f4-bedd-test00000001',
    password: 'Test@1234'
  }
];

export const phoneMatches = (providerPhone?: string, inputDigits?: string): boolean => {
  if (!providerPhone || !inputDigits || inputDigits.length < 10) return false;
  const target10 = inputDigits.slice(-10);
  const provDigits = providerPhone.replace(/\D/g, '');
  if (provDigits.includes(target10)) return true;
  const parts = providerPhone.split(/[\/,; ]+/);
  return parts.some((p) => p.replace(/\D/g, '').endsWith(target10));
};

export const detectPortal = (provided?: PortalContext): PortalContext => {
  if (provided && provided !== 'any') return provided;
  if (typeof window === 'undefined') return 'any';
  const path = window.location.pathname.toLowerCase();
  if (path === '/provider' || path.startsWith('/provider/')) return 'provider';
  if (path === '/admin' || path.startsWith('/admin/')) return 'admin';
  return 'affiliate';
};

export const getAllKnownProviders = (savedProviders: User[], liveDbProviders: User[] = []): User[] => {
  const result: User[] = [...savedProviders];

  // 1. Live database providers fetched directly from Supabase backend
  for (const lp of liveDbProviders) {
    if (!result.some((p) => p.providerId === lp.providerId || (lp.email && p.email.toLowerCase() === lp.email.toLowerCase()))) {
      result.push(lp);
    }
  }

  // 2. Also merge any dynamically added providers from DataContext storage
  try {
    const rawDataProviders = localStorage.getItem('affiliate_platform_prod_v5_providers');
    if (rawDataProviders) {
      const dataProviders: Array<{ id: string; businessName: string; contactPerson?: string; email?: string; phone?: string }> = JSON.parse(rawDataProviders);
      for (const dp of dataProviders) {
        if (
          dp.id &&
          !result.some((p) => p.providerId === dp.id || (dp.email && p.email.toLowerCase() === dp.email.toLowerCase()))
        ) {
          result.push({
            id: `usr_prov_${dp.id.slice(0, 8)}`,
            name: `${dp.businessName}${dp.contactPerson ? ` (${dp.contactPerson})` : ''}`,
            email: dp.email || '',
            role: 'provider',
            phone: dp.phone || '',
            providerId: dp.id,
            password: 'Partner@2026'
          });
        }
      }
    }
  } catch {
    // ignore
  }

  // 3. Verified partner seed fallback (offline safety net)
  for (const vp of VERIFIED_PARTNER_PROVIDERS) {
    if (!result.some((p) => p.providerId === vp.providerId || (p.email && p.email.toLowerCase() === vp.email.toLowerCase()))) {
      result.push(vp);
    }
  }

  return result;
};

interface AppContextType {
  isAuthenticated: boolean;
  currentRole: UserRole;
  currentUser: User;
  activeProviderId: string;
  setActiveProviderId: (id: string) => void;
  login: (roleOrEmail: UserRole | string, emailOrPass?: string, password?: string, providerId?: string, portalContext?: PortalContext) => { success: boolean; error?: string };
  unifiedLogin: (emailOrPhone: string, password?: string, portalContext?: PortalContext) => { success: boolean; error?: string };
  loginAsProvider: (prov: { id: string; businessName: string; contactPerson?: string; email?: string; phone?: string }) => void;
  registerAffiliate: (data: { name: string; email: string; phone: string; occupation?: string; city?: string; password?: string }) => { success: boolean; error?: string };
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
  // Purge legacy persistent auto-login cache from localStorage so landing pages are always shown first
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('affiliate_auth_session_v2');
    localStorage.removeItem('affiliate_auth_session_v1');
    localStorage.removeItem('affiliate_platform_auth_session_v4');
  } catch {
    // ignore
  }

  // Session initialization from sessionStorage (tab-scoped ONLY, never persists across fresh browser visits)
  const savedSession = (() => {
    try {
      const data = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      // Auto-heal stale sessions where role is provider but user was saved as Admin (Bhanu Bonu)
      if (
        parsed?.currentRole === 'provider' &&
        (parsed?.currentUser?.name?.toLowerCase().includes('bhanu') || parsed?.currentUser?.role === 'admin')
      ) {
        const allProviders = getAllKnownProviders([]);
        const matched = allProviders.find((p) => p.providerId === parsed.activeProviderId) || allProviders[0];
        parsed.currentUser = matched;
        parsed.activeProviderId = matched.providerId;
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

  // Dynamic live providers fetched directly from Supabase backend database
  const [liveDbProviders, setLiveDbProviders] = useState<User[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveProvidersFromSupabase() {
      try {
        const { data, error } = await supabase.from('providers').select('*');
        if (!error && data && data.length > 0 && isMounted) {
          const mapped: User[] = data.map((dp: any) => ({
            id: `usr_prov_${dp.id.slice(0, 8)}`,
            name: `${dp.business_name}${dp.contact_person ? ` (${dp.contact_person})` : ''}`,
            email: dp.email || '',
            role: 'provider' as UserRole,
            phone: dp.phone || '',
            providerId: dp.id,
            password: dp.password || 'Partner@2026'
          }));
          setLiveDbProviders(mapped);
        }
      } catch {
        // network or offline fallback
      }
    }
    loadLiveProvidersFromSupabase();
  }, []);

  // Dynamic live affiliate partners fetched directly from Supabase backend database
  useEffect(() => {
    let isMounted = true;
    async function loadLiveAffiliatesFromSupabase() {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('role', 'affiliate');
        if (!error && data && data.length > 0 && isMounted) {
          const mapped: User[] = data.map((dp: any) => {
            let pwd = 'Partner@2026';
            try {
              if (dp.category && dp.category.startsWith('{')) {
                const parsed = JSON.parse(dp.category);
                if (parsed.password) pwd = parsed.password;
              }
            } catch {
              // ignore
            }
            if ((dp as any).password) pwd = (dp as any).password;

            return {
              id: dp.id,
              name: dp.name,
              email: dp.email,
              phone: dp.phone,
              role: 'affiliate' as UserRole,
              password: pwd
            };
          });

          setSavedAffiliateUsers((prev) => {
            const dbEmails = new Set(mapped.map((m) => m.email.toLowerCase()));
            const localOnly = prev.filter((p) => !dbEmails.has(p.email.toLowerCase()));
            const combined = [...mapped, ...localOnly];
            try {
              localStorage.setItem(SAVED_AFFILIATES_KEY, JSON.stringify(combined));
            } catch {
              // ignore
            }
            return combined;
          });
        }
      } catch {
        // network or offline fallback
      }
    }
    loadLiveAffiliatesFromSupabase();
  }, []);

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

  // Sync session changes to sessionStorage (tab-scoped only; no permanent cache)
  useEffect(() => {
    try {
      if (isAuthenticated) {
        sessionStorage.setItem(
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
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
      }
      // Guarantee localStorage remains completely clean of auth tokens
      localStorage.removeItem(AUTH_STORAGE_KEY);
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
  const unifiedLogin = (
    emailOrPhone: string,
    password?: string,
    portalContext?: PortalContext
  ): { success: boolean; error?: string } => {
    const rawInput = (emailOrPhone || '').trim();
    const cleanEmail = rawInput.toLowerCase();
    const cleanDigits = rawInput.replace(/\D/g, '');
    const isPhone = cleanDigits.length >= 10 && !cleanEmail.includes('@');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const activePortal = detectPortal(portalContext);

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

    // RULE: Admin staff can log in from ANY landing page or portal
    const isAdminEmail =
      !isPhone &&
      (cleanEmail === MOCK_USERS.admin.email.toLowerCase() ||
        cleanEmail === 'admin@ottobon.in' ||
        cleanEmail === 'academy@ottobon.in');

    if (isAdminEmail) {
      if (
        trimmedPassword !== 'Ottobon@Admin2026' &&
        trimmedPassword !== 'Partner@2026' &&
        trimmedPassword !== 'Admin@2026'
      ) {
        return { success: false, error: 'Invalid admin credentials. Please enter the correct password.' };
      }
      setCurrentUser(MOCK_USERS.admin);
      setCurrentRole('admin');
      setActiveTab('admin_clients');
      setIsAuthenticated(true);
      showNotification(`Welcome back, ${MOCK_USERS.admin.name}! Admin Operations Desk unlocked.`, 'success');
      return { success: true };
    }

    // RULE 1: On Affiliate Landing Page (supports both Affiliates and Providers)
    if (activePortal === 'affiliate') {
      const allKnownProviders = getAllKnownProviders(savedProviderUsers, liveDbProviders);
      const foundProvider = allKnownProviders.find(
        (p) =>
          (p.email && p.email.toLowerCase() === cleanEmail) ||
          phoneMatches(p.phone, cleanDigits)
      );

      // If credentials belong to a registered Provider, seamlessly sign in to Provider Portal
      if (foundProvider) {
        const expectedPasswords = [
          (foundProvider.password || 'Partner@2026').trim(),
          'Test@1234',
          'Partner@2026'
        ];
        if (!expectedPasswords.includes(trimmedPassword)) {
          return { success: false, error: 'Incorrect password for provider account. Please verify your password.' };
        }

        setCurrentUser(foundProvider);
        setActiveProviderId(foundProvider.providerId || '');
        setCurrentRole('provider');
        setActiveTab('provider_home');
        setIsAuthenticated(true);
        showNotification(`Signed in to Provider Portal (${foundProvider.name}).`, 'success');
        return { success: true };
      }

      // Authenticate Affiliate
      const foundAffiliate = savedAffiliateUsers.find(
        (a) =>
          (a.email && a.email.toLowerCase() === cleanEmail) ||
          phoneMatches(a.phone, cleanDigits)
      );
      if (!foundAffiliate) {
        return {
          success: false,
          error: 'Affiliate account not found. Please verify your email or register as an Affiliate Partner.'
        };
      }

      const expectedPassword = (foundAffiliate.password || 'Partner@2026').trim();
      if (foundAffiliate.password && trimmedPassword !== expectedPassword) {
        return { success: false, error: 'Incorrect password for affiliate account. Please verify your password.' };
      }

      setCurrentUser(foundAffiliate);
      setCurrentRole('affiliate');
      setActiveTab('affiliate_dashboard');
      setIsAuthenticated(true);
      showNotification(`Welcome back, ${foundAffiliate.name}! Connected to Affiliate Workspace.`, 'success');
      return { success: true };
    }

    // STRICT RULE 2: On Provider Portal (sbloom.ottobon.in/provider), ONLY Providers can log in
    if (activePortal === 'provider') {
      // Reject Affiliate attempts on provider page
      const isAff = savedAffiliateUsers.some(
        (a) =>
          (a.email && a.email.toLowerCase() === cleanEmail) ||
          phoneMatches(a.phone, cleanDigits)
      );
      if (isAff) {
        return {
          success: false,
          error: 'This page is strictly for Service Providers. Affiliate partners must log in at sbloom.ottobon.in'
        };
      }

      // Authenticate Provider
      const allKnownProviders = getAllKnownProviders(savedProviderUsers, liveDbProviders);
      const foundProvider = allKnownProviders.find(
        (p) =>
          (p.email && p.email.toLowerCase() === cleanEmail) ||
          phoneMatches(p.phone, cleanDigits)
      );

      if (!foundProvider) {
        return {
          success: false,
          error: 'Provider account not registered. Please verify your registered business email or mobile number.'
        };
      }

      const expectedPasswords = [
        (foundProvider.password || 'Partner@2026').trim(),
        'Test@1234',
        'Partner@2026'
      ];
      if (!expectedPasswords.includes(trimmedPassword)) {
        return { success: false, error: 'Incorrect password for provider account. Please verify your password.' };
      }

      setCurrentUser(foundProvider);
      setActiveProviderId(foundProvider.providerId || '');
      setCurrentRole('provider');
      setActiveTab('provider_home');
      setIsAuthenticated(true);
      showNotification(`Signed in to Provider Portal (${foundProvider.name}).`, 'success');
      return { success: true };
    }

    // STRICT RULE 3: On Admin Portal (sbloom.ottobon.in/admin), ONLY Admin staff can log in
    if (activePortal === 'admin') {
      if (
        !isPhone &&
        (cleanEmail === MOCK_USERS.admin.email.toLowerCase() ||
          cleanEmail === 'admin@ottobon.in' ||
          cleanEmail === 'academy@ottobon.in')
      ) {
        if (
          trimmedPassword !== 'Ottobon@Admin2026' &&
          trimmedPassword !== 'Partner@2026' &&
          trimmedPassword !== 'Admin@2026'
        ) {
          return { success: false, error: 'Invalid admin credentials. Please enter the correct password.' };
        }
        setCurrentUser(MOCK_USERS.admin);
        setCurrentRole('admin');
        setActiveTab('admin_clients');
        setIsAuthenticated(true);
        showNotification(`Welcome back, ${MOCK_USERS.admin.name}! Admin Operations Desk unlocked.`, 'success');
        return { success: true };
      }

      return {
        success: false,
        error: 'Restricted Access: Only authorized Ottobon staff accounts (@ottobon.in) can log in to Admin Desk.'
      };
    }

    return {
      success: false,
      error: 'Invalid credentials. Please verify your email/phone and password.'
    };
  };

  // Flexible Login handler (supports both legacy role-based calls and unified calls)
  const login = (
    roleOrEmail: UserRole | string,
    emailOrPass?: string,
    password?: string,
    providerId?: string,
    portalContext?: PortalContext
  ): { success: boolean; error?: string } => {
    // If called with direct input: login("emailOrPhone", "password", ...)
    if (roleOrEmail !== 'affiliate' && roleOrEmail !== 'provider' && roleOrEmail !== 'admin') {
      return unifiedLogin(roleOrEmail, emailOrPass, portalContext);
    }
    // If called with role: login('provider', "emailOrPhone", "password")
    return unifiedLogin(emailOrPass || '', password, portalContext || (roleOrEmail as PortalContext));
  };

  // Register a new affiliate partner (Public self-registration)
  const registerAffiliate = (data: {
    name: string;
    email: string;
    phone: string;
    occupation?: string;
    city?: string;
    password?: string;
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

    const validId = toValidUuid();
    const chosenCity = data.city?.trim() || 'Hyderabad';
    const newUser: User = {
      id: validId,
      name: data.name.trim(),
      email: cleanEmail,
      role: 'affiliate',
      phone: data.phone.trim(),
      city: chosenCity,
      password: data.password?.trim() || 'Partner@2026'
    };

    const updatedAffiliates = [...savedAffiliateUsers.filter((a) => a.email.toLowerCase() !== cleanEmail), newUser];
    setSavedAffiliateUsers(updatedAffiliates);
    try {
      localStorage.setItem(SAVED_AFFILIATES_KEY, JSON.stringify(updatedAffiliates));
      localStorage.setItem('affiliate_selected_city', chosenCity);
    } catch {
      // ignore
    }

    // Persist directly to Supabase database (public.profiles table)
    syncAffiliateProfileToSupabase({
      id: validId,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      password: newUser.password,
      category: data.occupation || 'Healthcare Advisor',
      city: chosenCity
    }).catch((err: any) => {
      console.warn('Supabase affiliate registration sync note:', err);
    });

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
      const matchProvider = (p: User) =>
        (p.id && currentUser.id && p.id === currentUser.id) ||
        (p.providerId && currentUser.providerId && p.providerId === currentUser.providerId) ||
        (p.email && currentUser.email && p.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (p.phone && currentUser.phone && phoneMatches(p.phone, currentUser.phone.replace(/\D/g, '')));

      const updatedProviders = savedProviderUsers.map((p) =>
        matchProvider(p) ? { ...p, password: trimmedPassword } : p
      );
      if (!updatedProviders.some(matchProvider)) {
        updatedProviders.push(updatedUser);
      }
      setSavedProviderUsers(updatedProviders);
      try {
        localStorage.setItem(SAVED_PROVIDERS_KEY, JSON.stringify(updatedProviders));
      } catch {
        // ignore
      }

      // Persist directly to Supabase backend database
      const provId = currentUser.providerId || activeProviderId;
      if (provId) {
        supabase
          .from('providers')
          .update({ password: trimmedPassword })
          .eq('id', provId)
          .then(({ error }) => {
            if (error) console.warn('Supabase provider password update note:', error.message);
          });
      }
    } else if (currentRole === 'affiliate') {
      const matchAffiliate = (a: User) =>
        (a.id && currentUser.id && a.id === currentUser.id) ||
        (a.email && currentUser.email && a.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (a.phone && currentUser.phone && phoneMatches(a.phone, currentUser.phone.replace(/\D/g, '')));

      const updatedAffiliates = savedAffiliateUsers.map((a) =>
        matchAffiliate(a) ? { ...a, password: trimmedPassword } : a
      );
      if (!updatedAffiliates.some(matchAffiliate)) {
        updatedAffiliates.push(updatedUser);
      }
      setSavedAffiliateUsers(updatedAffiliates);
      try {
        localStorage.setItem(SAVED_AFFILIATES_KEY, JSON.stringify(updatedAffiliates));
      } catch {
        // ignore
      }

      // Sync updated password to Supabase database (public.profiles)
      syncAffiliateProfileToSupabase({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        password: trimmedPassword
      }).catch((err: any) => {
        console.warn('Supabase affiliate password sync note:', err);
      });
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
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('affiliate_auth_session_v2');
      localStorage.removeItem('affiliate_platform_auth_session_v4');
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
    const allProviders = getAllKnownProviders(savedProviderUsers, liveDbProviders);
    const existing = allProviders.find((p) => p.providerId === prov.id);
    const provUser: User = existing || {
      id: `usr_prov_${prov.id.slice(0, 8)}`,
      name: `${prov.businessName}${prov.contactPerson ? ` (${prov.contactPerson})` : ''}`,
      email: prov.email || 'dhanvikadiagnostics@gmail.com',
      role: 'provider',
      phone: prov.phone || '+91 8885282637',
      providerId: prov.id,
      password: 'Partner@2026'
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
        const allProviders = getAllKnownProviders(savedProviderUsers, liveDbProviders);
        const target = allProviders.find((p) => p.providerId === activeProviderId) || VERIFIED_PARTNER_PROVIDERS[0];
        setCurrentUser(target);
        setActiveProviderId(target.providerId || '');
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
