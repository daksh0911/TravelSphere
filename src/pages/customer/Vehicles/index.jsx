import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, Gauge, MapPin, Search, ShieldCheck, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Vehicles.css';
import SmartImage from '../../../components/common/SmartImage';
import RoundCarousel from '../../../components/common/RoundCarousel';
import usePageTitle from '../../../hooks/usePageTitle';
import { useCurrency } from '../../../context/useCurrency';
import api from '../../../services/api';
import {
  CATEGORIES,
  SHOWCASE_IDS,
  VEHICLES,
  getRentalButtonLabel,
  normalizeApiVehicle
} from '../../../data/vehicleCatalog';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } } };

export default function VehiclesPage() {
  usePageTitle('Vehicles');
  const { formatPrice, currency } = useCurrency();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All vehicles');
  const [type, setType] = useState('All types');
  const [familyOnly, setFamilyOnly] = useState(false);

  // Sync partner-added vehicles from MySQL API alongside static catalog
  const [vehicleList, setVehicleList] = useState(VEHICLES);

  useEffect(() => {
    api.get('/vehicles')
      .then(res => {
        if (res.data?.vehicles && res.data.vehicles.length > 0) {
          const existingIds = new Set(VEHICLES.map(v => Number(v.id)));
          const dbNew = res.data.vehicles
            .filter(v => !existingIds.has(Number(v.vehicle_id || v.id)))
            .map(normalizeApiVehicle);
          if (dbNew.length > 0) {
            setVehicleList([...VEHICLES, ...dbNew]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const showcase = useMemo(
    () => SHOWCASE_IDS.map(id => ({ src: vehicleList.find(vehicle => vehicle.id === id)?.image })),
    [vehicleList]
  );
  const [carouselSize, setCarouselSize] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 170 : 260));

  useEffect(() => {
    const onResize = () => setCarouselSize(window.innerWidth < 640 ? 170 : 260);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const types = useMemo(() => {
    const pool = category === 'All vehicles' ? vehicleList : vehicleList.filter(v => v.category === category);
    return [...new Set(pool.map(vehicle => vehicle.type))];
  }, [vehicleList, category]);

  const vehicles = useMemo(() => vehicleList.filter(vehicle =>
    (category === 'All vehicles' || vehicle.category === category) &&
    (type === 'All types' || vehicle.type === type) &&
    (!familyOnly || vehicle.family) &&
    `${vehicle.name} ${vehicle.pickup} ${vehicle.category} ${vehicle.type} ${vehicle.safety}`.toLowerCase().includes(query.toLowerCase())
  ), [vehicleList, query, category, type, familyOnly]);

  const groupedVehicles = useMemo(() => {
    const targetGroups = category === 'All vehicles' ? CATEGORIES.slice(1) : [category];
    return targetGroups
      .map(group => ({
        group,
        vehicles: vehicles.filter(vehicle => vehicle.category === group)
      }))
      .filter(({ vehicles: groupVehicles }) => groupVehicles.length > 0);
  }, [vehicles, category]);

  const clearFilters = () => {
    setCategory('All vehicles');
    setType('All types');
    setQuery('');
    setFamilyOnly(false);
  };

  return (
    <div className="vehicle-market">
      <section className="vehicle-hero">
        <div className="vehicle-hero-inner">
          <div>
            <span className="vehicle-eyebrow">MOVE YOUR WAY</span>
            <h1>Your route.<br /><em>Your rules.</em></h1>
            <p>Browse {vehicleList.length} vehicle models across 3 categories, then open your dedicated booking page for instant checkout, coupon savings, and PDF voucher.</p>
          </div>
          <div className="vehicle-route-card">
            <span>ONLINE BOOKING & PAYMENT</span>
            <strong>Direct Vehicle Reservation</strong>
            <small>Instant checkout with card, UPI, netbanking & wallet. Saved to Bookings table.</small>
          </div>
        </div>
      </section>

      <section className="vehicle-showcase" aria-label="Fleet showcase">
        <div className="vehicle-showcase-head">
          <div>
            <span className="vehicle-eyebrow">FLEET SHOWCASE</span>
            <p style={{ margin: '4px 0 0', color: 'var(--color-text-medium)', fontSize: '0.92rem' }}>Browse sedans, SUVs, and adventure touring bikes.</p>
          </div>
          <div className="vehicle-showcase-legend">
            <span><b>{vehicleList.length}</b> models</span>
            <span><b>{CATEGORIES.length - 1}</b> categories</span>
            <span><b>1</b> dedicated booking page</span>
          </div>
        </div>
        <div className="vehicle-showcase-stage">
          <RoundCarousel images={showcase} imageWidth={carouselSize} imageHeight={Math.round(carouselSize * 0.75)} spacing={2} speed={5} tilt={-6} cornerRadius={20} />
        </div>
      </section>

      <section className="vehicle-toolbar">
        <div className="vehicle-search">
          <Search size={18} aria-hidden="true" />
          <input
            aria-label="Search vehicle, city, safety feature, or category"
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
          <ChevronDown size={14} aria-hidden="true" />
        </label>
      </section>

      <section className="vehicle-category-bar" aria-label="Vehicle categories">
        {CATEGORIES.map(item => {
          const count = item === 'All vehicles' ? vehicleList.length : vehicleList.filter(v => v.category === item).length;
          return (
            <button
              type="button"
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
          type="button"
          className={`family-filter ${familyOnly ? 'active' : ''}`}
          onClick={() => setFamilyOnly(value => !value)}
        >
          <Users size={14} aria-hidden="true" /> Family-ready ({vehicleList.filter(v => v.family).length})
        </button>
      </section>

      <section className="vehicle-results">
        <div className="vehicle-data-note">
          <ShieldCheck size={16} aria-hidden="true" />
          <span><strong>Simple and clear:</strong> real vehicle model references across Sedans, SUVs, and Motorcycles. Select any model to open its dedicated rental booking page with pickup hub, dates, coverage plan, and instant checkout.</span>
        </div>
        <div className="vehicle-results-head">
          <div className="vehicle-count-badge">
            <span className="vehicle-eyebrow dark">CURATED FLEET</span>
            <strong style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-dark)', marginTop: '2px' }}>
              {vehicles.length} Vehicle Models
            </strong>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Instant booking per vehicle</span>
        </div>

        {groupedVehicles.length === 0 ? (
          <div className="vehicle-empty">
            <MapPin size={30} />
            <h3>No vehicles match your filters</h3>
            <p>Try another category, vehicle type, or search term.</p>
            <button type="button" onClick={clearFilters}>Clear filters</button>
          </div>
        ) : (
          groupedVehicles.map(({ group, vehicles: groupVehicles }) => (
            <div className="vehicle-group" key={group}>
              <div className="vehicle-group-heading">
                <h3>{group}</h3>
                <span>{groupVehicles.length} {groupVehicles.length === 1 ? 'vehicle' : 'vehicles'}</span>
              </div>
              <motion.div className="vehicle-grid" variants={containerVariants} initial={false} animate="show">
                {groupVehicles.map(vehicle => (
                  <motion.article className="vehicle-card" key={vehicle.id} variants={itemVariants}>
                    <Link
                      to={`/vehicles/${vehicle.id}`}
                      state={{ vehicle }}
                      className="vehicle-image"
                      aria-label={`View booking page for ${vehicle.name}`}
                    >
                      <SmartImage
                        src={vehicle.image}
                        alt={`${vehicle.name} ${vehicle.category} rental`}
                        sizes="(max-width: 620px) 92vw, (max-width: 900px) 48vw, 31vw"
                      />
                      <span>{vehicle.tag}</span>
                    </Link>
                    <div className="vehicle-body">
                      <div className="vehicle-city"><MapPin size={14} aria-hidden="true" /> {vehicle.pickup}</div>
                      <h3>
                        <Link to={`/vehicles/${vehicle.id}`} state={{ vehicle }} className="vehicle-title-link">
                          {vehicle.name}
                        </Link>
                      </h3>
                      <p>{vehicle.type}</p>
                      <div className="vehicle-specs">
                        <span><Users size={15} aria-hidden="true" />{vehicle.seats} seats</span>
                        <span><Gauge size={15} aria-hidden="true" />{vehicle.gear}</span>
                        <span>🧳 {vehicle.luggage} bags</span>
                      </div>
                      <div className="vehicle-safety">
                        <ShieldCheck size={14} aria-hidden="true" /> {vehicle.safety}
                        {vehicle.family && <span>· up to {vehicle.childSeats} child-seat fit checks</span>}
                      </div>
                      <div className="vehicle-footer">
                        <div>
                          <small>From</small>
                          <strong>{formatPrice(vehicle.price)}</strong>
                          <small>{currency} / day</small>
                        </div>
                        <Link
                          to={`/vehicles/${vehicle.id}`}
                          state={{ vehicle }}
                          className="vehicle-book-btn"
                        >
                          {getRentalButtonLabel(vehicle)} <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
