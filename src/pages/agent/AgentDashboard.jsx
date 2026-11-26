import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Calendar, 
  Users, 
  MessageSquare, 
  Tag, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Edit, 
  Trash2, 
  LogOut,
  Send,
  Compass,
  CreditCard,
  Building2,
  DollarSign,
  Save,
  TrendingUp,
  Bell,
  Search,
  FileDown,
  UserCheck,
  Check,
  ArrowRight,
  Lock,
  Building
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import dashboardService from '../../services/dashboardDataService';
import { generateBookingPDF } from '../../utils/pdfVoucher';
import SmartImage from '../../components/common/SmartImage';
import './AgentDashboard.css';

const AgentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const initialAgentData = useMemo(() => {
    return dashboardService.getAgentDataSync ? dashboardService.getAgentDataSync() : { packages: [], inquiries: [], bookings: [], tripPlans: [] };
  }, []);
  const [packages, setPackages] = useState(initialAgentData.packages || []);
  const [inquiries, setInquiries] = useState(initialAgentData.inquiries || []);
  const [bookings, setBookings] = useState(initialAgentData.bookings || []);
  const [tripPlans, setTripPlans] = useState(initialAgentData.tripPlans || []);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('New York Global Flagship');

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New custom inquiry from Robert Vance regarding Kyoto Sakura Tour', time: '10 mins ago', unread: true },
    { id: 2, text: 'Booking #TS-BK-1049 confirmed by Alice Walker ($1,910.00)', time: '45 mins ago', unread: true },
    { id: 3, text: 'Commission payout TXN-AG-7701 ($238.75) cleared to agency bank account', time: 'Yesterday', unread: false },
    { id: 4, text: 'Customer Sophia Reed requested a custom quote for Swiss Glacier Express', time: '2 days ago', unread: false }
  ]);

  // Search & Filter States
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('all');

  const [pkgSearch, setPkgSearch] = useState('');
  const [pkgCategoryFilter, setPkgCategoryFilter] = useState('all');

  // Package Form modal state
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [pkgFormData, setPkgFormData] = useState({
    title: '',
    category: 'Culture & Heritage',
    location: '',
    days: 5,
    nights: 4,
    price: 1200,
    availability: 'Available',
    maxCapacity: 15,
    promo: 'Early Bird 10% OFF',
    discountType: 'percentage',
    discountValue: 10,
    imageUrl: '',
    description: '',
    is_active: true
  });

  // Agency Profile State (PDF Compliance)
  const [agencyProfile, setAgencyProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('ts_agency_profile');
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return {
      agency_name: 'Horizon Escapes & Global Expeditions Ltd.',
      license_number: 'AGT-8829-NY-2026',
      commission_rate: 12.5,
      experience_years: 14,
      destinations_covered: 'Japan, Greece, Switzerland, Maldives, UAE, France',
      contact_email: user?.email || 'agent@travelsphere.org',
      contact_phone: '+1 (212) 555-0199',
      office_address: '123 Horizon Blvd, Suite 800, New York, NY 10001',
      accreditation: 'IATA & ASTA Certified Premier Agency'
    };
  });

  // Agent Personal Profile State
  const [agentProfile, setAgentProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('ts_agent_personal_profile');
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return {
      fullName: user?.name || 'Sarah Jenkins',
      staffId: 'AGT-STAFF-4402',
      title: 'Senior Tour Operations Specialist',
      email: user?.email || 'agent@travelsphere.org',
      phone: user?.phone || '+1 (212) 555-0199',
      avatarUrl: user?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      branchAssigned: 'New York Global Flagship',
      lastLogin: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at 09:30 AM'
    };
  });
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });

  // Payment Management & Escrow Ledger (PDF DFD Fig 5, Process 5.0)
  const [payoutRequested, setPayoutRequested] = useState(false);
  const agentTransactions = useMemo(() => {
    return [
      { id: 'TXN-AG-7701', bookingRef: '#TS-BK-1049', customerName: 'Alice Walker', packageTitle: 'Kyoto Culture & Sakura Blossom Tour', grossAmount: 1910, commissionRate: 12.5, commissionAmount: 238.75, status: 'Disbursed', date: '2026-11-20' },
      { id: 'TXN-AG-7702', bookingRef: '#TS-BK-2281', customerName: 'Robert Vance', packageTitle: 'Santorini Villa & Yacht Week', grossAmount: 2484, commissionRate: 12.5, commissionAmount: 310.50, status: 'Disbursed', date: '2026-11-18' },
      { id: 'TXN-AG-7703', bookingRef: '#TS-BK-3394', customerName: 'Sophia Reed', packageTitle: 'Swiss Alps Scenic Glacier Express', grossAmount: 1985, commissionRate: 12.5, commissionAmount: 248.13, status: 'In Escrow', date: '2026-11-15' },
      { id: 'TXN-AG-7704', bookingRef: '#TS-BK-4512', customerName: 'Marcus Aurelius', packageTitle: 'Maldives Overwater Luxury Escape', grossAmount: 2090, commissionRate: 12.5, commissionAmount: 261.25, status: 'In Escrow', date: '2026-11-12' }
    ];
  }, []);

  const handleSaveAgencyProfile = (e) => {
    e.preventDefault();
    if (passwordData.newPassword) {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setActionMsg('New passwords do not match. Please verify.');
        setTimeout(() => setActionMsg(''), 4000);
        return;
      }
    }
    try {
      localStorage.setItem('ts_agency_profile', JSON.stringify(agencyProfile));
      localStorage.setItem('ts_agent_personal_profile', JSON.stringify(agentProfile));
    } catch { /* ignore */ }
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setActionMsg('Agency & Personal Agent credentials updated successfully!');
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleRequestPayout = () => {
    setPayoutRequested(true);
    setActionMsg('Commission payout request submitted to Finance (Process 5.0). Expected clearance: 24-48 hrs.');
    setTimeout(() => setActionMsg(''), 5000);
  };

  // Reply inquiry modal state
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyText, setReplyText] = useState('');

  const loadAgentData = async () => {
    try {
      const res = await dashboardService.getAgentData();
      setPackages(res.packages || []);
      setInquiries(res.inquiries || []);
      setBookings(res.bookings || []);
      setTripPlans(res.tripPlans || []);
    } catch (err) {
      console.error('Failed to load agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProposeQuote = (planId) => {
    setActionMsg(`Custom quote sent to customer for Trip Plan #${planId}!`);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    await dashboardService.updateAgentBookingStatus(bookingId, newStatus);
    setActionMsg(`Booking #${bookingId} status updated to ${newStatus}`);
    setTimeout(() => setActionMsg(''), 3000);
    loadAgentData();
  };

  useEffect(() => {
    const role = (user?.role || '').toUpperCase();
    if (!user || (role !== 'TRAVEL_AGENT' && role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
      navigate('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load; state is set after the awaited request
    loadAgentData();
  }, [user, navigate]);

  const handleOpenNewPkgModal = () => {
    setEditingPkg(null);
    setPkgFormData({
      title: '',
      category: 'Culture & Heritage',
      location: '',
      days: 5,
      nights: 4,
      price: 1200,
      availability: 'Available',
      maxCapacity: 15,
      promo: '10% OFF Early Bird',
      discountType: 'percentage',
      discountValue: 10,
      imageUrl: '/destination-images/bali.webp',
      description: '',
      is_active: true
    });
    setShowPkgModal(true);
  };

  const handleOpenEditPkgModal = (pkg) => {
    setEditingPkg(pkg);
    const hasFixed = (pkg.promo || '').includes('$');
    const match = (pkg.promo || '').match(/\d+/);
    const val = match ? parseInt(match[0]) : 10;
    setPkgFormData({
      title: pkg.title,
      category: pkg.category,
      location: pkg.location,
      days: pkg.days,
      nights: pkg.nights,
      price: pkg.price,
      availability: pkg.availability,
      maxCapacity: pkg.maxCapacity || 15,
      promo: pkg.promo || '',
      discountType: hasFixed ? 'fixed' : 'percentage',
      discountValue: val,
      imageUrl: pkg.imageUrl,
      description: pkg.description || '',
      is_active: pkg.is_active !== false
    });
    setShowPkgModal(true);
  };

  const handleTogglePkgActive = async (pkgId) => {
    await dashboardService.togglePackageActive(pkgId);
    setActionMsg('Tour Package visibility updated.');
    setTimeout(() => setActionMsg(''), 2500);
    loadAgentData();
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    const computedPromo = pkgFormData.discountValue > 0
      ? (pkgFormData.discountType === 'percentage'
          ? `${pkgFormData.discountValue}% OFF Promo`
          : `$${pkgFormData.discountValue} Flat Discount`)
      : (pkgFormData.promo || '');

    const pkgToSave = {
      ...(editingPkg ? { ...pkgFormData, id: editingPkg.id } : pkgFormData),
      promo: computedPromo
    };
    await dashboardService.saveAgentPackage(pkgToSave);
    setActionMsg(editingPkg ? 'Tour Package updated successfully!' : 'New Tour Package created!');
    setShowPkgModal(false);
    setTimeout(() => setActionMsg(''), 3000);
    loadAgentData();
  };

  const handleDeletePackage = async (pkgId) => {
    if (window.confirm('Are you sure you want to remove this tour package?')) {
      await dashboardService.deleteAgentPackage(pkgId);
      setActionMsg('Package removed from catalog.');
      setTimeout(() => setActionMsg(''), 3000);
      loadAgentData();
    }
  };

  const handleSendReply = async (inquiryId) => {
    if (!replyText.trim()) return;
    const currentReply = replyText.trim();
    setInquiries(prev => prev.map(inq => inq.id === inquiryId ? { ...inq, status: 'Replied', reply: currentReply } : inq));
    await dashboardService.replyInquiry(inquiryId, currentReply);
    setActionMsg('Response sent to customer inquiry.');
    setSelectedInquiry(null);
    setReplyText('');
    setTimeout(() => setActionMsg(''), 3000);
    loadAgentData();
  };

  // Automated Payment Reminder
  const handleSendPaymentReminder = async (bookingId, customerName, amount) => {
    await dashboardService.sendPaymentReminder(bookingId, customerName, amount);
    setActionMsg(`Automatic payment reminder dispatched to ${customerName} for booking #${bookingId}!`);
    setTimeout(() => setActionMsg(''), 4000);
  };

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const q = bookingSearch.toLowerCase();
      const matchesSearch = 
        String(b.id || '').toLowerCase().includes(q) ||
        String(b.customerName || '').toLowerCase().includes(q) ||
        String(b.packageTitle || '').toLowerCase().includes(q);
      const matchesStatus = 
        bookingStatusFilter === 'all' || 
        String(b.status || '').toLowerCase() === bookingStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [bookings, bookingSearch, bookingStatusFilter]);

  // Filtered Inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      const q = inquirySearch.toLowerCase();
      const matchesSearch = 
        String(inq.id || '').toLowerCase().includes(q) ||
        String(inq.customerName || '').toLowerCase().includes(q) ||
        String(inq.packageTitle || '').toLowerCase().includes(q) ||
        String(inq.message || '').toLowerCase().includes(q);
      const matchesStatus = 
        inquiryStatusFilter === 'all' || 
        String(inq.status || '').toLowerCase() === inquiryStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [inquiries, inquirySearch, inquiryStatusFilter]);

  // Filtered Packages
  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      const q = pkgSearch.toLowerCase();
      const matchesSearch = 
        String(pkg.title || '').toLowerCase().includes(q) ||
        String(pkg.location || '').toLowerCase().includes(q) ||
        String(pkg.description || '').toLowerCase().includes(q);
      const matchesCategory = 
        pkgCategoryFilter === 'all' || 
        String(pkg.category || '').toLowerCase() === pkgCategoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [packages, pkgSearch, pkgCategoryFilter]);

  // Calculated Metrics
  const activePackagesCount = packages.filter(p => p.is_active !== false).length;
  const pendingInquiriesCount = inquiries.filter(i => (i.status || '').toLowerCase() === 'pending').length;
  const confirmedBookingsCount = bookings.filter(b => (b.status || '').toLowerCase() === 'confirmed').length;
  const pendingBookingsCount = bookings.filter(b => (b.status || '').toLowerCase() === 'pending').length;
  const grossSalesVolume = bookings
    .filter(b => (b.status || '').toLowerCase() !== 'cancelled')
    .reduce((sum, b) => sum + (Number(b.amount) || 0), 0) || 8469;

  return (
    <div className="agent-dashboard-container">
      {/* 1. TOP HEADER & NAVIGATION BAR */}
      <div className="agent-header">
        <div className="agent-header-content">
          <div className="agent-title-badge">
            <div className="agent-logo-box">
              <Compass size={28} className="agent-logo-icon" />
            </div>
            <div>
              <div className="agent-title-row">
                <h2>{agencyProfile.agency_name || 'Horizon Escapes & Expeditions'}</h2>
                <span className="agent-license-badge">
                  ★ IATA & ASTA Accredited
                </span>
              </div>
              <p className="agent-header-subtitle">
                Licensed Global Tour Operator • License #{agencyProfile.license_number || 'AGT-8829-NY-2026'}
              </p>
            </div>
          </div>

          <div className="agent-header-actions">
            {/* Branch Selector Pill */}
            <div className="agent-branch-select-box">
              <Building size={14} className="agent-branch-icon" />
              <div className="agent-branch-inner">
                <span className="agent-branch-label">Branch Hub:</span>
                <select 
                  value={selectedBranch} 
                  onChange={e => setSelectedBranch(e.target.value)}
                  className="agent-branch-dropdown"
                >
                  <option value="New York Global Flagship">New York Flagship (#AGT-8829-NY)</option>
                  <option value="London European Operations">London Operations (#AGT-8829-LDN)</option>
                  <option value="Tokyo Asia-Pacific Division">Tokyo Division (#AGT-8829-TYO)</option>
                  <option value="Zurich Alpine Expeditions Hub">Zurich Alpine Hub (#AGT-8829-ZRH)</option>
                </select>
              </div>
            </div>

            {/* Notification Bell */}
            <div className="agent-notification-wrapper">
              <button 
                type="button" 
                className="agent-bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
              >
                <Bell size={20} />
                {notifications.some(n => n.unread) && (
                  <span className="agent-bell-badge">
                    {notifications.filter(n => n.unread).length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="agent-notifications-dropdown">
                  <div className="dropdown-header">
                    <h4>Agent Notifications</h4>
                    <button 
                      type="button" 
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                      className="mark-all-read-btn"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="notifications-list">
                    {notifications.map(n => (
                      <div key={n.id} className={`notification-item ${n.unread ? 'unread' : ''}`}>
                        <p>{n.text}</p>
                        <span className="notification-time">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Agent Profile Pill */}
            <div className="agent-user-profile">
              <div className="agent-avatar">
                {agentProfile.avatarUrl ? (
                  <img src={agentProfile.avatarUrl} alt="Agent" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : null}
                <span>{agentProfile.fullName?.charAt(0) || 'S'}</span>
              </div>
              <div className="agent-info">
                <span className="agent-name">{agentProfile.fullName}</span>
                <span className="agent-role-tag">{agentProfile.title}</span>
              </div>
              <button 
                className="agent-logout-btn" 
                onClick={() => { logout(); navigate('/login'); }}
                title="Sign out of Agent Portal"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="agent-toast-message">
          <CheckCircle size={18} /> {actionMsg}
        </div>
      )}

      {/* 2. REORDERED & POLISHED DASHBOARD TABS BAR */}
      <div className="agent-tabs-bar">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <TrendingUp size={17} /> Overview & Analytics
        </button>
        <button className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`} onClick={() => setActiveTab('packages')}>
          <Package size={17} /> Tour Packages Catalog ({packages.length})
        </button>
        <button className={`tab-btn ${activeTab === 'itineraries' ? 'active' : ''}`} onClick={() => setActiveTab('itineraries')}>
          <Calendar size={17} /> Itineraries & Schedules
        </button>
        <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
          <Users size={17} /> Customer Bookings ({bookings.length})
          {pendingBookingsCount > 0 && <span className="tab-badge alert">{pendingBookingsCount}</span>}
        </button>
        <button className={`tab-btn ${activeTab === 'inquiries' ? 'active' : ''}`} onClick={() => setActiveTab('inquiries')}>
          <MessageSquare size={17} /> Customer Inquiries 
          {pendingInquiriesCount > 0 && <span className="tab-badge alert">{pendingInquiriesCount}</span>}
        </button>
        <button className={`tab-btn ${activeTab === 'tripplans' ? 'active' : ''}`} onClick={() => setActiveTab('tripplans')}>
          <Compass size={17} /> Custom Trip Plans ({tripPlans.length})
        </button>
        <button className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
          <CreditCard size={17} /> Payments & Escrow (DFD 5.0)
        </button>
        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <Building2 size={17} /> Agency & Agent Profile
        </button>
      </div>

      <div className="agent-content-area">
        {loading ? (
          <div className="agent-loading-state">
            <Clock size={32} className="spin-icon" />
            <p>Loading agent portal data...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: EXECUTIVE OVERVIEW & ANALYTICS */}
            {activeTab === 'overview' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Travel Operations Command Center</h3>
                    <p>Real-time analytics across tour packages, customer reservations, commission revenue, and inquiries.</p>
                  </div>
                  <div className="header-action-group">
                    <button className="btn-create-pkg" onClick={handleOpenNewPkgModal}>
                      <Plus size={18} /> Create New Tour Package
                    </button>
                  </div>
                </div>

                {/* 4 Executive KPI Cards */}
                <div className="agent-kpi-grid">
                  <div className="agent-kpi-card">
                    <div className="agent-kpi-header">
                      <span className="agent-kpi-title">Managed Packages</span>
                      <div className="agent-kpi-icon-wrap emerald">
                        <Package size={20} />
                      </div>
                    </div>
                    <div className="agent-kpi-body">
                      <div className="agent-kpi-value">{packages.length}</div>
                      <div className="agent-kpi-meta">
                        <span className="agent-badge-pill green">{activePackagesCount} Active</span>
                        <span className="agent-meta-sub">Public in Catalog</span>
                      </div>
                    </div>
                  </div>

                  <div className="agent-kpi-card">
                    <div className="agent-kpi-header">
                      <span className="agent-kpi-title">Customer Bookings</span>
                      <div className="agent-kpi-icon-wrap blue">
                        <Users size={20} />
                      </div>
                    </div>
                    <div className="agent-kpi-body">
                      <div className="agent-kpi-value">{bookings.length}</div>
                      <div className="agent-kpi-meta">
                        <span className="agent-badge-pill green">{confirmedBookingsCount} Confirmed</span>
                        <span className="agent-meta-sub">{pendingBookingsCount} Pending</span>
                      </div>
                    </div>
                  </div>

                  <div className="agent-kpi-card">
                    <div className="agent-kpi-header">
                      <span className="agent-kpi-title">Commission Earnings</span>
                      <div className="agent-kpi-icon-wrap gold">
                        <DollarSign size={20} />
                      </div>
                    </div>
                    <div className="agent-kpi-body">
                      <div className="agent-kpi-value">$1,058.63</div>
                      <div className="agent-kpi-meta">
                        <span className="agent-badge-pill gold">{agencyProfile.commission_rate}% Tier</span>
                        <span className="agent-meta-sub">${grossSalesVolume.toLocaleString()} Gross Volume</span>
                      </div>
                    </div>
                  </div>

                  <div className="agent-kpi-card">
                    <div className="agent-kpi-header">
                      <span className="agent-kpi-title">Customer Inquiries</span>
                      <div className="agent-kpi-icon-wrap amber">
                        <MessageSquare size={20} />
                      </div>
                    </div>
                    <div className="agent-kpi-body">
                      <div className="agent-kpi-value">{inquiries.length}</div>
                      <div className="agent-kpi-meta">
                        {pendingInquiriesCount > 0 ? (
                          <span className="agent-badge-pill red">{pendingInquiriesCount} Awaiting Reply</span>
                        ) : (
                          <span className="agent-badge-pill green">All Answered</span>
                        )}
                        <span className="agent-meta-sub">&lt; 2hr Avg Response</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="agent-quick-shortcuts-panel">
                  <h4>Quick Agency Actions</h4>
                  <div className="agent-shortcuts-grid">
                    <button type="button" className="agent-shortcut-btn" onClick={() => setActiveTab('packages')}>
                      <Package size={18} className="shortcut-icon" />
                      <div>
                        <strong>Package Catalog</strong>
                        <span>Manage prices & promos</span>
                      </div>
                      <ArrowRight size={16} className="shortcut-arrow" />
                    </button>
                    <button type="button" className="agent-shortcut-btn" onClick={() => setActiveTab('bookings')}>
                      <Users size={18} className="shortcut-icon" />
                      <div>
                        <strong>Review Bookings</strong>
                        <span>Issue tickets & vouchers</span>
                      </div>
                      <ArrowRight size={16} className="shortcut-arrow" />
                    </button>
                    <button type="button" className="agent-shortcut-btn" onClick={() => setActiveTab('inquiries')}>
                      <MessageSquare size={18} className="shortcut-icon" />
                      <div>
                        <strong>Client Q&A</strong>
                        <span>{pendingInquiriesCount} questions pending</span>
                      </div>
                      <ArrowRight size={16} className="shortcut-arrow" />
                    </button>
                    <button type="button" className="agent-shortcut-btn" onClick={() => setActiveTab('payments')}>
                      <CreditCard size={18} className="shortcut-icon" />
                      <div>
                        <strong>Escrow & Payouts</strong>
                        <span>$509.38 ready for payout</span>
                      </div>
                      <ArrowRight size={16} className="shortcut-arrow" />
                    </button>
                  </div>
                </div>

                {/* Two Column Split: Recent Bookings & Operations Status */}
                <div className="agent-overview-split">
                  {/* Left Column: Recent Bookings Snapshot */}
                  <div className="agent-overview-card">
                    <div className="overview-card-header">
                      <div>
                        <h4>Recent Customer Reservations</h4>
                        <p>Latest bookings submitted across your agency packages</p>
                      </div>
                      <button 
                        type="button" 
                        className="btn-view-all-link"
                        onClick={() => setActiveTab('bookings')}
                      >
                        View All ({bookings.length}) →
                      </button>
                    </div>

                    <div className="agent-table-container">
                      <table className="agent-table">
                        <thead>
                          <tr>
                            <th>Ref</th>
                            <th>Customer</th>
                            <th>Package</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.slice(0, 4).map(b => (
                            <tr key={b.id}>
                              <td><strong>{String(b.id).startsWith('#') ? b.id : `#${b.id}`}</strong></td>
                              <td>{b.customerName}</td>
                              <td>{b.packageTitle}</td>
                              <td>${Number(b.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td>
                                <span className={`status-pill ${String(b.status || '').toLowerCase()}`}>
                                  {b.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn-action-small"
                                  onClick={() => handleUpdateBookingStatus(b.id, 'Confirmed')}
                                  disabled={b.status === 'Confirmed'}
                                  title="Confirm booking"
                                >
                                  <Check size={13} /> {b.status === 'Confirmed' ? 'Confirmed' : 'Confirm'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Column: Operational Credential & Escrow Snapshot */}
                  <div className="agent-overview-card">
                    <div className="overview-card-header">
                      <div>
                        <h4>Agency Credentials & Escrow</h4>
                        <p>Official licensing and funds clearance</p>
                      </div>
                      <span className="status-pill status-active">Verified Partner</span>
                    </div>

                    <div className="agent-ops-credentials">
                      <div className="ops-credential-row">
                        <span className="ops-label">Legal Name:</span>
                        <strong className="ops-val">{agencyProfile.agency_name}</strong>
                      </div>
                      <div className="ops-credential-row">
                        <span className="ops-label">Tourism License:</span>
                        <span className="ops-code">{agencyProfile.license_number}</span>
                      </div>
                      <div className="ops-credential-row">
                        <span className="ops-label">Contracted Commission:</span>
                        <strong className="ops-val" style={{ color: '#059669' }}>{agencyProfile.commission_rate}% Platform Tier</strong>
                      </div>
                      <div className="ops-credential-row">
                        <span className="ops-label">Escrow Balance:</span>
                        <strong className="ops-val" style={{ color: '#d97706', fontSize: '1.1rem' }}>$509.38</strong>
                      </div>
                    </div>

                    <div className="escrow-payout-cta">
                      <p>Funds in escrow are automatically eligible for weekly disbursement to your accredited business bank account.</p>
                      <button 
                        type="button" 
                        className="btn-request-payout-banner"
                        onClick={handleRequestPayout}
                      >
                        <DollarSign size={16} /> {payoutRequested ? 'Payout Submitted' : 'Request Escrow Payout ($509.38)'}
                      </button>
                    </div>

                    <div className="recent-inquiries-box">
                      <h5>Latest Client Inquiry:</h5>
                      {inquiries.length > 0 ? (
                        <div className="mini-inquiry-item">
                          <p className="mini-inquiry-text">&quot;{inquiries[0].message}&quot;</p>
                          <div className="mini-inquiry-footer">
                            <span>From: <strong>{inquiries[0].customerName}</strong> ({inquiries[0].date})</span>
                            <button 
                              type="button" 
                              className="mini-reply-btn"
                              onClick={() => { setActiveTab('inquiries'); setSelectedInquiry(inquiries[0].id); }}
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.82rem', color: '#64748b' }}>No pending inquiries at this time.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PACKAGES CATALOG TAB */}
            {activeTab === 'packages' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Managed Tour Packages & Pricing Catalog</h3>
                    <p>Create, update, and manage travel package availability and promotional discount offers.</p>
                  </div>
                  <button className="btn-create-pkg" onClick={handleOpenNewPkgModal}>
                    <Plus size={18} /> Create New Tour Package
                  </button>
                </div>

                {/* Search & Category Filter Toolbar */}
                <div className="agent-filter-bar">
                  <div className="agent-search-box">
                    <Search size={18} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search packages by title, location, or highlight..."
                      value={pkgSearch}
                      onChange={e => setPkgSearch(e.target.value)}
                    />
                  </div>

                  <div className="agent-filter-pills">
                    {['all', 'Culture & Heritage', 'Honeymoon Specials', 'Beach & Islands', 'Mountain Escapes', 'Luxury & Wellness'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`filter-pill-btn ${pkgCategoryFilter.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
                        onClick={() => setPkgCategoryFilter(cat)}
                      >
                        {cat === 'all' ? 'All Categories' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="agent-packages-grid">
                  {filteredPackages.length === 0 ? (
                    <div className="agent-empty-search">
                      <p>No tour packages match the selected criteria.</p>
                    </div>
                  ) : (
                    filteredPackages.map(pkg => (
                      <div key={pkg.id} className="agent-card">
                        <div className="agent-card-image-wrap">
                          <SmartImage src={pkg.imageUrl} alt={pkg.title} />
                          {pkg.promo && <span className="promo-badge"><Tag size={12} /> {pkg.promo}</span>}
                        </div>

                        <div className="agent-card-body">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <span className="category-text">{pkg.category}</span>
                            <button
                              type="button"
                              onClick={() => handleTogglePkgActive(pkg.id)}
                              style={{
                                padding: '0.2rem 0.55rem',
                                borderRadius: '20px',
                                border: 'none',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                background: pkg.is_active !== false ? '#dcfce7' : '#fee2e2',
                                color: pkg.is_active !== false ? '#15803d' : '#991b1b'
                              }}
                              title="Toggle public visibility"
                            >
                              {pkg.is_active !== false ? '● Active' : '○ Inactive'}
                            </button>
                          </div>
                          <h4>{pkg.title}</h4>
                          <p className="location-text"><MapPin size={14} /> {pkg.location}</p>

                          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.35rem 0 0.6rem', lineHeight: '1.4' }}>
                            {pkg.description || 'Verified all-inclusive regional tour package with guided experiences, premium hotels, and scenic transfers.'}
                          </p>

                          <div className="duration-capacity-row">
                            <span><Clock size={14} /> {pkg.days} Days / {pkg.nights} Nights</span>
                            <span><Users size={14} /> Capacity: {pkg.bookedCount || 0}/{pkg.maxCapacity || 15} Guests</span>
                          </div>

                          <div className="card-footer-row">
                            <div className="price-tag">
                              <span className="price-label">Price per guest</span>
                              <span className="price-num">${pkg.price}</span>
                            </div>
                            <div className="action-btn-group">
                              <button className="btn-icon-edit" onClick={() => handleOpenEditPkgModal(pkg)} title="Edit Package">
                                <Edit size={16} />
                              </button>
                              <button className="btn-icon-delete" onClick={() => handleDeletePackage(pkg.id)} title="Delete Package">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ITINERARIES & SCHEDULES TAB */}
            {activeTab === 'itineraries' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Package Itineraries & Tour Schedules</h3>
                    <p>Manage daily itineraries, pickup schedules, and sightseeing landmarks.</p>
                  </div>
                </div>

                <div className="itineraries-list">
                  {packages.map(pkg => (
                    <div key={pkg.id} className="itinerary-card">
                      <div className="itinerary-header">
                        <h4>{pkg.title} ({pkg.location})</h4>
                        <span className="availability-tag">{pkg.availability}</span>
                      </div>

                      <div className="itinerary-days">
                        {(pkg.itinerary || [
                          { day: 1, title: 'Arrival & Welcome Dinner' },
                          { day: 2, title: 'Guided Landmark Excursion' },
                          { day: 3, title: 'Leisure Day & Culture Walk' }
                        ]).map((day, idx) => (
                          <div key={idx} className="day-step">
                            <span className="day-number">Day {day.day}</span>
                            <span className="day-title">{day.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: CUSTOMER PACKAGE BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Confirmed Customer Package Bookings</h3>
                    <p>Review customer reservations for tour packages managed by your agency.</p>
                  </div>
                </div>

                {/* Search & Status Filters */}
                <div className="agent-filter-bar">
                  <div className="agent-search-box">
                    <Search size={18} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search bookings by ref #, guest name, or tour package..."
                      value={bookingSearch}
                      onChange={e => setBookingSearch(e.target.value)}
                    />
                  </div>

                  <div className="agent-filter-pills">
                    {['all', 'confirmed', 'pending', 'cancelled'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`filter-pill-btn ${bookingStatusFilter === st ? 'active' : ''}`}
                        onClick={() => setBookingStatusFilter(st)}
                      >
                        {st.charAt(0).toUpperCase() + st.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="agent-table-container">
                  <table className="agent-table">
                    <thead>
                      <tr>
                        <th>Booking Ref</th>
                        <th>Customer Name</th>
                        <th>Booked Package</th>
                        <th>Travel Dates</th>
                        <th>Guests</th>
                        <th>Total Revenue</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                            No customer package bookings match your search.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map(b => (
                          <tr key={b.id}>
                            <td><strong>{String(b.id).startsWith('#') ? b.id : `#${b.id}`}</strong></td>
                            <td>{b.customerName}</td>
                            <td>{b.packageTitle}</td>
                            <td>{b.schedule}</td>
                            <td>{b.guests} Guests</td>
                            <td>${Number(b.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td>
                              <span className={`status-pill ${String(b.status || '').toLowerCase()}`}>
                                {b.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <button
                                  className="btn-confirm-action"
                                  style={{
                                    padding: '0.4rem 0.75rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: '#16a34a',
                                    color: '#ffffff',
                                    fontWeight: '600',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                  }}
                                  onClick={() => handleUpdateBookingStatus(b.id, 'Confirmed')}
                                  disabled={b.status === 'Confirmed'}
                                  title="Confirm this package booking"
                                >
                                  <CheckCircle size={14} /> Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendPaymentReminder(b.id, b.customerName, b.amount)}
                                  style={{
                                    padding: '0.4rem 0.65rem',
                                    borderRadius: '6px',
                                    border: '1px solid #bae6fd',
                                    background: '#f0f9ff',
                                    color: '#0284c7',
                                    fontWeight: '700',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem'
                                  }}
                                  title="Send automated payment reminder notification"
                                >
                                  🔔 Remind
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    generateBookingPDF({
                                      bookingId: b.id,
                                      customerName: b.customerName,
                                      customerEmail: 'customer@travelsphere.org',
                                      totalAmount: b.amount,
                                      currency: 'USD',
                                      date: new Date().toLocaleDateString(),
                                      items: [
                                        {
                                          type: 'Tour Package',
                                          title: b.packageTitle,
                                          details: `${b.schedule} • ${b.guests} Guests`,
                                          price: b.amount
                                        }
                                      ]
                                    });
                                  }}
                                  style={{
                                    padding: '0.4rem 0.65rem',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    background: '#f8fafc',
                                    color: '#334155',
                                    fontWeight: '600',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem'
                                  }}
                                  title="Download Tour Package PDF Voucher"
                                >
                                  <FileDown size={14} /> Voucher
                                </button>
                                <button
                                  className="btn-cancel-action"
                                  style={{
                                    padding: '0.4rem 0.75rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: '#dc2626',
                                    color: '#ffffff',
                                    fontWeight: '600',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                  }}
                                  onClick={() => handleUpdateBookingStatus(b.id, 'Cancelled')}
                                  disabled={b.status === 'Cancelled'}
                                  title="Cancel this booking"
                                >
                                  <Trash2 size={14} /> Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: CUSTOMER INQUIRIES TAB */}
            {activeTab === 'inquiries' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Customer Inquiries & Q&A</h3>
                    <p>Respond to customer questions regarding itineraries, meal plans, and departure dates.</p>
                  </div>
                </div>

                {/* Inquiry Search & Status Filters */}
                <div className="agent-filter-bar">
                  <div className="agent-search-box">
                    <Search size={18} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search inquiries by customer name, tour package, or question..."
                      value={inquirySearch}
                      onChange={e => setInquirySearch(e.target.value)}
                    />
                  </div>

                  <div className="agent-filter-pills">
                    {['all', 'pending', 'replied'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`filter-pill-btn ${inquiryStatusFilter === st ? 'active' : ''}`}
                        onClick={() => setInquiryStatusFilter(st)}
                      >
                        {st.charAt(0).toUpperCase() + st.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="inquiries-grid">
                  {filteredInquiries.length === 0 ? (
                    <div className="agent-empty-search" style={{ gridColumn: '1 / -1' }}>
                      <p>No customer inquiries found matching your filters.</p>
                    </div>
                  ) : (
                    filteredInquiries.map(inq => (
                      <div key={inq.id} className="inquiry-card">
                        <div className="inq-header">
                          <span className="inq-id">{inq.id}</span>
                          <span className={`status-pill ${String(inq.status || '').toLowerCase()}`}>{inq.status}</span>
                        </div>
                        <h4>{inq.packageTitle}</h4>
                        <p className="inq-meta">From: <strong>{inq.customerName}</strong> • {inq.date}</p>
                        <div className="inq-message-box">&quot;{inq.message}&quot;</div>

                        {inq.reply ? (
                          <div className="inq-reply-box">
                            <strong>Your Agent Reply:</strong> {inq.reply}
                          </div>
                        ) : (
                          <div className="inq-form">
                            <input 
                              type="text" 
                              placeholder="Type agent reply to customer..."
                              value={selectedInquiry === inq.id ? replyText : ''}
                              onChange={e => { setSelectedInquiry(inq.id); setReplyText(e.target.value); }}
                            />
                            <button className="btn-send-reply" onClick={() => handleSendReply(inq.id)}>
                              <Send size={16} /> Send Reply
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: CUSTOM TRIP PLANS TAB - DFD Fig 5 Process 4.0 */}
            {activeTab === 'tripplans' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Customer Custom Trip Plans (DFD Process 4.0)</h3>
                    <p>Review custom itineraries and travel plans submitted by customers. Send quotes or confirm arrangements.</p>
                  </div>
                </div>

                {tripPlans.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                    <Compass size={40} color="#059669" style={{ marginBottom: '1rem', opacity: 0.7 }} />
                    <h4 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>No Custom Trip Plans Yet</h4>
                    <p>When customers generate and save custom itineraries in the Itinerary Planner, they appear here for your agency to review and quote.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                    {tripPlans.map((plan) => (
                      <div key={plan.tplan_id || plan.id} className="itinerary-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Plan #{plan.tplan_id || plan.id}
                            </span>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                              {plan.title || `Custom Trip to Destination #${plan.destination_id || 'Global'}`}
                            </h4>
                          </div>
                          <span className="availability-tag" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                            {plan.status || 'Active Plan'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                          <span><strong>{plan.days || 5}</strong> Days</span>
                          <span>•</span>
                          <span><strong>{plan.nights || 4}</strong> Nights</span>
                          <span>•</span>
                          <span>Budget: <strong style={{ color: '#0f172a' }}>${plan.budget || plan.price || 1200}</strong></span>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                          <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>Itinerary Highlights:</p>
                          <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            {typeof plan.itinerary === 'string' ? plan.itinerary : Array.isArray(plan.itinerary) ? plan.itinerary.map((d, i) => <div key={i}>Day {i+1}: {d.title || d.activity || JSON.stringify(d)}</div>) : 'Custom tailored itinerary with accommodations, private transfers, and excursions.'}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            type="button"
                            className="btn-confirm-action"
                            style={{
                              flex: 1,
                              padding: '0.6rem 1rem',
                              borderRadius: '8px',
                              border: 'none',
                              background: '#059669',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem'
                            }}
                            onClick={() => handleProposeQuote(plan.tplan_id || plan.id)}
                          >
                            <Send size={14} /> Propose Quote
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: PAYMENTS & COMMISSION MANAGEMENT TAB (DFD Fig 5, Process 5.0) */}
            {activeTab === 'payments' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Payment Management & Commission Escrow (DFD Process 5.0)</h3>
                    <p>Track agency gross bookings, verified customer payments, automated 12.5% commissions, and financial disbursements.</p>
                  </div>
                  <button 
                    type="button" 
                    className="btn-add-package" 
                    onClick={handleRequestPayout}
                    style={{ background: '#059669', borderColor: '#059669' }}
                  >
                    <DollarSign size={18} /> {payoutRequested ? 'Payout Processing...' : 'Request Commission Payout'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.25rem', marginBottom: '1.75rem' }}>
                  <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Gross Bookings Volume</span>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>${grossSalesVolume.toLocaleString()}.00</div>
                    <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>4 Confirmed Itineraries</span>
                  </div>
                  <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Agency Commission</span>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>{agencyProfile.commission_rate}%</div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Fixed Platform Tier</span>
                  </div>
                  <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Earned</span>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>$1,058.63</div>
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Cumulative 2026</span>
                  </div>
                  <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Escrow Balance</span>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>$509.38</div>
                    <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>Eligible for Payout</span>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="agent-data-table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Booking Ref</th>
                        <th>Customer</th>
                        <th>Package Title</th>
                        <th>Gross Booking</th>
                        <th>Commission (12.5%)</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentTransactions.map((txn) => (
                        <tr key={txn.id}>
                          <td><strong>{txn.id}</strong></td>
                          <td><code>{txn.bookingRef}</code></td>
                          <td>{txn.customerName}</td>
                          <td>{txn.packageTitle}</td>
                          <td><strong>${txn.grossAmount.toLocaleString()}</strong></td>
                          <td><strong style={{ color: '#059669' }}>+${txn.commissionAmount.toFixed(2)}</strong></td>
                          <td>
                            <span className={`status-pill ${txn.status === 'Disbursed' ? 'status-active' : 'status-pending'}`}>
                              {txn.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{txn.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 8: AGENCY & AGENT PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Agency & Agent Operations Profile</h3>
                    <p>Manage your official agency credentials, license registration, staff access, and security settings.</p>
                  </div>
                </div>

                <div className="agent-profile-layout">
                  <form onSubmit={handleSaveAgencyProfile} className="agent-profile-combined-form">
                    {/* SECTION 1: PERSONAL AGENT CREDENTIALS */}
                    <div className="profile-section-card">
                      <div className="section-card-title">
                        <UserCheck size={20} className="section-icon" />
                        <div>
                          <h4>Personal Agent Credentials & Staff Access</h4>
                          <p>Individual agent identity, contact info, and portal avatar</p>
                        </div>
                      </div>

                      <div className="profile-avatar-row">
                        <div className="profile-avatar-preview">
                          {agentProfile.avatarUrl ? (
                            <img src={agentProfile.avatarUrl} alt="Preview" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          ) : null}
                          <span>{agentProfile.fullName?.charAt(0) || 'S'}</span>
                        </div>
                        <div className="profile-avatar-inputs">
                          <label>Profile Avatar URL (High Res Photo)</label>
                          <input 
                            type="url" 
                            value={agentProfile.avatarUrl || ''} 
                            onChange={e => setAgentProfile({ ...agentProfile, avatarUrl: e.target.value })}
                            placeholder="https://images.unsplash.com/photo-..." 
                          />
                          <span className="input-hint">Displayed in the header and customer inquiry responses.</span>
                        </div>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Agent Full Name</label>
                          <input 
                            type="text" 
                            value={agentProfile.fullName} 
                            onChange={e => setAgentProfile({ ...agentProfile, fullName: e.target.value })} 
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label>Staff Identification No.</label>
                          <input 
                            type="text" 
                            value={agentProfile.staffId} 
                            onChange={e => setAgentProfile({ ...agentProfile, staffId: e.target.value })} 
                            required 
                          />
                        </div>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Agent Role / Job Title</label>
                          <input 
                            type="text" 
                            value={agentProfile.title} 
                            onChange={e => setAgentProfile({ ...agentProfile, title: e.target.value })} 
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label>Assigned Operations Branch</label>
                          <select 
                            value={agentProfile.branchAssigned} 
                            onChange={e => {
                              setAgentProfile({ ...agentProfile, branchAssigned: e.target.value });
                              setSelectedBranch(e.target.value);
                            }}
                          >
                            <option value="New York Global Flagship">New York Global Flagship</option>
                            <option value="London European Operations">London European Operations</option>
                            <option value="Tokyo Asia-Pacific Division">Tokyo Asia-Pacific Division</option>
                            <option value="Zurich Alpine Expeditions Hub">Zurich Alpine Expeditions Hub</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Agent Direct Email</label>
                          <input 
                            type="email" 
                            value={agentProfile.email} 
                            onChange={e => setAgentProfile({ ...agentProfile, email: e.target.value })} 
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label>Agent Direct Phone / Mobile</label>
                          <input 
                            type="tel" 
                            value={agentProfile.phone} 
                            onChange={e => setAgentProfile({ ...agentProfile, phone: e.target.value })} 
                            required 
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: OFFICIAL AGENCY CREDENTIALS */}
                    <div className="profile-section-card">
                      <div className="section-card-title">
                        <Building2 size={20} className="section-icon" />
                        <div>
                          <h4>Official Agency Credentials & Licensing</h4>
                          <p>Government tourism accreditation and IATA partner registration</p>
                        </div>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Agency Legal Name</label>
                          <input 
                            type="text" 
                            value={agencyProfile.agency_name} 
                            onChange={e => setAgencyProfile({ ...agencyProfile, agency_name: e.target.value })} 
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label>Tourism License Number (DOT / IATA)</label>
                          <input 
                            type="text" 
                            value={agencyProfile.license_number} 
                            onChange={e => setAgencyProfile({ ...agencyProfile, license_number: e.target.value })} 
                            required 
                          />
                        </div>
                      </div>

                      <div className="form-grid-3">
                        <div className="form-group">
                          <label>Contracted Commission Rate (%)</label>
                          <input 
                            type="number" 
                            step="0.1" 
                            value={agencyProfile.commission_rate} 
                            onChange={e => setAgencyProfile({ ...agencyProfile, commission_rate: parseFloat(e.target.value) || 0 })} 
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label>Industry Experience (Years)</label>
                          <input 
                            type="number" 
                            value={agencyProfile.experience_years} 
                            onChange={e => setAgencyProfile({ ...agencyProfile, experience_years: parseInt(e.target.value, 10) || 0 })} 
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label>Accreditations</label>
                          <input 
                            type="text" 
                            value={agencyProfile.accreditation} 
                            onChange={e => setAgencyProfile({ ...agencyProfile, accreditation: e.target.value })} 
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Destinations Portfolio Covered</label>
                        <input 
                          type="text" 
                          value={agencyProfile.destinations_covered} 
                          onChange={e => setAgencyProfile({ ...agencyProfile, destinations_covered: e.target.value })} 
                          required 
                        />
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Official Inquiries Email</label>
                          <input 
                            type="email" 
                            value={agencyProfile.contact_email} 
                            onChange={e => setAgencyProfile({ ...agencyProfile, contact_email: e.target.value })} 
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label>Dedicated Telephone / Hotline</label>
                          <input 
                            type="text" 
                            value={agencyProfile.contact_phone} 
                            onChange={e => setAgencyProfile({ ...agencyProfile, contact_phone: e.target.value })} 
                            required 
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Registered Headquarters / Office Address</label>
                        <input 
                          type="text" 
                          value={agencyProfile.office_address} 
                          onChange={e => setAgencyProfile({ ...agencyProfile, office_address: e.target.value })} 
                          required 
                        />
                      </div>
                    </div>

                    {/* SECTION 3: CHANGE PORTAL PASSWORD */}
                    <div className="profile-section-card">
                      <div className="section-card-title">
                        <Lock size={20} className="section-icon" />
                        <div>
                          <h4>Change Portal Password</h4>
                          <p>Secure your agency operations portal account</p>
                        </div>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>New Password</label>
                          <input 
                            type="password" 
                            value={passwordData.newPassword} 
                            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                            placeholder="••••••••••••" 
                          />
                        </div>
                        <div className="form-group">
                          <label>Confirm New Password</label>
                          <input 
                            type="password" 
                            value={passwordData.confirmPassword} 
                            onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
                            placeholder="••••••••••••" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* SAVE BUTTON */}
                    <div className="profile-save-row">
                      <button 
                        type="submit" 
                        className="btn-save-profile"
                      >
                        <Save size={18} /> Save Agency & Staff Profile
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* PACKAGE CREATION/EDIT MODAL */}
      {showPkgModal && createPortal(
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="agent-modal-card">
            <h3>{editingPkg ? 'Edit Tour Package' : 'Create New Tour Package'}</h3>
            <form onSubmit={handleSavePackage}>
              <div className="form-group">
                <label>Package Title</label>
                <input 
                  type="text" 
                  value={pkgFormData.title} 
                  onChange={e => setPkgFormData({ ...pkgFormData, title: e.target.value })}
                  required
                  placeholder="e.g. Kyoto Cherry Blossom & Temple Discovery"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={pkgFormData.category} 
                    onChange={e => setPkgFormData({ ...pkgFormData, category: e.target.value })}
                  >
                    <option value="Culture & Heritage">Culture & Heritage</option>
                    <option value="Honeymoon Specials">Honeymoon Specials</option>
                    <option value="Beach & Islands">Beach & Islands</option>
                    <option value="Mountain Escapes">Mountain Escapes</option>
                    <option value="Luxury & Wellness">Luxury & Wellness</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Destination Location</label>
                  <input 
                    type="text" 
                    value={pkgFormData.location} 
                    onChange={e => setPkgFormData({ ...pkgFormData, location: e.target.value })}
                    required
                    placeholder="e.g. Kyoto, Japan"
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label>Days</label>
                  <input 
                    type="number" 
                    value={pkgFormData.days} 
                    onChange={e => setPkgFormData({ ...pkgFormData, days: parseInt(e.target.value) || 1 })}
                    required 
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Nights</label>
                  <input 
                    type="number" 
                    value={pkgFormData.nights} 
                    onChange={e => setPkgFormData({ ...pkgFormData, nights: parseInt(e.target.value) || 0 })}
                    required 
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Price per Guest ($)</label>
                  <input 
                    type="number" 
                    value={pkgFormData.price} 
                    onChange={e => setPkgFormData({ ...pkgFormData, price: parseFloat(e.target.value) || 0 })}
                    required 
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Discount Type</label>
                  <select
                    value={pkgFormData.discountType || 'percentage'}
                    onChange={e => setPkgFormData({ ...pkgFormData, discountType: e.target.value })}
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Fixed Flat Discount ($)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Discount Value ({pkgFormData.discountType === 'percentage' ? '%' : '$'})</label>
                  <input 
                    type="number" 
                    value={pkgFormData.discountValue || 0} 
                    onChange={e => setPkgFormData({ ...pkgFormData, discountValue: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g. 15"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Promotional Offer Tag</label>
                  <input 
                    type="text" 
                    value={pkgFormData.promo} 
                    onChange={e => setPkgFormData({ ...pkgFormData, promo: e.target.value })}
                    placeholder="e.g. 15% OFF Early Bird"
                  />
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input 
                    type="text" 
                    value={pkgFormData.imageUrl} 
                    onChange={e => setPkgFormData({ ...pkgFormData, imageUrl: e.target.value })}
                    placeholder="/destination-images/ladakh.webp"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Package Description & Highlights</label>
                <textarea 
                  value={pkgFormData.description || ''} 
                  onChange={e => setPkgFormData({ ...pkgFormData, description: e.target.value })}
                  placeholder="Comprehensive day-by-day highlights, included meals, passes, and guides..."
                  rows="3"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.75rem 0 1.25rem' }}>
                <input
                  type="checkbox"
                  id="agent-pkg-active-check"
                  checked={pkgFormData.is_active !== false}
                  onChange={e => setPkgFormData({ ...pkgFormData, is_active: e.target.checked })}
                />
                <label htmlFor="agent-pkg-active-check" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>
                  Active Tour Package (Published in Public Explore Catalog)
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowPkgModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Package</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AgentDashboard;
