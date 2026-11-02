import { ArrowRight, CalendarDays, Check, MapPin, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SmartImage from '../../../components/common/SmartImage';
import { DESTINATIONS_BY_ID } from '../../../data/destinations';
import usePageTitle from '../../../hooks/usePageTitle';
import './DestinationDetail.css';


export default function DestinationDetailPage() {
  const { id } = useParams();
  const destination = DESTINATIONS_BY_ID[id];
  usePageTitle(destination ? destination.name : 'Destination not found');

  if (!destination) {
    return <div className="destination-detail-empty"><h1>That somewhere is still being mapped.</h1><Link to="/destinations" className="detail-cta">Back to destinations <ArrowRight size={17} /></Link></div>;
  }

  return (
    <div className="destination-detail">
      <section className="detail-hero">
        <motion.div layoutId={`destination-image-${destination.id}`} className="detail-hero-image">
          <SmartImage src={destination.image} alt={destination.name} priority sizes="100vw" />
        </motion.div>
        <div className="detail-hero-overlay" />
        <div className="detail-hero-copy">
          <span className="detail-eyebrow"><Sparkles size={14} /> {destination.country}</span>
          <h1>{destination.name}</h1>
          <p>{destination.tagline}</p>
        </div>
      </section>

      <section className="detail-content">
        <div className="detail-intro">
          <span className="detail-eyebrow dark">A considered way to arrive</span>
          <h2>Make room for the <em>good parts.</em></h2>
          <p>{destination.description}</p>
          <Link to={`/packages?destination=${id}`} className="detail-cta">See curated trips <ArrowRight size={17} /></Link>
        </div>
        <aside className="detail-facts">
          <div><CalendarDays size={17} /><span>Best season<strong>{destination.season}</strong></span></div>
          <div><MapPin size={17} /><span>Trip style<strong>{destination.budget} spend</strong></span></div>
          <div><Sparkles size={17} /><span>Curated packages<strong>{destination.packages} journeys</strong></span></div>
        </aside>
      </section>

      <section className="detail-highlights">
        <div><span className="detail-eyebrow dark">Worth making time for</span><h2>Three reasons to <em>go.</em></h2></div>
        <div className="highlight-grid">{destination.highlights.map((highlight) => <article key={highlight}><Check size={18} /><h3>{highlight}</h3><p>Thoughtfully planned with a trusted local partner.</p></article>)}</div>
      </section>

      <section className="detail-related">
        <div><span className="detail-eyebrow dark">Your next chapter</span><h2>Start with the <em>right route.</em></h2><p>Tell us how you want to feel and we’ll shape the details around it.</p></div>
        <Link to={`/packages?destination=${id}`} className="detail-cta">Browse {destination.name} packages <ArrowRight size={17} /></Link>
      </section>
    </div>
  );
}
