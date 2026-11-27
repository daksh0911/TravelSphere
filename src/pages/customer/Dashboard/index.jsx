import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Heart, 
  Compass, 
  HelpCircle, 
  Settings, 
  LogOut, 
  User,
  Search, 
  Bell, 
  ChevronDown, 
  CheckCircle, 
  Star, 
  Plus, 
  Edit,
  Check,
  FileDown,
  Trash2,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  X,
  Plane,
  Train,
  Bus,
  Car,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Award,
  Menu
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../../context/useAuth';
import { BUILT_IN_DEMO_ACCOUNTS, changePassword } from '../../../services/authService';
import api from '../../../services/api';
import './Dashboard.css';
import SmartImage from '../../../components/common/SmartImage';
import { generateBookingPDF } from '../../../utils/pdfVoucher';
import { COUNTRIES, sanitizeFullName, sanitizePhoneDigits } from '../../../utils/countryPhoneConfig';
import CheckoutModal from '../../../components/common/CheckoutModal/CheckoutModal';

import usePageTitle from '../../../hooks/usePageTitle';
import { useCurrency } from '../../../context/useCurrency';

// eslint-disable-next-line react-refresh/only-export-components
export const getBookingStatusDisplay = (booking) => {
  let label = 'Confirmed';
  let className = 'status-confirmed';
  if (booking) {
    const rawStatus = String(booking.status || booking.booking_status || '').toLowerCase().trim();
    const endDate = booking.end_date || booking.travel_date || booking.start_date;
    const isPast = endDate && new Date(endDate).getTime() < new Date().setHours(0, 0, 0, 0);

    if (rawStatus === 'completed' || rawStatus === 'finished' || isPast) {
      label = 'Finished';
      className = 'status-finished';
    } else if (rawStatus === 'cancelled') {
      label = 'Cancelled';
      className = 'status-cancelled';
    } else if (rawStatus === 'pending') {
      label = 'Pending';
      className = 'status-pending';
    }
  }
  return {
    label,
    className,
    toString: () => label,
    toLowerCase: () => label.toLowerCase()
  };
};

// eslint-disable-next-line react-refresh/only-export-components
export const getBookingType = (b) => {
  if (!b) return 'package';
  if (b.booking_type) {
    const rawType = b.booking_type.toLowerCase();
    if (['vehicle', 'bike', 'motorcycle', 'suv'].includes(rawType)) return 'car';
    if (rawType.includes('guide')) return 'guide';
    return rawType;
  }
  const title = (b.package_title || b.packageTitle || '').toLowerCase();
  const carrier = (b.carrier || '').toLowerCase();
  const notes = (b.notes || '').toLowerCase();
  if (title.includes('guide') || notes.includes('guide') || b.guide_id || b.guide_name) return 'guide';
  if (carrier.includes('air') || title.includes('flight') || title.includes('jet') || title.includes('seaplane') || notes.includes('flight')) return 'flight';
  if (carrier.includes('rail') || title.includes('train') || title.includes('express') || title.includes('shinkansen') || notes.includes('rail') || notes.includes('train')) return 'train';
  if (carrier.includes('bus') || title.includes('bus') || title.includes('coach') || notes.includes('bus')) return 'bus';
  if (carrier.includes('fleet') || title.includes('car') || title.includes('sedan') || title.includes('suv') || title.includes('bike') || title.includes('motorcycle') || title.includes('mercedes') || notes.includes('car') || notes.includes('bike') || notes.includes('rental')) return 'car';
  return 'package';
};

const getBookingBadgeLabel = (b) => {
  const bookingType = getBookingType(b);
  if (bookingType === 'flight') return '✈ Flight';
  if (bookingType === 'train') return '🚆 Train';
  if (bookingType === 'bus') return '🚌 Bus';
  if (bookingType === 'guide') return '🧭 Tour Guide';
  if (bookingType === 'car') {
    const text = `${b?.package_title || ''} ${b?.notes || ''}`.toLowerCase();
    return (text.includes('bike') || text.includes('motorcycle') || text.includes('touring') || text.includes('cruiser'))
      ? '🏍️ Bike Rental'
      : '🚗 Car Rental';
  }
  return '🎫 Tour Package';
};

// Per-user localStorage key helper — prevents cross-account data bleed
const getUserStorageKey = (email, baseKey) => {
  if (!email) return baseKey;
  // Simple sanitize: lowercase, replace special chars with underscore
  const safe = String(email).trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${baseKey}_${safe}`;
};

// Read the currently-logged-in user's email from auth storage (used in lazy useState initialisers
// that run before the React context is available)
const getActiveEmail = () => {
  try {
    const raw = localStorage.getItem('travelsphere_active_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.email || '';
    }
  } catch { /* ignore */ }
  return '';
};

// Canonical catalog packages mapping ID to title, image and price for wishlist and explore persistence
const CANONICAL_PACKAGES = [
  { id: 1, package_id: 1, title: 'Maldives Overwater Luxury Bungalow', price: 1045, rating: 4.9, image_url: '/package-images/1-maldives.webp', destination: 'Maldives' },
  { id: 2, package_id: 2, title: 'Santorini Villa & Yacht Week', price: 1242, rating: 4.8, image_url: '/package-images/2-santorini.webp', destination: 'Santorini, Greece' },
  { id: 3, package_id: 3, title: 'Bali Wellness & Temple Trails', price: 636, rating: 4.7, image_url: '/package-images/3-bali.webp', destination: 'Bali, Indonesia' },
  { id: 4, package_id: 4, title: 'Swiss Alps Scenic Glacier Express', price: 1985, rating: 5.0, image_url: '/package-images/4-swiss-alps.webp', destination: 'Interlaken, Switzerland' },
  { id: 5, package_id: 5, title: 'Kyoto Culture & Sakura Blossom Tour', price: 955, rating: 4.9, image_url: '/package-images/5-kyoto.webp', destination: 'Kyoto, Japan' },
  { id: 6, package_id: 6, title: 'Dubai Desert Resort & Luxury Skyscraper', price: 450, rating: 4.9, image_url: '/package-images/6-dubai.webp', destination: 'Dubai, UAE' },
  { id: 7, package_id: 7, title: 'Paris VIP Art & Seine Culinary Discovery', price: 1650, rating: 4.8, image_url: '/package-images/7-paris.webp', destination: 'Paris, France' },
  { id: 8, package_id: 8, title: 'Rajasthan Royal Palaces & Desert Safari', price: 1280, rating: 4.8, image_url: '/package-images/8-rajasthan.webp', destination: 'Jaipur & Udaipur, India' }
];

const resolveWishlistFromStorage = (email) => {
  try {
    const key = getUserStorageKey(email, 'ts_package_wishlist');
    const local = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(local) && local.length > 0) {
      return local.map(item => {
        const numId = Number(typeof item === 'object' ? (item.package_id || item.id) : item);
        const found = CANONICAL_PACKAGES.find(p => p.id === numId);
        if (found) return { ...found, wishlist_id: `wish-${numId}` };
        if (typeof item === 'object' && item.title) return item;
        return {
          id: numId,
          package_id: numId,
          wishlist_id: `wish-${numId}`,
          title: `Saved Adventure #${numId}`,
          price: 1045,
          rating: 4.9,
          image_url: '/package-images/1-maldives.webp',
          destination: 'Global Destination'
        };
      });
    }
  } catch { /* ignore */ }
  return [];
};

// Offline fallback generators defined outside component scope for purity
const createFallbackWishlistItem = (pkg) => ({
  wishlist_id: Date.now(),
  package_id: pkg?.package_id || pkg?.id,
  title: pkg?.title,
  price: pkg?.price,
  image_url: pkg?.image_url || pkg?.imageUrl || '/destination-images/santorini.webp'
});

const createFallbackReview = (pkgTitle, rating, comment) => ({
  review_id: Date.now(),
  package_title: pkgTitle,
  rating,
  comment,
  created_at: new Date().toISOString()
});

const DEFAULT_CHECKLIST = [
  { id: 'passport', text: 'Valid Passport / Government Photo ID Verified' },
  { id: 'voucher', text: 'Download Offline PDF Boarding Voucher' },
  { id: 'adapter', text: 'Universal Power Adapter & Device Chargers' },
  { id: 'apparel', text: 'Destination Climate Outfits & Footwear Packed' },
  { id: 'forex', text: 'Forex Travel Card & Emergency Cash' }
];

const getDaysUntilTrip = (dateStr) => {
  if (!dateStr) return 14;
  const target = new Date(dateStr).getTime();
  if (isNaN(target)) return 14;
  const now = Date.now();
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
};

const FastBookingModal = ({ type, onClose, onConfirm, formatPrice }) => {
  const isFlight = type === 'flight';
  const isTrain = type === 'train';
  const isBus = type === 'bus';
  const isCar = type === 'car';

  const defaultTitle = isFlight 
    ? 'Air France AF-104 Transatlantic Jet'
    : isTrain 
    ? 'Kyoto Sakura Express Shinkansen'
    : isBus
    ? 'Alpine Panorama Luxury Coach'
    : 'Mercedes-Benz E-Class Executive Car';

  const defaultCarrier = isFlight 
    ? 'Air France · SkyTeam'
    : isTrain
    ? 'JR Central Nozomi'
    : isBus
    ? 'Alpine Panorama Shuttle'
    : 'TravelSphere Luxury Fleet';

  const defaultFrom = isFlight ? 'New York (JFK)' : isTrain ? 'Tokyo Central Station' : isBus ? 'Geneva Airport Hub' : 'Zurich Airport Hub';
  const defaultTo = isFlight ? 'Paris Charles de Gaulle (CDG)' : isTrain ? 'Kyoto Station' : isBus ? 'Chamonix Mont-Blanc' : 'Interlaken Chalets Delivery';
  const defaultPrice = isFlight ? 420 : isTrain ? 148 : isBus ? 68 : 120;
  const defaultSeat = isFlight ? 'Suite 03A (Business)' : isTrain ? 'Car 07 · Seat 11E' : isBus ? 'Seat 02B (Panorama Window)' : 'Executive Sedan · Automatic';
  const defaultGate = isFlight ? 'Gate B22' : isTrain ? 'Platform 14' : isBus ? 'Bay 4' : 'VIP Counter A';
  const defaultImage = isFlight ? '/destination-images/paris.webp' : isTrain ? '/destination-images/kyoto.webp' : isBus ? '/destination-images/swiss-alps.webp' : '/vehicle-images/mercedes-e-class.webp';

  const [form, setForm] = useState(() => ({
    title: defaultTitle,
    carrier: defaultCarrier,
    from: defaultFrom,
    to: defaultTo,
    date: new Date().toISOString().slice(0, 10),
    returnDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    guests: 2,
    seat: defaultSeat,
    gate: defaultGate,
    amount: defaultPrice,
    image: defaultImage
  }));

  const computedAmount = isCar ? defaultPrice * 3 : defaultPrice * Number(form.guests || 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ ...form, amount: computedAmount, type });
  };

  return createPortal(
    <div className="ts-modal-backdrop" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="ts-fast-booking-modal" onClick={e => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '18px', width: '100%', maxWidth: '540px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: isFlight ? '#e0f2fe' : isTrain ? '#fef3c7' : isBus ? '#dcfce7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isFlight ? '#0284c7' : isTrain ? '#d97706' : isBus ? '#16a34a' : '#334155' }}>
              {isFlight && <Plane size={20} />}
              {isTrain && <Train size={20} />}
              {isBus && <Bus size={20} />}
              {isCar && <Car size={20} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isFlight ? 'Book Flight Ticket' : isTrain ? 'Book Train Ticket' : isBus ? 'Book Bus Ticket' : 'Book Car Rental'}
              </h3>
              <small style={{ color: '#64748b' }}>Instant Confirmation · Saved to your Dashboard</small>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              {isFlight ? 'Airline / Flight Name' : isTrain ? 'Train / Express Service' : isBus ? 'Bus Operator' : 'Vehicle Model'}
            </label>
            <input 
              type="text" 
              required
              value={form.title} 
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.9rem', fontWeight: 600 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Departure / Pickup</label>
              <input 
                type="text" 
                required
                value={form.from} 
                onChange={e => setForm(p => ({ ...p, from: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Destination / Return</label>
              <input 
                type="text" 
                required
                value={form.to} 
                onChange={e => setForm(p => ({ ...p, to: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Travel Date</label>
              <input 
                type="date" 
                required
                value={form.date} 
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                {isCar ? 'Return Date' : 'Passengers / Guests'}
              </label>
              {isCar ? (
                <input 
                  type="date" 
                  required
                  value={form.returnDate} 
                  onChange={e => setForm(p => ({ ...p, returnDate: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.875rem' }}
                />
              ) : (
                <input 
                  type="number" 
                  min="1"
                  max="10"
                  required
                  value={form.guests} 
                  onChange={e => setForm(p => ({ ...p, guests: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.875rem' }}
                />
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Class / Cabin / Seat</label>
              <input 
                type="text" 
                value={form.seat} 
                onChange={e => setForm(p => ({ ...p, seat: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Fare / Price</label>
              <div style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                {formatPrice(computedAmount)}
                <small style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 500, marginLeft: '6px' }}>
                  ({isCar ? '3-day rental' : `${form.guests} passenger(s) @ ${formatPrice(defaultPrice)}`})
                </small>
              </div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={15} color="#16a34a" />
            <span>Guaranteed booking confirmation with instant downloadable PDF travel voucher.</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" className="ts-btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}>
              Proceed to Payment & Checkout ➔
            </button>
            <button type="button" onClick={onClose} className="ts-btn-outline" style={{ padding: '0.75rem 1.25rem' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

const DEFAULT_CUSTOMER_BOOKINGS = [
  {
    booking_id: 101,
    display_id: '#TS-FL-1049',
    booking_type: 'flight',
    package_title: 'Air France AF-104 Transatlantic Jet',
    carrier: 'Air France · SkyTeam Luxury',
    destination_name: 'Paris Charles de Gaulle (CDG)',
    departure_city: 'New York (JFK)',
    travel_date: '2026-11-25',
    start_date: '2026-11-25',
    end_date: '2026-11-25',
    guests: 2,
    seat: 'Suite 03A, 03B (Business)',
    gate: 'Gate B22',
    total_amount: 840,
    booking_status: 'Confirmed',
    status: 'confirmed',
    package_image: '/destination-images/paris.webp',
    notes: 'Flight Reservation · Business Class Lie-Flat'
  },
  {
    booking_id: 102,
    display_id: '#TS-RN-9204',
    booking_type: 'train',
    package_title: 'Kyoto Sakura Express Shinkansen',
    carrier: 'JR Central · Nozomi High-Speed',
    destination_name: 'Kyoto Station',
    departure_city: 'Tokyo Central Station',
    travel_date: '2026-11-22',
    start_date: '2026-11-22',
    end_date: '2026-11-22',
    guests: 2,
    seat: 'Car 07 · 11E, 11F',
    gate: 'Platform 14',
    total_amount: 296,
    booking_status: 'Confirmed',
    status: 'confirmed',
    package_image: '/destination-images/kyoto.webp',
    notes: 'Bullet Train Ticket · Gran Class VIP'
  },
  {
    booking_id: 103,
    display_id: '#TS-BS-8830',
    booking_type: 'bus',
    package_title: 'Alpine Panorama Luxury Coach',
    carrier: 'TravelSphere Alpine Shuttle',
    destination_name: 'Chamonix Mont-Blanc',
    departure_city: 'Geneva Airport Central',
    travel_date: '2026-11-20',
    start_date: '2026-11-20',
    end_date: '2026-11-20',
    guests: 2,
    seat: 'Seat 02B, 02C',
    gate: 'Bay 4',
    total_amount: 136,
    booking_status: 'Confirmed',
    status: 'confirmed',
    package_image: '/destination-images/swiss-alps.webp',
    notes: 'Panorama Glass Roof Winter Coach'
  },
  {
    booking_id: 104,
    display_id: '#TS-CAR-67129',
    booking_type: 'car',
    package_title: 'Mercedes-Benz E-Class Executive Car',
    carrier: 'TravelSphere Luxury Fleet',
    destination_name: 'Interlaken Chalets Delivery',
    departure_city: 'Zurich Airport Hub',
    travel_date: '2026-11-19',
    start_date: '2026-11-19',
    end_date: '2026-11-23',
    guests: 2,
    seat: 'Self-Drive Sedan',
    gate: 'VIP Counter A',
    total_amount: 480,
    booking_status: 'Confirmed',
    status: 'confirmed',
    package_image: '/vehicle-images/mercedes-e-class.webp',
    notes: 'Car Rental · Automatic · 4-Day Reservation'
  },
  {
    booking_id: 105,
    display_id: '#TS-PKG-772918',
    booking_type: 'package',
    package_title: 'Swiss Alps Scenic Glacier Express',
    carrier: 'TravelSphere Signature Journeys',
    destination_name: 'Interlaken, Switzerland',
    departure_city: 'Zurich Intl',
    travel_date: '2026-11-18',
    start_date: '2026-11-18',
    end_date: '2026-11-25',
    guests: 2,
    seat: 'First Class Tour Pass',
    gate: 'Central Concierge',
    total_amount: 1985,
    booking_status: 'Confirmed',
    status: 'confirmed',
    package_image: '/destination-images/swiss-alps.webp',
    notes: 'Tour Package · Chalet Stay & Glacier Excursions'
  },
  {
    booking_id: 106,
    display_id: '#TS-PKG-551022',
    booking_type: 'package',
    package_title: 'Santorini Sunset Caldera Villa & Cruise',
    carrier: 'Aegean Luxury Escapes',
    destination_name: 'Oia, Santorini, Greece',
    departure_city: 'Athens Intl',
    travel_date: '2026-09-10',
    start_date: '2026-09-10',
    end_date: '2026-09-17',
    guests: 2,
    seat: 'Villa Suite',
    gate: 'Port Gate 1',
    total_amount: 1780,
    booking_status: 'Finished',
    status: 'completed',
    package_image: '/destination-images/santorini.webp',
    notes: 'Completed Vacation · Tour Finished'
  }
];

const CERTIFIED_GUIDES = [
  {
    id: 1,
    name: 'Marco Rossi',
    location: 'Interlaken & Swiss Alps',
    rating: 4.95,
    toursCompleted: 142,
    hourlyRate: 65,
    dailyRate: 380,
    avatarUrl: '/destination-images/swiss-alps.webp',
    bio: 'Certified Alpine Explorer & Cultural Historian with over 9 years of guided mountain treks and historical city walks in Western Europe.',
    languages: ['English', 'Italian', 'French', 'German']
  },
  {
    id: 2,
    name: 'Yuki Tanaka',
    location: 'Kyoto, Japan',
    rating: 4.98,
    toursCompleted: 168,
    hourlyRate: 70,
    dailyRate: 400,
    avatarUrl: '/destination-images/kyoto.webp',
    bio: 'Licensed national guide-interpreter specializing in Kansai ancient temples, Zen meditation gardens, and Gion geisha culture.',
    languages: ['Japanese', 'English', 'Mandarin']
  },
  {
    id: 3,
    name: 'Elena Rostova',
    location: 'Santorini & Aegean Islands',
    rating: 4.92,
    toursCompleted: 115,
    hourlyRate: 60,
    dailyRate: 350,
    avatarUrl: '/destination-images/santorini.webp',
    bio: 'Maritime history scholar and Santorini caldera tour specialist covering volcanic hot springs, Akrotiri excavations, and wine tastings.',
    languages: ['Greek', 'English', 'Spanish']
  },
  {
    id: 4,
    name: 'Ibrahim Rasheed',
    location: 'North Malé Atoll, Maldives',
    rating: 4.95,
    toursCompleted: 130,
    hourlyRate: 55,
    dailyRate: 320,
    avatarUrl: '/destination-images/maldives.webp',
    bio: 'PADI Master Diver and certified marine biologist with 12 years of coral conservation and dolphin tracking leadership in the Maldivian atolls.',
    languages: ['English', 'Dhivehi', 'French']
  }
];

const CustomerDashboard = () => {
  usePageTitle('My Dashboard');
  const { user, logout } = useAuth();
  const isDemoUser = Boolean(user?.email && BUILT_IN_DEMO_ACCOUNTS[String(user.email).trim().toLowerCase()]);
  // User-scoped storage helper — avoids data bleed between accounts
  const userEmail = user?.email || '';
  const tripKey    = getUserStorageKey(userEmail, 'ts_trip_requests');
  const wishKey    = getUserStorageKey(userEmail, 'ts_package_wishlist');
  const plansKey   = getUserStorageKey(userEmail, 'ts_customer_trip_plans');
  const reviewsKey = getUserStorageKey(userEmail, 'ts_user_reviews');
  const avatarKey  = getUserStorageKey(userEmail, 'ts_user_avatar');
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const location = useLocation();
  const [bookingFilter, setBookingFilter] = useState(() => {
    return location.state?.bookingFilter || location.state?.bookingTab || 'all';
  });
  const [showFastBookingModal, setShowFastBookingModal] = useState(null);
  const [dbUser, setDbUser] = useState(null);

  const userPhone = dbUser?.phone || user?.phone || (() => {
    try {
      const localUsers = JSON.parse(localStorage.getItem('travelsphere_db_users') || '[]');
      const matched = localUsers.find(u => (u.email || '').toLowerCase() === (user?.email || '').toLowerCase());
      if (matched?.phone) return matched.phone;
    } catch { /* ignore */ }
    return (user?.email && BUILT_IN_DEMO_ACCOUNTS[user.email.toLowerCase()]?.phone) || '+91 9876543210';
  })();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchRecs, setShowSearchRecs] = useState(false);

  const searchRecommendations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const source = [
      ...CANONICAL_PACKAGES.map(p => ({ id: `pkg-${p.id}`, title: p.title, subtitle: `${p.destination} • ${p.days || 5} Days`, price: p.price, image: p.image_url, type: 'Package', query: p.destination || p.title })),
      { id: 'dest-kyoto', title: 'Kyoto, Japan', subtitle: 'Cultural Temples & Arashiyama', price: 1250, image: '/destination-images/kyoto.webp', type: 'Destination', query: 'Kyoto' },
      { id: 'dest-swiss', title: 'Swiss Alps, Switzerland', subtitle: 'Glacier Express & Zermatt', price: 1680, image: '/destination-images/swiss-alps.webp', type: 'Destination', query: 'Swiss' },
      { id: 'dest-maldives', title: 'Maldives', subtitle: 'Overwater Luxury Bungalows', price: 1850, image: '/destination-images/maldives.webp', type: 'Destination', query: 'Maldives' },
      { id: 'dest-santorini', title: 'Santorini, Greece', subtitle: 'Caldera Sunsets & Villas', price: 1450, image: '/destination-images/santorini.webp', type: 'Destination', query: 'Santorini' }
    ];
    if (!q) return source.slice(0, 5);
    return source.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQuery]);
  const [liveBookings, setLiveBookings] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(getUserStorageKey(getActiveEmail(), 'ts_trip_requests')) || '[]');
      if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch { /* ignore */ }
    return isDemoUser ? DEFAULT_CUSTOMER_BOOKINGS : [];
  });

  // Packages and trips booked by the user (only booked packages shown in reviews)
  const bookedPackages = useMemo(() => {
    if (!liveBookings || liveBookings.length === 0) return [];
    const list = [];
    const seen = new Set();
    liveBookings.forEach((b) => {
      const title = b.package_title || b.title;
      if (!title) return;
      const id = String(b.package_id || b.booking_id || b.id || title);
      const statusInfo = getBookingStatusDisplay(b);
      const isFinished = statusInfo.label === 'Finished';
      const isCancelled = statusInfo.label === 'Cancelled';
      if (!seen.has(title) && !isCancelled) {
        seen.add(title);
        const rawType = getBookingType(b);
        const tLower = title.toLowerCase();
        const type = (tLower.includes('hotel') || tLower.includes('resort') || tLower.includes('villa') || tLower.includes('stay'))
          ? 'hotel'
          : rawType;
        list.push({
          id,
          package_id: id,
          title,
          type,
          location: b.destination_name || b.destination || b.departure_city || 'Booked Service',
          booking_id: b.booking_id,
          status: statusInfo.label,
          isFinished,
          date: b.end_date || b.travel_date || b.start_date
        });
      }
    });
    return list;
  }, [liveBookings]);
  const [liveWishlist, setLiveWishlist] = useState(() => {
    const fromStorage = resolveWishlistFromStorage(getActiveEmail());
    if (fromStorage.length > 0) return fromStorage;
    if (!isDemoUser) return [];
    return [
      { id: 1, package_id: 1, title: 'Maldives Overwater Luxury Bungalow', price: 1045, rating: 4.9, image_url: '/package-images/1-maldives.webp', destination: 'Maldives' },
      { id: 2, package_id: 2, title: 'Santorini Villa & Yacht Week', price: 1242, rating: 4.8, image_url: '/package-images/2-santorini.webp', destination: 'Santorini, Greece' }
    ];
  });
  const [savedTripPlans, setSavedTripPlans] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(getUserStorageKey(getActiveEmail(), 'ts_customer_trip_plans')) || '[]');
      if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch { /* ignore */ }
    if (!isDemoUser) return [];
    return [
      {
        plan_id: 1,
        title: 'Autumn in Kyoto & Hakone Onsen',
        destination: 'Kyoto, Japan',
        startDate: '2026-10-15',
        endDate: '2026-10-22',
        budget: 1950,
        status: 'Planning',
        notes: 'Arashiyama bamboo grove, traditional kaiseki dinners, and tea ceremony.'
      },
      {
        plan_id: 2,
        title: 'Swiss Glacier Panorama & Ski Expedition',
        destination: 'Interlaken & Zermatt, Switzerland',
        startDate: '2026-11-20',
        endDate: '2026-11-28',
        budget: 2850,
        status: 'Confirmed',
        notes: 'First-class Glacier Express scenic train and luxury alpine chalets.'
      }
    ];
  });

  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState(() => ({
    title: '',
    destination: 'Kyoto, Japan',
    startDate: '2026-11-22',
    endDate: '2026-11-29',
    budget: 1800,
    status: 'Planning',
    notes: 'Sightseeing, local dining, cultural temples, and comfortable transit.'
  }));

  useEffect(() => {
    if (location.state?.bookingFilter || location.state?.bookingTab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab('bookings');
      setBookingFilter(location.state.bookingFilter || location.state.bookingTab);
    }
  }, [location.state]);
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', packageId: '' });
  const [reviewStatusMsg, setReviewStatusMsg] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Quick feedback on dashboard overview
  const [overviewRating, setOverviewRating] = useState(5);
  const [overviewComment, setOverviewComment] = useState('');
  const [overviewSubmitted, setOverviewSubmitted] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Profile edit state
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileCountryCode, setProfileCountryCode] = useState('+91');
  const [profileData, setProfileData] = useState(() => {
    const raw = userPhone || '+91 9876543210';
    const digits = raw.replace(/\D/g, '').slice(-10);
    return {
      name: user?.name || 'Alice Walker',
      phone: digits || '9876543210',
      avatar_url: user?.avatar_url || localStorage.getItem(getUserStorageKey(getActiveEmail(), 'ts_user_avatar')) || '/destination-images/swiss-alps.webp'
    };
  });
  const [profileSavedMsg, setProfileSavedMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Change state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [allPackages, setAllPackages] = useState([]);
  const [bookingMsg, setBookingMsg] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  // Outside click listener to dismiss notification bell popover and user avatar dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.ts-notif-wrap')) {
        setShowNotifDropdown(false);
      }
      if (!e.target.closest('.ts-user-profile-btn') && !e.target.closest('.ts-profile-dropdown') && !e.target.closest('.ts-user-menu-dropdown')) {
        setShowUserDropdown(false);
      }
      if (!e.target.closest('.ts-mobile-menu-btn') && !e.target.closest('.ts-mobile-drawer')) {
        setShowMobileDrawer(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Synchronize wishlist across routes and storage
  useEffect(() => {
    const syncWishlist = () => {
      const stored = resolveWishlistFromStorage(userEmail || getActiveEmail());
      if (stored.length > 0) setLiveWishlist(stored);
    };
    window.addEventListener('ts_wishlist_updated', syncWishlist);
    window.addEventListener('storage', syncWishlist);
    return () => {
      window.removeEventListener('ts_wishlist_updated', syncWishlist);
      window.removeEventListener('storage', syncWishlist);
    };
  }, [userEmail]);

  // MakeMyTrip Package Filter states for Explore tab
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pkgSearch, setPkgSearch] = useState('');
  const [sortBy, setSortBy] = useState('recommended');

  // Pre-Trip Checklist state
  const [checklist, setChecklist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ts_travel_checklist') || '{"passport":true,"voucher":true}');
    } catch {
      return { passport: true, voucher: true };
    }
  });

  const toggleChecklistItem = (id) => {
    setChecklist(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem('ts_travel_checklist', JSON.stringify(next)); } catch { /* ignore */ }
      const allChecked = DEFAULT_CHECKLIST.every(item => next[item.id]);
      if (allChecked && !prev[id]) {
        confetti({ particleCount: 65, spread: 55, origin: { y: 0.6 } });
      }
      return next;
    });
  };

  const checklistCount = DEFAULT_CHECKLIST.filter(item => checklist[item.id]).length;

  const activeCountry = COUNTRIES.find(c => c.code === profileCountryCode) || COUNTRIES[0];

  const flightBookings = useMemo(() => liveBookings.filter(b => getBookingType(b) === 'flight'), [liveBookings]);
  const trainBookings = useMemo(() => liveBookings.filter(b => getBookingType(b) === 'train'), [liveBookings]);
  const busBookings = useMemo(() => liveBookings.filter(b => getBookingType(b) === 'bus'), [liveBookings]);
  const carBookings = useMemo(() => liveBookings.filter(b => getBookingType(b) === 'car'), [liveBookings]);
  const packageBookings = useMemo(() => liveBookings.filter(b => getBookingType(b) === 'package'), [liveBookings]);
  const guideBookings = useMemo(() => liveBookings.filter(b => getBookingType(b) === 'guide'), [liveBookings]);

  const displayedBookings = useMemo(() => {
    if (bookingFilter === 'flight') return flightBookings;
    if (bookingFilter === 'train') return trainBookings;
    if (bookingFilter === 'bus') return busBookings;
    if (bookingFilter === 'car') return carBookings;
    if (bookingFilter === 'package') return packageBookings;
    if (bookingFilter === 'guide') return guideBookings;
    return liveBookings;
  }, [bookingFilter, liveBookings, flightBookings, trainBookings, busBookings, carBookings, packageBookings, guideBookings]);

  const handleCreateFastBooking = (bookingData) => {
    setShowFastBookingModal(null);
    const rawType = bookingData.type || 'flight';
    const typeLabel = rawType === 'flight' ? 'Flight' : rawType === 'train' ? 'Train' : rawType === 'bus' ? 'Bus' : 'Car Rental';

    setCheckoutDetails({
      id: Date.now(),
      packageId: rawType === 'flight' ? 101 : rawType === 'train' ? 102 : rawType === 'bus' ? 103 : 104,
      type: rawType,
      item_type: rawType,
      title: bookingData.title,
      destination: bookingData.to,
      departure: bookingData.from,
      dates: `${bookingData.date} to ${bookingData.returnDate || bookingData.date}`,
      startDate: bookingData.date,
      endDate: bookingData.returnDate || bookingData.date,
      travel_date: bookingData.date,
      guests: Number(bookingData.guests || 2),
      seat: bookingData.seat,
      carrier: bookingData.carrier,
      gate: bookingData.gate,
      price: Number(bookingData.amount),
      subtotal: Number(bookingData.amount),
      image: bookingData.image || '/destination-images/paris.webp',
      typeLabel
    });
    setShowCheckoutModal(true);
  };

  const handleCancelBooking = (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will update your reservation status to Cancelled.')) {
      return;
    }
    setLiveBookings(prev => {
      const updated = prev.map(b => (b.booking_id === bookingId || b.id === bookingId || b.display_id === bookingId) ? { ...b, status: 'Cancelled', booking_status: 'Cancelled' } : b);
      try {
        localStorage.setItem(tripKey, JSON.stringify(updated));
      } catch (_err) {
        void _err;
      }
      return updated;
    });
    setBookingMsg(`Booking ${bookingId} has been cancelled.`);
    setTimeout(() => setBookingMsg(''), 4000);
  };

  const handleBookGuide = (guide) => {
    setBookingMsg('');
    const s = new Date();
    s.setDate(s.getDate() + 7);
    const startStr = s.toISOString().split('T')[0];
    const e = new Date(s);
    e.setDate(e.getDate() + 1);
    const endStr = e.toISOString().split('T')[0];

    setCheckoutDetails({
      id: guide.id,
      item_id: guide.id,
      type: 'guide',
      item_type: 'guide',
      title: `Private Guided Excursion with ${guide.name}`,
      destination: guide.location,
      image: guide.avatarUrl,
      subtotal: guide.dailyRate,
      price: guide.dailyRate,
      guests: 2,
      startDate: startStr,
      endDate: endStr,
      notes: `Certified Guide: ${guide.name} (${guide.languages.join(', ')})`
    });
    setShowCheckoutModal(true);
  };

  const handleSaveTripPlan = (e) => {
    e.preventDefault();
    const newPlan = {
      plan_id: Date.now(),
      id: Date.now(),
      title: planForm.title || `${planForm.destination} Custom Tour`,
      destination: planForm.destination,
      startDate: planForm.startDate,
      endDate: planForm.endDate,
      budget: Number(planForm.budget) || 1500,
      status: planForm.status || 'Planning',
      notes: planForm.notes,
      created_at: new Date().toISOString()
    };
    const updated = [newPlan, ...savedTripPlans];
    setSavedTripPlans(updated);
    try {
      localStorage.setItem(plansKey, JSON.stringify(updated));
    } catch (_err) {
      void _err;
    }
    setShowAddPlanModal(false);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    setBookingMsg(`🎉 Trip plan "${newPlan.title}" created successfully!`);
    setTimeout(() => setBookingMsg(''), 4000);
  };

  const handleDeleteTripPlan = (planId) => {
    const updated = savedTripPlans.filter(p => (p.plan_id !== planId && p.id !== planId));
    setSavedTripPlans(updated);
    try {
      localStorage.setItem(plansKey, JSON.stringify(updated));
    } catch (_err) {
      void _err;
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    try {
      const res = await changePassword({
        email: liveUser?.email,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordMsg(`🎉 ${res.message || 'Password updated successfully! You can now log in with your new password.'}`);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMsg(''), 6000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    }
  };

  // Working Logout handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch live user profile and dashboard data from backend API
  const fetchLiveDashboard = useCallback(async () => {
    if (!user?.email) { 
      return; 
    }
    try {
      const { data } = await api.get('/user-dashboard-data', { params: { email: user.email }, timeout: 1200 });
      if (data.success) {
        setDbUser(data.user);
        
        // Merge API bookings with any locally drafted bookings so they are never lost
        const localRequests = JSON.parse(localStorage.getItem(tripKey) || '[]');
        const combined = [...(data.bookings || [])];
        localRequests.forEach(req => {
          const reqId = req.display_id || req.id;
          if (!combined.some(b => (b.display_id || b.booking_id) === reqId)) {
            combined.push({
              booking_id: req.booking_id || Date.now(),
              display_id: reqId,
              booking_type: req.booking_type || getBookingType(req),
              package_title: req.package_title || req.packageTitle || req.destination || 'Travel Reservation',
              destination_name: req.destination_name || req.destination || '',
              departure_city: req.departure_city || '',
              carrier: req.carrier || '',
              seat: req.seat || '',
              gate: req.gate || '',
              travel_date: req.travel_date || req.startDate || '2026-11-20',
              start_date: req.start_date || req.startDate || '2026-11-20',
              end_date: req.end_date || req.endDate || '2026-11-20',
              guests: req.guests || 2,
              total_amount: req.total_amount || req.amount || 1200,
              booking_status: req.booking_status || req.status || 'Confirmed',
              status: req.status || 'confirmed',
              package_image: req.package_image || req.image || '/destination-images/swiss-alps.webp',
              notes: req.notes || ''
            });
          }
        });
        // Ensure rich authentic bookings are available for demo accounts even if backend returned empty array
        if (combined.length === 0 && isDemoUser) {
          combined.push(...DEFAULT_CUSTOMER_BOOKINGS);
        }
        setLiveBookings(combined);

        let loadedWishlist = [];
        const fromStorage = resolveWishlistFromStorage(userEmail);
        if (fromStorage.length > 0) {
          loadedWishlist = [...fromStorage];
        }

        if (data.wishlist && Array.isArray(data.wishlist) && data.wishlist.length > 0) {
          const existingIds = new Set(loadedWishlist.map(w => Number(w.package_id || w.id)));
          data.wishlist.forEach(w => {
            const numId = Number(w.package_id || w.id || w.target_id);
            if (numId && !existingIds.has(numId)) {
              const canonical = CANONICAL_PACKAGES.find(p => p.id === numId);
              loadedWishlist.push({
                ...w,
                id: numId,
                package_id: numId,
                title: w.title || canonical?.title || `Saved Adventure #${numId}`,
                price: w.price || canonical?.price || 1045,
                rating: w.rating || canonical?.rating || 4.9,
                image_url: w.image_url || canonical?.image_url || '/package-images/1-maldives.webp',
                destination: w.destination || canonical?.destination || 'Global Destination'
              });
              existingIds.add(numId);
            }
          });
        }

        if (loadedWishlist.length === 0 && isDemoUser) {
          loadedWishlist = [
            { id: 1, package_id: 1, title: 'Maldives Overwater Luxury Bungalow', price: 1045, rating: 4.9, image_url: '/package-images/1-maldives.webp', destination: 'Maldives' },
            { id: 2, package_id: 2, title: 'Santorini Villa & Yacht Week', price: 1242, rating: 4.8, image_url: '/package-images/2-santorini.webp', destination: 'Santorini, Greece' }
          ];
          try {
            localStorage.setItem(wishKey, JSON.stringify([1, 2]));
          } catch { /* ignore */ }
        } else {
          try {
            const ids = loadedWishlist.map(w => Number(w.package_id || w.id)).filter(Boolean);
            localStorage.setItem(wishKey, JSON.stringify(ids));
          } catch { /* ignore */ }
        }
        setLiveWishlist(loadedWishlist);

        const fallbackReviews = isDemoUser ? [
          { id: 1, package_id: 3, package_title: 'Swiss Alps Scenic Glacier Express', rating: 5, comment: 'Unbelievable alpine panoramas, smooth rail journeys, and warm mountain hospitality.', created_at: '2026-10-24' },
          { id: 2, package_id: 1, package_title: 'Kyoto Culture & Sakura Blossom Tour', rating: 5, comment: 'Kenji Sato was an extraordinary tour guide. The Ryokan onsen in Aman Kyoto was life-changing.', created_at: '2026-09-15' }
        ] : [];
        const loadedReviews = (data.reviews && data.reviews.length > 0) ? data.reviews : fallbackReviews;
        setReviews(loadedReviews);

        const fallbackNotifications = isDemoUser ? [
          { id: 1, title: '✈️ Boarding Pass Ready', message: 'Your e-ticket & PDF voucher for Air France AF-104 is generated and ready to download.', is_read: 0, created_at: '2026-11-20 09:30' },
          { id: 2, title: '🏨 Hotel Check-In Confirmation', message: 'Aman Kyoto confirmed your reservation for Susuki Pavilion from 15 Oct to 20 Oct.', is_read: 1, created_at: '2026-10-14 14:15' },
          { id: 3, title: '💳 Booking Payment Confirmed', message: 'Payment for Swiss Alps Glacier Express ($1,985) successfully processed.', is_read: 1, created_at: '2026-10-01 11:00' }
        ] : [];
        const loadedNotifications = (data.notifications && data.notifications.length > 0) ? data.notifications : fallbackNotifications;
        setNotifications(loadedNotifications);

        setAllPackages(data.allPackages || []);

        if (loadedWishlist.length > 0) {
          try {
            const wishIds = loadedWishlist.map(w => w.package_id || w.id).filter(Boolean);
            localStorage.setItem(wishKey, JSON.stringify(wishIds));
          } catch { /* ignore */ }
        }
        if (data.reviews) {
          try { localStorage.setItem(reviewsKey, JSON.stringify(data.reviews)); } catch { /* ignore */ }
        }
        if (data.notifications) {
          try { localStorage.setItem('ts_user_notifications', JSON.stringify(data.notifications)); } catch { /* ignore */ }
        }

        // Load trip plans from backend or localStorage (Task 8)
        try {
          let plans = [];
          try {
            const plansRes = await api.get(`/trip-plans?userId=${data.user?.id || user?.id || user?.user_id || 2}`, { timeout: 800 });
            if (plansRes.data && Array.isArray(plansRes.data)) {
              plans = plansRes.data;
            }
          } catch { /* ignore */ }
          if (plans.length === 0) {
            plans = JSON.parse(localStorage.getItem('ts_saved_itineraries') || '[]');
          }
          setSavedTripPlans(plans);
        } catch { /* ignore */ }

        // Parse country code and phone number
        const rawPhone = data.user?.phone || userPhone || '+91 9876543210';
        const matchedCountry = COUNTRIES.find(c => rawPhone.startsWith(c.code)) || COUNTRIES[0];
        setProfileCountryCode(matchedCountry.code);
        const digits = rawPhone.replace(matchedCountry.code, '').replace(/\D/g, '').slice(0, matchedCountry.digits);
        setProfileData({
          name: data.user?.name || user?.name || 'Alice Walker',
          phone: digits || '9876543210'
        });
      }
    } catch (err) {
      console.warn('Using cached dashboard session:', err);
      try {
        const localRequests = JSON.parse(localStorage.getItem(tripKey) || '[]');
        const fallbackBookings = localRequests.length > 0 ? localRequests.map((r, i) => ({
          booking_id: r.id || r.booking_id || (101 + i),
          display_id: r.display_id || (r.id ? ('#' + r.id) : ('#TS-' + (772918 + i))),
          booking_type: r.booking_type || getBookingType(r),
          package_title: r.package_title || r.packageTitle || r.destination || 'Swiss Alps Scenic Glacier Express',
          carrier: r.carrier || '',
          destination_name: r.destination_name || r.destination || 'Interlaken, Switzerland',
          departure_city: r.departure_city || 'Zurich Intl',
          travel_date: r.travel_date || r.startDate || '2026-11-18',
          start_date: r.start_date || r.startDate || '2026-11-18',
          end_date: r.end_date || r.endDate || '2026-11-25',
          guests: r.guests || 2,
          seat: r.seat || '',
          gate: r.gate || '',
          total_amount: r.total_amount || r.amount || 1985,
          booking_status: r.booking_status || r.status || 'Confirmed',
          status: r.status || 'confirmed',
          package_image: r.package_image || r.image || '/destination-images/swiss-alps.webp',
          notes: r.notes || ''
        })) : (isDemoUser ? DEFAULT_CUSTOMER_BOOKINGS : []);
        setLiveBookings(fallbackBookings);

        // Phone number initialization in fallback
        const rawPhone = userPhone;
        const matchedCountry = COUNTRIES.find(c => rawPhone.startsWith(c.code)) || COUNTRIES[0];
        setProfileCountryCode(matchedCountry.code);
        setProfileData({
          name: user?.name || 'Traveler',
          phone: rawPhone ? rawPhone.replace(matchedCountry.code, '').replace(/\D/g, '').slice(0, matchedCountry.digits) : '9876543210'
        });

        try {
          const fromStorage = resolveWishlistFromStorage(userEmail);
          if (fromStorage.length > 0) {
            setLiveWishlist(fromStorage);
          } else if (isDemoUser) {
            const defaultCatalog = [
              { id: 1, package_id: 1, title: 'Maldives Overwater Luxury Bungalow', price: 1045, rating: 4.9, image_url: '/package-images/1-maldives.webp', destination: 'Maldives' },
              { id: 2, package_id: 2, title: 'Santorini Villa & Yacht Week', price: 1242, rating: 4.8, image_url: '/package-images/2-santorini.webp', destination: 'Santorini, Greece' }
            ];
            setLiveWishlist(defaultCatalog);
            localStorage.setItem(wishKey, JSON.stringify([1, 2]));
          } else {
            setLiveWishlist([]);
          }
        } catch { /* ignore */ }

        try {
          const localReviews = JSON.parse(localStorage.getItem(reviewsKey) || '[]');
          if (localReviews.length > 0) {
            setReviews(localReviews);
          }
        } catch { /* ignore */ }

        try {
          const localNotifs = JSON.parse(localStorage.getItem('ts_user_notifications') || '[]');
          if (localNotifs.length > 0) {
            setNotifications(localNotifs);
          }
        } catch { /* ignore */ }

        try {
          const plans = JSON.parse(localStorage.getItem('ts_saved_itineraries') || '[]');
          setSavedTripPlans(plans);
        } catch { /* ignore */ }
      } catch { /* ignore fallback */ }
    } finally {
      // Completed loading
    }
  }, [user, userPhone]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLiveDashboard();
  }, [user, navigate, fetchLiveDashboard]);

  const liveUser = dbUser || user;
  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  // In-Dashboard Booking Handler -> Opens Secure Checkout & Payment Modal
  const handleBookPackage = (pkg) => {
    setBookingMsg('');
    const pkgId = pkg.package_id || pkg.id || 1;
    const priceNum = Number(pkg.price || 1045);
    const s = new Date();
    s.setDate(s.getDate() + 14);
    const startStr = s.toISOString().split('T')[0];
    const e = new Date(s);
    e.setDate(e.getDate() + (pkg.days || 7));
    const endStr = e.toISOString().split('T')[0];

    setCheckoutDetails({
      id: pkgId,
      packageId: pkgId,
      type: 'package',
      title: pkg.title || 'Tour Package Booking',
      destination: pkg.destination || pkg.location || 'Global Destination',
      image: pkg.image_url || pkg.image || '/package-images/1-maldives.webp',
      subtotal: priceNum * 2,
      price: priceNum,
      guests: 2,
      startDate: startStr,
      endDate: endStr
    });
    setShowCheckoutModal(true);
  };

  const handleCheckoutSuccess = (confirmedBooking) => {
    setShowCheckoutModal(false);
    setLiveBookings(prev => [confirmedBooking, ...prev]);
    confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 } });
    const isGuide = getBookingType(confirmedBooking) === 'guide';
    if (isGuide) {
      setBookingMsg(`🎉 Tour guide booking confirmed for "${confirmedBooking.package_title}"! View your booked guide reservation in the section below.`);
      setActiveTab('guides');
    } else {
      setBookingMsg(`🎉 Booking confirmed for "${confirmedBooking.package_title}"! Download your official voucher.`);
      setActiveTab('bookings');
    }
    setTimeout(() => setBookingMsg(''), 6000);
  };

  // Wishlist Handlers (Add & Remove)
  const handleAddToWishlist = async (pkg) => {
    const pkgId = pkg.package_id || pkg.id;
    const isAlready = liveWishlist.some(w => (w.package_id || w.id) === pkgId);
    if (isAlready) {
      await handleRemoveFromWishlist(pkgId);
      return;
    }

    const newWish = createFallbackWishlistItem(pkg);

    // Keep localStorage synchronized across packages and dashboard
    try {
      const local = JSON.parse(localStorage.getItem(wishKey) || '[]');
      if (!local.includes(pkgId)) local.push(pkgId);
      localStorage.setItem(wishKey, JSON.stringify(local));
    } catch { /* ignore */ }

    try {
      const { data } = await api.post('/wishlist', {
        userId: liveUser?.user_id || liveUser?.id,
        packageId: pkgId
      });
      if (data.success) {
        setBookingMsg(`❤️ Saved "${pkg.title}" to your wishlist!`);
        await fetchLiveDashboard();
        setTimeout(() => setBookingMsg(''), 4000);
        return;
      }
    } catch {
      /* Fallback to state */
    }

    setLiveWishlist(prev => [newWish, ...prev.filter(w => (w.package_id || w.id) !== pkgId)]);
    setBookingMsg(`❤️ Saved "${pkg.title}" to your wishlist!`);
    setTimeout(() => setBookingMsg(''), 4000);
  };

  const handleRemoveFromWishlist = async (pkgId) => {
    // Keep localStorage synchronized
    try {
      const local = JSON.parse(localStorage.getItem(wishKey) || '[]').filter(x => Number(x) !== Number(pkgId) && x !== pkgId);
      localStorage.setItem(wishKey, JSON.stringify(local));
    } catch { /* ignore */ }

    try {
      await api.delete(`/wishlist/${pkgId}`);
    } catch (err) {
      console.warn('Wishlist remove failed:', err);
    }
    setLiveWishlist(prev => prev.filter(w => (w.package_id || w.id) !== pkgId));
    setBookingMsg('Package removed from your wishlist.');
    setTimeout(() => setBookingMsg(''), 3000);
  };

  // Notification Handlers
  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.put('/notifications/read-all');
    } catch { /* ignore */ }
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, is_read: 1 }));
      try { localStorage.setItem('ts_user_notifications', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const handleMarkNotificationRead = async (notifId) => {
    try {
      await api.put(`/notifications/${notifId}/read`);
    } catch { /* ignore */ }
    setNotifications(prev => {
      const next = prev.map(n => n.notification_id === notifId ? { ...n, is_read: 1 } : n);
      try { localStorage.setItem('ts_user_notifications', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  // Save profile updates with country and name validation
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSavedMsg('');

    // Full Name validation: alphabetic characters and spaces only
    const trimmedName = profileData.name.trim();
    if (!/^[A-Za-z\s]{2,100}$/.test(trimmedName)) {
      setProfileError('Full Name must contain only alphabetic characters and spaces (2-100 characters).');
      return;
    }

    // Phone validation according to selected country
    const phoneDigits = profileData.phone.replace(/\D/g, '');
    if (activeCountry.code === '+91' && phoneDigits.length !== 10) {
      setProfileError('For India (+91), the mobile number must be exactly 10 digits.');
      return;
    }
    if (phoneDigits.length < 7 || phoneDigits.length > activeCountry.digits) {
      setProfileError(`For ${activeCountry.name}, mobile number must be between 7 and ${activeCountry.digits} digits.`);
      return;
    }

    const fullPhoneNumber = `${activeCountry.code} ${phoneDigits}`;
    setIsSavingProfile(true);

    try {
      const { data } = await api.put('/users/profile', {
        userId: liveUser?.user_id || liveUser?.id,
        name: trimmedName,
        phone: fullPhoneNumber
      });
      if (data.success && data.user) {
        setDbUser(data.user);
        setProfileSavedMsg('Profile updated successfully!');
        return;
      }
    } catch (err) {
      console.warn('Profile save warning:', err);
    } finally {
      setIsSavingProfile(false);
      setTimeout(() => setProfileSavedMsg(''), 4000);
    }

    const updatedUser = {
      ...(dbUser || user || {}),
      name: trimmedName,
      phone: fullPhoneNumber,
      avatar_url: profileData.avatar_url || liveUser?.avatar_url || '/destination-images/swiss-alps.webp'
    };
    setDbUser(updatedUser);
    try {
      localStorage.setItem('ts_user_profile', JSON.stringify(updatedUser));
      if (profileData.avatar_url) {
        localStorage.setItem(avatarKey, profileData.avatar_url);
      }
    } catch { /* ignore */ }
    setProfileSavedMsg('Profile updated successfully!');
  };

  // Review & Feedback Form Handlers
  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!editingReview && !reviewForm.packageId) {
      setReviewStatusMsg('Please select a completed booking or service to review.');
      return;
    }
    const chosenBooked = bookedPackages.find(p => String(p.package_id) === String(reviewForm.packageId));
    if (chosenBooked && !chosenBooked.isFinished) {
      setReviewStatusMsg(`Reviews can only be submitted after your booking dates have finished (${chosenBooked.date || 'past trip date'}).`);
      return;
    }
    if (!reviewForm.comment.trim()) {
      setReviewStatusMsg('Please write your review feedback before submitting.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewStatusMsg('');

    try {
      if (editingReview) {
        // Edit existing review: updates in-place without creating a duplicate
        const { data } = await api.put(`/reviews/${editingReview.review_id}`, {
          userId: liveUser?.user_id || liveUser?.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim()
        });
        if (data.success) {
          const updated = reviews.map(r => r.review_id === editingReview.review_id ? {
            ...r,
            rating: reviewForm.rating,
            comment: reviewForm.comment.trim(),
            updated_at: new Date().toISOString()
          } : r);
          setReviews(updated);
          try { localStorage.setItem(reviewsKey, JSON.stringify(updated)); } catch { /* ignore */ }
          setEditingReview(null);
          setReviewForm({ rating: 5, comment: '', packageId: '' });
          setReviewStatusMsg('✓ Review updated successfully in your account!');
          setIsSubmittingReview(false);
          setTimeout(() => setReviewStatusMsg(''), 4000);
          return;
        }
      } else {
        // Submit new review
        const chosenPkg = chosenBooked 
          || allPackages.find(p => String(p.package_id || p.id) === String(reviewForm.packageId)) 
          || { title: 'Tour Package' };
        const { data } = await api.post('/reviews', {
          userId: liveUser?.user_id || liveUser?.id,
          packageId: chosenPkg ? (chosenPkg.package_id || chosenPkg.id) : 1,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim()
        });
        if (data.success) {
          const newRev = {
            review_id: data.reviewId || Date.now(),
            user_id: liveUser?.user_id || liveUser?.id,
            rating: reviewForm.rating,
            comment: reviewForm.comment.trim(),
            package_title: chosenPkg?.title || 'Tour Package',
            created_at: new Date().toISOString()
          };
          const next = [newRev, ...reviews];
          setReviews(next);
          try { localStorage.setItem(reviewsKey, JSON.stringify(next)); } catch { /* ignore */ }
          setReviewForm({ rating: 5, comment: '', packageId: '' });
          setReviewStatusMsg('✓ Thank you! Your review has been submitted.');
          setIsSubmittingReview(false);
          setTimeout(() => setReviewStatusMsg(''), 4000);
          return;
        }
      }
    } catch (err) {
      console.warn('Review save error:', err);
    }

    // Local fallback update
    if (editingReview) {
      const updated = reviews.map(r => r.review_id === editingReview.review_id ? {
        ...r,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        updated_at: new Date().toISOString()
      } : r);
      setReviews(updated);
      try { localStorage.setItem(reviewsKey, JSON.stringify(updated)); } catch { /* ignore */ }
      setEditingReview(null);
      setReviewStatusMsg('✓ Review updated successfully!');
    } else {
      const chosenPkg = chosenBooked 
        || allPackages.find(p => String(p.package_id || p.id) === String(reviewForm.packageId)) 
        || { title: 'Tour Package' };
      const fallbackRev = createFallbackReview(
        chosenPkg?.title || 'Tour Package',
        reviewForm.rating,
        reviewForm.comment.trim()
      );
      const next = [fallbackRev, ...reviews];
      setReviews(next);
      try { localStorage.setItem(reviewsKey, JSON.stringify(next)); } catch { /* ignore */ }
      setReviewStatusMsg('✓ Review submitted successfully!');
    }
    setReviewForm({ rating: 5, comment: '', packageId: '' });
    setIsSubmittingReview(false);
    setTimeout(() => setReviewStatusMsg(''), 4000);
  };

  const handleStartEditReview = (rev) => {
    setEditingReview(rev);
    setReviewForm({
      rating: rev.rating,
      comment: rev.comment,
      packageId: rev.package_id || ''
    });
    setActiveTab('reviews');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditReview = () => {
    setEditingReview(null);
    setReviewForm({ rating: 5, comment: '', packageId: '' });
  };

  // Submit quick feedback from dashboard overview card
  const handleQuickOverviewReview = async () => {
    if (!overviewComment.trim()) return;
    try {
      await api.post('/reviews', {
        userId: liveUser?.user_id || liveUser?.id,
        packageId: liveBookings[0]?.package_id || 1,
        rating: overviewRating,
        comment: overviewComment.trim()
      });
    } catch { /* ignore */ }

    const quickRev = createFallbackReview(
      liveBookings[0]?.package_title || 'Swiss Alps Glacier Pass',
      overviewRating,
      overviewComment.trim()
    );
    const next = [quickRev, ...reviews];
    setReviews(next);
    try { localStorage.setItem(reviewsKey, JSON.stringify(next)); } catch { /* ignore */ }
    setOverviewSubmitted(true);
    setOverviewComment('');
    setTimeout(() => setOverviewSubmitted(false), 4000);
  };

  return (
    <div className="ts-dashboard-page">
      
      {/* 1. TOP HEADER NAVBAR */}
      <header className="ts-top-nav">
        <div className="ts-top-nav-left">
          {/* Mobile Hamburger Menu Button */}
          <button 
            type="button" 
            className="ts-mobile-menu-btn"
            onClick={() => setShowMobileDrawer(prev => !prev)}
            aria-label="Toggle navigation drawer"
            title="Navigation Menu"
          >
            {showMobileDrawer ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" className="ts-logo-wrap">
            <div className="ts-logo-icon">✈</div>
            <span>TravelSphere</span>
          </Link>
        </div>

        <nav className="ts-nav-links">
          <button 
            className={`ts-nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`ts-nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings
          </button>
          <button 
            className={`ts-nav-link ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            Wishlist
          </button>
          <button 
            className={`ts-nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            My Reviews
          </button>
          <button 
            className={`ts-nav-link ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
          >
            Trip Plans ({savedTripPlans.length})
          </button>
          <button 
            className={`ts-nav-link ${activeTab === 'guides' ? 'active' : ''}`}
            onClick={() => setActiveTab('guides')}
          >
            Tour Guides
          </button>
          <button 
            className={`ts-nav-link ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            Explore
          </button>
        </nav>

        <div className="ts-header-right">
          <div className="ts-search-pill" style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search trips, destination..." 
              value={searchQuery}
              onFocus={() => setShowSearchRecs(true)}
              onBlur={() => setTimeout(() => setShowSearchRecs(false), 180)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPkgSearch(e.target.value);
                setShowSearchRecs(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowSearchRecs(false);
                  setActiveTab('explore');
                }
              }}
            />
            {showSearchRecs && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  width: '320px',
                  maxWidth: '90vw',
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.2)',
                  zIndex: 1200,
                  padding: '0.5rem',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0.35rem 0.6rem' }}>
                  {searchQuery.trim() ? 'Matching Recommendations' : 'Recommended Destinations & Packages'}
                </div>
                {searchRecommendations.length > 0 ? (
                  searchRecommendations.map(rec => (
                    <button
                      key={rec.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchQuery(rec.query);
                        setPkgSearch(rec.query);
                        setShowSearchRecs(false);
                        setActiveTab('explore');
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.5rem 0.6rem',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <SmartImage src={rec.image} alt={rec.title} style={{ width: 38, height: 38, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rec.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rec.type} • {rec.subtitle}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#a3704c' }}>
                        {formatPrice(rec.price)}
                      </span>
                    </button>
                  ))
                ) : (
                  <div style={{ padding: '0.75rem', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                    No matching destinations found. Press Enter to search all packages.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* NOTIFICATION BELL WITH DROPDOWN */}
          <div className="ts-notif-wrap">
            <button 
              className="ts-notif-btn" 
              title="Notifications"
              onClick={() => setShowNotifDropdown(prev => !prev)}
              aria-label="View notifications"
            >
              <Bell size={20} />
              {unreadNotifCount > 0 && <span className="ts-notif-badge">{unreadNotifCount}</span>}
            </button>

            {showNotifDropdown && (
              <div className="ts-notif-dropdown">
                <div className="ts-notif-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Bell size={16} color="#2563eb" />
                    <span>Notifications ({notifications.length})</span>
                  </div>
                  {unreadNotifCount > 0 && (
                    <button 
                      type="button" 
                      className="ts-notif-mark-read"
                      onClick={handleMarkAllNotificationsRead}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="ts-notif-list">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div 
                        key={notif.notification_id}
                        className={`ts-notif-item ${notif.is_read ? '' : 'unread'}`}
                        onClick={() => handleMarkNotificationRead(notif.notification_id)}
                      >
                        <div className="ts-notif-item-top">
                          <div className="ts-notif-item-title">
                            {!notif.is_read && <span className="ts-unread-dot" />}
                            <span>{notif.title}</span>
                          </div>
                          <span className="ts-notif-time">
                            {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <div className="ts-notif-msg">{notif.message}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                      <CheckCircle size={24} color="#16a34a" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                      You have no new notifications.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="ts-user-profile-wrap" style={{ position: 'relative' }}>
            <div 
              className="ts-user-profile-btn" 
              onClick={() => setShowUserDropdown(prev => !prev)}
              style={{ cursor: 'pointer' }}
            >
              <SmartImage 
                src={liveUser?.avatar_url || "/destination-images/swiss-alps.webp"} 
                alt="User Avatar" 
                className="ts-user-avatar"
              />
              <div className="ts-user-info-text">
                <span className="ts-user-name">{liveUser?.name || 'Traveler'}</span>
                <span className="ts-user-tag">Verified Member</span>
              </div>
              <ChevronDown size={14} color="#64748b" style={{ transform: showUserDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </div>

            {showUserDropdown && (
              <div 
                className="ts-user-menu-dropdown" 
                style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '220px', maxWidth: 'calc(100vw - 20px)', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.18)', zIndex: 1000, padding: '8px 0', animation: 'fadeIn 0.15s ease' }}
              >
                <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>{liveUser?.name || 'Alice Walker'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{liveUser?.email || 'customer@travelsphere.org'}</div>
                </div>
                <button 
                  type="button" 
                  onClick={() => { setActiveTab('profile'); setShowUserDropdown(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'none', border: 'none', fontSize: '0.84rem', fontWeight: 600, color: '#334155', cursor: 'pointer', textAlign: 'left' }}
                >
                  <User size={15} color="#a3704c" /> My Profile
                </button>
                <button 
                  type="button" 
                  onClick={() => { setActiveTab('settings'); setShowUserDropdown(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'none', border: 'none', fontSize: '0.84rem', fontWeight: 600, color: '#334155', cursor: 'pointer', textAlign: 'left' }}
                >
                  <Settings size={15} color="#a3704c" /> Account Settings
                </button>
                <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
                <button 
                  type="button" 
                  onClick={() => { setShowUserDropdown(false); handleLogout(); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'none', border: 'none', fontSize: '0.84rem', fontWeight: 700, color: '#dc2626', cursor: 'pointer', textAlign: 'left' }}
                >
                  <LogOut size={15} color="#dc2626" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE NAVIGATION DRAWER & BACKDROP */}
      {showMobileDrawer && createPortal(
        <div className="ts-mobile-drawer-portal">
          <div className="ts-mobile-drawer-backdrop" onClick={() => setShowMobileDrawer(false)} />
          <aside className="ts-mobile-drawer">
            <div className="ts-drawer-header">
              <div className="ts-drawer-user">
                <SmartImage 
                  src={liveUser?.avatar_url || "/destination-images/swiss-alps.webp"} 
                  alt="Avatar" 
                  className="ts-drawer-avatar"
                />
                <div>
                  <div className="ts-drawer-name">{liveUser?.name || 'Traveler'}</div>
                  <div className="ts-drawer-email">{liveUser?.email || 'customer@travelsphere.org'}</div>
                </div>
              </div>
              <button 
                type="button" 
                className="ts-drawer-close-btn"
                onClick={() => setShowMobileDrawer(false)}
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="ts-drawer-section-title">PORTAL NAVIGATION</div>
            <nav className="ts-drawer-nav">
              <button 
                className={`ts-drawer-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => { setActiveTab('dashboard'); setShowMobileDrawer(false); }}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard Overview</span>
              </button>

              <button 
                className={`ts-drawer-link ${activeTab === 'bookings' && bookingFilter === 'all' ? 'active' : ''}`}
                onClick={() => { setActiveTab('bookings'); setBookingFilter('all'); setShowMobileDrawer(false); }}
              >
                <Calendar size={18} />
                <span>My Bookings</span>
                {liveBookings.length > 0 && <span className="ts-drawer-badge">{liveBookings.length}</span>}
              </button>

              <button 
                className={`ts-drawer-link ${activeTab === 'bookings' && bookingFilter === 'flight' ? 'active' : ''}`}
                onClick={() => { setActiveTab('bookings'); setBookingFilter('flight'); setShowMobileDrawer(false); }}
              >
                <Plane size={18} />
                <span>Flights</span>
                {flightBookings.length > 0 && <span className="ts-drawer-badge">{flightBookings.length}</span>}
              </button>

              <button 
                className={`ts-drawer-link ${activeTab === 'bookings' && bookingFilter === 'train' ? 'active' : ''}`}
                onClick={() => { setActiveTab('bookings'); setBookingFilter('train'); setShowMobileDrawer(false); }}
              >
                <Train size={18} />
                <span>Trains</span>
                {trainBookings.length > 0 && <span className="ts-drawer-badge">{trainBookings.length}</span>}
              </button>

              <button 
                className={`ts-drawer-link ${activeTab === 'bookings' && bookingFilter === 'bus' ? 'active' : ''}`}
                onClick={() => { setActiveTab('bookings'); setBookingFilter('bus'); setShowMobileDrawer(false); }}
              >
                <Bus size={18} />
                <span>Buses</span>
                {busBookings.length > 0 && <span className="ts-drawer-badge">{busBookings.length}</span>}
              </button>

              <button 
                className={`ts-drawer-link ${activeTab === 'bookings' && bookingFilter === 'car' ? 'active' : ''}`}
                onClick={() => { setActiveTab('bookings'); setBookingFilter('car'); setShowMobileDrawer(false); }}
              >
                <Car size={18} />
                <span>Car Rentals</span>
                {carBookings.length > 0 && <span className="ts-drawer-badge">{carBookings.length}</span>}
              </button>

              <button 
                className={`ts-drawer-link ${activeTab === 'bookings' && bookingFilter === 'guide' ? 'active' : ''}`}
                onClick={() => { setActiveTab('bookings'); setBookingFilter('guide'); setShowMobileDrawer(false); }}
              >
                <Award size={18} />
                <span>Tour Guides</span>
                {guideBookings.length > 0 && <span className="ts-drawer-badge">{guideBookings.length}</span>}
              </button>

              <button 
                className={`ts-drawer-link ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => { setActiveTab('wishlist'); setShowMobileDrawer(false); }}
              >
                <Heart size={18} />
                <span>Adventures Wishlist</span>
                {liveWishlist.length > 0 && <span className="ts-drawer-badge">{liveWishlist.length}</span>}
              </button>

              <button 
                className={`ts-drawer-link ${activeTab === 'plans' ? 'active' : ''}`}
                onClick={() => { setActiveTab('plans'); setShowMobileDrawer(false); }}
              >
                <Compass size={18} />
                <span>Custom Trip Plans</span>
                {savedTripPlans.length > 0 && <span className="ts-drawer-badge">{savedTripPlans.length}</span>}
              </button>

              <button 
                className={`ts-drawer-link ${activeTab === 'guides' ? 'active' : ''}`}
                onClick={() => { setActiveTab('guides'); setShowMobileDrawer(false); }}
              >
                <Award size={18} />
                <span>Tour Guides</span>
              </button>

              <button 
                className={`ts-drawer-link ${activeTab === 'explore' ? 'active' : ''}`}
                onClick={() => { setActiveTab('explore'); setShowMobileDrawer(false); }}
              >
                <Compass size={18} />
                <span>Explore Packages</span>
              </button>

              <button 
                className={`ts-drawer-link ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => { setActiveTab('reviews'); setShowMobileDrawer(false); }}
              >
                <MessageSquare size={18} />
                <span>My Reviews</span>
                {reviews.length > 0 && <span className="ts-drawer-badge">{reviews.length}</span>}
              </button>

              <button 
                className={`ts-drawer-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => { setActiveTab('profile'); setShowMobileDrawer(false); }}
              >
                <Settings size={18} />
                <span>Account & Profile</span>
              </button>
            </nav>

            <div className="ts-drawer-footer">
              <button 
                type="button" 
                className="ts-drawer-logout-btn"
                onClick={() => { setShowMobileDrawer(false); handleLogout(); }}
              >
                <LogOut size={16} /> Sign Out Account
              </button>
            </div>
          </aside>
        </div>,
        document.body
      )}

      {/* 2. BODY LAYOUT (SIDEBAR + MAIN CONTENT) */}
      <div className="ts-dashboard-body">
        
        {/* LEFT SIDEBAR MENU */}
        <aside className="ts-sidebar">
          <div>
            <div className="ts-sidebar-title">PORTAL MENU</div>
            <nav className="ts-sidebar-menu">
              <button 
                className={`ts-sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>

              <button 
                className={`ts-sidebar-item ${activeTab === 'bookings' && bookingFilter === 'all' ? 'active' : ''}`}
                onClick={() => { setActiveTab('bookings'); setBookingFilter('all'); }}
              >
                <Calendar size={18} />
                <span>My Bookings ({liveBookings.length})</span>
              </button>

              <button 
                className={`ts-sidebar-item ${activeTab === 'bookings' && bookingFilter === 'flight' ? 'active' : ''}`}
                onClick={() => { setActiveTab('bookings'); setBookingFilter('flight'); }}
              >
                <Plane size={18} />
                <span>Flights ({flightBookings.length})</span>
              </button>

              <button 
                className={`ts-sidebar-item ${activeTab === 'bookings' && bookingFilter === 'train' ? 'active' : ''}`}
                onClick={() => { setActiveTab('bookings'); setBookingFilter('train'); }}
              >
                <Train size={18} />
                <span>Trains ({trainBookings.length})</span>
              </button>

              <button 
                className={`ts-sidebar-item ${activeTab === 'bookings' && bookingFilter === 'bus' ? 'active' : ''}`}
                onClick={() => { setActiveTab('bookings'); setBookingFilter('bus'); }}
              >
                <Bus size={18} />
                <span>Buses ({busBookings.length})</span>
              </button>

              <button 
                className={`ts-sidebar-item ${activeTab === 'bookings' && bookingFilter === 'car' ? 'active' : ''}`}
                onClick={() => { setActiveTab('bookings'); setBookingFilter('car'); }}
              >
                <Car size={18} />
                <span>Cars ({carBookings.length})</span>
              </button>

              <button 
                className={`ts-sidebar-item ${activeTab === 'bookings' && bookingFilter === 'guide' ? 'active' : ''}`}
                onClick={() => { setActiveTab('bookings'); setBookingFilter('guide'); }}
              >
                <Award size={18} />
                <span>Guides ({guideBookings.length})</span>
              </button>

              <button 
                className={`ts-sidebar-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <Heart size={18} />
                <span>Wishlist ({liveWishlist.length})</span>
              </button>

              <button 
                className={`ts-sidebar-item ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                <MessageSquare size={18} />
                <span>My Reviews ({reviews.length})</span>
              </button>

              <button 
                className={`ts-sidebar-item ${activeTab === 'plans' ? 'active' : ''}`}
                onClick={() => setActiveTab('plans')}
              >
                <Compass size={18} />
                <span>Trip Plans ({savedTripPlans.length})</span>
              </button>

              <button 
                className={`ts-sidebar-item ${activeTab === 'guides' ? 'active' : ''}`}
                onClick={() => setActiveTab('guides')}
              >
                <Award size={18} />
                <span>Tour Guides</span>
              </button>

              <button 
                className={`ts-sidebar-item ${activeTab === 'explore' ? 'active' : ''}`}
                onClick={() => setActiveTab('explore')}
              >
                <Compass size={18} />
                <span>Explore Packages</span>
              </button>

              <button className="ts-sidebar-item" onClick={() => navigate('/support')}>
                <HelpCircle size={18} />
                <span>Help & FAQs</span>
              </button>
            </nav>
          </div>

          <div className="ts-sidebar-menu">
            <button 
              className={`ts-sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>

            <button className="ts-sidebar-item logout-item" onClick={handleLogout} title="Log Out">
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT */}
        <main className="ts-main-content">

          {bookingMsg && (
            <div style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.85rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
              {bookingMsg}
            </div>
          )}

          {profileSavedMsg && (
            <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
              ✓ {profileSavedMsg}
            </div>
          )}

          {/* TAB 1: DASHBOARD MAIN OVERVIEW */}
          {activeTab === 'dashboard' && (
            <>
              {/* SECTION 1: HERO HEADER CARD */}
              <div className="ts-hero-card">
                <div className="ts-hero-top-row">
                  <div>
                    <div className="ts-club-badge">
                      <span>● Traveler Club Elite</span>
                    </div>
                    <h1 className="ts-hero-heading">
                      Welcome back, {liveUser?.name ? liveUser.name.split(' ')[0] : 'Traveler'}! 🌍
                    </h1>
                    <p className="ts-hero-sub">
                      You have <strong>{liveBookings.length} upcoming trip{liveBookings.length === 1 ? '' : 's'}</strong>. {liveBookings.length === 0 ? 'Ready to pack your bags and explore the world?' : 'Get ready for your journey!'}
                    </p>
                  </div>

                  <div className="ts-hero-actions">
                    <button className="ts-btn-outline" onClick={() => setActiveTab('profile')}>
                      <Edit size={14} /> Edit Profile
                    </button>
                    <Link to="/packages" className="ts-btn-primary">
                      <Plus size={14} /> Plan New Trip
                    </Link>
                  </div>
                </div>

                {/* 4 METRIC STAT CARDS */}
                <div className="ts-metrics-grid">
                  <div className="ts-metric-box">
                    <div className="ts-metric-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                      💼
                    </div>
                    <div>
                      <div className="ts-metric-num">{liveBookings.filter(b => b.status === 'confirmed').length} Active</div>
                      <div className="ts-metric-label">Booked & Confirmed</div>
                    </div>
                  </div>

                  <div className="ts-metric-box">
                    <div className="ts-metric-icon-wrap" style={{ background: '#fff7ed', color: '#ea580c' }}>
                      🧡
                    </div>
                    <div>
                      <div className="ts-metric-num">{liveWishlist.length} Saved</div>
                      <div className="ts-metric-label">Adventures Wishlist</div>
                    </div>
                  </div>

                  <div className="ts-metric-box">
                    <div className="ts-metric-icon-wrap" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      🪙
                    </div>
                    <div>
                      <div className="ts-metric-num">{liveBookings.length * 500} pts</div>
                      <div className="ts-metric-label">{formatPrice(liveBookings.length * 5)} reward value</div>
                    </div>
                  </div>

                  <div className="ts-metric-box" onClick={() => setActiveTab('reviews')} style={{ cursor: 'pointer' }}>
                    <div className="ts-metric-icon-wrap" style={{ background: '#faf5ff', color: '#9333ea' }}>
                      ⭐
                    </div>
                    <div>
                      <div className="ts-metric-num">{reviews.length} Reviews</div>
                      <div className="ts-metric-label">Community Explorer</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: FAST GATEWAY SEARCH WIDGET */}
              <div className="ts-fast-gateway-card">
                <div className="ts-gateway-header">
                  <div>
                    <div className="ts-section-tag">FAST GATEWAY</div>
                    <div className="ts-section-title">Book Your Next Travel</div>
                  </div>

                  <div className="ts-gateway-tabs">
                    <button type="button" className="ts-tab-pill active" onClick={() => setActiveTab('explore')}>🎫 Tour Packages</button>
                    <button type="button" className="ts-tab-pill" onClick={() => navigate('/hotels')}>🏨 Hotels</button>
                    <button type="button" className="ts-tab-pill" onClick={() => setShowFastBookingModal('flight')}>✈ Flights</button>
                    <button type="button" className="ts-tab-pill" onClick={() => setShowFastBookingModal('train')}>🚆 Trains</button>
                    <button type="button" className="ts-tab-pill" onClick={() => setShowFastBookingModal('bus')}>🚌 Buses</button>
                    <button type="button" className="ts-tab-pill" onClick={() => setShowFastBookingModal('car')}>🚗 Car Rentals</button>
                  </div>
                </div>

                <div className="ts-search-grid-bar">
                  <div className="ts-input-card">
                    <div className="ts-input-label">📍 Departure</div>
                    <input type="text" className="ts-input-field" defaultValue="New York, JFK" />
                  </div>

                  <div className="ts-input-card">
                    <div className="ts-input-label">📍 Destination</div>
                    <input type="text" className="ts-input-field" defaultValue="Kyoto, Japan" />
                  </div>

                  <div className="ts-input-card">
                    <div className="ts-input-label">📅 Travel Dates</div>
                    <input type="text" className="ts-input-field" defaultValue="Select Dates" />
                  </div>

                  <div className="ts-input-card">
                    <div className="ts-input-label">👥 Guests / Class</div>
                    <input type="text" className="ts-input-field" defaultValue="2 Guests, Economy" />
                  </div>

                  <Link to="/packages" className="ts-search-submit-btn" title="Search Travels" style={{ textDecoration: 'none' }}>
                    <Search size={20} />
                    <span className="ts-search-btn-label">Search Available Trips</span>
                  </Link>
                </div>

                {/* TRENDING POPULAR DESTINATIONS CHIPS */}
                <div className="ts-trending-chips-row">
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>POPULAR:</span>
                  {[
                    { name: 'Swiss Alps', icon: '🏔️' },
                    { name: 'Maldives', icon: '🏖️' },
                    { name: 'Kyoto', icon: '🌸' },
                    { name: 'Bali', icon: '🌴' },
                    { name: 'Paris', icon: '🗼' }
                  ].map(item => (
                    <button
                      key={item.name}
                      type="button"
                      className="ts-trending-chip"
                      onClick={() => {
                        setSearchQuery(item.name);
                        setPkgSearch(item.name);
                        setActiveTab('explore');
                      }}
                    >
                      <span>{item.icon}</span> <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 3: 2-COLUMN FEATURE GRID */}
              <div className="ts-main-grid-2col">
                
                {/* LEFT HERO TOUR HIGHLIGHT CARD */}
                <div className="ts-tour-highlight-card">
                  {liveBookings.length > 0 ? (
                    <>
                      <div 
                        className="ts-tour-banner-img" 
                        style={{ backgroundImage: `url('${liveBookings[0].package_image || '/destination-images/swiss-alps.webp'}')` }}
                      >
                        <div className="ts-banner-content-top">
                          <span className="ts-badge-pill-orange">● Live Booking</span>
                          <span className="ts-badge-pill-orange" style={{ background: 'rgba(15, 23, 42, 0.75)', color: '#38bdf8', backdropFilter: 'blur(6px)' }}>
                            ⏳ {getDaysUntilTrip(liveBookings[0].start_date)} Days to Departure
                          </span>
                          <span className="ts-ref-code">Booking Ref: {liveBookings[0].display_id || `TS-${liveBookings[0].booking_id}`}</span>
                        </div>

                        <div className="ts-banner-content-bottom">
                          <div style={{ fontSize: '0.75rem', letterSpacing: '0.08em', fontWeight: 800, color: '#38bdf8', marginBottom: '0.2rem' }}>
                            UPCOMING TOUR HIGHLIGHT
                          </div>
                          <h2 className="ts-tour-hero-title">
                            {liveBookings[0].package_title || 'Custom Tour Booking'}
                          </h2>
                          <div className="ts-tour-hero-route">
                            <span>📍 {liveBookings[0].destination_name || 'Destination'}</span>
                            <span>• 👥 {liveBookings[0].guests || 1} Traveler(s)</span>
                          </div>
                        </div>
                      </div>

                      <div className="ts-tour-card-body">
                        <div className="ts-stepper-wrap">
                          <div className="ts-step-item done">
                            <CheckCircle size={14} />
                            <span>Booking Placed</span>
                          </div>
                          <div className="ts-step-item done">
                            <CheckCircle size={14} />
                            <span>Confirmed</span>
                          </div>
                          <div className="ts-step-item done">
                            <CheckCircle size={14} />
                            <span>Vouchers Ready</span>
                          </div>
                        </div>

                        <div className="ts-details-4grid">
                          <div className="ts-detail-box">
                            <div className="ts-detail-label">Dates</div>
                            <div className="ts-detail-val">{liveBookings[0].start_date ? new Date(liveBookings[0].start_date).toLocaleDateString() : (liveBookings[0].travel_date || 'Nov 18, 2026')}</div>
                          </div>
                          <div className="ts-detail-box">
                            <div className="ts-detail-label">Status</div>
                            <div className="ts-detail-val" style={{ color: '#16a34a' }}>{liveBookings[0].status}</div>
                          </div>
                          <div className="ts-detail-box">
                            <div className="ts-detail-label">Total Amount</div>
                            <div className="ts-detail-val">{formatPrice(liveBookings[0].total_amount)}</div>
                          </div>
                        </div>

                        {/* INTERACTIVE PRE-TRIP CHECKLIST */}
                        <div className="ts-pre-trip-box">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-dark)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <CheckCircle size={14} color="#16a34a" /> Pre-Trip Preparation Checklist
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>
                              {checklistCount} of {DEFAULT_CHECKLIST.length} Ready ({Math.round((checklistCount / DEFAULT_CHECKLIST.length) * 100)}%)
                            </span>
                          </div>

                          <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.65rem' }}>
                            <div style={{ width: `${(checklistCount / DEFAULT_CHECKLIST.length) * 100}%`, height: '100%', background: '#16a34a', transition: 'width 0.3s ease' }} />
                          </div>

                          <div className="ts-checklist-grid">
                            {DEFAULT_CHECKLIST.map((item) => (
                              <label key={item.id} className="ts-checklist-item" style={{ color: checklist[item.id] ? '#16a34a' : '#475569' }}>
                                <input 
                                  type="checkbox" 
                                  checked={Boolean(checklist[item.id])} 
                                  onChange={() => toggleChecklistItem(item.id)}
                                />
                                <span style={{ textDecoration: checklist[item.id] ? 'line-through' : 'none' }}>{item.text}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="ts-hero-tour-actions" style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="ts-btn-primary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
                            onClick={() => generateBookingPDF({
                              id: liveBookings[0].display_id || liveBookings[0].booking_id,
                              title: liveBookings[0].package_title,
                              amount: liveBookings[0].total_amount,
                              status: liveBookings[0].status,
                              startDate: liveBookings[0].start_date,
                              endDate: liveBookings[0].end_date,
                              guests: liveBookings[0].guests,
                              guestName: liveUser?.name || 'Verified Traveler',
                              email: liveUser?.email
                            })}
                          >
                            <FileDown size={15} /> Download Official Voucher & Boarding Pass (PDF)
                          </button>

                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(`✈️ Great news! Our trip to "${liveBookings[0].package_title}" is confirmed! Booking Ref: ${liveBookings[0].display_id || liveBookings[0].booking_id}. Destination: ${liveBookings[0].destination_name || 'Global Destination'}. Travel Date: ${liveBookings[0].start_date || 'Nov 18, 2026'}. View details on TravelSphere!`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ts-btn-outline"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem', fontSize: '0.82rem', textDecoration: 'none', color: '#15803d', borderColor: '#bbf7d0', background: '#f0fdf4' }}
                            title="Share booking with family on WhatsApp"
                          >
                            <span>💬 WhatsApp Family</span>
                          </a>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '3rem 2rem', textTransform: 'none', textAlign: 'center' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text-dark)' }}>
                        No Active Trips Booked Yet
                      </h3>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                        You currently have <strong>0 live bookings</strong> in your account. Explore our handcrafted tour packages and reserve your next adventure!
                      </p>
                      <Link to="/packages" className="ts-btn-primary" style={{ display: 'inline-flex', padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>
                        Explore Tour Packages to Book ➔
                      </Link>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN CARDS */}
                <div className="ts-right-cards-col">
                  
                  {/* TRAVELER PROFILE CARD */}
                  <div className="ts-card-panel">
                    <div className="ts-panel-header">
                      <span className="ts-panel-title">Traveler Profile</span>
                      <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.725rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap' }}>
                        <CheckCircle size={10} /> Verified Traveler
                      </span>
                    </div>

                    <div className="ts-profile-user-row">
                      <SmartImage 
                        src={liveUser?.avatar_url || "/destination-images/swiss-alps.webp"} 
                        alt="Profile" 
                        style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{liveUser?.name || 'Traveler'}</div>
                        <div style={{ fontSize: '0.775rem', color: '#64748b' }}>{liveUser?.email || 'email@example.com'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                          <Phone size={13} /> {userPhone} <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Verified</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                      ACCOUNT DETAILS
                    </div>

                    <div className="ts-card-list">
                      <div className="ts-card-item">
                        <div>
                          <div style={{ fontWeight: 700 }}>Traveler ID</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>#TS-{liveUser?.user_id || liveUser?.id || 101}</div>
                        </div>
                        <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.75rem' }}>Active Member</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                      <span>🛡️ Verified Account</span>
                      <button onClick={() => setActiveTab('profile')} style={{ color: '#2563eb', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                        Edit Profile
                      </button>
                    </div>
                  </div>

                  {/* TRIP FEEDBACK CARD */}
                  <div className="ts-card-panel">
                    <div className="ts-panel-header">
                      <span className="ts-panel-title">Trip Feedback</span>
                      <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.725rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                        Community
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                      Share your recent travel experiences with community travelers.
                    </p>

                    <div className="ts-star-rating-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={20} 
                          fill={star <= overviewRating ? "#f59e0b" : "none"} 
                          color={star <= overviewRating ? "#f59e0b" : "#cbd5e1"} 
                          onClick={() => setOverviewRating(star)}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </div>

                    <textarea 
                      className="ts-textarea" 
                      placeholder="Write your review or feedback..."
                      value={overviewComment}
                      onChange={(e) => setOverviewComment(e.target.value)}
                    />

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button 
                        type="button"
                        className="ts-btn-primary" 
                        style={{ flex: 1, justifyContent: 'center', padding: '0.5rem', fontSize: '0.775rem' }}
                        onClick={handleQuickOverviewReview}
                      >
                        {overviewSubmitted ? '✓ Submitted!' : 'Submit Review'}
                      </button>
                      <button
                        type="button"
                        className="ts-btn-outline"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.775rem' }}
                        onClick={() => setActiveTab('reviews')}
                      >
                        View All
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* SECTION 4: BOOKING HISTORY TABLE */}
              <div className="ts-table-section">
                <div className="ts-panel-header">
                  <div>
                    <div className="ts-section-tag">ACTIVITY LOG</div>
                    <div className="ts-section-title">Booking History & Status ({liveBookings.length})</div>
                  </div>

                  <div className="ts-table-filters">
                    <button className="ts-filter-chip active">All Bookings ({liveBookings.length})</button>
                  </div>
                </div>

                <div className="ts-desktop-table-wrap">
                  <table className="ts-custom-table">
                    <thead>
                      <tr>
                        <th>TRIP / ITEM</th>
                        <th>SERVICE TYPE</th>
                        <th>DATES</th>
                        <th>AMOUNT</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveBookings.length > 0 ? (
                        liveBookings.map((b) => (
                          <tr key={b.booking_id}>
                            <td>
                              <div style={{ fontWeight: 800, color: 'var(--color-text-dark)' }}>{b.package_title}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ref: {b.display_id || `TS-${b.booking_id}`}</div>
                            </td>
                            <td>
                              <span className={`ts-type-badge badge-${getBookingType(b)}`}>
                                {getBookingType(b) === 'flight' ? '✈ Flight' : getBookingType(b) === 'train' ? '🚆 Train' : getBookingType(b) === 'bus' ? '🚌 Bus' : getBookingType(b) === 'car' ? '🚗 Car Rental' : '🎫 Tour Package'}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.825rem', color: '#64748b' }}>{b.start_date ? new Date(b.start_date).toLocaleDateString() : (b.travel_date || 'Nov 18, 2026')}</td>
                            <td style={{ fontWeight: 800 }}>{formatPrice(b.total_amount)}</td>
                            <td>
                              <span className={`ts-status-badge ${getBookingStatusDisplay(b).className}`}>
                                ● {getBookingStatusDisplay(b).label}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  className="ts-btn-primary"
                                  title="Download Official Booking Invoice & Voucher PDF"
                                  style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                  onClick={() => generateBookingPDF({
                                    id: b.display_id || b.booking_id,
                                    title: b.package_title,
                                    amount: b.total_amount,
                                    status: getBookingStatusDisplay(b).label,
                                    startDate: b.start_date,
                                    endDate: b.end_date,
                                    guests: b.guests,
                                    guestName: liveUser?.name || 'Verified Traveler',
                                    email: liveUser?.email
                                  })}
                                >
                                  <FileDown size={13} /> Invoice / PDF
                                </button>
                                {b.status !== 'Cancelled' && b.status !== 'cancelled' ? (
                                  <button 
                                    type="button"
                                    className="ts-btn-outline" 
                                    style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fecaca' }}
                                    onClick={() => handleCancelBooking(b.booking_id || b.id || b.display_id)}
                                  >
                                    Cancel
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '0.725rem', color: '#94a3b8', fontStyle: 'italic', alignSelf: 'center' }}>Cancelled</span>
                                )}
                                {getBookingStatusDisplay(b).label === 'Finished' && (
                                  <button 
                                    type="button"
                                    className="ts-btn-outline" 
                                    style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', borderColor: '#f59e0b', color: '#b45309', background: '#fffbeb', fontWeight: 700 }}
                                    onClick={() => {
                                      const pkgId = String(b.package_id || b.booking_id || b.id || b.package_title);
                                      setReviewForm(prev => ({ ...prev, packageId: pkgId }));
                                      setActiveTab('reviews');
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    title="Submit review for completed trip"
                                  >
                                    ⭐ Review Trip
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📋</div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-dark)', marginBottom: '0.2rem' }}>No Bookings Found</div>
                            <div style={{ fontSize: '0.825rem', marginBottom: '1rem' }}>You haven't made any trip bookings yet. Your completed and upcoming bookings will appear here.</div>
                            <button onClick={() => setActiveTab('explore')} className="ts-btn-primary" style={{ display: 'inline-flex', padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
                              Explore Packages To Book
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Booking Cards */}
                <div className="ts-mobile-booking-cards">
                  {liveBookings.length > 0 ? (
                    liveBookings.map((b) => (
                      <div key={b.booking_id || b.display_id} className="ts-mobile-booking-card">
                        <div className="ts-card-top-row">
                          <span className={`ts-type-badge badge-${getBookingType(b)}`}>
                            {getBookingType(b) === 'flight' ? '✈ Flight' : getBookingType(b) === 'train' ? '🚆 Train' : getBookingType(b) === 'bus' ? '🚌 Bus' : getBookingType(b) === 'car' ? '🚗 Car Rental' : '🎫 Tour Package'}
                          </span>
                          <span className={`ts-status-badge ${getBookingStatusDisplay(b).className}`}>
                            ● {getBookingStatusDisplay(b).label}
                          </span>
                        </div>

                        <div>
                          <div className="ts-card-booking-title">{b.package_title}</div>
                          <div className="ts-card-booking-ref">Ref: {b.display_id || `TS-${b.booking_id}`}</div>
                        </div>

                        <div className="ts-card-grid-info">
                          <div className="ts-card-info-item">
                            <span className="ts-card-info-label">Travel Date</span>
                            <span className="ts-card-info-val">
                              {b.start_date ? new Date(b.start_date).toLocaleDateString() : (b.travel_date || 'Nov 18, 2026')}
                            </span>
                          </div>
                          <div className="ts-card-info-item">
                            <span className="ts-card-info-label">Total Amount</span>
                            <span className="ts-card-info-val" style={{ color: 'var(--primary-copper)', fontWeight: 800 }}>
                              {formatPrice(b.total_amount)}
                            </span>
                          </div>
                        </div>

                        <div className="ts-card-actions-row">
                          <button
                            type="button"
                            className="ts-btn-primary"
                            onClick={() => generateBookingPDF({
                              id: b.display_id || b.booking_id,
                              title: b.package_title,
                              amount: b.total_amount,
                              status: getBookingStatusDisplay(b).label,
                              startDate: b.start_date,
                              endDate: b.end_date,
                              guests: b.guests,
                              guestName: liveUser?.name || 'Verified Traveler',
                              email: liveUser?.email
                            })}
                          >
                            <FileDown size={14} /> Voucher PDF
                          </button>
                          {b.status !== 'Cancelled' && b.status !== 'cancelled' ? (
                            <button 
                              type="button"
                              className="ts-btn-outline" 
                              style={{ color: '#dc2626', borderColor: '#fecaca' }}
                              onClick={() => handleCancelBooking(b.booking_id || b.id || b.display_id)}
                            >
                              Cancel
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', alignSelf: 'center', padding: '0 0.5rem' }}>Cancelled</span>
                          )}
                          {getBookingStatusDisplay(b).label === 'Finished' && (
                            <button 
                              type="button"
                              className="ts-btn-outline" 
                              style={{ borderColor: '#f59e0b', color: '#b45309', background: '#fffbeb', fontWeight: 700 }}
                              onClick={() => {
                                const pkgId = String(b.package_id || b.booking_id || b.id || b.package_title);
                                setReviewForm(prev => ({ ...prev, packageId: pkgId }));
                                setActiveTab('reviews');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              title="Submit review for completed trip"
                            >
                              ⭐ Review Trip
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <p style={{ fontWeight: 700, margin: 0 }}>No bookings recorded yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 5: DREAM ESCAPES (SAVED WISHLIST) */}
              <div className="ts-wishlist-section">
                <div className="ts-panel-header">
                  <div>
                    <div className="ts-section-tag">DREAM ESCAPES</div>
                    <div className="ts-section-title">Your Saved Adventures ({liveWishlist.length})</div>
                  </div>

                  <button onClick={() => setActiveTab('explore')} style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Explore All Packages ➔
                  </button>
                </div>

                {liveWishlist.length > 0 ? (
                  <div className="ts-wishlist-cards-grid">
                    {liveWishlist.map((w) => {
                      const pkgId = w.package_id || w.id;
                      return (
                        <div className="ts-adventure-card" key={w.wishlist_id || pkgId}>
                          <div className="ts-adventure-img-wrap">
                            <Link to={`/packages/${pkgId}`}>
                              <SmartImage src={w.image_url || "/destination-images/santorini.webp"} alt={w.title} />
                            </Link>
                            <button 
                              className="ts-fav-heart-btn" 
                              title="Remove from Wishlist"
                              onClick={() => handleRemoveFromWishlist(pkgId)}
                            >
                              ❤️
                            </button>
                          </div>
                          <div className="ts-adventure-body">
                            <Link to={`/packages/${pkgId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              <h3 className="ts-adventure-title">{w.title}</h3>
                            </Link>
                            <div className="ts-adventure-meta">
                              <div className="ts-price-tag">{formatPrice(w.price)} <span>/person</span></div>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button 
                                  onClick={() => handleRemoveFromWishlist(pkgId)} 
                                  className="ts-btn-outline" 
                                  style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fca5a5' }}
                                  title="Remove from Wishlist"
                                >
                                  <Trash2 size={13} />
                                </button>
                                <button onClick={() => handleBookPackage(w)} className="ts-btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
                                  Book Now
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ background: '#ffffff', border: '1px solid var(--color-border-light)', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧡</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-dark)', marginBottom: '0.2rem' }}>Your Wishlist is Empty</div>
                    <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Save tour packages while exploring to easily find them later!</div>
                    <button onClick={() => setActiveTab('explore')} className="ts-btn-outline" style={{ display: 'inline-flex' }}>
                      Browse Destinations
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: MY BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className="ts-table-section">
              <div className="ts-panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div className="ts-section-tag">RESERVATION DIRECTORY</div>
                  <div className="ts-section-title">
                    {bookingFilter === 'flight' ? 'Flight Bookings' : bookingFilter === 'train' ? 'Train Bookings' : bookingFilter === 'bus' ? 'Bus Bookings' : bookingFilter === 'car' ? 'Car Rental Bookings' : bookingFilter === 'package' ? 'Tour Package Bookings' : 'All Travel Bookings'} ({displayedBookings.length})
                  </div>
                </div>

                <div className="ts-booking-quick-actions">
                  <button type="button" onClick={() => setShowFastBookingModal('flight')} className="ts-btn-outline" style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}>
                    ✈ + Book Flight
                  </button>
                  <button type="button" onClick={() => setShowFastBookingModal('train')} className="ts-btn-outline" style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}>
                    🚆 + Book Train
                  </button>
                  <button type="button" onClick={() => setShowFastBookingModal('bus')} className="ts-btn-outline" style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}>
                    🚌 + Book Bus
                  </button>
                  <button type="button" onClick={() => setShowFastBookingModal('car')} className="ts-btn-outline" style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}>
                    🚗 + Book Car
                  </button>
                  <button type="button" onClick={() => setActiveTab('explore')} className="ts-btn-primary" style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}>
                    🎫 + Book Tour
                  </button>
                </div>
              </div>

              {/* FILTER PILLS */}
              <div className="ts-booking-filter-bar" style={{ padding: '0 0 1rem 0' }}>
                <button
                  type="button"
                  className={`ts-filter-pill ${bookingFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('all')}
                >
                  All Bookings ({liveBookings.length})
                </button>
                <button
                  type="button"
                  className={`ts-filter-pill ${bookingFilter === 'flight' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('flight')}
                >
                  ✈ Flights ({flightBookings.length})
                </button>
                <button
                  type="button"
                  className={`ts-filter-pill ${bookingFilter === 'train' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('train')}
                >
                  🚆 Trains ({trainBookings.length})
                </button>
                <button
                  type="button"
                  className={`ts-filter-pill ${bookingFilter === 'bus' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('bus')}
                >
                  🚌 Buses ({busBookings.length})
                </button>
                <button
                  type="button"
                  className={`ts-filter-pill ${bookingFilter === 'car' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('car')}
                >
                  🚗 Cars ({carBookings.length})
                </button>
                <button
                  type="button"
                  className={`ts-filter-pill ${bookingFilter === 'package' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('package')}
                >
                  🎫 Packages ({packageBookings.length})
                </button>
                <button
                  type="button"
                  className={`ts-filter-pill ${bookingFilter === 'guide' ? 'active' : ''}`}
                  onClick={() => setBookingFilter('guide')}
                >
                  🧭 Tour Guides ({guideBookings.length})
                </button>
              </div>

              {/* Desktop Table View */}
              <div className="ts-desktop-table-wrap">
                <table className="ts-custom-table">
                  <thead>
                    <tr>
                      <th>BOOKING / SERVICE</th>
                      <th>TYPE</th>
                      <th>DETAILS & ROUTE</th>
                      <th>SEAT / VEHICLE</th>
                      <th>DATES</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedBookings.length > 0 ? (
                      displayedBookings.map((b) => (
                        <tr key={b.booking_id || b.display_id}>
                          <td>
                            <div style={{ fontWeight: 800, color: 'var(--color-text-dark)' }}>{b.package_title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ref: {b.display_id || `TS-${b.booking_id}`}</div>
                          </td>
                          <td>
                            <span className={`ts-type-badge badge-${getBookingType(b)}`}>
                              {getBookingBadgeLabel(b)}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155' }}>
                              {b.carrier || (getBookingType(b) === 'car' ? 'TravelSphere Fleet' : 'Scheduled Carrier')}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {b.departure_city && b.destination_name ? `${b.departure_city} ➔ ${b.destination_name}` : (b.destination_name || 'Standard Route')}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                            <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 600 }}>
                              {b.seat || (getBookingType(b) === 'car' ? 'Executive Sedan' : 'Reserved Seat')}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.825rem', color: '#64748b' }}>
                            {b.start_date ? new Date(b.start_date).toLocaleDateString() : (b.travel_date || 'Nov 18, 2026')}
                          </td>
                          <td style={{ fontWeight: 800 }}>{formatPrice(b.total_amount)}</td>
                          <td>
                            <span className={`ts-status-badge ${getBookingStatusDisplay(b).className}`}>
                              ● {getBookingStatusDisplay(b).label}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="ts-btn-primary"
                                title="Download Official Booking Invoice & Voucher PDF"
                                style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                onClick={() => generateBookingPDF({
                                  id: b.display_id || b.booking_id,
                                  title: b.package_title,
                                  amount: b.total_amount,
                                  status: getBookingStatusDisplay(b).label,
                                  startDate: b.start_date,
                                  endDate: b.end_date,
                                  guests: b.guests,
                                  guestName: liveUser?.name || 'Verified Traveler',
                                  email: liveUser?.email
                                })}
                              >
                                <FileDown size={13} /> Invoice / PDF
                              </button>
                              {b.status !== 'Cancelled' && b.status !== 'cancelled' ? (
                                <button 
                                  type="button"
                                  className="ts-btn-outline" 
                                  style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fecaca' }}
                                  onClick={() => handleCancelBooking(b.booking_id || b.id || b.display_id)}
                                >
                                  Cancel
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.725rem', color: '#94a3b8', fontStyle: 'italic', alignSelf: 'center' }}>Cancelled</span>
                              )}
                              {getBookingStatusDisplay(b).label === 'Finished' && (
                                <button 
                                  type="button"
                                  className="ts-btn-outline" 
                                  style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', borderColor: '#f59e0b', color: '#b45309', background: '#fffbeb', fontWeight: 700 }}
                                  onClick={() => {
                                    const pkgId = String(b.package_id || b.booking_id || b.id || b.package_title);
                                    setReviewForm(prev => ({ ...prev, packageId: pkgId }));
                                    setActiveTab('reviews');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  title="Submit review for completed trip"
                                >
                                  ⭐ Review Trip
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                            {bookingFilter === 'flight' ? '✈️' : bookingFilter === 'train' ? '🚆' : bookingFilter === 'bus' ? '🚌' : bookingFilter === 'car' ? '🚗' : bookingFilter === 'guide' ? '🧭' : '📋'}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-dark)', marginBottom: '0.2rem' }}>
                            No {bookingFilter === 'flight' ? 'Flight' : bookingFilter === 'train' ? 'Train' : bookingFilter === 'bus' ? 'Bus' : bookingFilter === 'car' ? 'Car Rental' : bookingFilter === 'guide' ? 'Tour Guide' : 'Travel'} Bookings Found
                          </div>
                          <div style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                            You have no {bookingFilter === 'all' ? 'active or completed' : bookingFilter === 'guide' ? 'tour guide' : bookingFilter} bookings yet. Click below to book instantly!
                          </div>
                          {bookingFilter === 'guide' && (
                            <button onClick={() => setActiveTab('guides')} className="ts-btn-primary" style={{ display: 'inline-flex' }}>
                              🧭 Hire Certified Tour Guide
                            </button>
                          )}
                          {bookingFilter === 'flight' && (
                            <button onClick={() => setShowFastBookingModal('flight')} className="ts-btn-primary" style={{ display: 'inline-flex' }}>
                              ✈ Book Flight Ticket
                            </button>
                          )}
                          {bookingFilter === 'train' && (
                            <button onClick={() => setShowFastBookingModal('train')} className="ts-btn-primary" style={{ display: 'inline-flex' }}>
                              🚆 Book Train Ticket
                            </button>
                          )}
                          {bookingFilter === 'bus' && (
                            <button onClick={() => setShowFastBookingModal('bus')} className="ts-btn-primary" style={{ display: 'inline-flex' }}>
                              🚌 Book Bus Ticket
                            </button>
                          )}
                          {bookingFilter === 'car' && (
                            <button onClick={() => setShowFastBookingModal('car')} className="ts-btn-primary" style={{ display: 'inline-flex' }}>
                              🚗 Book Car Rental
                            </button>
                          )}
                          {(bookingFilter === 'package' || bookingFilter === 'all') && (
                            <button onClick={() => setActiveTab('explore')} className="ts-btn-primary" style={{ display: 'inline-flex' }}>
                              🎫 Explore Tour Packages
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View for Reservation Directory */}
              <div className="ts-mobile-booking-cards">
                {displayedBookings.length > 0 ? (
                  displayedBookings.map((b) => (
                    <div key={b.booking_id || b.display_id} className="ts-mobile-booking-card">
                      <div className="ts-card-top-row">
                        <span className={`ts-type-badge badge-${getBookingType(b)}`}>
                          {getBookingBadgeLabel(b)}
                        </span>
                        <span className={`ts-status-badge ${getBookingStatusDisplay(b).className}`}>
                          ● {getBookingStatusDisplay(b).label}
                        </span>
                      </div>

                      <div>
                        <div className="ts-card-booking-title">{b.package_title}</div>
                        <div className="ts-card-booking-ref">Ref: {b.display_id || `TS-${b.booking_id}`}</div>
                      </div>

                      <div className="ts-card-grid-info">
                        <div className="ts-card-info-item">
                          <span className="ts-card-info-label">Route & Carrier</span>
                          <span className="ts-card-info-val">
                            {b.departure_city && b.destination_name ? `${b.departure_city} ➔ ${b.destination_name}` : (b.destination_name || 'Standard Route')}
                          </span>
                        </div>
                        <div className="ts-card-info-item">
                          <span className="ts-card-info-label">Seat / Vehicle</span>
                          <span className="ts-card-info-val">
                            {b.seat || (getBookingType(b) === 'car' ? 'Executive Sedan' : 'Reserved Seat')}
                          </span>
                        </div>
                        <div className="ts-card-info-item">
                          <span className="ts-card-info-label">Travel Date</span>
                          <span className="ts-card-info-val">
                            {b.start_date ? new Date(b.start_date).toLocaleDateString() : (b.travel_date || 'Nov 18, 2026')}
                          </span>
                        </div>
                        <div className="ts-card-info-item">
                          <span className="ts-card-info-label">Total Amount</span>
                          <span className="ts-card-info-val" style={{ color: 'var(--primary-copper)', fontWeight: 800 }}>
                            {formatPrice(b.total_amount)}
                          </span>
                        </div>
                      </div>

                      <div className="ts-card-actions-row">
                        <button
                          type="button"
                          className="ts-btn-primary"
                          onClick={() => generateBookingPDF({
                            id: b.display_id || b.booking_id,
                            title: b.package_title,
                            amount: b.total_amount,
                            status: getBookingStatusDisplay(b).label,
                            startDate: b.start_date,
                            endDate: b.end_date,
                            guests: b.guests,
                            guestName: liveUser?.name || 'Verified Traveler',
                            email: liveUser?.email
                          })}
                        >
                          <FileDown size={14} /> Voucher PDF
                        </button>
                        {b.status !== 'Cancelled' && b.status !== 'cancelled' ? (
                          <button 
                            type="button"
                            className="ts-btn-outline" 
                            style={{ color: '#dc2626', borderColor: '#fecaca' }}
                            onClick={() => handleCancelBooking(b.booking_id || b.id || b.display_id)}
                          >
                            Cancel
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', alignSelf: 'center', padding: '0 0.5rem' }}>Cancelled</span>
                        )}
                        {getBookingStatusDisplay(b).label === 'Finished' && (
                          <button 
                            type="button"
                            className="ts-btn-outline" 
                            style={{ borderColor: '#f59e0b', color: '#b45309', background: '#fffbeb', fontWeight: 700 }}
                            onClick={() => {
                              const pkgId = String(b.package_id || b.booking_id || b.id || b.package_title);
                              setReviewForm(prev => ({ ...prev, packageId: pkgId }));
                              setActiveTab('reviews');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            title="Submit review for completed trip"
                          >
                            ⭐ Review Trip
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                      {bookingFilter === 'flight' ? '✈️' : bookingFilter === 'train' ? '🚆' : bookingFilter === 'bus' ? '🚌' : bookingFilter === 'car' ? '🚗' : bookingFilter === 'guide' ? '🧭' : '📋'}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-dark)', marginBottom: '0.2rem' }}>
                      No {bookingFilter === 'flight' ? 'Flight' : bookingFilter === 'train' ? 'Train' : bookingFilter === 'bus' ? 'Bus' : bookingFilter === 'car' ? 'Car Rental' : bookingFilter === 'guide' ? 'Tour Guide' : 'Travel'} Bookings Found
                    </div>
                    <div style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                      You have no {bookingFilter === 'all' ? 'active or completed' : bookingFilter === 'guide' ? 'tour guide' : bookingFilter} bookings yet. Click below to book instantly!
                    </div>
                    {bookingFilter === 'guide' && (
                      <button onClick={() => setActiveTab('guides')} className="ts-btn-primary" style={{ display: 'inline-flex' }}>
                        🧭 Hire Certified Tour Guide
                      </button>
                    )}
                    {bookingFilter === 'flight' && (
                      <button onClick={() => setShowFastBookingModal('flight')} className="ts-btn-primary" style={{ display: 'inline-flex' }}>
                        ✈ Book Flight Ticket
                      </button>
                    )}
                    {bookingFilter === 'train' && (
                      <button onClick={() => setShowFastBookingModal('train')} className="ts-btn-primary" style={{ display: 'inline-flex' }}>
                        🚆 Book Train Ticket
                      </button>
                    )}
                    {bookingFilter === 'bus' && (
                      <button onClick={() => setShowFastBookingModal('bus')} className="ts-btn-primary" style={{ display: 'inline-flex' }}>
                        🚌 Book Bus Ticket
                      </button>
                    )}
                    {bookingFilter === 'car' && (
                      <button onClick={() => setShowFastBookingModal('car')} className="ts-btn-primary" style={{ display: 'inline-flex' }}>
                        🚗 Book Car Rental
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="ts-wishlist-section">
              <div className="ts-panel-header">
                <div>
                  <div className="ts-section-tag">DREAM ESCAPES</div>
                  <div className="ts-section-title">Saved Wishlist ({liveWishlist.length})</div>
                </div>
                <button onClick={() => setActiveTab('explore')} className="ts-btn-outline">
                  Browse Packages
                </button>
              </div>

              {liveWishlist.length > 0 ? (
                <div className="ts-wishlist-cards-grid">
                  {liveWishlist.map((w) => {
                    const pkgId = w.package_id || w.id;
                    return (
                      <div className="ts-adventure-card" key={w.wishlist_id || pkgId}>
                        <div className="ts-adventure-img-wrap">
                          <Link to={`/packages/${pkgId}`}>
                            <SmartImage src={w.image_url || "/destination-images/santorini.webp"} alt={w.title} />
                          </Link>
                          <button 
                            className="ts-fav-heart-btn" 
                            title="Remove from Wishlist"
                            onClick={() => handleRemoveFromWishlist(pkgId)}
                          >
                            ❤️
                          </button>
                        </div>
                        <div className="ts-adventure-body">
                          <Link to={`/packages/${pkgId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h3 className="ts-adventure-title">{w.title}</h3>
                          </Link>
                          <div className="ts-adventure-meta">
                            <div className="ts-price-tag">{formatPrice(w.price)} <span>/person</span></div>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button 
                                onClick={() => handleRemoveFromWishlist(pkgId)} 
                                className="ts-btn-outline" 
                                style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem', color: '#dc2626', borderColor: '#fca5a5', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <Trash2 size={13} /> Remove
                              </button>
                              <button onClick={() => handleBookPackage(w)} className="ts-btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
                                Book Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ background: '#ffffff', border: '1px solid var(--color-border-light)', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧡</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text-dark)', marginBottom: '0.3rem' }}>Your Wishlist is Empty</div>
                  <div style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>Save packages while exploring to easily view and book them later!</div>
                  <button onClick={() => setActiveTab('explore')} className="ts-btn-primary" style={{ display: 'inline-flex' }}>
                    Explore Tour Packages
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MY REVIEWS & FEEDBACK MANAGEMENT */}
          {activeTab === 'reviews' && (
            <div>
              <div className="ts-panel-header" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <div className="ts-section-tag">COMMUNITY FEEDBACK</div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>
                    My Reviews & Travel Experiences
                  </h1>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Submit reviews for your trips, edit previous feedback, and view your complete review history.
                  </p>
                </div>
              </div>

              {reviewStatusMsg && (
                <div style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.85rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                  {reviewStatusMsg}
                </div>
              )}

              {/* REVIEW SUBMIT / EDIT FORM */}
              <div className="ts-card-panel" style={{ maxWidth: '750px', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>
                    {editingReview ? `Edit Your Review (#TS-REV-${editingReview.review_id})` : 'Write a Review & Feedback'}
                  </h2>
                  {editingReview && (
                    <button 
                      type="button" 
                      onClick={handleCancelEditReview} 
                      className="ts-btn-outline" 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <X size={13} /> Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveReview}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    {/* Booking / Service Selection (for new reviews) */}
                    {!editingReview && (
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                          Select Completed Booking / Service
                        </label>
                        <select 
                          className="ts-input-field" 
                          style={{ width: '100%', marginTop: '0.35rem', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                          value={reviewForm.packageId}
                          onChange={(e) => {
                            const val = e.target.value;
                            const found = bookedPackages.find(p => String(p.package_id) === String(val));
                            if (found && !found.isFinished) {
                              setReviewStatusMsg(`ℹ️ Reviews can only be submitted after your booking dates have finished (${found.date || 'past trip date'}).`);
                            } else {
                              setReviewStatusMsg('');
                            }
                            setReviewForm({ ...reviewForm, packageId: val });
                          }}
                          required
                        >
                          <option value="">-- Choose a completed trip, hotel, bus, train or rental to review --</option>
                          {bookedPackages.length > 0 ? (
                            bookedPackages.map(p => {
                              const badge = p.type === 'flight' ? '✈ Flight' : p.type === 'train' ? '🚆 Train' : p.type === 'bus' ? '🚌 Bus' : p.type === 'car' ? '🚗 Rental' : p.type === 'hotel' ? '🏨 Hotel' : '🎫 Tour';
                              return (
                                <option 
                                  key={p.package_id} 
                                  value={p.package_id}
                                  disabled={!p.isFinished}
                                >
                                  [{badge}] {p.title} {p.isFinished ? `(✓ Completed - ${p.location})` : `(Upcoming - Available after ${p.date || 'travel date'})`}
                                </option>
                              );
                            })
                          ) : (
                            <option value="" disabled>No bookings found. Complete a trip, stay or ride to submit a review.</option>
                          )}
                        </select>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                          ℹ️ Only completed bookings (tours, hotels, buses, trains & rentals) that have finished their travel dates are eligible for review.
                        </div>
                      </div>
                    )}

                    {/* Star Rating Selector */}
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                        Your Rating: {reviewForm.rating} of 5 Stars
                      </label>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={26} 
                            fill={star <= reviewForm.rating ? "#f59e0b" : "none"} 
                            color={star <= reviewForm.rating ? "#f59e0b" : "#cbd5e1"} 
                            onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                            style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Comment text */}
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        Your Feedback / Comments
                      </label>
                      <textarea 
                        className="ts-textarea" 
                        rows={4}
                        placeholder="Tell fellow travelers what you loved about the tour, guides, hotel amenities, and overall experience..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        required
                        style={{ marginTop: '0.35rem', width: '100%' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <button 
                        type="submit" 
                        className="ts-btn-primary" 
                        disabled={isSubmittingReview}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.4rem' }}
                      >
                        {editingReview ? (
                          <>
                            <Check size={16} /> {isSubmittingReview ? 'Saving Changes...' : 'Save & Update Review'}
                          </>
                        ) : (
                          <>
                            <Star size={16} /> {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                          </>
                        )}
                      </button>

                      {editingReview && (
                        <button 
                          type="button" 
                          className="ts-btn-outline" 
                          onClick={handleCancelEditReview}
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                  </div>
                </form>
              </div>

              {/* REVIEW HISTORY LIST */}
              <div className="ts-panel-header" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                <div>
                  <div className="ts-section-tag">HISTORY</div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>
                    Your Submitted Reviews ({reviews.length})
                  </h2>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="ts-reviews-list">
                  {reviews.map((rev) => (
                    <div className="ts-review-card" key={rev.review_id}>
                      <div className="ts-review-card-header">
                        <div>
                          <div className="ts-review-pkg">{rev.package_title || 'Tour Experience'}</div>
                          <div className="ts-review-stars">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star 
                                key={s} 
                                size={15} 
                                fill={s <= rev.rating ? "#f59e0b" : "none"} 
                                color={s <= rev.rating ? "#f59e0b" : "#cbd5e1"} 
                              />
                            ))}
                          </div>
                        </div>

                        <button 
                          type="button"
                          className="ts-btn-outline" 
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          onClick={() => handleStartEditReview(rev)}
                        >
                          <Edit size={13} /> Edit Review
                        </button>
                      </div>

                      <div className="ts-review-body">
                        "{rev.comment}"
                      </div>

                      <div className="ts-review-card-footer">
                        <span>Submitted: {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}</span>
                        {rev.updated_at && (
                          <span style={{ color: '#2563eb', fontWeight: 600 }}>
                            Updated: {new Date(rev.updated_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: '#ffffff', border: '1px solid var(--color-border-light)', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✍️</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text-dark)', marginBottom: '0.3rem' }}>
                    No Reviews Submitted Yet
                  </div>
                  <div style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                    Share your travel feedback on any of our packages to guide the traveler community!
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 5: EXPLORE PACKAGES TAB (MAKEMYTRIP INSPIRED CATALOG) */}
          {activeTab === 'explore' && (
            <div>
              <div className="ts-panel-header" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <div className="ts-section-tag">EXPLORE PACKAGES</div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>Holiday & Tour Packages</h1>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Handcrafted vacation packages inspired by MakeMyTrip themes. Filter by category, duration, and inclusions.
                  </p>
                </div>
              </div>

              {/* MAKEMYTRIP CATEGORY FILTER PILLS */}
              <div className="mmt-category-bar">
                {[
                  { id: 'All', name: 'All Packages', icon: '🌍' },
                  { id: 'Honeymoon Specials', name: 'Honeymoon Specials', icon: '💖' },
                  { id: 'Beach & Islands', name: 'Beach & Islands', icon: '🏖️' },
                  { id: 'Mountain Escapes', name: 'Mountain Escapes', icon: '🏔️' },
                  { id: 'Culture & Heritage', name: 'Culture & Heritage', icon: '🏰' },
                  { id: 'Luxury & Wellness', name: 'Luxury & Wellness', icon: '👑' },
                  { id: 'International Getaways', name: 'International Getaways', icon: '✈️' }
                ].map(cat => (
                  <button 
                    key={cat.id}
                    className={`mmt-cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* CONTROLS BAR: SEARCH & SORT */}
              <div className="mmt-controls-row">
                <div className="mmt-search-input-wrap">
                  <Search size={16} color="#64748b" />
                  <input 
                    type="text" 
                    placeholder="Search package name, location or destination..." 
                    value={pkgSearch}
                    onChange={(e) => setPkgSearch(e.target.value)}
                  />
                  {pkgSearch && (
                    <button className="mmt-clear-btn" onClick={() => setPkgSearch('')}>✕</button>
                  )}
                </div>

                <div className="mmt-sort-wrap">
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Sort By:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="mmt-sort-select"
                  >
                    <option value="recommended">MakeMyTrip Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated ⭐</option>
                  </select>
                </div>
              </div>

              {/* PACKAGES GRID */}
              <div className="ts-wishlist-cards-grid">
                {(() => {
                  const fallbackList = [
                    { package_id: 1, title: 'Maldives Overwater Luxury Bungalow', category: 'Honeymoon Specials', location: 'Maldives', days: 5, price: '1850.00', rating: '4.9', image_url: '/destination-images/maldives.webp', description: 'Romantic water villas, private infinity pool, sunset dolphin cruises, and candlelit beach dinners.', inclusions: '✈ Flights • 🏨 5★ Villa • ⛵ Speedboat • 🍽 All Meals' },
                    { package_id: 2, title: 'Santorini Sunset Villa & Yacht Tour', category: 'Honeymoon Specials', location: 'Santorini, Greece', days: 6, price: '1980.00', rating: '4.8', image_url: '/destination-images/santorini.webp', description: 'Luxurious caldera views, wine tasting tours, and Aegean sea sunset catamaran cruises.', inclusions: '✈ Flights • 🏨 Cliff Villa • 🍷 Wine Tasting • ⛵ Yacht Cruise' },
                    { package_id: 3, title: 'Bali Beach Villa & Temple Discovery', category: 'Beach & Islands', location: 'Bali, Indonesia', days: 5, price: '1120.00', rating: '4.7', image_url: '/destination-images/bali.webp', description: 'Tropical beaches, Sacred Monkey Forest, Ubud rice terraces, and spiritual spa wellness.', inclusions: '✈ Flights • 🏨 4★ Resort • 🚗 Transfers • 🎟 Sightseeing' },
                    { package_id: 4, title: 'Swiss Alps Glacier & Scenic Express', category: 'Mountain Escapes', location: 'Interlaken, Switzerland', days: 8, price: '1985.00', rating: '5.0', image_url: '/destination-images/swiss-alps.webp', description: 'Majestic glacier peaks, first class panoramic trains, and Interlaken alpine lakes.', inclusions: '✈ Flights • 🚆 Glacier Express • 🏨 Chalet Stay • 🥐 Daily Meals' },
                    { package_id: 5, title: 'Kyoto Temple & Cherry Blossom Tour', category: 'Culture & Heritage', location: 'Kyoto, Japan', days: 7, price: '1450.00', rating: '4.9', image_url: '/destination-images/kyoto.webp', description: 'Historic UNESCO temples, blooming sakura gardens, tea ceremonies, and bamboo groves.', inclusions: '✈ Flights • 🚆 Bullet Train • 🏨 Traditional Ryokan • 🍵 Tea Ceremony' },
                    { package_id: 6, title: 'Manali & Solang Valley Snow Expedition', category: 'Mountain Escapes', location: 'Himachal Pradesh, India', days: 5, price: '750.00', rating: '4.6', image_url: '/destination-images/manali.webp', description: 'Snow activities in Solang, Rohtang Pass excursions, and scenic pine valley retreats.', inclusions: '🚌 Luxury Bus • 🏨 Mountain Resort • 🎿 Snow Sports • 🍽 Meals' },
                    { package_id: 7, title: 'Phuket & Krabi Island Hopping Quest', category: 'Beach & Islands', location: 'Thailand', days: 6, price: '980.00', rating: '4.8', image_url: '/destination-images/phuket.webp', description: 'Coral island speedboat excursions, Maya Bay snorkeling, and vibrant night markets.', inclusions: '✈ Flights • 🏨 Beachfront Hotel • 🚤 Speedboat • 🍽 Breakfast' },
                    { package_id: 8, title: 'Rajasthan Royal Forts & Heritage Safari', category: 'Culture & Heritage', location: 'Jaipur & Udaipur, India', days: 6, price: '1280.00', rating: '4.8', image_url: '/destination-images/rajasthan.webp', description: 'Amber Fort VIP tour, Lake Pichola boating, Thar desert camel safari, and palace stays.', inclusions: '🚗 Private Cab • 🏰 Royal Palace • 🐫 Desert Safari • 🍽 All Meals' },
                    { package_id: 9, title: 'Paris VIP Art & Seine Culinary Discovery', category: 'Luxury & Wellness', location: 'Paris, France', days: 5, price: '1650.00', rating: '4.8', image_url: '/destination-images/paris.webp', description: 'Louvre museum VIP entry, Montmartre walks, Eiffel Tower champagne lounge, and Seine dining.', inclusions: '✈ Flights • 🏨 5★ Palace Hotel • 🎟 Louvre VIP • 🍷 Gourmet Cruise' },
                    { package_id: 10, title: 'Dubai Desert Resort & Luxury Skyscraper', category: 'Luxury & Wellness', location: 'Dubai, UAE', days: 4, price: '2450.00', rating: '4.9', image_url: '/destination-images/dubai.webp', description: 'Burj Al Arab dining, dune bashing safari, private yacht rental, and helicopter city flight.', inclusions: '✈ Flights • 🏨 7★ Resort • 🚁 Helicopter Tour • 🏎 Desert Safari' },
                    { package_id: 11, title: 'Tokyo Bullet Train & Mt Fuji Quest', category: 'International Getaways', location: 'Tokyo, Japan', days: 6, price: '1350.00', rating: '4.9', image_url: '/destination-images/tokyo.webp', description: 'Shinkansen high-speed rail, Mt Fuji panoramas, Akihabara tech tour, and Michelin dining.', inclusions: '✈ Flights • 🏨 City Center Hotel • 🚄 Bullet Train • 🗼 Skytree Pass' },
                    { package_id: 12, title: 'Amsterdam Canals & Tulip Garden Escape', category: 'International Getaways', location: 'Netherlands', days: 5, price: '1550.00', rating: '4.7', image_url: '/destination-images/amsterdam.webp', description: 'Keukenhof tulip park, historic canal cruise, Van Gogh museum, and windmill countryside.', inclusions: '✈ Flights • 🏨 Canal Hotel • 🚢 Boat Cruise • 🌷 Keukenhof Entry' }
                  ];

                  let list = allPackages.length > 0 ? allPackages : fallbackList;

                  if (selectedCategory !== 'All') {
                    list = list.filter(p => (p.category || '').toLowerCase() === selectedCategory.toLowerCase());
                  }

                  if (pkgSearch.trim()) {
                    const q = pkgSearch.toLowerCase();
                    list = list.filter(p => 
                      (p.title || '').toLowerCase().includes(q) || 
                      (p.description || '').toLowerCase().includes(q) ||
                      (p.location || '').toLowerCase().includes(q) ||
                      (p.category || '').toLowerCase().includes(q)
                    );
                  }

                  if (sortBy === 'price-low') {
                    list = [...list].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                  } else if (sortBy === 'price-high') {
                    list = [...list].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                  } else if (sortBy === 'rating') {
                    list = [...list].sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
                  }

                  if (list.length === 0) {
                    return (
                      <div style={{ gridColumn: '1 / -1', background: '#ffffff', border: '1px solid var(--color-border-light)', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text-dark)', marginBottom: '0.3rem' }}>No Packages Found</div>
                        <div style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>No holiday packages matched your search criteria or category filter.</div>
                        <button onClick={() => { setSelectedCategory('All'); setPkgSearch(''); }} className="ts-btn-primary" style={{ display: 'inline-flex' }}>
                          Reset Category Filters
                        </button>
                      </div>
                    );
                  }

                  return list.map((pkg) => {
                    const pkgId = pkg.package_id || pkg.id;
                    const isWish = liveWishlist.some(w => (w.package_id || w.id) === pkgId);
                    return (
                      <div className="ts-adventure-card" key={pkgId}>
                        <div className="ts-adventure-img-wrap">
                          <Link to={`/packages/${pkgId}`}>
                            <SmartImage src={pkg.image_url} alt={pkg.title} />
                          </Link>
                          <button 
                            className="ts-fav-heart-btn" 
                            onClick={() => handleAddToWishlist(pkg)} 
                            title={isWish ? "Remove from Wishlist" : "Save to Wishlist"}
                          >
                            {isWish ? '❤️' : '🤍'}
                          </button>
                          <div className="ts-duration-tag">{pkg.days || 5} Days / {(pkg.days || 5) - 1} Nights</div>
                          {pkg.category && (
                            <div className="mmt-category-badge">{pkg.category}</div>
                          )}
                        </div>

                        <div className="ts-adventure-body">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                            <span style={{ color: '#2563eb', fontWeight: 700 }}>📍 {pkg.location || 'Global Destination'}</span>
                            <span style={{ color: '#d97706', fontWeight: 800 }}>⭐ {pkg.rating || 4.8}</span>
                          </div>

                          <Link to={`/packages/${pkgId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h3 className="ts-adventure-title">{pkg.title}</h3>
                          </Link>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                            {pkg.description || 'Handcrafted tour package with complete itinerary and hotel stays.'}
                          </p>

                          {/* INCLUSIONS TAGS */}
                          {pkg.inclusions && (
                            <div className="mmt-inclusions-pills">
                              {pkg.inclusions.split('•').map((inc, i) => (
                                <span key={i} className="mmt-inc-chip">{inc.trim()}</span>
                              ))}
                            </div>
                          )}

                          <div className="ts-adventure-meta">
                            <div className="ts-price-tag">{formatPrice(pkg.price)} <span>/person</span></div>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <Link 
                                to={`/packages/${pkgId}`} 
                                className="ts-btn-outline" 
                                style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                              >
                                Details <ExternalLink size={11} />
                              </Link>
                              <button 
                                type="button"
                                onClick={() => handleBookPackage(pkg)} 
                                className="ts-btn-primary" 
                                style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', cursor: 'pointer' }}
                              >
                                Book Trip
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* TAB: CUSTOM TRIP PLANS / ITINERARIES (Task 8) */}
          {activeTab === 'plans' && (
            <div className="ts-panel-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 className="ts-section-title" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-text-dark)', margin: '0 0 0.25rem' }}>
                    Saved Trip Plans & Itineraries
                  </h2>
                  <p className="ts-section-desc" style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                    Create custom trip plans with destination budgets, dates, and track their preparation status.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="ts-btn-primary" onClick={() => setShowAddPlanModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> + Add Trip Plan
                  </button>
                  <button className="ts-btn-outline" onClick={() => navigate('/itinerary-planner')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={16} /> Launch AI Trip Planner
                  </button>
                </div>
              </div>

              {savedTripPlans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                  <Compass size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>No Saved Trip Plans Yet</h3>
                  <p style={{ color: '#64748b', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.92rem' }}>
                    Create a structured trip plan with budget, dates, and destinations or use our AI Trip Engine.
                  </p>
                  <button className="ts-btn-primary" onClick={() => setShowAddPlanModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> + Add Trip Plan
                  </button>
                </div>
              ) : (
                <div className="ts-trip-plans-grid">
                  {savedTripPlans.map((plan, idx) => {
                    const parsedData = typeof plan.itinerary_data === 'string' ? (() => { try { return JSON.parse(plan.itinerary_data); } catch { return {}; } })() : (plan.itinerary_data || plan);
                    const title = plan.title || parsedData.destinationName || `Custom Plan #${idx + 1}`;
                    const budget = plan.budget || parsedData.costs?.total || 1200;
                    const duration = parsedData.durationDays || (plan.startDate && plan.endDate ? Math.max(1, Math.round((new Date(plan.endDate) - new Date(plan.startDate)) / 86400000)) : 5);
                    const status = plan.status || 'Planning';

                    return (
                      <div key={plan.plan_id || plan.id || idx} style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: status === 'Confirmed' ? '#dcfce7' : status === 'In Progress' ? '#e0f2fe' : '#fef3c7', color: status === 'Confirmed' ? '#15803d' : status === 'In Progress' ? '#0369a1' : '#b45309', padding: '0.2rem 0.6rem', borderRadius: '999px', textTransform: 'uppercase' }}>
                              ● {status}
                            </span>
                            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={12} /> {duration} Days
                            </span>
                          </div>
                          <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', color: '#0f172a' }}>{title}</h4>
                          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.5rem', lineHeight: '1.4', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={13} />
                            {plan.destination || parsedData.destinationName || 'Curated Journey'}
                          </p>
                          {(plan.startDate || plan.endDate) && (
                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Calendar size={13} /> {plan.startDate || 'Upcoming'} → {plan.endDate || 'Flexible'}
                            </p>
                          )}
                          <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Budget Estimate</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#a3704c' }}>{formatPrice(budget)}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="ts-btn-outline"
                            style={{ flex: 1, padding: '0.5rem', fontSize: '0.82rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem' }}
                            onClick={() => {
                              generateBookingPDF({
                                id: plan.plan_id || plan.id || `PLAN-${idx + 1}`,
                                title: title,
                                amount: budget,
                                status: status.toUpperCase(),
                                startDate: plan.startDate || plan.start_date || '2026-11-10',
                                endDate: plan.endDate || plan.end_date || '2026-11-15',
                                guests: parsedData.travelers || 2,
                                destination: plan.destination || parsedData.destinationName || title,
                                hotel: parsedData.hotel?.name || 'Curated 4-Star Stay',
                                transport: 'Executive Transit Pass',
                                guestName: user?.name || 'Verified Traveler',
                                email: user?.email || 'traveler@travelsphere.com'
                              });
                            }}
                          >
                            <FileDown size={14} /> PDF Voucher
                          </button>
                          <button
                            className="ts-btn-outline"
                            style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem', color: '#dc2626', borderColor: '#fecaca' }}
                            onClick={() => handleDeleteTripPlan(plan.plan_id || plan.id)}
                            title="Delete Trip Plan"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: TOUR GUIDES QUICK-BOOKING */}
          {activeTab === 'guides' && (
            <div className="ts-panel-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 className="ts-section-title" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-text-dark)', margin: '0 0 0.25rem' }}>
                    Certified Local Tour Guides & Concierges
                  </h2>
                  <p className="ts-section-desc" style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                    Hire certified local historians, mountain explorers, and private cultural escorts for personalized tours.
                  </p>
                </div>
              </div>

              {/* DEDICATED SECTION: YOUR BOOKED TOUR GUIDES */}
              {guideBookings.length > 0 && (
                <div style={{ marginBottom: '2.5rem', background: '#ffffff', borderRadius: '20px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#b45309', background: '#fef3c7', padding: '0.2rem 0.65rem', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          RESERVATIONS SECTION
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>
                          ● Active Hired Guides
                        </span>
                      </div>
                      <h3 style={{ margin: '0.35rem 0 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                        Your Booked Tour Guides ({guideBookings.length})
                      </h3>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.825rem', color: '#64748b' }}>
                        All your private guide reservations, service dates, and travel vouchers are saved here.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {guideBookings.map((b) => (
                      <div key={b.booking_id || b.display_id} style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid #cbd5e1', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div>
                              <span className="ts-type-badge badge-guide" style={{ marginBottom: '0.35rem', display: 'inline-block' }}>
                                🧭 Tour Guide Reservation
                              </span>
                              <h4 style={{ margin: '0.2rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                                {b.package_title}
                              </h4>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Booking Ref: {b.display_id || `TS-${b.booking_id}`}
                              </div>
                            </div>
                            <span className={`ts-status-badge ${getBookingStatusDisplay(b).className}`}>
                              ● {getBookingStatusDisplay(b).label}
                            </span>
                          </div>

                          <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#334155', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#64748b' }}>Destination / Area:</span>
                              <strong>{b.destination_name || 'Designated Region'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#64748b' }}>Service Date:</span>
                              <strong>{b.start_date ? new Date(b.start_date).toLocaleDateString() : (b.travel_date || 'Upcoming')}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#64748b' }}>Travelers:</span>
                              <strong>{b.guests || 2} Persons</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e2e8f0', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                              <span style={{ color: '#64748b' }}>Paid Amount:</span>
                              <strong style={{ color: '#a3704c', fontSize: '0.95rem' }}>{formatPrice(b.total_amount)}</strong>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="ts-btn-primary"
                            style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.78rem', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            onClick={() => generateBookingPDF({
                              id: b.display_id || b.booking_id,
                              title: b.package_title,
                              amount: b.total_amount,
                              status: getBookingStatusDisplay(b).label,
                              startDate: b.start_date,
                              endDate: b.end_date,
                              guests: b.guests,
                              guestName: liveUser?.name || 'Verified Traveler',
                              email: liveUser?.email
                            })}
                          >
                            <FileDown size={14} /> Download Guide Voucher PDF
                          </button>
                          {getBookingStatusDisplay(b).label === 'Finished' && (
                            <button
                              type="button"
                              className="ts-btn-outline"
                              style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem', borderColor: '#f59e0b', color: '#b45309', background: '#fffbeb', fontWeight: 700 }}
                              onClick={() => {
                                const pkgId = String(b.package_id || b.booking_id || b.id || b.package_title);
                                setReviewForm(prev => ({ ...prev, packageId: pkgId }));
                                setActiveTab('reviews');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              ⭐ Review Guide
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="ts-guides-grid">
                {CERTIFIED_GUIDES.map(guide => (
                  <div key={guide.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <img src={guide.avatarUrl} alt={guide.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid #a3704c' }} />
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>{guide.name}</h4>
                          <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <MapPin size={13} /> {guide.location}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 700, marginTop: '2px' }}>
                            ★ {guide.rating} ({guide.toursCompleted} Tours Completed)
                          </div>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', margin: '0 0 1rem' }}>
                        {guide.bio}
                      </p>

                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Spoken Languages</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                          {guide.languages.map((l, i) => (
                            <span key={i} style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{l}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Daily Rate</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#a3704c' }}>
                          {formatPrice(guide.dailyRate)} <small style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>/ day</small>
                        </div>
                      </div>
                      <button 
                        className="ts-btn-primary"
                        onClick={() => handleBookGuide(guide)}
                        style={{ fontSize: '0.825rem', padding: '0.5rem 1rem' }}
                      >
                        Hire Guide ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PROFILE & SETTINGS TAB */}
          {(activeTab === 'profile' || activeTab === 'settings') && (
            <div className="ts-card-panel" style={{ maxWidth: '650px' }}>
              <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>
                  Profile & Account Settings
                </h2>
                <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Manage your personal details, verified phone number, and account preferences.
                </p>
              </div>

              {/* REGISTERED PROFILE SUMMARY BANNER */}
              <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(15,23,42,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: '#38bdf8', textTransform: 'uppercase' }}>REGISTERED ACCOUNT PROFILE</span>
                  <span style={{ background: '#10b981', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>ACTIVE</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Full Name</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.15rem' }}>{liveUser?.name || 'Traveler'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Email Address</div>
                    <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.15rem' }}>{liveUser?.email || 'traveler@travelsphere.com'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Registered Phone Number</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#4ade80', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Phone size={15} /> {userPhone}
                      <span style={{ background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {profileError && (
                <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertCircle size={16} /> {profileError}
                </div>
              )}

              <form onSubmit={handleProfileSave}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  
                  {/* Full Name Field: Letters & Spaces Only */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.9rem', fontWeight: 600 }}
                      value={profileData.name}
                      onChange={(e) => {
                        const sanitized = sanitizeFullName(e.target.value);
                        setProfileData(prev => ({ ...prev, name: sanitized }));
                        setProfileError('');
                      }}
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      Only alphabetic characters and spaces are allowed. Numbers and symbols are forbidden.
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '0.3rem', fontSize: '0.9rem', background: '#f8fafc', opacity: 0.85 }}
                      value={liveUser?.email || ''}
                      disabled
                    />
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      Your primary email address linked to your travel reservations.
                    </div>
                  </div>

                  {/* Profile Photo (File Manager Upload or URL) */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Profile Photo
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                      <img 
                        src={profileData.avatar_url || liveUser?.avatar_url || '/destination-images/swiss-alps.webp'} 
                        alt="Avatar Preview" 
                        style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #a3704c' }} 
                      />
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            id="ts-avatar-file-input"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 3 * 1024 * 1024) {
                                setProfileError('Please choose an image smaller than 3 MB.');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === 'string') {
                                  setProfileData(prev => ({ ...prev, avatar_url: reader.result }));
                                  setProfileError('');
                                  try {
                                    localStorage.setItem(avatarKey, reader.result);
                                  } catch { /* ignore */ }
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('ts-avatar-file-input')?.click()}
                            style={{
                              padding: '0.6rem 0.95rem',
                              borderRadius: '10px',
                              border: '1px solid #a3704c',
                              background: '#fdf8f4',
                              color: '#855838',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Upload from File Manager
                          </button>
                          <input 
                            type="url" 
                            style={{ flex: 1, minWidth: '160px', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                            value={profileData.avatar_url || ''}
                            onChange={e => setProfileData(prev => ({ ...prev, avatar_url: e.target.value }))}
                            placeholder="Or paste image URL / pick preset"
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.725rem', color: '#64748b' }}>Presets:</span>
                          {[
                            { name: 'Alpine', url: '/destination-images/swiss-alps.webp' },
                            { name: 'Kyoto', url: '/destination-images/kyoto.webp' },
                            { name: 'Santorini', url: '/destination-images/santorini.webp' },
                            { name: 'Maldives', url: '/destination-images/maldives.webp' }
                          ].map(preset => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => setProfileData(prev => ({ ...prev, avatar_url: preset.url }))}
                              style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Number with Country Code Selector & Digit Restriction */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Mobile Number
                    </label>
                    <div className="ts-phone-input-wrap">
                      <select 
                        className="ts-country-dropdown"
                        value={profileCountryCode}
                        onChange={(e) => {
                          setProfileCountryCode(e.target.value);
                          setProfileError('');
                        }}
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.name} ({c.code})
                          </option>
                        ))}
                      </select>

                      <input 
                        type="tel" 
                        className="ts-phone-number-field"
                        value={profileData.phone}
                        maxLength={activeCountry.digits}
                        placeholder={activeCountry.placeholder}
                        onChange={(e) => {
                          const digitsOnly = sanitizePhoneDigits(e.target.value).slice(0, activeCountry.digits);
                          setProfileData(prev => ({ ...prev, phone: digitsOnly }));
                          setProfileError('');
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      {activeCountry.code === '+91' 
                        ? 'For India (+91), exactly 10 digits required.' 
                        : `Enter up to ${activeCountry.digits} digits for ${activeCountry.name}.`}
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <button type="submit" className="ts-btn-primary" disabled={isSavingProfile}>
                    <Check size={16} /> {isSavingProfile ? 'Saving...' : 'Save Profile'}
                  </button>

                  <button type="button" className="ts-btn-outline" style={{ color: '#ef4444', borderColor: '#fecaca' }} onClick={handleLogout}>
                    <LogOut size={16} /> Log Out Account
                  </button>
                </div>
              </form>

              {/* CHANGE PASSWORD SECTION */}
              <div style={{ marginTop: '2.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-dark)', margin: '0 0 0.4rem' }}>
                  Change Account Password
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.825rem', margin: '0 0 1.25rem' }}>
                  Update your login credentials securely with standard 6+ character validation.
                </p>

                {passwordMsg && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    {passwordMsg}
                  </div>
                )}
                {passwordError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handleChangePassword} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Current Password</label>
                    <input 
                      type="password"
                      required
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.875rem' }}
                      placeholder="••••••••"
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>New Password</label>
                      <input 
                        type="password"
                        required
                        minLength={6}
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.875rem' }}
                        placeholder="Min 6 characters"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Confirm New Password</label>
                      <input 
                        type="password"
                        required
                        minLength={6}
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.875rem' }}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  <div>
                    <button type="submit" className="ts-btn-outline" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', fontWeight: 700, padding: '0.6rem 1.25rem' }}>
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>

        {showAddPlanModal && createPortal(
          <div className="ts-modal-backdrop" onClick={() => setShowAddPlanModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="ts-modal-card" onClick={e => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '18px', width: '100%', maxWidth: '520px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>Create New Trip Plan</h3>
                <button type="button" onClick={() => setShowAddPlanModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveTripPlan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Trip Plan Title</label>
                  <input 
                    type="text"
                    required
                    value={planForm.title}
                    onChange={e => setPlanForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Kyoto Cherry Blossom & Ryokan Tour"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Destination / Country</label>
                  <input 
                    type="text"
                    required
                    value={planForm.destination}
                    onChange={e => setPlanForm(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="e.g. Kyoto, Japan"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Start Date</label>
                    <input 
                      type="date"
                      required
                      value={planForm.startDate}
                      onChange={e => setPlanForm(prev => ({ ...prev, startDate: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>End Date</label>
                    <input 
                      type="date"
                      required
                      value={planForm.endDate}
                      onChange={e => setPlanForm(prev => ({ ...prev, endDate: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Target Budget ($)</label>
                    <input 
                      type="number"
                      required
                      min={100}
                      value={planForm.budget}
                      onChange={e => setPlanForm(prev => ({ ...prev, budget: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Status</label>
                    <select
                      value={planForm.status}
                      onChange={e => setPlanForm(prev => ({ ...prev, status: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.875rem', background: '#fff' }}
                    >
                      <option value="Planning">Planning</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Notes / Activities</label>
                  <textarea 
                    rows={3}
                    value={planForm.notes}
                    onChange={e => setPlanForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Key attractions, hotel preferences, dietary requirements..."
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.85rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="ts-btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}>
                    Save Trip Plan ➔
                  </button>
                  <button type="button" onClick={() => setShowAddPlanModal(false)} className="ts-btn-outline" style={{ padding: '0.75rem 1.25rem' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {showFastBookingModal && (
          <FastBookingModal 
            type={showFastBookingModal} 
            onClose={() => setShowFastBookingModal(null)} 
            onConfirm={handleCreateFastBooking} 
            formatPrice={formatPrice} 
          />
        )}

        {/* Unified Secure Checkout & Payment Modal with Coupons & Tour Guides */}
        <CheckoutModal 
          isOpen={showCheckoutModal} 
          onClose={() => setShowCheckoutModal(false)} 
          bookingDetails={checkoutDetails} 
          onSuccess={handleCheckoutSuccess} 
        />

      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="ts-mobile-bottom-bar" aria-label="Mobile Navigation">
        <button 
          type="button" 
          className={`ts-bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <LayoutDashboard size={20} />
          <span>Overview</span>
        </button>

        <button 
          type="button" 
          className={`ts-bottom-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => { setActiveTab('bookings'); setBookingFilter('all'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <Calendar size={20} />
          <span>Bookings</span>
          {liveBookings.length > 0 && <span className="ts-bottom-badge">{liveBookings.length}</span>}
        </button>

        <button 
          type="button" 
          className={`ts-bottom-nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => { setActiveTab('wishlist'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <Heart size={20} />
          <span>Wishlist</span>
          {liveWishlist.length > 0 && <span className="ts-bottom-badge">{liveWishlist.length}</span>}
        </button>

        <button 
          type="button" 
          className={`ts-bottom-nav-item ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => { setActiveTab('plans'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <Compass size={20} />
          <span>Trip Plans</span>
        </button>

        <button 
          type="button" 
          className={`ts-bottom-nav-item ${showMobileDrawer ? 'active' : ''}`}
          onClick={() => setShowMobileDrawer(prev => !prev)}
          aria-label="Open menu drawer"
        >
          <Menu size={20} />
          <span>More</span>
        </button>
      </nav>

    </div>
  );
};

export default CustomerDashboard;
