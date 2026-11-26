import { useState, useTransition } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Compass,
  CreditCard,
  FileDown,
  Globe,
  Heart,
  MapPin,
  Share2,
  Sparkles,
  Users,
  Utensils,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { DESTINATIONS } from '../../../data/destinations';
import generateItinerary from '../../../utils/aiItineraryEngine';
import { generateBookingPDF } from '../../../utils/pdfVoucher';
import { useAuth } from '../../../context/useAuth';
import api from '../../../services/api';
import usePageTitle from '../../../hooks/usePageTitle';
import { useCurrency } from '../../../context/useCurrency';
import CheckoutModal from '../../../components/common/CheckoutModal/CheckoutModal';
import './ItineraryPlanner.css';

const VIBE_OPTIONS = [
  {
    id: 'Wellness & Slow Living',
    label: 'Slow mornings & still waters',
    detail: 'Quiet views, local flavours, and unhurried time to breathe',
    image: '/destination-images/kerala.webp',
    suggestedDest: 'kerala',
    badge: '01 · Slow Living',
    icon: '🌅'
  },
  {
    id: 'Culture & Heritage',
    label: 'Culture, colour & city energy',
    detail: 'Markets, heritage temples, cafés, and stories around every corner',
    image: '/destination-images/kyoto.webp',
    suggestedDest: 'kyoto',
    badge: '02 · Culture',
    icon: '🏛️'
  },
  {
    id: 'Adventure & Scenic Nature',
    label: 'Mountains, trails & open skies',
    detail: 'Fresh alpine air, dramatic peaks, and room to roam',
    image: '/destination-images/swiss-alps.webp',
    suggestedDest: 'swiss-alps',
    badge: '03 · Nature',
    icon: '🏔️'
  },
  {
    id: 'Romance & Couples Retreat',
    label: 'A romantic change of scene',
    detail: 'Unhurried days, cliffside sunsets, and intimate moments for two',
    image: '/destination-images/santorini.webp',
    suggestedDest: 'santorini',
    badge: '04 · Romance',
    icon: '🍷'
  },
  {
    id: 'Family Discovery & Leisure',
    label: 'Tropical calm & azure waters',
    detail: 'Private overwater retreats, gentle reefs, and warm ocean breezes',
    image: '/destination-images/maldives.webp',
    suggestedDest: 'maldives',
    badge: '05 · Coastal',
    icon: '🏝️'
  }
];

const PARTY_OPTIONS = [
  {
    count: 1,
    label: 'A reset for one',
    detail: 'Space to slow down, wander, and come back to yourself',
    icon: '🧭'
  },
  {
    count: 2,
    label: 'Just the two of us',
    detail: 'A shared story with plenty of time for each other',
    icon: '🥂'
  },
  {
    count: 4,
    label: 'Our family, all together',
    detail: 'Easy days, thoughtful pacing, and room for everyone',
    icon: '👨‍👩‍👧‍👦'
  },
  {
    count: 6,
    label: 'Group of favourite friends',
    detail: 'More laughter, flexible plans, and memories to share',
    icon: '✨'
  }
];

const BUDGET_OPTIONS = [
  {
    id: 'budget',
    label: 'Thoughtful value',
    detail: 'Spend wisely while keeping the best experiences · Boutique hostels & local transit',
    badge: 'Smart Value ($)'
  },
  {
    id: 'moderate',
    label: 'Comfort with character',
    detail: 'Handpicked stays and details that make travel easy · 4-star boutique hotels & scenic rail',
    badge: 'Comfort ($$)'
  },
  {
    id: 'luxury',
    label: 'Indulgent luxury',
    detail: 'Exceptional stays, seamless service, and no compromises · 5-star private retreats & chauffeurs',
    badge: 'Luxury ($$$)'
  }
];

export default function ItineraryPlanner() {
  usePageTitle('AI Trip Planner & Studio | TravelSphere');
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  // Wizard state
  const [selectedDestId, setSelectedDestId] = useState('kyoto');
  const [originCity, setOriginCity] = useState('New York, JFK');
  const [durationDays, setDurationDays] = useState(5);
  const [vibe, setVibe] = useState('Culture & Heritage');
  const [budgetTier, setBudgetTier] = useState('moderate');
  const [travelers, setTravelers] = useState(2);

  // Group split state
  const [splitCount, setSplitCount] = useState(2);
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  // Generated Result state
  const [itinerary, setItinerary] = useState(() => {
    return generateItinerary({
      destinationId: 'kyoto',
      destinationName: 'Kyoto, Japan',
      origin: 'New York, JFK',
      durationDays: 5,
      vibe: 'Culture & Heritage',
      budgetTier: 'moderate',
      travelers: 2
    });
  });

  const handleSelectVibe = (vibeItem) => {
    setVibe(vibeItem.id);
    if (vibeItem.suggestedDest) {
      setSelectedDestId(vibeItem.suggestedDest);
    }
  };

  const handleSelectParty = (option) => {
    setTravelers(option.count);
    setSplitCount(option.count);
  };

  const handleGenerate = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const dest = DESTINATIONS.find(d => d.id === selectedDestId) || { name: 'Kyoto', country: 'Japan' };

    startTransition(() => {
      const result = generateItinerary({
        destinationId: selectedDestId,
        destinationName: dest.country ? `${dest.name}, ${dest.country}` : dest.name,
        origin: originCity,
        durationDays: Number(durationDays),
        vibe,
        budgetTier,
        travelers: Number(travelers)
      });
      setItinerary(result);
      setSplitCount(Number(travelers));
    });

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // confetti fallback
    }
  };

  const handleSaveToAccount = async () => {
    try {
      const existing = JSON.parse(localStorage.getItem('ts_saved_itineraries') || '[]');
      const updated = [itinerary, ...existing.filter(i => i.id !== itinerary.id)];
      localStorage.setItem('ts_saved_itineraries', JSON.stringify(updated));

      if (user) {
        try {
          await api.post('/trip-plans', {
            userId: user.id || user.user_id,
            destinationId: 1,
            title: `${itinerary.durationDays}-Day ${itinerary.vibe} (${itinerary.destinationName})`,
            startDate: '2026-11-10',
            endDate: `2026-11-${10 + (Number(itinerary.durationDays) || 5)}`,
            budget: itinerary.costs?.total || 1500,
            itineraryData: JSON.stringify(itinerary)
          });
        } catch (apiErr) {
          console.warn('Trip plan backend save error (persisted locally):', apiErr);
        }
      }

      setSavedSuccessMsg(`Saved "${itinerary.destinationName}" itinerary to your account!`);
      setTimeout(() => setSavedSuccessMsg(''), 4000);
    } catch {
      setSavedSuccessMsg('Itinerary saved locally on your device.');
    }
  };

  const handleDownloadPDF = () => {
    generateBookingPDF({
      id: itinerary.id,
      title: `${itinerary.durationDays}-Day ${itinerary.vibe} (${itinerary.destinationName})`,
      amount: itinerary.costs.total,
      status: 'AI ITINERARY VERIFIED',
      startDate: '2026-11-10',
      endDate: `2026-11-${10 + itinerary.durationDays}`,
      guests: itinerary.travelers,
      origin: itinerary.origin,
      destination: itinerary.destinationName,
      hotel: itinerary.hotel.name,
      transport: itinerary.days[0]?.transit || 'Executive Rail & Private Transfer',
      guestName: user?.name || 'Verified Traveler',
      email: user?.email || 'traveler@travelsphere.com'
    });
  };

  const handleShareLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const currentDest = DESTINATIONS.find(d => d.id === selectedDestId) || { name: 'Kyoto', country: 'Japan', image: '/destination-images/kyoto.webp' };

  const checkoutDetails = itinerary ? {
    id: itinerary.id || 'TS-PLAN-CUSTOM',
    packageId: itinerary.id || 'TS-PLAN-CUSTOM',
    title: `${itinerary.durationDays}-Day ${itinerary.vibe} (${itinerary.destinationName})`,
    type: 'package',
    subtotal: itinerary.costs?.total || 1500,
    price: Math.round((itinerary.costs?.total || 1500) / (itinerary.travelers || 2)),
    image: currentDest.image || '/destination-images/kyoto.webp',
    destination: itinerary.destinationName,
    days: itinerary.durationDays,
    nights: itinerary.durationNights,
    hotel: itinerary.hotel?.name,
    guests: itinerary.travelers,
    travelersCount: itinerary.travelers,
    startDate: '2026-11-10',
    endDate: `2026-11-${10 + Number(itinerary.durationDays)}`
  } : null;

  return (
    <div className="itinerary-planner-page">
      <section className="itinerary-hero">
        <div className="itinerary-badge">
          <Sparkles size={16} /> 2026 Unified AI Trip Studio & Planner
        </div>
        <h1>Design your <em>perfect journey</em> in seconds.</h1>
        <p>
          State-of-the-art travel synthesis: choose your mood, customize party and comfort levels, 
          and receive tailored day-by-day itineraries with matched boutique stays, scenic transit, 
          and instant group expense splitting.
        </p>

        {/* Wizard Form */}
        <form className="itinerary-card-wizard" onSubmit={handleGenerate}>
          {/* Step 1: Feeling & Vibe */}
          <div className="wizard-step-section">
            <div className="wizard-step-heading">
              <span className="wizard-step-num">01</span>
              <div>
                <h3>Choose your feeling & escape vibe</h3>
                <p>Select what kind of escape sounds like you right now</p>
              </div>
            </div>

            <div className="vibe-visual-grid">
              {VIBE_OPTIONS.map((v) => {
                const isSelected = vibe === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    className={`vibe-visual-card ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectVibe(v)}
                    style={{ backgroundImage: `url("${v.image}")` }}
                  >
                    <div className="vibe-visual-scrim" />
                    <div className="vibe-visual-content">
                      <div className="vibe-card-top-row">
                        <span className="vibe-tag-badge">{v.badge}</span>
                        {isSelected && (
                          <span className="vibe-check-circle" aria-label="Selected">
                            <Check size={14} />
                          </span>
                        )}
                      </div>
                      <h4 className="vibe-card-title">{v.label}</h4>
                      <p className="vibe-card-detail">{v.detail}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Destination, Hub & Duration */}
          <div className="wizard-step-section">
            <div className="wizard-step-heading">
              <span className="wizard-step-num">02</span>
              <div>
                <h3>Destination & travel parameters</h3>
                <p>Where are you heading, departing from, and for how long?</p>
              </div>
            </div>

            <div className="wizard-grid-inputs">
              {/* Destination */}
              <div className="wizard-field-group">
                <label><MapPin size={14} /> Destination</label>
                <select
                  className="wizard-select"
                  value={selectedDestId}
                  onChange={(e) => setSelectedDestId(e.target.value)}
                >
                  {DESTINATIONS.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.country})
                    </option>
                  ))}
                </select>
              </div>

              {/* Origin Hub */}
              <div className="wizard-field-group">
                <label><Globe size={14} /> Departure Hub</label>
                <input
                  type="text"
                  className="wizard-input"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  placeholder="e.g. New York, London, Delhi"
                  required
                />
              </div>

              {/* Duration */}
              <div className="wizard-field-group">
                <label><Calendar size={14} /> Duration</label>
                <select
                  className="wizard-select"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                >
                  <option value={3}>3 Days (Weekend Escape)</option>
                  <option value={5}>5 Days (Classic Journey)</option>
                  <option value={7}>7 Days (Full Explorer)</option>
                  <option value={10}>10 Days (Grand Immersion)</option>
                  <option value={14}>14 Days (Signature Expedition)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Company / Party */}
          <div className="wizard-step-section">
            <div className="wizard-step-heading">
              <span className="wizard-step-num">03</span>
              <div>
                <h3>Who is this journey for?</h3>
                <p>Tell us about your company and travel rhythm</p>
              </div>
            </div>

            <div className="party-cards-grid">
              {PARTY_OPTIONS.map((p) => {
                const isSelected = travelers === p.count;
                return (
                  <button
                    key={p.count}
                    type="button"
                    className={`party-card ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectParty(p)}
                  >
                    <div className="party-card-icon">{p.icon}</div>
                    <div className="party-card-info">
                      <h4>{p.label}</h4>
                      <small>{p.detail}</small>
                    </div>
                    {isSelected && (
                      <span className="party-check"><Check size={14} /></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Comfort Level & Budget Tier */}
          <div className="wizard-step-section">
            <div className="wizard-step-heading">
              <span className="wizard-step-num">04</span>
              <div>
                <h3>Set your comfort level</h3>
                <p>How would you like your stays and experiences to feel?</p>
              </div>
            </div>

            <div className="comfort-cards-grid">
              {BUDGET_OPTIONS.map((b) => {
                const isSelected = budgetTier === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    className={`comfort-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setBudgetTier(b.id)}
                  >
                    <div className="comfort-card-top">
                      <span className="comfort-tier-badge">{b.badge}</span>
                      {isSelected && <Check size={14} className="comfort-check" />}
                    </div>
                    <h4>{b.label}</h4>
                    <p>{b.detail}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="wizard-cta-row">
            <button type="submit" className="btn-generate-ai" disabled={isPending}>
              <Sparkles size={18} /> {isPending ? 'Synthesizing Studio Itinerary...' : 'Synthesize Custom Itinerary'}
            </button>
          </div>
        </form>
      </section>

      {/* Generated Itinerary Output */}
      {itinerary && (
        <section className="itinerary-results-container">
          {savedSuccessMsg && (
            <div className="itinerary-alert-success">
              <CheckCircle size={18} /> {savedSuccessMsg}
            </div>
          )}

          {bookingSuccessData && (
            <div className="itinerary-alert-booking-success">
              <ShieldCheck size={20} />
              <div>
                <strong>Reservation Confirmed! Reference #{bookingSuccessData.bookingId || bookingSuccessData.id}</strong>
                <p>Your custom trip has been booked. You can view it anytime under Bookings in your dashboard.</p>
              </div>
            </div>
          )}

          {/* Overview Header Card */}
          <div className="itinerary-overview-header">
            <div className="overview-title-block">
              <span className="overview-reference">
                TRAVELSPHERE AI STUDIO · #{itinerary.id}
              </span>
              <h2>{itinerary.durationDays}-Day {itinerary.destinationName} Experience</h2>
              <p className="overview-subtext">
                Departing from {itinerary.origin} • Paired with <strong>{itinerary.hotel.name}</strong>
              </p>
              <div className="overview-meta-chips">
                <span className="meta-chip"><Clock size={12} /> {itinerary.durationDays} Days / {itinerary.durationNights} Nights</span>
                <span className="meta-chip"><Compass size={12} /> {itinerary.vibe}</span>
                <span className="meta-chip"><Users size={12} /> {itinerary.travelers} {itinerary.travelers === 1 ? 'Guest' : 'Guests'}</span>
                <span className="meta-chip green">
                  🌱 {itinerary.meta.sustainabilityScore}
                </span>
              </div>
            </div>

            <div className="overview-price-block">
              <div className="overview-total-price">{formatPrice(itinerary.costs.total)}</div>
              <div className="overview-per-person">
                ~{formatPrice(itinerary.costs.perPerson)} per person (all-inclusive estimate)
              </div>
            </div>
          </div>

          {/* Matched Studio Stay & Highlights Card */}
          <div className="studio-matched-card">
            <div
              className="studio-matched-img"
              style={{ backgroundImage: `url("${currentDest.image || '/destination-images/kyoto.webp'}")` }}
            >
              <span className="studio-matched-dest-tag">{itinerary.destinationName}</span>
            </div>
            <div className="studio-matched-content">
              <div className="studio-matched-kicker">
                <Sparkles size={13} /> CURATED MATCH FOR YOUR TRAVEL RHYTHM
              </div>
              <h3 className="studio-matched-hotel-title">{itinerary.hotel.name}</h3>
              <p className="studio-matched-reason">
                Handpicked based on your selected vibe ({itinerary.vibe}) and comfort level. Seamlessly integrates
                with your daily transit passes, morning highlights, and culinary discoveries.
              </p>
              <div className="studio-matched-inclusions">
                <span><Check size={13} /> {itinerary.hotel.name} Boutique Stay</span>
                <span><Check size={13} /> Curated Local Food & Walk</span>
                <span><Check size={13} /> Private Transit & Rail Integration</span>
                <span><Check size={13} /> 24/7 TravelSphere Specialist Support</span>
              </div>
            </div>
          </div>

          {/* Day by Day Stack */}
          <div className="days-timeline-stack">
            <div className="timeline-section-title">
              <h3>Day-by-Day Customized Schedule</h3>
              <p>Meticulously paced morning, afternoon, and evening experiences</p>
            </div>

            {itinerary.days.map(d => (
              <div className="day-card" key={d.day}>
                <div className="day-card-header">
                  <span className="day-card-title">{d.title}</span>
                  <span className="day-est-cost">Est. {formatPrice(d.dailyCostEst)} / day</span>
                </div>

                <div className="day-schedule-body">
                  <div className="slot-item">
                    <div className="slot-icon">🌅</div>
                    <div className="slot-content">
                      <h4>Morning Highlight</h4>
                      <p>{d.morning}</p>
                    </div>
                  </div>

                  <div className="slot-item">
                    <div className="slot-icon">☀️</div>
                    <div className="slot-content">
                      <h4>Afternoon Exploration</h4>
                      <p>{d.afternoon}</p>
                    </div>
                  </div>

                  <div className="slot-item">
                    <div className="slot-icon">🌙</div>
                    <div className="slot-content">
                      <h4>Evening & Dining</h4>
                      <p>{d.evening}</p>
                    </div>
                  </div>
                </div>

                <div className="day-card-footer">
                  <span>🚆 <strong>Transit:</strong> {d.transit}</span>
                  <span><Utensils size={13} style={{ display: 'inline', marginRight: 4 }} /> <strong>Local Bite:</strong> {d.dining}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Split Payment Calculator & Export Actions */}
          <div className="itinerary-actions-panel">
            <h3 className="actions-panel-title">
              Split Group Payment & Direct Actions
            </h3>
            <p className="actions-panel-desc">
              Planning with friends, family, or solo? Calculate individual shares, reserve the complete itinerary, 
              or download the official boarding voucher.
            </p>

            <div className="split-calculator-box">
              <div className="split-selector-wrap">
                <Users size={20} color="#a3704c" />
                <label className="split-label">
                  Split between:
                  <select
                    value={splitCount}
                    onChange={(e) => setSplitCount(Number(e.target.value))}
                    className="split-select"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="split-numbers">
                <div className="split-stat">
                  <span>Each Person Pays:</span>
                  <strong>{formatPrice(Math.round(itinerary.costs.total / splitCount))}</strong>
                </div>
                <div className="split-stat">
                  <span>Total Package:</span>
                  <strong>{formatPrice(itinerary.costs.total)}</strong>
                </div>
              </div>
            </div>

            <div className="itinerary-btns-row">
              <button
                type="button"
                className="btn-book-primary"
                onClick={() => setShowCheckoutModal(true)}
              >
                <CreditCard size={17} /> Book & Reserve This Trip <ArrowRight size={15} />
              </button>

              <button
                type="button"
                className="btn-voucher-outline"
                onClick={handleDownloadPDF}
              >
                <FileDown size={16} /> Download Voucher (PDF)
              </button>

              <button
                type="button"
                className="btn-voucher-outline"
                onClick={handleSaveToAccount}
              >
                <Heart size={16} /> Save Itinerary
              </button>

              <button
                type="button"
                className="btn-voucher-outline"
                onClick={handleShareLink}
              >
                <Share2 size={16} /> {copiedLink ? 'Link Copied! ✓' : 'Share Itinerary'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Real Checkout Modal Integration */}
      {showCheckoutModal && checkoutDetails && (
        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          bookingDetails={checkoutDetails}
          onSuccess={(confirmed) => {
            setBookingSuccessData(confirmed);
            setShowCheckoutModal(false);
          }}
        />
      )}
    </div>
  );
}
