// Unified service layer for all 5 Provider & Admin + Customer Dashboards
// Synchronized with TravelSphere's official public media catalog (packages, hotels, vehicles, destinations)

// Initial Mock Seed Data for Dashboards
const SEED_USERS = [
  { id: 100, name: 'Admin User', email: 'admin@travel.com', role: 'ADMIN', phone: '+1-555-0100', status: 'ACTIVE', created_at: '2026-05-01' },
  { id: 101, name: 'Customer User', email: 'customer@travel.com', role: 'CUSTOMER', phone: '+1-555-0192', status: 'ACTIVE', created_at: '2026-08-10' },
  { id: 102, name: 'Robert Vance', email: 'robert@example.com', role: 'CUSTOMER', phone: '+1-555-0144', status: 'ACTIVE', created_at: '2026-08-14' },
  { id: 103, name: 'Sophia Reed', email: 'sophia@example.com', role: 'CUSTOMER', phone: '+1-555-0188', status: 'ACTIVE', created_at: '2026-08-20' },
  { id: 104, name: 'Travel Agent', email: 'agent@travel.com', role: 'TRAVEL_AGENT', phone: '+1-555-0101', status: 'ACTIVE', company: 'Horizon Escapes', created_at: '2026-07-12' },
  { id: 105, name: 'David Miller', email: 'david@wanderlust.com', role: 'TRAVEL_AGENT', phone: '+1-555-0104', status: 'PENDING', company: 'Wanderlust Tours', created_at: '2026-09-01' },
  { id: 106, name: 'Hotel Manager', email: 'hotel@travel.com', role: 'HOTEL_MANAGER', phone: '+81-75-498-5000', status: 'ACTIVE', company: 'Aman Kyoto', created_at: '2026-06-15' },
  { id: 107, name: 'Amira Al-Mansoor', email: 'amira@almaharesort.com', role: 'HOTEL_MANAGER', phone: '+971-4-832-9900', status: 'PENDING', company: 'Al Maha Desert Resort & Spa', created_at: '2026-09-04' },
  { id: 108, name: 'Transport Provider', email: 'transport@travel.com', role: 'TRANSPORT_PROVIDER', phone: '+1-555-0102', status: 'ACTIVE', company: 'Apex Luxury Transports', created_at: '2026-05-11' },
  { id: 109, name: 'Carlos Rodriguez', email: 'carlos@speedyfleets.com', role: 'TRANSPORT_PROVIDER', phone: '+1-555-0105', status: 'PENDING', company: 'Speedy Fleet Express', created_at: '2026-09-08' },
  { id: 110, name: 'Tour Guide', email: 'guide@travel.com', role: 'TOUR_GUIDE', phone: '+1-555-0199', status: 'ACTIVE', company: 'Independent Alpine Guide', created_at: '2026-08-01' },
  { id: 111, name: 'Yuki Tanaka', email: 'yuki@tokyoguides.jp', role: 'TOUR_GUIDE', phone: '+81-90-5551', status: 'PENDING', company: 'Tokyo Heritage Guides', created_at: '2026-09-10' }
];

const SEED_AGENT_PACKAGES = [
  {
    id: 1,
    title: 'Kyoto Culture & Sakura Blossom Tour',
    category: 'Culture & Heritage',
    location: 'Kyoto, Japan',
    days: 7,
    nights: 6,
    price: 955,
    availability: 'Available',
    maxCapacity: 15,
    bookedCount: 8,
    promo: '10% Early Bird OFF',
    rating: 4.9,
    imageUrl: '/package-images/5-kyoto.webp',
    itinerary: [
      { day: 1, title: 'Arrival in Kyoto & Gion Sunset Walk' },
      { day: 2, title: 'Fushimi Inari Shrine & Kiyomizu-dera Temple' },
      { day: 3, title: 'Arashiyama Bamboo Grove & Sagano Scenic Railway' },
      { day: 4, title: 'Traditional Tea Ceremony & Geisha Cultural Tour' }
    ]
  },
  {
    id: 2,
    title: 'Santorini Villa & Yacht Week',
    category: 'Honeymoon Specials',
    location: 'Santorini, Greece',
    days: 6,
    nights: 5,
    price: 1242,
    availability: 'Available',
    maxCapacity: 10,
    bookedCount: 6,
    promo: 'Complimentary Wine Tasting',
    rating: 4.8,
    imageUrl: '/package-images/2-santorini.webp',
    itinerary: [
      { day: 1, title: 'Oia Cliffside Villa Check-in & Caldera Sunset Dinner' },
      { day: 2, title: 'Volcanic Island & Hot Springs Catamaran Sail' },
      { day: 3, title: 'Santo Winery Private Tasting & Akrotiri Ruins' }
    ]
  },
  {
    id: 3,
    title: 'Swiss Alps Scenic Glacier Express',
    category: 'Mountain Escapes',
    location: 'Interlaken, Switzerland',
    days: 8,
    nights: 7,
    price: 1985,
    availability: 'Limited Seats',
    maxCapacity: 12,
    bookedCount: 10,
    promo: 'First Class Pass Included',
    rating: 5.0,
    imageUrl: '/package-images/4-swiss-alps.webp',
    itinerary: [
      { day: 1, title: 'Arrival in Zurich & Transfer to Interlaken Chalet' },
      { day: 2, title: 'Jungfraujoch - Top of Europe Glacier Expedition' }
    ]
  },
  {
    id: 4,
    title: 'Maldives Overwater Luxury Escape',
    category: 'Beach & Islands',
    location: 'Maldives',
    days: 5,
    nights: 4,
    price: 1045,
    availability: 'Available',
    maxCapacity: 8,
    bookedCount: 5,
    promo: 'Dolphin Cruise Included',
    rating: 4.9,
    imageUrl: '/package-images/1-maldives.webp',
    itinerary: [
      { day: 1, title: 'Seaplane Transfer to Overwater Private Villa' },
      { day: 2, title: 'Coral Reef Snorkeling & Sunset Lagoon Sail' }
    ]
  }
];

const SEED_HOTEL_INFO = {
  name: 'Aman Kyoto',
  location: 'Kyoto, Japan',
  propertyType: '5-Star Luxury Resort & Onsen',
  rating: 4.8,
  address: '1 Okitayama Washimine-cho, Kita-ku, Kyoto, 603-8458, Japan',
  contactEmail: 'amankyoto@aman.com',
  contactPhone: '+81 75 498 5000',
  imageUrl: '/hotel-images/aman-kyoto.jpg',
  description: 'Set within an ethereal secret garden framed by ancient cedar forests and mountain streams, Aman Kyoto celebrates classical Japanese ryokan hospitality, mineral onsens, and minimalist architecture.',
  facilities: ['Natural Thermal Onsens', 'Taka-an Kaiseki Dining', 'Living Pavilion Lounge', 'Aman Spa & Wellness', 'Botanical Forest Gardens', '24/7 Concierge']
};

const SEED_HOTEL_ROOMS = [
  { id: 201, roomType: 'Susuki Pavilion', pricePerNight: 2800, capacity: '2 Adults', status: 'Available', amenities: 'King Bed, Forest Canopy View, Hinoki Cypress Tub, Tatami Living Area', imageUrl: '/hotel-images/aman-kyoto.jpg' },
  { id: 202, roomType: 'Canaves Caldera Suite', pricePerNight: 1250, capacity: '2 Adults', status: 'Available', amenities: 'Private Cliffside Infinity Plunge Pool, Aegean Sea Horizon, Cycladic Arched Living', imageUrl: '/hotel-images/canaves-oia.jpg' },
  { id: 203, roomType: 'Al Maha Bedouin Desert Villa', pricePerNight: 1800, capacity: '2 Adults', status: 'Booked', amenities: 'Private Temperature-Controlled Pool, Gazelle Wildlife Views, Handcrafted Arabian Antiques', imageUrl: '/hotel-images/al-maha.jpg' }
];

const SEED_HOTEL_RESERVATIONS = [
  { id: 'RES-8801', guestName: 'Alice Walker', roomType: 'Susuki Pavilion', checkIn: '2026-10-15', checkOut: '2026-10-20', guests: 2, totalAmount: 14000, status: 'Confirmed', paymentStatus: 'Paid' },
  { id: 'RES-8802', guestName: 'Robert Vance', roomType: 'Canaves Caldera Suite', checkIn: '2026-11-01', checkOut: '2026-11-05', guests: 2, totalAmount: 5000, status: 'Pending', paymentStatus: 'Deposit Paid' },
  { id: 'RES-8803', guestName: 'Sophia Reed', roomType: 'Al Maha Bedouin Desert Villa', checkIn: '2026-12-24', checkOut: '2026-12-28', guests: 2, totalAmount: 7200, status: 'Confirmed', paymentStatus: 'Paid' }
];

const SEED_TRANSPORT_SERVICES = [
  { 
    id: 301, 
    serviceType: 'Car', 
    title: 'Mercedes-Benz E-Class Private Chauffeur', 
    origin: 'Zurich Airport', 
    destination: 'Interlaken Chalets', 
    departureTime: '09:00 AM', 
    arrivalTime: '11:15 AM', 
    duration: '2h 15m', 
    price: 240, 
    seatsTotal: 4, 
    seatsAvailable: 3, 
    vehicleName: 'Mercedes-Benz E-Class Executive Sedan', 
    imageUrl: '/vehicle-images/mercedes-e-class.webp',
    status: 'On Schedule' 
  },
  { 
    id: 302, 
    serviceType: 'SUV', 
    title: 'Range Rover Velar Alpine 4x4 Expedition', 
    origin: 'Geneva', 
    destination: 'Zermatt Glacier Base', 
    departureTime: '08:00 AM', 
    arrivalTime: '11:45 AM', 
    duration: '3h 45m', 
    price: 360, 
    seatsTotal: 5, 
    seatsAvailable: 2, 
    vehicleName: 'Range Rover Velar All-Terrain AWD', 
    imageUrl: '/vehicle-images/range-rover-velar.webp',
    status: 'On Schedule' 
  },
  { 
    id: 303, 
    serviceType: 'Bike', 
    title: 'BMW R 1250 GS High-Alpine Pass Tour', 
    origin: 'Interlaken Hub', 
    destination: 'Grimsel & Furka Pass', 
    departureTime: '10:00 AM', 
    arrivalTime: '04:30 PM', 
    duration: '6h 30m', 
    price: 185, 
    seatsTotal: 2, 
    seatsAvailable: 1, 
    vehicleName: 'BMW R 1250 GS Adventure Touring', 
    imageUrl: '/vehicle-images/bmw-r1250gs.webp',
    status: 'On Schedule' 
  }
];

const SEED_TRANSPORT_BOOKINGS = [
  { id: 'TRP-501', passengerName: 'Alice Walker', serviceTitle: 'Mercedes-Benz E-Class Private Chauffeur', serviceType: 'Car', travelDate: '2026-10-15', seatNumbers: 'VIP Rear Suite', totalAmount: 240, status: 'Confirmed', paymentStatus: 'Paid' },
  { id: 'TRP-502', passengerName: 'Robert Vance', serviceTitle: 'Range Rover Velar Alpine 4x4 Expedition', serviceType: 'SUV', travelDate: '2026-10-22', seatNumbers: 'Full Cabin (Seats 1-4)', totalAmount: 360, status: 'Confirmed', paymentStatus: 'Paid' },
  { id: 'TRP-503', passengerName: 'Sophia Reed', serviceTitle: 'BMW R 1250 GS High-Alpine Pass Tour', serviceType: 'Bike', travelDate: '2026-11-02', seatNumbers: 'Solo Rider Pack', totalAmount: 185, status: 'Pending', paymentStatus: 'Pending' }
];

const SEED_GUIDE_PROFILE = {
  fullName: 'Marco Rossi',
  bio: 'Certified Alpine Explorer & Cultural Historian with over 9 years of guided mountain treks and historical city walks in Western Europe.',
  languages: ['English', 'Italian', 'French', 'German'],
  experienceYears: 9,
  hourlyRate: 65,
  dailyRate: 380,
  city: 'Interlaken & Swiss Alps',
  status: 'Available',
  availabilityCalendar: 'Full Availability for Autumn 2026',
  rating: 4.95,
  completedTours: 142,
  avatarUrl: '/destination-images/swiss-alps.webp'
};

const SEED_GUIDE_REQUESTS = [
  { id: 'G-701', customerName: 'Alice Walker', phone: '+1-555-0192', tourName: 'Matterhorn & Glacier Panorama Trail', location: 'Zermatt, Switzerland', requestDate: '2026-10-18', guests: 2, totalAmount: 760, status: 'Pending', specialNotes: 'Interested in photography spots along alpine lakes.' },
  { id: 'G-702', customerName: 'Robert Vance', phone: '+1-555-0144', tourName: 'Interlaken Old Town & Castle Heritage Walk', location: 'Interlaken, Switzerland', requestDate: '2026-10-22', guests: 4, totalAmount: 450, status: 'Accepted', specialNotes: 'Includes elderly family members, easy walking pace needed.' },
  { id: 'G-703', customerName: 'Sophia Reed', phone: '+1-555-0188', tourName: 'Lucerne Alpine Sunset Trek', location: 'Lucerne, Switzerland', requestDate: '2026-11-05', guests: 2, totalAmount: 520, status: 'Completed', specialNotes: 'Private anniversary tour.' }
];

const SEED_COMPLAINTS = [
  { id: 'CMP-101', customerName: 'Robert Vance', subject: 'Flight delay notification issue', category: 'Transportation', message: 'Departure time was delayed by 2 hours without SMS alert.', status: 'Open', response: '', createdAt: '2026-09-02' },
  { id: 'CMP-102', customerName: 'Sophia Reed', subject: 'Refund request for extra baggage', category: 'Payments', message: 'Baggage fee was charged twice at check-in counter.', status: 'In Progress', response: 'Admin inspecting carrier invoice.', createdAt: '2026-09-05' },
  { id: 'CMP-103', customerName: 'Alice Walker', subject: 'Hotel room view upgrade question', category: 'Hotel Stay', message: 'Query regarding lake view upgrade option.', status: 'Resolved', response: 'Upgraded guest to Deluxe Ocean Suite free of charge.', createdAt: '2026-08-28' }
];

// LocalStorage Helper functions
const getStored = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    const parsed = JSON.parse(data);
    // Sync with updated verified catalog assets
    if (key === 'ts_agent_packages' && Array.isArray(parsed) && parsed.some(p => p.imageUrl?.includes('destination-images'))) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    if (key === 'ts_hotel_rooms' && Array.isArray(parsed) && parsed.some(r => r.imageUrl?.includes('aman-kyoto.jpg') && parsed.length < 3)) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    if (key === 'ts_transport_services' && Array.isArray(parsed) && !parsed.some(s => s.imageUrl)) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
};

const setStored = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage save error:', e);
  }
};

// API Service Interface for Dashboards
export const dashboardService = {
  // ---------------- ADMIN DASHBOARD ----------------
  getAdminData: async () => {
    const users = getStored('ts_admin_users', SEED_USERS);
    const packages = getStored('ts_agent_packages', SEED_AGENT_PACKAGES);
    const complaints = getStored('ts_admin_complaints', SEED_COMPLAINTS);
    const hotelReservations = getStored('ts_hotel_reservations', SEED_HOTEL_RESERVATIONS);
    const transportBookings = getStored('ts_transport_bookings', SEED_TRANSPORT_BOOKINGS);

    const totalRevenue = hotelReservations.reduce((sum, r) => sum + r.totalAmount, 0) + 
                         transportBookings.reduce((sum, t) => sum + t.totalAmount, 0) + 
                         packages.reduce((sum, p) => sum + (p.price * p.bookedCount), 0);

    return {
      users,
      packages,
      complaints,
      stats: {
        totalRevenue,
        totalUsers: users.length,
        activePackages: packages.length,
        openComplaints: complaints.filter(c => c.status !== 'Resolved').length
      }
    };
  },

  updateUserStatus: async (userId, newStatus) => {
    const users = getStored('ts_admin_users', SEED_USERS);
    const updated = users.map(u => u.id === userId ? { ...u, status: newStatus } : u);
    setStored('ts_admin_users', updated);
    return { success: true };
  },

  approveProvider: async (userId) => {
    const users = getStored('ts_admin_users', SEED_USERS);
    const updated = users.map(u => u.id === userId ? { ...u, status: 'ACTIVE' } : u);
    setStored('ts_admin_users', updated);
    return { success: true };
  },

  updatePackagePrice: async (pkgId, newPrice) => {
    const packages = getStored('ts_agent_packages', SEED_AGENT_PACKAGES);
    const updated = packages.map(p => p.id === pkgId ? { ...p, price: parseFloat(newPrice) } : p);
    setStored('ts_agent_packages', updated);
    return { success: true };
  },

  resolveComplaint: async (complaintId, responseText) => {
    const complaints = getStored('ts_admin_complaints', SEED_COMPLAINTS);
    const updated = complaints.map(c => c.id === complaintId ? { ...c, status: 'Resolved', response: responseText || 'Resolved by Administrator' } : c);
    setStored('ts_admin_complaints', updated);
    return { success: true };
  },

  // ---------------- AGENT DASHBOARD ----------------
  getAgentData: async () => {
    const packages = getStored('ts_agent_packages', SEED_AGENT_PACKAGES);
    const inquiries = getStored('ts_agent_inquiries', [
      { id: 'INQ-401', packageTitle: 'Kyoto Culture & Sakura Blossom Tour', customerName: 'Alice Walker', message: 'Are vegetarian Kaiseki dinners available during the Kyoto ryokan stay?', status: 'Pending', date: '2026-10-01' },
      { id: 'INQ-402', packageTitle: 'Swiss Alps Scenic Glacier Express', customerName: 'Robert Vance', message: 'Does the First Class Swiss Rail Pass cover luggage transfers between hotels?', status: 'Replied', reply: 'Yes, full doorstep luggage courier is included in your first-class package ticket.', date: '2026-09-28' }
    ]);
    return { packages, inquiries };
  },

  saveAgentPackage: async (pkg) => {
    const packages = getStored('ts_agent_packages', SEED_AGENT_PACKAGES);
    let updated;
    if (pkg.id) {
      updated = packages.map(p => p.id === pkg.id ? { ...p, ...pkg } : p);
    } else {
      updated = [...packages, { ...pkg, id: Date.now(), bookedCount: 0, rating: 5.0 }];
    }
    setStored('ts_agent_packages', updated);
    return { success: true };
  },

  deleteAgentPackage: async (pkgId) => {
    const packages = getStored('ts_agent_packages', SEED_AGENT_PACKAGES);
    const updated = packages.filter(p => p.id !== pkgId);
    setStored('ts_agent_packages', updated);
    return { success: true };
  },

  replyInquiry: async (inquiryId, replyText) => {
    const inquiries = getStored('ts_agent_inquiries', []);
    const updated = inquiries.map(i => i.id === inquiryId ? { ...i, status: 'Replied', reply: replyText } : i);
    setStored('ts_agent_inquiries', updated);
    return { success: true };
  },

  // ---------------- HOTEL DASHBOARD ----------------
  getHotelData: async () => {
    const hotelInfo = getStored('ts_hotel_info', SEED_HOTEL_INFO);
    const rooms = getStored('ts_hotel_rooms', SEED_HOTEL_ROOMS);
    const reservations = getStored('ts_hotel_reservations', SEED_HOTEL_RESERVATIONS);
    return { hotelInfo, rooms, reservations };
  },

  saveHotelInfo: async (info) => {
    setStored('ts_hotel_info', info);
    return { success: true };
  },

  saveHotelRoom: async (room) => {
    const rooms = getStored('ts_hotel_rooms', SEED_HOTEL_ROOMS);
    let updated;
    if (room.id) {
      updated = rooms.map(r => r.id === room.id ? { ...r, ...room } : r);
    } else {
      updated = [...rooms, { ...room, id: Date.now() }];
    }
    setStored('ts_hotel_rooms', updated);
    return { success: true };
  },

  deleteHotelRoom: async (roomId) => {
    const rooms = getStored('ts_hotel_rooms', SEED_HOTEL_ROOMS);
    const updated = rooms.filter(r => r.id !== roomId);
    setStored('ts_hotel_rooms', updated);
    return { success: true };
  },

  updateReservationStatus: async (reservationId, status) => {
    const reservations = getStored('ts_hotel_reservations', SEED_HOTEL_RESERVATIONS);
    const updated = reservations.map(r => r.id === reservationId ? { ...r, status } : r);
    setStored('ts_hotel_reservations', updated);
    return { success: true };
  },

  // ---------------- TRANSPORT DASHBOARD ----------------
  getTransportData: async () => {
    const services = getStored('ts_transport_services', SEED_TRANSPORT_SERVICES);
    const bookings = getStored('ts_transport_bookings', SEED_TRANSPORT_BOOKINGS);
    return { services, bookings };
  },

  saveTransportService: async (service) => {
    const services = getStored('ts_transport_services', SEED_TRANSPORT_SERVICES);
    let updated;
    if (service.id) {
      updated = services.map(s => s.id === service.id ? { ...s, ...service } : s);
    } else {
      updated = [...services, { ...service, id: Date.now() }];
    }
    setStored('ts_transport_services', updated);
    return { success: true };
  },

  deleteTransportService: async (serviceId) => {
    const services = getStored('ts_transport_services', SEED_TRANSPORT_SERVICES);
    const updated = services.filter(s => s.id !== serviceId);
    setStored('ts_transport_services', updated);
    return { success: true };
  },

  updateTransportBookingStatus: async (bookingId, status) => {
    const bookings = getStored('ts_transport_bookings', SEED_TRANSPORT_BOOKINGS);
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status } : b);
    setStored('ts_transport_bookings', updated);
    return { success: true };
  },

  // ---------------- GUIDE DASHBOARD ----------------
  getGuideData: async () => {
    const profile = getStored('ts_guide_profile', SEED_GUIDE_PROFILE);
    const requests = getStored('ts_guide_requests', SEED_GUIDE_REQUESTS);
    return { profile, requests };
  },

  saveGuideProfile: async (profileData) => {
    setStored('ts_guide_profile', profileData);
    return { success: true };
  },

  updateGuideRequestStatus: async (requestId, status) => {
    const requests = getStored('ts_guide_requests', SEED_GUIDE_REQUESTS);
    const updated = requests.map(r => r.id === requestId ? { ...r, status } : r);
    setStored('ts_guide_requests', updated);
    return { success: true };
  }
};

export default dashboardService;
