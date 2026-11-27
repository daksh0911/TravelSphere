import api from './api';

// Local DB key for fallback
const LOCAL_USERS_KEY = 'travelsphere_db_users';

const hashSecret = async (value) => {
  if (window.crypto?.subtle) {
    const bytes = new TextEncoder().encode(value);
    const digest = await window.crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }
  return btoa(unescape(encodeURIComponent(value)));
};

const getLocalUsers = () => {
  try {
    const data = localStorage.getItem(LOCAL_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLocalUsers = (users) => {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save to local DB', e);
  }
};

export const BUILT_IN_DEMO_ACCOUNTS = {
  'admin@travelsphere.org': { id: 'admin-1', name: 'Global Administrator', role: 'ADMIN', phone: '+1 555-0100', validPasswords: ['SphereAdmin@2026', 'admin@1234'] },
  'agent@travelsphere.org': { id: 'agent-1', name: 'Sarah Jenkins', role: 'TRAVEL_AGENT', phone: '+1 555-0101', validPasswords: ['SphereAgent@2026', 'agent@1234'] },
  'hotel@travelsphere.org': { id: 'hotel-1', name: 'Kenji Sato', role: 'HOTEL_MANAGER', phone: '+81 75-498-5000', validPasswords: ['SphereHotel@2026', 'hotel@1234'] },
  'transport@travelsphere.org': { id: 'transport-1', name: 'Michael Chang', role: 'TRANSPORT_PROVIDER', phone: '+1 555-0102', validPasswords: ['SphereTransport@2026', 'transport@1234'] },
  'guide@travelsphere.org': { id: 'guide-1', name: 'Marco Rossi', role: 'TOUR_GUIDE', phone: '+1 555-0199', validPasswords: ['SphereGuide@2026', 'guide@1234'] },
  'customer@travelsphere.org': { id: 'customer-1', name: 'Alice Walker', role: 'CUSTOMER', phone: '+91 9876543210', validPasswords: ['SphereCustomer@2026', 'customer@1234'] },
  'admin@mail.com': { id: 'admin-1', name: 'Global Administrator', role: 'ADMIN', phone: '+1 555-0100', validPasswords: ['SphereAdmin@2026', 'admin@1234'] },
  'agent@mail.com': { id: 'agent-1', name: 'Sarah Jenkins', role: 'TRAVEL_AGENT', phone: '+1 555-0101', validPasswords: ['SphereAgent@2026', 'agent@1234'] },
  'hotel@mail.com': { id: 'hotel-1', name: 'Kenji Sato', role: 'HOTEL_MANAGER', phone: '+81 75-498-5000', validPasswords: ['SphereHotel@2026', 'hotel@1234'] },
  'transport@mail.com': { id: 'transport-1', name: 'Michael Chang', role: 'TRANSPORT_PROVIDER', phone: '+1 555-0102', validPasswords: ['SphereTransport@2026', 'transport@1234'] },
  'guide@mail.com': { id: 'guide-1', name: 'Marco Rossi', role: 'TOUR_GUIDE', phone: '+1 555-0199', validPasswords: ['SphereGuide@2026', 'guide@1234'] },
  'customer@mail.com': { id: 'customer-1', name: 'Alice Walker', role: 'CUSTOMER', phone: '+91 9876543210', validPasswords: ['SphereCustomer@2026', 'customer@1234'] }
};

export const registerUser = async (userData) => {
  const cleanEmail = (userData.email || '').trim().toLowerCase();

  // 1. Check against built-in demo accounts
  if (BUILT_IN_DEMO_ACCOUNTS[cleanEmail]) {
    throw new Error('An account with this email address already exists. Please log in instead.');
  }

  // 2. Check against locally registered accounts
  const localUsers = getLocalUsers();
  if (localUsers.some(u => (u.email || '').trim().toLowerCase() === cleanEmail)) {
    throw new Error('An account with this email address already exists. Please log in instead.');
  }

  const userRole = (userData.role || 'CUSTOMER').toUpperCase();
  const isProvider = userRole !== 'CUSTOMER';
  const userStatus = isProvider ? 'PENDING' : 'ACTIVE';

  try {
    const response = await api.post('/auth/register', { ...userData, role: userRole });
    
    // Mirror to localStorage for offline access
    const newUser = {
      id: response.data.user?.id || response.data.user?.user_id || Date.now(),
      name: userData.fullName,
      email: cleanEmail,
      country: userData.country,
      phone: userData.phone,
      role: userRole,
      status: userStatus,
      is_approved: isProvider ? 0 : 1,
      agencyData: userData.agencyData,
      hotelData: userData.hotelData,
      transportData: userData.transportData,
      guideData: userData.guideData,
      created_at: new Date().toISOString()
    };
    if (!localUsers.some(u => (u.email || '').trim().toLowerCase() === cleanEmail)) {
      saveLocalUsers([...localUsers, newUser]);
    }
    
    return response.data;
  } catch (error) {
    console.warn('API error during registration:', error);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message, { cause: error });
    }

    // Re-verify local duplication before creating fallback account
    if (localUsers.some(u => (u.email || '').trim().toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please log in instead.', { cause: error });
    }

    const newUser = {
      id: Date.now(),
      name: userData.fullName,
      email: cleanEmail,
      passwordHash: await hashSecret(userData.password),
      country: userData.country,
      phone: userData.phone,
      role: userRole,
      status: userStatus,
      is_approved: isProvider ? 0 : 1,
      agencyData: userData.agencyData,
      hotelData: userData.hotelData,
      transportData: userData.transportData,
      guideData: userData.guideData,
      created_at: new Date().toISOString()
    };

    saveLocalUsers([...localUsers, newUser]);

    return {
      success: true,
      message: isProvider 
        ? `${userRole.replace('_', ' ')} registration submitted! Your account is pending Admin approval.` 
        : 'Account created successfully! You can now log in.',
      user: newUser
    };
  }
};

export const loginUser = async (credentials) => {
  const cleanEmail = (credentials.email || '').trim().toLowerCase();

  // 1. Authenticate with the live backend API to obtain verified HMAC session token
  try {
    const response = await api.post('/auth/login', credentials, { timeout: 2500 });
    if (response.data && response.data.token) {
      sessionStorage.setItem('travelsphere_session_token', response.data.token);
      return response.data;
    }
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error(error.response.data?.message || 'Invalid email address or password.', { cause: error });
    }
    // If backend is unreachable (offline/network timeout), proceed to offline fallback
  }

  // 2. Offline Fallback for Demo Accounts (All 6 Roles)
  const demoProfile = BUILT_IN_DEMO_ACCOUNTS[cleanEmail];
  let demoPasswordOverrides = {};
  try {
    demoPasswordOverrides = JSON.parse(localStorage.getItem('ts_demo_password_overrides') || '{}');
  } catch { /* ignore */ }
  const overriddenHash = demoPasswordOverrides[cleanEmail];
  const providedDemoHash = overriddenHash ? await hashSecret(credentials.password || '') : null;
  const isDemoPasswordValid = demoProfile && (
    overriddenHash
      ? overriddenHash === providedDemoHash
      : demoProfile.validPasswords?.includes(credentials.password)
  );

  if (isDemoPasswordValid) {
    return {
      success: true,
      message: 'Signed in successfully.',
      user: {
        id: demoProfile.id,
        name: demoProfile.name,
        role: demoProfile.role,
        email: cleanEmail,
        phone: demoProfile.phone || '+91 9876543210'
      },
      token: `demo-token-${demoProfile.id}`
    };
  }

  // 3. Offline Fallback for Locally Registered Accounts
  const localUsers = getLocalUsers();
  const foundUser = localUsers.find(
    u => (u.email || '').trim().toLowerCase() === cleanEmail
  );

  if (foundUser) {
    const providedHash = await hashSecret(credentials.password || '');
    const legacyMatch = foundUser.password && foundUser.password === credentials.password;
    if (foundUser.passwordHash === providedHash || legacyMatch) {
      if (legacyMatch) {
        foundUser.passwordHash = providedHash;
        delete foundUser.password;
        saveLocalUsers(localUsers);
      }
      const userWithoutPassword = { ...foundUser };
      delete userWithoutPassword.password;
      delete userWithoutPassword.passwordHash;

      return {
        success: true,
        message: 'Login successful!',
        user: userWithoutPassword,
        token: `mock-token-${foundUser.id}`
      };
    }
  }

  // 4. Default authentication failure
  throw new Error('Invalid email address or password.');
};

export const forgotPassword = async (email) => {
  try {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  } catch (err) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message, { cause: err });
    }
    // Offline simulated verification code
    const resetCode = `RST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      message: `Password reset instructions generated! Verification reset code: ${resetCode}`,
      reset_code: resetCode
    };
  }
};

export const resetPassword = async ({ email, resetCode, newPassword }) => {
  try {
    const res = await api.post('/auth/reset-password', { email, resetCode, newPassword });
    return res.data;
  } catch (err) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message, { cause: err });
    }
    // Update local database if offline
    const localUsers = getLocalUsers();
    const userIndex = localUsers.findIndex(u => (u.email || '').trim().toLowerCase() === email.trim().toLowerCase());
    if (userIndex !== -1) {
      localUsers[userIndex].passwordHash = await hashSecret(newPassword);
      saveLocalUsers(localUsers);
    }
    return {
      success: true,
      message: 'Password has been reset successfully! You can now log in.'
    };
  }
};

export const loginSocialUser = async (provider) => {
  const providerNames = {
    google: 'Google',
    apple: 'Apple',
    facebook: 'Facebook'
  };
  const providerName = providerNames[provider.toLowerCase()] || provider;
  const mockEmail = `user.${provider.toLowerCase()}@travelsphere.com`;
  const mockName = `${providerName} Traveler`;

  try {
    const response = await api.post('/auth/social-login', { provider, email: mockEmail, name: mockName });
    return response.data;
  } catch (error) {
    console.warn(`Social login API fallback for ${providerName}:`, error);

    const localUsers = getLocalUsers();
    let foundUser = localUsers.find(u => u.email.toLowerCase() === mockEmail.toLowerCase());

    if (!foundUser) {
      foundUser = {
        id: Date.now(),
        name: mockName,
        email: mockEmail,
        country: 'US',
        phone: '+1 (555) 019-2834',
        role: 'CUSTOMER',
        provider: provider.toLowerCase(),
        avatar: `/destination-images/kyoto.webp`,
        created_at: new Date().toISOString()
      };
      saveLocalUsers([...localUsers, foundUser]);
    }

    return {
      success: true,
      message: `Successfully logged in with ${providerName}!`,
      user: foundUser,
      token: `mock-${provider.toLowerCase()}-token-${foundUser.id}`
    };
  }
};

export const changePassword = async ({ email, currentPassword, newPassword }) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('User email not found. Please log in again.');
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  try {
    const res = await api.post('/auth/change-password', { email: cleanEmail, currentPassword, newPassword }, { timeout: 2500 });
    if (res.data?.success) {
      return res.data;
    }
  } catch (err) {
    if (err.response?.status === 400 || err.response?.status === 401 || err.response?.status === 403) {
      throw new Error(err.response.data?.message || 'Current password is incorrect.', { cause: err });
    }
    // Offline fallback below
  }

  const currentHash = await hashSecret(currentPassword || '');
  const newHash = await hashSecret(newPassword);

  // 1. Check demo account
  const demoProfile = BUILT_IN_DEMO_ACCOUNTS[cleanEmail];
  if (demoProfile) {
    let overrides = {};
    try {
      overrides = JSON.parse(localStorage.getItem('ts_demo_password_overrides') || '{}');
    } catch { /* ignore */ }
    const existingOverride = overrides[cleanEmail];
    const validCurrent = existingOverride
      ? existingOverride === currentHash
      : demoProfile.validPasswords?.includes(currentPassword);
    if (!validCurrent) {
      throw new Error('Current password is incorrect.');
    }
    overrides[cleanEmail] = newHash;
    localStorage.setItem('ts_demo_password_overrides', JSON.stringify(overrides));
    return { success: true, message: 'Password updated successfully! You can now log in with your new password.' };
  }

  // 2. Check locally registered accounts
  const localUsers = getLocalUsers();
  const userIndex = localUsers.findIndex(u => (u.email || '').trim().toLowerCase() === cleanEmail);
  if (userIndex !== -1) {
    const target = localUsers[userIndex];
    const matchesHash = target.passwordHash && target.passwordHash === currentHash;
    const matchesLegacy = target.password && target.password === currentPassword;
    if ((target.passwordHash || target.password) && !matchesHash && !matchesLegacy) {
      throw new Error('Current password is incorrect.');
    }
    localUsers[userIndex] = {
      ...target,
      passwordHash: newHash
    };
    delete localUsers[userIndex].password;
    saveLocalUsers(localUsers);
    return { success: true, message: 'Password updated successfully! You can now log in with your new password.' };
  }

  throw new Error('Account record not found. Please log in again.');
};

export const fetchAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data.users;
  } catch {
    return getLocalUsers();
  }
};
