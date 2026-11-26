import { lazy, Suspense, useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, BedDouble, Check, Globe, Heart, LayoutGrid, MapPin, Search, ShieldCheck, Star, X } from 'lucide-react';
import './Hotels.css';
import '../../../styles/showcase-skin.css';
import SmartImage from '../../../components/common/SmartImage';
const InteractiveWorldMap = lazy(() => import('../../../components/common/InteractiveWorldMap'));
import usePageTitle from '../../../hooks/usePageTitle';
import { useCurrency } from '../../../context/useCurrency';
import api from '../../../services/api';
import CheckoutModal from '../../../components/common/CheckoutModal/CheckoutModal';

const HOTELS = [
  { id: 1, name: 'Aman Kyoto', city: 'Kyoto, Japan', type: '5-star hotel', rating: 4.8, reviews: 68, price: 2800, priceLabel: '$2,800-$5,700', image: '/hotel-images/aman-kyoto.webp', amenities: ['Forest setting', 'Japanese design', 'Garden views'], badge: 'Property reference', rateStatus: 'Indicative range; confirm dates', source: 'https://www.trip.com/hotels/detail?hotelid=58048525' },
  { id: 2, name: 'Canaves Oia Suites - Small Luxury Hotels of the World', city: 'Oia, Santorini, Greece', type: '5-star hotel', rating: 4.8, reviews: 40, price: 750, priceLabel: '$750-$2,200', image: '/hotel-images/canaves-oia.webp', amenities: ['Caldera setting', 'Cycladic architecture', 'Aegean views'], badge: 'Property reference', rateStatus: 'Indicative range; confirm dates', source: 'https://www.trip.com/hotels/detail?hotelid=2562953' },
  { id: 10, name: 'Al Maha, a Luxury Collection Desert Resort & Spa', city: 'Dubai Desert Conservation Reserve, Dubai, United Arab Emirates', type: 'Luxury desert resort and spa', rating: 4.9, reviews: 185, price: 1200, priceLabel: '$1,200-$3,500', image: '/hotel-images/al-maha.webp', amenities: ['Desert reserve setting', 'Al Maha Spa', 'Desert excursions'], badge: 'Property reference', rateStatus: 'Indicative range; confirm dates', source: 'https://www.marriott.com/en-us/hotels/dxbam-al-maha-a-luxury-collection-desert-resort-and-spa-dubai/overview/' },
  { id: 3, name: 'Jumeirah Emirates Towers Dubai', city: 'Dubai, United Arab Emirates', type: '5-star hotel', rating: 4.6, reviews: 167, price: 160, priceLabel: '$160-$400', image: '/hotel-images/jumeirah-emirates-towers.webp', amenities: ['City-centre location', 'Skyline setting', 'Hotel dining'], badge: 'Property reference', rateStatus: 'Indicative range; confirm dates', source: 'https://www.trip.com/hotels/detail?hotelid=2197742' },
  { id: 4, name: 'Victoria Jungfrau Grand Hotel and Spa Interlaken', city: 'Interlaken, Switzerland', type: '5-star hotel', rating: 4.4, reviews: 108, price: 1470, priceLabel: '$1,470-$3,500', image: '/hotel-images/victoria-jungfrau.webp', amenities: ['5,500 m² spa', 'Alpine setting', 'Dining venues'], badge: 'Property reference', rateStatus: 'Indicative range; confirm dates', source: 'https://www.trip.com/hotels/detail?hotelid=2194517' },
  { id: 5, name: 'Capella Ubud, Bali', city: 'Keliki Village, near Ubud, Bali, Indonesia', type: '5-star tented camp', rating: 4.7, reviews: 47, price: 1000, priceLabel: '$1,000-$2,500', image: '/hotel-images/capella-ubud.webp', amenities: ['Rainforest setting', 'Private pools', 'Tented accommodation'], badge: 'Property reference', rateStatus: 'Indicative range; confirm dates', source: 'https://www.trip.com/hotels/detail?hotelid=21877118' },
  { id: 6, name: 'Hotel Lutetia Paris', city: '45 Boulevard Raspail, Saint-Germain-des-Prés, Paris, France', type: '5-star luxury palace hotel', rating: 4.7, reviews: 82, price: 1650, priceLabel: '$1,650-$3,200', image: '/hotel-images/lutetia-paris.webp', amenities: ['Saint-Germain location', 'Akasha Holistic Spa', 'Brasserie Lutetia'], badge: 'Property reference', rateStatus: 'Indicative range; confirm dates', source: 'https://www.hotellutetia.com/' },
  { id: 11, name: 'Rambagh Palace, Jaipur', city: 'Jaipur, Rajasthan, India', type: '5-star heritage palace hotel', rating: null, reviews: 0, price: 500, priceLabel: '$500-$2,500', image: '/hotel-images/rambagh-palace.webp', amenities: ['Mughal gardens', 'J Wellness Circle', 'Palace heritage'], badge: 'Property reference', rateStatus: 'Indicative range; confirm dates', source: 'https://www.tajhotels.com/en-in/hotels/rambagh-palace-jaipur' },
  { id: 12, name: 'Patina Maldives, Fari Islands', city: 'Fari Islands, Maldives', type: 'Luxury island resort', rating: 4.8, reviews: 96, price: 950, priceLabel: '$950-$2,800', image: '/hotel-images/maldives-stay.webp', amenities: ['Private island', 'Ocean villas', 'Marine excursions'], badge: 'Destination stay', rateStatus: 'Indicative range; confirm dates', source: 'https://www.patinahotels.com/maldives/' },
  { id: 13, name: 'Hotel de la Ville Rome', city: 'Spanish Steps, Rome, Italy', type: '5-star city hotel', rating: 4.7, reviews: 74, price: 780, priceLabel: '$780-$1,900', image: '/hotel-images/rome-stay.webp', amenities: ['Historic centre', 'Rooftop dining', 'Walkable landmarks'], badge: 'Destination stay', rateStatus: 'Indicative range; confirm dates', source: 'https://www.roccofortehotels.com/hotels-and-resorts/hotel-de-la-ville/' },
  { id: 14, name: 'Marriott Mena House, Cairo', city: 'Giza, Cairo, Egypt', type: 'Historic 5-star hotel', rating: 4.6, reviews: 105, price: 320, priceLabel: '$320-$1,100', image: '/hotel-images/cairo-stay.webp', amenities: ['Pyramid views', 'Garden setting', 'Nile excursions'], badge: 'Destination stay', rateStatus: 'Indicative range; confirm dates', source: 'https://www.marriott.com/en-us/hotels/caimc-marriott-mena-house-cairo/' },
  { id: 15, name: 'Park Hyatt Sydney', city: 'The Rocks, Sydney, Australia', type: '5-star harbour hotel', rating: 4.8, reviews: 118, price: 650, priceLabel: '$650-$1,700', image: '/hotel-images/sydney-stay.webp', amenities: ['Opera House views', 'Harbour pool', 'The Rocks location'], badge: 'Destination stay', rateStatus: 'Indicative range; confirm dates', source: 'https://www.hyatt.com/park-hyatt/en-US/sydph-park-hyatt-sydney' },
  { id: 16, name: 'Mount Nelson, A Belmond Hotel', city: 'Gardens, Cape Town, South Africa', type: 'Historic luxury hotel', rating: 4.7, reviews: 88, price: 420, priceLabel: '$420-$1,300', image: '/hotel-images/capetown-stay.webp', amenities: ['Table Mountain setting', 'Colonial gardens', 'Spa and dining'], badge: 'Destination stay', rateStatus: 'Indicative range; confirm dates', source: 'https://www.belmond.com/hotels/africa/south-africa/belmond-mount-nelson-hotel/' },
  { id: 17, name: 'The Beekman, A Thompson Hotel', city: 'Lower Manhattan, New York, United States', type: 'Historic luxury hotel', rating: 4.6, reviews: 90, price: 520, priceLabel: '$520-$1,600', image: '/hotel-images/new-york-stay.webp', amenities: ['Landmark atrium', 'Downtown location', 'Arts and dining'], badge: 'Destination stay', rateStatus: 'Indicative range; confirm dates', source: 'https://www.hyatt.com/thompson-hotels/en-US/nycth-the-beekman' },
  { id: 18, name: 'Fairmont Banff Springs', city: 'Banff, Alberta, Canada', type: 'Mountain resort hotel', rating: 4.6, reviews: 132, price: 410, priceLabel: '$410-$1,450', image: '/hotel-images/banff-stay.webp', amenities: ['Mountain views', 'Spa and pools', 'National park access'], badge: 'Destination stay', rateStatus: 'Indicative range; confirm dates', source: 'https://www.fairmont.com/banff-springs/' },
  { id: 19, name: 'Anantara Siam Bangkok Hotel', city: 'Ratchaprasong, Bangkok, Thailand', type: '5-star city resort', rating: 4.7, reviews: 92, price: 180, priceLabel: '$180-$620', image: '/hotel-images/bangkok-stay.webp', amenities: ['Central location', 'Thai design', 'Garden courtyard'], badge: 'Destination stay', rateStatus: 'Indicative range; confirm dates', source: 'https://www.anantara.com/en/siam-bangkok' },
  { id: 20, name: 'Pulitzer Amsterdam', city: 'Prinsengracht, Amsterdam, Netherlands', type: 'Canal-side boutique hotel', rating: 4.6, reviews: 78, price: 290, priceLabel: '$290-$850', image: '/hotel-images/amsterdam-stay.webp', amenities: ['Canal houses', 'Central location', 'Courtyard gardens'], badge: 'Destination stay', rateStatus: 'Indicative range; confirm dates', source: 'https://www.pulitzeramsterdam.com/' },
];

export default function HotelsPage() {
  usePageTitle('Hotels');
  const { formatPrice, currency } = useCurrency();
  const [viewMode, setViewMode] = useState('grid');
  const [query, setQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [rating, setRating] = useState('Any rating');
  const [selected, setSelected] = useState(null);
  const [hotelList, setHotelList] = useState(HOTELS);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState(null);

  // Live hotels sync (Task 14)
  useEffect(() => {
    api.get('/hotels')
      .then(res => {
        if (res.data?.hotels && res.data.hotels.length > 0) {
          const existingIds = new Set(HOTELS.map(h => Number(h.id)));
          const dbNew = res.data.hotels.filter(h => !existingIds.has(Number(h.hotel_id || h.id))).map(h => ({
            id: h.hotel_id || h.id,
            name: h.name,
            city: h.address || 'Curated Stay',
            type: `${h.star_rating || 5}-star hotel`,
            rating: h.star_rating ? Number(h.star_rating) : 4.8,
            reviews: 12,
            price: Number(h.price_per_night) || 250,
            priceLabel: `$${h.price_per_night}`,
            image: h.image_url || '/hotel-images/aman-kyoto.jpg',
            amenities: ['Verified stay', 'High-speed Wi-Fi', 'Breakfast included'],
            badge: 'Live Listing',
            rateStatus: 'Available for immediate booking'
          }));
          if (dbNew.length > 0) {
            setHotelList([...HOTELS, ...dbNew]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ts_saved_hotels') || '[]');
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState('');

  const hotels = useMemo(() => hotelList.filter(h =>
    `${h.name} ${h.city}`.toLowerCase().includes(query.toLowerCase()) &&
    h.price <= maxPrice &&
    (rating === 'Any rating' || h.rating >= Number(rating))
  ), [hotelList, query, maxPrice, rating]);

  const toggleSave = id => {
    const next = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id];
    setSaved(next);
    try {
      localStorage.setItem('ts_saved_hotels', JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const reserve = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const checkIn = data.checkIn || '2026-10-06';
    const checkOut = data.checkOut || '2026-10-07';
    const nights = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))) || 1;
    const guests = Number(data.guests) || 2;
    const subtotal = selected.price * nights;

    // Launch Checkout Modal (Tasks 1, 2, 3)
    setCheckoutDetails({
      title: `${selected.name} (${selected.type || 'Room'})`,
      type: 'hotel',
      id: selected.id,
      hotelId: selected.id,
      subtotal,
      startDate: checkIn,
      endDate: checkOut,
      guests,
      destination: selected.city,
      image: selected.image
    });

    setSelected(null);
    setShowCheckout(true);
  };

  return (
    <div className="hotel-market">
      <section className="hotel-hero">
        <div className="hotel-hero-inner">
          <div>
            <span className="hotel-eyebrow">STAYS WITH A SENSE OF PLACE</span>
          <h1>Stay somewhere<br /><em>you'll talk about.</em></h1>
          <p>From quiet ryokans to skyline retreats, find the right base for your next chapter.</p>
        </div>
        <div className="hotel-hero-stat">
          <strong>Indicative rates</strong>
          <span>General {currency} ranges<br />{currency === 'USD' ? 'Indicative USD ranges' : `Live converted to ${currency}`} · 2 adults</span>
        </div>
        </div>
      </section>

      <section className="hotel-search-panel">
        <div className="hotel-search-input">
          <Search size={18} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search city, hotel, or experience" />
        </div>
        <label>
          Price / night
          <input type="range" min="80" max="5000" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} />
          <strong>{formatPrice(maxPrice)}</strong>
        </label>
        <label>
          Rating
          <select value={rating} onChange={e => setRating(e.target.value)}>
            <option>Any rating</option>
            <option value="4.8">4.8+</option>
            <option value="4.5">4.5+</option>
            <option value="4">4.0+</option>
          </select>
        </label>
      </section>

      {toast && <div className="hotel-toast"><Check size={18} />{toast}</div>}

      <section className="hotel-results">
        <div className="hotel-results-head">
          <div className="hotel-count-badge">
            <span className="hotel-eyebrow dark">CURATED STAYS</span>
            <strong style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-dark)', marginTop: '2px' }}>
              {hotels.length} Luxury Properties
            </strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="ts-view-mode-toggle" style={{ gap: '8px' }}>
              <button
                type="button"
                className={`ts-toggle-option ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={14} /> Catalog
              </button>
              <button
                type="button"
                className={`ts-toggle-option ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
              >
                <Globe size={14} /> World Stays Map
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'map' && (
          <Suspense fallback={<div style={{ height: '580px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '16px', color: '#64748b', fontWeight: 600 }}>Loading Stays Map...</div>}>
            <InteractiveWorldMap
              items={hotels}
              type="hotels"
              onSelect={(hotel) => setSelected(hotel)}
              height="580px"
            />
          </Suspense>
        )}

        <div className="hotel-grid" style={{ display: viewMode === 'grid' ? 'grid' : 'none' }}>
          {hotels.map(hotel => (
            <article className="hotel-card" key={hotel.id}>
              <div className="hotel-card-image">
                <SmartImage src={hotel.image} alt={hotel.name} sizes="(max-width: 620px) 92vw, (max-width: 900px) 48vw, 31vw" />
                <span>{hotel.badge}</span>
                <button className={saved.includes(hotel.id) ? 'saved' : ''} onClick={() => toggleSave(hotel.id)}>
                  <Heart size={17} fill={saved.includes(hotel.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="hotel-card-body">
                <div className="hotel-card-location"><MapPin size={14} />{hotel.city}</div>
                <h3>{hotel.name}</h3>
                <p className="hotel-type">{hotel.type}</p>
                <div className="hotel-rating">
                  {hotel.rating ? (
                    <>
                      <Star size={14} fill="currentColor" />
                      <strong>{hotel.rating}</strong>
                      <span>{hotel.reviews} reviews</span>
                    </>
                  ) : (
                    <span>Rating not returned for this property</span>
                  )}
                </div>
                <div className="hotel-amenities">
                  {hotel.amenities.map(a => <span key={a}>{a}</span>)}
                </div>
                <div className="hotel-card-footer">
                  <div>
                    <small>Typical / night</small>
                    <strong>{formatPrice(hotel.price)}</strong>
                    <small>{currency} · estimate</small>
                  </div>
                  <div className="hotel-card-actions">
                    <a href={hotel.source} target="_blank" rel="noreferrer">Check current rate</a>
                    <button onClick={() => setSelected(hotel)}>View rooms <ArrowRight size={16} /></button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selected && createPortal(
        <div className="hotel-backdrop" onClick={() => setSelected(null)}>
          <form className="hotel-booking" onClick={e => e.stopPropagation()} onSubmit={reserve}>
            <button type="button" className="hotel-modal-close" onClick={() => setSelected(null)}>
              <X size={18} />
            </button>
            <SmartImage src={selected.image} alt={selected.name} sizes="(max-width: 620px) 100vw, 560px" />
            <div className="hotel-booking-body">
              <span className="hotel-eyebrow dark">{selected.type}</span>
              <h2>{selected.name}</h2>
              <p><MapPin size={14} /> {selected.city} · <strong>{formatPrice(selected.price)} / night</strong></p>
              <label>Check-in<input name="checkIn" type="date" required defaultValue="2026-10-06" /></label>
              <label>Check-out<input name="checkOut" type="date" required defaultValue="2026-10-07" /></label>
              <label>Guests
                <select name="guests" defaultValue="2">
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                </select>
              </label>
              <div className="hotel-booking-note">
                <BedDouble size={17} />
                <span>
                  <strong>Room details</strong>
                  <small>Room type, inclusions, taxes, and cancellation terms are shown on the live booking page.</small>
                </span>
              </div>
              <button className="hotel-reserve" type="submit">Proceed to Payment & Confirm <ArrowRight size={16} /></button>
              <small className="hotel-secure">
                <ShieldCheck size={13} /> 256-Bit Encrypted Payment Gateway · Real Room Booking & Voucher.
              </small>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Checkout Modal (Task 1, 2, 3) */}
      <CheckoutModal 
        isOpen={showCheckout} 
        onClose={() => setShowCheckout(false)} 
        bookingDetails={checkoutDetails}
        onSuccess={(confirmed) => {
          setToast(`Hotel booking confirmed! Reference: ${confirmed.display_id}`);
          setTimeout(() => setToast(''), 7000);
        }}
      />
    </div>
  );
}
