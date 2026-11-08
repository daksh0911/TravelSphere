import { useState, useTransition } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
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
  Utensils
} from 'lucide-react';
import { DESTINATIONS } from '../../../data/destinations';
import generateItinerary from '../../../utils/aiItineraryEngine';
import { generateBookingPDF } from '../../../utils/pdfVoucher';
import { useAuth } from '../../../context/useAuth';
import usePageTitle from '../../../hooks/usePageTitle';
import { useCurrency } from '../../../context/useCurrency';
import './ItineraryPlanner.css';

const VIBE_OPTIONS = [
  { id: 'Culture & Heritage', icon: '🏛️', label: 'Culture & Heritage' },
  { id: 'Adventure & Scenic Nature', icon: '🏔️', label: 'Adventure & Nature' },
  { id: 'Romance & Couples Retreat', icon: '🍷', label: 'Romance & Couples' },
  { id: 'Wellness & Slow Living', icon: '🧘', label: 'Wellness & Relaxation' },
  { id: 'Family Discovery & Leisure', icon: '🎡', label: 'Family & Discovery' }
];

const BUDGET_OPTIONS = [
  { id: 'budget', label: 'Smart Value ($)', desc: 'Boutique hostels & local transit' },
  { id: 'moderate', label: 'Comfort ($$)', desc: '4-star hotels & scenic rail' },
  { id: 'luxury', label: 'Luxury ($$$)', desc: '5-star retreats & private drivers' }
];

export default function ItineraryPlanner() {
  usePageTitle('AI Custom Trip Planner');
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

  const handleGenerate = (e) => {
    e.preventDefault();
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

  const handleSaveToAccount = () => {
    try {
      const existing = JSON.parse(localStorage.getItem('ts_saved_itineraries') || '[]');
      const updated = [itinerary, ...existing.filter(i => i.id !== itinerary.id)];
      localStorage.setItem('ts_saved_itineraries', JSON.stringify(updated));
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

  return (
    <div className="itinerary-planner-page">
      <section className="itinerary-hero">
        <div className="itinerary-badge">
          <Sparkles size={16} /> 2026 AI-Powered Trip Engine
        </div>
        <h1>Design your <em>perfect journey</em> in seconds.</h1>
        <p>
          State-of-the-art travel synthesis: customized day-by-day itineraries with matched hotel tiers, 
          transit logistics, and group expense splitting.
        </p>

        {/* Wizard Form */}
        <form className="itinerary-card-wizard" onSubmit={handleGenerate}>
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

            {/* Origin */}
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

            {/* Travelers */}
            <div className="wizard-field-group">
              <label><Users size={14} /> Travelers</label>
              <select
                className="wizard-select"
                value={travelers}
                onChange={(e) => {
                  setTravelers(Number(e.target.value));
                  setSplitCount(Number(e.target.value));
                }}
              >
                <option value={1}>1 Solo Explorer</option>
                <option value={2}>2 Travelers (Pair / Couple)</option>
                <option value={4}>4 Travelers (Small Group / Family)</option>
                <option value={6}>6 Travelers (Friends / Expedition)</option>
              </select>
            </div>
          </div>

          {/* Vibe Selection */}
          <div className="wizard-field-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label><Compass size={14} /> Trip Vibe & Travel Atmosphere</label>
            <div className="vibe-pills-row">
              {VIBE_OPTIONS.map(v => (
                <button
                  key={v.id}
                  type="button"
                  className={`vibe-pill ${vibe === v.id ? 'active' : ''}`}
                  onClick={() => setVibe(v.id)}
                >
                  <span>{v.icon}</span> {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Tier */}
          <div className="wizard-field-group" style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <label><CreditCard size={14} /> Accommodation & Comfort Tier</label>
            <div className="vibe-pills-row">
              {BUDGET_OPTIONS.map(b => (
                <button
                  key={b.id}
                  type="button"
                  className={`vibe-pill ${budgetTier === b.id ? 'active' : ''}`}
                  onClick={() => setBudgetTier(b.id)}
                >
                  <strong>{b.label}</strong>
                  <span style={{ opacity: 0.85, fontSize: '0.75rem' }}>· {b.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="wizard-cta-row">
            <button type="submit" className="btn-generate-ai" disabled={isPending}>
              <Sparkles size={18} /> {isPending ? 'Synthesizing Itinerary...' : 'Generate Custom Itinerary'}
            </button>
          </div>
        </form>
      </section>

      {/* Generated Itinerary Output */}
      {itinerary && (
        <section className="itinerary-results-container">
          {savedSuccessMsg && (
            <div style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} /> {savedSuccessMsg}
            </div>
          )}

          {/* Overview Header Card */}
          <div className="itinerary-overview-header">
            <div className="overview-title-block">
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#a3704c', letterSpacing: '0.05em' }}>
                REFERENCE: #{itinerary.id}
              </span>
              <h2>{itinerary.durationDays}-Day {itinerary.destinationName} Experience</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                From {itinerary.origin} • Matched with <strong>{itinerary.hotel.name}</strong>
              </p>
              <div className="overview-meta-chips">
                <span className="meta-chip"><Clock size={12} /> {itinerary.durationDays} Days / {itinerary.durationNights} Nights</span>
                <span className="meta-chip"><Compass size={12} /> {itinerary.vibe}</span>
                <span className="meta-chip"><Users size={12} /> {itinerary.travelers} Guests</span>
                <span className="meta-chip" style={{ background: '#ecfdf5', color: '#16a34a' }}>
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

          {/* Day by Day Stack */}
          <div className="days-timeline-stack">
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

                <div style={{ background: '#f8fafc', padding: '0.9rem 1.6rem', borderTop: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <span>🚆 <strong>Transit:</strong> {d.transit}</span>
                  <span><Utensils size={13} style={{ display: 'inline', marginRight: 4 }} /> <strong>Local Bite:</strong> {d.dining}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Split Payment Calculator & Export Actions */}
          <div className="itinerary-actions-panel">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#1e293b' }}>
              Split Group Payment & Actions
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Planning with friends or family? Calculate individual shares and download the official boarding voucher.
            </p>

            <div className="split-calculator-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={20} color="#a3704c" />
                <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155' }}>
                  Split between:
                  <select
                    value={splitCount}
                    onChange={(e) => setSplitCount(Number(e.target.value))}
                    style={{ marginLeft: '0.5rem', padding: '0.35rem 0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
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
                className="btn-generate-ai"
                style={{ padding: '0.75rem 1.6rem', fontSize: '0.9rem' }}
                onClick={handleDownloadPDF}
              >
                <FileDown size={16} /> Download Itinerary Voucher (PDF)
              </button>

              <button
                type="button"
                className="ts-btn-outline"
                style={{ padding: '0.75rem 1.6rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={handleSaveToAccount}
              >
                <Heart size={16} /> Save Itinerary
              </button>

              <button
                type="button"
                className="ts-btn-outline"
                style={{ padding: '0.75rem 1.6rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={handleShareLink}
              >
                <Share2 size={16} /> {copiedLink ? 'Link Copied! ✓' : 'Share Itinerary'}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
