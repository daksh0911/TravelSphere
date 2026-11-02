import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Command,
  Compass,
  Headphones,
  HelpCircle,
  Heart,
  Mail,
  MapPin,
  RotateCcw,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SiteCommandCenter.css';
import { DESTINATIONS } from '../../data/destinations';

const STUDIO_STORAGE_KEY = 'travelsphere_trip_studio';

const ACTIONS = [
  { label: 'Explore destinations', detail: 'Find a place that fits your mood', path: '/destinations', icon: Compass, type: 'Browse' },
  { label: 'Browse curated trips', detail: 'Compare ready-to-go journeys', path: '/packages', icon: Sparkles, type: 'Browse' },
  { label: 'Find a beautiful stay', detail: 'Hotels, villas, and retreats', path: '/hotels', icon: Heart, type: 'Browse' },
  { label: 'Get travel support', detail: 'Talk to a real specialist', path: '/support', icon: Users, type: 'Help' },
];

const SITE_SEARCH_INDEX = [
  ...ACTIONS,
  ...DESTINATIONS.map((destination) => ({
    label: destination.name,
    detail: `${destination.country} · ${destination.tagline}`,
    path: `/destinations/${destination.id}`,
    icon: Compass,
    type: 'Destination',
  })),
  ...DESTINATIONS.filter((destination) => destination.packages > 0).map((destination) => ({
    label: `${destination.name} curated packages`,
    detail: `Ready-to-request trips in ${destination.name}`,
    path: `/packages?destination=${destination.id}`,
    icon: Sparkles,
    type: 'Tour package',
  })),
  { label: 'Booking questions', detail: 'Dates, requests, changes, and confirmations', path: '/support?category=Bookings', icon: HelpCircle, type: 'FAQ' },
  { label: 'Payment questions', detail: 'Pricing, inclusions, cancellations, and payments', path: '/support?category=Payments', icon: HelpCircle, type: 'FAQ' },
  { label: 'During-travel help', detail: 'Delays, transfers, and urgent support', path: '/support?category=During%20travel', icon: Headphones, type: 'FAQ' },
  { label: 'Contact TravelSphere', detail: 'Send a message or find our support details', path: '/contact', icon: Mail, type: 'Contact' },
];

const STUDIO_STEPS = [
  {
    eyebrow: '01 · Choose your feeling',
    title: <>What kind of escape<br /><em>sounds like you?</em></>,
    key: 'mood',
    options: [
      { label: 'Slow mornings & still waters', detail: 'Quiet views, local flavours, and time to breathe', image: '/destination-images/kerala.webp', icon: '01' },
      { label: 'Culture, colour & city energy', detail: 'Markets, heritage, cafés, and stories around every corner', image: '/destination-images/kyoto.webp', icon: '02' },
      { label: 'Mountains, trails & open skies', detail: 'Fresh air, dramatic views, and room to roam', image: '/destination-images/swiss-alps.webp', icon: '03' },
      { label: 'A romantic change of scene', detail: 'Unhurried days and beautiful moments made for two', image: '/destination-images/santorini.webp', icon: '04' },
    ],
  },
  {
    eyebrow: '02 · Tell us your company',
    title: <>Who is this journey<br /><em>for?</em></>,
    key: 'party',
    options: [
      { label: 'A reset for one', detail: 'Space to slow down, wander, and come back to yourself', image: '/destination-images/ladakh.webp', icon: '01' },
      { label: 'Just the two of us', detail: 'A shared story with plenty of time for each other', image: '/destination-images/maldives.webp', icon: '02' },
      { label: 'Our family, all together', detail: 'Easy days, thoughtful pacing, and room for everyone', image: '/destination-images/goa.webp', icon: '03' },
      { label: 'A group of favourite people', detail: 'More laughter, flexible plans, and memories to share', image: '/destination-images/bali.webp', icon: '04' },
    ],
  },
  {
    eyebrow: '03 · Set your comfort level',
    title: <>How would you like<br /><em>your trip to feel?</em></>,
    key: 'budget',
    options: [
      { label: 'Thoughtful value', detail: 'Spend wisely while keeping the best experiences', image: '/destination-images/rajasthan.webp', icon: '01' },
      { label: 'Comfort with character', detail: 'Handpicked stays and details that make travel easy', image: '/hotel-images/aman-kyoto.jpg', icon: '02' },
      { label: 'A little more special', detail: 'Beautiful upgrades and memorable extras along the way', image: '/hotel-images/canaves-oia.jpg', icon: '03' },
      { label: 'Our most indulgent escape', detail: 'Exceptional stays, seamless service, and no compromises', image: '/hotel-images/al-maha.jpg', icon: '04' },
    ],
  },
];

const EMPTY_ANSWERS = { mood: '', party: '', budget: '' };

const RECOMMENDATIONS = {
  slow: {
    title: 'Kerala Backwaters, Slowly', destination: 'Kerala, India', image: '/destination-images/kerala.webp', duration: '6 nights · 7 days', price: 'from ₹38,900 / person', inclusions: ['Backwater stay', 'Local food walk', 'Private transfers'],
    reason: 'A softer itinerary with water views, unhurried mornings, and local experiences that never feel rushed.',
  },
  culture: {
    title: 'Kyoto Heritage & Flavours', destination: 'Kyoto, Japan', image: '/destination-images/kyoto.webp', duration: '5 nights · 6 days', price: 'from ₹89,900 / person', inclusions: ['Boutique ryokan', 'Tea ceremony', 'Guided old-town walk'],
    reason: 'A thoughtful mix of living culture, neighbourhood discoveries, and time to explore at your own pace.',
  },
  mountain: {
    title: 'Swiss Alps, Scenic & Slow', destination: 'Swiss Alps, Switzerland', image: '/destination-images/swiss-alps.webp', duration: '6 nights · 7 days', price: 'from ₹1,24,900 / person', inclusions: ['Mountain hotel', 'Scenic rail pass', 'Lake-side day trip'],
    reason: 'Open skies, beautiful rail journeys, and enough breathing room between every big view.',
  },
  romance: {
    title: 'Santorini Sunset Escape', destination: 'Santorini, Greece', image: '/destination-images/santorini.webp', duration: '5 nights · 6 days', price: 'from ₹1,09,900 / person', inclusions: ['Caldera-view stay', 'Sunset cruise', 'Couples’ dinner'],
    reason: 'Made for long lunches, sunset walks, and the kind of shared moments that stay with you.',
  },
};

function readSavedAnswers() {
  try {
    const saved = JSON.parse(localStorage.getItem(STUDIO_STORAGE_KEY) || 'null');
    return saved && typeof saved === 'object' ? { ...EMPTY_ANSWERS, ...saved } : EMPTY_ANSWERS;
  } catch {
    return EMPTY_ANSWERS;
  }
}

function getRecommendation({ mood = '', party = '', budget = '' }) {
  const moodKey = mood.includes('Slow') ? 'slow' : mood.includes('Culture') ? 'culture' : mood.includes('Mountains') ? 'mountain' : 'romance';
  const base = RECOMMENDATIONS[moodKey];
  const adjusted = { ...base };
  if (party.includes('family')) adjusted.inclusions = [...base.inclusions.slice(0, 2), 'Family-friendly pacing'];
  if (party.includes('group')) adjusted.inclusions = [...base.inclusions.slice(0, 2), 'Flexible group transport'];
  if (party.includes('one')) adjusted.inclusions = [...base.inclusions.slice(0, 2), 'Wellness-focused add-on'];
  if (budget.includes('value')) adjusted.price = adjusted.price.replace(/₹[\d,]+/, '₹29,900');
  if (budget.includes('indulgent')) adjusted.price = adjusted.price.replace(/₹[\d,]+/, '₹1,49,900');
  return adjusted;
}

export default function SiteCommandCenter() {
  const navigate = useNavigate();
  const [studioOpen, setStudioOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [direction, setDirection] = useState('forward');

  useEffect(() => {
    const openStudio = () => {
      setAnswers(readSavedAnswers());
      setStep(0);
      setDirection('forward');
      setStudioOpen(true);
    };
    const openCommand = () => { setCommandOpen(true); setQuery(''); };
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openCommand(); }
      if (event.key === 'Escape') { setStudioOpen(false); setCommandOpen(false); }
    };
    window.addEventListener('travelsphere:open-studio', openStudio);
    window.addEventListener('travelsphere:open-command', openCommand);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('travelsphere:open-studio', openStudio);
      window.removeEventListener('travelsphere:open-command', openCommand);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('overlay-open', studioOpen || commandOpen);
    return () => document.body.classList.remove('overlay-open');
  }, [studioOpen, commandOpen]);

  const searchResults = useMemo(() => {
    const source = query.trim() ? SITE_SEARCH_INDEX : ACTIONS;
    return source.filter((result) => `${result.label} ${result.detail} ${result.type}`.toLowerCase().includes(query.trim().toLowerCase()));
  }, [query]);
  const studioComplete = step === STUDIO_STEPS.length;
  const recommendation = getRecommendation(answers);
  const answered = Object.values(answers).filter(Boolean);
  const currentStep = STUDIO_STEPS[step];

  const closeStudio = () => setStudioOpen(false);
  const resetStudio = () => { localStorage.removeItem(STUDIO_STORAGE_KEY); setAnswers(EMPTY_ANSWERS); setStep(0); setDirection('back'); };
  const chooseAnswer = (value) => {
    const nextAnswers = { ...answers, [currentStep.key]: value };
    localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(nextAnswers));
    setAnswers(nextAnswers);
    setDirection('forward');
    setStep((current) => current + 1);
  };
  const goBack = () => { if (step === 0) return; setDirection('back'); setStep((current) => current - 1); };
  const editAnswer = (index) => { setDirection('back'); setStep(index); };
  const choose = (path) => { closeStudio(); navigate(path); };

  return (
    <>
      {commandOpen && (
        <div className="command-backdrop" onMouseDown={() => setCommandOpen(false)}>
          <section className="command-palette" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="TravelSphere quick navigation">
            <div className="command-search"><Search size={18} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the journey…" /><kbd><Command size={12} /> K</kbd></div>
            <div className="command-label">{query.trim() ? 'SEARCH RESULTS' : 'QUICK MOVES'}</div>
            <div className="command-actions">{searchResults.map(({ label, detail, path, icon: Icon, type }) => <button key={`${type}-${label}`} onClick={() => choose(path)}><span className="command-icon"><Icon size={17} /></span><span><strong>{label}</strong><small>{detail}</small>{query.trim() && <em>{type}</em>}</span><ArrowRight size={15} /></button>)}{searchResults.length === 0 && <p className="command-empty">No results yet. Try a destination, “package”, “hotel”, “booking”, or “support”.</p>}</div>
            <div className="command-footer"><span>Press <kbd>Esc</kbd> to close</span><span>Search destinations, packages, FAQs &amp; more</span></div>
          </section>
        </div>
      )}

      {studioOpen && (
        <div className="studio-backdrop" onMouseDown={closeStudio}>
          <section className="studio-panel" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Trip Studio">
            <button className="studio-close" onClick={closeStudio} aria-label="Close Trip Studio"><X size={19} /></button>
            <div className="studio-rail">
              <span className="studio-orbit"><Sparkles size={18} /></span>
              <span className="studio-kicker">TRAVELSPHERE TRIP STUDIO</span>
              <h2>Let’s shape a trip<br /><em>that feels like yours.</em></h2>
              <p>Three quick choices are enough to turn a feeling into a considered package. No forms, no guesswork, no pressure.</p>
              <div className="studio-saved-direction">
                <span>Your trip brief</span>
                {answered.length ? answered.map((answer, index) => <button key={`${answer}-${index}`} onClick={() => editAnswer(index)}>{answer}</button>) : <small>Choose what feels right. You can change anything later.</small>}
              </div>
              <div className="studio-proof"><Check size={14} /> Personalised from your choices</div>
            </div>

            <div className="studio-content">
              {studioComplete ? (
                <div className="studio-result studio-view-transition">
                  <span className="studio-result-mark"><Check size={22} /></span>
                  <span className="studio-kicker dark">YOUR MATCHED PACKAGE</span>
                  <h3>A lovely place<br /><em>to begin.</em></h3>
                  <p className="studio-result-intro">Based on your choices, we think this package will suit your travel rhythm best.</p>
                  <article className="studio-package-card">
                    <div className="studio-package-image" style={{ backgroundImage: `url("${recommendation.image}")` }}><span>{recommendation.destination}</span></div>
                    <div className="studio-package-body">
                      <span className="studio-package-kicker">RECOMMENDED FOR YOU</span>
                      <h4>{recommendation.title}</h4>
                      <p>{recommendation.reason}</p>
                      <div className="studio-package-meta"><span><Clock3 size={13} /> {recommendation.duration}</span><strong>{recommendation.price}</strong></div>
                      <div className="studio-inclusions">{recommendation.inclusions.map((item) => <span key={item}><Check size={12} /> {item}</span>)}</div>
                    </div>
                  </article>
                  <button onClick={() => choose('/packages')}>Explore this package <ArrowRight size={17} /></button>
                  <button className="studio-secondary" onClick={resetStudio}><RotateCcw size={14} /> Change my answers</button>
                  <div className="studio-result-note"><MapPin size={15} /> Prices are indicative. A specialist can tailor dates, stays, and transport.</div>
                </div>
              ) : (
                <div key={step} className={`studio-question studio-view-transition ${direction}`}>
                  <div className="studio-progress">
                    <button className="studio-back" onClick={goBack} disabled={step === 0}><ArrowLeft size={14} /> Back</button>
                    <span>0{step + 1} <small>/ 03</small></span>
                    <div><i style={{ width: `${((step + 1) / STUDIO_STEPS.length) * 100}%` }} /></div>
                    <button className="studio-reset" onClick={resetStudio}>Reset</button>
                  </div>
                  <span className="studio-kicker dark">{currentStep.eyebrow}</span>
                  <h3>{currentStep.title}</h3>
                  <div className="studio-options">
                    {currentStep.options.map((option) => (
                      <button className={answers[currentStep.key] === option.label ? 'selected' : ''} key={option.label} onClick={() => chooseAnswer(option.label)}>
                        <span className="studio-option-image" style={{ backgroundImage: `url("${option.image}")` }}><span>{option.icon}</span></span>
                        <span className="studio-option-copy"><strong>{option.label}</strong><small>{option.detail}</small></span>
                        <ArrowRight size={15} />
                      </button>
                    ))}
                  </div>
                  <div className="studio-mini-note"><CalendarDays size={15} /> Your package will be shaped around all three choices.</div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
