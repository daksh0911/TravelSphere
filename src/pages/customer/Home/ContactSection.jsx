import { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare, 
  User, 
  Calendar, 
  ArrowRight, 
  Send, 
  Compass, 
  HelpCircle, 
  CheckSquare, 
  Hotel, 
  Car, 
  CreditCard, 
  Navigation,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './ContactSection.css';
import SmartImage from '../../../components/common/SmartImage';

const ContactSection = () => {
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    inquiryType: '',
    subject: '',
    message: '',
    agreeTerms: false
  });

  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxToggle = () => {
    setFormData(prev => ({ ...prev, agreeTerms: !prev.agreeTerms }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      inquiryType: '',
      subject: '',
      message: '',
      agreeTerms: false
    });
    setSubmitted(false);
  };

  return (
    <section className="contact-section">
      
      {/* Top Hero Banner */}
      <div 
        className="contact-hero-banner"
        style={{ 
          backgroundImage: `url("/destination-images/ladakh.webp")` 
        }}
      >
        <div className="contact-hero-overlay"></div>
        <div className="contact-hero-content">
          <div className="contact-hero-badge">
            <Mail size={14} />
            <span>GET IN TOUCH</span>
          </div>
          <h2 className="contact-hero-title">We're Here to Help You Travel Better</h2>
          <p className="contact-hero-desc">
            Have questions about bookings, destinations, hotels, or tour packages? Our travel experts are always ready to assist you in crafting the perfect journey.
          </p>
          <div className="contact-hero-actions">
            <Link to="/support" className="contact-btn-support">Contact Support</Link>
            <Link to="/packages" className="contact-btn-explore">Explore Packages</Link>
          </div>
        </div>
      </div>

      <div className="contact-container">

        {/* Top Contact Info Cards Row (5 Cards) */}
        <div className="contact-cards-row">
          
          {/* Card 1 */}
          <div className="info-card">
            <div className="info-icon-box">
              <MapPin size={22} />
            </div>
            <h4 className="info-card-title">Office Address</h4>
            <p className="info-card-text">
              123 Horizon Blvd,<br />
              New York, NY 10001
            </p>
          </div>

          {/* Card 2 */}
          <div className="info-card">
            <div className="info-icon-box">
              <Phone size={22} />
            </div>
            <h4 className="info-card-title">Phone Number</h4>
            <p className="info-card-text">
              +1 800 TRAVEL<br />
              +1 (212) 555-0199
            </p>
          </div>

          {/* Card 3 */}
          <div className="info-card">
            <div className="info-icon-box orange">
              <Mail size={22} />
            </div>
            <h4 className="info-card-title">Email Address</h4>
            <p className="info-card-text">
              hello@travelsphere.com<br />
              support@travelsphere.com
            </p>
          </div>

          {/* Card 4 */}
          <div className="info-card">
            <div className="info-icon-box">
              <Clock size={22} />
            </div>
            <h4 className="info-card-title">Business Hours</h4>
            <p className="info-card-text">
              Mon - Fri: 9AM - 8PM<br />
              Sat - Sun: 10AM - 4PM
            </p>
          </div>

          {/* Card 5 */}
          <div className="info-card">
            <div className="info-icon-box">
              <MessageSquare size={22} />
            </div>
            <h4 className="info-card-title">Live Chat</h4>
            <p className="info-card-text">
              Available 24/7 for<br />
              premium members
            </p>
          </div>

        </div>

        {/* Main Split Grid (Form Left, Guides & Map Right) */}
        <div className="contact-main-grid">

          {/* Left Column: Form */}
          <div className="contact-form-card">
            <div className="form-header">
              <h3 className="form-title">Send us a Message</h3>
              <p className="form-subtitle">Fill out the form below and we'll get back to you within 24 hours.</p>
            </div>

            {submitted && (
              <div className="submit-success-alert">
                <CheckCircle2 size={18} />
                <span>Thank you! Your message has been sent successfully. We will contact you shortly.</span>
              </div>
            )}

            <form className="contact-form" onSubmit={handleSubmit}>
              
              {/* Row 1: Full Name & Email */}
              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">FULL NAME</label>
                  <div className="form-input-wrap">
                    <User size={18} className="form-icon" />
                    <input 
                      type="text"
                      name="fullName"
                      placeholder="John Doe"
                      className="form-input"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">EMAIL ADDRESS</label>
                  <div className="form-input-wrap">
                    <Mail size={18} className="form-icon" />
                    <input 
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      className="form-input"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Phone & Inquiry Type */}
              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">PHONE NUMBER</label>
                  <div className="form-input-wrap">
                    <Phone size={18} className="form-icon" />
                    <input 
                      type="tel"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      className="form-input"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">INQUIRY TYPE</label>
                  <div className="form-input-wrap">
                    <Compass size={18} className="form-icon" />
                    <select 
                      name="inquiryType"
                      className="form-select"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="booking">Booking & Reservation</option>
                      <option value="tour">Custom Tour Package</option>
                      <option value="hotel">Hotel Accommodation</option>
                      <option value="vehicle">Vehicle Rental</option>
                      <option value="cancellation">Cancellation & Refund</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="form-group">
                <label className="form-label">SUBJECT</label>
                <div className="form-input-wrap">
                  <HelpCircle size={18} className="form-icon" />
                  <input 
                    type="text"
                    name="subject"
                    placeholder="Brief summary of your request"
                    className="form-input"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Message */}
              <div className="form-group">
                <label className="form-label">MESSAGE</label>
                <div className="form-input-wrap" style={{ alignItems: 'flex-start' }}>
                  <MessageSquare size={18} className="form-icon" style={{ marginTop: '0.4rem' }} />
                  <textarea 
                    name="message"
                    placeholder="Please provide as much detail as possible..."
                    className="form-textarea"
                    rows="4"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
              </div>

              {/* Privacy Checkbox */}
              <div 
                className={`checkbox-row ${formData.agreeTerms ? 'checked' : ''}`}
                onClick={handleCheckboxToggle}
              >
                <div className="checkbox-box">
                  {formData.agreeTerms && <CheckSquare size={14} />}
                </div>
                <span className="checkbox-text">
                  I agree to the <Link to="/privacy" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link> and consent to having my data processed to respond to this inquiry.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="form-actions-row">
                <button type="submit" className="send-msg-btn">
                  <Send size={16} />
                  <span>Send Message</span>
                </button>
                <button type="button" className="reset-form-btn" onClick={handleReset}>
                  Reset
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Guides & Map */}
          <div className="contact-right-col">
            
            {/* Quick Help Guides */}
            <div className="quick-guides-section">
              <div className="quick-guides-header">
                <HelpCircle size={20} color="#1d6bf3" />
                <span>Quick Help Guides</span>
              </div>

              <div className="guides-grid">
                
                {/* Guide 1 */}
                <div className="guide-card">
                  <div className="guide-icon-box">
                    <Calendar size={20} />
                  </div>
                  <h4 className="guide-title">Booking Support</h4>
                  <Link to="/faq" className="guide-link">
                    <span>Learn more</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Guide 2 */}
                <div className="guide-card">
                  <div className="guide-icon-box">
                    <Hotel size={20} />
                  </div>
                  <h4 className="guide-title">Hotel Assistance</h4>
                  <Link to="/faq" className="guide-link">
                    <span>Learn more</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Guide 3 */}
                <div className="guide-card">
                  <div className="guide-icon-box">
                    <Car size={20} />
                  </div>
                  <h4 className="guide-title">Vehicle Rentals</h4>
                  <Link to="/faq" className="guide-link">
                    <span>Learn more</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Guide 4 */}
                <div className="guide-card">
                  <div className="guide-icon-box">
                    <CreditCard size={20} />
                  </div>
                  <h4 className="guide-title">Payment Help</h4>
                  <Link to="/faq" className="guide-link">
                    <span>Learn more</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

              </div>
            </div>

            {/* Interactive Map Card */}
            <div className="map-card-box">
              <div className="map-img-wrapper">
                <SmartImage 
                  src="/destination-images/paris.webp" 
                  alt="Head Office location map" 
                  className="map-img"
                  loading="lazy"
                />
              </div>
              <div className="map-content">
                <div>
                  <h4 className="map-title">Head Office</h4>
                  <p className="map-address">
                    123 Horizon Blvd, Suite 400<br />
                    New York, NY 10001, United States
                  </p>
                </div>
                <button className="get-directions-btn">
                  <Navigation size={16} />
                  <span>Get Directions</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Call To Action Banner ("Let's Plan Your Next Adventure Together") */}
        <div className="adventure-cta-banner">
          <h3 className="adventure-cta-title">Let's Plan Your Next Adventure Together</h3>
          <p className="adventure-cta-desc">
            Ready to turn your travel dreams into reality? Connect with our experts today and start building the itinerary of a lifetime.
          </p>
          <div className="adventure-cta-actions">
            <Link to="/packages" className="adventure-btn-primary">Book a Tour Now</Link>
            <Link to="/destinations" className="adventure-btn-secondary">Browse Destinations</Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ContactSection;
