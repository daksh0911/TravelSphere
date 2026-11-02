import { useState, useEffect } from 'react';
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
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import dashboardService from '../../services/dashboardDataService';
import './AgentDashboard.css';
import SmartImage from '../../components/common/SmartImage';

const AgentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('packages');
  const [packages, setPackages] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

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
    imageUrl: '',
    description: ''
  });

  // Reply inquiry modal state
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyText, setReplyText] = useState('');

  const loadAgentData = async () => {
    try {
      const res = await dashboardService.getAgentData();
      setPackages(res.packages);
      setInquiries(res.inquiries);
    } catch (err) {
      console.error('Failed to load agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load; state is set after the awaited request
    loadAgentData();
  }, []);

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
      promo: 'Early Bird 10% OFF',
      imageUrl: '/destination-images/bali.webp',
      description: ''
    });
    setShowPkgModal(true);
  };

  const handleOpenEditPkgModal = (pkg) => {
    setEditingPkg(pkg);
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
      imageUrl: pkg.imageUrl,
      description: pkg.description || ''
    });
    setShowPkgModal(true);
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    const pkgToSave = editingPkg ? { ...pkgFormData, id: editingPkg.id } : pkgFormData;
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
    await dashboardService.replyInquiry(inquiryId, replyText);
    setActionMsg('Response sent to customer inquiry.');
    setSelectedInquiry(null);
    setReplyText('');
    setTimeout(() => setActionMsg(''), 3000);
    loadAgentData();
  };

  return (
    <div className="agent-dashboard-container">
      {/* Top Banner Bar */}
      <div className="agent-header">
        <div className="agent-header-content">
          <div className="agent-title-badge">
            <Compass size={28} className="agent-logo-icon" />
            <div>
              <h2>Horizon Escapes & Expeditions</h2>
              <p>Certified Travel Agent Dashboard • Package & Itinerary Control</p>
            </div>
          </div>

          <div className="agent-user-profile">
            <div className="agent-avatar">TA</div>
            <div className="agent-info">
              <span className="agent-name">{user?.name || 'Sarah Jenkins'}</span>
              <span className="agent-role-tag">Senior Travel Agent</span>
            </div>
            <button className="agent-logout-btn" onClick={() => { logout(); navigate('/login'); }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="agent-toast-message">
          <CheckCircle size={18} /> {actionMsg}
        </div>
      )}

      {/* Main Tabs */}
      <div className="agent-tabs-bar">
        <button className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`} onClick={() => setActiveTab('packages')}>
          <Package size={18} /> Tour Packages Catalog ({packages.length})
        </button>
        <button className={`tab-btn ${activeTab === 'itineraries' ? 'active' : ''}`} onClick={() => setActiveTab('itineraries')}>
          <Calendar size={18} /> Itineraries & Schedules
        </button>
        <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
          <Users size={18} /> Customer Package Bookings
        </button>
        <button className={`tab-btn ${activeTab === 'inquiries' ? 'active' : ''}`} onClick={() => setActiveTab('inquiries')}>
          <MessageSquare size={18} /> Customer Inquiries {inquiries.filter(i => i.status === 'Pending').length > 0 && <span className="tab-badge alert">{inquiries.filter(i => i.status === 'Pending').length}</span>}
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
            {/* PACKAGES CATALOG TAB */}
            {activeTab === 'packages' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Managed Tour Packages & Pricing</h3>
                    <p>Create, update, and manage travel package availability and promotional discount offers.</p>
                  </div>
                  <button className="btn-create-pkg" onClick={handleOpenNewPkgModal}>
                    <Plus size={18} /> Create New Tour Package
                  </button>
                </div>

                <div className="agent-packages-grid">
                  {packages.map(pkg => (
                    <div key={pkg.id} className="agent-card">
                      <div className="agent-card-image-wrap">
                        <SmartImage src={pkg.imageUrl} alt={pkg.title} />
                        {pkg.promo && <span className="promo-badge"><Tag size={12} /> {pkg.promo}</span>}
                      </div>

                      <div className="agent-card-body">
                        <span className="category-text">{pkg.category}</span>
                        <h4>{pkg.title}</h4>
                        <p className="location-text"><MapPin size={14} /> {pkg.location}</p>

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
                  ))}
                </div>
              </div>
            )}

            {/* ITINERARIES & SCHEDULES TAB */}
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

            {/* CUSTOMER PACKAGE BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Confirmed Customer Package Bookings</h3>
                    <p>Review customer reservations for tour packages managed by your agency.</p>
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
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>#BK-9901</strong></td>
                        <td>Alice Walker</td>
                        <td>Kyoto Cherry Blossom Tour</td>
                        <td>2026-10-15 to 2026-10-22</td>
                        <td>2 Guests</td>
                        <td>$2,900.00</td>
                        <td><span className="status-pill active">CONFIRMED</span></td>
                      </tr>
                      <tr>
                        <td><strong>#BK-9904</strong></td>
                        <td>Robert Vance</td>
                        <td>Santorini Sunset Villa & Yacht</td>
                        <td>2026-11-01 to 2026-11-07</td>
                        <td>2 Guests</td>
                        <td>$3,960.00</td>
                        <td><span className="status-pill active">CONFIRMED</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CUSTOMER INQUIRIES TAB */}
            {activeTab === 'inquiries' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Customer Inquiries & Q&A</h3>
                    <p>Respond to customer questions regarding itineraries, meal plans, and departure dates.</p>
                  </div>
                </div>

                <div className="inquiries-grid">
                  {inquiries.map(inq => (
                    <div key={inq.id} className="inquiry-card">
                      <div className="inq-header">
                        <span className="inq-id">{inq.id}</span>
                        <span className={`status-pill ${inq.status.toLowerCase()}`}>{inq.status}</span>
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
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* PACKAGE CREATION/EDIT MODAL */}
      {showPkgModal && (
        <div className="modal-overlay">
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
                    onChange={e => setPkgFormData({ ...pkgFormData, days: parseInt(e.target.value) })}
                    required 
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Nights</label>
                  <input 
                    type="number" 
                    value={pkgFormData.nights} 
                    onChange={e => setPkgFormData({ ...pkgFormData, nights: parseInt(e.target.value) })}
                    required 
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Price per Guest ($)</label>
                  <input 
                    type="number" 
                    value={pkgFormData.price} 
                    onChange={e => setPkgFormData({ ...pkgFormData, price: parseFloat(e.target.value) })}
                    required 
                    min="1"
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

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowPkgModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Package</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
