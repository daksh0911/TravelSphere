import { useState, useEffect } from 'react';
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
  Users
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import dashboardService from '../../services/dashboardDataService';
import './HotelDashboard.css';
import SmartImage from '../../components/common/SmartImage';

const HotelDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('hotel');
  const [hotelInfo, setHotelInfo] = useState({});
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  // Edit Hotel Info modal state
  const [showHotelModal, setShowHotelModal] = useState(false);
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
    imageUrl: ''
  });

  const loadHotelData = async () => {
    try {
      const res = await dashboardService.getHotelData();
      setHotelInfo(res.hotelInfo);
      setRooms(res.rooms);
      setReservations(res.reservations);
      setHotelFormData(res.hotelInfo);
    } catch (err) {
      console.error('Failed to load hotel data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load; state is set after the awaited request
    loadHotelData();
  }, []);

  const handleSaveHotelInfo = async (e) => {
    e.preventDefault();
    await dashboardService.saveHotelInfo(hotelFormData);
    setActionMsg('Hotel information and facilities updated successfully!');
    setShowHotelModal(false);
    setTimeout(() => setActionMsg(''), 3000);
    loadHotelData();
  };

  const handleOpenRoomModal = (room = null) => {
    setEditingRoom(room);
    if (room) {
      setRoomFormData(room);
    } else {
      setRoomFormData({
        roomType: 'Susuki Pavilion',
        pricePerNight: 2800,
        capacity: '2 Adults',
        status: 'Available',
        amenities: 'King Bed, Forest Canopy View, Hinoki Cypress Tub, Tatami Living Area',
        imageUrl: '/hotel-images/aman-kyoto.jpg'
      });
    }
    setShowRoomModal(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    const roomToSave = editingRoom ? { ...roomFormData, id: editingRoom.id } : roomFormData;
    await dashboardService.saveHotelRoom(roomToSave);
    setActionMsg(editingRoom ? 'Room details updated!' : 'New room added to property!');
    setShowRoomModal(false);
    setTimeout(() => setActionMsg(''), 3000);
    loadHotelData();
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Remove this room from inventory?')) {
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

  return (
    <div className="hotel-dashboard-container">
      {/* Top Banner Bar */}
      <div className="hotel-header">
        <div className="hotel-header-content">
          <div className="hotel-title-badge">
            <Building size={28} className="hotel-logo-icon" />
            <div>
              <h2>{hotelInfo.name || 'Aman Kyoto'}</h2>
              <p>Property Manager Hub • Live Reservation Management</p>
            </div>
          </div>

          <div className="hotel-user-profile">
            <div className="hotel-avatar">AK</div>
            <div className="hotel-info">
              <span className="hotel-name">{user?.name || 'Kenji Sato'}</span>
              <span className="hotel-role-tag">General Hotel Manager</span>
            </div>
            <button className="hotel-logout-btn" onClick={() => { logout(); navigate('/login'); }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="hotel-toast-message">
          <CheckCircle size={18} /> {actionMsg}
        </div>
      )}

      {/* Main Tabs */}
      <div className="hotel-tabs-bar">
        <button className={`tab-btn ${activeTab === 'hotel' ? 'active' : ''}`} onClick={() => setActiveTab('hotel')}>
          <Building size={18} /> Hotel Profile & Facilities
        </button>
        <button className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>
          <Bed size={18} /> Room Management & Pricing ({rooms.length})
        </button>
        <button className={`tab-btn ${activeTab === 'reservations' ? 'active' : ''}`} onClick={() => setActiveTab('reservations')}>
          <Calendar size={18} /> Guest Reservations ({reservations.length})
        </button>
      </div>

      <div className="hotel-content-area">
        {loading ? (
          <div className="hotel-loading-state">
            <Clock size={32} className="spin-icon" />
            <p>Loading hotel property data...</p>
          </div>
        ) : (
          <>
            {/* HOTEL PROFILE & FACILITIES TAB */}
            {activeTab === 'hotel' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Property Overview & Amenities</h3>
                    <p>Manage property photos, star rating, address, and guest luxury amenities.</p>
                  </div>
                  <button className="btn-edit-hotel" onClick={() => setShowHotelModal(true)}>
                    <Edit size={18} /> Edit Property Details
                  </button>
                </div>

                <div className="hotel-profile-card">
                  <SmartImage src={hotelInfo.imageUrl} alt={hotelInfo.name} className="hotel-hero-img" />
                  <div className="hotel-profile-details">
                    <div className="property-badge-row">
                      <span className="prop-type">{hotelInfo.propertyType}</span>
                      <span className="prop-rating">★ {hotelInfo.rating} Excellence Rating</span>
                    </div>
                    <h2>{hotelInfo.name}</h2>
                    <p className="prop-address"><MapPin size={16} /> {hotelInfo.address}</p>
                    <p className="prop-desc">{hotelInfo.description}</p>

                    <div className="prop-contact-box">
                      <span><strong>Email:</strong> {hotelInfo.contactEmail}</span>
                      <span><strong>Phone:</strong> {hotelInfo.contactPhone}</span>
                    </div>

                    <h4>Property Facilities & Guest Amenities</h4>
                    <div className="facilities-tags">
                      {(hotelInfo.facilities || []).map((fac, i) => (
                        <span key={i} className="facility-pill"><CheckCircle size={14} /> {fac}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ROOM MANAGEMENT & PRICING TAB */}
            {activeTab === 'rooms' && (
              <div className="tab-pane">
                <div className="pane-header-row">
                  <div>
                    <h3>Hotel Rooms & Pricing Inventory</h3>
                    <p>Set room rates, availability status, and luxury suite amenities.</p>
                  </div>
                  <button className="btn-add-room" onClick={() => handleOpenRoomModal()}>
                    <Plus size={18} /> Add New Hotel Room
                  </button>
                </div>

                <div className="rooms-grid">
                  {rooms.map(room => (
                    <div key={room.id} className="room-card">
                      <SmartImage src={room.imageUrl} alt={room.roomType} className="room-img" />
                      <div className="room-card-body">
                        <div className="room-header-row">
                          <h4>{room.roomType}</h4>
                          <span className={`room-status ${room.status.toLowerCase()}`}>{room.status}</span>
                        </div>
                        <p className="room-capacity"><Users size={14} /> Max Capacity: {room.capacity}</p>
                        <p className="room-amenities">{room.amenities}</p>

                        <div className="room-footer-row">
                          <div>
                            <span className="price-label">Nightly Rate</span>
                            <span className="room-price">${room.pricePerNight} <small>/ night</small></span>
                          </div>
                          <div className="room-action-btns">
                            <button className="btn-edit-sm" onClick={() => handleOpenRoomModal(room)}><Edit size={16} /></button>
                            <button className="btn-delete-sm" onClick={() => handleDeleteRoom(room.id)}><Trash2 size={16} /></button>
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
                    <p>Confirm check-in bookings, manage cancellations, and review guest payment records.</p>
                  </div>
                </div>

                <div className="hotel-table-container">
                  <table className="hotel-table">
                    <thead>
                      <tr>
                        <th>Reservation Ref</th>
                        <th>Guest Name</th>
                        <th>Booked Suite</th>
                        <th>Check-In Date</th>
                        <th>Check-Out Date</th>
                        <th>Total Bill</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map(res => (
                        <tr key={res.id}>
                          <td><strong>#{res.id}</strong></td>
                          <td>{res.guestName}</td>
                          <td>{res.roomType}</td>
                          <td>{res.checkIn}</td>
                          <td>{res.checkOut}</td>
                          <td><strong>${res.totalAmount}</strong></td>
                          <td><span className={`status-pill ${res.status.toLowerCase()}`}>{res.status}</span></td>
                          <td>
                            {res.status !== 'Confirmed' ? (
                              <button className="btn-confirm-res" onClick={() => handleReservationStatus(res.id, 'Confirmed')}>
                                Confirm
                              </button>
                            ) : (
                              <button className="btn-cancel-res" onClick={() => handleReservationStatus(res.id, 'Cancelled')}>
                                Cancel
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
          </>
        )}
      </div>

      {/* EDIT HOTEL PROFILE MODAL */}
      {showHotelModal && (
        <div className="modal-overlay">
          <div className="hotel-modal-card">
            <h3>Update Hotel Profile & Details</h3>
            <form onSubmit={handleSaveHotelInfo}>
              <div className="form-group">
                <label>Hotel / Property Name</label>
                <input 
                  type="text" 
                  value={hotelFormData.name || ''} 
                  onChange={e => setHotelFormData({ ...hotelFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Property Type</label>
                  <input 
                    type="text" 
                    value={hotelFormData.propertyType || ''} 
                    onChange={e => setHotelFormData({ ...hotelFormData, propertyType: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input 
                    type="text" 
                    value={hotelFormData.contactPhone || ''} 
                    onChange={e => setHotelFormData({ ...hotelFormData, contactPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Full Address</label>
                <input 
                  type="text" 
                  value={hotelFormData.address || ''} 
                  onChange={e => setHotelFormData({ ...hotelFormData, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Main Photo Image URL</label>
                <input 
                  type="text" 
                  value={hotelFormData.imageUrl || ''} 
                  onChange={e => setHotelFormData({ ...hotelFormData, imageUrl: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowHotelModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROOM MODAL */}
      {showRoomModal && (
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
                    value={roomFormData.pricePerNight} 
                    onChange={e => setRoomFormData({ ...roomFormData, pricePerNight: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Room Availability Status</label>
                  <select 
                    value={roomFormData.status} 
                    onChange={e => setRoomFormData({ ...roomFormData, status: e.target.value })}
                  >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Amenities Description</label>
                <input 
                  type="text" 
                  value={roomFormData.amenities} 
                  onChange={e => setRoomFormData({ ...roomFormData, amenities: e.target.value })}
                  placeholder="e.g. King Bed, Balcony, Private Jacuzzi"
                />
              </div>

              <div className="form-group">
                <label>Room Image URL</label>
                <input 
                  type="text" 
                  value={roomFormData.imageUrl} 
                  onChange={e => setRoomFormData({ ...roomFormData, imageUrl: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowRoomModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDashboard;
