import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bus, 
  Plane, 
  Train, 
  CheckCircle, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  Clock, 
  Users,
  Navigation
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import dashboardService from '../../services/dashboardDataService';
import SmartImage from '../../components/common/SmartImage';
import './TransportDashboard.css';

const TransportDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load; state is set after the awaited request
    loadTransportData();
  }, []);

  const handleOpenServiceModal = (service = null) => {
    setEditingService(service);
    if (service) {
      setServiceFormData(service);
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
        status: 'On Schedule'
      });
    }
    setShowServiceModal(true);
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
              <p>Transport Provider Portal • Flight, Bus & Train Operations</p>
            </div>
          </div>

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
                    <p>Manage ticket pricing, seat allocations, flight numbers, and vehicle types.</p>
                  </div>
                  <button className="btn-add-service" onClick={() => handleOpenServiceModal()}>
                    <Plus size={18} /> Add Transport Route
                  </button>
                </div>

                <div className="services-grid">
                  {services.map(svc => (
                    <div key={svc.id} className="service-card">
                      {svc.imageUrl && (
                        <div className="svc-card-img-wrap">
                          <SmartImage src={svc.imageUrl} alt={svc.vehicleName || svc.title} className="svc-thumb" />
                        </div>
                      )}
                      <div className="svc-card-header">
                        <div className="svc-type-box">
                          {getTransportIcon(svc.serviceType)}
                          <span className="svc-type-text">{svc.serviceType}</span>
                        </div>
                        <span className="svc-status-tag">{svc.status}</span>
                      </div>

                      <h4>{svc.title}</h4>
                      <p className="vehicle-info-text">{svc.vehicleName}</p>

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
                          <span className="price-label">Seat Price</span>
                          <span className="ticket-price">${svc.price}</span>
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
                    <p>Live schedule updates for flights, trains, and intercity Volvo coaches.</p>
                  </div>
                </div>

                <div className="schedules-list">
                  {services.map(svc => (
                    <div key={svc.id} className="schedule-row-item">
                      <div className="sch-icon-box">{getTransportIcon(svc.serviceType)}</div>
                      <div className="sch-details">
                        <h4>{svc.title}</h4>
                        <p>{svc.origin} → {svc.destination} ({svc.vehicleName})</p>
                      </div>
                      <div className="sch-times">
                        <span><strong>Depart:</strong> {svc.departureTime}</span>
                        <span><strong>Arrive:</strong> {svc.arrivalTime}</span>
                      </div>
                      <div className="sch-status">
                        <span className="status-pill active">{svc.status}</span>
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
                          <td><strong>#{b.id}</strong></td>
                          <td>{b.passengerName}</td>
                          <td>{b.serviceTitle}</td>
                          <td>{b.travelDate}</td>
                          <td><span className="seat-badge">{b.seatNumbers}</span></td>
                          <td><strong>${b.totalAmount}</strong></td>
                          <td><span className={`status-pill ${b.status.toLowerCase()}`}>{b.status}</span></td>
                          <td>
                            {b.status !== 'Confirmed' ? (
                              <button className="btn-confirm-bk" onClick={() => handleBookingStatus(b.id, 'Confirmed')}>Confirm</button>
                            ) : (
                              <button className="btn-cancel-bk" onClick={() => handleBookingStatus(b.id, 'Cancelled')}>Cancel</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* SERVICE MODAL */}
      {showServiceModal && (
        <div className="modal-overlay">
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
                    <option value="Bus">Bus (Volvo / Express)</option>
                    <option value="Train">Train (High Speed / Rail)</option>
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

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowServiceModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Service Route</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportDashboard;
