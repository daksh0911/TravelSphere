import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import Button from '../common/Button';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        {/* Newsletter Section */}
        <div className="newsletter-section">
          <div className="newsletter-content">
            <div className="newsletter-icon">
              <Mail size={32} color="var(--color-primary)" />
            </div>
            <h3>Get Travel Insights Weekly</h3>
            <p>Subscribe to our newsletter for the latest travel updates, exclusive deals, and tips.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email address" required />
              <Button type="submit" variant="primary">Subscribe Now</Button>
            </form>
            <p className="newsletter-disclaimer">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="footer-links-grid">
          <div className="footer-col">
            <div className="footer-logo">
              <span className="logo-icon">TS</span>
              <span className="logo-text">TravelSphere</span>
            </div>
            <p className="footer-description">
              Your gateway to discover and explore the globe. Experience the world with comfort and reliability.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Destinations</h4>
            <ul>
              <li><Link to="/destinations?region=Europe">Europe Tours</Link></li>
              <li><Link to="/destinations?region=Asia">Asia Adventures</Link></li>
              <li><Link to="/destinations?region=North%20America">North America</Link></li>
              <li><Link to="/destinations?region=Africa">Africa Safaris</Link></li>
              <li><Link to="/destinations?region=Oceania">Australia Tours</Link></li>
              <li><Link to="/destinations">All destinations</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact Us</h4>
            <ul className="contact-info">
              <li><Mail size={16} /> hello@travelsphere.com</li>
              <li><Phone size={16} />+91 9825388470 </li>
              <li><MapPin size={16} /> Travel Way, Explorer City, EX 90210</li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} TravelSphere. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
