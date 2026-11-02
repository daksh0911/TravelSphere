import { useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronDown, Clock3, Heart, MapPin, Search, ShieldCheck, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './TourPackages.css';
import '../../../styles/showcase-skin.css';
import './Compare.css';
import { useSearchParams } from 'react-router-dom';
import SmartImage from '../../../components/common/SmartImage';
import { DESTINATIONS_BY_ID } from '../../../data/destinations';

import usePageTitle from '../../../hooks/usePageTitle';
const PACKAGES = [
  {id:1,title:'Maldives Overwater Escape',location:'Maldives',category:'Beach & islands',days:5,nights:4,price:1045,priceLabel:'$1,045–$2,250',rating:4.9,reviews:1280,image:'/package-images/1-maldives.webp',tag:'Most loved',inclusions:['Private water villa','Dolphin sunset cruise','All meals']},
  {id:2,title:'Santorini Villa & Yacht Week',location:'Santorini, Greece',category:'Honeymoon',days:6,nights:5,price:1242,priceLabel:'$1,242–$2,312',rating:4.8,reviews:940,image:'/package-images/2-santorini.webp',tag:'Limited dates',inclusions:['Cliffside villa','Catamaran day','Wine tasting']},
  {id:3,title:'Bali Wellness & Temple Trails',location:'Bali, Indonesia',category:'Wellness',days:5,nights:4,price:636,priceLabel:'$636–$1,500',rating:4.7,reviews:1520,image:'/package-images/3-bali.webp',tag:'Best value',inclusions:['Private transfers','Daily spa ritual','Temple entries']},
  {id:4,title:'Swiss Alps Scenic Express',location:'Interlaken, Switzerland',category:'Adventure',days:8,nights:7,price:1985,priceLabel:'$1,985–$2,285',rating:5.0,reviews:890,image:'/package-images/4-swiss-alps.webp',tag:'Editors pick',inclusions:['First-class rail','Alpine chalet','Glacier excursion']},
  {id:5,title:'Kyoto Culture & Sakura',location:'Kyoto, Japan',category:'Culture',days:7,nights:6,price:955,priceLabel:'$955–$1,499',rating:4.9,reviews:1450,image:'/package-images/5-kyoto.webp',tag:'New season',inclusions:['Ryokan stay','Tea ceremony','Temple pass']},
  {id:6,title:'Dubai Desert & Skyline',location:'Dubai, UAE',category:'Luxury',days:4,nights:3,price:450,priceLabel:'$450–$690',rating:4.9,reviews:1100,image:'/package-images/6-dubai.webp',tag:'Luxury icon',inclusions:['4-star hotel','Desert safari','City and harbour tours']},
  {id:7,title:'Paris VIP Art & Seine Gastronomy',location:'Paris, France',category:'Luxury',days:5,nights:4,price:1650,priceLabel:'$1,650–$2,800',rating:4.8,reviews:820,image:'/package-images/7-paris.webp',tag:'Culinary pick',inclusions:['5-star Left Bank stay','Louvre VIP pass','Seine dinner cruise']},
  {id:8,title:'Rajasthan Royal Palaces & Desert Safari',location:'Jaipur & Udaipur, Rajasthan, India',category:'Culture',days:6,nights:5,price:1280,priceLabel:'$1,280–$2,100',rating:4.8,reviews:760,image:'/package-images/8-rajasthan.webp',tag:'Heritage trail',inclusions:['Palace heritage stay','Amber Fort private guide','Thar desert camp']},
  {id:10,title:'Bangkok Temple & Riverside Escape',location:'Bangkok, Thailand',category:'Culture',days:4,nights:3,price:490,priceLabel:'$490–$890',rating:4.8,reviews:820,image:'/package-images/9-bangkok.webp',tag:'City discovery',inclusions:['Grand Palace and Wat Pho tour','Chao Phraya river cruise','Riverside hotel stay']},
  {id:11,title:'Amsterdam Historic Canals & Keukenhof',location:'Amsterdam, Netherlands',category:'Culture',days:5,nights:4,price:1550,priceLabel:'$1,550–$2,350',rating:4.7,reviews:640,image:'/package-images/10-amsterdam.webp',tag:'Spring highlight',inclusions:['Canal-side boutique hotel','Van Gogh Museum skip-the-line','Keukenhof tulip entry']},
  {id:12,title:'Rome Antiquity & Trattoria Trails',location:'Rome, Italy',category:'Culture',days:5,nights:4,price:1180,priceLabel:'$1,180–$2,050',rating:4.8,reviews:730,image:'/package-images/11-rome.webp',tag:'New collection',inclusions:['Historic-centre stay','Colosseum guided visit','Neighbourhood food walk']},
  {id:13,title:'Cairo Pyramids & Nile Evenings',location:'Cairo, Egypt',category:'Culture',days:5,nights:4,price:780,priceLabel:'$780–$1,450',rating:4.7,reviews:540,image:'/package-images/12-cairo.webp',tag:'Ancient world',inclusions:['Nile-side hotel','Giza pyramid visit','Old Cairo guide']},
  {id:14,title:'Sydney Harbour & Coastal Walks',location:'Sydney, Australia',category:'Adventure',days:6,nights:5,price:1490,priceLabel:'$1,490–$2,600',rating:4.8,reviews:610,image:'/package-images/13-sydney.webp',tag:'Coastal favourite',inclusions:['Harbour-side stay','Bondi to Coogee walk','Blue Mountains day trip']},
  {id:15,title:'Cape Town Mountain & Winelands',location:'Cape Town, South Africa',category:'Adventure',days:6,nights:5,price:1320,priceLabel:'$1,320–$2,250',rating:4.8,reviews:480,image:'/package-images/14-capetown.webp',tag:'Big horizons',inclusions:['City boutique hotel','Table Mountain visit','Stellenbosch wine route']},
  {id:16,title:'New York Neighbourhoods & Museums',location:'New York, United States',category:'Culture',days:5,nights:4,price:1690,priceLabel:'$1,690–$2,900',rating:4.7,reviews:690,image:'/package-images/15-new-york.webp',tag:'City energy',inclusions:['Manhattan hotel','Museum Mile pass','Brooklyn waterfront walk']},
  {id:17,title:'Banff Lakes & Rocky Mountain Roads',location:'Banff, Canada',category:'Adventure',days:7,nights:6,price:1890,priceLabel:'$1,890–$3,100',rating:4.9,reviews:430,image:'/package-images/16-banff.webp',tag:'Wild escape',inclusions:['Mountain lodge','Lake Louise visit','Scenic parkway drive']},
];

const CATEGORIES = ['All packages','Beach & islands','Honeymoon','Wellness','Adventure','Culture','Luxury'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
};

export default function TourPackagesPage() {
  usePageTitle('Tour Packages');
  const [searchParams] = useSearchParams();
  const destinationParam = searchParams.get('destination');
  const [query, setQuery] = useState(() => DESTINATIONS_BY_ID[destinationParam]?.name || localStorage.getItem('ts_destination_interest') || '');
  const [category, setCategory] = useState('All packages');
  const [sort, setSort] = useState('recommended');
  const [compare, setCompare] = useState([]);
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('ts_package_wishlist') || '[]'));
  const [booking, setBooking] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [toast, setToast] = useState('');
  
  const results = useMemo(() => {
    const filtered = PACKAGES.filter(pkg => (category === 'All packages' || pkg.category === category) && `${pkg.title} ${pkg.location}`.toLowerCase().includes(query.toLowerCase()));
    return [...filtered].sort((a, b) => sort === 'price' ? a.price - b.price : sort === 'rating' ? b.rating - a.rating : 0);
  }, [query, category, sort]);
  
  const toggleWish = id => {
    const next = wishlist.includes(id) ? wishlist.filter(item => item !== id) : [...wishlist, id];
    setWishlist(next);
    localStorage.setItem('ts_package_wishlist', JSON.stringify(next));
  };
  
  const toggleCompare = id => setCompare(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 3 ? [...current, id] : current);
  
  const submitBooking = e => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const reservation = { id: `TS-${Date.now()}`, packageId: booking.id, packageTitle: booking.title, date: form.get('date'), guests: form.get('guests'), status: 'Requested' };
    const current = JSON.parse(localStorage.getItem('ts_trip_requests') || '[]');
    localStorage.setItem('ts_trip_requests', JSON.stringify([reservation, ...current]));
    setBooking(null);
    setToast('Your trip request is confirmed. A travel specialist will contact you shortly.');
    setTimeout(() => setToast(''), 5000);
  };
  
  return (
    <div className="package-marketplace">
      <section className="package-heading">
        <div>
          <span className="market-eyebrow">TRAVELSPHERE COLLECTION / 2026</span>
          <h1>Trips worth<br/><em>remembering.</em></h1>
          <p>Thoughtful itineraries, trusted local experts, and the little details already taken care of. Prices are general estimates and vary by dates, room type, and inclusions.</p>
        </div>
        <div className="package-trust">
          <ShieldCheck size={20}/>
          <span><strong>Protected booking</strong><small>Flexible support before you go</small></span>
        </div>
      </section>
      
      <section className="package-toolbar">
        <div className="package-search">
          <Search size={18}/>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Where do you want to go?"/>
        </div>
        <div className="category-scroll">
          {CATEGORIES.map(item => (
            <button className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>
        <div className="package-sort">
          <span>{results.length} curated trips</span>
          <label>Sort by 
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="price">Price: low to high</option>
              <option value="rating">Highest rated</option>
            </select>
            <ChevronDown size={15}/>
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
          >
            <Check size={18}/>{toast}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.section className="package-grid" variants={containerVariants} initial="hidden" animate="show">
        {results.map(pkg => (
          <motion.article className="package-product-card" key={pkg.id} variants={itemVariants}>
            <div className="package-image-wrap">
              <SmartImage src={pkg.image} alt={pkg.title} sizes="(max-width: 620px) 92vw, (max-width: 900px) 48vw, 31vw" />
              <span className="package-tag">{pkg.tag}</span>
              <button className={`package-wish ${wishlist.includes(pkg.id) ? 'saved' : ''}`} onClick={() => toggleWish(pkg.id)}>
                <Heart size={18} fill={wishlist.includes(pkg.id) ? 'currentColor' : 'none'}/>
              </button>
            </div>
            <div className="package-card-body">
              <div className="package-location"><MapPin size={14}/>{pkg.location}<span>·</span><Clock3 size={14}/>{pkg.days} days</div>
              <h2>{pkg.title}</h2>
              <div className="package-rating"><Star size={14} fill="currentColor"/><strong>{pkg.rating}</strong><span>({pkg.reviews.toLocaleString()} reviews)</span></div>
              <ul>
                {pkg.inclusions.map(item => <li key={item}><Check size={14}/>{item}</li>)}
              </ul>
              <div className="package-card-footer">
                <div><small>Typical estimate</small><strong>{pkg.priceLabel}</strong><small>USD / person</small></div>
                <button className="package-book" onClick={() => setBooking(pkg)}>View trip <ArrowRight size={16}/></button>
              </div>
              <label className="compare-check">
                <input type="checkbox" checked={compare.includes(pkg.id)} onChange={() => toggleCompare(pkg.id)}/> Compare
              </label>
            </div>
          </motion.article>
        ))}
      </motion.section>
      
      {results.length === 0 && (
        <div className="package-empty">
          <Search size={30}/>
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
            <button className="package-book" onClick={() => setCompareOpen(true)}>Compare now <ArrowRight size={16}/></button>
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
              <button className="modal-close" onClick={() => setCompareOpen(false)}><X size={18}/></button>
              <span className="market-eyebrow">TRAVELSPHERE COMPARISON</span>
              <h2>Choose the route<br/><em>that feels right.</em></h2>
              <div className="compare-table">
                {compare.map(id => PACKAGES.find(item => item.id === id)).filter(Boolean).map(pkg => (
                  <article key={pkg.id}>
                    <SmartImage src={pkg.image} alt={pkg.title} sizes="(max-width: 620px) 85vw, 240px"/>
                    <strong>{pkg.title}</strong>
                    <span>{pkg.location}</span>
                    <b>{pkg.priceLabel} <small>/ person estimate</small></b>
                    <div><Check size={14}/> {pkg.days} days</div>
                    <div><Star size={14}/> {pkg.rating} guest rating</div>
                    <button onClick={() => { setBooking(pkg); setCompareOpen(false); }}>View this trip <ArrowRight size={15}/></button>
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
              <button type="button" className="modal-close" onClick={() => setBooking(null)}><X size={18}/></button>
              <span className="market-eyebrow">REQUEST YOUR JOURNEY</span>
              <h2>{booking.title}</h2>
              <p><MapPin size={14}/> {booking.location} · {booking.days} days / {booking.nights} nights</p>
              <label>Preferred departure date
                <input type="date" name="date" required defaultValue="2026-10-15"/>
              </label>
              <label>Travellers
                <select name="guests" defaultValue="2">
                  <option value="1">1 traveller</option>
                  <option value="2">2 travellers</option>
                  <option value="3">3 travellers</option>
                  <option value="4">4 travellers</option>
                </select>
              </label>
              <div className="booking-total">
                <span>Typical estimate</span>
                <strong>{booking.priceLabel} <small>/ person</small></strong>
              </div>
              <button className="primary-book" type="submit">Request this trip <ArrowRight size={17}/></button>
              <small className="booking-note"><ShieldCheck size={14}/> No payment today. Your specialist confirms availability first.</small>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
