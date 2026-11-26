import { useState, useMemo } from 'react';
import { 
  Plane, 
  Train, 
  Bus, 
  Search, 
  Luggage, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Sparkles
} from 'lucide-react';
import { useCurrency } from '../../../context/useCurrency';
import usePageTitle from '../../../hooks/usePageTitle';
import CheckoutModal from '../../../components/common/CheckoutModal/CheckoutModal';
import './Transit.css';

const TRANSIT_SCHEDULES = [
  // FLIGHTS
  {
    id: 'fl-1',
    mode: 'flight',
    code: 'TS-FL-101',
    carrier: 'Swiss International Air',
    origin: 'Zurich (ZRH)',
    originCity: 'Zurich, Switzerland',
    destination: 'Rome (FCO)',
    destinationCity: 'Rome, Italy',
    departureTime: '08:30 AM',
    arrivalTime: '10:05 AM',
    duration: '1h 35m',
    type: 'Non-stop Flight',
    aircraft: 'Airbus A220-300',
    cabinClass: 'Economy / Flex',
    price: 180,
    seatsLeft: 14,
    baggage: '1x 23kg Checked + 8kg Cabin',
    amenities: ['Free High-Speed Wi-Fi', 'Complimentary Beverage & Snack', 'USB-C Power at Seat', 'Scenic Alpine Crossing'],
    tag: 'Popular Route'
  },
  {
    id: 'fl-2',
    mode: 'flight',
    code: 'TS-FL-204',
    carrier: 'Japan SkyLink Airways',
    origin: 'Tokyo Haneda (HND)',
    originCity: 'Tokyo, Japan',
    destination: 'Osaka Kansai (KIX)',
    destinationCity: 'Osaka, Japan',
    departureTime: '11:20 AM',
    arrivalTime: '12:35 PM',
    duration: '1h 15m',
    type: 'Non-stop Express',
    aircraft: 'Boeing 787-9 Dreamliner',
    cabinClass: 'Premium Economy',
    price: 145,
    seatsLeft: 9,
    baggage: '2x 23kg Checked + 10kg Cabin',
    amenities: ['In-Flight Entertainment', 'Wide Recline Seating', 'Japanese Bento Option', 'Fast-Track Boarding'],
    tag: 'High Demand'
  },
  {
    id: 'fl-3',
    mode: 'flight',
    code: 'TS-FL-309',
    carrier: 'Aegean Island Wings',
    origin: 'Athens (ATH)',
    originCity: 'Athens, Greece',
    destination: 'Santorini (JTR)',
    destinationCity: 'Santorini, Greece',
    departureTime: '02:40 PM',
    arrivalTime: '03:25 PM',
    duration: '45m',
    type: 'Island Hop Flight',
    aircraft: 'ATR 72-600',
    cabinClass: 'Island Classic',
    price: 95,
    seatsLeft: 6,
    baggage: '1x 15kg Checked + 7kg Cabin',
    amenities: ['Caldera Aerial Views', 'Fast 45m Transit', 'Beverage Service', 'Guaranteed Connection'],
    tag: 'Island Shuttle'
  },
  {
    id: 'fl-4',
    mode: 'flight',
    code: 'TS-FL-412',
    carrier: 'Alpine Aero Connect',
    origin: 'Geneva (GVA)',
    originCity: 'Geneva, Switzerland',
    destination: 'Nice Côte d’Azur (NCE)',
    destinationCity: 'Nice, France',
    departureTime: '04:15 PM',
    arrivalTime: '05:20 PM',
    duration: '1h 05m',
    type: 'Riviera Link',
    aircraft: 'Embraer E195-E2',
    cabinClass: 'Business / Club',
    price: 160,
    seatsLeft: 18,
    baggage: '2x 32kg Checked + 12kg Cabin',
    amenities: ['Priority Check-in', 'Lounge Access Included', 'French Pastry & Champagne', 'Quiet Cabin Zone'],
    tag: 'Business Club'
  },

  // HIGH-SPEED TRAINS
  {
    id: 'tr-1',
    mode: 'train',
    code: 'TS-TR-501',
    carrier: 'Glacier Express Panorama Rail',
    origin: 'Zermatt Station (ZMT)',
    originCity: 'Zermatt, Switzerland',
    destination: 'St. Moritz (SMT)',
    destinationCity: 'St. Moritz, Switzerland',
    departureTime: '09:15 AM',
    arrivalTime: '05:00 PM',
    duration: '7h 45m',
    type: 'Panoramic Alpine Rail',
    aircraft: 'Swiss Glass-Roof Panorama Coach',
    cabinClass: 'Excellence Panorama Class',
    price: 125,
    seatsLeft: 8,
    baggage: 'Unlimited Baggage in Coach',
    amenities: ['Floor-to-Ceiling Glass Roof', '3-Course Alpine Lunch', 'Audio Commentary Guide', 'Bar Car Access'],
    tag: 'Scenic Icon'
  },
  {
    id: 'tr-2',
    mode: 'train',
    code: 'TS-TR-602',
    carrier: 'JR Tokaido Shinkansen (Nozomi)',
    origin: 'Tokyo Central (TYO)',
    originCity: 'Tokyo, Japan',
    destination: 'Kyoto Station (KYO)',
    destinationCity: 'Kyoto, Japan',
    departureTime: '07:30 AM',
    arrivalTime: '09:45 AM',
    duration: '2h 15m',
    type: 'Bullet Train (320 km/h)',
    aircraft: 'Shinkansen N700S Series',
    cabinClass: 'Green Car (First Class)',
    price: 110,
    seatsLeft: 22,
    baggage: '2x Large Luggage Space Reserved',
    amenities: ['Ultra-Smooth Magnetic Glide', 'AC Power at Every Seat', 'Baggage Lockers', 'Mount Fuji View Side'],
    tag: 'Top Commuter'
  },
  {
    id: 'tr-3',
    mode: 'train',
    code: 'TS-TR-708',
    carrier: 'Eurostar Continental Rail',
    origin: 'Paris Gare du Nord (XPG)',
    originCity: 'Paris, France',
    destination: 'London St Pancras (STP)',
    destinationCity: 'London, United Kingdom',
    departureTime: '10:10 AM',
    arrivalTime: '11:30 AM',
    duration: '2h 20m',
    type: 'Channel Tunnel High-Speed',
    aircraft: 'Eurostar e320 High-Speed',
    cabinClass: 'Standard Premier',
    price: 135,
    seatsLeft: 11,
    baggage: '2x Large Bags + 1 Hand Luggage',
    amenities: ['Direct City-to-City Center', 'Light Cold Meal Served at Seat', 'Complimentary Magazines', 'Free Wi-Fi'],
    tag: 'City-to-City'
  },
  {
    id: 'tr-4',
    mode: 'train',
    code: 'TS-TR-814',
    carrier: 'Frecciarossa High-Speed Rail',
    origin: 'Milano Centrale (MIL)',
    originCity: 'Milan, Italy',
    destination: 'Firenze SMN (FLR)',
    destinationCity: 'Florence, Italy',
    departureTime: '01:25 PM',
    arrivalTime: '03:05 PM',
    duration: '1h 40m',
    type: 'High-Speed Arrow (300 km/h)',
    aircraft: 'Frecciarossa 1000',
    cabinClass: 'Executive Premium',
    price: 85,
    seatsLeft: 16,
    baggage: 'Overhead + End of Car Storage',
    amenities: ['Italian Espresso Service', 'Single Row Leather Seats', 'Meeting Area', 'High-Speed Connectivity'],
    tag: 'Italian Speed'
  },

  // INTERCITY BUSES / COACHES
  {
    id: 'bs-1',
    mode: 'bus',
    code: 'TS-BS-901',
    carrier: 'Alpine Scenic Coachline',
    origin: 'Innsbruck Central (INN)',
    originCity: 'Innsbruck, Austria',
    destination: 'Salzburg Mirabell (SZG)',
    destinationCity: 'Salzburg, Austria',
    departureTime: '08:00 AM',
    arrivalTime: '10:30 AM',
    duration: '2h 30m',
    type: 'Comfort Intercity Coach',
    aircraft: 'Mercedes-Benz Tourismo VIP',
    cabinClass: 'Panoramic Recliner',
    price: 42,
    seatsLeft: 19,
    baggage: '1x 20kg Under-coach + 1 Small Cabin',
    amenities: ['Extra Legroom Reclining Seats', 'Individual USB Charging Ports', 'On-Board Restroom', 'Scenic Valley Route'],
    tag: 'Budget Friendly'
  },
  {
    id: 'bs-2',
    mode: 'bus',
    code: 'TS-BS-905',
    carrier: 'Kyoto Heritage Shuttles',
    origin: 'Kyoto Station Hub (KYO)',
    originCity: 'Kyoto, Japan',
    destination: 'Nara Deer Park & Temples',
    destinationCity: 'Nara, Japan',
    departureTime: '09:45 AM',
    arrivalTime: '10:55 AM',
    duration: '1h 10m',
    type: 'Cultural Day Shuttle',
    aircraft: 'Hino S’elega Executive Coach',
    cabinClass: 'Reserved Single Seat',
    price: 28,
    seatsLeft: 25,
    baggage: 'Hand Baggage & Daypack',
    amenities: ['English Audio Commentary', 'Climate Controlled', 'Direct Temple Drop-off', 'Round-trip Return Flexible'],
    tag: 'Heritage Shuttle'
  },
  {
    id: 'bs-3',
    mode: 'bus',
    code: 'TS-BS-912',
    carrier: 'Amalfi Coast Panorama Line',
    origin: 'Napoli Centrale (NAP)',
    originCity: 'Naples, Italy',
    destination: 'Positano Overlook (POS)',
    destinationCity: 'Positano, Italy',
    departureTime: '11:30 AM',
    arrivalTime: '01:15 PM',
    duration: '1h 45m',
    type: 'Cliffside Panorama Minicoach',
    aircraft: 'Iveco Daily Panoramic',
    cabinClass: 'Window Guaranteed Seat',
    price: 35,
    seatsLeft: 12,
    baggage: '1x Medium Bag + Personal Item',
    amenities: ['Guaranteed Coastal Window Seat', 'Experienced Mountain Driver', 'Photo Stop at Cliff Point', 'Air Conditioning'],
    tag: 'Scenic Coastline'
  }
];

export default function TransitPage() {
  usePageTitle('Flights, Trains & Buses - Scheduled Transit');
  const { formatPrice } = useCurrency();
  
  const [selectedMode, setSelectedMode] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  
  // Checkout modal state for direct booking
  const [checkoutItem, setCheckoutItem] = useState(null);

  // Sync scheduled routes with Transport Provider fleet updates from localStorage
  const combinedSchedules = useMemo(() => {
    let customSchedules = [];
    try {
      const stored = JSON.parse(localStorage.getItem('ts_transport_services') || '[]');
      customSchedules = stored.map(s => {
        const mode = (s.serviceType || '').toLowerCase();
        if (!['flight', 'train', 'bus'].includes(mode)) return null;
        return {
          id: `provider-${s.id}`,
          mode,
          code: s.title?.split(' ')?.[0]?.toUpperCase() || `TS-${mode.toUpperCase()}-${s.id}`,
          carrier: s.vehicleName || s.title || 'TravelSphere Partner Fleet',
          origin: s.origin || 'Origin City',
          originCity: s.origin || 'Origin City',
          destination: s.destination || 'Destination Hub',
          destinationCity: s.destination || 'Destination Hub',
          departureTime: s.departureTime || '09:00 AM',
          arrivalTime: s.arrivalTime || '11:30 AM',
          duration: s.duration || '2h 30m',
          type: `${s.serviceType} Scheduled Route`,
          aircraft: s.vehicleName || `${s.serviceType} Fleet`,
          cabinClass: 'Standard Reserved',
          price: Number(s.price || 99),
          seatsLeft: Number(s.seatsAvailable || 15),
          baggage: 'Included Luggage Allowance',
          amenities: ['Direct Route', 'Air Conditioned', 'Priority Boarding'],
          tag: 'Provider Route'
        };
      }).filter(Boolean);
    } catch { /* ignore */ }

    const existingIds = new Set(TRANSIT_SCHEDULES.map(t => t.id));
    const newItems = customSchedules.filter(c => !existingIds.has(c.id));
    return [...newItems, ...TRANSIT_SCHEDULES];
  }, []);

  const filteredTransit = useMemo(() => {
    return combinedSchedules.filter(item => {
      // Mode filter
      if (selectedMode !== 'all' && item.mode !== selectedMode) return false;
      
      // Class filter
      if (selectedClass === 'first' && !item.cabinClass.toLowerCase().includes('first') && !item.cabinClass.toLowerCase().includes('executive') && !item.cabinClass.toLowerCase().includes('business')) return false;
      if (selectedClass === 'economy' && !item.cabinClass.toLowerCase().includes('economy') && !item.cabinClass.toLowerCase().includes('classic') && !item.cabinClass.toLowerCase().includes('comfort') && !item.cabinClass.toLowerCase().includes('single')) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCarrier = item.carrier.toLowerCase().includes(q);
        const matchesOrigin = item.origin.toLowerCase().includes(q) || item.originCity.toLowerCase().includes(q);
        const matchesDest = item.destination.toLowerCase().includes(q) || item.destinationCity.toLowerCase().includes(q);
        const matchesCode = item.code.toLowerCase().includes(q);
        if (!matchesCarrier && !matchesOrigin && !matchesDest && !matchesCode) return false;
      }

      return true;
    });
  }, [combinedSchedules, selectedMode, selectedClass, searchQuery]);

  const handleBookTransit = (transit) => {
    setCheckoutItem({
      id: transit.id,
      title: `${transit.carrier} · ${transit.originCity.split(',')[0]} → ${transit.destinationCity.split(',')[0]}`,
      price: transit.price,
      type: transit.mode === 'flight' ? 'Flight Ticket' : (transit.mode === 'train' ? 'Train Ticket' : 'Bus Ticket'),
      code: transit.code,
      departure: transit.departureTime,
      destination: transit.destinationCity,
      date: '2026-12-15'
    });
  };

  return (
    <div className="transit-market-page">
      {/* HERO SECTION */}
      <section className="transit-hero-section">
        <div className="transit-hero-inner">
          <div className="transit-hero-badge">
            <Sparkles size={14} color="#a3704c" />
            <span>Official TravelSphere Scheduled Transit Network</span>
          </div>
          <h1>
            Connect every route,<br />
            <em>effortlessly.</em>
          </h1>
          <p className="transit-hero-lede">
            Discover and reserve scheduled domestic & international flights, scenic high-speed panoramic rail, and luxury intercity coaches with guaranteed seat allocations and instant mobile boarding passes.
          </p>

          {/* Quick Metrics Strip */}
          <div className="transit-hero-stats">
            <div className="transit-stat-pill">
              <strong>42+</strong>
              <span>Countries Covered</span>
            </div>
            <div className="transit-stat-pill">
              <strong>320 km/h</strong>
              <span>High-Speed Rail</span>
            </div>
            <div className="transit-stat-pill">
              <strong>100%</strong>
              <span>Protected Booking</span>
            </div>
            <div className="transit-stat-pill">
              <strong>Instant</strong>
              <span>PDF Boarding Pass</span>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER & SEARCH DOCK */}
      <section className="transit-filter-dock">
        <div className="transit-container">
          <div className="transit-filter-card">
            {/* Mode Selector Tabs */}
            <div className="transit-mode-tabs">
              <button 
                type="button" 
                className={`transit-mode-btn ${selectedMode === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedMode('all')}
              >
                <span>All Transit ({TRANSIT_SCHEDULES.length})</span>
              </button>
              <button 
                type="button" 
                className={`transit-mode-btn ${selectedMode === 'flight' ? 'active' : ''}`}
                onClick={() => setSelectedMode('flight')}
              >
                <Plane size={16} />
                <span>Flights (4)</span>
              </button>
              <button 
                type="button" 
                className={`transit-mode-btn ${selectedMode === 'train' ? 'active' : ''}`}
                onClick={() => setSelectedMode('train')}
              >
                <Train size={16} />
                <span>High-Speed Trains (4)</span>
              </button>
              <button 
                type="button" 
                className={`transit-mode-btn ${selectedMode === 'bus' ? 'active' : ''}`}
                onClick={() => setSelectedMode('bus')}
              >
                <Bus size={16} />
                <span>Intercity Coaches (3)</span>
              </button>
            </div>

            {/* Search and Dropdowns */}
            <div className="transit-controls-row">
              <div className="transit-search-input-wrap">
                <Search size={18} className="transit-search-icon" />
                <input 
                  type="text"
                  placeholder="Search by city, airport code, or carrier (e.g. Zurich, Tokyo, Paris, Rome, Kyoto)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search transit routes"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="clear-search-btn">
                    ✕
                  </button>
                )}
              </div>

              <div className="transit-dropdown-wrap">
                <Filter size={15} className="dropdown-icon" />
                <select 
                  value={selectedClass} 
                  onChange={(e) => setSelectedClass(e.target.value)}
                  aria-label="Filter by cabin class"
                >
                  <option value="all">All Cabin Classes</option>
                  <option value="economy">Economy / Standard</option>
                  <option value="first">First / Panorama / Business</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRANSIT CATALOG SECTION */}
      <section className="transit-catalog-section">
        <div className="transit-container">
          <div className="transit-catalog-header">
            <div>
              <h2>Available Transit Schedules</h2>
              <p>Showing {filteredTransit.length} verified scheduled departures with live pricing and seat guarantees.</p>
            </div>
            <div className="transit-catalog-tag">
              <ShieldCheck size={16} color="#16a34a" /> Free Cancellation up to 48 Hours
            </div>
          </div>

          {filteredTransit.length === 0 ? (
            <div className="transit-empty-state">
              <Search size={36} color="#a3704c" />
              <h3>No transit schedules matched your search</h3>
              <p>Try clearing your search query or selecting "All Transit" to view all available routes.</p>
              <button type="button" onClick={() => { setSelectedMode('all'); setSearchQuery(''); setSelectedClass('all'); }} className="transit-btn-reset">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="transit-cards-grid">
              {filteredTransit.map((t) => {
                const isFlight = t.mode === 'flight';
                const isTrain = t.mode === 'train';
                const Icon = isFlight ? Plane : (isTrain ? Train : Bus);
                const modeLabel = isFlight ? 'Flight' : (isTrain ? 'High-Speed Rail' : 'Coach');

                return (
                  <article key={t.id} className="transit-card">
                    {/* TOP BAR */}
                    <div className="transit-card-top">
                      <div className="transit-carrier-box">
                        <div className={`transit-icon-circle ${t.mode}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="carrier-title-row">
                            <h3>{t.carrier}</h3>
                            <span className="transit-code-badge">{t.code}</span>
                          </div>
                          <span className="transit-aircraft-type">{t.aircraft} · {t.cabinClass}</span>
                        </div>
                      </div>
                      <span className="transit-route-tag">{t.tag}</span>
                    </div>

                    {/* TIMELINE ROUTE ROW */}
                    <div className="transit-timeline-row">
                      <div className="timeline-node origin">
                        <span className="time-val">{t.departureTime}</span>
                        <strong className="code-val">{t.origin}</strong>
                        <span className="city-val">{t.originCity}</span>
                      </div>

                      <div className="timeline-connector">
                        <span className="duration-val">{t.duration}</span>
                        <div className="connector-line">
                          <span className="dot start" />
                          <div className="line-bar" />
                          <Icon size={14} className="flying-icon" />
                          <span className="dot end" />
                        </div>
                        <span className="route-type-badge">{t.type}</span>
                      </div>

                      <div className="timeline-node destination">
                        <span className="time-val">{t.arrivalTime}</span>
                        <strong className="code-val">{t.destination}</strong>
                        <span className="city-val">{t.destinationCity}</span>
                      </div>
                    </div>

                    {/* AMENITIES PILLS */}
                    <div className="transit-amenities-strip">
                      {t.amenities.map((amenity, i) => (
                        <span key={i} className="amenity-pill">
                          <CheckCircle2 size={13} color="#a3704c" /> {amenity}
                        </span>
                      ))}
                    </div>

                    {/* FOOTER BAR */}
                    <div className="transit-card-footer">
                      <div className="transit-baggage-info">
                        <Luggage size={14} color="#64748b" />
                        <span>{t.baggage}</span>
                      </div>

                      <div className="transit-action-side">
                        <div className="transit-price-box">
                          <span className="price-lbl">Starting from</span>
                          <strong className="price-val">{formatPrice(t.price)}</strong>
                          <span className="seats-warn">Only {t.seatsLeft} seats available</span>
                        </div>

                        <button 
                          type="button" 
                          className="transit-book-btn"
                          onClick={() => handleBookTransit(t)}
                        >
                          Book {modeLabel} <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CHECKOUT MODAL INTEGRATION */}
      {checkoutItem && (
        <CheckoutModal 
          isOpen={true}
          onClose={() => setCheckoutItem(null)}
          bookingDetails={checkoutItem}
          onSuccess={() => {
            setCheckoutItem(null);
          }}
        />
      )}
    </div>
  );
}
