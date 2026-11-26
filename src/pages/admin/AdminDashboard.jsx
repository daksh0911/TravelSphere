import { lazy, Suspense, useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Package, 
  CheckCircle, 
  DollarSign, 
  BarChart3,
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  Search, 
  Filter, 
  TrendingUp, 
  AlertCircle, 
  FileText,
  LogOut,
  Edit,
  Check,
  X,
  UserCheck,
  MapPin,
  Tag,
  HelpCircle,
  Star,
  Plus,
  Trash2,
  Mail,
  Send,
  Bell,
  UserCog,
  Save
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import dashboardService from '../../services/dashboardDataService';
import './AdminDashboard.css';
import SmartImage from '../../components/common/SmartImage';
const AdminAnalytics = lazy(() => import('./AdminAnalytics'));

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const initialAdminData = useMemo(() => {
    return dashboardService.getAdminDataSync ? dashboardService.getAdminDataSync() : { users: [], packages: [], complaints: [], contactMessages: [], bookings: [], destinations: [], coupons: [], faqs: [], reviews: [], stats: {} };
  }, []);
  const [data, setData] = useState(initialAdminData);
  const [loading, setLoading] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  // Contact Messages state
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactReplyText, setContactReplyText] = useState('');

  // Editing package price modal state
  const [editingPackage, setEditingPackage] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  // Destination Management state (Task 6)
  const [showDestModal, setShowDestModal] = useState(false);
  const [editingDest, setEditingDest] = useState(null);
  const [destForm, setDestForm] = useState({ name: '', country: '', description: '', best_time_to_visit: '', image_url: '', price: 1250, is_active: true });

  // Package Create/Edit state (Task 6)
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [pkgFormData, setPkgFormData] = useState({
    title: '', category: 'Culture & Heritage', location: '', days: 5, nights: 4, price: 1200, promo: '', imageUrl: '/package-images/5-kyoto.webp', description: '', is_active: true
  });

  // Admin Profile & Notifications state
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [adminProfile, setAdminProfile] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('ts_admin_profile') || '{}');
      if (stored.name) return stored;
    } catch { /* ignore */ }
    return {
      name: user?.name || 'System Administrator',
      email: user?.email || 'admin@travelsphere.org',
      phone: user?.phone || '+1-555-0100',
      photoUrl: '/destination-images/swiss-alps.webp',
      lastLogin: user?.last_login || '2026-11-21 18:30 UTC'
    };
  });
  const [profileMsg, setProfileMsg] = useState('');

  // Coupon Management state (Task 6)
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '', discount_type: 'percentage', discount_value: 15, min_amount: 100, max_uses: 200, expires_at: '2027-12-31'
  });

  // FAQ Management state
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'General', sort_order: 1, is_active: true });

  const loadAdminData = async () => {
    try {
      const res = await dashboardService.getAdminData();
      setData(res);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = (user?.role || '').toUpperCase();
    if (!user || (role !== 'ADMIN' && role !== 'ADMINISTRATOR' && role !== 'SUPER_ADMIN')) {
      navigate('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load; state is set after the awaited request
    loadAdminData();
  }, [user, navigate]);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await dashboardService.updateUserStatus(userId, nextStatus);
    setActionMsg(`User account status updated to ${nextStatus}`);
    setTimeout(() => setActionMsg(''), 3000);
    loadAdminData();
  };

  const handleApproveProvider = async (userId, role = 'agent') => {
    await dashboardService.approveProvider(userId, role);
    setActionMsg('Service Provider account approved successfully!');
    setTimeout(() => setActionMsg(''), 3000);
    loadAdminData();
  };

  const handleRejectProvider = async (userId, role = 'agent') => {
    await dashboardService.rejectProvider(userId, role);
    setActionMsg('Service Provider account rejected and access blocked.');
    setTimeout(() => setActionMsg(''), 3000);
    loadAdminData();
  };

  const handleResolveComplaint = async (complaintId) => {
    await dashboardService.resolveComplaint(complaintId, replyText);
    setActionMsg('Complaint status updated to Resolved');
    setSelectedComplaint(null);
    setReplyText('');
    setTimeout(() => setActionMsg(''), 3000);
    loadAdminData();
  };

  const handleSavePackagePrice = async (e) => {
    e.preventDefault();
    if (!editingPackage || !newPrice) return;
    await dashboardService.saveAgentPackage({ ...editingPackage, price: parseFloat(newPrice) });
    setActionMsg(`Updated package price to $${newPrice}`);
    setEditingPackage(null);
    setNewPrice('');
    setTimeout(() => setActionMsg(''), 3000);
    loadAdminData();
  };

  // Destination Handlers
  const handleOpenNewDestModal = () => {
    setEditingDest(null);
    setDestForm({ name: '', country: '', description: '', best_time_to_visit: '', image_url: '/destination-images/kyoto.webp', price: 1200, is_active: true });
    setShowDestModal(true);
  };

  const handleOpenEditDestModal = (dest) => {
    setEditingDest(dest);
    setDestForm({
      name: dest.name,
      country: dest.country,
      description: dest.description || '',
      best_time_to_visit: dest.best_time_to_visit || '',
      image_url: dest.image_url || '/destination-images/kyoto.webp',
      price: dest.price || 1200,
      is_active: dest.is_active !== false
    });
    setShowDestModal(true);
  };

  const handleSaveDestination = async (e) => {
    e.preventDefault();
    await dashboardService.saveDestination(editingDest ? { ...destForm, id: editingDest.id } : destForm);
    setActionMsg(editingDest ? 'Destination updated successfully!' : 'New Destination added to catalog!');
    setShowDestModal(false);
    setTimeout(() => setActionMsg(''), 3000);
    loadAdminData();
  };

  const handleDeleteDestination = async (destId) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      await dashboardService.deleteDestination(destId);
      setActionMsg('Destination removed.');
      setTimeout(() => setActionMsg(''), 3000);
      loadAdminData();
    }
  };

  // Admin Package Handlers
  const handleOpenNewPkgModal = () => {
    setEditingPkg(null);
    setPkgFormData({
      title: '', category: 'Culture & Heritage', location: '', days: 5, nights: 4, price: 1200, promo: '', imageUrl: '/package-images/5-kyoto.webp', description: '', is_active: true
    });
    setShowPkgModal(true);
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    await dashboardService.saveAgentPackage(editingPkg ? { ...pkgFormData, id: editingPkg.id } : pkgFormData);
    setActionMsg(editingPkg ? 'Tour Package updated!' : 'New Tour Package created!');
    setShowPkgModal(false);
    setTimeout(() => setActionMsg(''), 3000);
    loadAdminData();
  };

  const handleDeletePackage = async (pkgId) => {
    if (window.confirm('Delete this tour package from platform catalog?')) {
      await dashboardService.deleteAgentPackage(pkgId);
      setActionMsg('Tour Package removed.');
      setTimeout(() => setActionMsg(''), 3000);
      loadAdminData();
    }
  };

  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    await dashboardService.saveAdminProfile(adminProfile);
    try {
      localStorage.setItem('ts_admin_profile', JSON.stringify(adminProfile));
    } catch { /* ignore */ }
    setProfileMsg('Admin profile updated successfully!');
    setTimeout(() => setProfileMsg(''), 3000);
  };

  const handleToggleDestActive = async (destId) => {
    await dashboardService.toggleDestinationActive(destId);
    setActionMsg('Destination active status toggled.');
    setTimeout(() => setActionMsg(''), 2500);
    loadAdminData();
  };

  const handleTogglePkgActive = async (pkgId) => {
    await dashboardService.togglePackageActive(pkgId);
    setActionMsg('Package active status toggled.');
    setTimeout(() => setActionMsg(''), 2500);
    loadAdminData();
  };

  // Coupon Handlers
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    await dashboardService.saveCoupon(couponForm);
    setActionMsg(`Coupon ${couponForm.code} created successfully!`);
    setShowCouponModal(false);
    setTimeout(() => setActionMsg(''), 3000);
    loadAdminData();
  };

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm('Delete this promotional coupon?')) {
      await dashboardService.deleteCoupon(couponId);
      setActionMsg('Coupon deleted.');
      setTimeout(() => setActionMsg(''), 3000);
      loadAdminData();
    }
  };

  // FAQ Handlers
  const handleSaveFaq = async (e) => {
    e.preventDefault();
    await dashboardService.saveFaq(editingFaq ? { ...faqForm, id: editingFaq.id } : faqForm);
    setActionMsg(editingFaq ? 'FAQ updated successfully!' : 'FAQ added successfully!');
    setShowFaqModal(false);
    setEditingFaq(null);
    setFaqForm({ question: '', answer: '', category: 'General', sort_order: 1, is_active: true });
    setTimeout(() => setActionMsg(''), 3000);
    loadAdminData();
  };

  const handleEditFaq = (faq) => {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || 'General',
      sort_order: faq.sort_order || 1,
      is_active: faq.is_active !== false
    });
    setShowFaqModal(true);
  };

  const handleToggleFaqActive = async (faqId) => {
    await dashboardService.toggleFaqActive(faqId);
    setActionMsg('FAQ visibility status updated.');
    setTimeout(() => setActionMsg(''), 3000);
    loadAdminData();
  };

  const handleDeleteFaq = async (faqId) => {
    if (window.confirm('Delete this FAQ entry?')) {
      await dashboardService.deleteFaq(faqId);
      setActionMsg('FAQ entry removed.');
      setTimeout(() => setActionMsg(''), 3000);
      loadAdminData();
    }
  };

  // Contact Messages Handlers
  const handleReplyContactMessage = async (contactId) => {
    if (!contactReplyText.trim()) return;
    await dashboardService.replyContactMessage(contactId, contactReplyText);
    setActionMsg('Official reply recorded and dispatched to customer.');
    setSelectedContact(null);
    setContactReplyText('');
    setTimeout(() => setActionMsg(''), 3000);
    loadAdminData();
  };

  const handleDeleteContactMessage = async (contactId) => {
    if (window.confirm('Delete this contact inquiry?')) {
      await dashboardService.deleteContactMessage(contactId);
      setActionMsg('Contact message removed.');
      setTimeout(() => setActionMsg(''), 3000);
      loadAdminData();
    }
  };

  // Review Handlers
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Remove this customer review?')) {
      await dashboardService.deleteReview(reviewId);
      setActionMsg('Review deleted.');
      setTimeout(() => setActionMsg(''), 3000);
      loadAdminData();
    }
  };

  const filteredUsers = data.users.filter(u => {
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    const matchesQuery = u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                         u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
    return matchesRole && matchesQuery;
  });

  const pendingProviders = data.users.filter(u => u.status === 'PENDING');

  // Production Analytics Datasets for Recharts
  const monthlyRevenueData = [
    { month: 'Jan', revenue: 14200, bookings: 18 },
    { month: 'Feb', revenue: 18900, bookings: 24 },
    { month: 'Mar', revenue: 26400, bookings: 35 },
    { month: 'Apr', revenue: 31200, bookings: 42 },
    { month: 'May', revenue: 42800, bookings: 58 },
    { month: 'Jun', revenue: 54100, bookings: 71 },
    { month: 'Jul', revenue: 68500, bookings: 89 },
    { month: 'Aug', revenue: 74200, bookings: 96 },
    { month: 'Sep', revenue: 62800, bookings: 81 },
    { month: 'Oct', revenue: 81500, bookings: 104 },
    { month: 'Nov', revenue: data.stats.totalRevenue || 94200, bookings: data.bookings?.length ? Math.max(data.bookings.length * 15, 122) : 122 }
  ];

  const categoryDistributionData = [
    { name: 'Curated Tours', value: 38, count: data.stats.activePackages || 48, color: '#a3704c' },
    { name: 'Luxury Hotels', value: 32, count: 40, color: '#2563eb' },
    { name: 'Private Vehicles', value: 18, count: 23, color: '#16a34a' },
    { name: 'Certified Guides', value: 12, count: 15, color: '#d97706' }
  ];

  const providerVelocityData = [
    { quarter: 'Q1 25', approved: 12, pending: 3 },
    { quarter: 'Q2 25', approved: 19, pending: 5 },
    { quarter: 'Q3 25', approved: 26, pending: 4 },
    { quarter: 'Q4 25', approved: 34, pending: 6 },
    { quarter: 'Q1 26', approved: 42, pending: 5 },
    { quarter: 'Q2 26', approved: 51, pending: pendingProviders.length || 2 }
  ];


  return (
    <div className="admin-dashboard-container">
      {/* Top Banner Bar */}
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title-badge">
            <ShieldCheck size={28} className="shield-icon" />
            <div>
              <h2>Global TravelSphere Control Center</h2>
              <p>Super Admin Portal • Management Overview</p>
            </div>
          </div>

          <div className="admin-user-profile">
            <div style={{ position: 'relative' }}>
              <button 
                type="button" 
                onClick={() => setShowNotifPopover(!showNotifPopover)}
                style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', padding: '0.45rem', borderRadius: '10px', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}
                title="System Notifications"
              >
                <Bell size={18} />
                <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800, width: 17, height: 17, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  3
                </span>
              </button>

              {showNotifPopover && (
                <div style={{ position: 'absolute', top: '120%', right: 0, width: '290px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0', zIndex: 99999, overflow: 'hidden' }}>
                  <div style={{ padding: '0.75rem 1rem', background: '#0f172a', color: '#fff', fontSize: '0.85rem', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>System Alerts</span>
                    <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>3 Unread</span>
                  </div>
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#334155' }}>
                      <strong>Vendor Application:</strong> Carlos Rodriguez (Transport) submitted documents.
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>10 mins ago</div>
                    </div>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#334155' }}>
                      <strong>Cancellation Request:</strong> Refund requested on #TS-FL-1049.
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>45 mins ago</div>
                    </div>
                    <div style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#334155' }}>
                      <strong>New Customer Inquiry:</strong> Question regarding Kyoto ryokan meal plans.
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>2 hours ago</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="admin-avatar">
              <img src={adminProfile.photoUrl || '/destination-images/swiss-alps.webp'} alt="Admin" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <div className="admin-info">
              <span className="admin-name">{adminProfile.name || 'Administrator'}</span>
              <span className="admin-role-tag">Super Admin</span>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                <Clock size={11} /> Last Login: {adminProfile.lastLogin || '2026-11-21 16:45:10'}
              </span>
            </div>
            <button className="admin-logout-btn" onClick={() => { logout(); navigate('/login'); }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="admin-toast-message">
          <CheckCircle size={18} /> {actionMsg}
        </div>
      )}

      {/* Main Dashboard Navigation Tabs */}
      <div className="admin-tabs-bar">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <BarChart3 size={18} /> System Analytics
        </button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <Users size={18} /> Account Management
        </button>
        <button className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
          <UserCheck size={18} /> Provider Approvals {pendingProviders.length > 0 && <span className="tab-badge">{pendingProviders.length}</span>}
        </button>
        <button className={`tab-btn ${activeTab === 'destinations' ? 'active' : ''}`} onClick={() => setActiveTab('destinations')}>
          <MapPin size={18} /> Destinations ({data.destinations?.length || 0})
        </button>
        <button className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`} onClick={() => setActiveTab('packages')}>
          <Package size={18} /> Packages & Pricing
        </button>
        <button className={`tab-btn ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => setActiveTab('coupons')}>
          <Tag size={18} /> Coupons ({data.coupons?.length || 0})
        </button>
        <button className={`tab-btn ${activeTab === 'faqs' ? 'active' : ''}`} onClick={() => setActiveTab('faqs')}>
          <HelpCircle size={18} /> FAQs ({data.faqs?.length || 0})
        </button>
        <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
          <Star size={18} /> Reviews ({data.reviews?.length || 0})
        </button>
        <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
          <FileText size={18} /> Bookings & Revenue
        </button>
        <button className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => setActiveTab('complaints')}>
          <MessageSquare size={18} /> Complaints {data.complaints.filter(c => c.status !== 'Resolved').length > 0 && <span className="tab-badge alert">{data.complaints.filter(c => c.status !== 'Resolved').length}</span>}
        </button>
        <button className={`tab-btn ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}>
          <Mail size={18} /> Contact Messages {data.contactMessages?.filter(c => !c.is_read).length > 0 && <span className="tab-badge alert">{data.contactMessages.filter(c => !c.is_read).length}</span>}
        </button>
        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <UserCog size={18} /> Admin Profile
        </button>
      </div>

      <div className="admin-content-area">
        {loading ? (
          <div className="admin-loading-state">
            <Clock size={32} className="spin-icon" />
            <p>Loading records...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="tab-pane">
                <div className="kpi-grid">
                  <div className="kpi-card purple">
                    <div className="kpi-icon"><DollarSign size={24} /></div>
                    <div className="kpi-body">
                      <span className="kpi-label">Gross Platform Revenue</span>
                      <h3 className="kpi-value">${data.stats.totalRevenue?.toLocaleString()}</h3>
                      <span className="kpi-trend green"><TrendingUp size={14} /> +18.4% this month</span>
                    </div>
                  </div>

                  <div className="kpi-card blue">
                    <div className="kpi-icon"><Users size={24} /></div>
                    <div className="kpi-body">
                      <span className="kpi-label">Registered Accounts</span>
                      <h3 className="kpi-value">{data.stats.totalUsers} Accounts</h3>
                      <span className="kpi-trend blue">{pendingProviders.length} Provider Pending Approvals</span>
                    </div>
                  </div>

                  <div className="kpi-card emerald">
                    <div className="kpi-icon"><Package size={24} /></div>
                    <div className="kpi-body">
                      <span className="kpi-label">Active Tour Packages</span>
                      <h3 className="kpi-value">{data.stats.activePackages} Packages</h3>
                      <span className="kpi-trend green">Listed across 12 countries</span>
                    </div>
                  </div>

                  <div className="kpi-card amber">
                    <div className="kpi-icon"><AlertCircle size={24} /></div>
                    <div className="kpi-body">
                      <span className="kpi-label">Open Support Tickets</span>
                      <h3 className="kpi-value">{data.stats.openComplaints} Complaints</h3>
                      <span className="kpi-trend amber">Action Required</span>
                    </div>
                  </div>
                </div>

                <Suspense fallback={<div className="admin-panel-card analytics-loading">Loading analytics...</div>}>
                  <AdminAnalytics
                    monthlyRevenueData={monthlyRevenueData}
                    categoryDistributionData={categoryDistributionData}
                    providerVelocityData={providerVelocityData}
                  />
                </Suspense>
<div className="admin-sections-grid">
                  <div className="admin-panel-card">
                    <div className="panel-header">
                      <h3><UserCheck size={20} /> Pending Service Provider Applications</h3>
                      <button className="view-all-btn" onClick={() => setActiveTab('approvals')}>View Approvals Tab</button>
                    </div>
                    {pendingProviders.length === 0 ? (
                      <div className="empty-notice"><CheckCircle size={20} /> All provider applications are reviewed and approved.</div>
                    ) : (
                      <div className="pending-list">
                        {pendingProviders.map(p => (
                          <div key={p.id} className="pending-item">
                            <div className="pending-info">
                              <span className="pending-name">{p.name} ({p.company})</span>
                              <span className="pending-role">{p.role.replace('_', ' ')} • {p.email}</span>
                            </div>
                            <button className="approve-action-btn" onClick={() => handleApproveProvider(p.id, p.role)}>
                              <Check size={16} /> Approve Account
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="admin-panel-card">
                    <div className="panel-header">
                      <h3><MessageSquare size={20} /> Customer Feedback & Support Tickets</h3>
                      <button className="view-all-btn" onClick={() => setActiveTab('complaints')}>View All Tickets</button>
                    </div>
                    <div className="ticket-list">
                      {data.complaints.slice(0, 3).map(c => (
                        <div key={c.id} className="ticket-item">
                          <div className="ticket-header">
                            <span className="ticket-id">{c.id}</span>
                            <span className={`status-tag ${c.status.toLowerCase().replace(' ', '-')}`}>{c.status}</span>
                          </div>
                          <p className="ticket-subject">{c.subject} - <small>{c.customerName}</small></p>
                          <p className="ticket-msg">{c.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* USERS MANAGEMENT TAB */}
            {activeTab === 'users' && (
              <div className="tab-pane">
                <div className="pane-filter-bar">
                  <div className="search-box">
                    <Search size={18} />
                    <input 
                      type="text" 
                      placeholder="Search accounts by name or email..." 
                      value={userSearchQuery}
                      onChange={e => setUserSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="role-filter-group">
                    <Filter size={16} />
                    <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}>
                      <option value="ALL">All Roles ({data.users.length})</option>
                      <option value="CUSTOMER">Customers</option>
                      <option value="TRAVEL_AGENT">Travel Agents</option>
                      <option value="HOTEL_MANAGER">Hotel Managers</option>
                      <option value="TRANSPORT_PROVIDER">Transport Providers</option>
                      <option value="TOUR_GUIDE">Tour Guides</option>
                    </select>
                  </div>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User Name & Email</th>
                        <th>Assigned Role</th>
                        <th>Phone</th>
                        <th>Account Status</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id}>
                          <td>#{u.id}</td>
                          <td>
                            <div className="table-user">
                              <span className="user-name-text">{u.name}</span>
                              <span className="user-email-text">{u.email}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`role-pill ${u.role.toLowerCase()}`}>
                              {u.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td>{u.phone}</td>
                          <td>
                            <span className={`status-badge ${u.status.toLowerCase()}`}>
                              {u.status}
                            </span>
                          </td>
                          <td>{u.created_at}</td>
                          <td>
                            <button 
                              className={`toggle-status-btn ${u.status === 'ACTIVE' ? 'deactivate' : 'activate'}`}
                              onClick={() => handleToggleUserStatus(u.id, u.status)}
                            >
                              {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PROVIDER APPROVALS TAB */}
            {activeTab === 'approvals' && (
              <div className="tab-pane">
                <div className="section-title-box">
                  <h3>Approve Service Provider Registration Requests</h3>
                  <p>Review travel agencies, hotel properties, transport operators, and tour guides requesting system access.</p>
                </div>

                {pendingProviders.length === 0 ? (
                  <div className="empty-state-card">
                    <CheckCircle size={48} className="empty-icon green" />
                    <h4>No Pending Applications</h4>
                    <p>All service provider accounts have been reviewed and approved.</p>
                  </div>
                ) : (
                  <div className="approval-cards-grid">
                    {pendingProviders.map(p => (
                      <div key={p.id} className="approval-card">
                        <div className="approval-badge-header">
                          <span className={`role-pill ${p.role.toLowerCase()}`}>{p.role.replace('_', ' ')}</span>
                          <span className="status-badge pending">PENDING APPROVAL</span>
                        </div>
                        <h4>{p.company || p.name}</h4>
                        <p className="approval-meta">Applicant Name: <strong>{p.name}</strong></p>
                        <p className="approval-meta">Email: {p.email}</p>
                        <p className="approval-meta">Phone: {p.phone}</p>
                        <p className="approval-meta">Registration Date: {p.created_at}</p>

                        <div className="approval-actions">
                          <button className="btn-approve" onClick={() => handleApproveProvider(p.id, p.role)}>
                            <Check size={18} /> Approve Account
                          </button>
                          <button className="btn-reject" onClick={() => handleRejectProvider(p.id, p.role)}>
                            <X size={18} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DESTINATIONS MANAGEMENT TAB (Task 6) */}
            {activeTab === 'destinations' && (
              <div className="tab-pane">
                <div className="section-title-box flex-between">
                  <div>
                    <h3>Destination Catalog Management</h3>
                    <p>Add, modify, or retire premier travel destinations across global regions.</p>
                  </div>
                  <button className="btn-create-action" onClick={handleOpenNewDestModal} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', background: '#a3704c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                    <Plus size={18} /> Add New Destination
                  </button>
                </div>

                <div className="destinations-admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
                  {(data.destinations || []).map(dest => (
                    <div key={dest.id} className="admin-dest-card" style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      <div style={{ height: '160px', position: 'relative' }}>
                        <SmartImage src={dest.image_url || '/destination-images/kyoto.webp'} alt={dest.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '999px', backdropFilter: 'blur(4px)' }}>
                          {dest.country}
                        </span>
                      </div>
                      <div style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{dest.name}</h4>
                          <span style={{ fontWeight: 700, color: '#a3704c', fontSize: '0.88rem' }}>From ${dest.price || 1200}</span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.5rem', lineHeight: '1.4' }}>{dest.description}</p>
                        {dest.best_time_to_visit && (
                          <p style={{ fontSize: '0.78rem', color: '#a3704c', fontWeight: '600', margin: '0 0 0.75rem' }}>
                            <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} /> Best Season: {dest.best_time_to_visit}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleDestActive(dest.id)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              borderRadius: '20px',
                              border: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              background: dest.is_active !== false ? '#dcfce7' : '#fee2e2',
                              color: dest.is_active !== false ? '#15803d' : '#991b1b'
                            }}
                            title="Toggle active status"
                          >
                            {dest.is_active !== false ? '● Active' : '○ Inactive'}
                          </button>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => handleOpenEditDestModal(dest)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                              <Edit size={14} /> Edit
                            </button>
                            <button onClick={() => handleDeleteDestination(dest.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PACKAGES & PRICING TAB */}
            {activeTab === 'packages' && (
              <div className="tab-pane">
                <div className="section-title-box flex-between">
                  <div>
                    <h3>Tour Packages & Pricing Management</h3>
                    <p>Modify package prices, promotional offers, and tour package availability across the platform.</p>
                  </div>
                  <button className="btn-create-action" onClick={handleOpenNewPkgModal} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', background: '#a3704c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                    <Plus size={18} /> Create New Tour Package
                  </button>
                </div>

                <div className="packages-grid-admin">
                  {data.packages.map(pkg => (
                    <div key={pkg.id} className="admin-pkg-card">
                      <SmartImage src={pkg.imageUrl} alt={pkg.title} className="pkg-thumb" />
                      <div className="pkg-card-body">
                        <div className="pkg-tags" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span className="category-tag">{pkg.category}</span>
                            <span className="rating-tag">★ {pkg.rating}</span>
                          </div>
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
                            title="Toggle package active status"
                          >
                            {pkg.is_active !== false ? '● Active' : '○ Inactive'}
                          </button>
                        </div>
                        <h4>{pkg.title}</h4>
                        <p className="pkg-loc">{pkg.location} • {pkg.days} Days / {pkg.nights} Nights</p>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.4rem 0 0.8rem', lineHeight: '1.4' }}>
                          {pkg.description || 'Comprehensive guided tour experience with premium verified stays, licensed transport, and regional expert itineraries.'}
                        </p>
                        
                        <div className="price-row">
                          <div className="current-price">
                            <span className="price-label">Price per person</span>
                            <span className="price-amount">${pkg.price}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button 
                              className="edit-price-btn"
                              onClick={() => { setEditingPackage(pkg); setNewPrice(pkg.price.toString()); }}
                            >
                              <Edit size={14} /> Update Price
                            </button>
                            <button 
                              onClick={() => handleDeletePackage(pkg.id)}
                              style={{ padding: '0.35rem 0.6rem', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title="Delete package"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COUPONS MANAGEMENT TAB (Task 6) */}
            {activeTab === 'coupons' && (
              <div className="tab-pane">
                <div className="section-title-box flex-between">
                  <div>
                    <h3>Promotional Coupon Codes & Discounts</h3>
                    <p>Manage promotional discounts, minimum spending thresholds, and usage limits.</p>
                  </div>
                  <button className="btn-create-action" onClick={() => setShowCouponModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', background: '#a3704c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                    <Plus size={18} /> Create New Coupon
                  </button>
                </div>

                <div className="admin-table-container" style={{ marginTop: '1.5rem' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Coupon Code</th>
                        <th>Type</th>
                        <th>Discount</th>
                        <th>Min Order</th>
                        <th>Usage Count</th>
                        <th>Expiry Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.coupons || []).map(coupon => (
                        <tr key={coupon.id}>
                          <td><strong><Tag size={13} style={{ display: 'inline', marginRight: '4px' }} />{coupon.code}</strong></td>
                          <td style={{ textTransform: 'capitalize' }}>{coupon.discount_type}</td>
                          <td><strong>{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}</strong></td>
                          <td>${coupon.min_amount}</td>
                          <td>{coupon.used_count || 0} / {coupon.max_uses} uses</td>
                          <td>{coupon.expires_at}</td>
                          <td>
                            <span className={`status-badge ${coupon.is_active ? 'active' : 'inactive'}`}>
                              {coupon.is_active ? 'ACTIVE' : 'EXPIRED'}
                            </span>
                          </td>
                          <td>
                            <button 
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* FAQS MANAGEMENT TAB */}
            {activeTab === 'faqs' && (
              <div className="tab-pane">
                <div className="section-title-box flex-between">
                  <div>
                    <h3>Frequently Asked Questions (FAQ) Directory</h3>
                    <p>Manage customer support knowledge base, sort orders, and live public visibility.</p>
                  </div>
                  <button className="btn-create-action" onClick={() => { setEditingFaq(null); setFaqForm({ question: '', answer: '', category: 'General', sort_order: (data.faqs?.length || 0) + 1, is_active: true }); setShowFaqModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', background: '#a3704c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                    <Plus size={18} /> Add New FAQ
                  </button>
                </div>

                <div className="faqs-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                  {(data.faqs || []).map(faq => (
                    <div key={faq.id} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700', textTransform: 'uppercase' }}>
                              {faq.category || 'General'}
                            </span>
                            <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
                              Order #{faq.sort_order || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleFaqActive(faq.id)}
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '12px',
                                border: 'none',
                                fontWeight: '700',
                                cursor: 'pointer',
                                background: faq.is_active !== false ? '#dcfce7' : '#fee2e2',
                                color: faq.is_active !== false ? '#15803d' : '#991b1b'
                              }}
                              title="Click to toggle public visibility"
                            >
                              {faq.is_active !== false ? '● Active' : '○ Inactive'}
                            </button>
                          </div>
                          <h4 style={{ margin: '0.5rem 0 0.35rem', color: '#0f172a', fontSize: '1.05rem' }}>{faq.question}</h4>
                          <p style={{ margin: 0, color: '#475569', fontSize: '0.88rem', lineHeight: '1.5' }}>{faq.answer}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button 
                            onClick={() => handleEditFaq(faq)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                            title="Edit FAQ"
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteFaq(faq.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                            title="Delete FAQ"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REVIEWS MANAGEMENT TAB (Task 6) */}
            {activeTab === 'reviews' && (
              <div className="tab-pane">
                <div className="section-title-box">
                  <h3>Customer Reviews & Testimonials Moderation</h3>
                  <p>Audit traveler reviews, ratings, and verified experience feedback.</p>
                </div>

                <div className="admin-table-container" style={{ marginTop: '1.5rem' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Traveler</th>
                        <th>Rating</th>
                        <th>Feedback Comment</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.reviews || []).map(review => (
                        <tr key={review.id}>
                          <td><strong>{review.userName || review.customerName || 'Traveler'}</strong></td>
                          <td>
                            <span style={{ color: '#eab308', fontWeight: '700' }}>★ {review.rating} / 5</span>
                          </td>
                          <td style={{ maxWidth: '400px', fontSize: '0.88rem', color: '#334155' }}>&quot;{review.comment}&quot;</td>
                          <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{review.created_at || 'Recent'}</td>
                          <td>
                            <button 
                              onClick={() => handleDeleteReview(review.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BOOKINGS & REVENUE TAB */}
            {activeTab === 'bookings' && (
              <div className="tab-pane">
                <div className="section-title-box">
                  <h3>Master Booking & Payment Audit Ledger</h3>
                  <p>View real-time payment status, booking codes, and total transaction amounts.</p>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Customer / Passenger</th>
                        <th>Service Title / Room</th>
                        <th>Schedule Date</th>
                        <th>Total Payment</th>
                        <th>Status</th>
                        <th>Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td><strong>#{booking.id}</strong></td>
                          <td>{booking.customerName}</td>
                          <td>{booking.serviceTitle}</td>
                          <td>{booking.schedule}</td>
                          <td>${Number(booking.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td><span className={`status-badge ${booking.status.toLowerCase()}`}>{booking.status.toUpperCase()}</span></td>
                          <td><span className={`status-tag ${booking.paymentStatus.toLowerCase().replaceAll(' ', '-')}`}>{booking.paymentStatus.toUpperCase()}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* COMPLAINTS & SUPPORT TAB */}
            {activeTab === 'complaints' && (
              <div className="tab-pane">
                <div className="section-title-box">
                  <h3>Customer Complaints & Support Resolution Center</h3>
                  <p>Handle user grievances, payment refund queries, and service inquiries.</p>
                </div>

                <div className="complaints-list">
                  {data.complaints.map(cmp => (
                    <div key={cmp.id} className="complaint-card">
                      <div className="cmp-header">
                        <div>
                          <span className="cmp-id">{cmp.id}</span>
                          <h4>{cmp.subject}</h4>
                        </div>
                        <span className={`status-badge ${cmp.status.toLowerCase().replace(' ', '-')}`}>{cmp.status}</span>
                      </div>
                      
                      <div className="cmp-details">
                        <p><strong>Customer:</strong> {cmp.customerName} • <strong>Category:</strong> {cmp.category} • <strong>Submitted:</strong> {cmp.createdAt}</p>
                        <div className="cmp-body-box">{cmp.message}</div>

                        {cmp.response && (
                          <div className="cmp-response-box">
                            <strong>Admin Response:</strong> {cmp.response}
                          </div>
                        )}

                        {cmp.status !== 'Resolved' && (
                          <div className="cmp-reply-form">
                            <input 
                              type="text" 
                              placeholder="Write admin resolution response..."
                              value={selectedComplaint === cmp.id ? replyText : ''}
                              onChange={e => { setSelectedComplaint(cmp.id); setReplyText(e.target.value); }}
                            />
                            <button className="btn-resolve" onClick={() => handleResolveComplaint(cmp.id)}>
                              Mark as Resolved
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTACT MESSAGES INBOX */}
            {activeTab === 'contacts' && (
              <div className="tab-pane">
                <div className="section-title-box">
                  <h3>Customer Contact Inquiries & Support Inbox</h3>
                  <p>Centralized inbox for messages submitted via the public contact form. Track read status, audit dates, and dispatch official replies.</p>
                </div>

                <div className="complaints-list" style={{ marginTop: '1.5rem' }}>
                  {(data.contactMessages || []).length === 0 ? (
                    <div style={{ padding: '2.5rem', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <Mail size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                      <p style={{ color: '#64748b', margin: 0, fontWeight: 600 }}>No contact messages in inbox right now.</p>
                    </div>
                  ) : (
                    (data.contactMessages || []).map(msg => (
                      <div key={msg.id} className="complaint-card" style={{ borderLeft: msg.is_read ? '4px solid #cbd5e1' : '4px solid #0284c7' }}>
                        <div className="cmp-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <span className="cmp-id">MSG-#{msg.id}</span>
                              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>📅 {msg.created_at}</span>
                            </div>
                            <h4 style={{ margin: '0.25rem 0', fontSize: '1.1rem', color: '#0f172a' }}>{msg.subject || 'Travel Inquiry'}</h4>
                          </div>
                          <div>
                            {msg.replied_at ? (
                              <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={12} /> Replied ({msg.replied_at})
                              </span>
                            ) : msg.is_read ? (
                              <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                                Read
                              </span>
                            ) : (
                              <span style={{ background: '#fee2e2', color: '#dc2626', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                                ● New Inquiry
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="cmp-details" style={{ marginTop: '0.75rem' }}>
                          <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '0.5rem' }}>
                            <strong>Sender:</strong> {msg.name} &lt;<a href={`mailto:${msg.email}`} style={{ color: '#0284c7' }}>{msg.email}</a>&gt;
                          </p>
                          <div className="cmp-body-box" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#1e293b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {msg.message}
                          </div>

                          {msg.reply && (
                            <div className="cmp-response-box" style={{ marginTop: '0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.85rem 1rem', borderRadius: '8px', color: '#1e3a8a', fontSize: '0.88rem' }}>
                              <strong>Admin Reply ({msg.replied_at || 'Sent'}):</strong> {msg.reply}
                            </div>
                          )}

                          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '280px' }}>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input 
                                  type="text" 
                                  placeholder={`Reply to ${msg.name}...`}
                                  value={selectedContact === msg.id ? contactReplyText : ''}
                                  onChange={e => { setSelectedContact(msg.id); setContactReplyText(e.target.value); }}
                                  style={{ flex: 1, padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                                />
                                <button 
                                  type="button"
                                  onClick={() => handleReplyContactMessage(msg.id)}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.55rem 1rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                                >
                                  <Send size={14} /> Send Reply
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteContactMessage(msg.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ADMIN PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="tab-pane">
                <div className="section-title-box">
                  <h3>Platform Administrator Profile</h3>
                  <p>Manage system administrator credentials, contact information, and audit security credentials.</p>
                </div>

                <div style={{ maxWidth: '640px', background: '#fff', borderRadius: '14px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', marginTop: '1.5rem' }}>
                  {profileMsg && (
                    <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={18} /> {profileMsg}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #a3704c', background: '#f8fafc', flexShrink: 0 }}>
                      <img 
                        src={adminProfile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'} 
                        alt={adminProfile.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{adminProfile.name}</h4>
                      <p style={{ margin: '0.2rem 0', color: '#64748b', fontSize: '0.85rem' }}>{adminProfile.role} • Security Level 1</p>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Last Active: {adminProfile.last_login}</span>
                    </div>
                  </div>

                  <form onSubmit={handleSaveAdminProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Full Legal Name</label>
                      <input
                        type="text"
                        value={adminProfile.name}
                        onChange={e => setAdminProfile({ ...adminProfile, name: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Email Address</label>
                        <input
                          type="email"
                          value={adminProfile.email}
                          onChange={e => setAdminProfile({ ...adminProfile, email: e.target.value })}
                          required
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Phone Number</label>
                        <input
                          type="tel"
                          value={adminProfile.phone}
                          onChange={e => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                          required
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Profile Photo Avatar URL</label>
                      <input
                        type="url"
                        value={adminProfile.avatar_url}
                        onChange={e => setAdminProfile({ ...adminProfile, avatar_url: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="submit"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.5rem', background: '#a3704c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer' }}
                      >
                        <Save size={16} /> Save Admin Profile
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* PRICE EDIT MODAL */}
      {editingPackage && createPortal(
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-modal-card">
            <h3>Update Package Pricing</h3>
            <p><strong>{editingPackage.title}</strong></p>
            <form onSubmit={handleSavePackagePrice}>
              <label>Price per person ($)</label>
              <input 
                type="number" 
                value={newPrice} 
                onChange={e => setNewPrice(e.target.value)}
                required
                min="1"
              />
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditingPackage(null)}>Cancel</button>
                <button type="submit" className="btn-save">Save Price</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* DESTINATION MODAL (Task 6) */}
      {showDestModal && createPortal(
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-modal-card">
            <h3>{editingDest ? 'Edit Destination' : 'Add New Destination'}</h3>
            <form onSubmit={handleSaveDestination}>
              <label>Destination Name</label>
              <input 
                type="text" 
                value={destForm.name} 
                onChange={e => setDestForm({ ...destForm, name: e.target.value })}
                placeholder="e.g. Kyoto, Japan"
                required
              />
              <label>Country</label>
              <input 
                type="text" 
                value={destForm.country} 
                onChange={e => setDestForm({ ...destForm, country: e.target.value })}
                placeholder="e.g. Japan"
                required
              />
              <label>Best Season / Months to Visit</label>
              <input 
                type="text" 
                value={destForm.best_time_to_visit} 
                onChange={e => setDestForm({ ...destForm, best_time_to_visit: e.target.value })}
                placeholder="e.g. March - May (Cherry Blossom)"
              />
              <label>Image URL</label>
              <input 
                type="text" 
                value={destForm.image_url} 
                onChange={e => setDestForm({ ...destForm, image_url: e.target.value })}
                placeholder="/destination-images/kyoto.webp"
              />
              <label>Description</label>
              <textarea 
                value={destForm.description} 
                onChange={e => setDestForm({ ...destForm, description: e.target.value })}
                placeholder="Brief summary of highlights and culture..."
                rows="3"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '0.75rem' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
                <div>
                  <label>Starting Budget ($)</label>
                  <input 
                    type="number" 
                    value={destForm.price || 1200} 
                    onChange={e => setDestForm({ ...destForm, price: parseFloat(e.target.value) || 0 })}
                    placeholder="1200"
                    min="1"
                    required
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.2rem' }}>
                  <input
                    type="checkbox"
                    id="dest-active-check"
                    checked={destForm.is_active !== false}
                    onChange={e => setDestForm({ ...destForm, is_active: e.target.checked })}
                  />
                  <label htmlFor="dest-active-check" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                    Active in Catalog
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowDestModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Destination</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* PACKAGE CREATION MODAL (Task 6) */}
      {showPkgModal && createPortal(
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-modal-card">
            <h3>{editingPkg ? 'Edit Tour Package' : 'Create New Tour Package'}</h3>
            <form onSubmit={handleSavePackage}>
              <label>Package Title</label>
              <input 
                type="text" 
                value={pkgFormData.title} 
                onChange={e => setPkgFormData({ ...pkgFormData, title: e.target.value })}
                placeholder="e.g. Kyoto Culture & Cherry Blossom Expedition"
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label>Category</label>
                  <select 
                    value={pkgFormData.category} 
                    onChange={e => setPkgFormData({ ...pkgFormData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Culture & Heritage">Culture & Heritage</option>
                    <option value="Honeymoon Specials">Honeymoon Specials</option>
                    <option value="Beach & Islands">Beach & Islands</option>
                    <option value="Mountain Escapes">Mountain Escapes</option>
                    <option value="Luxury & Wellness">Luxury & Wellness</option>
                  </select>
                </div>
                <div>
                  <label>Location</label>
                  <input 
                    type="text" 
                    value={pkgFormData.location} 
                    onChange={e => setPkgFormData({ ...pkgFormData, location: e.target.value })}
                    placeholder="e.g. Kyoto, Japan"
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div>
                  <label>Days</label>
                  <input 
                    type="number" 
                    value={pkgFormData.days} 
                    onChange={e => setPkgFormData({ ...pkgFormData, days: parseInt(e.target.value) || 1 })}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label>Nights</label>
                  <input 
                    type="number" 
                    value={pkgFormData.nights} 
                    onChange={e => setPkgFormData({ ...pkgFormData, nights: parseInt(e.target.value) || 0 })}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label>Price ($)</label>
                  <input 
                    type="number" 
                    value={pkgFormData.price} 
                    onChange={e => setPkgFormData({ ...pkgFormData, price: parseFloat(e.target.value) || 1 })}
                    min="1"
                    required
                  />
                </div>
              </div>
              <label style={{ marginTop: '0.75rem' }}>Promo Offer Tag</label>
              <input 
                type="text" 
                value={pkgFormData.promo} 
                onChange={e => setPkgFormData({ ...pkgFormData, promo: e.target.value })}
                placeholder="e.g. 15% Early Bird OFF"
              />
              <label>Image URL</label>
              <input 
                type="text" 
                value={pkgFormData.imageUrl} 
                onChange={e => setPkgFormData({ ...pkgFormData, imageUrl: e.target.value })}
                placeholder="/package-images/5-kyoto.webp"
              />
              <label>Description</label>
              <textarea 
                value={pkgFormData.description || ''} 
                onChange={e => setPkgFormData({ ...pkgFormData, description: e.target.value })}
                placeholder="Comprehensive guided itinerary, included amenities and highlights..."
                rows="3"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '0.5rem' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  id="pkg-active-checkbox"
                  checked={pkgFormData.is_active !== false}
                  onChange={e => setPkgFormData({ ...pkgFormData, is_active: e.target.checked })}
                />
                <label htmlFor="pkg-active-checkbox" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                  Active Tour Package (Published in Public Catalog)
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowPkgModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Tour Package</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* COUPON CREATION MODAL (Task 6) */}
      {showCouponModal && createPortal(
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-modal-card">
            <h3>Create Promotional Coupon</h3>
            <form onSubmit={handleSaveCoupon}>
              <label>Coupon Promo Code</label>
              <input 
                type="text" 
                value={couponForm.code} 
                onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g. FESTIVE25"
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label>Discount Type</label>
                  <select 
                    value={couponForm.discount_type} 
                    onChange={e => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label>Discount Value</label>
                  <input 
                    type="number" 
                    value={couponForm.discount_value} 
                    onChange={e => setCouponForm({ ...couponForm, discount_value: parseFloat(e.target.value) || 0 })}
                    min="1"
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div>
                  <label>Min Order Amount ($)</label>
                  <input 
                    type="number" 
                    value={couponForm.min_amount} 
                    onChange={e => setCouponForm({ ...couponForm, min_amount: parseFloat(e.target.value) || 0 })}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label>Max Uses Allowed</label>
                  <input 
                    type="number" 
                    value={couponForm.max_uses} 
                    onChange={e => setCouponForm({ ...couponForm, max_uses: parseInt(e.target.value) || 100 })}
                    min="1"
                    required
                  />
                </div>
              </div>
              <label style={{ marginTop: '0.75rem' }}>Expiry Date</label>
              <input 
                type="date" 
                value={couponForm.expires_at} 
                onChange={e => setCouponForm({ ...couponForm, expires_at: e.target.value })}
                required
              />
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCouponModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Publish Coupon</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* FAQ CREATION & EDIT MODAL */}
      {showFaqModal && createPortal(
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-modal-card">
            <h3>{editingFaq ? 'Edit FAQ Knowledge Base Entry' : 'Add New FAQ Knowledge Base Entry'}</h3>
            <form onSubmit={handleSaveFaq}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label>FAQ Category</label>
                  <select 
                    value={faqForm.category} 
                    onChange={e => setFaqForm({ ...faqForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="General">General Inquiry</option>
                    <option value="Payments">Payments & Billing</option>
                    <option value="Bookings">Tour & Flight Bookings</option>
                    <option value="Cancellations">Cancellations & Refunds</option>
                  </select>
                </div>
                <div>
                  <label>Display Sort Order</label>
                  <input 
                    type="number" 
                    value={faqForm.sort_order} 
                    onChange={e => setFaqForm({ ...faqForm, sort_order: parseInt(e.target.value) || 1 })}
                    min="1"
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>
              </div>

              <label style={{ marginTop: '0.75rem' }}>Question</label>
              <input 
                type="text" 
                value={faqForm.question} 
                onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                placeholder="e.g. Can I reschedule my booked tour?"
                required
              />

              <label>Answer</label>
              <textarea 
                value={faqForm.answer} 
                onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
                placeholder="Provide accurate, detailed support guidance..."
                rows="4"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '0.75rem' }}
                required
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <input 
                  type="checkbox" 
                  id="faqActiveCheck"
                  checked={faqForm.is_active} 
                  onChange={e => setFaqForm({ ...faqForm, is_active: e.target.checked })}
                />
                <label htmlFor="faqActiveCheck" style={{ margin: 0, fontWeight: 600, color: '#334155', cursor: 'pointer', fontSize: '0.9rem' }}>
                  Live & Visible to Public Travelers (is_active)
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => { setShowFaqModal(false); setEditingFaq(null); }}>Cancel</button>
                <button type="submit" className="btn-save">{editingFaq ? 'Update FAQ' : 'Save FAQ'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminDashboard;
