import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight,
  Command,
  Compass,
  Headphones,
  HelpCircle,
  Heart,
  Mail,
  Search,
  Sparkles,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SiteCommandCenter.css';
import { DESTINATIONS } from '../../data/destinations';

const ACTIONS = [
  { label: 'AI Trip Planner', detail: 'Design custom day-by-day itineraries with matched hotel tiers & split bills', path: '/itinerary-planner', icon: Sparkles, type: 'Tool' },
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

export default function SiteCommandCenter() {
  const navigate = useNavigate();
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const openStudio = () => {
      navigate('/itinerary-planner');
    };
    const openCommand = () => {
      setCommandOpen(true);
      setQuery('');
    };
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openCommand();
      }
      if (event.key === 'Escape') {
        setCommandOpen(false);
      }
    };

    window.addEventListener('travelsphere:open-studio', openStudio);
    window.addEventListener('travelsphere:open-command', openCommand);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('travelsphere:open-studio', openStudio);
      window.removeEventListener('travelsphere:open-command', openCommand);
      window.removeEventListener('keydown', onKey);
    };
  }, [navigate]);

  useEffect(() => {
    document.body.classList.toggle('overlay-open', commandOpen);
    return () => document.body.classList.remove('overlay-open');
  }, [commandOpen]);

  const searchResults = useMemo(() => {
    const source = query.trim() ? SITE_SEARCH_INDEX : ACTIONS;
    return source.filter((result) => `${result.label} ${result.detail} ${result.type}`.toLowerCase().includes(query.trim().toLowerCase()));
  }, [query]);

  const choose = (path) => {
    setCommandOpen(false);
    navigate(path);
  };

  if (!commandOpen) return null;

  return createPortal(
    <div className="command-backdrop" onMouseDown={() => setCommandOpen(false)}>
      <section className="command-palette" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="TravelSphere quick navigation">
        <div className="command-search">
          <Search size={18} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the journey…"
          />
          <kbd><Command size={12} /> K</kbd>
        </div>
        <div className="command-label">{query.trim() ? 'SEARCH RESULTS' : 'QUICK MOVES'}</div>
        <div className="command-actions">
          {searchResults.map(({ label, detail, path, icon: Icon, type }) => (
            <button key={`${type}-${label}`} onClick={() => choose(path)}>
              <span className="command-icon"><Icon size={17} /></span>
              <span><strong>{label}</strong><small>{detail}</small>{query.trim() && <em>{type}</em>}</span>
              <ArrowRight size={15} />
            </button>
          ))}
          {searchResults.length === 0 && (
            <p className="command-empty">No results yet. Try a destination, “package”, “hotel”, “booking”, or “support”.</p>
          )}
        </div>
        <div className="command-footer">
          <span>Press <kbd>Esc</kbd> to close</span>
          <span>Search destinations, packages, FAQs &amp; more</span>
        </div>
      </section>
    </div>,
    document.body
  );
}
