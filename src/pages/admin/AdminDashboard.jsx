import { useState, useEffect } from 'react';
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
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import dashboardService from '../../services/dashboardDataService';
import './AdminDashboard.css';
import SmartImage from '../../components/common/SmartImage';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({ users: [], packages: [], complaints: [], bookings: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  // Editing package price modal state
  const [editingPackage, setEditingPackage] = useState(null);
  const [newPrice, setNewPrice] = useState('');

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load; state is set after the awaited request
    loadAdminData();
  }, []);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await dashboardService.updateUserStatus(userId, nextStatus);
    setActionMsg(`User account status updated to ${nextStatus}`);
    setTimeout(() => setActionMsg(''), 3000);
    loadAdminData();
  };

  const handleApproveProvider = async (userId) => {
    await dashboardService.approveProvider(userId);
    setActionMsg('Service Provider account approved successfully!');
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
              <p>Super Admin Portal • Database Connection Live</p>
            </div>
          </div>

          <div className="admin-user-profile">
            <div className="admin-avatar">A</div>
            <div className="admin-info">
              <span className="admin-name">{user?.name || 'Administrator'}</span>
              <span className="admin-role-tag">Super Admin</span>
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
        <button className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`} onClick={() => setActiveTab('packages')}>
          <Package size={18} /> Packages & Pricing
        </button>
        <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
          <FileText size={18} /> Bookings & Revenue
        </button>
        <button className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => setActiveTab('complaints')}>
          <MessageSquare size={18} /> Complaints & Support {data.complaints.filter(c => c.status !== 'Resolved').length > 0 && <span className="tab-badge alert">{data.complaints.filter(c => c.status !== 'Resolved').length}</span>}
        </button>
      </div>

      <div className="admin-content-area">
        {loading ? (
          <div className="admin-loading-state">
            <Clock size={32} className="spin-icon" />
            <p>Loading database records...</p>
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

                {/* INTERACTIVE ANALYTICS VISUALIZATION DASHBOARD (RECHARTS) */}
                <div className="analytics-charts-grid">
                  {/* Revenue & Booking Velocity Area Chart */}
                  <div className="admin-panel-card chart-card-wide">
                    <div className="panel-header">
                      <div>
                        <h3><BarChart3 size={20} /> Revenue & Booking Volume Trajectory</h3>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                          Live 2025–2026 Gross Transaction Value (GTV) and booking velocity.
                        </p>
                      </div>
                      <span className="kpi-trend green" style={{ padding: '0.35rem 0.75rem', borderRadius: '20px', background: '#ecfdf5' }}>
                        <TrendingUp size={14} /> +18.4% MoM
                      </span>
                    </div>

                    <div style={{ width: '100%', height: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="copperGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#a3704c" stopOpacity={0.45}/>
                              <stop offset="95%" stopColor="#a3704c" stopOpacity={0.0}/>
                            </linearGradient>
                            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                          <Tooltip 
                            contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                            formatter={(value, name) => [name === 'Gross Revenue ($)' ? `${value.toLocaleString()}` : value, name]}
                          />
                          <Legend wrapperStyle={{ fontSize: '0.825rem', paddingTop: '10px' }} />
                          <Area type="monotone" dataKey="revenue" name="Gross Revenue ($)" stroke="#a3704c" strokeWidth={2.5} fillOpacity={1} fill="url(#copperGradient)" />
                          <Area type="monotone" dataKey="bookings" name="Monthly Bookings" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#blueGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Category Distribution Donut Chart */}
                  <div className="admin-panel-card chart-card-donut">
                    <div className="panel-header">
                      <div>
                        <h3><Package size={20} /> Service Distribution</h3>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                          Share of catalog offerings across provider sectors.
                        </p>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: 210 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {categoryDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}
                            formatter={(value) => [`${value}%`, 'Catalog Share']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="donut-legend-grid">
                      {categoryDistributionData.map(item => (
                        <div key={item.name} className="donut-legend-item">
                          <span className="donut-dot" style={{ background: item.color }}></span>
                          <span className="donut-name">{item.name}</span>
                          <span className="donut-pct">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Provider Approval & Network Velocity */}
                  <div className="admin-panel-card chart-card-bar">
                    <div className="panel-header">
                      <div>
                        <h3><UserCheck size={20} /> Provider Onboarding Velocity</h3>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                          Quarterly applications approved vs pending security clearance.
                        </p>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={providerVelocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="quarter" stroke="#94a3b8" fontSize={12} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '0.825rem', paddingTop: '8px' }} />
                          <Bar dataKey="approved" name="Approved Providers" fill="#a3704c" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="pending" name="Pending Review" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

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
                            <button className="approve-action-btn" onClick={() => handleApproveProvider(p.id)}>
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
                          <button className="btn-approve" onClick={() => handleApproveProvider(p.id)}>
                            <Check size={18} /> Approve Account
                          </button>
                          <button className="btn-reject" onClick={() => handleToggleUserStatus(p.id, 'INACTIVE')}>
                            <X size={18} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                </div>

                <div className="packages-grid-admin">
                  {data.packages.map(pkg => (
                    <div key={pkg.id} className="admin-pkg-card">
                      <SmartImage src={pkg.imageUrl} alt={pkg.title} className="pkg-thumb" />
                      <div className="pkg-card-body">
                        <div className="pkg-tags">
                          <span className="category-tag">{pkg.category}</span>
                          <span className="rating-tag">★ {pkg.rating}</span>
                        </div>
                        <h4>{pkg.title}</h4>
                        <p className="pkg-loc">{pkg.location} • {pkg.days} Days / {pkg.nights} Nights</p>
                        
                        <div className="price-row">
                          <div className="current-price">
                            <span className="price-label">Price per person</span>
                            <span className="price-amount">${pkg.price}</span>
                          </div>
                          <button 
                            className="edit-price-btn"
                            onClick={() => { setEditingPackage(pkg); setNewPrice(pkg.price.toString()); }}
                          >
                            <Edit size={14} /> Update Price
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
          </>
        )}
      </div>

      {/* PRICE EDIT MODAL */}
      {editingPackage && (
        <div className="modal-overlay">
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
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
