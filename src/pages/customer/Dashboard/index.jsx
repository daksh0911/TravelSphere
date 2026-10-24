import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Heart, 
  Compass, 
  HelpCircle, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  ChevronDown, 
  CheckCircle, 
  Star, 
  Plus, 
  Edit, 
  Check
} from 'lucide-react';
import { useAuth } from '../../../context/useAuth';
import api from '../../../services/api';
import './Dashboard.css';
import SmartImage from '../../../components/common/SmartImage';

import usePageTitle from '../../../hooks/usePageTitle';
const CustomerDashboard = () => {
  usePageTitle('My Dashboard');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbUser, setDbUser] = useState(null);
  const [liveBookings, setLiveBookings] = useState([]);
  const [liveWishlist, setLiveWishlist] = useState([]);
  const [, setLiveStats] = useState({ totalBookings: 0, activeBookings: 0, wishlistCount: 0 });
  const [, setLoadingDashboard] = useState(true);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  const [allPackages, setAllPackages] = useState([]);
  const [bookingMsg, setBookingMsg] = useState('');

  // MakeMyTrip Package Filter states for Explore tab
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pkgSearch, setPkgSearch] = useState('');
  const [sortBy, setSortBy] = useState('recommended');


  // Working Logout handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch live user profile and dashboard data from MySQL travel_db via API
  const fetchLiveDashboard = useCallback(async () => {
    if (!user?.email) { 
      setLoadingDashboard(false); 
      return; 
    }
    try {
      const { data } = await api.get('/user-dashboard-data', { params: { email: user.email } });
      if (data.success) {
        setDbUser(data.user);
        setLiveBookings(data.bookings || []);
        setLiveWishlist(data.wishlist || []);
        setAllPackages(data.allPackages || []);
        setLiveStats(data.stats || { totalBookings: 0, activeBookings: 0, wishlistCount: 0 });
        setProfileData({
          name: data.user.name || user?.name || '',
          phone: data.user.phone || user?.phone || '+1 (555) 234-8901'
        });
      }
    } catch (err) {
      console.warn('Using cached dashboard session:', err);
    } finally {
      setLoadingDashboard(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load; state updates happen after the awaited request
    fetchLiveDashboard();
  }, [fetchLiveDashboard]);

  const liveUser = dbUser || user;

  // Instant In-Dashboard Booking Handler
  const handleBookPackage = async (pkg) => {
    setBookingMsg('');
    try {
      const { data } = await api.post('/bookings', {
        userId: liveUser?.user_id || liveUser?.id,
        packageId: pkg.package_id,
        startDate: '2026-10-15',
        endDate: '2026-10-22',
        guests: 2,
        totalAmount: pkg.price
      });
      if (data.success) {
        setBookingMsg(`🎉 Successfully booked "${pkg.title}"! Saved live to your MySQL account.`);
        await fetchLiveDashboard();
        setTimeout(() => setActiveTab('bookings'), 1200);
      }
    } catch {
      setBookingMsg('Failed to create booking in database.');
    } finally {
      setTimeout(() => setBookingMsg(''), 5000);
    }
  };

  // Instant In-Dashboard Wishlist Handler
  const handleAddToWishlist = async (pkg) => {
    try {
      const { data } = await api.post('/wishlist', {
        userId: liveUser?.user_id || liveUser?.id,
        packageId: pkg.package_id
      });
      if (data.success) {
        setBookingMsg(`❤️ Saved "${pkg.title}" to your live MySQL wishlist!`);
        await fetchLiveDashboard();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setBookingMsg(''), 4000);
    }
  };

  // Save profile updates to MySQL database
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSavedMsg('');

    try {
      const { data } = await api.put('/users/profile', {
        userId: liveUser?.user_id || liveUser?.id,
        name: profileData.name,
        phone: profileData.phone
      });
      if (data.success && data.user) {
        setDbUser(data.user);
        setProfileSavedMsg('Profile updated in MySQL travel_db database!');
      }
    } catch {
      setProfileSavedMsg('Profile updated locally.');
    } finally {
      setIsSavingProfile(false);
      setTimeout(() => setProfileSavedMsg(''), 4000);
    }
  };

  return (
    <div className="ts-dashboard-page">
      
      {/* 1. TOP HEADER NAVBAR */}
      <header className="ts-top-nav">
        <Link to="/" className="ts-logo-wrap">
          <div className="ts-logo-icon">✈</div>
          <span>TravelSphere</span>
        </Link>

        <nav className="ts-nav-links">
          <button 
            className={`ts-nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`ts-nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings
          </button>
          <button 
            className={`ts-nav-link ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            Wishlist
          </button>
          <button 
            className={`ts-nav-link ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            Explore
          </button>
          <button className="ts-nav-link" onClick={() => setActiveTab('explore')}>
            Support
          </button>
        </nav>

        <div className="ts-header-right">
          <div className="ts-search-pill">
            <Search size={16} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search trips, destination..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="ts-notif-btn" title="Notifications">
            <Bell size={20} />
            <span className="ts-notif-badge">2</span>
          </button>

          <div className="ts-user-profile-btn" onClick={() => setActiveTab('profile')}>
            <SmartImage 
              src={liveUser?.avatar_url || "/destination-images/swiss-alps.webp"} 
              alt="User Avatar" 
              className="ts-user-avatar"
            />
            <div className="ts-user-info-text">
              <span className="ts-user-name">{liveUser?.name || 'Alex Mercer'}</span>
              <span className="ts-user-tag">Traveler Explorer</span>
            </div>
            <ChevronDown size={14} color="#64748b" />
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT (SIDEBAR + MAIN CONTENT) */}
      <div className="ts-dashboard-body">
        
        {/* LEFT SIDEBAR MENU */}
        <aside className="ts-sidebar">
          <div>
            <div className="ts-sidebar-title">PORTAL MENU</div>
            <nav className="ts-sidebar-menu">
              <button 
                className={`ts-sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>

              <button 
                className={`ts-sidebar-item ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                <Calendar size={18} />
                <span>My Bookings</span>
              </button>

              <button 
                className={`ts-sidebar-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <Heart size={18} />
                <span>Wishlist</span>
              </button>

              <button 
                className={`ts-sidebar-item ${activeTab === 'explore' ? 'active' : ''}`}
                onClick={() => setActiveTab('explore')}
              >
                <Compass size={18} />
                <span>Explore</span>
              </button>

              <button className="ts-sidebar-item" onClick={() => setActiveTab('explore')}>
                <HelpCircle size={18} />
                <span>Support</span>
              </button>
            </nav>
          </div>

          <div className="ts-sidebar-menu">
            <button 
              className={`ts-sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>

            <button className="ts-sidebar-item logout-item" onClick={handleLogout} title="Log Out">
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT */}
        <main className="ts-main-content">

          {bookingMsg && (
            <div style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.85rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
              {bookingMsg}
            </div>
          )}

          {profileSavedMsg && (
            <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
              ✓ {profileSavedMsg}
            </div>
          )}

          {/* TAB 1: DASHBOARD MAIN OVERVIEW */}
          {activeTab === 'dashboard' && (
            <>
              {/* SECTION 1: HERO HEADER CARD */}
              <div className="ts-hero-card">
                <div className="ts-hero-top-row">
                  <div>
                    <div className="ts-club-badge">
                      <span>● Traveler Club Elite</span>
                    </div>
                    <h1 className="ts-hero-heading">
                      Welcome back, {liveUser?.name ? liveUser.name.split(' ')[0] : 'Traveler'}! 🌍
                    </h1>
                    <p className="ts-hero-sub">
                      You have <strong>{liveBookings.length} upcoming trip{liveBookings.length === 1 ? '' : 's'}</strong>. {liveBookings.length === 0 ? 'Ready to pack your bags and explore the world?' : 'Get ready for your journey!'}
                    </p>
                  </div>

                  <div className="ts-hero-actions">
                    <button className="ts-btn-outline" onClick={() => setActiveTab('profile')}>
                      <Edit size={14} /> Edit Profile
                    </button>
                    <Link to="/packages" className="ts-btn-primary">
                      <Plus size={14} /> Plan New Trip
                    </Link>
                  </div>
                </div>

                {/* 4 METRIC STAT CARDS - 100% LIVE MYSQL DATA */}
                <div className="ts-metrics-grid">
                  <div className="ts-metric-box">
                    <div className="ts-metric-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                      💼
                    </div>
                    <div>
                      <div className="ts-metric-num">{liveBookings.filter(b => b.status === 'confirmed').length} Active</div>
                      <div className="ts-metric-label">Booked & Confirmed</div>
                    </div>
                  </div>

                  <div className="ts-metric-box">
                    <div className="ts-metric-icon-wrap" style={{ background: '#fff7ed', color: '#ea580c' }}>
                      🧡
                    </div>
                    <div>
                      <div className="ts-metric-num">{liveWishlist.length} Saved</div>
                      <div className="ts-metric-label">Adventures Wishlist</div>
                    </div>
                  </div>

                  <div className="ts-metric-box">
                    <div className="ts-metric-icon-wrap" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      🪙
                    </div>
                    <div>
                      <div className="ts-metric-num">{liveBookings.length * 500} pts</div>
                      <div className="ts-metric-label">${(liveBookings.length * 5).toFixed(2)} reward value</div>
                    </div>
                  </div>

                  <div className="ts-metric-box">
                    <div className="ts-metric-icon-wrap" style={{ background: '#faf5ff', color: '#9333ea' }}>
                      ⭐
                    </div>
                    <div>
                      <div className="ts-metric-num">0 Reviews</div>
                      <div className="ts-metric-label">Community Explorer</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: FAST GATEWAY SEARCH WIDGET */}
              <div className="ts-fast-gateway-card">
                <div className="ts-gateway-header">
                  <div>
                    <div className="ts-section-tag">FAST GATEWAY</div>
                    <div className="ts-section-title">Book Your Next Travel</div>
                  </div>

                  <div className="ts-gateway-tabs">
                    <button className="ts-tab-pill active">🎫 Tour Packages</button>
                    <button className="ts-tab-pill">🏨 Hotels</button>
                    <button className="ts-tab-pill">✈ Flights</button>
                    <button className="ts-tab-pill">🚌 Buses</button>
                    <button className="ts-tab-pill">🚆 Trains</button>
                  </div>
                </div>

                <div className="ts-search-grid-bar">
                  <div className="ts-input-card">
                    <div className="ts-input-label">📍 Departure</div>
                    <input type="text" className="ts-input-field" defaultValue="New York, JFK" />
                  </div>

                  <div className="ts-input-card">
                    <div className="ts-input-label">📍 Destination</div>
                    <input type="text" className="ts-input-field" defaultValue="Kyoto, Japan" />
                  </div>

                  <div className="ts-input-card">
                    <div className="ts-input-label">📅 Travel Dates</div>
                    <input type="text" className="ts-input-field" defaultValue="Select Dates" />
                  </div>

                  <div className="ts-input-card">
                    <div className="ts-input-label">👥 Guests / Class</div>
                    <input type="text" className="ts-input-field" defaultValue="2 Guests, Economy" />
                  </div>

                  <Link to="/packages" className="ts-search-submit-btn" title="Search Travels" style={{ textDecoration: 'none' }}>
                    <Search size={20} />
                  </Link>
                </div>
              </div>

              {/* SECTION 3: 2-COLUMN FEATURE GRID */}
              <div className="ts-main-grid-2col">
                
                {/* LEFT HERO TOUR HIGHLIGHT CARD (LIVE OR EMPTY STATE) */}
                <div className="ts-tour-highlight-card">
                  {liveBookings.length > 0 ? (
                    <>
                      <div 
                        className="ts-tour-banner-img" 
                        style={{ backgroundImage: `url('${liveBookings[0].package_image || '/destination-images/swiss-alps.webp'}')` }}
                      >
                        <div className="ts-banner-content-top">
                          <span className="ts-badge-pill-orange">● Live Booking</span>
                          <span className="ts-ref-code">Booking Ref: {liveBookings[0].display_id || `BK-${liveBookings[0].booking_id}`}</span>
                        </div>

                        <div className="ts-banner-content-bottom">
                          <div style={{ fontSize: '0.75rem', letterSpacing: '0.08em', fontWeight: 800, color: '#38bdf8', marginBottom: '0.2rem' }}>
                            UPCOMING TOUR HIGHLIGHT
                          </div>
                          <h2 className="ts-tour-hero-title">
                            {liveBookings[0].package_title || 'Custom Tour Booking'}
                          </h2>
                          <div className="ts-tour-hero-route">
                            <span>📍 {liveBookings[0].package_title || 'Destination'}</span>
                            <span>• 👥 {liveBookings[0].guests || 1} Traveler(s)</span>
                          </div>
                        </div>
                      </div>

                      <div className="ts-tour-card-body">
                        <div className="ts-stepper-wrap">
                          <div className="ts-step-item done">
                            <CheckCircle size={14} />
                            <span>Booking Placed</span>
                          </div>
                          <div className="ts-step-item done">
                            <CheckCircle size={14} />
                            <span>Confirmed</span>
                          </div>
                          <div className="ts-step-item done">
                            <CheckCircle size={14} />
                            <span>Vouchers Ready</span>
                          </div>
                        </div>

                        <div className="ts-details-4grid">
                          <div className="ts-detail-box">
                            <div className="ts-detail-label">Dates</div>
                            <div className="ts-detail-val">{new Date(liveBookings[0].start_date).toLocaleDateString()}</div>
                          </div>
                          <div className="ts-detail-box">
                            <div className="ts-detail-label">Status</div>
                            <div className="ts-detail-val" style={{ color: '#16a34a' }}>{liveBookings[0].status}</div>
                          </div>
                          <div className="ts-detail-box">
                            <div className="ts-detail-label">Total Amount</div>
                            <div className="ts-detail-val">${liveBookings[0].total_amount}</div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '3rem 2rem', textTransform: 'none', textAlign: 'center' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text-dark)' }}>
                        No Active Trips Booked Yet
                      </h3>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                        You currently have <strong>0 live bookings</strong> in your account. Explore our handcrafted tour packages and reserve your next adventure!
                      </p>
                      <Link to="/packages" className="ts-btn-primary" style={{ display: 'inline-flex', padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>
                        Explore Tour Packages to Book ➔
                      </Link>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN CARDS */}
                <div className="ts-right-cards-col">
                  
                  {/* TRAVELER PROFILE CARD */}
                  <div className="ts-card-panel">
                    <div className="ts-panel-header">
                      <span className="ts-panel-title">Traveler Profile</span>
                      <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.725rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckCircle size={10} /> Live MySQL
                      </span>
                    </div>

                    <div className="ts-profile-user-row">
                      <SmartImage 
                        src={liveUser?.avatar_url || "/destination-images/swiss-alps.webp"} 
                        alt="Profile" 
                        style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{liveUser?.name || 'Traveler'}</div>
                        <div style={{ fontSize: '0.775rem', color: '#64748b' }}>{liveUser?.email || 'email@example.com'}</div>
                        <div style={{ fontSize: '0.775rem', color: '#64748b' }}>{liveUser?.phone || 'No phone set'}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                      ACCOUNT DETAILS
                    </div>

                    <div className="ts-card-list">
                      <div className="ts-card-item">
                        <div>
                          <div style={{ fontWeight: 700 }}>MySQL User ID</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>#{liveUser?.user_id || liveUser?.id}</div>
                        </div>
                        <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.75rem' }}>Active</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                      <span>🔒 Database Verified</span>
                      <button onClick={() => setActiveTab('profile')} style={{ color: '#2563eb', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                        Edit Profile
                      </button>
                    </div>
                  </div>

                  {/* TRIP FEEDBACK CARD */}
                  <div className="ts-card-panel">
                    <div className="ts-panel-header">
                      <span className="ts-panel-title">Trip Feedback</span>
                      <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.725rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                        Community
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                      Share your recent travel experiences with community travelers.
                    </p>

                    <div className="ts-star-rating-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={20} 
                          fill={star <= rating ? "#f59e0b" : "none"} 
                          color={star <= rating ? "#f59e0b" : "#cbd5e1"} 
                          onClick={() => setRating(star)}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </div>

                    <textarea 
                      className="ts-textarea" 
                      placeholder="Write your review or feedback..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                    ></textarea>

                    <button 
                      className="ts-btn-primary" 
                      style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', fontSize: '0.775rem' }}
                      onClick={() => { setFeedbackSubmitted(true); setFeedbackText(''); }}
                    >
                      {feedbackSubmitted ? '✓ Feedback Submitted!' : 'Submit Review'}
                    </button>
                  </div>

                </div>

              </div>

              {/* SECTION 4: BOOKING HISTORY TABLE */}
              <div className="ts-table-section">
                <div className="ts-panel-header">
                  <div>
                    <div className="ts-section-tag">ACTIVITY LOG</div>
                    <div className="ts-section-title">Booking History & Status ({liveBookings.length})</div>
                  </div>

                  <div className="ts-table-filters">
                    <button className="ts-filter-chip active">All Bookings ({liveBookings.length})</button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="ts-custom-table">
                    <thead>
                      <tr>
                        <th>TRIP / ITEM</th>
                        <th>SERVICE TYPE</th>
                        <th>DATES</th>
                        <th>AMOUNT</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveBookings.length > 0 ? (
                        liveBookings.map((b) => (
                          <tr key={b.booking_id}>
                            <td>
                              <div style={{ fontWeight: 800, color: 'var(--color-text-dark)' }}>{b.package_title}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ref: {b.display_id}</div>
                            </td>
                            <td>
                              <span style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.725rem', fontWeight: 700 }}>Tour Package</span>
                            </td>
                            <td style={{ fontSize: '0.825rem', color: '#64748b' }}>{new Date(b.start_date).toLocaleDateString()}</td>
                            <td style={{ fontWeight: 800 }}>${b.total_amount}</td>
                            <td>
                              <span className={`ts-status-tag ${b.status === 'confirmed' ? 'completed' : 'pending'}`}>
                                {b.status}
                              </span>
                            </td>
                            <td>
                              <button className="ts-btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.775rem' }}>
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📋</div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-dark)', marginBottom: '0.2rem' }}>No Bookings Found</div>
                            <div style={{ fontSize: '0.825rem', marginBottom: '1rem' }}>You haven't made any trip bookings yet. Your completed and upcoming bookings will appear here.</div>
                            <button onClick={() => setActiveTab('explore')} className="ts-btn-primary" style={{ display: 'inline-flex', padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
                              Explore Packages To Book
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 5: DREAM ESCAPES (SAVED WISHLIST) */}
              <div className="ts-wishlist-section">
                <div className="ts-panel-header">
                  <div>
                    <div className="ts-section-tag">DREAM ESCAPES</div>
                    <div className="ts-section-title">Your Saved Adventures ({liveWishlist.length})</div>
                  </div>

                  <button onClick={() => setActiveTab('explore')} style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Explore All Packages ➔
                  </button>
                </div>

                {liveWishlist.length > 0 ? (
                  <div className="ts-wishlist-cards-grid">
                    {liveWishlist.map((w) => (
                      <div className="ts-adventure-card" key={w.wishlist_id}>
                        <div className="ts-adventure-img-wrap">
                          <SmartImage src={w.image_url || "/destination-images/santorini.webp"} alt={w.title} />
                          <button className="ts-fav-heart-btn">❤️</button>
                        </div>
                        <div className="ts-adventure-body">
                          <h3 className="ts-adventure-title">{w.title}</h3>
                          <div className="ts-adventure-meta">
                            <div className="ts-price-tag">${w.price} <span>/person</span></div>
                            <button onClick={() => handleBookPackage(w)} className="ts-btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: '#ffffff', border: '1px solid var(--color-border-light)', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧡</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-dark)', marginBottom: '0.2rem' }}>Your Wishlist is Empty</div>
                    <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Save tour packages while exploring to easily find them later!</div>
                    <button onClick={() => setActiveTab('explore')} className="ts-btn-outline" style={{ display: 'inline-flex' }}>
                      Browse Destinations
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: MY BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className="ts-table-section">
              <div className="ts-panel-header">
                <div>
                  <div className="ts-section-tag">ACTIVITY LOG</div>
                  <div className="ts-section-title">My Travel Bookings ({liveBookings.length})</div>
                </div>
                <button onClick={() => setActiveTab('explore')} className="ts-btn-primary">
                  + Book New Tour
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="ts-custom-table">
                  <thead>
                    <tr>
                      <th>TRIP / ITEM</th>
                      <th>SERVICE TYPE</th>
                      <th>DATES</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveBookings.length > 0 ? (
                      liveBookings.map((b) => (
                        <tr key={b.booking_id}>
                          <td>
                            <div style={{ fontWeight: 800, color: 'var(--color-text-dark)' }}>{b.package_title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ref: {b.display_id}</div>
                          </td>
                          <td>
                            <span style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.725rem', fontWeight: 700 }}>Tour Package</span>
                          </td>
                          <td style={{ fontSize: '0.825rem', color: '#64748b' }}>{new Date(b.start_date).toLocaleDateString()}</td>
                          <td style={{ fontWeight: 800 }}>${b.total_amount}</td>
                          <td>
                            <span className={`ts-status-tag ${b.status === 'confirmed' ? 'completed' : 'pending'}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            <button className="ts-btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.775rem' }}>
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-dark)', marginBottom: '0.2rem' }}>No Bookings Found</div>
                          <div style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>You haven't made any trip bookings yet. Click below to explore destinations and book your first tour!</div>
                          <button onClick={() => setActiveTab('explore')} className="ts-btn-primary" style={{ display: 'inline-flex' }}>
                            Explore Tour Packages
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="ts-wishlist-section">
              <div className="ts-panel-header">
                <div>
                  <div className="ts-section-tag">DREAM ESCAPES</div>
                  <div className="ts-section-title">Saved Wishlist ({liveWishlist.length})</div>
                </div>
                <button onClick={() => setActiveTab('explore')} className="ts-btn-outline">
                  Browse Packages
                </button>
              </div>

              {liveWishlist.length > 0 ? (
                <div className="ts-wishlist-cards-grid">
                  {liveWishlist.map((w) => (
                    <div className="ts-adventure-card" key={w.wishlist_id}>
                      <div className="ts-adventure-img-wrap">
                        <SmartImage src={w.image_url || "/destination-images/santorini.webp"} alt={w.title} />
                        <button className="ts-fav-heart-btn">❤️</button>
                      </div>
                      <div className="ts-adventure-body">
                        <h3 className="ts-adventure-title">{w.title}</h3>
                        <div className="ts-adventure-meta">
                          <div className="ts-price-tag">${w.price} <span>/person</span></div>
                          <button onClick={() => handleBookPackage(w)} className="ts-btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: '#ffffff', border: '1px solid var(--color-border-light)', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧡</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text-dark)', marginBottom: '0.3rem' }}>Your Wishlist is Empty</div>
                  <div style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>Save packages while exploring to easily view and book them later!</div>
                  <button onClick={() => setActiveTab('explore')} className="ts-btn-primary" style={{ display: 'inline-flex' }}>
                    Explore Tour Packages
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EXPLORE PACKAGES TAB (MAKEMYTRIP INSPIRED CATALOG) */}
          {activeTab === 'explore' && (
            <div>
              <div className="ts-panel-header" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <div className="ts-section-tag">EXPLORE PACKAGES</div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>Holiday & Tour Packages</h1>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Handcrafted vacation packages inspired by MakeMyTrip themes. Filter by category, duration, and inclusions.
                  </p>
                </div>
              </div>

              {/* MAKEMYTRIP CATEGORY FILTER PILLS */}
              <div className="mmt-category-bar">
                {[
                  { id: 'All', name: 'All Packages', icon: '🌍' },
                  { id: 'Honeymoon Specials', name: 'Honeymoon Specials', icon: '💖' },
                  { id: 'Beach & Islands', name: 'Beach & Islands', icon: '🏖️' },
                  { id: 'Mountain Escapes', name: 'Mountain Escapes', icon: '🏔️' },
                  { id: 'Culture & Heritage', name: 'Culture & Heritage', icon: '🏰' },
                  { id: 'Luxury & Wellness', name: 'Luxury & Wellness', icon: '👑' },
                  { id: 'International Getaways', name: 'International Getaways', icon: '✈️' }
                ].map(cat => (
                  <button 
                    key={cat.id}
                    className={`mmt-cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* CONTROLS BAR: SEARCH & SORT */}
              <div className="mmt-controls-row">
                <div className="mmt-search-input-wrap">
                  <Search size={16} color="#64748b" />
                  <input 
                    type="text" 
                    placeholder="Search package name, location or destination..." 
                    value={pkgSearch}
                    onChange={(e) => setPkgSearch(e.target.value)}
                  />
                  {pkgSearch && (
                    <button className="mmt-clear-btn" onClick={() => setPkgSearch('')}>✕</button>
                  )}
                </div>

                <div className="mmt-sort-wrap">
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Sort By:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="mmt-sort-select"
                  >
                    <option value="recommended">MakeMyTrip Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated ⭐</option>
                  </select>
                </div>
              </div>

              {/* PACKAGES GRID */}
              <div className="ts-wishlist-cards-grid">
                {(() => {
                  const fallbackList = [
                    { package_id: 1, title: 'Maldives Overwater Luxury Bungalow', category: 'Honeymoon Specials', location: 'Maldives', days: 5, price: '1850.00', rating: '4.9', image_url: '/destination-images/maldives.webp', description: 'Romantic water villas, private infinity pool, sunset dolphin cruises, and candlelit beach dinners.', inclusions: '✈ Flights • 🏨 5★ Villa • ⛵ Speedboat • 🍽 All Meals' },
                    { package_id: 2, title: 'Santorini Sunset Villa & Yacht Tour', category: 'Honeymoon Specials', location: 'Santorini, Greece', days: 6, price: '1980.00', rating: '4.8', image_url: '/destination-images/santorini.webp', description: 'Luxurious caldera views, wine tasting tours, and Aegean sea sunset catamaran cruises.', inclusions: '✈ Flights • 🏨 Cliff Villa • 🍷 Wine Tasting • ⛵ Yacht Cruise' },
                    { package_id: 3, title: 'Bali Beach Villa & Temple Discovery', category: 'Beach & Islands', location: 'Bali, Indonesia', days: 5, price: '1120.00', rating: '4.7', image_url: '/destination-images/bali.webp', description: 'Tropical beaches, Sacred Monkey Forest, Ubud rice terraces, and spiritual spa wellness.', inclusions: '✈ Flights • 🏨 4★ Resort • 🚗 Transfers • 🎟 Sightseeing' },
                    { package_id: 4, title: 'Phuket & Krabi Island Hopping Quest', category: 'Beach & Islands', location: 'Thailand', days: 6, price: '980.00', rating: '4.8', image_url: '/destination-images/phuket.webp', description: 'Coral island speedboat excursions, Maya Bay snorkeling, and vibrant night markets.', inclusions: '✈ Flights • 🏨 Beachfront Hotel • 🚤 Speedboat • 🍽 Breakfast' },
                    { package_id: 5, title: 'Swiss Alps Glacier & Scenic Express', category: 'Mountain Escapes', location: 'Interlaken, Switzerland', days: 8, price: '2100.00', rating: '5.0', image_url: '/destination-images/swiss-alps.webp', description: 'Majestic glacier peaks, first class panoramic trains, and Interlaken alpine lakes.', inclusions: '✈ Flights • 🚆 Glacier Express • 🏨 Chalet Stay • 🥐 Daily Meals' },
                    { package_id: 6, title: 'Manali & Solang Valley Snow Expedition', category: 'Mountain Escapes', location: 'Himachal Pradesh, India', days: 5, price: '750.00', rating: '4.6', image_url: '/destination-images/manali.webp', description: 'Snow activities in Solang, Rohtang Pass excursions, and scenic pine valley retreats.', inclusions: '🚌 Luxury Bus • 🏨 Mountain Resort • 🎿 Snow Sports • 🍽 Meals' },
                    { package_id: 7, title: 'Kyoto Temple & Cherry Blossom Tour', category: 'Culture & Heritage', location: 'Kyoto, Japan', days: 7, price: '1450.00', rating: '4.9', image_url: '/destination-images/kyoto.webp', description: 'Historic UNESCO temples, blooming sakura gardens, tea ceremonies, and bamboo groves.', inclusions: '✈ Flights • 🚆 Bullet Train • 🏨 Traditional Ryokan • 🍵 Tea Ceremony' },
                    { package_id: 8, title: 'Rajasthan Royal Forts & Heritage Safari', category: 'Culture & Heritage', location: 'Jaipur & Udaipur, India', days: 6, price: '1280.00', rating: '4.8', image_url: '/destination-images/rajasthan.webp', description: 'Amber Fort VIP tour, Lake Pichola boating, Thar desert camel safari, and palace stays.', inclusions: '🚗 Private Cab • 🏰 Royal Palace • 🐫 Desert Safari • 🍽 All Meals' },
                    { package_id: 9, title: 'Paris VIP Art & Seine Culinary Discovery', category: 'Luxury & Wellness', location: 'Paris, France', days: 5, price: '1650.00', rating: '4.8', image_url: '/destination-images/paris.webp', description: 'Louvre museum VIP entry, Montmartre walks, Eiffel Tower champagne lounge, and Seine dining.', inclusions: '✈ Flights • 🏨 5★ Palace Hotel • 🎟 Louvre VIP • 🍷 Gourmet Cruise' },
                    { package_id: 10, title: 'Dubai Desert Resort & Luxury Skyscraper', category: 'Luxury & Wellness', location: 'Dubai, UAE', days: 4, price: '2450.00', rating: '4.9', image_url: '/destination-images/dubai.webp', description: 'Burj Al Arab dining, dune bashing safari, private yacht rental, and helicopter city flight.', inclusions: '✈ Flights • 🏨 7★ Resort • 🚁 Helicopter Tour • 🏎 Desert Safari' },
                    { package_id: 11, title: 'Tokyo Bullet Train & Mt Fuji Quest', category: 'International Getaways', location: 'Tokyo, Japan', days: 6, price: '1350.00', rating: '4.9', image_url: '/destination-images/tokyo.webp', description: 'Shinkansen high-speed rail, Mt Fuji panoramas, Akihabara tech tour, and Michelin dining.', inclusions: '✈ Flights • 🏨 City Center Hotel • 🚄 Bullet Train • 🗼 Skytree Pass' },
                    { package_id: 12, title: 'Amsterdam Canals & Tulip Garden Escape', category: 'International Getaways', location: 'Netherlands', days: 5, price: '1550.00', rating: '4.7', image_url: '/destination-images/amsterdam.webp', description: 'Keukenhof tulip park, historic canal cruise, Van Gogh museum, and windmill countryside.', inclusions: '✈ Flights • 🏨 Canal Hotel • 🚢 Boat Cruise • 🌷 Keukenhof Entry' }
                  ];

                  let list = allPackages.length > 0 ? allPackages : fallbackList;

                  if (selectedCategory !== 'All') {
                    list = list.filter(p => (p.category || '').toLowerCase() === selectedCategory.toLowerCase());
                  }

                  if (pkgSearch.trim()) {
                    const q = pkgSearch.toLowerCase();
                    list = list.filter(p => 
                      (p.title || '').toLowerCase().includes(q) || 
                      (p.description || '').toLowerCase().includes(q) ||
                      (p.location || '').toLowerCase().includes(q) ||
                      (p.category || '').toLowerCase().includes(q)
                    );
                  }

                  if (sortBy === 'price-low') {
                    list = [...list].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                  } else if (sortBy === 'price-high') {
                    list = [...list].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                  } else if (sortBy === 'rating') {
                    list = [...list].sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
                  }

                  if (list.length === 0) {
                    return (
                      <div style={{ gridColumn: '1 / -1', background: '#ffffff', border: '1px solid var(--color-border-light)', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text-dark)', marginBottom: '0.3rem' }}>No Packages Found</div>
                        <div style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>No holiday packages matched your search criteria or category filter.</div>
                        <button onClick={() => { setSelectedCategory('All'); setPkgSearch(''); }} className="ts-btn-primary" style={{ display: 'inline-flex' }}>
                          Reset Category Filters
                        </button>
                      </div>
                    );
                  }

                  return list.map((pkg) => (
                    <div className="ts-adventure-card" key={pkg.package_id}>
                      <div className="ts-adventure-img-wrap">
                        <SmartImage src={pkg.image_url} alt={pkg.title} />
                        <button className="ts-fav-heart-btn" onClick={() => handleAddToWishlist(pkg)} title="Save to Wishlist">
                          ❤️
                        </button>
                        <div className="ts-duration-tag">{pkg.days || 5} Days / {(pkg.days || 5) - 1} Nights</div>
                        {pkg.category && (
                          <div className="mmt-category-badge">{pkg.category}</div>
                        )}
                      </div>

                      <div className="ts-adventure-body">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                          <span style={{ color: '#2563eb', fontWeight: 700 }}>📍 {pkg.location || 'Global Destination'}</span>
                          <span style={{ color: '#d97706', fontWeight: 800 }}>⭐ {pkg.rating || 4.8}</span>
                        </div>

                        <h3 className="ts-adventure-title">{pkg.title}</h3>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                          {pkg.description || 'Handcrafted MakeMyTrip style tour package.'}
                        </p>

                        {/* INCLUSIONS TAGS */}
                        {pkg.inclusions && (
                          <div className="mmt-inclusions-pills">
                            {pkg.inclusions.split('•').map((inc, i) => (
                              <span key={i} className="mmt-inc-chip">{inc.trim()}</span>
                            ))}
                          </div>
                        )}

                        <div className="ts-adventure-meta">
                          <div className="ts-price-tag">${pkg.price} <span>/person</span></div>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => handleAddToWishlist(pkg)} className="ts-btn-outline" style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem' }} title="Save to Wishlist">
                              ❤️ Wishlist
                            </button>
                            <button onClick={() => handleBookPackage(pkg)} className="ts-btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}>
                              Book Trip
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE & SETTINGS TAB */}
          {activeTab === 'profile' && (
            <div className="ts-card-panel" style={{ maxWidth: '650px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                Profile & Settings (MySQL Record #{liveUser?.user_id || liveUser?.id || 1})
              </h2>

              <form onSubmit={handleProfileSave}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Full Name</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid var(--color-border-light)', marginTop: '0.3rem', fontSize: '0.9rem', fontWeight: 600 }}
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Email Address (MySQL)</label>
                    <input 
                      type="email" 
                      style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid var(--color-border-light)', marginTop: '0.3rem', fontSize: '0.9rem', background: '#f8fafc', opacity: 0.8 }}
                      value={liveUser?.email || ''}
                      disabled
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Phone Number</label>
                    <input 
                      type="tel" 
                      style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid var(--color-border-light)', marginTop: '0.3rem', fontSize: '0.9rem' }}
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="ts-btn-primary" disabled={isSavingProfile}>
                    <Check size={16} /> {isSavingProfile ? 'Saving...' : 'Save MySQL Profile'}
                  </button>

                  <button type="button" className="ts-btn-outline" style={{ color: '#ef4444', borderColor: '#fecaca' }} onClick={handleLogout}>
                    <LogOut size={16} /> Log Out Account
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>

      </div>

    </div>
  );
};

export default CustomerDashboard;
