import { useState } from 'react';
import './Legal.css';
import usePageTitle from '../../../hooks/usePageTitle';
import { getPrivacyPreferences, savePrivacyPreferences } from '../../../utils/privacy';

const CONTENT = {
  terms: {
    label: 'TRAVELSPHERE TERMS',
    title: 'Travel with clarity.',
    intro: 'These terms explain how TravelSphere works when you browse, request, and confirm travel services through our platform.',
    sections: [
      ['Booking requests', 'A request is not a confirmed reservation until availability and final pricing have been reviewed and confirmed by TravelSphere or the relevant travel partner.'],
      ['Partner services', 'Hotels, transport providers, guides, and travel agents are independent partners. Their individual terms, availability, and cancellation policies apply to the service you choose.'],
      ['Changes and cancellations', 'Cancellation conditions are shown before confirmation. If you need to make a change, contact support as soon as possible so we can work with the partner.'],
      ['Responsible use', 'Please provide accurate traveller details and use the platform only for lawful travel planning and communication.']
    ]
  },
  privacy: {
    label: 'TRAVELSPHERE PRIVACY & DATA RIGHTS',
    title: 'Your details, respected.',
    intro: 'TravelSphere respects your privacy and complies with modern global data privacy standards, including CCPA (California Consumer Privacy Act) and GDPR. We never sell your personal information, and session replay recording is disabled by default.',
    sections: [
      ['Zero Session Replay Tracking by Default', 'TravelSphere strictly enforces a zero-session-replay recording policy by default. Your keystrokes, form entries, pointer paths, and screen interactions are never recorded, streamed, or sold to third-party behavioral replay vendors.'],
      ['CCPA / CPRA Notice at Collection & Do Not Sell', 'Under the California Consumer Privacy Act (CCPA/CPRA), California residents have the explicit right to opt out of the sale or sharing of their personal information. TravelSphere does not sell personal information for monetary or other consideration.'],
      ['Consumer Rights (Access, Correction, Deletion)', 'You retain full control over your personal data. You may request disclosure of data collected, request rectification of inaccurate records, or request complete deletion ("Right to be Forgotten") at any time through our Support center or Account settings.'],
      ['Data Minimization & Encryption', 'We adhere to strict data minimization principles. Personal information collected is restricted strictly to what is necessary to coordinate your travel bookings, issue confirmed tickets, and facilitate communication.'],
      ['Security Safeguards', 'We enforce industry-standard technical safeguards: HTTPS encryption in transit, strict Content Security Policies (CSP), password hashing (SHA-256 / bcrypt), and role-based access control (RBAC).']
    ]
  }
};

export default function LegalPage({ type = 'terms' }) {
  usePageTitle(type === 'privacy' ? 'Privacy Policy & CCPA Rights' : 'Terms of Service');
  const content = CONTENT[type] || CONTENT.terms;
  const [prefs, setPrefs] = useState(() => getPrivacyPreferences());
  const [savedNotice, setSavedNotice] = useState(false);

  const togglePreference = (key) => {
    const updated = savePrivacyPreferences({ [key]: !prefs[key] });
    setPrefs(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="legal-page">
      <div className="legal-wrap">
        <span className="legal-eyebrow">{content.label}</span>
        <h1>{content.title}</h1>
        <p className="legal-intro">{content.intro}</p>
        <div className="legal-updated">Last updated · November 2026</div>

        {type === 'privacy' && (
          <div className="privacy-controls-card">
            <h3>Your CCPA & Privacy Preferences</h3>
            <p>Manage your privacy options below. Changes take effect immediately on this browser.</p>

            <div className="privacy-toggle-list">
              <div className="privacy-toggle-item">
                <div>
                  <strong>Do Not Sell or Share My Personal Information (CCPA)</strong>
                  <small>Enforces strict opt-out of third-party personal data sharing or advertising.</small>
                </div>
                <button
                  type="button"
                  className={`privacy-toggle-btn ${prefs.doNotSellOrShare ? 'active' : ''}`}
                  onClick={() => togglePreference('doNotSellOrShare')}
                  aria-pressed={prefs.doNotSellOrShare}
                >
                  {prefs.doNotSellOrShare ? 'Opted Out (Active)' : 'Allow Sharing'}
                </button>
              </div>

              <div className="privacy-toggle-item">
                <div>
                  <strong>Session Replay & Interaction Recording</strong>
                  <small>Disabled by default. Prevents recording of user interactions and form sessions.</small>
                </div>
                <button
                  type="button"
                  className={`privacy-toggle-btn ${!prefs.sessionReplayEnabled ? 'active' : ''}`}
                  onClick={() => togglePreference('sessionReplayEnabled')}
                  aria-pressed={!prefs.sessionReplayEnabled}
                >
                  {!prefs.sessionReplayEnabled ? 'Disabled (Protected)' : 'Enabled'}
                </button>
              </div>
            </div>

            {savedNotice && <div className="privacy-save-alert">Privacy preferences updated and saved.</div>}
          </div>
        )}

        <div className="legal-sections">
          {content.sections.map(([heading, text]) => (
            <section key={heading}>
              <h2>{heading}</h2>
              <p>{text}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
