import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronDown, Gauge, MapPin, Search, ShieldCheck, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Vehicles.css';
import SmartImage from '../../../components/common/SmartImage';
import RoundCarousel from '../../../components/common/RoundCarousel';
import usePageTitle from '../../../hooks/usePageTitle';

const VEHICLES = [
  // ── Cars & Sedans ──────────────────────────────────────────────────────────
  {
    id: 1,
    name: 'Mercedes-Benz E-Class',
    category: 'Cars & Sedans',
    type: 'Executive Sedan',
    price: 120,
    seats: 4,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/mercedes-e-class.webp',
    pickup: 'Airport & City Delivery',
    tag: 'Executive Luxury',
    family: false,
    childSeats: 0,
    safety: 'Active Brake Assist, 360° Sensor Suite'
  },
  {
    id: 2,
    name: 'Toyota Corolla',
    category: 'Cars & Sedans',
    type: 'Compact Sedan',
    price: 45,
    seats: 4,
    luggage: 2,
    gear: 'Automatic',
    image: '/vehicle-images/toyota-corolla.webp',
    pickup: 'City Center Hub',
    tag: 'City Commuter',
    family: true,
    childSeats: 1,
    safety: 'Toyota Safety Sense 2.0 with ISOFIX'
  },
  {
    id: 3,
    name: 'Honda Civic',
    category: 'Cars & Sedans',
    type: 'Sport Sedan',
    price: 50,
    seats: 4,
    luggage: 2,
    gear: 'Automatic',
    image: '/vehicle-images/honda-civic.webp',
    pickup: 'City Center Hub',
    tag: 'Urban Cruiser',
    family: true,
    childSeats: 1,
    safety: 'Honda Sensing with Lane-Keeping Assist'
  },
  {
    id: 4,
    name: 'Honda Accord',
    category: 'Cars & Sedans',
    type: 'Full-Size Sedan',
    price: 68,
    seats: 5,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/honda-accord.webp',
    pickup: 'Airport & City Delivery',
    tag: 'Family Comfort',
    family: true,
    childSeats: 2,
    safety: 'Adaptive Cruise Control, Dual ISOFIX'
  },
  {
    id: 5,
    name: 'Toyota Camry',
    category: 'Cars & Sedans',
    type: 'Mid-Size Sedan',
    price: 72,
    seats: 5,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/toyota-camry.webp',
    pickup: 'Airport & City Delivery',
    tag: 'Highway Touring',
    family: true,
    childSeats: 2,
    safety: 'Pre-collision warning & Blind-spot monitor'
  },

  {
    id: 25,
    name: 'BMW 5 Series 530i',
    category: 'Cars & Sedans',
    type: 'Executive Sedan',
    price: 145,
    seats: 4,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/bmw-5-series.webp',
    pickup: 'Airport & City Delivery',
    tag: 'Executive Touring',
    family: false,
    childSeats: 0,
    safety: 'Driving Assistant Professional, Active Protection'
  },
  {
    id: 26,
    name: 'Ford Mustang GT',
    category: 'Cars & Sedans',
    type: 'Sports Coupe',
    price: 160,
    seats: 4,
    luggage: 2,
    gear: 'Automatic',
    image: '/vehicle-images/ford-mustang-gt.webp',
    pickup: 'City Center & Airport Hub',
    tag: 'American Grand Tourer',
    family: false,
    childSeats: 0,
    safety: 'Ford Co-Pilot360, AdvanceTrac stability control'
  },
  {
    id: 27,
    name: 'Audi A6',
    category: 'Cars & Sedans',
    type: 'Luxury Sedan',
    price: 138,
    seats: 4,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/audi-a6.webp',
    pickup: 'Airport & City Delivery',
    tag: 'Quattro Executive',
    family: false,
    childSeats: 0,
    safety: 'Audi pre sense, Adaptive Cruise Assist'
  },
  {
    id: 28,
    name: 'Lexus ES 350',
    category: 'Cars & Sedans',
    type: 'Premium Sedan',
    price: 125,
    seats: 4,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/lexus-es-350.webp',
    pickup: 'Airport & City Delivery',
    tag: 'Quiet Luxury',
    family: false,
    childSeats: 0,
    safety: 'Lexus Safety System+, Blind Spot Monitor'
  },
  // ── SUVs & 4x4 ─────────────────────────────────────────────────────────────
  {
    id: 6,
    name: 'Range Rover Velar',
    category: 'SUVs & 4x4',
    type: 'Luxury 4x4 SUV',
    price: 185,
    seats: 5,
    luggage: 4,
    gear: 'Automatic',
    image: '/vehicle-images/range-rover-velar.webp',
    pickup: 'VIP Chauffeur & Airport Delivery',
    tag: 'All-Terrain Luxury',
    family: false,
    childSeats: 2,
    safety: 'Terrain Response 2, 3D Surround Camera'
  },
  {
    id: 7,
    name: 'Toyota RAV4',
    category: 'SUVs & 4x4',
    type: 'Compact AWD SUV',
    price: 85,
    seats: 5,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/toyota-rav4.webp',
    pickup: 'City Center & Airport Hub',
    tag: 'Scenic Explorer',
    family: true,
    childSeats: 2,
    safety: 'Rear ISOFIX anchors, Road Sign Assist'
  },
  {
    id: 8,
    name: 'Honda CR-V',
    category: 'SUVs & 4x4',
    type: 'Mid-Size SUV',
    price: 80,
    seats: 5,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/honda-crv.webp',
    pickup: 'Airport & City Delivery',
    tag: 'Spacious Cabin',
    family: true,
    childSeats: 2,
    safety: 'Collision Mitigation Braking, Blind Spot Monitor'
  },
  {
    id: 9,
    name: 'Mazda CX-5',
    category: 'SUVs & 4x4',
    type: 'Crossover SUV',
    price: 78,
    seats: 5,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/mazda-cx5.webp',
    pickup: 'City Center Hub',
    tag: 'Agile Handler',
    family: true,
    childSeats: 2,
    safety: 'i-Activesense smart brake support'
  },
  {
    id: 10,
    name: 'Kia Sportage',
    category: 'SUVs & 4x4',
    type: 'Compact Crossover',
    price: 75,
    seats: 5,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/kia-sportage.webp',
    pickup: 'City Center Hub',
    tag: 'Modern Tourer',
    family: true,
    childSeats: 2,
    safety: 'Lane-keep assist & Safe exit warning'
  },
  {
    id: 11,
    name: 'Ford Explorer',
    category: 'SUVs & 4x4',
    type: '7-Passenger 3-Row SUV',
    price: 110,
    seats: 7,
    luggage: 4,
    gear: 'Automatic',
    image: '/vehicle-images/ford-explorer.webp',
    pickup: 'Airport & City Delivery',
    tag: 'Big Family Ready',
    family: true,
    childSeats: 3,
    safety: 'Three-row curtain airbags, Co-Pilot360'
  },
  {
    id: 12,
    name: 'Toyota Highlander',
    category: 'SUVs & 4x4',
    type: '7-Passenger 3-Row SUV',
    price: 125,
    seats: 7,
    luggage: 5,
    gear: 'Automatic',
    image: '/vehicle-images/toyota-highlander.webp',
    pickup: 'Airport & City Delivery',
    tag: 'Cross-Country SUV',
    family: true,
    childSeats: 3,
    safety: 'Toyota Safety Sense 2.5+, 8 airbags'
  },

  // ── Motorcycles ────────────────────────────────────────────────────────────
  {
    id: 17,
    name: 'BMW R 1250 GS',
    category: 'Motorcycles',
    type: 'Adventure Touring',
    price: 92,
    seats: 2,
    luggage: 2,
    gear: 'Manual',
    image: '/vehicle-images/bmw-r1250gs.webp',
    pickup: 'Alpine Base Station',
    tag: 'Alpine Master',
    family: false,
    childSeats: 0,
    safety: 'Dynamic Traction Control, Hill Start Pro'
  },
  {
    id: 18,
    name: 'Yamaha Ténéré 700',
    category: 'Motorcycles',
    type: 'Dual-Sport Adventure',
    price: 78,
    seats: 2,
    luggage: 2,
    gear: 'Manual',
    image: '/vehicle-images/yamaha-tenere-700.webp',
    pickup: 'Adventure Trail Depot',
    tag: 'Trail Conqueror',
    family: false,
    childSeats: 0,
    safety: 'Switchable 3-mode off-road ABS'
  },
  {
    id: 19,
    name: 'Honda CB500X',
    category: 'Motorcycles',
    type: 'Lightweight Touring',
    price: 64,
    seats: 2,
    luggage: 2,
    gear: 'Manual',
    image: '/vehicle-images/honda-cb500x.webp',
    pickup: 'City & Coastal Depot',
    tag: 'Coastal Cruiser',
    family: false,
    childSeats: 0,
    safety: 'Dual-channel ABS, Slipper clutch'
  },
  {
    id: 20,
    name: 'Yamaha FZ',
    category: 'Motorcycles',
    type: 'Street Naked',
    price: 42,
    seats: 2,
    luggage: 1,
    gear: 'Manual',
    image: '/vehicle-images/yamaha-fz.webp',
    pickup: 'Urban Rental Center',
    tag: 'City Commuter',
    family: false,
    childSeats: 0,
    safety: 'Single-channel ABS, Helmet provided'
  },
  {
    id: 21,
    name: 'Royal Enfield Classic 350',
    category: 'Motorcycles',
    type: 'Heritage Cruiser',
    price: 48,
    seats: 2,
    luggage: 1,
    gear: 'Manual',
    image: '/vehicle-images/royal-enfield-classic-350.webp',
    pickup: 'Scenic Route Depot',
    tag: 'Heritage Ride',
    family: false,
    childSeats: 0,
    safety: 'Dual-channel ABS, Helmet provided'
  },
  {
    id: 22,
    name: 'Honda Africa Twin',
    category: 'Motorcycles',
    type: 'Maxi-Adventure Touring',
    price: 118,
    seats: 2,
    luggage: 3,
    gear: 'Manual',
    image: '/vehicle-images/honda-africa-twin.webp',
    pickup: 'Adventure Trail Depot',
    tag: 'Transcontinental',
    family: false,
    childSeats: 0,
    safety: '6-axis IMU, Cornering ABS & Wheelie control'
  },
  {
    id: 23,
    name: 'Suzuki V-Strom 650',
    category: 'Motorcycles',
    type: 'All-Road Cross Touring',
    price: 86,
    seats: 2,
    luggage: 3,
    gear: 'Manual',
    image: '/vehicle-images/suzuki-v-strom-650.webp',
    pickup: 'Mountain Gateway Depot',
    tag: 'High-Pass Tourer',
    family: false,
    childSeats: 0,
    safety: 'Advanced traction control, Dual discs ABS'
  },
  {
    id: 24,
    name: 'Kawasaki Versys 650',
    category: 'Motorcycles',
    type: 'Sport Adventure Touring',
    price: 82,
    seats: 2,
    luggage: 3,
    gear: 'Manual',
    image: '/vehicle-images/kawasaki-versys-650.webp',
    pickup: 'Mountain Gateway Depot',
    tag: 'Canyon Carver',
    family: false,
    childSeats: 0,
    safety: 'Kawasaki Traction Control (KTRC), Dual ABS'
  }
];

const SHOWCASE_IDS = [1, 6, 17, 11, 22, 5, 18, 7, 24, 12];
const CATEGORIES = ['All vehicles', 'Cars & Sedans', 'SUVs & 4x4', 'Motorcycles'];
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } } };

export default function VehiclesPage() {
  usePageTitle('Vehicles');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All vehicles');
  const [type, setType] = useState('All types');
  const [familyOnly, setFamilyOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState('');

  const showcase = useMemo(() => SHOWCASE_IDS.map(id => ({ src: VEHICLES.find(vehicle => vehicle.id === id)?.image })), []);
  const [carouselSize, setCarouselSize] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 170 : 260));

  useEffect(() => {
    const onResize = () => setCarouselSize(window.innerWidth < 640 ? 170 : 260);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const types = useMemo(() => {
    const pool = category === 'All vehicles' ? VEHICLES : VEHICLES.filter(v => v.category === category);
    return [...new Set(pool.map(vehicle => vehicle.type))];
  }, [category]);

  const vehicles = useMemo(() => VEHICLES.filter(vehicle =>
    (category === 'All vehicles' || vehicle.category === category) &&
    (type === 'All types' || vehicle.type === type) &&
    (!familyOnly || vehicle.family) &&
    `${vehicle.name} ${vehicle.pickup} ${vehicle.category} ${vehicle.type} ${vehicle.safety}`.toLowerCase().includes(query.toLowerCase())
  ), [query, category, type, familyOnly]);

  const groupedVehicles = useMemo(() => {
    const targetGroups = category === 'All vehicles' ? CATEGORIES.slice(1) : [category];
    return targetGroups
      .map(group => ({
        group,
        vehicles: vehicles.filter(vehicle => vehicle.category === group)
      }))
      .filter(({ vehicles: groupVehicles }) => groupVehicles.length > 0);
  }, [vehicles, category]);

  const submit = event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const current = JSON.parse(localStorage.getItem('ts_vehicle_requests') || '[]');
    localStorage.setItem('ts_vehicle_requests', JSON.stringify([{ id: `CAR-${Date.now()}`, vehicle: selected.name, ...data, status: 'Requested' }, ...current].slice(0, 25)));
    setSelected(null);
    setToast('Request draft saved on this device. No booking or payment was created; live partner confirmation is still required.');
    setTimeout(() => setToast(''), 5000);
  };

  const clearFilters = () => {
    setCategory('All vehicles');
    setType('All types');
    setQuery('');
    setFamilyOnly(false);
  };

  return (
    <div className="vehicle-market">
      <section className="vehicle-hero">
        <div>
          <span className="vehicle-eyebrow">MOVE YOUR WAY</span>
          <h1>Your route.<br /><em>Your rules.</em></h1>
          <p>Browse 24 vehicle models across 3 categories, then request a live quote for your dates and pickup location.</p>
        </div>
        <div className="vehicle-route-card">
          <span>QUOTE STATUS</span>
          <strong>Live confirmation required</strong>
          <small>No booking or payment is created from this catalog.</small>
        </div>
      </section>

      <section className="vehicle-showcase" aria-label="Fleet showcase">
        <div className="vehicle-showcase-head">
          <div>
            <span className="vehicle-eyebrow">FLEET IN MOTION</span>
            <h2>Choose the right <em>way to go.</em></h2>
            <p>Browse a focused collection of sedans, SUVs, and touring bikes.</p>
          </div>
          <div className="vehicle-showcase-legend">
            <span><b>{VEHICLES.length}</b> models</span>
            <span><b>{CATEGORIES.length - 1}</b> categories</span>
            <span><b>1</b> easy request flow</span>
          </div>
        </div>
        <div className="vehicle-showcase-stage">
          <RoundCarousel images={showcase} imageWidth={carouselSize} imageHeight={Math.round(carouselSize * 0.75)} spacing={2} speed={5} tilt={-6} cornerRadius={20} />
        </div>
      </section>

      <section className="vehicle-toolbar">
        <div className="vehicle-search">
          <Search size={18} />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search vehicle, city, safety feature, or category"
          />
        </div>
        <label>
          Vehicle type
          <select value={type} onChange={event => setType(event.target.value)}>
            <option>All types</option>
            {types.map(item => <option key={item}>{item}</option>)}
          </select>
          <ChevronDown size={14} />
        </label>
      </section>

      <section className="vehicle-category-bar" aria-label="Vehicle categories">
        {CATEGORIES.map(item => {
          const count = item === 'All vehicles' ? VEHICLES.length : VEHICLES.filter(v => v.category === item).length;
          return (
            <button
              key={item}
              className={category === item ? 'active' : ''}
              onClick={() => {
                setCategory(item);
                setType('All types');
              }}
            >
              {item} <span className="cat-count">({count})</span>
            </button>
          );
        })}
        <button
          className={`family-filter ${familyOnly ? 'active' : ''}`}
          onClick={() => setFamilyOnly(value => !value)}
        >
          <Users size={14} /> Family-ready ({VEHICLES.filter(v => v.family).length})
        </button>
      </section>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="vehicle-toast">
            <Check size={18} />{toast}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="vehicle-results">
        <div className="vehicle-data-note">
          <ShieldCheck size={16} />
          <span><strong>Simple and clear:</strong> real vehicle model references across Sedans, SUVs, and Motorcycles. Full vehicle photos, typical specs, and an easy request form. Pickup, availability, child-seat fit, and final price are confirmed after your dates are submitted.</span>
        </div>
        <div className="vehicle-results-head">
          <div>
            <span className="vehicle-eyebrow dark">THE FLEET</span>
            <h2>More ways<br /><em>to go together.</em></h2>
          </div>
          <span>{vehicles.length} model references · live availability on request</span>
        </div>

        {groupedVehicles.length === 0 ? (
          <div className="vehicle-empty">
            <MapPin size={30} />
            <h3>No vehicles match your filters</h3>
            <p>Try another category, vehicle type, or search term.</p>
            <button onClick={clearFilters}>Clear filters</button>
          </div>
        ) : (
          groupedVehicles.map(({ group, vehicles: groupVehicles }) => (
            <div className="vehicle-group" key={group}>
              <div className="vehicle-group-heading">
                <h3>{group}</h3>
                <span>{groupVehicles.length} {groupVehicles.length === 1 ? 'vehicle' : 'vehicles'}</span>
              </div>
              <motion.div className="vehicle-grid" variants={containerVariants} initial="hidden" animate="show">
                {groupVehicles.map(vehicle => (
                  <motion.article className="vehicle-card" key={vehicle.id} variants={itemVariants}>
                    <div className="vehicle-image">
                      <SmartImage
                        src={vehicle.image}
                        alt={`${vehicle.name} ${vehicle.category} rental`}
                        sizes="(max-width: 620px) 92vw, (max-width: 900px) 48vw, 31vw"
                      />
                      <span>{vehicle.tag}</span>
                    </div>
                    <div className="vehicle-body">
                      <div className="vehicle-city"><MapPin size={14} /> {vehicle.pickup}</div>
                      <h3>{vehicle.name}</h3>
                      <p>{vehicle.type}</p>
                      <div className="vehicle-specs">
                        <span><Users size={15} />{vehicle.seats} seats</span>
                        <span><Gauge size={15} />{vehicle.gear}</span>
                        <span>▣ {vehicle.luggage} bags</span>
                      </div>
                      <div className="vehicle-safety">
                        <ShieldCheck size={14} /> {vehicle.safety}
                        {vehicle.family && <span>· up to {vehicle.childSeats} child-seat fit checks</span>}
                      </div>
                      <div className="vehicle-footer">
                        <div>
                          <small>From</small>
                          <strong>${vehicle.price}</strong>
                          <small>indicative / day</small>
                        </div>
                        <button onClick={() => setSelected(vehicle)}>
                          Check live availability <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </div>
          ))
        )}
      </section>

      <AnimatePresence>
        {selected && (
          <motion.div className="vehicle-backdrop" onClick={() => setSelected(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.form className="vehicle-modal" onClick={event => event.stopPropagation()} onSubmit={submit} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <button type="button" className="vehicle-close" onClick={() => setSelected(null)}><X size={18} /></button>
              <SmartImage src={selected.image} alt={`${selected.name} ${selected.category} rental`} sizes="(max-width: 620px) 100vw, 560px" />
              <div className="vehicle-modal-body">
                <span className="vehicle-eyebrow dark">{selected.category} · {selected.type}</span>
                <h2>{selected.name}</h2>
                <p>{selected.pickup} · indicative from ${selected.price} / day · final quote after availability check</p>
                <div className="vehicle-modal-safety">
                  <ShieldCheck size={16} /> {selected.safety} · {selected.family ? `up to ${selected.childSeats} child-seat fit checks on request` : 'Rider safety equipment required'}
                </div>
                <label>
                  Pickup date
                  <input type="date" name="pickupDate" required min={new Date().toISOString().slice(0, 10)} />
                </label>
                <label>
                  Return date
                  <input type="date" name="returnDate" required min={new Date().toISOString().slice(0, 10)} />
                </label>
                <label>
                  Service type
                  <select name="serviceType" defaultValue="private">
                    <option value="private">Private driver</option>
                    <option value="self-drive">Self-drive rental</option>
                    <option value="transfer">Airport transfer</option>
                  </select>
                </label>
                <label>
                  Travelers
                  <input type="number" name="travelers" min="1" max={selected.seats} required defaultValue={Math.min(2, selected.seats)} />
                </label>
                <button className="vehicle-submit" type="submit">
                  Send availability request <ArrowRight size={16} />
                </button>
                <small className="vehicle-note">
                  <ShieldCheck size={14} /> Partner confirmation required · no payment is taken from this request
                </small>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
