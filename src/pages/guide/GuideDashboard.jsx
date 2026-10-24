import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  UserCheck, 
  DollarSign, 
  CheckCircle, 
  Edit, 
  LogOut, 
  Clock, 
  Phone, 
  Globe, 
  Award,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import dashboardService from '../../services/dashboardDataService';
import './GuideDashboard.css';
import SmartImage from '../../components/common/SmartImage';

const GuideDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('requests');
  const [profile, setProfile] = useState({});
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  // Profile Edit modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileFormData, setProfileFormData] = useState({});

  const loadGuideData = async () => {
    try {
      const res = await dashboardService.getGuideData();
      setProfile(res.profile);
      setRequests(res.requests);
      setProfileFormData(res.profile);
    } catch (err) {
      console.error('Failed to load guide data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load; state is set after the awaited request
    loadGuideData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await dashboardService.saveGuideProfile(profileFormData);
    setActionMsg('Tour Guide Profile & Rates updated successfully!');
    setShowProfileModal(false);
    setTimeout(() => setActionMsg(''), 3000);
    loadGuideData();
  };

  const handleRequestStatus = async (requestId, status) => {
    await dashboardService.updateGuideRequestStatus(requestId, status);
    setActionMsg(`Tour Request #${requestId} updated to ${status}`);
    setTimeout(() => setActionMsg(''), 3000);
    loadGuideData();
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const acceptedTours = requests.filter(r => r.status === 'Accepted' || r.status === 'Completed');

  return (
    <div className="guide-dashboard-container">
      {/* Top Banner Bar */}
      <div className="guide-header">
        <div className="guide-header-content">
          <div className="guide-title-badge">
            <Award size={28} className="guide-logo-icon" />
            <div>
              <h2>{profile.fullName || 'Marco Rossi'}</h2>
              <p>Certified Tour Guide Portal • Availability & Tour Schedules</p>
            </div>
          </div>

          <div className="guide-user-profile">
            <div className="guide-avatar">TG</div>
            <div className="guide-info">
              <span className="guide-name">{profile.fullName || 'Marco Rossi'}</span>
              <span className="guide-role-tag">★ {profile.rating || 4.95} Rating Guide</span>
            </div>
            <button className="guide-logout-btn" onClick={() => { logout(); navigate('/login'); }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="guide-toast-message">
          <CheckCircle size={18} /> {actionMsg}
        </div>
      )}

      {/* Main Tabs */}
      <div className="guide-tabs-bar">
        <button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
          <UserCheck size={18} /> Customer Tour Requests {pendingRequests.length > 0 && <span className="tab-badge alert">{pendingRequests.length}</span>}
        </button>
        <button className={`tab-btn ${activeTab === 'schedules' ? 'active' : ''}`} onClick={() => setActiveTab('schedules')}>
          <Calendar size={18} /> Tour Schedules & Assigned Tours ({acceptedTours.length})
        </button>
        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <Award size={18} /> Guide Profile & Availability Status
        </button>
      </div>

      <div className="guide-content-area">
        {loading ? (
          <div className="guide-loading-state">
            <Clock size={32} className="spin-icon" />
            <p>Loading tour guide portal data...</p>
          </div>
        ) : (
          <>
            {/* TOUR REQUESTS TAB */}
            {activeTab === 'requests' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Incoming Customer Tour Requests</h3>
                    <p>Review customer booking requests, group sizes, and tour dates.</p>
                  </div>
                </div>

                <div className="requests-grid">
                  {requests.map(req => (
                    <div key={req.id} className="request-card">
                      <div className="req-header">
                        <span className="req-id">{req.id}</span>
                        <span className={`status-pill ${req.status.toLowerCase()}`}>{req.status}</span>
                      </div>

                      <h4>{req.tourName}</h4>
                      <p className="req-location"><MapPin size={14} /> {req.location}</p>

                      <div className="req-customer-box">
                        <p><strong>Customer:</strong> {req.customerName}</p>
                        <p><Phone size={13} /> {req.phone}</p>
                        <p><strong>Date:</strong> {req.requestDate} • <strong>Guests:</strong> {req.guests} Persons</p>
                        <p><strong>Special Request:</strong> &quot;{req.specialNotes}&quot;</p>
                      </div>

                      <div className="req-footer">
                        <span className="req-fee">Guide Fee: <strong>${req.totalAmount}</strong></span>
                        {req.status === 'Pending' && (
                          <div className="req-actions">
                            <button className="btn-accept" onClick={() => handleRequestStatus(req.id, 'Accepted')}>
                              <Check size={16} /> Accept Request
                            </button>
                            <button className="btn-reject" onClick={() => handleRequestStatus(req.id, 'Rejected')}>
                              <X size={16} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TOUR SCHEDULES TAB */}
            {activeTab === 'schedules' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Confirmed Tour Schedules & Customer Details</h3>
                    <p>Manage confirmed guided excursions, meeting points, and customer details.</p>
                  </div>
                </div>

                <div className="guide-table-container">
                  <table className="guide-table">
                    <thead>
                      <tr>
                        <th>Req Ref</th>
                        <th>Confirmed Tour Name</th>
                        <th>Meeting Location</th>
                        <th>Tour Date</th>
                        <th>Customer Contact</th>
                        <th>Group Size</th>
                        <th>Total Fee</th>
                        <th>Tour Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acceptedTours.map(t => (
                        <tr key={t.id}>
                          <td><strong>#{t.id}</strong></td>
                          <td>{t.tourName}</td>
                          <td>{t.location}</td>
                          <td>{t.requestDate}</td>
                          <td>{t.customerName} ({t.phone})</td>
                          <td>{t.guests} Guests</td>
                          <td><strong>${t.totalAmount}</strong></td>
                          <td><span className={`status-pill ${t.status.toLowerCase()}`}>{t.status}</span></td>
                          <td>
                            {t.status === 'Accepted' && (
                              <button className="btn-mark-complete" onClick={() => handleRequestStatus(t.id, 'Completed')}>
                                Mark Completed
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PROFILE & AVAILABILITY TAB */}
            {activeTab === 'profile' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Guide Profile & Availability Management</h3>
                    <p>Update bio, languages spoken, hourly rate, and active availability status.</p>
                  </div>
                  <button className="btn-edit-profile" onClick={() => setShowProfileModal(true)}>
                    <Edit size={18} /> Edit Guide Profile
                  </button>
                </div>

                <div className="guide-profile-card">
                  <SmartImage src={profile.avatarUrl} alt={profile.fullName} className="guide-avatar-img" />
                  <div className="guide-profile-info">
                    <div className="guide-badge-row">
                      <span className="status-badge active">{profile.status}</span>
                      <span className="rating-pill">★ {profile.rating} Rating ({profile.completedTours} Tours Completed)</span>
                    </div>
                    <h2>{profile.fullName}</h2>
                    <p className="guide-location"><MapPin size={16} /> Base Location: {profile.city}</p>
                    <p className="guide-bio">{profile.bio}</p>

                    <div className="guide-meta-grid">
                      <div>
                        <span className="meta-label"><Globe size={14} /> Languages Spoken</span>
                        <div className="lang-tags">
                          {(profile.languages || []).map((lang, i) => (
                            <span key={i} className="lang-pill">{lang}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="meta-label"><DollarSign size={14} /> Guide Rates</span>
                        <p className="rate-text"><strong>${profile.hourlyRate}</strong> / hr • <strong>${profile.dailyRate}</strong> / full day</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="guide-modal-card">
            <h3>Update Tour Guide Profile</h3>
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={profileFormData.fullName || ''} 
                  onChange={e => setProfileFormData({ ...profileFormData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Availability Status</label>
                <select 
                  value={profileFormData.status || 'Available'} 
                  onChange={e => setProfileFormData({ ...profileFormData, status: e.target.value })}
                >
                  <option value="Available">Available for Booking</option>
                  <option value="On Tour">On Tour</option>
                  <option value="Off Duty">Off Duty</option>
                </select>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Hourly Rate ($)</label>
                  <input 
                    type="number" 
                    value={profileFormData.hourlyRate || 60} 
                    onChange={e => setProfileFormData({ ...profileFormData, hourlyRate: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Daily Rate ($)</label>
                  <input 
                    type="number" 
                    value={profileFormData.dailyRate || 350} 
                    onChange={e => setProfileFormData({ ...profileFormData, dailyRate: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Guide Bio / Expertise</label>
                <input 
                  type="text" 
                  value={profileFormData.bio || ''} 
                  onChange={e => setProfileFormData({ ...profileFormData, bio: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowProfileModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideDashboard;
