import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowRight, Globe, Layers, MapPin, RotateCcw, X } from 'lucide-react';
import SmartImage from './SmartImage';
import './InteractiveWorldMap.css';

const DESTINATION_COORDS = {
  maldives: { lat: 3.2028, lng: 73.2207, price: '$1,850' },
  kyoto: { lat: 35.0116, lng: 135.7681, price: '$1,420' },
  santorini: { lat: 36.3932, lng: 25.4615, price: '$1,980' },
  'swiss-alps': { lat: 46.5590, lng: 8.5606, price: '$2,350' },
  dubai: { lat: 25.2048, lng: 55.2708, price: '$1,650' },
  paris: { lat: 48.8566, lng: 2.3522, price: '$1,720' },
  bali: { lat: -8.4095, lng: 115.1889, price: '$980' },
  rajasthan: { lat: 26.9124, lng: 75.7873, price: '$850' },
  rome: { lat: 41.9028, lng: 12.4964, price: '$1,390' },
  cairo: { lat: 30.0444, lng: 31.2357, price: '$1,120' },
  bangkok: { lat: 13.7563, lng: 100.5018, price: '$780' },
  sydney: { lat: -33.8688, lng: 151.2093, price: '$2,100' },
  capetown: { lat: -33.9249, lng: 18.4241, price: '$1,450' },
  'new-york': { lat: 40.7128, lng: -74.0060, price: '$1,890' },
  banff: { lat: 51.1784, lng: -115.5708, price: '$2,150' },
  amsterdam: { lat: 52.3676, lng: 4.9041, price: '$1,520' }
};

const HOTEL_COORDS = {
  1: { lat: 35.0560, lng: 135.7330 },
  2: { lat: 36.4632, lng: 25.3753 },
  10: { lat: 24.8322, lng: 55.7077 },
  3: { lat: 25.2173, lng: 55.2829 },
  4: { lat: 46.6863, lng: 7.8588 },
  5: { lat: -8.4552, lng: 115.2631 },
  6: { lat: 48.8510, lng: 2.3275 },
  11: { lat: 26.8967, lng: 75.8078 },
  12: { lat: 4.4925, lng: 73.6644 },
  13: { lat: 41.9056, lng: 12.4842 },
  14: { lat: 29.9856, lng: 31.1340 },
  15: { lat: -33.8550, lng: 151.2099 },
  16: { lat: -33.9312, lng: 18.4132 },
  17: { lat: 40.7112, lng: -74.0069 },
  18: { lat: 51.1648, lng: -115.5617 },
  19: { lat: 13.7402, lng: 100.5401 },
  20: { lat: 52.3734, lng: 4.8837 }
};

export default function InteractiveWorldMap({ items = [], type = 'destinations', onSelect, height = '560px' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeRegion, setActiveRegion] = useState('All');

  // Assign coordinates to items
  const mappedItems = useMemo(() => {
    return items.map((item) => {
      let coords;
      let displayPrice;

      if (type === 'destinations') {
        const dest = DESTINATION_COORDS[item.id] || { lat: 20, lng: 0, price: '$1,200' };
        coords = [dest.lat, dest.lng];
        displayPrice = dest.price;
      } else if (type === 'packages') {
        const loc = (item.location || '').toLowerCase();
        let matched = Object.entries(DESTINATION_COORDS).find(([key]) => loc.includes(key.replace('-', ' ')));
        if (!matched) {
          if (loc.includes('maldives')) matched = ['maldives', DESTINATION_COORDS.maldives];
          else if (loc.includes('greece') || loc.includes('santorini')) matched = ['santorini', DESTINATION_COORDS.santorini];
          else if (loc.includes('indonesia') || loc.includes('bali')) matched = ['bali', DESTINATION_COORDS.bali];
          else if (loc.includes('switzerland') || loc.includes('interlaken') || loc.includes('alps')) matched = ['swiss-alps', DESTINATION_COORDS['swiss-alps']];
          else if (loc.includes('japan') || loc.includes('kyoto')) matched = ['kyoto', DESTINATION_COORDS.kyoto];
          else if (loc.includes('dubai') || loc.includes('uae')) matched = ['dubai', DESTINATION_COORDS.dubai];
          else if (loc.includes('france') || loc.includes('paris')) matched = ['paris', DESTINATION_COORDS.paris];
          else if (loc.includes('india') || loc.includes('rajasthan') || loc.includes('jaipur')) matched = ['rajasthan', DESTINATION_COORDS.rajasthan];
          else if (loc.includes('thailand') || loc.includes('bangkok')) matched = ['bangkok', DESTINATION_COORDS.bangkok];
          else if (loc.includes('netherlands') || loc.includes('amsterdam')) matched = ['amsterdam', DESTINATION_COORDS.amsterdam];
          else if (loc.includes('italy') || loc.includes('rome')) matched = ['rome', DESTINATION_COORDS.rome];
          else if (loc.includes('egypt') || loc.includes('cairo')) matched = ['cairo', DESTINATION_COORDS.cairo];
          else if (loc.includes('australia') || loc.includes('sydney')) matched = ['sydney', DESTINATION_COORDS.sydney];
          else if (loc.includes('south africa') || loc.includes('cape town')) matched = ['capetown', DESTINATION_COORDS.capetown];
          else if (loc.includes('new york') || loc.includes('united states')) matched = ['new-york', DESTINATION_COORDS['new-york']];
          else if (loc.includes('canada') || loc.includes('banff')) matched = ['banff', DESTINATION_COORDS.banff];
        }
        const coordsData = matched ? matched[1] : { lat: 20, lng: 0 };
        coords = [coordsData.lat, coordsData.lng];
        displayPrice = item.priceLabel || `$${item.price}`;
      } else {
        const hotel = HOTEL_COORDS[item.id] || { lat: 20, lng: 0 };
        coords = [hotel.lat, hotel.lng];
        displayPrice = item.priceLabel || (item.price ? `$${item.price}` : '$999');
      }

      return {
        ...item,
        coords,
        displayPrice
      };
    });
  }, [items, type]);

  // Unique regions
  const regions = useMemo(() => {
    const list = new Set(['All']);
    items.forEach(it => {
      if (it.region) list.add(it.region);
      else if (it.city || it.location) {
        const place = (it.city || it.location || '');
        if (/Japan|Indonesia|India|Maldives|Thailand/i.test(place)) list.add('Asia');
        else if (/Greece|Switzerland|France|Italy|Netherlands/i.test(place)) list.add('Europe');
        else if (/United States|Canada/i.test(place)) list.add('Americas');
        else if (/Egypt|South Africa/i.test(place)) list.add('Africa');
        else if (/United Arab Emirates|Dubai/i.test(place)) list.add('Middle East');
        else if (/Australia|Sydney/i.test(place)) list.add('Oceania');
      }
    });
    return Array.from(list);
  }, [items]);

  // Filter items by region
  const filteredItems = useMemo(() => {
    if (activeRegion === 'All') return mappedItems;
    return mappedItems.filter(item => {
      if (item.region) return item.region === activeRegion;
      const c = item.city || item.location || '';
      if (activeRegion === 'Asia') return /Japan|Indonesia|India|Maldives|Thailand/i.test(c);
      if (activeRegion === 'Europe') return /Greece|Switzerland|France|Italy|Netherlands/i.test(c);
      if (activeRegion === 'Americas') return /United States|Canada/i.test(c);
      if (activeRegion === 'Africa') return /Egypt|South Africa/i.test(c);
      if (activeRegion === 'Middle East') return /United Arab Emirates|Dubai/i.test(c);
      if (activeRegion === 'Oceania') return /Australia|Sydney/i.test(c);
      return true;
    });
  }, [mappedItems, activeRegion]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [25, 10],
        zoom: 2.3,
        minZoom: 1.8,
        maxZoom: 14,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true
      });

      // OpenStreetMap global travel tiles (No API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Re-position zoom control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when filteredItems or selectedItem changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers
    filteredItems.forEach(item => {
      if (!item.coords) return;

      const isSelected = selectedItem?.id === item.id;
      const markerTitle = item.title || item.name || 'Trip';
      const markerIcon = type === 'destinations' ? '📍' : type === 'packages' ? '✈️' : '🏨';
      const priceText = (item.displayPrice || '$999').split('-')[0];
      const html = `
        <div class="ts-leaflet-marker">
          <div class="ts-marker-bubble ${isSelected ? 'highlighted' : ''}">
            <span class="ts-marker-icon">${markerIcon}</span>
            <span class="ts-marker-label">${markerTitle}</span>
            <span class="ts-marker-price">${priceText}</span>
          </div>
          <div class="ts-marker-arrow"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'ts-custom-div-icon',
        html,
        iconSize: [120, 40],
        iconAnchor: [60, 40]
      });

      const marker = L.marker(item.coords, { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedItem(item);
        map.flyTo(item.coords, Math.max(map.getZoom(), 5), {
          duration: 1.2,
          easeLinearity: 0.25
        });
        if (onSelect) onSelect(item);
      });

      markersRef.current.push(marker);
    });
  }, [filteredItems, selectedItem, type, onSelect]);

  const resetMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([25, 10], 2.3, { duration: 1.2 });
      setSelectedItem(null);
    }
  };

  return (
    <div className="ts-map-container" style={{ height }}>
      {/* Top Floating Controls */}
      <div className="ts-map-floating-bar">
        <div className="ts-map-controls-group">
          <span className="ts-map-pill-btn" style={{ background: '#1e293b', color: '#ffffff', borderColor: '#334155' }}>
            <Globe size={14} /> Interactive World Explorer
          </span>
          {regions.slice(0, 6).map(r => (
            <button
              key={r}
              type="button"
              className={`ts-map-pill-btn ${activeRegion === r ? 'active' : ''}`}
              onClick={() => setActiveRegion(r)}
            >
              <Layers size={13} /> {r}
            </button>
          ))}
        </div>

        <div className="ts-map-controls-group">
          <button type="button" className="ts-map-pill-btn" onClick={resetMap} title="Reset World View">
            <RotateCcw size={13} /> Reset View
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="ts-map-canvas" style={{ height: '100%' }} />

      {/* Selected Item Floating Glassmorphic Preview */}
      {selectedItem && (
        <div className="ts-map-preview-card">
          <button type="button" className="ts-preview-close" onClick={() => setSelectedItem(null)}>
            <X size={14} />
          </button>
          <SmartImage
            src={selectedItem.image}
            alt={selectedItem.title || selectedItem.name}
            className="ts-preview-thumb"
          />
          <div className="ts-preview-info">
            <div>
              <h4 className="ts-preview-title">{selectedItem.title || selectedItem.name}</h4>
              <p className="ts-preview-sub">
                <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                {selectedItem.location || selectedItem.city || selectedItem.country || 'Global Destination'}
                {selectedItem.days ? ` · ${selectedItem.days} days` : ''}
              </p>
            </div>
            <div className="ts-preview-bottom">
              <span className="ts-preview-price">{selectedItem.displayPrice}</span>
              <button
                type="button"
                className="ts-btn-primary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                onClick={() => {
                  if (onSelect) onSelect(selectedItem);
                }}
              >
                {type === 'packages' ? 'View & Reserve Trip' : 'Explore'} <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
