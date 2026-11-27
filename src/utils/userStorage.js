import { BUILT_IN_DEMO_ACCOUNTS } from '../services/authService';

export const isDemoAccountEmail = (email) => {
  if (!email) return false;
  return Boolean(BUILT_IN_DEMO_ACCOUNTS[String(email).trim().toLowerCase()]);
};

export const getUserStorageScope = (userObj = null) => {
  const target = userObj || (() => {
    try {
      const raw = localStorage.getItem('travelsphere_active_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  if (target) {
    const email = (target.email || '').trim().toLowerCase();
    if (email) return email;
    const uid = target.user_id || target.id;
    if (uid) return `id-${uid}`;
  }
  return 'guest';
};

export const getUserScopedKey = (baseKey, userObj = null) => {
  return `${baseKey}::${getUserStorageScope(userObj)}`;
};

export const readUserStorage = (baseKey, fallback, userObj = null) => {
  try {
    const scopedKey = getUserScopedKey(baseKey, userObj);
    const raw = localStorage.getItem(scopedKey);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch {
    /* ignore */
  }
  return fallback;
};

export const writeUserStorage = (baseKey, value, userObj = null) => {
  try {
    const scopedKey = getUserScopedKey(baseKey, userObj);
    localStorage.setItem(scopedKey, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

export const filterBookingsForUser = (bookingsList, userObj = null) => {
  if (!Array.isArray(bookingsList)) return [];
  const email = (userObj?.email || '').trim().toLowerCase();
  const uid = userObj?.user_id || userObj?.id;
  const isDemo = isDemoAccountEmail(email);

  return bookingsList.filter((b) => {
    if (!b || typeof b !== 'object') return false;
    const bEmail = (b.user_email || '').trim().toLowerCase();
    if (bEmail && email) {
      return bEmail === email;
    }
    if (b.user_id !== undefined && b.user_id !== null && uid !== undefined && uid !== null) {
      return String(b.user_id) === String(uid);
    }
    // Unscoped legacy items are shown only for built-in demo accounts, never new registered accounts
    return isDemo && !bEmail && !b.user_id;
  });
};
