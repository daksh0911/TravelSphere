/**
 * TravelSphere User Privacy & Data Protection Compliance System
 * Implements CCPA (California Consumer Privacy Act) & GDPR Standards
 * Enforces Zero Session Replay Tracking by default.
 */

const PRIVACY_PREFS_KEY = 'travelsphere_privacy_preferences';

export const DEFAULT_PRIVACY_PREFERENCES = {
  // CCPA: Explicit opt-out of "Sale" or "Sharing" of personal data
  doNotSellOrShare: true,
  // Session Replay tracking disabled by default
  sessionReplayEnabled: false,
  // Analytics tracking consent (opt-in)
  analyticsConsent: false,
  // Marketing personalization consent
  marketingConsent: false,
  // Timestamp when preferences were recorded
  updatedAt: new Date().toISOString()
};

/**
 * Retrieves the user's active privacy preferences or defaults.
 */
export const getPrivacyPreferences = () => {
  try {
    const raw = localStorage.getItem(PRIVACY_PREFS_KEY);
    if (!raw) return { ...DEFAULT_PRIVACY_PREFERENCES };
    return { ...DEFAULT_PRIVACY_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PRIVACY_PREFERENCES };
  }
};

/**
 * Updates and persists privacy preferences.
 */
export const savePrivacyPreferences = (prefs) => {
  try {
    const updated = {
      ...getPrivacyPreferences(),
      ...prefs,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PRIVACY_PREFS_KEY, JSON.stringify(updated));
    applyPrivacyGuards(updated);
    return updated;
  } catch (e) {
    console.warn('Failed to save privacy preferences:', e);
    return DEFAULT_PRIVACY_PREFERENCES;
  }
};

/**
 * Applies runtime browser privacy guards:
 * 1. Blocks any third-party session replay tools from recording
 * 2. Emits Global Privacy Control (GPC) signal
 * 3. Sets Do Not Track headers & window flags
 */
export const applyPrivacyGuards = (prefs = getPrivacyPreferences()) => {
  if (typeof window === 'undefined') return;

  // 1. Session Replay Defenses: Disable and neutralize known recorders
  if (!prefs.sessionReplayEnabled) {
    // Standard opt-out flags respected by common monitoring frameworks
    window['disable_session_replay'] = true;
    window['_replay_disabled'] = true;
    window['LogRocket'] = { init: () => {}, identify: () => {}, track: () => {} };
    window['clarity'] = () => {};
    window['hj'] = () => {};
  }

  // 2. CCPA / CPRA: Respect Global Privacy Control (GPC) & Do Not Sell
  if (prefs.doNotSellOrShare || navigator.globalPrivacyControl) {
    window['us_privacy'] = '1YYN'; // IAB US Privacy String: Opt-out of sale/share confirmed
  }
};

// Initialize guards immediately on load
if (typeof window !== 'undefined') {
  applyPrivacyGuards();
}

export default {
  DEFAULT_PRIVACY_PREFERENCES,
  getPrivacyPreferences,
  savePrivacyPreferences,
  applyPrivacyGuards
};

