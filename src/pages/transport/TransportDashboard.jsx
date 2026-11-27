import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Bus, 
  Plane, 
  Train, 
  Car,
  CheckCircle, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  Clock, 
  Users,
  Navigation,
  Building2,
  Save
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useCurrency } from '../../context/useCurrency';
import dashboardService from '../../services/dashboardDataService';
import SmartImage from '../../components/common/SmartImage';
import CurrencySwitcher from '../../components/common/CurrencySwitcher';
import './TransportDashboard.css';

const TransportDashboard = () => {
  const { user, logout } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('services');
  const initialTransportData = useMemo(() => {
    return dashboardService.getTransportDataSync ? dashboardService.getTransportDataSync() : { services: [], bookings: [] };
  }, []);
  const [services, setServices] = useState(initialTransportData.services || []);
  const [bookings, setBookings] = useState(initialTransportData.bookings || []);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Company Profile State (PDF Table 13)
  const [companyProfile, setCompanyProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('ts_transport_company');
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return {
      companyName: 'Apex Luxury Transports & Logistics Ltd.',
      licenseNumber: 'TRN-LIC-9021-USA',
      fleetSize: 64,
      vehicleTypes: 'Aviation, Intercity High-Speed Rail, Luxury SUVs, Executive Coaches',
      operatingRegions: 'North America, Europe, East Asia',
      contactEmail: 'operations@apextransports.com',
      contactPhone: '+1 (800) 555-8726',
      registeredAddress: '740 Transport Parkway, Suite 1200, Chicago, IL 60601'
    };
  });
  const [companyMsg, setCompanyMsg] = useState('');

  // Transport Service Modal state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    serviceType: 'Flight',
    title: '',
    origin: '',
    destination: '',
    departureTime: '08:00 AM',
    arrivalTime: '02:00 PM',
    duration: '6h 00m',
    price: 350,
    seatsTotal: 150,
    seatsAvailable: 50,
    vehicleName: 'Airbus A320',
    model: 'Airbus A320 Neo',
    imageUrl: '/transport-images/flight-jfk.webp',
    is_active: true,
    status: 'On Schedule'
  });

  const loadTransportData = async () => {
    try {
      const res = await dashboardService.getTransportData();
      setServices(res.services);
      setBookings(res.bookings);
    } catch (err) {
      console.error('Failed to load transport data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = (user?.role || '').toUpperCase();
    if (!user || (role !== 'TRANSPORT_PROVIDER' && role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
      navigate('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load; state is set after the awaited request
    loadTransportData();
  }, [user, navigate]);

  const handleSaveCompanyProfile = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('ts_transport_company', JSON.stringify(companyProfile));
    } catch { /* ignore */ }
    setCompanyMsg('Transport company profile and fleet license updated successfully!');
    setTimeout(() => setCompanyMsg(''), 3000);
  };

  const handleOpenServiceModal = (service = null) => {
    setEditingService(service);
    if (service) {
      setServiceFormData({
        ...service,
        model: service.model || service.vehicleName || '',
        imageUrl: service.imageUrl || '/transport-images/flight-jfk.webp',
        is_active: service.is_active !== false
      });
    } else {
      setServiceFormData({
        serviceType: 'Flight',
        title: 'Skyways Express Flight SK-990',
        origin: 'New York (JFK)',
        destination: 'London (LHR)',
        departureTime: '09:30 AM',
        arrivalTime: '09:45 PM',
        duration: '7h 15m',
        price: 720,
        seatsTotal: 200,
        seatsAvailable: 60,
        vehicleName: 'Boeing 787 Dreamliner',
        model: 'Boeing 787-9 Long Range',
        imageUrl: '/transport-images/flight-jfk.webp',
        is_active: true,
        status: 'On Schedule'
      });
    }
    setShowServiceModal(true);
  };

  const handleToggleServiceActive = async (serviceId) => {
    const target = services.find(s => s.id === serviceId);
    if (!target) return;
    const updated = { ...target, is_active: target.is_active === false };
    await dashboardService.saveTransportService(updated);
    setActionMsg(`Service #${serviceId} active status updated.`);
    setTimeout(() => setActionMsg(''), 2500);
    loadTransportData();
  };

  const handleQuickUpdateSchedule = async (serviceId, patch) => {
    await dashboardService.updateTransportSchedule(serviceId, patch);
    setActionMsg(`Schedule for route #${serviceId} updated successfully.`);
    setTimeout(() => setActionMsg(''), 2500);
    loadTransportData();
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    const serviceToSave = editingService ? { ...serviceFormData, id: editingService.id } : serviceFormData;
    await dashboardService.saveTransportService(serviceToSave);
    setActionMsg(editingService ? 'Transport schedule updated!' : 'New transportation route added!');
    setShowServiceModal(false);
    setTimeout(() => setActionMsg(''), 3000);
    loadTransportData();
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Delete this transportation service route?')) {
      await dashboardService.deleteTransportService(serviceId);
      setActionMsg('Service route deleted.');
      setTimeout(() => setActionMsg(''), 3000);
      loadTransportData();
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    await dashboardService.updateTransportBookingStatus(bookingId, status);
    setActionMsg(`Transport Ticket #${bookingId} updated to ${status}`);
    setTimeout(() => setActionMsg(''), 3000);
    loadTransportData();
  };

  const getTransportIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'flight': return <Plane size={20} className="type-icon flight" />;
      case 'bus': return <Bus size={20} className="type-icon bus" />;
      case 'train': return <Train size={20} className="type-icon train" />;
      case 'car': return <Car size={20} className="type-icon car" />;
      default: return <Navigation size={20} className="type-icon" />;
    }
  };

  return (
    <div className="transport-dashboard-container">
      {/* Top Banner Bar */}
      <div className="transport-header">
        <div className="transport-header-content">
          <div className="transport-title-badge">
            <Navigation size={28} className="transport-logo-icon" />
            <div>
              <h2>Apex Luxury Transports & Logistics</h2>
              <p>Transport Provider Portal • Flight, Bus, Train & Car Fleet Operations</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <CurrencySwitcher variant="dark" />
            <div className="transport-user-profile">
              <div className="transport-avatar">TP</div>
              <div className="transport-info">
                <span className="transport-name">{user?.name || 'Michael Chang'}</span>
                <span className="transport-role-tag">Transport Operator Manager</span>
              </div>
              <button className="transport-logout-btn" onClick={() => { logout(); navigate('/login'); }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="transport-toast-message">
          <CheckCircle size={18} /> {actionMsg}
        </div>
      )}

      {/* Main Tabs */}
      <div className="transport-tabs-bar">
        <button className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
          <Navigation size={18} /> Transport Routes & Fleet ({services.length})
        </button>
        <button className={`tab-btn ${activeTab === 'schedules' ? 'active' : ''}`} onClick={() => setActiveTab('schedules')}>
          <Clock size={18} /> Schedules & Departure Times
        </button>
        <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
          <Users size={18} /> Passenger Reservations ({bookings.length})
        </button>
        <button className={`tab-btn ${activeTab === 'company' ? 'active' : ''}`} onClick={() => setActiveTab('company')}>
          <Building2 size={18} /> Company Profile
        </button>
      </div>

      <div className="transport-content-area">
        {loading ? (
          <div className="transport-loading-state">
            <Clock size={32} className="spin-icon" />
            <p>Loading transport fleet data...</p>
          </div>
        ) : (
          <>
            {/* TRANSPORT ROUTES TAB */}
            {activeTab === 'services' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Active Transportation Services & Fleet</h3>
                    <p>Manage ticket pricing, seat allocations, flight numbers, vehicle models, and active status.</p>
                  </div>
                  <button className="btn-add-service" onClick={() => handleOpenServiceModal()}>
                    <Plus size={18} /> Add Transport Route
                  </button>
                </div>

                <div className="services-grid">
                  {services.map(svc => (
                    <div key={svc.id} className="service-card">
                      <div className="svc-card-img-wrap" style={{ position: 'relative' }}>
                        <SmartImage src={svc.imageUrl || '/transport-images/flight-jfk.webp'} alt={svc.vehicleName || svc.title} className="svc-thumb" />
                        <button
                          type="button"
                          onClick={() => handleToggleServiceActive(svc.id)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '20px',
                            border: 'none',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: svc.is_active !== false ? '#dcfce7' : '#fee2e2',
                            color: svc.is_active !== false ? '#15803d' : '#991b1b',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                          }}
                        >
                          {svc.is_active !== false ? '● Active' : '○ Inactive'}
                        </button>
                      </div>
                      <div className="svc-card-header">
                        <div className="svc-type-box">
                          {getTransportIcon(svc.serviceType)}
                          <span className="svc-type-text">{svc.serviceType}</span>
                        </div>
                        <span className="svc-status-tag">{svc.status}</span>
                      </div>

                      <h4>{svc.title}</h4>
                      <p className="vehicle-info-text">{svc.vehicleName} {svc.model ? `• Model: ${svc.model}` : ''}</p>

                      <div className="route-flow-box">
                        <div className="route-point">
                          <span className="point-label">ORIGIN</span>
                          <strong>{svc.origin}</strong>
                          <span className="time-text">{svc.departureTime}</span>
                        </div>
                        <div className="route-arrow">
                          <span>{svc.duration}</span>
                          <div className="line"></div>
                        </div>
                        <div className="route-point align-right">
                          <span className="point-label">DESTINATION</span>
                          <strong>{svc.destination}</strong>
                          <span className="time-text">{svc.arrivalTime}</span>
                        </div>
                      </div>

                      <div className="seat-pricing-bar">
                        <div>
                          <span className="price-label">Price / Fare</span>
                          <span className="ticket-price">{formatPrice(svc.price)} <small>{svc.serviceType === 'Car' ? '/ day' : '/ seat'}</small></span>
                        </div>
                        <div>
                          <span className="price-label">Seats Available</span>
                          <span className="seat-count"><strong>{svc.seatsAvailable}</strong> / {svc.seatsTotal}</span>
                        </div>
                      </div>

                      <div className="svc-card-actions">
                        <button className="btn-edit-svc" onClick={() => handleOpenServiceModal(svc)}>
                          <Edit size={16} /> Edit Route
                        </button>
                        <button className="btn-delete-svc" onClick={() => handleDeleteService(svc.id)}>
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCHEDULES TAB */}
            {activeTab === 'schedules' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Master Departure & Arrival Schedules</h3>
                    <p>Live schedule updates for flights, trains, and intercity Volvo coaches. Modify times and departure statuses.</p>
                  </div>
                </div>

                <div className="schedules-list">
                  {services.map(svc => (
                    <div key={svc.id} className="schedule-row-item" style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                      <div className="sch-icon-box">{getTransportIcon(svc.serviceType)}</div>
                      <div className="sch-details" style={{ flex: '1 1 200px' }}>
                        <h4>{svc.title}</h4>
                        <p>{svc.origin} → {svc.destination} ({svc.vehicleName})</p>
                      </div>
                      <div className="sch-times" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 700 }}>DEPART</label>
                          <input
                            type="text"
                            defaultValue={svc.departureTime}
                            onBlur={e => handleQuickUpdateSchedule(svc.id, { departureTime: e.target.value })}
                            style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', width: '90px' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 700 }}>ARRIVE</label>
                          <input
                            type="text"
                            defaultValue={svc.arrivalTime}
                            onBlur={e => handleQuickUpdateSchedule(svc.id, { arrivalTime: e.target.value })}
                            style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', width: '90px' }}
                          />
                        </div>
                      </div>
                      <div className="sch-status">
                        <select
                          value={svc.status}
                          onChange={e => handleQuickUpdateSchedule(svc.id, { status: e.target.value })}
                          style={{ padding: '0.3rem 0.6rem', borderRadius: '20px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.8rem', background: '#f8fafc', cursor: 'pointer' }}
                        >
                          <option value="On Schedule">On Schedule</option>
                          <option value="Delayed">Delayed</option>
                          <option value="Departed">Departed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PASSENGER RESERVATIONS TAB */}
            {activeTab === 'bookings' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Passenger Bookings & Ticket Manifest</h3>
                    <p>View confirmed customer seats, passenger names, and issued tickets.</p>
                  </div>
                </div>

                <div className="transport-table-container">
                  <table className="transport-table">
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Passenger Name</th>
                        <th>Transport Service</th>
                        <th>Travel Date</th>
                        <th>Seat Number(s)</th>
                        <th>Fare Paid</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id}>
                          <td><strong>{String(b.id).startsWith('#') ? b.id : `#${b.id}`}</strong></td>
                          <td>{b.passengerName}</td>
                          <td>{b.serviceTitle}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{b.travelDate}</td>
                          <td><span className="seat-badge" style={{ whiteSpace: 'nowrap' }}>{b.seatNumbers}</span></td>
                          <td><strong>{formatPrice(b.totalAmount)}</strong></td>
                          <td><span className={`status-pill ${b.status.toLowerCase()}`}>{b.status}</span></td>
                          <td>
                            {b.status === 'Pending' ? (
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button className="btn-confirm-bk" onClick={() => handleBookingStatus(b.id, 'Confirmed')}>Confirm</button>
                                <button 
                                  className="btn-cancel-bk" 
                                  style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                                  onClick={() => handleBookingStatus(b.id, 'Cancelled')}
                                >
                                  Reject / Cancel
                                </button>
                              </div>
                            ) : b.status === 'Confirmed' ? (
                              <button className="btn-cancel-bk" onClick={() => handleBookingStatus(b.id, 'Cancelled')}>Cancel Ticket</button>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Closed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* COMPANY PROFILE TAB (PDF Table 13) */}
            {activeTab === 'company' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Transport Carrier & Logistics Company Profile</h3>
                    <p>Manage licensed carrier credentials, fleet registration numbers, and operational jurisdictions.</p>
                  </div>
                </div>

                <div style={{ maxWidth: '720px', background: '#fff', borderRadius: '14px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', marginTop: '1rem' }}>
                  {companyMsg && (
                    <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={18} /> {companyMsg}
                    </div>
                  )}

                  <form onSubmit={handleSaveCompanyProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Company / Carrier Legal Name</label>
                      <input
                        type="text"
                        value={companyProfile.companyName}
                        onChange={e => setCompanyProfile({ ...companyProfile, companyName: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Operator License Number</label>
                        <input
                          type="text"
                          value={companyProfile.licenseNumber}
                          onChange={e => setCompanyProfile({ ...companyProfile, licenseNumber: e.target.value })}
                          required
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Total Active Fleet Size</label>
                        <input
                          type="number"
                          value={companyProfile.fleetSize}
                          onChange={e => setCompanyProfile({ ...companyProfile, fleetSize: parseInt(e.target.value) || 1 })}
                          required
                          min="1"
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Vehicle Types & Categories</label>
                      <input
                        type="text"
                        value={companyProfile.vehicleTypes}
                        onChange={e => setCompanyProfile({ ...companyProfile, vehicleTypes: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Operating Regions & Hubs</label>
                      <input
                        type="text"
                        value={companyProfile.operatingRegions}
                        onChange={e => setCompanyProfile({ ...companyProfile, operatingRegions: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Operations Email</label>
                        <input
                          type="email"
                          value={companyProfile.contactEmail}
                          onChange={e => setCompanyProfile({ ...companyProfile, contactEmail: e.target.value })}
                          required
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Dispatch Phone</label>
                        <input
                          type="tel"
                          value={companyProfile.contactPhone}
                          onChange={e => setCompanyProfile({ ...companyProfile, contactPhone: e.target.value })}
                          required
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Registered Logistics Address</label>
                      <input
                        type="text"
                        value={companyProfile.registeredAddress}
                        onChange={e => setCompanyProfile({ ...companyProfile, registeredAddress: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="submit"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.5rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer' }}
                      >
                        <Save size={16} /> Save Company Profile
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* SERVICE MODAL */}
      {showServiceModal && createPortal(
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="transport-modal-card">
            <h3>{editingService ? 'Edit Transportation Service' : 'Add New Transport Route'}</h3>
            <form onSubmit={handleSaveService}>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Service Type</label>
                  <select 
                    value={serviceFormData.serviceType} 
                    onChange={e => setServiceFormData({ ...serviceFormData, serviceType: e.target.value })}
                  >
                    <option value="Flight">Flight (Airway)</option>
                    <option value="Bus">Bus (Volvo / Express Coach)</option>
                    <option value="Train">Train (High Speed / Rail)</option>
                    <option value="Car">Car / Executive Chauffeur</option>
                    <option value="SUV">SUV (All-Terrain AWD)</option>
                    <option value="Bike">Motorbike / Adventure Tour</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Ticket Fare Price ($)</label>
                  <input 
                    type="number" 
                    value={serviceFormData.price} 
                    onChange={e => setServiceFormData({ ...serviceFormData, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Route Service Title</label>
                <input 
                  type="text" 
                  value={serviceFormData.title} 
                  onChange={e => setServiceFormData({ ...serviceFormData, title: e.target.value })}
                  required
                  placeholder="e.g. Skyways Flight SK-702"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Origin City / Station</label>
                  <input 
                    type="text" 
                    value={serviceFormData.origin} 
                    onChange={e => setServiceFormData({ ...serviceFormData, origin: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Destination City / Station</label>
                  <input 
                    type="text" 
                    value={serviceFormData.destination} 
                    onChange={e => setServiceFormData({ ...serviceFormData, destination: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Departure Time</label>
                  <input 
                    type="text" 
                    value={serviceFormData.departureTime} 
                    onChange={e => setServiceFormData({ ...serviceFormData, departureTime: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Arrival Time</label>
                  <input 
                    type="text" 
                    value={serviceFormData.arrivalTime} 
                    onChange={e => setServiceFormData({ ...serviceFormData, arrivalTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Total Seats Capacity</label>
                  <input 
                    type="number" 
                    value={serviceFormData.seatsTotal} 
                    onChange={e => setServiceFormData({ ...serviceFormData, seatsTotal: parseInt(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>Available Seats</label>
                  <input 
                    type="number" 
                    value={serviceFormData.seatsAvailable} 
                    onChange={e => setServiceFormData({ ...serviceFormData, seatsAvailable: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Vehicle Name / Designation</label>
                  <input 
                    type="text" 
                    value={serviceFormData.vehicleName || ''} 
                    onChange={e => setServiceFormData({ ...serviceFormData, vehicleName: e.target.value })}
                    placeholder="e.g. Boeing 787 Dreamliner"
                  />
                </div>

                <div className="form-group">
                  <label>Vehicle Model / Make (PDF Table 12)</label>
                  <input 
                    type="text" 
                    value={serviceFormData.model || ''} 
                    onChange={e => setServiceFormData({ ...serviceFormData, model: e.target.value })}
                    placeholder="e.g. 787-9 Long-Range"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Vehicle Photo URL</label>
                <input 
                  type="text" 
                  value={serviceFormData.imageUrl || ''} 
                  onChange={e => setServiceFormData({ ...serviceFormData, imageUrl: e.target.value })}
                  placeholder="/transport-images/flight-jfk.webp"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0 1rem' }}>
                <input
                  type="checkbox"
                  id="svc-active-checkbox"
                  checked={serviceFormData.is_active !== false}
                  onChange={e => setServiceFormData({ ...serviceFormData, is_active: e.target.checked })}
                />
                <label htmlFor="svc-active-checkbox" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                  Active Vehicle / Route (Visible to travelers)
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowServiceModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Service Route</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TransportDashboard;
