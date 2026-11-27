import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Users, Award, Heart, MapPin, Star, ArrowRight, Phone, Headphones, Clock3 } from 'lucide-react';
import './About.css';
import SmartImage from '../../../components/common/SmartImage';
import UrgentTravelLineModal from '../../../components/common/UrgentTravelLineModal';

import usePageTitle from '../../../hooks/usePageTitle';
const stats = [
  { value: '50K+', label: 'Happy Travelers' },
  { value: '120+', label: 'Destinations' },
  { value: '15+', label: 'Years Experience' },
  { value: '4.9★', label: 'Average Rating' },
];

const team = [
  { name: 'Daksh', role: 'Founder & Journey Curator', emoji: '🧭' },
  { name: 'Hriday', role: 'Head of Travel Experiences', emoji: '🌍' },
  { name: 'Manav', role: 'Technology & Platform Lead', emoji: '💻' },
  { name: 'Misha', role: 'Guest Experience Guide', emoji: '✨' },
  { name: 'Mahi', role: 'Destination Storyteller', emoji: '📸' },
];

const values = [
  { icon: <Globe size={26} />, title: 'Global Reach', desc: 'Access to 120+ handpicked destinations across every continent.' },
  { icon: <Heart size={26} />, title: 'Traveler-First', desc: 'Every decision we make puts your comfort and experience first.' },
  { icon: <Award size={26} />, title: 'Award Winning', desc: 'Recognized as Asia\'s Top Travel Platform for 3 consecutive years.' },
  { icon: <Users size={26} />, title: 'Expert Team', desc: 'Our guides and advisors are seasoned travel professionals.' },
];

const AboutPage = () => {
  usePageTitle('About');
  const [urgentLineOpen, setUrgentLineOpen] = useState(false);

  return (
    <div className="about-page">

      {/* Hero */}
      <div className="about-hero">
        <div className="about-hero-overlay" />
        <div className="about-hero-content">
          <div className="about-hero-badge">
            <Globe size={14} />
            <span>ABOUT US</span>
          </div>
          <h1 className="about-hero-title">We Make the World<br />Your Playground</h1>
          <p className="about-hero-desc">
            TravelSphere was founded with a single mission — to make extraordinary travel experiences accessible to everyone, everywhere.
          </p>
        </div>
      </div>

      <div className="about-container">

        {/* Stats */}
        <div className="about-stats-row">
          {stats.map((s, i) => (
            <div key={i} className="about-stat-card">
              <div className="about-stat-value">{s.value}</div>
              <div className="about-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Story Section */}
        <div className="about-story-grid">
          <div className="about-story-text">
            <div className="about-section-badge">OUR STORY</div>
            <h2 className="about-section-title">From a Small Dream to a Global Travel Brand</h2>
            <p className="about-story-para">
              TravelSphere started in 2009 as a small boutique travel agency in Mumbai. What began as a passion project by two travel enthusiasts has grown into one of Asia's most trusted travel platforms, serving over 50,000 travelers annually.
            </p>
            <p className="about-story-para">
              We believe travel is more than just visiting places — it's about creating lifelong memories, embracing diverse cultures, and returning home a different, more enriched person.
            </p>
            <Link to="/packages" className="about-cta-btn" style={{ textDecoration: 'none' }}>
              <span>Explore Our Journeys</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="about-story-img-wrap">
            <SmartImage
              src="/destination-images/ladakh.webp"
              alt="Team on a mountain adventure"
              className="about-story-img"
            />
            <div className="about-story-badge-float">
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span>Trusted by 50,000+ travelers</span>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="about-values-section">
          <div className="about-section-badge center">OUR VALUES</div>
          <h2 className="about-section-title center">What Sets Us Apart</h2>
          <div className="about-values-grid">
            {values.map((v, i) => (
              <div key={i} className="about-value-card">
                <div className="about-value-icon">{v.icon}</div>
                <h3 className="about-value-title">{v.title}</h3>
                <p className="about-value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="about-team-section">
          <div className="about-section-badge center">OUR TEAM</div>
          <h2 className="about-section-title center">Meet the People Behind the Magic</h2>
          <div className="about-team-grid">
            {team.map((member, i) => (
              <div key={i} className="about-team-card">
                <div className="about-team-avatar">{member.emoji}</div>
                <h4 className="about-team-name">{member.name}</h4>
                <p className="about-team-role">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 24/7 Urgent Travel Line */}
        <div className="about-urgent-section">
          <div className="about-urgent-info">
            <div className="about-urgent-badge">
              <Headphones size={14} />
              <span>24/7 URGENT TRAVEL LINE</span>
            </div>
            <h3>On the road and need immediate help?</h3>
            <p>
              Flight delays, missed transfers, or last-minute hotel changes—our live urgent travel desk is open 24/7 for real-time assistance worldwide.
            </p>
            <div className="about-urgent-meta">
              <span><Phone size={15} /> +1 800 872 835 (+1 800 TRAVEL)</span>
              <span><Phone size={15} /> +91 98253 88470</span>
              <span><Clock3 size={15} /> Under 5 min priority callback</span>
            </div>
          </div>
          <div className="about-urgent-actions">
            <button type="button" className="about-urgent-btn" onClick={() => setUrgentLineOpen(true)}>
              <Phone size={16} /> Open Urgent Travel Line
            </button>
            <Link to="/support?category=During%20travel" className="about-urgent-link">
              Support & FAQs <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="about-cta-banner">
          <MapPin size={32} color="#60a5fa" />
          <h3 className="about-cta-title">Ready to Start Your Adventure?</h3>
          <p className="about-cta-desc">Join thousands of happy travelers who trust TravelSphere to craft their perfect getaway.</p>
          <div className="about-cta-actions">
            <Link to="/destinations" className="about-btn-primary" style={{ textDecoration: 'none' }}>Browse Destinations</Link>
            <Link to="/contact" className="about-btn-secondary" style={{ textDecoration: 'none' }}>Contact Us</Link>
          </div>
        </div>

      </div>

      <UrgentTravelLineModal isOpen={urgentLineOpen} onClose={() => setUrgentLineOpen(false)} />
    </div>
  );
};

export default AboutPage;
