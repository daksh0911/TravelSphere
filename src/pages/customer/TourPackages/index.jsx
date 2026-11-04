import { lazy, Suspense, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronDown, Clock3, FileDown, Globe, Heart, LayoutGrid, MapPin, Search, ShieldCheck, Star, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../../services/api';
import './TourPackages.css';
import '../../../styles/showcase-skin.css';
import './Compare.css';
import { useCurrency } from '../../../context/useCurrency';
import SmartImage from '../../../components/common/SmartImage';
const InteractiveWorldMap = lazy(() => import('../../../components/common/InteractiveWorldMap'));
import { generateBookingPDF } from '../../../utils/pdfVoucher';
import { DESTINATIONS_BY_ID } from '../../../data/destinations';
import usePageTitle from '../../../hooks/usePageTitle';

const PACKAGES = [
  { id: 1, title: 'Maldives Overwater Escape', location: 'Maldives', category: 'Beach & islands', days: 5, nights: 4, price: 1045, priceLabel: '$1,045-$2,250', rating: 4.9, reviews: 1280, image: '/package-images/1-maldives.webp', tag: 'Most loved', inclusions: ['Private water villa', 'Dolphin sunset cruise', 'All meals'] },
  { id: 2, title: 'Santorini Villa & Yacht Week', location: 'Santorini, Greece', category: 'Honeymoon', days: 6, nights: 5, price: 1242, priceLabel: '$1,242-$2,312', rating: 4.8, reviews: 940, image: '/package-images/2-santorini.webp', tag: 'Limited dates', inclusions: ['Cliffside villa', 'Catamaran day', 'Wine tasting'] },
  { id: 3, title: 'Bali Wellness & Temple Trails', location: 'Bali, Indonesia', category: 'Wellness', days: 5, nights: 4, price: 636, priceLabel: '$636-$1,500', rating: 4.7, reviews: 1520, image: '/package-images/3-bali.webp', tag: 'Best value', inclusions: ['Private transfers', 'Daily spa ritual', 'Temple entries'] },
  { id: 4, title: 'Swiss Alps Scenic Express', location: 'Interlaken, Switzerland', category: 'Adventure', days: 8, nights: 7, price: 1985, priceLabel: '$1,985-$2,285', rating: 5.0, reviews: 890, image: '/package-images/4-swiss-alps.webp', tag: 'Editors pick', inclusions: ['First-class rail', 'Alpine chalet', 'Glacier excursion'] },
  { id: 5, title: 'Kyoto Culture & Sakura', location: 'Kyoto, Japan', category: 'Culture', days: 7, nights: 6, price: 955, priceLabel: '$955-$1,499', rating: 4.9, reviews: 1450, image: '/package-images/5-kyoto.webp', tag: 'New season', inclusions: ['Ryokan stay', 'Tea ceremony', 'Temple pass'] },
  { id: 6, title: 'Dubai Desert & Skyline', location: 'Dubai, UAE', category: 'Luxury', days: 4, nights: 3, price: 450, priceLabel: '$450-$690', rating: 4.9, reviews: 1100, image: '/package-images/6-dubai.webp', tag: 'Luxury icon', inclusions: ['4-star hotel', 'Desert safari', 'City and harbour tours'] },
  { id: 7, title: 'Paris VIP Art & Seine Gastronomy', location: 'Paris, France', category: 'Luxury', days: 5, nights: 4, price: 1650, priceLabel: '$1,650-$2,800', rating: 4.8, reviews: 820, image: '/package-images/7-paris.webp', tag: 'Culinary pick', inclusions: ['5-star Left Bank stay', 'Louvre VIP pass', 'Seine dinner cruise'] },
  { id: 8, title: 'Rajasthan Royal Palaces & Desert Safari', location: 'Jaipur & Udaipur, Rajasthan, India', category: 'Culture', days: 6, nights: 5, price: 1280, priceLabel: '$1,280-$2,100', rating: 4.8, reviews: 760, image: '/package-images/8-rajasthan.webp', tag: 'Heritage trail', inclusions: ['Palace heritage stay', 'Amber Fort private guide', 'Thar desert camp'] },
  { id: 10, title: 'Bangkok Temple & Riverside Escape', location: 'Bangkok, Thailand', category: 'Culture', days: 4, nights: 3, price: 490, priceLabel: '$490-$890', rating: 4.8, reviews: 820, image: '/package-images/9-bangkok.webp', tag: 'City discovery', inclusions: ['Grand Palace and Wat Pho tour', 'Chao Phraya river cruise', 'Riverside hotel stay'] },
  { id: 11, title: 'Amsterdam Historic Canals & Keukenhof', location: 'Amsterdam, Netherlands', category: 'Culture', days: 5, nights: 4, price: 1550, priceLabel: '$1,550-$2,350', rating: 4.7, reviews: 640, image: '/package-images/10-amsterdam.webp', tag: 'Spring highlight', inclusions: ['Canal-side boutique hotel', 'Van Gogh Museum skip-the-line', 'Keukenhof tulip entry'] },
  { id: 12, title: 'Rome Antiquity & Trattoria Trails', location: 'Rome, Italy', category: 'Culture', days: 5, nights: 4, price: 1180, priceLabel: '$1,180-$2,050', rating: 4.8, reviews: 730, image: '/package-images/11-rome.webp', tag: 'New collection', inclusions: ['Historic-centre stay', 'Colosseum guided visit', 'Neighbourhood food walk'] },
  { id: 13, title: 'Cairo Pyramids & Nile Evenings', location: 'Cairo, Egypt', category: 'Culture', days: 5, nights: 4, price: 780, priceLabel: '$780-$1,450', rating: 4.7, reviews: 540, image: '/package-images/12-cairo.webp', tag: 'Ancient world', inclusions: ['Nile-side hotel', 'Giza pyramid visit', 'Old Cairo guide'] },
  { id: 14, title: 'Sydney Harbour & Coastal Walks', location: 'Sydney, Australia', category: 'Adventure', days: 6, nights: 5, price: 1490, priceLabel: '$1,490-$2,600', rating: 4.8, reviews: 610, image: '/package-images/13-sydney.webp', tag: 'Coastal favourite', inclusions: ['Harbour-side stay', 'Bondi to Coogee walk', 'Blue Mountains day trip'] },
  { id: 15, title: 'Cape Town Mountain & Winelands', location: 'Cape Town, South Africa', category: 'Adventure', days: 6, nights: 5, price: 1320, priceLabel: '$1,320-$2,250', rating: 4.8, reviews: 480, image: '/package-images/14-capetown.webp', tag: 'Big horizons', inclusions: ['City boutique hotel', 'Table Mountain visit', 'Stellenbosch wine route'] },
  { id: 16, title: 'New York Neighbourhoods & Museums', location: 'New York, United States', category: 'Culture', days: 5, nights: 4, price: 1690, priceLabel: '$1,690-$2,900', rating: 4.7, reviews: 690, image: '/package-images/15-new-york.webp', tag: 'City energy', inclusions: ['Manhattan hotel', 'Museum Mile pass', 'Brooklyn waterfront walk'] },
  { id: 17, title: 'Banff Lakes & Rocky Mountain Roads', location: 'Banff, Canada', category: 'Adventure', days: 7, nights: 6, price: 1890, priceLabel: '$1,890-$3,100', rating: 4.9, reviews: 430, image: '/package-images/16-banff.webp', tag: 'Wild escape', inclusions: ['Mountain lodge', 'Lake Louise visit', 'Scenic parkway drive'] },
];

const CATEGORIES = ['All packages', 'Beach & islands', 'Honeymoon', 'Wellness', 'Adventure', 'Culture', 'Luxury'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }
};

export default function TourPackagesPage() {
  usePageTitle('Tour Packages');
  const { formatPrice, currency } = useCurrency();
  const [searchParams] = useSearchParams();
  const destinationParam = searchParams.get('destination');
  const [query, setQuery] = useState(() => DESTINATIONS_BY_ID[destinationParam]?.name || localStorage.getItem('ts_destination_interest') || '');
  const [category, setCategory] = useState('All packages');
  const [sort, setSort] = useState('recommended');
  const [viewMode, setViewMode] = useState('grid');
  const [compare, setCompare] = useState([]);
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ts_package_wishlist') || '[]'); } catch { return []; }
  });
  const [booking, setBooking] = useState(null);
  const [checkInDate, setCheckInDate] = useState('2026-10-15');
  const [checkOutDate, setCheckOutDate] = useState('2026-10-20');
  const [travelersCount, setTravelersCount] = useState(2);
  const [compareOpen, setCompareOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [lastConfirmedBooking, setLastConfirmedBooking] = useState(null);

  const handleOpenBooking = (pkg) => {
    const start = new Date();
    start.setDate(start.getDate() + 14);
    const startStr = start.toISOString().split('T')[0];

    const end = new Date(start);
    end.setDate(end.getDate() + (pkg.nights || pkg.days || 5));
    const endStr = end.toISOString().split('T')[0];

    setCheckInDate(startStr);
    setCheckOutDate(endStr);
    setTravelersCount(2);
    setBooking(pkg);
  };

  const handleCheckInChange = (newCheckIn) => {
    setCheckInDate(newCheckIn);
    if (booking && newCheckIn) {
      const start = new Date(newCheckIn);
      const end = new Date(start);
      end.setDate(end.getDate() + (booking.nights || booking.days || 5));
      setCheckOutDate(end.toISOString().split('T')[0]);
    }
  };

  const results = useMemo(() => {
    const filtered = PACKAGES.filter(pkg => (category === 'All packages' || pkg.category === category) && `${pkg.title} ${pkg.location}`.toLowerCase().includes(query.toLowerCase()));
    return [...filtered].sort((a, b) => sort === 'price' ? a.price - b.price : sort === 'rating' ? b.rating - a.rating : 0);
  }, [query, category, sort]);

  const toggleWish = async (id) => {
    const isSaved = wishlist.includes(id);
    const next = isSaved ? wishlist.filter(item => item !== id) : [...wishlist, id];
    setWishlist(next);
    try { localStorage.setItem('ts_package_wishlist', JSON.stringify(next)); } catch { /* ignore */ }

    try {
      if (isSaved) {
        await api.delete(`/wishlist/${id}`);
      } else {
        await api.post('/wishlist', { packageId: id });
      }
    } catch {
      /* fallback to local storage */
    }
  };

  const toggleCompare = (id) => {
    setCompare(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 3 ? [...current, id] : current);
  };

  const submitBooking = (e) => {
    e.preventDefault();
    const guests = Number(travelersCount) || 2;
    const reservation = {
      id: `TS-BK-${Math.floor(1000 + Math.random() * 9000)}`,
      packageId: booking.id,
      packageTitle: booking.title,
      destination: booking.location,
      startDate: checkInDate,
      endDate: checkOutDate,
      days: booking.days,
      nights: booking.nights,
      guests,
      amount: booking.price * guests,
      status: 'Confirmed'
    };
    try {
      const current = JSON.parse(localStorage.getItem('ts_trip_requests') || '[]');
      localStorage.setItem('ts_trip_requests', JSON.stringify([reservation, ...current]));
    } catch { /* ignore */ }

    setLastConfirmedBooking(reservation);
    setBooking(null);
    setToast(`Reservation confirmed for ${reservation.packageTitle}! Official travel voucher ready.`);
    setTimeout(() => setToast(''), 7000);
  };

  const downloadVoucher = (res) => {
    generateBookingPDF({
      id: res.id,
      title: res.packageTitle,
      destination: res.destination,
      days: res.days,
      nights: res.nights,
      amount: res.amount,
      startDate: res.startDate,
      endDate: res.endDate,
      guests: res.guests,
      status: 'CONFIRMED'
    });
  };

  return (
    <div className="package-marketplace">
      <section className="package-heading">
        <div className="package-heading-inner">
          <div className="package-heading-content">
            <span className="market-eyebrow">TRAVELSPHERE COLLECTION / 2026</span>
            <h1>Trips worth<br /><em>remembering.</em></h1>
            <p>Thoughtful itineraries, trusted local experts, and the little details already taken care of. Prices are general estimates and vary by dates, room type, and inclusions.</p>
          </div>
          <div className="package-trust">
            <ShieldCheck size={22} />
            <div>
              <strong>Protected booking</strong>
              <small>Flexible support before you go</small>
            </div>
          </div>
        </div>
      </section>

      <section className="package-toolbar">
        <div className="package-search">
          <Search size={18} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Where do you want to go?" />
        </div>
        <div className="category-scroll">
          {CATEGORIES.map(item => (
            <button className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>
        <div className="package-sort">
          <div className="ts-view-mode-toggle" style={{ marginRight: '0.75rem' }}>
            <button
              type="button"
              className={`ts-toggle-option ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={14} /> Grid
            </button>
            <button
              type="button"
              className={`ts-toggle-option ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
            >
              <Globe size={14} /> World Map
            </button>
          </div>
          <span>{results.length} curated trips</span>
          <label>Sort by 
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="price">Price: low to high</option>
              <option value="rating">Highest rated</option>
            </select>
            <ChevronDown size={15} />
          </label>
        </div>
      </section>

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            className="package-toast"
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Check size={18} /> {toast}
            </span>
            {lastConfirmedBooking && (
              <button
                type="button"
                onClick={() => downloadVoucher(lastConfirmedBooking)}
                style={{ background: '#ffffff', color: '#1e293b', border: 'none', borderRadius: '20px', padding: '0.35rem 0.85rem', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <FileDown size={14} /> Download PDF Voucher
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE WORLD MAP VIEW */}
      {viewMode === 'map' && (
        <div style={{ maxWidth: '1240px', margin: '0 auto 2.5rem auto', padding: '0 1.5rem' }}>
          <Suspense fallback={<div style={{ height: '580px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '16px', color: '#64748b', fontWeight: 600 }}>Loading World Map...</div>}>
            <InteractiveWorldMap
              items={results}
              type="packages"
              onSelect={(pkg) => handleOpenBooking(pkg)}
              height="580px"
            />
          </Suspense>
        </div>
      )}

      {/* CATALOG GRID VIEW */}
      <motion.section 
        className="package-grid" 
        variants={containerVariants} 
        initial="hidden" 
        animate="show"
        style={{ display: viewMode === 'grid' ? 'grid' : 'none' }}
      >
        {results.map(pkg => (
          <motion.article className="package-product-card" key={pkg.id} variants={itemVariants}>
            <div className="package-image-wrap">
              <SmartImage src={pkg.image} alt={pkg.title} sizes="(max-width: 620px) 92vw, (max-width: 900px) 48vw, 31vw" />
              <span className="package-tag">{pkg.tag}</span>
              <button className={`package-wish ${wishlist.includes(pkg.id) ? 'saved' : ''}`} onClick={() => toggleWish(pkg.id)}>
                <Heart size={18} fill={wishlist.includes(pkg.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
            <div className="package-card-body">
              <div className="package-location"><MapPin size={14} />{pkg.location}<span>·</span><Clock3 size={14} />{pkg.days} days</div>
              <h2>{pkg.title}</h2>
              <div className="package-rating"><Star size={14} fill="currentColor" /><strong>{pkg.rating}</strong><span>({pkg.reviews.toLocaleString()} reviews)</span></div>
              <ul>
                {pkg.inclusions.map(item => <li key={item}><Check size={14} />{item}</li>)}
              </ul>
              <div className="package-card-footer">
                <div><small>Typical estimate</small><strong>{currency === "USD" ? pkg.priceLabel : `${formatPrice(pkg.price)}`}</strong><small>{currency} / person</small></div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <Link to={`/packages/${pkg.id}`} className="package-book" style={{ textDecoration: 'none' }}>
                    Details <ArrowRight size={14} />
                  </Link>
                  <button className="package-book" onClick={() => handleOpenBooking(pkg)} style={{ background: '#1e293b' }}>
                    Book
                  </button>
                </div>
              </div>
              <label className="compare-check">
                <input type="checkbox" checked={compare.includes(pkg.id)} onChange={() => toggleCompare(pkg.id)} /> Compare
              </label>
            </div>
          </motion.article>
        ))}
      </motion.section>
      
      {results.length === 0 && (
        <div className="package-empty">
          <Search size={30} />
          <h2>No trips found</h2>
          <p>Try searching for a country, city, or travel style.</p>
          <button onClick={() => { setQuery(''); setCategory('All packages'); }}>Clear filters</button>
        </div>
      )}
      
      <AnimatePresence>
        {compare.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }} 
            className="compare-bar"
          >
            <div>
              <strong>{compare.length} trips selected</strong>
              <span>Compare dates, inclusions, and pricing side by side.</span>
            </div>
            <button onClick={() => setCompare([])}>Clear</button>
            <button className="package-book" onClick={() => setCompareOpen(true)}>Compare now <ArrowRight size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {compareOpen && (
          <motion.div 
            className="compare-backdrop" 
            onClick={() => setCompareOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section 
              className="compare-panel" 
              onClick={e => e.stopPropagation()}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button className="modal-close" onClick={() => setCompareOpen(false)}><X size={18} /></button>
              <span className="market-eyebrow">TRAVELSPHERE COMPARISON</span>
              <h2>Choose the route<br /><em>that feels right.</em></h2>
              <div className="compare-table">
                {compare.map(id => PACKAGES.find(item => item.id === id)).filter(Boolean).map(pkg => (
                  <article key={pkg.id}>
                    <SmartImage src={pkg.image} alt={pkg.title} sizes="(max-width: 620px) 85vw, 240px" />
                    <strong>{pkg.title}</strong>
                    <span>{pkg.location}</span>
                    <b>{pkg.priceLabel} <small>/ person estimate</small></b>
                    <div><Check size={14} /> {pkg.days} days</div>
                    <div><Star size={14} /> {pkg.rating} guest rating</div>
                    <button onClick={() => { handleOpenBooking(pkg); setCompareOpen(false); }}>View this trip <ArrowRight size={15} /></button>
                  </article>
                ))}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {booking && (
          <motion.div 
            className="booking-backdrop" 
            onClick={() => setBooking(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form 
              className="booking-modal" 
              onClick={e => e.stopPropagation()} 
              onSubmit={submitBooking}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <button type="button" className="modal-close" onClick={() => setBooking(null)}><X size={18} /></button>
              <span className="market-eyebrow">REQUEST YOUR JOURNEY</span>
              <h2>{booking.title}</h2>
              <p><MapPin size={14} /> {booking.location} · {booking.days} days / {booking.nights} nights</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                <label style={{ marginTop: 0 }}>Check-in date
                  <input
                    type="date"
                    name="checkIn"
                    required
                    value={checkInDate}
                    onChange={(e) => handleCheckInChange(e.target.value)}
                  />
                </label>
                <label style={{ marginTop: 0 }}>Check-out date
                  <input
                    type="date"
                    name="checkOut"
                    required
                    value={checkOutDate}
                    min={checkInDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                  />
                </label>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                🗓️ Package duration: {booking.days} days / {booking.nights} nights
              </div>

              <label style={{ marginTop: '14px' }}>Travellers
                <select 
                  name="guests" 
                  value={travelersCount} 
                  onChange={(e) => setTravelersCount(Number(e.target.value))}
                >
                  <option value="1">1 traveller</option>
                  <option value="2">2 travellers</option>
                  <option value="3">3 travellers</option>
                  <option value="4">4 travellers</option>
                  <option value="6">6 travellers</option>
                  <option value="8">8 travellers</option>
                </select>
              </label>

              {/* SPLIT GROUP BILL CALCULATOR */}
              <div style={{ marginTop: '12px', background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={14} color="#a3704c" /> Split Group Bill ({travelersCount} Travelers)
                  </span>
                  <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>
                    Live {currency} Rate
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Individual share:</span>
                  <strong style={{ fontSize: '1.05rem', color: '#a3704c' }}>
                    {formatPrice(booking.price)} <small style={{ fontSize: '0.75rem', color: '#64748b' }}>{currency} / person</small>
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Total group booking:</span>
                  <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>
                    {formatPrice(booking.price * travelersCount)} {currency}
                  </strong>
                </div>
              </div>

              <div className="booking-total" style={{ marginTop: '14px' }}>
                <span>Typical estimate</span>
                <strong>{booking.priceLabel} <small>/ person</small></strong>
              </div>

              <button className="primary-book" type="submit">
                Request this trip & Generate Voucher <ArrowRight size={17} />
              </button>
              <small className="booking-note">
                <ShieldCheck size={14} /> Generates print-ready Travel Voucher with QR Verification & manifest.
              </small>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
