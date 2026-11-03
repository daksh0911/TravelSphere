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

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    // Mirror to localStorage for offline access
    const localUsers = getLocalUsers();
    const newUser = {
      id: response.data.user?.id || Date.now(),
      name: userData.fullName,
      email: userData.email.trim().toLowerCase(),
      country: userData.country,
      phone: userData.phone,
      role: 'CUSTOMER',
      created_at: new Date().toISOString()
    };
    if (!localUsers.some(u => u.email.toLowerCase().trim() === userData.email.toLowerCase().trim())) {
      saveLocalUsers([...localUsers, newUser]);
    }
    
    return response.data;
  } catch (error) {
    console.warn('API error, attempting local fallback if network issue:', error);
    
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Registration failed.', { cause: error });
    }

    // Local DB fallback implementation
    const localUsers = getLocalUsers();
    if (localUsers.some(u => u.email.toLowerCase().trim() === userData.email.toLowerCase().trim())) {
      throw new Error('An account with this email address already exists.', { cause: error });
    }

    const newUser = {
      id: Date.now(),
      name: userData.fullName,
      email: userData.email.trim().toLowerCase(),
      passwordHash: await hashSecret(userData.password),
      country: userData.country,
      phone: userData.phone,
      role: 'CUSTOMER',
      created_at: new Date().toISOString()
    };

    saveLocalUsers([...localUsers, newUser]);

    return {
      success: true,
      message: 'Account created successfully!',
      user: newUser
    };
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Login failed.', { cause: error });
    }

    const cleanEmail = (credentials.email || '').trim().toLowerCase();

    // Local DB fallback search for registered accounts
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

    throw new Error('Invalid email address or password.', { cause: error });
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

export const fetchAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data.users;
  } catch {
    return getLocalUsers();
  }
};
