import { ArrowRight, Compass, Headphones, Heart, MapPin, Plane, ShieldCheck, Sparkles, WandSparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Reveal from './Reveal';
import SmartImage from '../../../components/common/SmartImage';
import ImageReveal from '../../../components/common/ImageReveal';
import MagneticLink from '../../../components/common/MagneticLink';
import DestinationGallery from './DestinationGallery';
import { DESTINATIONS_BY_ID, FEATURED_DESTINATION_IDS } from '../../../data/destinations';
import './Home.css';

const FEATURED = FEATURED_DESTINATION_IDS.map((id) => {
  const item = DESTINATIONS_BY_ID[id];
  return { id: item.id, name: item.name, region: item.country, meta: item.homeMeta || item.tagline, image: item.image };
});

const JOURNEY_STEPS = [
  ['01', 'Tell us the feeling', 'Beach calm, city energy, a little wonder—we start with what you want to feel.'],
  ['02', 'Shape the route', 'Browse the right destinations, stays, vehicles, and experiences in one place.'],
  ['03', 'Go with confidence', 'A real specialist, flexible support, and the important details already handled.'],
];

const HOME_VEHICLES = [
  { id: 1, name: 'Mercedes-Benz E-Class', category: 'Executive Sedan', price: 120, image: '/vehicle-images/mercedes-e-class.webp', tag: 'Luxury Cruising', seats: 3, gear: 'Automatic' },
  { id: 6, name: 'Range Rover Velar', category: 'Luxury 4x4 SUV', price: 185, image: '/vehicle-images/range-rover-velar.webp', tag: 'All-Terrain AWD', seats: 5, gear: 'Automatic' },
  { id: 17, name: 'BMW R 1250 GS', category: 'Adventure Motorcycle', price: 92, image: '/vehicle-images/bmw-r1250gs.webp', tag: 'Alpine Touring', seats: 2, gear: 'Manual' },
];

const headlineVariants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.12, staggerChildren: 0.14 } },
};

const headlineLineVariants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(7px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Home() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="new-home">
      <section className="new-home-hero">
        {/* Crisp static high-resolution background image with gentle Ken Burns motion */}
        <div className="hero-background" aria-hidden="true">
          <div
            className="hero-static-bg"
            style={{ backgroundImage: `url('/hero-lago-di-braies.jpg')` }}
          />
        </div>
        <div className="hero-scrim" aria-hidden="true" />

        <div className="hero-mini-nav">
          <span className="hero-kicker"><span className="pulse-dot" /> Travel, re-cut for you</span>
          <span>Lago di Braies · Italian Dolomites</span>
        </div>

        <div className="hero-layout">
          <div className="hero-copy">
            <Reveal direction="right"><span className="new-eyebrow"><Sparkles size={14} /> The new way to wander</span></Reveal>
            <motion.h1
              initial={prefersReducedMotion ? false : 'hidden'}
              animate="visible"
              variants={headlineVariants}
            >
              <motion.span className="hero-title-line" variants={headlineLineVariants}>Find the version</motion.span>
              <motion.span className="hero-title-line" variants={headlineLineVariants}>of the world that</motion.span>
              <motion.span className="hero-title-line" variants={headlineLineVariants}><em>feels like yours.</em></motion.span>
            </motion.h1>
            <Reveal direction="right" delay={220}><p className="hero-lede">Thoughtful trips, beautiful stays, and local moments—shaped around your pace, not a template.</p></Reveal>
            <Reveal direction="right" delay={300}>
              <div className="hero-actions">
                <MagneticLink to="/destinations" className="hero-primary">Start exploring <ArrowRight size={17} /></MagneticLink>
                <Link to="/packages" className="hero-secondary"><Compass size={16} /> See curated trips</Link>
              </div>
            </Reveal>
            <Reveal direction="right" delay={380}>
              <div className="hero-proof">
                <span className="hero-proof-mark"><Compass size={17} /></span>
                <div>
                  <strong>Plan around what matters</strong>
                  <small>Destination, stay, and transport ideas in one place</small>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal direction="left" delay={160} className="hero-orbit-wrap">
            <div className="hero-orbit-card">
              <div className="orbit-image">
                <ImageReveal className="orbit-image-reveal">
                  <SmartImage src="/destination-images/kyoto.webp" alt="Kyoto garden and traditional architecture" sizes="(max-width: 900px) 92vw, 420px" />
                </ImageReveal>
                <div className="orbit-image-label"><MapPin size={13} /> Kyoto, Japan <span>·</span> A slower kind of journey</div>
              </div>
              <div className="orbit-card-content">
                <div><small>A place to slow down</small><h2>Find your softer<br /><em>side.</em></h2></div>
                <Link to="/destinations/kyoto" className="round-arrow" aria-label="Explore Kyoto"><ArrowRight size={19} /></Link>
              </div>
            </div>
            <div className="orbit-pill pill-top"><WandSparkles size={15} /><span>Made around<br /><strong>your rhythm</strong></span></div>
          </Reveal>
        </div>
        <div className="hero-scroll-cue"><span /> Scroll to wander</div>
      </section>

      <section className="new-home-section discovery-section">
        <Reveal><div className="section-topline"><div><span className="new-eyebrow dark">A little inspiration</span><h2>Start with a <em>somewhere.</em></h2></div><Link to="/destinations" className="section-link">View all destinations <ArrowRight size={15} /></Link></div></Reveal>
        <DestinationGallery destinations={FEATURED} />
      </section>

      <section className="new-home-section vehicles-showcase-section">
        <Reveal>
          <div className="section-topline">
            <div>
              <span className="new-eyebrow dark">Scenic Road Adventures</span>
              <h2>Drive the route on <em>your terms.</em></h2>
            </div>
            <Link to="/vehicles" className="section-link">Explore more options <ArrowRight size={15} /></Link>
          </div>
        </Reveal>
        <div className="home-vehicles-grid">
          {HOME_VEHICLES.map((vehicle, idx) => (
            <Reveal key={vehicle.id} delay={idx * 80}>
              <article className="home-vehicle-card">
                <div className="home-vehicle-media">
                  <SmartImage src={vehicle.image} alt={vehicle.name} sizes="(max-width: 600px) 92vw, (max-width: 1024px) 46vw, 24vw" />
                  <span className="home-vehicle-tag">{vehicle.tag}</span>
                </div>
                <div className="home-vehicle-body">
                  <div className="home-vehicle-header">
                    <span className="home-vehicle-cat">{vehicle.category}</span>
                    <strong className="home-vehicle-price">${vehicle.price}<small>/day</small></strong>
                  </div>
                  <h3>{vehicle.name}</h3>
                  <div className="home-vehicle-meta">
                    <span>{vehicle.seats} Seats</span>
                    <span>•</span>
                    <span>{vehicle.gear}</span>
                    <span>•</span>
                    <span>Clean Scenic</span>
                  </div>
                  <Link to="/vehicles" className="home-vehicle-btn">
                    <span>Reserve vehicle</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="signal-section">
        <div className="signal-glow" />
        <div className="new-home-section signal-inner">
          <Reveal direction="right"><span className="new-eyebrow">Why it feels different</span><h2>Less searching.<br /><em>More arriving.</em></h2><p>TravelSphere brings the whole journey together, without making you feel like you’re shopping for one.</p><Link to="/about" className="signal-link">How we travel <ArrowRight size={16} /></Link></Reveal>
          <div className="signal-cards">
            <Reveal delay={80}><article><span className="signal-icon"><Heart size={18} /></span><h3>Curated, not crowded</h3><p>Places with a point of view—chosen by people who actually go.</p></article></Reveal>
            <Reveal delay={180}><article><span className="signal-icon"><Headphones size={18} /></span><h3>A human in your corner</h3><p>Get real support before takeoff, during the trip, and after you’re home.</p></article></Reveal>
            <Reveal delay={280}><article><span className="signal-icon"><ShieldCheck size={18} /></span><h3>Clear from the start</h3><p>Transparent inclusions, trusted partners, and no mystery at checkout.</p></article></Reveal>
          </div>
        </div>
      </section>

      <section className="new-home-section journey-section">
        <Reveal><div className="section-topline"><div><span className="new-eyebrow dark">The TravelSphere rhythm</span><h2>Three moves to<br /><em>somewhere better.</em></h2></div><Link to="/support" className="section-link">Need a human? <ArrowRight size={15} /></Link></div></Reveal>
        <div className="journey-steps">
          {JOURNEY_STEPS.map(([number, title, copy], index) => (
            <Reveal key={number} delay={index * 120} className="journey-step"><span className="journey-number">{number}</span><div><h3>{title}</h3><p>{copy}</p></div><ArrowRight className="journey-arrow" size={19} /></Reveal>
          ))}
        </div>
      </section>

      <section className="home-trip-cta">
        <div className="new-home-section cta-inner">
          <Reveal direction="right"><span className="new-eyebrow">Your next chapter is out there</span><h2>Let’s make the<br /><em>first move.</em></h2><p>Tell us where your mind keeps going. We’ll help you find the route.</p><MagneticLink to="/packages" className="hero-primary">Find my trip <ArrowRight size={17} /></MagneticLink></Reveal>
          <Reveal direction="left" delay={140} className="cta-art"><div className="cta-ring ring-one" /><div className="cta-ring ring-two" /><div className="cta-art-card"><Plane size={22} /><span>Next stop</span><strong>Somewhere<br />you’ll remember.</strong></div></Reveal>
        </div>
      </section>
    </div>
  );
}
