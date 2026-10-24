import { Globe, Users, Award, Heart, MapPin, Star, ArrowRight } from 'lucide-react';
import './About.css';
import SmartImage from '../../../components/common/SmartImage';

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
            <button className="about-cta-btn">
              <span>Explore Our Journeys</span>
              <ArrowRight size={16} />
            </button>
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

        {/* CTA Banner */}
        <div className="about-cta-banner">
          <MapPin size={32} color="#60a5fa" />
          <h3 className="about-cta-title">Ready to Start Your Adventure?</h3>
          <p className="about-cta-desc">Join thousands of happy travelers who trust TravelSphere to craft their perfect getaway.</p>
          <div className="about-cta-actions">
            <button className="about-btn-primary">Browse Destinations</button>
            <button className="about-btn-secondary">Contact Us</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
