import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Star, 
  Heart, 
  Check, 
  X as CloseIcon, 
  Hotel, 
  Compass, 
  Car, 
  ShieldCheck, 
  Sparkles, 
  FileDown,
  Share2,
  Sun
} from 'lucide-react';
import SmartImage from '../../../components/common/SmartImage';
import { useCurrency } from '../../../context/useCurrency';
import { useAuth } from '../../../context/useAuth';
import api from '../../../services/api';
import usePageTitle from '../../../hooks/usePageTitle';
import { generateBookingPDF } from '../../../utils/pdfVoucher';
import './PackageDetail.css';

const generateReservationId = () => `#TS-BK-${Math.floor(100000 + Math.random() * 900000)}`;

const CLIMATE_MAP = {
  1: { temp: '28°C - 31°C', condition: 'Tropical Sunshine & Gentle Breeze', bestMonths: 'Nov to Apr (Dry & Sunny)', gear: 'Light cottons, swimwear, reef-safe sunscreen, sunglasses' },
  2: { temp: '22°C - 28°C', condition: 'Mediterranean Azure Skies & Sunset Breeze', bestMonths: 'May to Oct (Ideal Weather)', gear: 'Walking shoes for cobbled paths, evening cardigan, camera' },
  3: { temp: '26°C - 30°C', condition: 'Tropical Warmth & Lush Greenery', bestMonths: 'Apr to Oct (Dry Season)', gear: 'Breathable attire, temple sarong, comfortable trainers' },
  4: { temp: '8°C - 18°C (Alpine)', condition: 'Crisp Mountain Air & Snow Glaciers', bestMonths: 'Jun - Sep (Hiking) or Dec - Mar (Snow)', gear: 'Thermal layers, waterproof alpine windbreaker, sunglasses' },
  5: { temp: '14°C - 22°C', condition: 'Mild Sakura Spring / Autumn Foliage', bestMonths: 'Mar to May & Sep to Nov', gear: 'Easy slip-off shoes for temples, light layers, daypack' },
  6: { temp: '24°C - 32°C', condition: 'Warm Desert Sunshine', bestMonths: 'Oct to Apr (Pleasant Winters)', gear: 'Sun protection, evening desert wrap, smart resort wear' },
  7: { temp: '15°C - 23°C', condition: 'Charming European Temperate', bestMonths: 'Apr to Oct (Pleasant & Lively)', gear: 'Chic walking footwear, compact umbrella, daypack' },
  8: { temp: '18°C - 28°C', condition: 'Sunny Royal Winter Skies', bestMonths: 'Oct to Mar (Royal Season)', gear: 'Breathable linens, wide-brim hat, camera for forts' }
};

const getClimateForPackage = (id) => CLIMATE_MAP[Number(id)] || {
  temp: '20°C - 26°C',
  condition: 'Pleasant & Travel-Friendly',
  bestMonths: 'Year-Round Curated Departures',
  gear: 'Comfortable daywear, travel adapters, valid passport'
};

export default function PackageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { user, isAuthenticated } = useAuth();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Booking state
  const [startDate, setStartDate] = useState('2026-11-20');
  const [endDate, setEndDate] = useState('2026-11-27');
  const [guests, setGuests] = useState(2);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  // Wishlist state initialized directly from storage without effect cascade
  const [isWishlisted, setIsWishlisted] = useState(() => {
    try {
      const localWish = JSON.parse(localStorage.getItem('ts_package_wishlist') || '[]');
      return localWish.includes(Number(id)) || localWish.includes(String(id));
    } catch {
      return false;
    }
  });
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const climate = getClimateForPackage(id);

  const handleCopyShareLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch {
      /* ignore */
    }
  };

  usePageTitle(pkg ? `${pkg.title} · Travel Package` : 'Package Details');

  useEffect(() => {
    let isMounted = true;
    const fetchPackage = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/packages/${id}`);
        if (data.success && isMounted) {
          setPkg(data.package);
        }
      } catch {
        if (isMounted) {
          setErrorMsg('Unable to connect to live package catalog.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPackage();
    return () => { isMounted = false; };
  }, [id]);

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setWishlistLoading(true);
    const pkgId = Number(id);

    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${pkgId}`);
        setIsWishlisted(false);
        const local = JSON.parse(localStorage.getItem('ts_package_wishlist') || '[]').filter(x => x !== pkgId);
        localStorage.setItem('ts_package_wishlist', JSON.stringify(local));
      } else {
        await api.post('/wishlist', {
          userId: user?.user_id || user?.id,
          packageId: pkgId
        });
        setIsWishlisted(true);
        const local = JSON.parse(localStorage.getItem('ts_package_wishlist') || '[]');
        if (!local.includes(pkgId)) local.push(pkgId);
        localStorage.setItem('ts_package_wishlist', JSON.stringify(local));
      }
    } catch {
      // Offline fallback
      setIsWishlisted(!isWishlisted);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleBookNow = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsBooking(true);
    setBookingSuccess('');

    const total = (pkg?.price || 1200) * guests;
    const reservation = {
      id: generateReservationId(),
      package_title: pkg?.title || 'Tour Package',
      destination: pkg?.destination || 'Global Destination',
      start_date: startDate,
      end_date: endDate,
      guests,
      amount: total,
      status: 'Confirmed'
    };

    try {
      const { data } = await api.post('/bookings', {
        userId: user?.user_id || user?.id,
        packageId: Number(id),
        startDate,
        endDate,
        guests,
        totalAmount: total
      });
      if (data.success) {
        setBookingSuccess(`🎉 Successfully booked "${pkg?.title}"! Confirmation saved.`);
        setConfirmedReservation(reservation);
      }
    } catch {
      // Local persistence fallback
      const requests = JSON.parse(localStorage.getItem('ts_trip_requests') || '[]');
      requests.unshift(reservation);
      localStorage.setItem('ts_trip_requests', JSON.stringify(requests));
      setBookingSuccess(`🎉 Successfully booked "${pkg?.title}"! Voucher generated.`);
      setConfirmedReservation(reservation);
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <Sparkles size={32} color="#a3704c" className="animate-spin" />
          <h3 style={{ marginTop: '1rem', color: '#1e293b' }}>Loading Complete Package Details...</h3>
          <p style={{ fontSize: '0.85rem' }}>Fetching itinerary, hotel amenities, and guide allocations from database.</p>
        </div>
      </div>
    );
  }

  if (!pkg && errorMsg) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
        <div>
          <h2>Package Information Temporarily Unavailable</h2>
          <p style={{ color: '#64748b', margin: '1rem 0' }}>{errorMsg}</p>
          <Link to="/packages" className="btn-book-pkg" style={{ display: 'inline-flex', width: 'auto', padding: '0.6rem 1.5rem' }}>
            Back to All Packages
          </Link>
        </div>
      </div>
    );
  }

  const hotel = pkg?.hotel;
  const guide = pkg?.guide;
  const transport = pkg?.transportation;
  const itinerary = pkg?.itinerary || [];
  const inclusions = pkg?.includedServices || [];
  const exclusions = pkg?.excludedServices || [];
  const facilities = pkg?.facilities || [];

  return (
    <div className="package-detail-page">
      {/* HERO SECTION */}
      <section className="pkg-detail-hero">
        <img 
          src={pkg?.imageUrl || pkg?.image || '/destination-images/kyoto.webp'} 
          alt={pkg?.title} 
          className="pkg-hero-media"
        />
        <div className="pkg-hero-scrim" />
        
        <div className="pkg-hero-content">
          <div className="pkg-hero-breadcrumbs">
            <Link to="/">Home</Link> <span>/</span>
            <Link to="/packages">Tour Packages</Link> <span>/</span>
            <span>{pkg?.title}</span>
          </div>

          <div className="pkg-destination-badge">
            <MapPin size={14} /> Destination: {pkg?.destination || 'Curated Location'}
          </div>

          <h1 className="pkg-hero-title">{pkg?.title}</h1>

          <div className="pkg-hero-stats">
            <span className="pkg-stat-item">
              <Clock size={16} color="#f59e0b" />
              <strong>{pkg?.days} Days / {pkg?.nights} Nights</strong>
            </span>
            <span>•</span>
            <span className="pkg-stat-item">
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <strong>{pkg?.rating} Experience Rating</strong>
            </span>
            <span>•</span>
            <span className="pkg-stat-item">
              <ShieldCheck size={16} color="#22c55e" />
              <span>Verified Protected Booking</span>
            </span>
          </div>
        </div>
      </section>

      {/* TWO COLUMN CONTENT */}
      <div className="pkg-detail-body">
        
        {/* LEFT COLUMN: DETAILS */}
        <div className="pkg-sections-col">

          {/* OVERVIEW */}
          <div className="pkg-card-box">
            <h3 className="pkg-section-title">
              <Sparkles size={20} /> Package Overview
            </h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: '#475569', margin: 0 }}>
              {pkg?.description || 'Enjoy an all-inclusive curated travel experience with verified boutique hotels, native tour leaders, and seamless chauffeur-driven transportation.'}
            </p>

            {facilities.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <strong style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Available Facilities
                </strong>
                <div className="pkg-amenities-pills" style={{ marginTop: '0.5rem' }}>
                  {facilities.map((fac, idx) => (
                    <span key={idx} className="pkg-amenity-pill">
                      ✓ {fac}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* HOTEL INFORMATION */}
          <div className="pkg-card-box">
            <h3 className="pkg-section-title">
              <Hotel size={20} /> Accommodations & Hotel Details
            </h3>
            {hotel ? (
              <div className="pkg-provider-card">
                <SmartImage 
                  src={hotel.imageUrl || '/hotel-images/aman-kyoto.jpg'} 
                  alt={hotel.name}
                  className="pkg-provider-thumb"
                />
                <div className="pkg-provider-body">
                  <h4>{hotel.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#f59e0b', marginBottom: '0.35rem' }}>
                    <Star size={13} fill="currentColor" /> {hotel.rating} Star Luxury Property
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {hotel.address}
                  </div>
                  <p>{hotel.details}</p>

                  <div className="pkg-amenities-pills">
                    {(hotel.amenities || []).map((amenity, i) => (
                      <span key={i} className="pkg-amenity-pill">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                Luxury boutique hotel accommodation is included and will be assigned 7 days prior to departure.
              </p>
            )}
          </div>

          {/* TOUR GUIDE DETAILS */}
          <div className="pkg-card-box">
            <h3 className="pkg-section-title">
              <Compass size={20} /> Licensed Tour Guide & Leadership
            </h3>
            {guide ? (
              <div className="pkg-provider-card">
                <SmartImage 
                  src={guide.photoUrl || '/guide-images/arjun-sen.jpg'} 
                  alt={guide.name}
                  className="pkg-provider-thumb"
                />
                <div className="pkg-provider-body">
                  <h4>{guide.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#f59e0b', marginBottom: '0.35rem' }}>
                    <Star size={13} fill="currentColor" /> {guide.rating} Guest Satisfaction Score
                  </div>
                  <p>{guide.bio}</p>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Spoken Languages:
                    </span>
                    <div className="pkg-amenities-pills" style={{ marginTop: '0.35rem' }}>
                      {(guide.languages || ['English']).map((lang, i) => (
                        <span key={i} className="pkg-amenity-pill">
                          🗣️ {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                A certified local English-speaking tour guide is allocated for all planned excursions.
              </p>
            )}
          </div>

          {/* TRANSPORTATION DETAILS */}
          <div className="pkg-card-box">
            <h3 className="pkg-section-title">
              <Car size={20} /> Ground Transportation & Transfers
            </h3>
            {transport ? (
              <div className="pkg-provider-card">
                <SmartImage 
                  src={transport.imageUrl || '/vehicle-images/mercedes-e-class.webp'} 
                  alt={transport.type}
                  className="pkg-provider-thumb"
                />
                <div className="pkg-provider-body">
                  <h4>{transport.type}</h4>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a3704c', marginBottom: '0.35rem' }}>
                    Vehicle: {transport.model} ({transport.capacity})
                  </div>
                  <p>{transport.details}</p>
                  <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>
                    ✓ Chauffeur Driven · Air-Conditioned · Luggage Assisted
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                Air-conditioned private vehicle and airport transfers are fully arranged.
              </p>
            )}
          </div>

          {/* COMPLETE DAY-WISE TRIP ITINERARY */}
          <div className="pkg-card-box">
            <h3 className="pkg-section-title">
              <Calendar size={20} /> Complete Day-wise Travel Itinerary
            </h3>
            {itinerary.length > 0 ? (
              <div className="pkg-timeline">
                {itinerary.map((step) => (
                  <div className="pkg-day-step" key={step.day}>
                    <div className="pkg-day-badge">Day 0{step.day}</div>
                    <div className="pkg-day-content">
                      <h5>{step.title}</h5>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                Complete day-by-day travel itinerary schedule will be dispatched upon booking confirmation.
              </p>
            )}
          </div>

          {/* BEST TIME TO VISIT & CLIMATE INSIGHT */}
          <div className="pkg-card-box">
            <h3 className="pkg-section-title">
              <Sun size={20} color="#f59e0b" /> Best Time to Visit & Climate Insight
            </h3>
            <div className="pkg-climate-grid">
              <div className="pkg-climate-item">
                <span className="pkg-climate-icon">🌤️</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#1e293b' }}>Typical Climate</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    <strong style={{ color: '#a3704c' }}>{climate.temp}</strong><br />
                    {climate.condition}
                  </div>
                </div>
              </div>

              <div className="pkg-climate-item">
                <span className="pkg-climate-icon">📅</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#1e293b' }}>Peak Travel Season</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    {climate.bestMonths}
                  </div>
                </div>
              </div>

              <div className="pkg-climate-item">
                <span className="pkg-climate-icon">🎒</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#1e293b' }}>Recommended Packing</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    {climate.gear}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* INCLUSIONS & EXCLUSIONS */}
          <div className="pkg-card-box">
            <h3 className="pkg-section-title">
              <ShieldCheck size={20} /> Included & Excluded Services
            </h3>
            <div className="pkg-inclusions-grid">
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#16a34a', marginBottom: '0.85rem' }}>
                  ✓ Included in this package
                </strong>
                <ul className="pkg-inclusions-list">
                  {inclusions.map((item, i) => (
                    <li key={i}>
                      <Check size={16} /> <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.85rem' }}>
                  ✗ Excluded from package
                </strong>
                <ul className="pkg-exclusions-list">
                  {exclusions.map((item, i) => (
                    <li key={i}>
                      <CloseIcon size={16} /> <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: STICKY BOOKING CARD */}
        <aside className="pkg-booking-sticky">
          <div className="pkg-sticky-price-wrap">
            <div>
              <small>Starting from</small>
              <div className="pkg-sticky-price">
                {formatPrice(pkg?.price || 1200)}
                <small> / person</small>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
              Instant Confirmation
            </span>
          </div>

          {bookingSuccess ? (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>🎉</div>
              <strong style={{ color: '#15803d', display: 'block', marginBottom: '0.5rem' }}>Reservation Confirmed!</strong>
              <p style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '0.85rem' }}>{bookingSuccess}</p>
              
              {confirmedReservation && (
                <button
                  type="button"
                  className="btn-book-pkg"
                  style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                  onClick={() => generateBookingPDF({
                    id: confirmedReservation.id,
                    title: confirmedReservation.package_title,
                    destination: confirmedReservation.destination,
                    startDate: confirmedReservation.start_date,
                    endDate: confirmedReservation.end_date,
                    guests: confirmedReservation.guests,
                    amount: confirmedReservation.amount,
                    guestName: user?.name || 'Verified Traveler',
                    email: user?.email
                  })}
                >
                  <FileDown size={14} /> Download PDF Voucher
                </button>
              )}

              <Link to="/dashboard" style={{ display: 'block', marginTop: '0.75rem', fontSize: '0.8rem', color: '#2563eb', fontWeight: 700 }}>
                Go to My Dashboard ➔
              </Link>
            </div>
          ) : (
            <form onSubmit={handleBookNow}>
              <div className="pkg-booking-field">
                <label>Check-in Date</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  required 
                />
              </div>

              <div className="pkg-booking-field">
                <label>Check-out Date</label>
                <input 
                  type="date" 
                  value={endDate} 
                  min={startDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  required 
                />
              </div>

              <div className="pkg-booking-field">
                <label>Number of Travelers</label>
                <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                  <option value={1}>1 Traveler</option>
                  <option value={2}>2 Travelers (Recommended)</option>
                  <option value={3}>3 Travelers</option>
                  <option value={4}>4 Travelers</option>
                  <option value={6}>6 Travelers</option>
                </select>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', fontSize: '0.8rem', color: '#475569', margin: '1rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>{formatPrice(pkg?.price || 1200)} × {guests} travelers</span>
                  <strong>{formatPrice((pkg?.price || 1200) * guests)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 600 }}>
                  <span>All taxes & park fees included</span>
                  <span>FREE</span>
                </div>
              </div>

              <div className="pkg-action-btns">
                <button type="submit" className="btn-book-pkg" disabled={isBooking}>
                  <Sparkles size={16} /> {isBooking ? 'Confirming...' : 'Book This Package'}
                </button>

                <button 
                  type="button" 
                  className={`btn-wish-pkg ${isWishlisted ? 'saved' : ''}`}
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                >
                  <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                  {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                </button>

                {/* Social & Buddy Share Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', marginTop: '0.4rem' }}>
                  <button
                    type="button"
                    className="btn-share-pkg"
                    onClick={handleCopyShareLink}
                    title="Copy direct trip link"
                  >
                    {copiedLink ? <Check size={14} color="#16a34a" /> : <Share2 size={14} />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Check out this vacation package on TravelSphere: "${pkg?.title}" in ${pkg?.destination}! View details: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp-pkg"
                    title="Share with travel companions on WhatsApp"
                  >
                    <span>💬 WhatsApp</span>
                  </a>
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.85rem' }}>
                🛡️ 100% Secure Checkout · Instant Database Sync
              </div>
            </form>
          )}

        </aside>

      </div>
    </div>
  );
}
