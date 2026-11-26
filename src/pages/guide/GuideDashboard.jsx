import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('requests');
  const initialGuideData = useMemo(() => {
    return dashboardService.getGuideDataSync ? dashboardService.getGuideDataSync() : { profile: {}, requests: [] };
  }, []);
  const [profile, setProfile] = useState(initialGuideData.profile || {});
  const [requests, setRequests] = useState(initialGuideData.requests || []);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Profile Edit modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileFormData, setProfileFormData] = useState({});

  // Date-by-Date Availability State (PDF Table 10)
  const [dateAvailability, setDateAvailability] = useState(() => {
    try {
      const stored = localStorage.getItem('ts_guide_date_avail');
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    const dates = {};
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dates[key] = i % 4 === 3 ? 'Blocked' : 'Available';
    }
    return dates;
  });

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
    const role = (user?.role || '').toUpperCase();
    if (!user || (role !== 'TOUR_GUIDE' && role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
      navigate('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load; state is set after the awaited request
    loadGuideData();
  }, [user, navigate]);

  const handleToggleDateAvail = (dateKey) => {
    const updated = {
      ...dateAvailability,
      [dateKey]: dateAvailability[dateKey] === 'Available' ? 'Blocked' : 'Available'
    };
    setDateAvailability(updated);
    try {
      localStorage.setItem('ts_guide_date_avail', JSON.stringify(updated));
    } catch { /* ignore */ }
    setActionMsg(`Availability for ${dateKey} set to ${updated[dateKey]}.`);
    setTimeout(() => setActionMsg(''), 2000);
  };

  const handleEditMeetingPoint = (tourId, currentLoc) => {
    const newLoc = window.prompt('Enter new tour meeting point:', currentLoc);
    if (newLoc && newLoc.trim()) {
      setRequests(prev => prev.map(r => r.id === tourId ? { ...r, location: newLoc.trim() } : r));
      setActionMsg(`Meeting point for tour #${tourId} updated.`);
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const handleRescheduleTour = (tourId, currentDate) => {
    const newDate = window.prompt('Enter rescheduled tour date (YYYY-MM-DD):', currentDate);
    if (newDate && newDate.trim()) {
      setRequests(prev => prev.map(r => r.id === tourId ? { ...r, requestDate: newDate.trim() } : r));
      setActionMsg(`Tour #${tourId} rescheduled to ${newDate.trim()}.`);
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

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
                            {t.status === 'Accepted' ? (
                              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                <button 
                                  onClick={() => handleEditMeetingPoint(t.id, t.location)}
                                  style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                  title="Edit meeting location"
                                >
                                  Meeting Point
                                </button>
                                <button 
                                  onClick={() => handleRescheduleTour(t.id, t.requestDate)}
                                  style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                  title="Reschedule tour date"
                                >
                                  Reschedule
                                </button>
                                <button className="btn-mark-complete" onClick={() => handleRequestStatus(t.id, 'Completed')}>
                                  Complete
                                </button>
                                <button 
                                  onClick={() => handleRequestStatus(t.id, 'Cancelled')}
                                  style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t.status}</span>
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

                {/* Date-by-Date Availability Calendar (PDF Table 10) */}
                <div style={{ marginTop: '1.5rem', background: '#fff', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>📅 Date-by-Date Booking Availability (Upcoming 14 Days)</h4>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>Click any date badge to toggle between Available and Blocked status.</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                    {Object.entries(dateAvailability).map(([dateStr, status]) => (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => handleToggleDateAvail(dateStr)}
                        style={{
                          padding: '0.65rem 0.5rem',
                          borderRadius: '8px',
                          border: status === 'Available' ? '1px solid #bbf7d0' : '1px solid #fecaca',
                          background: status === 'Available' ? '#f0fdf4' : '#fef2f2',
                          color: status === 'Available' ? '#166534' : '#991b1b',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.2rem',
                          fontWeight: 600,
                          fontSize: '0.82rem'
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{dateStr}</span>
                        <span>{status === 'Available' ? '● Available' : '✕ Blocked'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* EDIT PROFILE MODAL (Centered via Portal) */}
      {showProfileModal && createPortal(
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                <label>Spoken Languages (PDF Table 11 - Comma-separated)</label>
                <input 
                  type="text" 
                  value={Array.isArray(profileFormData.languages) ? profileFormData.languages.join(', ') : (profileFormData.languages || '')} 
                  onChange={e => {
                    const parsed = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setProfileFormData({ ...profileFormData, languages: parsed });
                  }}
                  placeholder="e.g. English, Italian, German, French"
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

              <div className="form-row-2">
                <div className="form-group">
                  <label>Base City / Location (PDF Table 10)</label>
                  <input 
                    type="text" 
                    value={profileFormData.city || ''} 
                    onChange={e => setProfileFormData({ ...profileFormData, city: e.target.value })}
                    placeholder="e.g. Rome, Italy"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Profile Photo URL</label>
                  <input 
                    type="text" 
                    value={profileFormData.avatarUrl || ''} 
                    onChange={e => setProfileFormData({ ...profileFormData, avatarUrl: e.target.value })}
                    placeholder="/guide-images/marco.webp"
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default GuideDashboard;
