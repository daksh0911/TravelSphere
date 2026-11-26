import { ArrowRight, CalendarDays, Check, MapPin, Sparkles, Tag, Star, Hotel, Compass } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SmartImage from '../../../components/common/SmartImage';
import { DESTINATIONS, DESTINATIONS_BY_ID } from '../../../data/destinations';
import { PACKAGE_CATALOG } from '../../../data/packageCatalog';
import { useCurrency } from '../../../context/useCurrency';
import usePageTitle from '../../../hooks/usePageTitle';
import './DestinationDetail.css';

const DESTINATION_HOTELS = {
  kyoto: {
    name: 'Aman Kyoto Luxury Ryokan & Onsen',
    type: '5-Star Luxury Resort & Onsen',
    rating: 4.8,
    price: 2800,
    priceLabel: '$2,800 / night',
    image: '/hotel-images/aman-kyoto.webp',
    amenities: ['Natural Thermal Onsens', 'Kaiseki Dining', 'Botanical Forest Gardens', '24/7 Concierge']
  },
  santorini: {
    name: 'Canaves Oia Suites - Small Luxury Hotels',
    type: '5-Star Cliffside Caldera Suites',
    rating: 4.8,
    price: 750,
    priceLabel: '$750 / night',
    image: '/hotel-images/canaves-oia.webp',
    amenities: ['Infinity Caldera Pool', 'Cycladic Architecture', 'Sunset Wine Tasting', 'Private Terrace']
  },
  'swiss-alps': {
    name: 'Victoria Jungfrau Grand Hotel and Spa',
    type: '5-Star Alpine Palace Hotel & Spa',
    rating: 4.6,
    price: 1470,
    priceLabel: '$1,470 / night',
    image: '/hotel-images/victoria-jungfrau.webp',
    amenities: ['5,500 m² Luxury Spa', 'Alpine Mountain Panorama', 'Fine Dining', 'Glacier Excursion Concierge']
  },
  maldives: {
    name: 'Patina Maldives, Fari Islands',
    type: '5-Star Private Overwater Resort',
    rating: 4.9,
    price: 950,
    priceLabel: '$950 / night',
    image: '/hotel-images/maldives-stay.webp',
    amenities: ['Private Overwater Lagoon Villas', 'Sunset Catamaran Cruises', 'Ayurvedic Ocean Spa', 'Coral Conservation']
  },
  dubai: {
    name: 'Al Maha Desert Resort & Spa',
    type: '5-Star Luxury Desert Oasis',
    rating: 4.9,
    price: 1200,
    priceLabel: '$1,200 / night',
    image: '/hotel-images/al-maha.webp',
    amenities: ['Private Heated Pools', 'Bedouin Architecture', 'Desert Falconry & Camel Treks', 'Timeless Spa']
  },
  paris: {
    name: 'Hotel Lutetia Paris',
    type: '5-Star Palace Hotel Saint-Germain',
    rating: 4.7,
    price: 1650,
    priceLabel: '$1,650 / night',
    image: '/hotel-images/lutetia-paris.webp',
    amenities: ['Akasha Holistic Spa', 'Brasserie Lutetia', 'Eiffel Tower Views', 'Historic Palace Architecture']
  }
};

export default function DestinationDetailPage() {
  const { id } = useParams();
  const { formatPrice } = useCurrency();
  const numericMap = { '1': 'maldives', '2': 'kyoto', '3': 'santorini', '4': 'swiss-alps', '5': 'dubai', '6': 'paris', '7': 'bali', '8': 'rajasthan', '9': 'rome', '10': 'cairo' };
  const targetId = numericMap[id] || id;
  const destination = DESTINATIONS_BY_ID[targetId] || DESTINATIONS.find(d => String(d.id).toLowerCase() === String(targetId).toLowerCase() || String(d.name).toLowerCase() === String(targetId).toLowerCase());
  usePageTitle(destination ? destination.name : 'Destination not found');

  if (!destination) {
    return (
      <div className="destination-detail-empty">
        <h1>That somewhere is still being mapped.</h1>
        <Link to="/destinations" className="detail-cta">Back to destinations <ArrowRight size={17} /></Link>
      </div>
    );
  }

  // Find matching package in PACKAGE_CATALOG
  const allPackages = Object.values(PACKAGE_CATALOG);
  const matchedPackage = allPackages.find(p => 
    p.location.toLowerCase().includes(destination.id.replace('-', ' ')) ||
    p.destination.toLowerCase().includes(destination.name.toLowerCase()) ||
    destination.name.toLowerCase().includes(p.location.toLowerCase())
  ) || allPackages[0];

  const matchedHotel = DESTINATION_HOTELS[destination.id] || {
    name: `${destination.name} Grand Heritage Hotel & Resort`,
    type: '5-Star Curated Luxury Hotel',
    rating: 4.8,
    price: matchedPackage ? Math.round(matchedPackage.price * 0.4) : 450,
    priceLabel: `$${matchedPackage ? Math.round(matchedPackage.price * 0.4) : 450} / night`,
    image: destination.image,
    amenities: ['Luxury Suites', 'Fine Dining Venues', 'Guided Sightseeing', 'High-Speed Wi-Fi']
  };

  const startingPrice = matchedPackage?.price || 1045;

  return (
    <div className="destination-detail">
      <section className="detail-hero">
        <motion.div layoutId={`destination-image-${destination.id}`} className="detail-hero-image">
          <SmartImage src={destination.image} alt={destination.name} priority sizes="100vw" />
        </motion.div>
        <div className="detail-hero-overlay" />
        <div className="detail-hero-copy">
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <span className="detail-eyebrow"><Sparkles size={14} /> {destination.country}</span>
            <span className="detail-price-badge">
              <Tag size={13} /> Average Trip: from <strong>{formatPrice(startingPrice)}</strong> / traveler
            </span>
          </div>
          <h1>{destination.name}</h1>
          <p>{destination.tagline}</p>
        </div>
      </section>

      <section className="detail-content">
        <div className="detail-intro">
          <span className="detail-eyebrow dark">A considered way to arrive</span>
          <h2>Make room for the <em>good parts.</em></h2>
          <p>{destination.description}</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
            <Link to={`/packages/${matchedPackage.id}`} className="detail-cta" style={{ background: 'var(--color-primary)', color: '#fff' }}>
              Book {destination.name} Package ({formatPrice(startingPrice)}) <ArrowRight size={17} />
            </Link>
            <Link to="/hotels" className="detail-cta">
              Reserve Luxury Hotel <ArrowRight size={17} />
            </Link>
          </div>
        </div>
        <aside className="detail-facts">
          <div><CalendarDays size={17} /><span>Best season<strong>{destination.season}</strong></span></div>
          <div><Tag size={17} /><span>Starting budget<strong>{formatPrice(startingPrice)} per person</strong></span></div>
          <div><MapPin size={17} /><span>Trip style<strong>{destination.budget} spend</strong></span></div>
          <div><Sparkles size={17} /><span>Curated packages<strong>{destination.packages} available journeys</strong></span></div>
        </aside>
      </section>

      {/* FEATURED PACKAGES FOR THIS DESTINATION */}
      <section className="detail-showcase-section">
        <div className="showcase-header">
          <div>
            <span className="detail-eyebrow dark"><Compass size={14} /> Official Curated Packages</span>
            <h2>Signature <em>{destination.name}</em> Journeys</h2>
            <p>Handcrafted itineraries inclusive of 5-star lodging, certified private tour guides, and express transport.</p>
          </div>
          <Link to={`/packages?destination=${destination.id}`} className="detail-cta">
            View All Packages <ArrowRight size={16} />
          </Link>
        </div>

        <div className="dest-cards-grid">
          <div className="dest-feature-card">
            <div className="dest-card-img-wrap">
              <SmartImage src={matchedPackage.imageUrl || destination.image} alt={matchedPackage.title} />
              <span className="dest-price-tag">{formatPrice(matchedPackage.price)}</span>
            </div>
            <div className="dest-card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span className="dest-category-pill">{matchedPackage.category}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Star size={14} fill="#f59e0b" /> {matchedPackage.rating}
                </span>
              </div>
              <h3>{matchedPackage.title}</h3>
              <p className="dest-loc-line"><MapPin size={14} /> {matchedPackage.location} • {matchedPackage.days} Days / {matchedPackage.nights} Nights</p>
              <p className="dest-desc-text">{matchedPackage.description}</p>
              <div className="dest-card-footer">
                <Link to={`/packages/${matchedPackage.id}`} className="dest-book-btn">
                  Book This Package ({formatPrice(matchedPackage.price)}) ➔
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED HOTELS IN THIS DESTINATION */}
      <section className="detail-showcase-section" style={{ paddingTop: '10px' }}>
        <div className="showcase-header">
          <div>
            <span className="detail-eyebrow dark"><Hotel size={14} /> Verified Stays</span>
            <h2>Recommended Stays in <em>{destination.name}</em></h2>
            <p>Sanctuary suites, boutique ryokans, and cliffside caldera villas vetted for authentic hospitality.</p>
          </div>
          <Link to="/hotels" className="detail-cta">
            Browse All Hotels <ArrowRight size={16} />
          </Link>
        </div>

        <div className="dest-cards-grid">
          <div className="dest-feature-card">
            <div className="dest-card-img-wrap">
              <SmartImage src={matchedHotel.image} alt={matchedHotel.name} />
              <span className="dest-price-tag">{formatPrice(matchedHotel.price)} / night</span>
            </div>
            <div className="dest-card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span className="dest-category-pill">{matchedHotel.type}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Star size={14} fill="#f59e0b" /> {matchedHotel.rating} Excellence
                </span>
              </div>
              <h3>{matchedHotel.name}</h3>
              <p className="dest-loc-line"><MapPin size={14} /> {destination.name}, {destination.country}</p>
              
              <div className="hotel-amenity-pills">
                {matchedHotel.amenities.map((am, i) => (
                  <span key={i} className="amenity-chip"><Check size={12} /> {am}</span>
                ))}
              </div>

              <div className="dest-card-footer">
                <Link to="/hotels" className="dest-book-btn" style={{ background: '#0f172a' }}>
                  View Rooms & Book Hotel ➔
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="detail-highlights">
        <div><span className="detail-eyebrow dark">Worth making time for</span><h2>Three reasons to <em>go.</em></h2></div>
        <div className="highlight-grid">{destination.highlights.map((highlight) => <article key={highlight}><Check size={18} /><h3>{highlight}</h3><p>Thoughtfully planned with a trusted local partner.</p></article>)}</div>
      </section>

      <section className="detail-related">
        <div><span className="detail-eyebrow dark">Your next chapter</span><h2>Start with the <em>right route.</em></h2><p>Tell us how you want to feel and we’ll shape the details around it.</p></div>
        <Link to={`/packages/${matchedPackage.id}`} className="detail-cta">Book {destination.name} Package ({formatPrice(startingPrice)}) <ArrowRight size={17} /></Link>
      </section>
    </div>
  );
}
