import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  RotateCcw, 
  ArrowLeft, 
  CheckCircle2, 
  Hand, 
  Volume2, 
  VolumeX, 
  Printer, 
  Download, 
  CreditCard, 
  User, 
  ShieldCheck, 
  Award, 
  Coffee, 
  Wifi, 
  Luggage,
  X
} from 'lucide-react';
import TearTicket from '../../../components/common/TearTicket';
import { TicketBoardingPassBody, TicketBoardingPassStub } from '../../../components/common/TicketBoardingPass';
import { useAuth } from '../../../context/useAuth';
import usePageTitle from '../../../hooks/usePageTitle';
import './TicketShowcase.css';

const TICKET_PRESETS = [
  {
    id: 'swiss',
    tabName: '🚆 Swiss Alps Rail',
    transportType: 'train',
    title: 'Swiss Alps Glacier Express',
    carrier: 'GLACIER PANORAMA RAIL',
    classType: 'FIRST CLASS PANORAMA',
    image: '/destination-images/swiss-alps.webp',
    imageAlt: 'Swiss Alps Glacier Express',
    fromCode: 'ZMT',
    fromCity: 'Zermatt, CH',
    toCode: 'SMT',
    toCity: 'St. Moritz, CH',
    date: '18 Nov 2026',
    time: '08:30 AM CET',
    gate: 'Track 3',
    seat: 'Car 02 · 04A (Window)',
    pnr: 'TS-GLACIER-8821',
    accentColor: '#d97706',
    background: '#18181b',
    perks: [
      { icon: Coffee, text: '3-Course Alpine Gastronomy with Pairing' },
      { icon: Wifi, text: 'Complimentary Starlink Panoramic Wi-Fi' },
      { icon: Luggage, text: 'Door-to-door Porter Luggage Transfer' },
      { icon: Award, text: 'Priority First-Class Observation Lounge' }
    ]
  },
  {
    id: 'kyoto',
    tabName: '🚄 Kyoto Shinkansen',
    transportType: 'train',
    title: 'Kyoto Sakura Express',
    carrier: 'JR CENTRAL · NOZOMI 501',
    classType: 'GRAN CLASS VIP',
    image: '/destination-images/kyoto.webp',
    imageAlt: 'Kyoto Traditional Pagoda & Gardens',
    fromCode: 'TYO',
    fromCity: 'Tokyo Station',
    toCode: 'KYO',
    toCity: 'Kyoto Station',
    date: '22 Nov 2026',
    time: '07:15 AM JST',
    gate: 'Platform 14',
    seat: 'Car 07 · 11E (Reserved)',
    pnr: 'TS-NOZOMI-9204',
    accentColor: '#f43f5e',
    background: '#1c1917',
    perks: [
      { icon: Coffee, text: 'Seasonal Kaiseki Bento & Ceremonial Matcha' },
      { icon: Wifi, text: 'Private Noise-Cancelling Audio Suite' },
      { icon: Award, text: 'Direct Bullet Train Platform Escort' },
      { icon: ShieldCheck, text: '100% Punctuality Guarantee with Shinkansen' }
    ]
  },
  {
    id: 'maldives',
    tabName: '🏝️ Maldives Seaplane',
    transportType: 'plane',
    title: 'Trans-Maldivian Seaplane',
    carrier: 'TRAVELSPHERE OCEAN WINGS',
    classType: 'VIP LAGOON TRANSFER',
    image: '/destination-images/maldives.webp',
    imageAlt: 'Maldives Turquoise Atoll Lagoon',
    fromCode: 'MLE',
    fromCity: 'Male Velana Intl',
    toCode: 'BAA',
    toCity: 'Baa Atoll Lagoon',
    date: '28 Nov 2026',
    time: '10:45 AM MVT',
    gate: 'Dock B',
    seat: 'Seat 01A (Cockpit View)',
    pnr: 'TS-SEAPLANE-408',
    accentColor: '#06b6d4',
    background: '#0f172a',
    perks: [
      { icon: Coffee, text: 'Chilled Champagne & Tropical Fruit Welcome' },
      { icon: Award, text: 'Direct Water-Villa Jet Jetty Dropoff' },
      { icon: Luggage, text: 'Fast-Track Customs & Seaplane Lounge Access' },
      { icon: ShieldCheck, text: 'Twin-Otter Amphibian Scenic Flight Guarantee' }
    ]
  },
  {
    id: 'spectrum',
    tabName: '🎨 Spectrum Art VIP',
    transportType: 'art',
    title: 'Spectrum: Prism of Color',
    carrier: 'ROOFTOP SKY GALLERY',
    classType: 'ALL-ACCESS VIP PREVIEW',
    image: '/spectrum.jpg',
    imageAlt: 'Visitors in a walkway of coloured glass',
    fromCode: '',
    fromCity: '',
    toCode: '',
    toCity: '',
    subtitle: 'Curated Immersive Coloured Glass Walkway',
    date: 'Valid Until 30 Nov 2026',
    time: 'Anytime Priority Access',
    gate: 'Elevator 4',
    seat: 'Admit One VIP',
    pnr: 'No. 284619',
    accentColor: '#a855f7',
    background: '#27272a',
    perks: [
      { icon: Award, text: 'Private After-Hours Sky Gallery Access' },
      { icon: Coffee, text: 'Complimentary Rooftop Champagne Terrace' },
      { icon: ShieldCheck, text: 'Curator Signed Limited-Edition Monograph' },
      { icon: Wifi, text: 'Bespoke Augmented-Reality Spatial Audio Guide' }
    ]
  }
];

export default function TicketShowcase() {
  usePageTitle('Interactive VIP Passes & Tickets');
  const { user } = useAuth();

  const [activePresetId, setActivePresetId] = useState('swiss');
  const [passengerName, setPassengerName] = useState(user?.name || 'Alexander Wright');
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [tornTickets, setTornTickets] = useState({});
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [verificationTime, setVerificationTime] = useState({});

  const activeTicket = useMemo(() => {
    return TICKET_PRESETS.find(p => p.id === activePresetId) || TICKET_PRESETS[0];
  }, [activePresetId]);

  const isCurrentTorn = Boolean(tornTickets[activePresetId]);

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#a3704c', '#e2b17a', '#38bdf8', '#4ade80', '#fbbf24']
    });
  }, []);

  const handleTear = useCallback((ticketId) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTornTickets(prev => ({ ...prev, [ticketId]: true }));
    setVerificationTime(prev => ({ ...prev, [ticketId]: nowStr }));
    fireConfetti();
  }, [fireConfetti]);

  const resetActiveTicket = useCallback(() => {
    setTornTickets(prev => ({ ...prev, [activePresetId]: false }));
  }, [activePresetId]);

  const resetAllTickets = useCallback(() => {
    setTornTickets({});
    setVerificationTime({});
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="ticket-showcase-page">
      <div className="ticket-showcase-container">
        {/* HEADER BLOCK */}
        <header className="ticket-header-block">
          <div className="ticket-tag">
            <Sparkles size={14} /> Interactive VIP Boarding Experience
          </div>
          <h1>Interactive Boarding & Event Passes</h1>
          <p>
            Experience procedural paper physics, 3D tilt perspective, and instant verification.
            Grab the perforated stub on the right and pull to detach your travel pass.
          </p>

          {/* PASSENGER NAME CUSTOMIZER & SOUND TOGGLE */}
          <div className="ticket-customizer-bar">
            <div className="customizer-field">
              <User size={15} className="field-icon" />
              <label htmlFor="passenger-input">Traveler Name:</label>
              <input
                id="passenger-input"
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="Enter traveler name..."
                maxLength={32}
              />
            </div>

            <button
              type="button"
              className={`btn-sound-toggle ${isSoundOn ? 'active' : ''}`}
              onClick={() => setIsSoundOn(!isSoundOn)}
              title={isSoundOn ? 'Sound Effects Enabled (Click to Mute)' : 'Sound Effects Muted (Click to Unmute)'}
            >
              {isSoundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{isSoundOn ? 'Paper SFX: On' : 'Paper SFX: Off'}</span>
            </button>
          </div>

          {/* PRESET CATEGORY SELECTOR TABS */}
          <div className="ticket-tabs-row" role="tablist">
            {TICKET_PRESETS.map((preset) => {
              const torn = Boolean(tornTickets[preset.id]);
              const isActive = preset.id === activePresetId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`ticket-nav-tab ${isActive ? 'active' : ''} ${torn ? 'tab-torn' : ''}`}
                  onClick={() => setActivePresetId(preset.id)}
                >
                  <span>{preset.tabName}</span>
                  {torn && <span className="tab-torn-dot" title="Stub torn" />}
                </button>
              );
            })}
          </div>
        </header>

        {/* HERO INTERACTIVE STAGE */}
        <div className="ticket-hero-stage">
          {/* STATUS LABEL BAR */}
          <div className="ticket-status-ribbon">
            <div className="ribbon-left">
              <span className="ribbon-carrier">{activeTicket.carrier}</span>
              <span className="ribbon-dot">•</span>
              <span className="ribbon-category">{activeTicket.title}</span>
            </div>

            <div className={`ticket-status-pill ${isCurrentTorn ? 'torn' : 'intact'}`}>
              {isCurrentTorn ? (
                <>
                  <CheckCircle2 size={14} /> BOARDED & VERIFIED ({verificationTime[activePresetId] || 'Just now'})
                </>
              ) : (
                <>
                  <Hand size={14} className="hand-icon-bounce" /> DRAG STUB TO TEAR OFF
                </>
              )}
            </div>
          </div>

          {/* TEAR TICKET COMPONENT CONTAINER */}
          <div className="ticket-canvas-frame">
            <TearTicket
              key={`${activeTicket.id}-${isCurrentTorn}`}
              image={activeTicket.image}
              imageAlt={activeTicket.imageAlt}
              stub={
                <TicketBoardingPassStub
                  ticket={activeTicket}
                  passengerName={passengerName || 'Alexander Wright'}
                  isTorn={isCurrentTorn}
                />
              }
              orientation="horizontal"
              scrim
              imageRadius={8}
              onTear={() => handleTear(activeTicket.id)}
              torn={isCurrentTorn}
              sound={isSoundOn}
              width={480}
              height={260}
              stubSize={160}
              radius={16}
              holes={13}
              holeSize={6}
              notch={3}
              roughness={0}
              tearAngle={30}
              stretch={30}
              resistance={0.45}
              rotate={4}
              tilt
              tiltMax={9}
              tiltReach={260}
              parallax={6}
              perspective={1000}
              background={activeTicket.background}
              color="#fbf9f5"
              border
              borderWidth={1}
              recenter
            >
              <TicketBoardingPassBody
                ticket={activeTicket}
                passengerName={passengerName || 'Alexander Wright'}
                isTorn={isCurrentTorn}
              />
            </TearTicket>
          </div>

          {/* QUICK CONTROLS BAR */}
          <div className="ticket-controls-panel">
            <div className="controls-left">
              <button
                type="button"
                className="control-btn"
                onClick={resetActiveTicket}
                disabled={!isCurrentTorn}
                title="Re-attach the stub back onto this ticket"
              >
                <RotateCcw size={15} /> Re-attach Stub
              </button>

              <button
                type="button"
                className="control-btn secondary"
                onClick={resetAllTickets}
                title="Reset all passes back to fresh intact condition"
              >
                Reset All Passes
              </button>
            </div>

            <div className="controls-right">
              <button
                type="button"
                className="control-btn accent"
                onClick={() => setShowWalletModal(true)}
              >
                <CreditCard size={15} /> Add to Wallet
              </button>

              <button
                type="button"
                className="control-btn"
                onClick={handlePrint}
                title="Print ticket pass"
              >
                <Printer size={15} /> Print Pass
              </button>

              <Link to="/user-dashboard" className="control-btn outline">
                <ArrowLeft size={15} /> Dashboard
              </Link>
            </div>
          </div>

          {/* VERIFICATION CELEBRATION BOX (WHEN TORN) */}
          {isCurrentTorn && (
            <div className="ticket-verified-card">
              <div className="verified-card-header">
                <div className="verified-icon-circle">
                  <CheckCircle2 size={24} color="#22c55e" />
                </div>
                <div>
                  <h3>Boarding Verified & Stub Detached</h3>
                  <p>
                    Verified at {verificationTime[activePresetId]} · Security Hash: {activeTicket.pnr}
                  </p>
                </div>
              </div>

              <div className="verified-perks-grid">
                {activeTicket.perks.map((perk, i) => {
                  const PerkIcon = perk.icon;
                  return (
                    <div key={i} className="verified-perk-item">
                      <div className="perk-icon-wrap" style={{ color: activeTicket.accentColor }}>
                        <PerkIcon size={16} />
                      </div>
                      <span>{perk.text}</span>
                    </div>
                  );
                })}
              </div>

              <div className="verified-card-actions">
                <button type="button" className="btn-pass-download" onClick={handlePrint}>
                  <Download size={15} /> Download Official Boarding Receipt
                </button>
                <Link to="/packages" className="btn-pass-explore">
                  Explore More Excursions →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ALL PASSES GALLERY GRID */}
        <section className="all-passes-section">
          <div className="section-title-wrap">
            <h2>All Available Travel & Event Passes</h2>
            <p>Select any pass above or click below to interact with each distinctive itinerary ticket</p>
          </div>

          <div className="passes-mini-grid">
            {TICKET_PRESETS.map((item) => {
              const isSelected = item.id === activePresetId;
              const isTorn = Boolean(tornTickets[item.id]);
              return (
                <div 
                  key={item.id}
                  className={`pass-mini-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setActivePresetId(item.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="mini-card-thumb">
                    <img src={item.image} alt={item.title} />
                    <span className="mini-tag" style={{ background: item.accentColor }}>
                      {item.carrier}
                    </span>
                  </div>
                  <div className="mini-card-info">
                    <h4>{item.title}</h4>
                    <p>{item.fromCode ? `${item.fromCode} ➔ ${item.toCode} · ${item.seat}` : `${item.gate} · ${item.seat}`}</p>
                    <div className="mini-card-status">
                      {isTorn ? (
                        <span className="status-torn-label"><CheckCircle2 size={12} /> Stub Torn</span>
                      ) : (
                        <span className="status-ready-label">Intact · Ready to Tear</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* DIGITAL WALLET MODAL */}
        {showWalletModal && (
          <div className="wallet-modal-backdrop" onClick={() => setShowWalletModal(false)}>
            <div className="wallet-modal-card" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button" 
                className="wallet-close-btn"
                onClick={() => setShowWalletModal(false)}
                aria-label="Close wallet preview"
              >
                <X size={18} />
              </button>

              <div className="wallet-header">
                <div className="wallet-badge">Apple & Google Wallet Ready</div>
                <h3>{activeTicket.title}</h3>
                <p>Pass added to your digital devices with NFC touchless boarding</p>
              </div>

              <div className="wallet-pass-preview" style={{ background: activeTicket.background }}>
                <div className="wp-header">
                  <span>{activeTicket.carrier}</span>
                  <span className="wp-class">{activeTicket.classType}</span>
                </div>
                <div className="wp-route">
                  <div>
                    <span className="wp-code">{activeTicket.fromCode || 'ROOF'}</span>
                    <span className="wp-city">{activeTicket.fromCity || 'Sky Pavilions'}</span>
                  </div>
                  <div className="wp-plane">➔</div>
                  <div>
                    <span className="wp-code">{activeTicket.toCode || 'VIP'}</span>
                    <span className="wp-city">{activeTicket.toCity || 'VIP Preview'}</span>
                  </div>
                </div>
                <div className="wp-details">
                  <div>
                    <span className="wp-lbl">TRAVELER</span>
                    <span className="wp-val">{passengerName || 'Alexander Wright'}</span>
                  </div>
                  <div>
                    <span className="wp-lbl">DATE</span>
                    <span className="wp-val">{activeTicket.date}</span>
                  </div>
                  <div>
                    <span className="wp-lbl">SEAT</span>
                    <span className="wp-val">{activeTicket.seat}</span>
                  </div>
                </div>
                <div className="wp-barcode">
                  <div className="wp-barcode-mock" />
                  <span>{activeTicket.pnr}</span>
                </div>
              </div>

              <div className="wallet-actions">
                <button
                  type="button"
                  className="btn-apple-wallet"
                  onClick={() => {
                    alert(`✓ Pass for "${activeTicket.title}" synchronized with Apple Wallet!`);
                    setShowWalletModal(false);
                  }}
                >
                  Add to Apple Wallet
                </button>
                <button
                  type="button"
                  className="btn-google-wallet"
                  onClick={() => {
                    alert(`✓ Pass for "${activeTicket.title}" synchronized with Google Wallet!`);
                    setShowWalletModal(false);
                  }}
                >
                  Save to Google Wallet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
