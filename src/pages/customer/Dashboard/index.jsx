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
  Check,
  FileDown,
  Ticket,
  RotateCcw,
  Trash2,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import TearTicket from '../../../components/common/TearTicket';
import { TicketBoardingPassBody, TicketBoardingPassStub } from '../../../components/common/TicketBoardingPass';
import { useAuth } from '../../../context/useAuth';
import api from '../../../services/api';
import './Dashboard.css';
import SmartImage from '../../../components/common/SmartImage';
import { generateBookingPDF } from '../../../utils/pdfVoucher';
import { COUNTRIES, sanitizeFullName, sanitizePhoneDigits } from '../../../utils/countryPhoneConfig';

import usePageTitle from '../../../hooks/usePageTitle';
import { useCurrency } from '../../../context/useCurrency';

// Offline fallback generators defined outside component scope for purity
const createFallbackBooking = (pkg) => ({
  booking_id: Date.now(),
  display_id: '#TS-' + Math.floor(100000 + Math.random() * 900000),
  package_title: pkg?.title || 'Tour Booking',
  destination_name: pkg?.location || 'Global Destination',
  departure_city: 'Zurich Intl',
  travel_date: '2026-11-20',
  start_date: '2026-11-20',
  end_date: '2026-11-27',
  guests: 2,
  total_amount: pkg?.price || 1200,
  booking_status: 'Confirmed',
  status: 'confirmed',
  package_image: pkg?.image_url || pkg?.imageUrl || '/destination-images/swiss-alps.webp'
});

const createFallbackWishlistItem = (pkg) => ({
  wishlist_id: Date.now(),
  package_id: pkg?.package_id || pkg?.id,
  title: pkg?.title,
  price: pkg?.price,
  image_url: pkg?.image_url || pkg?.imageUrl || '/destination-images/santorini.webp'
});

const createFallbackReview = (pkgTitle, rating, comment) => ({
  review_id: Date.now(),
  package_title: pkgTitle,
  rating,
  comment,
  created_at: new Date().toISOString()
});

const CustomerDashboard = () => {
  usePageTitle('My Dashboard');
  const { user, logout } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbUser, setDbUser] = useState(null);
  const [liveBookings, setLiveBookings] = useState([]);
  const [liveWishlist, setLiveWishlist] = useState([]);
  const [, setLiveStats] = useState({ totalBookings: 0, activeBookings: 0, wishlistCount: 0 });
  const [, setLoadingDashboard] = useState(true);
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', packageId: '' });
  const [reviewStatusMsg, setReviewStatusMsg] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Quick feedback on dashboard overview
  const [overviewRating, setOverviewRating] = useState(5);
  const [overviewComment, setOverviewComment] = useState('');
  const [overviewSubmitted, setOverviewSubmitted] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Profile edit state
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileCountryCode, setProfileCountryCode] = useState('+91');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: ''
  });
  const [profileSavedMsg, setProfileSavedMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  const [allPackages, setAllPackages] = useState([]);
  const [bookingMsg, setBookingMsg] = useState('');
  const [ticketTorn, setTicketTorn] = useState(false);

  // MakeMyTrip Package Filter states for Explore tab
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pkgSearch, setPkgSearch] = useState('');
  const [sortBy, setSortBy] = useState('recommended');

  const activeCountry = COUNTRIES.find(c => c.code === profileCountryCode) || COUNTRIES[0];

  // Working Logout handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch live user profile and dashboard data from backend API
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
        setReviews(data.reviews || []);
        setNotifications(data.notifications || []);
        setLiveStats(data.stats || { totalBookings: 0, activeBookings: 0, wishlistCount: 0 });

        // Parse country code and phone number
        const rawPhone = data.user.phone || user?.phone || '';
        const matchedCountry = COUNTRIES.find(c => rawPhone.startsWith(c.code)) || COUNTRIES[0];
        setProfileCountryCode(matchedCountry.code);
        setProfileData({
          name: data.user.name || user?.name || '',
          phone: rawPhone ? rawPhone.replace(matchedCountry.code, '').replace(/\D/g, '').slice(0, matchedCountry.digits) : '9876543210'
        });
      }
    } catch (err) {
      console.warn('Using cached dashboard session:', err);
      try {
        const localRequests = JSON.parse(localStorage.getItem('ts_trip_requests') || '[]');
        const fallbackBookings = localRequests.length > 0 ? localRequests.map((r, i) => ({
          booking_id: r.id || (101 + i),
          display_id: r.id ? ('#' + r.id) : ('#TS-' + (772918 + i)),
          package_title: r.packageTitle || r.destination || 'Swiss Alps Scenic Glacier Express',
          destination_name: r.destination || 'Interlaken, Switzerland',
          departure_city: 'Zurich Intl',
          travel_date: r.startDate || '2026-11-18',
          start_date: r.startDate || '2026-11-18',
          end_date: r.endDate || '2026-11-25',
          guests: r.guests || 2,
          total_amount: r.amount || 1985,
          booking_status: r.status || 'Confirmed',
          package_image: '/destination-images/swiss-alps.webp'
        })) : [
          {
            booking_id: 101,
            display_id: '#TS-772918',
            package_title: 'Swiss Alps Scenic Glacier Express',
            destination_name: 'Interlaken, Switzerland',
            departure_city: 'Zurich Intl',
            travel_date: '2026-11-18',
            start_date: '2026-11-18',
            end_date: '2026-11-25',
            guests: 2,
            total_amount: 1985,
            booking_status: 'Confirmed',
            package_image: '/destination-images/swiss-alps.webp'
          }
        ];
        setLiveBookings(fallbackBookings);
        setLiveStats({
          totalBookings: fallbackBookings.length,
          activeBookings: fallbackBookings.length,
          wishlistCount: 2
        });
      } catch { /* ignore fallback */ }
    } finally {
      setLoadingDashboard(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load; state updates happen after the awaited request
    fetchLiveDashboard();
  }, [fetchLiveDashboard]);

  const liveUser = dbUser || user;
  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  // In-Dashboard Booking Handler
  const handleBookPackage = async (pkg) => {
    setBookingMsg('');
    const newBooking = createFallbackBooking(pkg);

    try {
      const { data } = await api.post('/bookings', {
        userId: liveUser?.user_id || liveUser?.id,
        packageId: pkg.package_id || pkg.id,
        startDate: '2026-11-20',
        endDate: '2026-11-27',
        guests: 2,
        totalAmount: pkg.price || 1200
      });
      if (data.success) {
        setBookingMsg(`🎉 Successfully booked "${pkg.title}"! Saved to your account.`);
        await fetchLiveDashboard();
        setTimeout(() => setActiveTab('bookings'), 1200);
        return;
      }
    } catch {
      /* Fallback to local persistence so booking is never lost */
    }

    setLiveBookings(prev => [newBooking, ...prev]);
    try {
      const localRequests = JSON.parse(localStorage.getItem('ts_trip_requests') || '[]');
      localRequests.unshift({
        id: newBooking.display_id,
        packageTitle: newBooking.package_title,
        destination: newBooking.destination_name,
        startDate: newBooking.start_date,
        endDate: newBooking.end_date,
        guests: newBooking.guests,
        amount: newBooking.total_amount,
        status: 'Confirmed'
      });
      localStorage.setItem('ts_trip_requests', JSON.stringify(localRequests));
    } catch {
      /* ignore */
    }
    setBookingMsg(`🎉 Successfully booked "${pkg.title}"! Vouchers are ready in your account.`);
    setTimeout(() => setActiveTab('bookings'), 1200);
    setTimeout(() => setBookingMsg(''), 5000);
  };

  // Wishlist Handlers (Add & Remove)
  const handleAddToWishlist = async (pkg) => {
    const pkgId = pkg.package_id || pkg.id;
    const isAlready = liveWishlist.some(w => (w.package_id || w.id) === pkgId);
    if (isAlready) {
      await handleRemoveFromWishlist(pkgId);
      return;
    }

    const newWish = createFallbackWishlistItem(pkg);

    try {
      const { data } = await api.post('/wishlist', {
        userId: liveUser?.user_id || liveUser?.id,
        packageId: pkgId
      });
      if (data.success) {
        setBookingMsg(`❤️ Saved "${pkg.title}" to your wishlist!`);
        await fetchLiveDashboard();
        setTimeout(() => setBookingMsg(''), 4000);
        return;
      }
    } catch {
      /* Fallback to state */
    }

    setLiveWishlist(prev => [newWish, ...prev.filter(w => (w.package_id || w.id) !== pkgId)]);
    setBookingMsg(`❤️ Saved "${pkg.title}" to your wishlist!`);
    setTimeout(() => setBookingMsg(''), 4000);
  };

  const handleRemoveFromWishlist = async (pkgId) => {
    try {
      await api.delete(`/wishlist/${pkgId}`);
    } catch (err) {
      console.warn('Wishlist remove failed:', err);
    }
    setLiveWishlist(prev => prev.filter(w => (w.package_id || w.id) !== pkgId));
    setBookingMsg('Package removed from your wishlist.');
    setTimeout(() => setBookingMsg(''), 3000);
  };

  // Notification Handlers
  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.put('/notifications/read-all');
    } catch { /* ignore */ }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
  };

  const handleMarkNotificationRead = async (notifId) => {
    try {
      await api.put(`/notifications/${notifId}/read`);
    } catch { /* ignore */ }
    setNotifications(prev => prev.map(n => n.notification_id === notifId ? { ...n, is_read: 1 } : n));
  };

  // Save profile updates with country and name validation
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSavedMsg('');

    // Full Name validation: alphabetic characters and spaces only
    const trimmedName = profileData.name.trim();
    if (!/^[A-Za-z\s]{2,100}$/.test(trimmedName)) {
      setProfileError('Full Name must contain only alphabetic characters and spaces (2-100 characters).');
      return;
    }

    // Phone validation according to selected country
    const phoneDigits = profileData.phone.replace(/\D/g, '');
    if (activeCountry.code === '+91' && phoneDigits.length !== 10) {
      setProfileError('For India (+91), the mobile number must be exactly 10 digits.');
      return;
    }
    if (phoneDigits.length < 7 || phoneDigits.length > activeCountry.digits) {
      setProfileError(`For ${activeCountry.name}, mobile number must be between 7 and ${activeCountry.digits} digits.`);
      return;
    }

    const fullPhoneNumber = `${activeCountry.code} ${phoneDigits}`;
    setIsSavingProfile(true);

    try {
      const { data } = await api.put('/users/profile', {
        userId: liveUser?.user_id || liveUser?.id,
        name: trimmedName,
        phone: fullPhoneNumber
      });
      if (data.success && data.user) {
        setDbUser(data.user);
        setProfileSavedMsg('Profile updated successfully!');
        return;
      }
    } catch (err) {
      console.warn('Profile save warning:', err);
    } finally {
      setIsSavingProfile(false);
      setTimeout(() => setProfileSavedMsg(''), 4000);
    }

    const updatedUser = { ...(dbUser || user || {}), name: trimmedName, phone: fullPhoneNumber };
    setDbUser(updatedUser);
    try {
      localStorage.setItem('ts_user_profile', JSON.stringify(updatedUser));
    } catch { /* ignore */ }
    setProfileSavedMsg('Profile updated successfully!');
  };

  // Review & Feedback Form Handlers
  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      setReviewStatusMsg('Please write your review feedback before submitting.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewStatusMsg('');

    try {
      if (editingReview) {
        // Edit existing review: updates in-place without creating a duplicate
        const { data } = await api.put(`/reviews/${editingReview.review_id}`, {
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim()
        });
        if (data.success) {
          setReviews(prev => prev.map(r => r.review_id === editingReview.review_id ? {
            ...r,
            rating: reviewForm.rating,
            comment: reviewForm.comment.trim(),
            updated_at: new Date().toISOString()
          } : r));
          setEditingReview(null);
          setReviewForm({ rating: 5, comment: '', packageId: '' });
          setReviewStatusMsg('✓ Review updated successfully in your account!');
          setIsSubmittingReview(false);
          setTimeout(() => setReviewStatusMsg(''), 4000);
          return;
        }
      } else {
        // Submit new review
        const chosenPkg = allPackages.find(p => (p.package_id || p.id) == reviewForm.packageId) || allPackages[0];
        const { data } = await api.post('/reviews', {
          packageId: chosenPkg ? (chosenPkg.package_id || chosenPkg.id) : 1,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim()
        });
        if (data.success) {
          const newRev = {
            review_id: data.reviewId || Date.now(),
            user_id: liveUser?.user_id || liveUser?.id,
            rating: reviewForm.rating,
            comment: reviewForm.comment.trim(),
            package_title: chosenPkg?.title || 'Tour Package',
            created_at: new Date().toISOString()
          };
          setReviews(prev => [newRev, ...prev]);
          setReviewForm({ rating: 5, comment: '', packageId: '' });
          setReviewStatusMsg('✓ Thank you! Your review has been submitted.');
          setIsSubmittingReview(false);
          setTimeout(() => setReviewStatusMsg(''), 4000);
          return;
        }
      }
    } catch (err) {
      console.warn('Review save error:', err);
    }

    // Local fallback update
    if (editingReview) {
      setReviews(prev => prev.map(r => r.review_id === editingReview.review_id ? {
        ...r,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        updated_at: new Date().toISOString()
      } : r));
      setEditingReview(null);
      setReviewStatusMsg('✓ Review updated successfully!');
    } else {
      const fallbackRev = createFallbackReview(
        allPackages.find(p => (p.package_id || p.id) == reviewForm.packageId)?.title || 'Tour Package',
        reviewForm.rating,
        reviewForm.comment.trim()
      );
      setReviews(prev => [fallbackRev, ...prev]);
      setReviewStatusMsg('✓ Review submitted successfully!');
    }
    setReviewForm({ rating: 5, comment: '', packageId: '' });
    setIsSubmittingReview(false);
    setTimeout(() => setReviewStatusMsg(''), 4000);
  };

  const handleStartEditReview = (rev) => {
    setEditingReview(rev);
    setReviewForm({
      rating: rev.rating,
      comment: rev.comment,
      packageId: rev.package_id || ''
    });
    setActiveTab('reviews');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditReview = () => {
    setEditingReview(null);
    setReviewForm({ rating: 5, comment: '', packageId: '' });
  };

  // Submit quick feedback from dashboard overview card
  const handleQuickOverviewReview = async () => {
    if (!overviewComment.trim()) return;
    try {
      await api.post('/reviews', {
        packageId: liveBookings[0]?.package_id || 1,
        rating: overviewRating,
        comment: overviewComment.trim()
      });
    } catch { /* ignore */ }

    const quickRev = createFallbackReview(
      liveBookings[0]?.package_title || 'Swiss Alps Glacier Pass',
      overviewRating,
      overviewComment.trim()
    );
    setReviews(prev => [quickRev, ...prev]);
    setOverviewSubmitted(true);
    setOverviewComment('');
    setTimeout(() => setOverviewSubmitted(false), 4000);
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
            className={`ts-nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            My Reviews
          </button>
          <button 
            className={`ts-nav-link ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            Explore
          </button>
        </nav>

        <div className="ts-header-right">
          <div className="ts-search-pill">
            <Search size={16} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search trips, destination..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPkgSearch(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setActiveTab('explore');
                }
              }}
            />
          </div>

          {/* NOTIFICATION BELL WITH DROPDOWN */}
          <div className="ts-notif-wrap">
            <button 
              className="ts-notif-btn" 
              title="Notifications"
              onClick={() => setShowNotifDropdown(prev => !prev)}
              aria-label="View notifications"
            >
              <Bell size={20} />
              {unreadNotifCount > 0 && <span className="ts-notif-badge">{unreadNotifCount}</span>}
            </button>

            {showNotifDropdown && (
              <div className="ts-notif-dropdown">
                <div className="ts-notif-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Bell size={16} color="#2563eb" />
                    <span>Notifications ({notifications.length})</span>
                  </div>
                  {unreadNotifCount > 0 && (
                    <button 
                      type="button" 
                      className="ts-notif-mark-read"
                      onClick={handleMarkAllNotificationsRead}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="ts-notif-list">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div 
                        key={notif.notification_id}
                        className={`ts-notif-item ${notif.is_read ? '' : 'unread'}`}
                        onClick={() => handleMarkNotificationRead(notif.notification_id)}
                      >
                        <div className="ts-notif-item-top">
                          <div className="ts-notif-item-title">
                            {!notif.is_read && <span className="ts-unread-dot" />}
                            <span>{notif.title}</span>
                          </div>
                          <span className="ts-notif-time">
                            {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <div className="ts-notif-msg">{notif.message}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                      <CheckCircle size={24} color="#16a34a" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                      You have no new notifications.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="ts-user-profile-btn" onClick={() => setActiveTab('profile')}>
            <SmartImage 
              src={liveUser?.avatar_url || "/destination-images/swiss-alps.webp"} 
              alt="User Avatar" 
              className="ts-user-avatar"
            />
            <div className="ts-user-info-text">
              <span className="ts-user-name">{liveUser?.name || 'Traveler'}</span>
              <span className="ts-user-tag">Verified Member</span>
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
                className={`ts-sidebar-item ${activeTab === 'passes' ? 'active' : ''}`}
                onClick={() => setActiveTab('passes')}
              >
                <Ticket size={18} />
                <span>VIP Pass</span>
              </button>

              <button 
                className={`ts-sidebar-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <Heart size={18} />
                <span>Wishlist ({liveWishlist.length})</span>
              </button>

              <button 
                className={`ts-sidebar-item ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                <MessageSquare size={18} />
                <span>My Reviews ({reviews.length})</span>
              </button>

              <button 
                className={`ts-sidebar-item ${activeTab === 'explore' ? 'active' : ''}`}
                onClick={() => setActiveTab('explore')}
              >
                <Compass size={18} />
                <span>Explore Packages</span>
              </button>

              <button className="ts-sidebar-item" onClick={() => navigate('/support')}>
                <HelpCircle size={18} />
                <span>Help & FAQs</span>
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

                {/* 4 METRIC STAT CARDS */}
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
                      <div className="ts-metric-label">{formatPrice(liveBookings.length * 5)} reward value</div>
                    </div>
                  </div>

                  <div className="ts-metric-box" onClick={() => setActiveTab('reviews')} style={{ cursor: 'pointer' }}>
                    <div className="ts-metric-icon-wrap" style={{ background: '#faf5ff', color: '#9333ea' }}>
                      ⭐
                    </div>
                    <div>
                      <div className="ts-metric-num">{reviews.length} Reviews</div>
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
                    <button type="button" className="ts-tab-pill active" onClick={() => setActiveTab('explore')}>🎫 Tour Packages</button>
                    <button type="button" className="ts-tab-pill" onClick={() => navigate('/hotels')}>🏨 Hotels</button>
                    <button type="button" className="ts-tab-pill" onClick={() => navigate('/vehicles')}>✈ Flights</button>
                    <button type="button" className="ts-tab-pill" onClick={() => navigate('/vehicles')}>🚌 Buses</button>
                    <button type="button" className="ts-tab-pill" onClick={() => navigate('/vehicles')}>🚆 Trains</button>
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
                
                {/* LEFT HERO TOUR HIGHLIGHT CARD */}
                <div className="ts-tour-highlight-card">
                  {liveBookings.length > 0 ? (
                    <>
                      <div 
                        className="ts-tour-banner-img" 
                        style={{ backgroundImage: `url('${liveBookings[0].package_image || '/destination-images/swiss-alps.webp'}')` }}
                      >
                        <div className="ts-banner-content-top">
                          <span className="ts-badge-pill-orange">● Live Booking</span>
                          <span className="ts-ref-code">Booking Ref: {liveBookings[0].display_id || `TS-${liveBookings[0].booking_id}`}</span>
                        </div>

                        <div className="ts-banner-content-bottom">
                          <div style={{ fontSize: '0.75rem', letterSpacing: '0.08em', fontWeight: 800, color: '#38bdf8', marginBottom: '0.2rem' }}>
                            UPCOMING TOUR HIGHLIGHT
                          </div>
                          <h2 className="ts-tour-hero-title">
                            {liveBookings[0].package_title || 'Custom Tour Booking'}
                          </h2>
                          <div className="ts-tour-hero-route">
                            <span>📍 {liveBookings[0].destination_name || 'Destination'}</span>
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
                            <div className="ts-detail-val">{liveBookings[0].start_date ? new Date(liveBookings[0].start_date).toLocaleDateString() : (liveBookings[0].travel_date || 'Nov 18, 2026')}</div>
                          </div>
                          <div className="ts-detail-box">
                            <div className="ts-detail-label">Status</div>
                            <div className="ts-detail-val" style={{ color: '#16a34a' }}>{liveBookings[0].status}</div>
                          </div>
                          <div className="ts-detail-box">
                            <div className="ts-detail-label">Total Amount</div>
                            <div className="ts-detail-val">{formatPrice(liveBookings[0].total_amount)}</div>
                          </div>
                        </div>
                        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="ts-btn-primary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
                            onClick={() => generateBookingPDF({
                              id: liveBookings[0].display_id || liveBookings[0].booking_id,
                              title: liveBookings[0].package_title,
                              amount: liveBookings[0].total_amount,
                              status: liveBookings[0].status,
                              startDate: liveBookings[0].start_date,
                              endDate: liveBookings[0].end_date,
                              guests: liveBookings[0].guests,
                              guestName: liveUser?.name || 'Verified Traveler',
                              email: liveUser?.email
                            })}
                          >
                            <FileDown size={15} /> Download Official Voucher & Boarding Pass (PDF)
                          </button>
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
                  
                  {/* TRAVELER PROFILE CARD (TECHNICAL DATABASE LABELS REMOVED) */}
                  <div className="ts-card-panel">
                    <div className="ts-panel-header">
                      <span className="ts-panel-title">Traveler Profile</span>
                      <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.725rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckCircle size={10} /> Verified Traveler
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
                          <div style={{ fontWeight: 700 }}>Traveler ID</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>#TS-{liveUser?.user_id || liveUser?.id || 101}</div>
                        </div>
                        <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.75rem' }}>Active Member</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                      <span>🛡️ Verified Account</span>
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
                          fill={star <= overviewRating ? "#f59e0b" : "none"} 
                          color={star <= overviewRating ? "#f59e0b" : "#cbd5e1"} 
                          onClick={() => setOverviewRating(star)}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </div>

                    <textarea 
                      className="ts-textarea" 
                      placeholder="Write your review or feedback..."
                      value={overviewComment}
                      onChange={(e) => setOverviewComment(e.target.value)}
                    />

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button 
                        type="button"
                        className="ts-btn-primary" 
                        style={{ flex: 1, justifyContent: 'center', padding: '0.5rem', fontSize: '0.775rem' }}
                        onClick={handleQuickOverviewReview}
                      >
                        {overviewSubmitted ? '✓ Submitted!' : 'Submit Review'}
                      </button>
                      <button
                        type="button"
                        className="ts-btn-outline"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.775rem' }}
                        onClick={() => setActiveTab('reviews')}
                      >
                        View All
                      </button>
                    </div>
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
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ref: {b.display_id || `TS-${b.booking_id}`}</div>
                            </td>
                            <td>
                              <span style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.725rem', fontWeight: 700 }}>Tour Package</span>
                            </td>
                            <td style={{ fontSize: '0.825rem', color: '#64748b' }}>{b.start_date ? new Date(b.start_date).toLocaleDateString() : (b.travel_date || 'Nov 18, 2026')}</td>
                            <td style={{ fontWeight: 800 }}>{formatPrice(b.total_amount)}</td>
                            <td>
                              <span className={`ts-status-tag ${b.status === 'confirmed' ? 'completed' : 'pending'}`}>
                                {b.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  type="button"
                                  className="ts-btn-primary"
                                  title="Download Boarding Voucher PDF"
                                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.775rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                  onClick={() => generateBookingPDF({
                                    id: b.display_id || b.booking_id,
                                    title: b.package_title,
                                    amount: b.total_amount,
                                    status: b.status,
                                    startDate: b.start_date,
                                    endDate: b.end_date,
                                    guests: b.guests,
                                    guestName: liveUser?.name || 'Verified Traveler',
                                    email: liveUser?.email
                                  })}
                                >
                                  <FileDown size={13} /> PDF Voucher
                                </button>
                                <button 
                                  className="ts-btn-outline" 
                                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.775rem' }}
                                  onClick={() => {
                                    setReviewForm(prev => ({ ...prev, packageId: b.package_id || '' }));
                                    setActiveTab('reviews');
                                  }}
                                >
                                  Review
                                </button>
                              </div>
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
                    {liveWishlist.map((w) => {
                      const pkgId = w.package_id || w.id;
                      return (
                        <div className="ts-adventure-card" key={w.wishlist_id || pkgId}>
                          <div className="ts-adventure-img-wrap">
                            <Link to={`/packages/${pkgId}`}>
                              <SmartImage src={w.image_url || "/destination-images/santorini.webp"} alt={w.title} />
                            </Link>
                            <button 
                              className="ts-fav-heart-btn" 
                              title="Remove from Wishlist"
                              onClick={() => handleRemoveFromWishlist(pkgId)}
                            >
                              ❤️
                            </button>
                          </div>
                          <div className="ts-adventure-body">
                            <Link to={`/packages/${pkgId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              <h3 className="ts-adventure-title">{w.title}</h3>
                            </Link>
                            <div className="ts-adventure-meta">
                              <div className="ts-price-tag">{formatPrice(w.price)} <span>/person</span></div>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button 
                                  onClick={() => handleRemoveFromWishlist(pkgId)} 
                                  className="ts-btn-outline" 
                                  style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fca5a5' }}
                                  title="Remove from Wishlist"
                                >
                                  <Trash2 size={13} />
                                </button>
                                <button onClick={() => handleBookPackage(w)} className="ts-btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
                                  Book Now
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ref: {b.display_id || `TS-${b.booking_id}`}</div>
                          </td>
                          <td>
                            <span style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.725rem', fontWeight: 700 }}>Tour Package</span>
                          </td>
                          <td style={{ fontSize: '0.825rem', color: '#64748b' }}>{b.start_date ? new Date(b.start_date).toLocaleDateString() : (b.travel_date || 'Nov 18, 2026')}</td>
                          <td style={{ fontWeight: 800 }}>{formatPrice(b.total_amount)}</td>
                          <td>
                            <span className={`ts-status-tag ${b.status === 'confirmed' ? 'completed' : 'pending'}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                type="button"
                                className="ts-btn-primary"
                                title="Download Boarding Voucher PDF"
                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.775rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                onClick={() => generateBookingPDF({
                                  id: b.display_id || b.booking_id,
                                  title: b.package_title,
                                  amount: b.total_amount,
                                  status: b.status,
                                  startDate: b.start_date,
                                  endDate: b.end_date,
                                  guests: b.guests,
                                  guestName: liveUser?.name || 'Verified Traveler',
                                  email: liveUser?.email
                                })}
                              >
                                <FileDown size={13} /> PDF Voucher
                              </button>
                              <button 
                                className="ts-btn-outline" 
                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.775rem' }}
                                onClick={() => {
                                  setReviewForm(prev => ({ ...prev, packageId: b.package_id || '' }));
                                  setActiveTab('reviews');
                                }}
                              >
                                Review
                              </button>
                            </div>
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

          {/* TAB: VIP PASSES WITH TEAR TICKET */}
          {activeTab === 'passes' && (() => {
            const firstBooking = liveBookings[0];
            const dashPass = {
              transportType: 'plane',
              carrier: 'TRAVELSPHERE VIP EXPRESS',
              classType: 'CONFIRMED VIP PASS',
              title: firstBooking?.package_title || 'Swiss Alps Glacier Pass',
              fromCode: firstBooking?.departure_city ? firstBooking.departure_city.slice(0, 3).toUpperCase() : 'ZRH',
              fromCity: firstBooking?.departure_city || 'Zurich Intl, CH',
              toCode: firstBooking?.destination_name ? firstBooking.destination_name.slice(0, 3).toUpperCase() : 'ALP',
              toCity: firstBooking?.destination_name || 'Alpine Peak, Switzerland',
              date: firstBooking?.travel_date || '18 Nov 2026',
              time: '09:00 AM Priority',
              gate: 'Gate B12',
              seat: 'VIP Suite · 01A',
              pnr: firstBooking?.display_id || 'TS-772918',
              accentColor: '#a3704c',
              background: '#18181b',
              image: firstBooking?.package_image || '/destination-images/swiss-alps.webp'
            };

            return (
              <div className="ts-table-section">
                <div className="ts-panel-header">
                  <div>
                    <div className="ts-section-tag">VIP ACCESS</div>
                    <div className="ts-section-title">Interactive Excursion & Boarding Passes</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button 
                      type="button" 
                      className="ts-btn-outline" 
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                      onClick={() => setTicketTorn(false)}
                    >
                      <RotateCcw size={14} /> Reset Pass
                    </button>
                    <button 
                      type="button" 
                      className="ts-btn-outline" 
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                      onClick={() => navigate('/ticket')}
                    >
                      <Ticket size={14} /> VIP Ticket Studio
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', margin: '1.5rem auto' }}>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', maxWidth: '540px', margin: 0 }}>
                    Grab and pull the perforated stub on the right to tear off your ticket when boarding or checking in at your tour gate.
                  </p>

                  <div style={{ width: '100%', maxWidth: '480px', display: 'flex', justifyContent: 'center' }}>
                    <TearTicket
                      key={`dash-ticket-${ticketTorn}-${dashPass.pnr}`}
                      image={dashPass.image}
                      imageAlt={dashPass.title}
                      stub={
                        <TicketBoardingPassStub
                          ticket={dashPass}
                          passengerName={user?.name || 'Alexander Wright'}
                          isTorn={ticketTorn}
                        />
                      }
                      orientation="horizontal"
                      scrim
                      imageRadius={8}
                      onTear={() => {
                        setTicketTorn(true);
                        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
                      }}
                      torn={ticketTorn}
                      sound
                      width={480}
                      height={260}
                      stubSize={160}
                      radius={16}
                      holes={13}
                      holeSize={6}
                      notch={3}
                      roughness={0}
                      tearAngle={30}
                      stretch={30}
                      resistance={0.45}
                      rotate={4}
                      tilt
                      tiltMax={9}
                      tiltReach={260}
                      parallax={6}
                      perspective={1000}
                      background="#18181b"
                      color="#fbf9f5"
                      border
                      borderWidth={1}
                      recenter
                    >
                      <TicketBoardingPassBody
                        ticket={dashPass}
                        passengerName={user?.name || 'Alexander Wright'}
                        isTorn={ticketTorn}
                      />
                    </TearTicket>
                  </div>

                  {ticketTorn ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', width: '100%', maxWidth: '480px' }}>
                      <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
                        ✓ Ticket Stub Torn & Boarding Verified! Gate B12 · Zone 1 Priority
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {firstBooking && (
                          <button
                            type="button"
                            className="ts-btn-outline"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                            onClick={() => generateBookingPDF(firstBooking)}
                          >
                            <FileDown size={14} /> Download PDF Voucher
                          </button>
                        )}
                        <button
                          type="button"
                          className="ts-btn-outline"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                          onClick={() => window.print()}
                        >
                          Print Boarding Pass
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })()}

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
                  {liveWishlist.map((w) => {
                    const pkgId = w.package_id || w.id;
                    return (
                      <div className="ts-adventure-card" key={w.wishlist_id || pkgId}>
                        <div className="ts-adventure-img-wrap">
                          <Link to={`/packages/${pkgId}`}>
                            <SmartImage src={w.image_url || "/destination-images/santorini.webp"} alt={w.title} />
                          </Link>
                          <button 
                            className="ts-fav-heart-btn" 
                            title="Remove from Wishlist"
                            onClick={() => handleRemoveFromWishlist(pkgId)}
                          >
                            ❤️
                          </button>
                        </div>
                        <div className="ts-adventure-body">
                          <Link to={`/packages/${pkgId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h3 className="ts-adventure-title">{w.title}</h3>
                          </Link>
                          <div className="ts-adventure-meta">
                            <div className="ts-price-tag">{formatPrice(w.price)} <span>/person</span></div>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button 
                                onClick={() => handleRemoveFromWishlist(pkgId)} 
                                className="ts-btn-outline" 
                                style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem', color: '#dc2626', borderColor: '#fca5a5', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <Trash2 size={13} /> Remove
                              </button>
                              <button onClick={() => handleBookPackage(w)} className="ts-btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
                                Book Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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

          {/* TAB 4: MY REVIEWS & FEEDBACK MANAGEMENT */}
          {activeTab === 'reviews' && (
            <div>
              <div className="ts-panel-header" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <div className="ts-section-tag">COMMUNITY FEEDBACK</div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>
                    My Reviews & Travel Experiences
                  </h1>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Submit reviews for your trips, edit previous feedback, and view your complete review history.
                  </p>
                </div>
              </div>

              {reviewStatusMsg && (
                <div style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.85rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                  {reviewStatusMsg}
                </div>
              )}

              {/* REVIEW SUBMIT / EDIT FORM */}
              <div className="ts-card-panel" style={{ maxWidth: '750px', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>
                    {editingReview ? `Edit Your Review (#TS-REV-${editingReview.review_id})` : 'Write a Review & Feedback'}
                  </h2>
                  {editingReview && (
                    <button 
                      type="button" 
                      onClick={handleCancelEditReview} 
                      className="ts-btn-outline" 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <X size={13} /> Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveReview}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    {/* Tour Package Selection (for new reviews) */}
                    {!editingReview && (
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                          Select Travel Package
                        </label>
                        <select 
                          className="ts-input-field" 
                          style={{ width: '100%', marginTop: '0.35rem', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                          value={reviewForm.packageId}
                          onChange={(e) => setReviewForm({ ...reviewForm, packageId: e.target.value })}
                        >
                          <option value="">-- Choose a package to review --</option>
                          {allPackages.map(p => (
                            <option key={p.package_id || p.id} value={p.package_id || p.id}>
                              {p.title} ({p.location || 'Destination'})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Star Rating Selector */}
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                        Your Rating: {reviewForm.rating} of 5 Stars
                      </label>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={26} 
                            fill={star <= reviewForm.rating ? "#f59e0b" : "none"} 
                            color={star <= reviewForm.rating ? "#f59e0b" : "#cbd5e1"} 
                            onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                            style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Comment text */}
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        Your Feedback / Comments
                      </label>
                      <textarea 
                        className="ts-textarea" 
                        rows={4}
                        placeholder="Tell fellow travelers what you loved about the tour, guides, hotel amenities, and overall experience..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        required
                        style={{ marginTop: '0.35rem', width: '100%' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <button 
                        type="submit" 
                        className="ts-btn-primary" 
                        disabled={isSubmittingReview}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.4rem' }}
                      >
                        {editingReview ? (
                          <>
                            <Check size={16} /> {isSubmittingReview ? 'Saving Changes...' : 'Save & Update Review'}
                          </>
                        ) : (
                          <>
                            <Star size={16} /> {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                          </>
                        )}
                      </button>

                      {editingReview && (
                        <button 
                          type="button" 
                          className="ts-btn-outline" 
                          onClick={handleCancelEditReview}
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                  </div>
                </form>
              </div>

              {/* REVIEW HISTORY LIST */}
              <div className="ts-panel-header" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                <div>
                  <div className="ts-section-tag">HISTORY</div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>
                    Your Submitted Reviews ({reviews.length})
                  </h2>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="ts-reviews-list">
                  {reviews.map((rev) => (
                    <div className="ts-review-card" key={rev.review_id}>
                      <div className="ts-review-card-header">
                        <div>
                          <div className="ts-review-pkg">{rev.package_title || 'Tour Experience'}</div>
                          <div className="ts-review-stars">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star 
                                key={s} 
                                size={15} 
                                fill={s <= rev.rating ? "#f59e0b" : "none"} 
                                color={s <= rev.rating ? "#f59e0b" : "#cbd5e1"} 
                              />
                            ))}
                          </div>
                        </div>

                        <button 
                          type="button"
                          className="ts-btn-outline" 
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          onClick={() => handleStartEditReview(rev)}
                        >
                          <Edit size={13} /> Edit Review
                        </button>
                      </div>

                      <div className="ts-review-body">
                        "{rev.comment}"
                      </div>

                      <div className="ts-review-card-footer">
                        <span>Submitted: {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}</span>
                        {rev.updated_at && (
                          <span style={{ color: '#2563eb', fontWeight: 600 }}>
                            Updated: {new Date(rev.updated_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: '#ffffff', border: '1px solid var(--color-border-light)', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✍️</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text-dark)', marginBottom: '0.3rem' }}>
                    No Reviews Submitted Yet
                  </div>
                  <div style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                    Share your travel feedback on any of our packages to guide the traveler community!
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 5: EXPLORE PACKAGES TAB (MAKEMYTRIP INSPIRED CATALOG) */}
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

                  return list.map((pkg) => {
                    const pkgId = pkg.package_id || pkg.id;
                    const isWish = liveWishlist.some(w => (w.package_id || w.id) === pkgId);
                    return (
                      <div className="ts-adventure-card" key={pkgId}>
                        <div className="ts-adventure-img-wrap">
                          <Link to={`/packages/${pkgId}`}>
                            <SmartImage src={pkg.image_url} alt={pkg.title} />
                          </Link>
                          <button 
                            className="ts-fav-heart-btn" 
                            onClick={() => handleAddToWishlist(pkg)} 
                            title={isWish ? "Remove from Wishlist" : "Save to Wishlist"}
                          >
                            {isWish ? '❤️' : '🤍'}
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

                          <Link to={`/packages/${pkgId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h3 className="ts-adventure-title">{pkg.title}</h3>
                          </Link>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                            {pkg.description || 'Handcrafted tour package with complete itinerary and hotel stays.'}
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
                            <div className="ts-price-tag">{formatPrice(pkg.price)} <span>/person</span></div>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <Link 
                                to={`/packages/${pkgId}`} 
                                className="ts-btn-outline" 
                                style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                              >
                                Details <ExternalLink size={11} />
                              </Link>
                              <button onClick={() => handleBookPackage(pkg)} className="ts-btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}>
                                Book Trip
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* TAB 6: PROFILE & SETTINGS TAB */}
          {activeTab === 'profile' && (
            <div className="ts-card-panel" style={{ maxWidth: '650px' }}>
              <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>
                  Profile & Account Settings
                </h2>
                <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Manage your personal details, verified phone number, and account preferences.
                </p>
              </div>

              {profileError && (
                <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertCircle size={16} /> {profileError}
                </div>
              )}

              <form onSubmit={handleProfileSave}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  
                  {/* Full Name Field: Letters & Spaces Only */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '0.3rem', fontSize: '0.9rem', fontWeight: 600 }}
                      value={profileData.name}
                      onChange={(e) => {
                        const sanitized = sanitizeFullName(e.target.value);
                        setProfileData(prev => ({ ...prev, name: sanitized }));
                        setProfileError('');
                      }}
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      Only alphabetic characters and spaces are allowed. Numbers and symbols are forbidden.
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '0.3rem', fontSize: '0.9rem', background: '#f8fafc', opacity: 0.85 }}
                      value={liveUser?.email || ''}
                      disabled
                    />
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      Your primary email address linked to your travel reservations.
                    </div>
                  </div>

                  {/* Mobile Number with Country Code Selector & Digit Restriction */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Mobile Number
                    </label>
                    <div className="ts-phone-input-wrap">
                      <select 
                        className="ts-country-dropdown"
                        value={profileCountryCode}
                        onChange={(e) => {
                          setProfileCountryCode(e.target.value);
                          setProfileError('');
                        }}
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.name} ({c.code})
                          </option>
                        ))}
                      </select>

                      <input 
                        type="tel" 
                        className="ts-phone-number-field"
                        value={profileData.phone}
                        maxLength={activeCountry.digits}
                        placeholder={activeCountry.placeholder}
                        onChange={(e) => {
                          const digitsOnly = sanitizePhoneDigits(e.target.value).slice(0, activeCountry.digits);
                          setProfileData(prev => ({ ...prev, phone: digitsOnly }));
                          setProfileError('');
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      {activeCountry.code === '+91' 
                        ? 'For India (+91), exactly 10 digits required.' 
                        : `Enter up to ${activeCountry.digits} digits for ${activeCountry.name}.`}
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <button type="submit" className="ts-btn-primary" disabled={isSavingProfile}>
                    <Check size={16} /> {isSavingProfile ? 'Saving...' : 'Save Profile'}
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
