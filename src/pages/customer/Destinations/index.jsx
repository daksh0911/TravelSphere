import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Globe, Heart, LayoutGrid, MapPin, Search, Sparkles, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../../../styles/showcase-skin.css';
import './Destinations.css';
import SmartImage from '../../../components/common/SmartImage';
import TiltArticle from '../../../components/common/TiltArticle';
import SaveHeart from '../../../components/common/SaveHeart';
import InteractiveWorldMap from '../../../components/common/InteractiveWorldMap';
import toast from '../../../services/toast';
import { DESTINATIONS } from '../../../data/destinations';


import usePageTitle from '../../../hooks/usePageTitle';
const COUNTRIES = ['All countries', ...new Set(DESTINATIONS.map((item) => item.country))];
const REGIONS = ['All regions', ...new Set(DESTINATIONS.map((item) => item.region))];

export default function DestinationsPage() {
  usePageTitle('Destinations');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || searchParams.get('search') || '';
  const requestedRegion = searchParams.get('region');
  const initialRegion = REGIONS.includes(requestedRegion) ? requestedRegion : 'All regions';
  const [region, setRegion] = useState(initialRegion);
  const [country, setCountry] = useState('All countries');
  const [query, setQuery] = useState(urlQuery);
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [saved, setSaved] = useState(() => { try { return JSON.parse(localStorage.getItem('ts_saved_destinations') || '[]'); } catch { return []; } });
  
  // Keep query in sync with URL searchParams
  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('search') || '';
    if (q !== query) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(q);
    }
  }, [searchParams, query]);

  const handleQueryChange = (val) => {
    setQuery(val);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set('q', val.trim());
    } else {
      newParams.delete('q');
      newParams.delete('search');
    }
    setSearchParams(newParams, { replace: true });
  };

  const clearSearch = () => {
    handleQueryChange('');
    setRegion('All regions');
    setCountry('All countries');
  };
  
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return DESTINATIONS.filter(item => {
      const matchRegion = region === 'All regions' || item.region === region;
      const matchCountry = country === 'All countries' || item.country === country;
      if (!q) return matchRegion && matchCountry;

      const searchableBlob = [
        item.name,
        item.country,
        item.region,
        item.tagline,
        item.description,
        item.season,
        item.budget,
        item.climate,
        ...(item.highlights || []),
        ...(item.sights || []),
        ...(item.tags || [])
      ].filter(Boolean).join(' ').toLowerCase();

      return matchRegion && matchCountry && searchableBlob.includes(q);
    });
  }, [region, country, query]);
  
  const persist = next => {
    setSaved(next);
    try { localStorage.setItem('ts_saved_destinations', JSON.stringify(next)); } catch { /* storage unavailable */ }
  };
  const toggleSaved = item => {
    const wasSaved = saved.includes(item.id);
    const next = wasSaved ? saved.filter(id => id !== item.id) : [...saved, item.id];
    persist(next);
    toast(wasSaved ? `Removed ${item.name} from saved` : `Saved ${item.name}`, {
      actionLabel: 'Undo',
      onAction: () => persist(wasSaved ? [...next, item.id] : next.filter(id => id !== item.id)),
    });
  };
  
  return (
    <div className="destination-explorer">
      <section className="destination-hero">
        <div className="destination-hero-inner">
          <div className="destination-hero-copy">
          <span className="eyebrow"><Sparkles size={15}/> Curated by TravelSphere editors</span>
          <h1>Go where your<br/><em>story begins.</em></h1>
          <p>Explore handpicked places, local moments, and journeys designed around how you want to travel.</p>
          <div className="destination-search">
            <Search size={18}/>
            <input 
              value={query} 
              onChange={e => handleQueryChange(e.target.value)} 
              placeholder="Search by city, country, beaches, culture, season..."
              aria-label="Search destinations"
            />
            {query ? (
              <button 
                type="button" 
                onClick={clearSearch} 
                aria-label="Clear search" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '4px' }}
              >
                <X size={16} />
              </button>
            ) : (
              <kbd>⌘ K</kbd>
            )}
          </div>
          {query && (
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
              <span>Showing results for <strong>"{query}"</strong> ({filtered.length} found)</span>
              <button 
                type="button" 
                onClick={clearSearch} 
                style={{ background: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '12px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Clear search ✕
              </button>
            </div>
          )}
        </div>
        <div className="destination-hero-note">
          <span>01 / {String(DESTINATIONS.length).padStart(2, '0')}</span>
          <strong>Journeys with<br/>a point of view.</strong>
          <small>Personalized planning, trusted local partners, and support when you need it.</small>
        </div>
        </div>
      </section>
      
      <section className="destination-content section-wrap">
        <div className="section-heading-row">
          <div className="destination-count-badge">
            <span className="eyebrow dark">CURATED DESTINATIONS</span>
            <strong style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-dark)', marginTop: '2px' }}>
              {filtered.length} Handpicked Places
            </strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="ts-view-mode-toggle">
              <button
                type="button"
                className={`ts-toggle-option ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={15} /> Grid View
              </button>
              <button
                type="button"
                className={`ts-toggle-option ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
              >
                <Globe size={15} /> World Map Explorer
              </button>
            </div>
            <div className="saved-count"><Heart size={16} fill="currentColor"/> {saved.length} saved</div>
          </div>
        </div>
        
        <div className="region-tabs">
          {REGIONS.map(item => (
            <button key={item} className={region === item ? 'active' : ''} onClick={() => { setRegion(item); setCountry('All countries'); }}>{item}</button>
          ))}
        </div>
        <div className="region-tabs country-tabs">
          {COUNTRIES.map(item => (
            <button key={item} className={country === item ? 'active' : ''} onClick={() => setCountry(item)}>{item}</button>
          ))}
        </div>
        
        {viewMode === 'map' && (
          <InteractiveWorldMap
            items={filtered}
            type="destinations"
            onSelect={(item) => setSelected(item)}
            height="580px"
          />
        )}
        <div className="destination-grid" style={{ display: viewMode === 'grid' ? 'grid' : 'none' }}>
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <MapPin size={40} color="#94a3b8" style={{ margin: '0 auto 1rem', display: 'block' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-dark)', marginBottom: '0.5rem' }}>No destinations found</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 1.25rem' }}>
                We couldn't find any destinations matching "{query}". Try searching for popular spots like Kyoto, Swiss Alps, or Santorini.
              </p>
              <button type="button" onClick={clearSearch} style={{ display: 'inline-flex', padding: '0.65rem 1.4rem', borderRadius: '9999px', background: '#a3704c', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Reset Search & Filters
              </button>
            </div>
          )}
          <AnimatePresence mode="popLayout">
          {filtered.map((item, index) => (
            <TiltArticle className={`destination-tile ${index === 0 ? 'featured' : ''}`} key={item.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22, delay: Math.min(index, 8) * 0.07 } }} layout exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}>
              <motion.div layoutId={`destination-image-${item.id}`} className="destination-image-shared">
                <SmartImage src={item.image} alt={item.name} sizes="(max-width: 620px) 92vw, (max-width: 900px) 48vw, 31vw" />
              </motion.div>
              <div className="tile-overlay"/>
              <button className={`save-destination ${saved.includes(item.id) ? 'saved' : ''}`} onClick={() => toggleSaved(item)} aria-pressed={saved.includes(item.id)} aria-label={`Save ${item.name}`}>
                <SaveHeart saved={saved.includes(item.id)} />
              </button>
              <div className="tile-content">
                <span>{item.country}</span>
                <h3>{item.name}</h3>
                <p>{item.tagline}</p>
                <div className="tile-meta">
                  <small><CalendarDays size={14}/> Best: {item.season}</small>
                  <small>{item.budget}</small>
                </div>
                <Link className="text-action" to={`/destinations/${item.id}`}>Explore destination <ArrowRight size={15}/></Link>
              </div>
            </TiltArticle>
          ))}
          </AnimatePresence>
        </div>
        
        {filtered.length === 0 && (
          <div className="empty-explorer">
            <MapPin size={30}/>
            <h3>No destinations match that search</h3>
            <p>Try a country or travel style instead.</p>
          </div>
        )}
      </section>
      
      <section className="planning-banner section-wrap">
        <div>
          <span className="eyebrow dark">Make it yours</span>
          <h2>Not sure where to start?</h2>
          <p>Tell us what you want to feel. We’ll turn it into a shortlist of places and experiences.</p>
        </div>
        <button className="primary-action" onClick={() => { setQuery(''); setRegion('All regions'); setCountry('All countries'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          Build my shortlist <ArrowRight size={17}/>
        </button>
      </section>
      
      <AnimatePresence>
        {selected && (
          <motion.div 
            className="detail-backdrop" 
            onClick={() => setSelected(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.aside 
              className="destination-drawer" 
              onClick={e => e.stopPropagation()}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button className="drawer-close" onClick={() => setSelected(null)}><X size={19}/></button>
              <motion.div layoutId={`destination-image-${selected.id}`} className="destination-drawer-image">
                <SmartImage src={selected.image} alt={selected.name} sizes="(max-width: 620px) 100vw, 520px" />
              </motion.div>
              <div className="drawer-body">
                <span className="eyebrow dark">{selected.country}</span>
                <h2>{selected.name}</h2>
                <p>{selected.tagline}</p>
                <div className="drawer-facts">
                  <div><small>Best season</small><strong>{selected.season}</strong></div>
                  <div><small>Trip style</small><strong>{selected.budget} spend</strong></div>
                  <div><small>Curated trips</small><strong>{selected.packages} packages</strong></div>
                </div>
                <h4>Travel highlights</h4>
                <ul>
                  {selected.highlights.map(highlight => <li key={highlight}><span>✓</span>{highlight}</li>)}
                </ul>
                <button className="primary-action full" onClick={() => { localStorage.setItem('ts_destination_interest', selected.name); navigate('/packages'); }}>
                  See trips to {selected.name} <ArrowRight size={17}/>
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
