import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Bed, 
  Calendar, 
  CheckCircle, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  Clock, 
  MapPin, 
  Users,
  Bell,
  DollarSign,
  TrendingUp,
  Search,
  FileDown,
  CreditCard,
  Lock,
  UserCheck,
  Check,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useCurrency } from '../../context/useCurrency';
import dashboardService from '../../services/dashboardDataService';
import { generateBookingPDF } from '../../utils/pdfVoucher';
import SmartImage from '../../components/common/SmartImage';
import CurrencySwitcher from '../../components/common/CurrencySwitcher';
import './HotelDashboard.css';

const HotelDashboard = () => {
  const { user, logout } = useAuth();
  const { formatPrice, currency } = useCurrency();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const initialHotelData = useMemo(() => {
    return dashboardService.getHotelDataSync ? dashboardService.getHotelDataSync() : { hotelInfo: {}, rooms: [], reservations: [] };
  }, []);
  const [hotelInfo, setHotelInfo] = useState(initialHotelData.hotelInfo || {});
  const [rooms, setRooms] = useState(initialHotelData.rooms || []);
  const [reservations, setReservations] = useState(initialHotelData.reservations || []);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New VIP Reservation #RES-8804 from David Miller received', time: '12 mins ago', unread: true },
    { id: 2, text: 'Room 201 (Susuki Pavilion) check-in completed by concierge', time: '1 hour ago', unread: true },
    { id: 3, text: 'Natural Thermal Spring Onsen water inspection verified', time: 'Yesterday', unread: false }
  ]);

  // Reservation Filter & Search state
  const [reservationSearch, setReservationSearch] = useState('');
  const [reservationStatusFilter, setReservationStatusFilter] = useState('all');

  // Room Filter state
  const [roomStatusFilter, setRoomStatusFilter] = useState('all');

  // Edit / Register Hotel Info modal state
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [isRegisteringNewHotel, setIsRegisteringNewHotel] = useState(false);
  const [hotelFormData, setHotelFormData] = useState({});

  // Room Form modal state
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    roomType: '',
    pricePerNight: 300,
    capacity: '2 Adults',
    status: 'Available',
    amenities: 'King Bed, Ocean View, Private Balcony',
    imageUrl: '/hotel-images/aman-kyoto.webp'
  });

  // Manager Profile state
  const [managerProfile, setManagerProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('ts_hotel_manager_profile');
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return {
      fullName: user?.name || 'Kenji Sato',
      staffId: 'MGR-HTL-9921',
      title: 'General Property Manager',
      email: user?.email || 'hotel@travelsphere.org',
      phone: user?.phone || '+81-75-498-5000',
      propertyAssigned: 'Aman Kyoto Luxury Pavilions',
      avatarUrl: user?.avatar_url || '/hotel-images/aman-kyoto.webp',
      lastLogin: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at 09:45 AM'
    };
  });
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });

  // Payout request state
  const [payoutRequested, setPayoutRequested] = useState(false);

  const loadHotelData = async () => {
    try {
      const res = await dashboardService.getHotelData();
      setHotelInfo(res.hotelInfo || {});
      setRooms(res.rooms || []);
      setReservations(res.reservations || []);
      setHotelFormData(res.hotelInfo || {});
    } catch (err) {
      console.error('Failed to load hotel data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = (user?.role || '').toUpperCase();
    if (!user || (role !== 'HOTEL_MANAGER' && role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
      navigate('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load; state is set after the awaited request
    loadHotelData();
  }, [user, navigate]);

  // Executive KPI metrics
  const totalCapacity = hotelInfo.totalRooms || 48;
  const availableRoomsCount = rooms.filter(r => r.status === 'Available').length;
  const bookedRoomsCount = rooms.filter(r => r.status === 'Booked').length;
  const pendingReservationsCount = reservations.filter(r => r.status === 'Pending').length;
  const confirmedReservationsCount = reservations.filter(r => r.status === 'Confirmed').length;
  const grossRevenue = reservations
    .filter(r => r.status !== 'Cancelled')
    .reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
  const occupancyRate = rooms.length > 0 ? Math.round((bookedRoomsCount / rooms.length) * 100) : 75;

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      const matchesSearch = 
        String(res.id).toLowerCase().includes(reservationSearch.toLowerCase()) ||
        String(res.guestName).toLowerCase().includes(reservationSearch.toLowerCase()) ||
        String(res.roomType).toLowerCase().includes(reservationSearch.toLowerCase());
      const matchesStatus = 
        reservationStatusFilter === 'all' || 
        String(res.status).toLowerCase() === reservationStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [reservations, reservationSearch, reservationStatusFilter]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      if (roomStatusFilter === 'all') return true;
      return String(room.status).toLowerCase() === roomStatusFilter.toLowerCase();
    });
  }, [rooms, roomStatusFilter]);

  const handleOpenRegisterHotelModal = () => {
    setIsRegisteringNewHotel(true);
    setHotelFormData({
      name: '',
      propertyType: '',
      city: '',
      licenseNumber: '',
      totalRooms: '',
      contactPhone: '',
      contactEmail: '',
      amenities: '',
      facilities: [],
      description: '',
      address: '',
      imageUrl: '',
      galleryImages: ''
    });
    setShowHotelModal(true);
  };

  const handleOpenEditHotelModal = () => {
    setIsRegisteringNewHotel(false);
    setHotelFormData({
      ...hotelInfo,
      city: hotelInfo.city || 'Kyoto',
      licenseNumber: hotelInfo.licenseNumber || 'HTL-LIC-7721',
      totalRooms: hotelInfo.totalRooms || 48,
      contactEmail: hotelInfo.contactEmail || hotelInfo.email || 'concierge@amankyoto.jp',
      amenities: hotelInfo.amenities || (hotelInfo.facilities || []).join(', ') || 'Thermal Spring Onsen, Tea Ceremony Pavilion, Michelin Dining, Free WiFi',
      galleryImages: hotelInfo.galleryImages || hotelInfo.imageUrl || '/hotel-images/aman-kyoto.webp'
    });
    setShowHotelModal(true);
  };

  const handleSaveHotelInfo = async (e) => {
    e.preventDefault();
    const facilitiesArray = typeof hotelFormData.amenities === 'string'
      ? hotelFormData.amenities.split(',').map(s => s.trim()).filter(Boolean)
      : (hotelFormData.facilities || []);

    const updated = {
      ...hotelFormData,
      totalRooms: Number(hotelFormData.totalRooms) || 1,
      rating: hotelFormData.rating || hotelInfo.rating || 4.8,
      imageUrl: hotelFormData.imageUrl || '/hotel-images/aman-kyoto.webp',
      facilities: facilitiesArray
    };
    setHotelInfo(updated);
    await dashboardService.saveHotelInfo(updated);
    setActionMsg(isRegisteringNewHotel ? 'New hotel registered successfully on platform!' : 'Hotel information, facilities and images updated successfully!');
    setShowHotelModal(false);
    setTimeout(() => setActionMsg(''), 3000);
    loadHotelData();
  };

  const handleOpenRoomModal = (room = null) => {
    setEditingRoom(room);
    if (room) {
      setRoomFormData({
        ...room,
        roomType: room.roomType || '',
        pricePerNight: room.pricePerNight ?? '',
        capacity: room.capacity || '2 Adults',
        status: room.status || 'Available',
        amenities: room.amenities || '',
        imageUrl: room.imageUrl || '/hotel-images/aman-kyoto.webp'
      });
    } else {
      setRoomFormData({
        roomType: '',
        pricePerNight: '',
        capacity: '2 Adults',
        status: 'Available',
        amenities: '',
        imageUrl: '/hotel-images/aman-kyoto.webp'
      });
    }
    setShowRoomModal(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    const roomToSave = {
      ...(editingRoom ? { ...roomFormData, id: editingRoom.id } : { ...roomFormData, id: Date.now() }),
      pricePerNight: Number(roomFormData.pricePerNight) || 0,
      capacity: roomFormData.capacity || '2 Adults',
      status: roomFormData.status || 'Available',
      imageUrl: roomFormData.imageUrl || '/hotel-images/aman-kyoto.webp'
    };
    setRooms(prev => editingRoom
      ? prev.map(r => String(r.id) === String(editingRoom.id) ? roomToSave : r)
      : [...prev, roomToSave]
    );
    await dashboardService.saveHotelRoom(roomToSave);
    setActionMsg(editingRoom ? 'Room details updated!' : 'New room added to property!');
    setShowRoomModal(false);
    setTimeout(() => setActionMsg(''), 3000);
    loadHotelData();
  };

  const handleQuickToggleRoomStatus = async (roomId, newStatus) => {
    const targetRoom = rooms.find(r => String(r.id) === String(roomId));
    if (!targetRoom) return;
    const updatedRoom = { ...targetRoom, status: newStatus };
    setRooms(prev => prev.map(r => String(r.id) === String(roomId) ? updatedRoom : r));
    await dashboardService.saveHotelRoom(updatedRoom);
    setActionMsg(`Room status set to ${newStatus}`);
    setTimeout(() => setActionMsg(''), 3000);
    loadHotelData();
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Remove this room from inventory?')) {
      setRooms(prev => prev.filter(r => String(r.id) !== String(roomId)));
      await dashboardService.deleteHotelRoom(roomId);
      setActionMsg('Room removed.');
      setTimeout(() => setActionMsg(''), 3000);
      loadHotelData();
    }
  };

  const handleReservationStatus = async (reservationId, status) => {
    await dashboardService.updateReservationStatus(reservationId, status);
    setActionMsg(`Reservation #${reservationId} updated to ${status}`);
    setTimeout(() => setActionMsg(''), 3000);
    loadHotelData();
  };

  const handlePrintReservationPDF = (res) => {
    generateBookingPDF({
      id: res.id,
      title: `${hotelInfo.name || 'Aman Kyoto'} - ${res.roomType}`,
      amount: res.totalAmount,
      currency,
      status: `HOTEL RESERVATION: ${res.status.toUpperCase()}`,
      startDate: res.checkIn,
      endDate: res.checkOut,
      guests: res.guests || 2,
      origin: 'Guest Check-in Desk',
      destination: hotelInfo.city || 'Kyoto, Japan',
      hotel: `${hotelInfo.name || 'Aman Kyoto'} (${res.roomType})`,
      transport: 'Complimentary Valet & Luggage Courier',
      guestName: res.guestName,
      email: res.email || 'guest@travelsphere.org'
    });
  };

  const handleSaveManagerProfile = (e) => {
    e.preventDefault();
    if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match. Please verify.');
      return;
    }
    try {
      localStorage.setItem('ts_hotel_manager_profile', JSON.stringify(managerProfile));
    } catch { /* ignore */ }
    setActionMsg('Manager profile, credentials, and staff records updated successfully!');
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleRequestPayout = () => {
    setPayoutRequested(true);
    setActionMsg(`Escrow payout request of ${formatPrice(grossRevenue)} submitted to platform financial clearing!`);
    setTimeout(() => setActionMsg(''), 5000);
  };

  const unreadNotificationsCount = notifications.filter(n => n.unread).length;

  return (
    <div className="hotel-dashboard-container">
      {/* Top Banner Bar */}
      <div className="hotel-header">
        <div className="hotel-header-content">
          <div className="hotel-title-badge">
            <Building size={28} className="hotel-logo-icon" />
            <div>
              <h2>{hotelInfo.name || 'Aman Kyoto Luxury Pavilions'}</h2>
              <p>Property Manager Hub • Live Reservation & Capacity Management</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <CurrencySwitcher variant="dark" />
            {/* Notifications Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                type="button" 
                className="hotel-bell-btn" 
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadNotificationsCount > 0 && (
                  <span className="hotel-bell-badge">{unreadNotificationsCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="hotel-notifications-dropdown">
                  <div className="notif-header">
                    <h4>Property Activity & Alerts</h4>
                    <button 
                      type="button" 
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                      className="btn-mark-read"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="notif-list">
                    {notifications.map(n => (
                      <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                        <div className="notif-dot" />
                        <div className="notif-content">
                          <p>{n.text}</p>
                          <small>{n.time}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Manager Avatar Profile Pill */}
            <div className="hotel-user-profile">
              <div className="hotel-avatar">
                {managerProfile.avatarUrl ? (
                  <img src={managerProfile.avatarUrl} alt="Manager" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  managerProfile.fullName?.charAt(0) || 'K'
                )}
              </div>
              <div className="hotel-info">
                <span className="hotel-name">{managerProfile.fullName}</span>
                <span className="hotel-role-tag">{managerProfile.title}</span>
              </div>
              <button className="hotel-logout-btn" onClick={() => { logout(); navigate('/login'); }}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="hotel-toast-message">
          <CheckCircle size={18} /> {actionMsg}
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="hotel-tabs-bar">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <Sparkles size={17} /> Overview & Analytics
        </button>
        <button className={`tab-btn ${activeTab === 'hotel' ? 'active' : ''}`} onClick={() => setActiveTab('hotel')}>
          <Building size={17} /> Hotel Profile & Facilities
        </button>
        <button className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>
          <Bed size={17} /> Room Suites & Inventory ({rooms.length})
        </button>
        <button className={`tab-btn ${activeTab === 'reservations' ? 'active' : ''}`} onClick={() => setActiveTab('reservations')}>
          <Calendar size={17} /> Guest Reservations ({reservations.length})
        </button>
        <button className={`tab-btn ${activeTab === 'revenue' ? 'active' : ''}`} onClick={() => setActiveTab('revenue')}>
          <DollarSign size={17} /> Financials & Payouts
        </button>
        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <UserCheck size={17} /> Manager Profile
        </button>
      </div>

      <div className="hotel-content-area">
        {loading ? (
          <div className="hotel-loading-state">
            <Clock size={32} className="spin-icon" />
            <p>Loading hotel property data & reservations...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW & HOSPITALITY INTELLIGENCE TAB */}
            {activeTab === 'overview' && (
              <div className="tab-pane">
                {/* Executive KPI Stat Cards */}
                <div className="kpi-grid">
                  <div className="kpi-card amber">
                    <div className="kpi-icon"><Building size={24} /></div>
                    <div className="kpi-body">
                      <span className="kpi-label">Total Rooms Capacity</span>
                      <h3 className="kpi-value">{totalCapacity} Rooms</h3>
                      <span className="kpi-trend amber">{rooms.length} Suite Types Configured</span>
                    </div>
                  </div>

                  <div className="kpi-card emerald">
                    <div className="kpi-icon"><TrendingUp size={24} /></div>
                    <div className="kpi-body">
                      <span className="kpi-label">Current Occupancy Rate</span>
                      <h3 className="kpi-value">{occupancyRate}%</h3>
                      <span className="kpi-trend green">● {bookedRoomsCount} Booked · {availableRoomsCount} Available</span>
                    </div>
                  </div>

                  <div className="kpi-card blue">
                    <div className="kpi-icon"><Calendar size={24} /></div>
                    <div className="kpi-body">
                      <span className="kpi-label">Active Reservations</span>
                      <h3 className="kpi-value">{reservations.length} Bookings</h3>
                      <span className="kpi-trend blue">{confirmedReservationsCount} Confirmed · {pendingReservationsCount} Pending</span>
                    </div>
                  </div>

                  <div className="kpi-card purple">
                    <div className="kpi-icon"><DollarSign size={24} /></div>
                    <div className="kpi-body">
                      <span className="kpi-label">Gross Property Revenue</span>
                      <h3 className="kpi-value">{formatPrice(grossRevenue)}</h3>
                      <span className="kpi-trend green"><TrendingUp size={14} /> +14.2% vs last month</span>
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts & Live Status */}
                <div className="overview-split-grid">
                  <div className="overview-box">
                    <div className="overview-box-header">
                      <h4>Quick Property Actions</h4>
                      <span className="box-badge">Manager Shortcuts</span>
                    </div>
                    <div className="quick-actions-row">
                      <button type="button" className="quick-action-btn" onClick={() => setActiveTab('rooms')}>
                        <Plus size={16} /> Add Suite to Inventory
                      </button>
                      <button type="button" className="quick-action-btn" onClick={() => setActiveTab('reservations')}>
                        <CheckCircle size={16} /> Process Pending Bookings ({pendingReservationsCount})
                      </button>
                      <button type="button" className="quick-action-btn" onClick={handleOpenEditHotelModal}>
                        <Edit size={16} /> Update Property Details
                      </button>
                      <button type="button" className="quick-action-btn" onClick={() => setActiveTab('revenue')}>
                        <DollarSign size={16} /> Request Escrow Settlement
                      </button>
                    </div>
                  </div>

                  <div className="overview-box">
                    <div className="overview-box-header">
                      <h4>Property Reputation & Rating</h4>
                      <span className="box-badge green">Verified Excellence</span>
                    </div>
                    <div className="reputation-summary">
                      <div className="rating-big">
                        <strong>★ {hotelInfo.rating || '4.8'}</strong>
                        <small>out of 5.0 (142 Guest Reviews)</small>
                      </div>
                      <div className="rating-metrics">
                        <span>Cleanliness & Onsen: <strong>99%</strong></span>
                        <span>Hospitality & Concierge: <strong>98%</strong></span>
                        <span>Location & Scenery: <strong>97%</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Reservations Snapshot */}
                <div className="overview-reservations-section">
                  <div className="pane-header-row" style={{ marginBottom: '1rem' }}>
                    <div>
                      <h3>Recent Guest Check-ins & Bookings</h3>
                      <p>Latest active reservations across suites and pavilions</p>
                    </div>
                    <button className="btn-edit-hotel" onClick={() => setActiveTab('reservations')}>
                      View All Reservations <ArrowRight size={15} />
                    </button>
                  </div>

                  <div className="hotel-table-container">
                    <table className="hotel-table">
                      <thead>
                        <tr>
                          <th>Ref</th>
                          <th>Guest Name</th>
                          <th>Booked Suite</th>
                          <th>Dates</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservations.slice(0, 4).map(res => (
                          <tr key={res.id}>
                            <td><strong>#{res.id}</strong></td>
                            <td>{res.guestName}</td>
                            <td>{res.roomType}</td>
                            <td>{res.checkIn} → {res.checkOut}</td>
                            <td><strong>{formatPrice(res.totalAmount)}</strong></td>
                            <td><span className={`status-pill ${String(res.status).toLowerCase()}`}>{res.status}</span></td>
                            <td>
                              <button 
                                className="btn-table-action" 
                                onClick={() => handlePrintReservationPDF(res)}
                                title="Download Guest Voucher PDF"
                              >
                                <FileDown size={14} /> Voucher
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* HOTEL PROFILE & FACILITIES TAB */}
            {activeTab === 'hotel' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Property Overview & Amenities</h3>
                    <p>Manage property photos, star rating, address, and guest luxury amenities.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button className="btn-add-room" onClick={handleOpenRegisterHotelModal} style={{ background: '#0284c7' }}>
                      <Plus size={18} /> Register New Property
                    </button>
                    <button className="btn-edit-hotel" onClick={handleOpenEditHotelModal}>
                      <Edit size={18} /> Edit Property Details
                    </button>
                  </div>
                </div>

                <div className="hotel-profile-card">
                  <SmartImage src={hotelInfo.imageUrl} alt={hotelInfo.name} className="hotel-hero-img" />
                  <div className="hotel-profile-details">
                    <div className="property-badge-row">
                      <span className="prop-type">{hotelInfo.propertyType}</span>
                      <span className="prop-rating">★ {hotelInfo.rating} Excellence Rating</span>
                      <span className="prop-meta-badge">
                        License: {hotelInfo.licenseNumber || 'HTL-LIC-7721'}
                      </span>
                      <span className="prop-meta-badge green">
                        Capacity: {hotelInfo.totalRooms || 48} Rooms
                      </span>
                    </div>
                    <h2>{hotelInfo.name} ({hotelInfo.city || 'Kyoto'})</h2>
                    <p className="prop-address"><MapPin size={16} /> {hotelInfo.address}</p>
                    <p className="prop-desc">{hotelInfo.description}</p>

                    <div className="prop-contact-box">
                      <span><strong>Email:</strong> {hotelInfo.contactEmail || hotelInfo.email}</span>
                      <span><strong>Phone:</strong> {hotelInfo.contactPhone}</span>
                      <span><strong>City:</strong> {hotelInfo.city || 'Kyoto, Japan'}</span>
                    </div>

                    <h4>Property Facilities & Guest Amenities</h4>
                    <div className="facilities-tags">
                      {(hotelInfo.facilities || []).map((fac, i) => (
                        <span key={i} className="facility-pill"><CheckCircle size={14} /> {fac}</span>
                      ))}
                    </div>

                    {hotelInfo.galleryImages && (
                      <div style={{ marginTop: '1.1rem' }}>
                        <h4 style={{ marginBottom: '0.5rem' }}>Property Gallery</h4>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                          {String(hotelInfo.galleryImages)
                            .split(',')
                            .map(s => s.trim())
                            .filter(Boolean)
                            .map((imgUrl, idx) => (
                              <SmartImage
                                key={idx}
                                src={imgUrl}
                                alt={`${hotelInfo.name || 'Property'} gallery ${idx + 1}`}
                                style={{ width: 92, height: 64, objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                              />
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ROOM SUITES & INVENTORY TAB */}
            {activeTab === 'rooms' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Hotel Rooms & Pricing Inventory</h3>
                    <p>Set room rates, availability status, and luxury suite amenities.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Status filter pills */}
                    <div className="filter-pill-group">
                      {['all', 'available', 'booked', 'maintenance'].map(st => (
                        <button
                          key={st}
                          type="button"
                          className={`filter-pill-btn ${roomStatusFilter === st ? 'active' : ''}`}
                          onClick={() => setRoomStatusFilter(st)}
                        >
                          {st.charAt(0).toUpperCase() + st.slice(1)}
                        </button>
                      ))}
                    </div>
                    <button className="btn-add-room" onClick={() => handleOpenRoomModal()}>
                      <Plus size={18} /> Add New Hotel Room
                    </button>
                  </div>
                </div>

                <div className="rooms-grid">
                  {filteredRooms.map(room => (
                    <div key={room.id} className="room-card">
                      <SmartImage src={room.imageUrl} alt={room.roomType} className="room-img" />
                      <div className="room-card-body">
                        <div className="room-header-row">
                          <h4>{room.roomType}</h4>
                          {/* Live Status Switcher */}
                          <select 
                            className={`room-status-select ${room.status.toLowerCase()}`}
                            value={room.status}
                            onChange={(e) => handleQuickToggleRoomStatus(room.id, e.target.value)}
                            title="Quick change room status"
                          >
                            <option value="Available">● Available</option>
                            <option value="Booked">● Booked</option>
                            <option value="Maintenance">● Maintenance</option>
                          </select>
                        </div>
                        <p className="room-capacity"><Users size={14} /> Max Capacity: {room.capacity}</p>
                        <p className="room-amenities"><strong>Suite includes:</strong> {room.amenities}</p>

                        <div className="room-footer-row">
                          <div>
                            <span className="price-label">Nightly Rate</span>
                            <span className="room-price">{formatPrice(room.pricePerNight)} <small>/ night</small></span>
                          </div>
                          <div className="room-action-btns">
                            <button className="btn-edit-sm" onClick={() => handleOpenRoomModal(room)} title="Edit Room Details"><Edit size={16} /></button>
                            <button className="btn-delete-sm" onClick={() => handleDeleteRoom(room.id)} title="Delete Room"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GUEST RESERVATIONS TAB */}
            {activeTab === 'reservations' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Hotel Guest Reservations & Confirmations</h3>
                    <p>Confirm check-in bookings, reject pending requests, and download official booking vouchers.</p>
                  </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="pane-filter-bar">
                  <div className="search-input-box">
                    <Search size={16} />
                    <input 
                      type="text" 
                      placeholder="Search reservations by guest name, suite, or booking ref..." 
                      value={reservationSearch}
                      onChange={(e) => setReservationSearch(e.target.value)}
                    />
                  </div>
                  <div className="filter-pill-group">
                    {['all', 'confirmed', 'pending', 'cancelled'].map(st => (
                      <button
                        key={st}
                        type="button"
                        className={`filter-pill-btn ${reservationStatusFilter === st ? 'active' : ''}`}
                        onClick={() => setReservationStatusFilter(st)}
                      >
                        {st.charAt(0).toUpperCase() + st.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hotel-table-container">
                  <table className="hotel-table">
                    <thead>
                      <tr>
                        <th>Reservation Ref</th>
                        <th>Guest Name</th>
                        <th>Booked Suite</th>
                        <th>Check-In</th>
                        <th>Check-Out</th>
                        <th>Guests</th>
                        <th>Total Bill</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReservations.map(res => (
                        <tr key={res.id}>
                          <td><strong>#{res.id}</strong></td>
                          <td>{res.guestName}</td>
                          <td>{res.roomType}</td>
                          <td>{res.checkIn}</td>
                          <td>{res.checkOut}</td>
                          <td>{res.guests || 2} Guests</td>
                          <td><strong>{formatPrice(res.totalAmount)}</strong></td>
                          <td><span className={`status-pill ${res.status.toLowerCase()}`}>{res.status}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                              {res.status === 'Pending' ? (
                                <>
                                  <button className="btn-confirm-res" onClick={() => handleReservationStatus(res.id, 'Confirmed')}>
                                    Confirm
                                  </button>
                                  <button 
                                    className="btn-cancel-res" 
                                    onClick={() => handleReservationStatus(res.id, 'Cancelled')}
                                  >
                                    Reject / Cancel
                                  </button>
                                </>
                              ) : res.status === 'Confirmed' ? (
                                <>
                                  <button 
                                    className="btn-table-action" 
                                    onClick={() => handlePrintReservationPDF(res)}
                                    title="Download Guest Voucher PDF"
                                  >
                                    <FileDown size={14} /> Voucher
                                  </button>
                                  <button className="btn-cancel-res" onClick={() => handleReservationStatus(res.id, 'Cancelled')}>
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Closed</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredReservations.length === 0 && (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                            No reservations match the specified search query or status filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* FINANCIALS & ESCROW PAYOUTS TAB */}
            {activeTab === 'revenue' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Property Revenue, ADR & Escrow Clearing</h3>
                    <p>Transparent guest transaction ledger, average daily rates, and financial settlement.</p>
                  </div>
                  <button 
                    className="btn-edit-hotel" 
                    onClick={handleRequestPayout}
                    disabled={payoutRequested}
                    style={{ opacity: payoutRequested ? 0.7 : 1 }}
                  >
                    <DollarSign size={17} /> {payoutRequested ? 'Settlement Requested' : 'Request Escrow Payout'}
                  </button>
                </div>

                <div className="kpi-grid">
                  <div className="kpi-card purple">
                    <div className="kpi-icon"><DollarSign size={24} /></div>
                    <div className="kpi-body">
                      <span className="kpi-label">Gross Booked Volume</span>
                      <h3 className="kpi-value">{formatPrice(grossRevenue)}</h3>
                      <span className="kpi-trend green">From verified guest bookings</span>
                    </div>
                  </div>
                  <div className="kpi-card emerald">
                    <div className="kpi-icon"><CreditCard size={24} /></div>
                    <div className="kpi-body">
                      <span className="kpi-label">Average Daily Rate (ADR)</span>
                      <h3 className="kpi-value">{formatPrice(2737)}</h3>
                      <span className="kpi-trend green">Luxury tier benchmark</span>
                    </div>
                  </div>
                  <div className="kpi-card amber">
                    <div className="kpi-icon"><Clock size={24} /></div>
                    <div className="kpi-body">
                      <span className="kpi-label">In Escrow Clearing</span>
                      <h3 className="kpi-value">{formatPrice(18400)}</h3>
                      <span className="kpi-trend amber">Disbursed on guest checkout</span>
                    </div>
                  </div>
                  <div className="kpi-card blue">
                    <div className="kpi-icon"><TrendingUp size={24} /></div>
                    <div className="kpi-body">
                      <span className="kpi-label">RevPAR Performance</span>
                      <h3 className="kpi-value">{formatPrice(2052)}</h3>
                      <span className="kpi-trend green">+8.4% above regional index</span>
                    </div>
                  </div>
                </div>

                {/* Financial Ledger Table */}
                <div className="hotel-table-container" style={{ marginTop: '1.5rem' }}>
                  <table className="hotel-table">
                    <thead>
                      <tr>
                        <th>Transaction Ref</th>
                        <th>Guest</th>
                        <th>Suite</th>
                        <th>Gross Bill</th>
                        <th>Payment Method</th>
                        <th>Clearing Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map(res => (
                        <tr key={`txn-${res.id}`}>
                          <td><strong>#TXN-HTL-{res.id}</strong></td>
                          <td>{res.guestName}</td>
                          <td>{res.roomType}</td>
                          <td><strong>{formatPrice(res.totalAmount)}</strong></td>
                          <td>Credit Card (Stripe Secured)</td>
                          <td>
                            <span className={`status-pill ${res.status === 'Confirmed' ? 'confirmed' : 'pending'}`}>
                              {res.status === 'Confirmed' ? 'Settled to Property' : 'Held in Escrow'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn-table-action" 
                              onClick={() => handlePrintReservationPDF(res)}
                            >
                              <FileDown size={14} /> Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MANAGER PROFILE TAB (PDF Role Standard) */}
            {activeTab === 'profile' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Property Manager Profile & Credentials</h3>
                    <p>Update your manager contact information, staff credentials, and security password.</p>
                  </div>
                </div>

                <div className="manager-profile-card">
                  <div className="profile-left-col">
                    <div className="profile-avatar-large">
                      {managerProfile.avatarUrl ? (
                        <img src={managerProfile.avatarUrl} alt="Manager" />
                      ) : (
                        managerProfile.fullName?.charAt(0) || 'K'
                      )}
                    </div>
                    <h4>{managerProfile.fullName}</h4>
                    <span className="profile-role-badge">{managerProfile.title}</span>
                    <p className="profile-property-assigned"><Building size={14} /> {managerProfile.propertyAssigned}</p>
                    <div className="profile-meta-box">
                      <span>Staff ID: <strong>{managerProfile.staffId}</strong></span>
                      <span>Last Login: <strong>{managerProfile.lastLogin}</strong></span>
                    </div>
                  </div>

                  <form className="profile-right-form" onSubmit={handleSaveManagerProfile}>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Manager Full Name</label>
                        <input 
                          type="text" 
                          value={managerProfile.fullName} 
                          onChange={e => setManagerProfile({ ...managerProfile, fullName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Staff License Number</label>
                        <input 
                          type="text" 
                          value={managerProfile.staffId} 
                          onChange={e => setManagerProfile({ ...managerProfile, staffId: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Official Email</label>
                        <input 
                          type="email" 
                          value={managerProfile.email} 
                          onChange={e => setManagerProfile({ ...managerProfile, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Direct Phone Number</label>
                        <input 
                          type="text" 
                          value={managerProfile.phone} 
                          onChange={e => setManagerProfile({ ...managerProfile, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Assigned Luxury Property</label>
                        <input 
                          type="text" 
                          value={managerProfile.propertyAssigned} 
                          onChange={e => setManagerProfile({ ...managerProfile, propertyAssigned: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Profile Avatar / Photo URL</label>
                        <input 
                          type="text" 
                          value={managerProfile.avatarUrl} 
                          onChange={e => setManagerProfile({ ...managerProfile, avatarUrl: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="password-change-box">
                      <h4><Lock size={16} /> Security & Change Password</h4>
                      <div className="form-row-2">
                        <div className="form-group">
                          <label>New Password</label>
                          <input 
                            type="password" 
                            placeholder="Enter new password (optional)"
                            value={passwordData.newPassword}
                            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Confirm New Password</label>
                          <input 
                            type="password" 
                            placeholder="Re-type new password"
                            value={passwordData.confirmPassword}
                            onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                      <button type="submit" className="btn-save">
                        <Check size={16} /> Save Manager Profile
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* EDIT / REGISTER HOTEL MODAL */}
      {showHotelModal && createPortal(
        <div className="modal-overlay">
          <div className="hotel-modal-card">
            <h3>{isRegisteringNewHotel ? 'Register New Hotel Property' : 'Update Hotel Profile & Details'}</h3>
            <form onSubmit={handleSaveHotelInfo}>
              <div className="form-group">
                <label>Hotel / Property Name</label>
                <input 
                  type="text" 
                  value={hotelFormData.name || ''} 
                  onChange={e => setHotelFormData({ ...hotelFormData, name: e.target.value })}
                  placeholder="e.g. Aman Kyoto Luxury Pavilions"
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>City / Destination Location</label>
                  <input 
                    type="text" 
                    value={hotelFormData.city || ''} 
                    onChange={e => setHotelFormData({ ...hotelFormData, city: e.target.value })}
                    placeholder="e.g. Kyoto"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hotel License Number</label>
                  <input 
                    type="text" 
                    value={hotelFormData.licenseNumber || ''} 
                    onChange={e => setHotelFormData({ ...hotelFormData, licenseNumber: e.target.value })}
                    placeholder="e.g. HTL-LIC-7721"
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Total Rooms Capacity</label>
                  <input 
                    type="number" 
                    value={hotelFormData.totalRooms ?? ''} 
                    onChange={e => setHotelFormData({ ...hotelFormData, totalRooms: e.target.value === '' ? '' : (parseInt(e.target.value, 10) || 1) })}
                    placeholder="e.g. 48"
                    min="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Property Type</label>
                  <input 
                    type="text" 
                    value={hotelFormData.propertyType || ''} 
                    onChange={e => setHotelFormData({ ...hotelFormData, propertyType: e.target.value })}
                    placeholder="e.g. Luxury Resort & Spa"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Contact Email</label>
                  <input 
                    type="email" 
                    value={hotelFormData.contactEmail || hotelFormData.email || ''} 
                    onChange={e => setHotelFormData({ ...hotelFormData, contactEmail: e.target.value, email: e.target.value })}
                    placeholder="concierge@hotel.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input 
                    type="text" 
                    value={hotelFormData.contactPhone || ''} 
                    onChange={e => setHotelFormData({ ...hotelFormData, contactPhone: e.target.value })}
                    placeholder="+81 75-555-0199"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Key Amenities & Facilities (Comma-separated)</label>
                <input 
                  type="text" 
                  value={hotelFormData.amenities || ''} 
                  onChange={e => setHotelFormData({ ...hotelFormData, amenities: e.target.value })}
                  placeholder="e.g. Mineral Spring Onsen, Tea Pavilion, Michelin Dining, Free WiFi, Valet"
                />
              </div>

              <div className="form-group">
                <label>Property Description & Heritage</label>
                <textarea 
                  rows={3}
                  value={hotelFormData.description || ''} 
                  onChange={e => setHotelFormData({ ...hotelFormData, description: e.target.value })}
                  placeholder="Describe property setting, architecture, and guest experience..."
                  style={{ width: '100%', borderRadius: '10px', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Full Address</label>
                <input 
                  type="text" 
                  value={hotelFormData.address || ''} 
                  onChange={e => setHotelFormData({ ...hotelFormData, address: e.target.value })}
                  placeholder="1 Okitayama Washimine-cho, Kita-ku, Kyoto 603-8458"
                  required
                />
              </div>

              <div className="form-group">
                <label>Main Photo Image</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    id="ts-hotel-main-img-file"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setHotelFormData(prev => ({ ...prev, imageUrl: reader.result }));
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('ts-hotel-main-img-file')?.click()}
                    style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    Upload Photo
                  </button>
                  <input 
                    type="text" 
                    style={{ flex: 1, minWidth: '180px' }}
                    value={hotelFormData.imageUrl || ''} 
                    onChange={e => setHotelFormData({ ...hotelFormData, imageUrl: e.target.value })}
                    placeholder="/hotel-images/aman-kyoto.webp"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Gallery Images (Upload or Comma-separated URLs)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    id="ts-hotel-gallery-file"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setHotelFormData(prev => ({
                            ...prev,
                            galleryImages: prev.galleryImages ? `${prev.galleryImages}, ${reader.result}` : reader.result
                          }));
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('ts-hotel-gallery-file')?.click()}
                    style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    Add Gallery Photo
                  </button>
                  <input 
                    type="text" 
                    style={{ flex: 1, minWidth: '180px' }}
                    value={hotelFormData.galleryImages || ''} 
                    onChange={e => setHotelFormData({ ...hotelFormData, galleryImages: e.target.value })}
                    placeholder="/hotel-images/aman-kyoto.webp, /hotel-images/canaves-oia.webp"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowHotelModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">{isRegisteringNewHotel ? 'Register Hotel' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ROOM MODAL */}
      {showRoomModal && createPortal(
        <div className="modal-overlay">
          <div className="hotel-modal-card">
            <h3>{editingRoom ? 'Edit Hotel Room' : 'Add New Hotel Room'}</h3>
            <form onSubmit={handleSaveRoom}>
              <div className="form-group">
                <label>Room Suite Type</label>
                <input 
                  type="text" 
                  value={roomFormData.roomType} 
                  onChange={e => setRoomFormData({ ...roomFormData, roomType: e.target.value })}
                  required
                  placeholder="e.g. Deluxe Ocean Suite"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Nightly Rate ($)</label>
                  <input 
                    type="number" 
                    value={roomFormData.pricePerNight ?? ''} 
                    onChange={e => setRoomFormData({ ...roomFormData, pricePerNight: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0) })}
                    placeholder="e.g. 350"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Room Availability Status</label>
                  <select 
                    value={roomFormData.status || 'Available'} 
                    onChange={e => setRoomFormData({ ...roomFormData, status: e.target.value })}
                  >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Max Guest Capacity</label>
                <input 
                  type="text" 
                  value={roomFormData.capacity || ''} 
                  onChange={e => setRoomFormData({ ...roomFormData, capacity: e.target.value })}
                  placeholder="e.g. 2 Adults, 1 Child"
                  required
                />
              </div>

              <div className="form-group">
                <label>Amenities Description</label>
                <input 
                  type="text" 
                  value={roomFormData.amenities || ''} 
                  onChange={e => setRoomFormData({ ...roomFormData, amenities: e.target.value })}
                  placeholder="e.g. King Bed, Balcony, Private Jacuzzi"
                />
              </div>

              <div className="form-group">
                <label>Room Image</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    id="ts-room-img-file"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setRoomFormData(prev => ({ ...prev, imageUrl: reader.result }));
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('ts-room-img-file')?.click()}
                    style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    Upload Photo
                  </button>
                  <input 
                    type="text" 
                    style={{ flex: 1, minWidth: '180px' }}
                    value={roomFormData.imageUrl || ''} 
                    onChange={e => setRoomFormData({ ...roomFormData, imageUrl: e.target.value })}
                    placeholder="/hotel-images/aman-kyoto.webp"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowRoomModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Room</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default HotelDashboard;
