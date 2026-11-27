import api from './api';

// Unified service layer for all 5 Provider & Admin + Customer Dashboards
// Synchronized with TravelSphere's official public media catalog (packages, hotels, vehicles, destinations)

// Initial Mock Seed Data for Dashboards
const SEED_USERS = [
  { id: 100, name: 'Admin User', email: 'admin@travelsphere.org', role: 'ADMIN', phone: '+1-555-0100', status: 'ACTIVE', created_at: '2026-05-01' },
  { id: 101, name: 'Customer User', email: 'customer@travelsphere.org', role: 'CUSTOMER', phone: '+1-555-0192', status: 'ACTIVE', created_at: '2026-08-10' },
  { id: 102, name: 'Robert Vance', email: 'robert@example.com', role: 'CUSTOMER', phone: '+1-555-0144', status: 'ACTIVE', created_at: '2026-08-14' },
  { id: 103, name: 'Sophia Reed', email: 'sophia@example.com', role: 'CUSTOMER', phone: '+1-555-0188', status: 'ACTIVE', created_at: '2026-08-20' },
  { id: 104, name: 'Travel Agent', email: 'agent@travelsphere.org', role: 'TRAVEL_AGENT', phone: '+1-555-0101', status: 'ACTIVE', company: 'Horizon Escapes', created_at: '2026-07-12' },
  { id: 105, name: 'David Miller', email: 'david@wanderlust.com', role: 'TRAVEL_AGENT', phone: '+1-555-0104', status: 'PENDING', company: 'Wanderlust Tours', created_at: '2026-09-01' },
  { id: 106, name: 'Hotel Manager', email: 'hotel@travelsphere.org', role: 'HOTEL_MANAGER', phone: '+81-75-498-5000', status: 'ACTIVE', company: 'Aman Kyoto', created_at: '2026-06-15' },
  { id: 107, name: 'Amira Al-Mansoor', email: 'amira@almaharesort.com', role: 'HOTEL_MANAGER', phone: '+971-4-832-9900', status: 'PENDING', company: 'Al Maha Desert Resort & Spa', created_at: '2026-09-04' },
  { id: 108, name: 'Transport Provider', email: 'transport@travelsphere.org', role: 'TRANSPORT_PROVIDER', phone: '+1-555-0102', status: 'ACTIVE', company: 'Apex Luxury Transports', created_at: '2026-05-11' },
  { id: 109, name: 'Carlos Rodriguez', email: 'carlos@speedyfleets.com', role: 'TRANSPORT_PROVIDER', phone: '+1-555-0105', status: 'PENDING', company: 'Speedy Fleet Express', created_at: '2026-09-08' },
  { id: 110, name: 'Tour Guide', email: 'guide@travelsphere.org', role: 'TOUR_GUIDE', phone: '+1-555-0199', status: 'ACTIVE', company: 'Independent Alpine Guide', created_at: '2026-08-01' },
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
  city: 'Kyoto',
  licenseNumber: 'HTL-LIC-7721',
  totalRooms: 48,
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
  { id: 202, roomType: 'Hotaru Pavilion', pricePerNight: 2400, capacity: '2 Adults', status: 'Available', amenities: 'Stream View, Private Garden Terrace, Cedar Mineral Onsen Tub, Floor-to-Ceiling Windows', imageUrl: '/hotel-images/aman-kyoto.jpg' },
  { id: 203, roomType: 'Washigamine Villa Suite', pricePerNight: 3800, capacity: '4 Adults', status: 'Booked', amenities: 'Secluded 2-Bedroom Sanctuary, Secret Garden Panorama, Private Kaiseki Dining Room, Onsen Baths', imageUrl: '/hotel-images/aman-kyoto.jpg' },
  { id: 204, roomType: 'Takagamine Luxury Ryokan Room', pricePerNight: 1950, capacity: '2 Adults', status: 'Available', amenities: 'Traditional Tatami & Shoji Architecture, Living Area, Direct Botanical Forest Path, Mineral Spa Access', imageUrl: '/hotel-images/aman-kyoto.jpg' }
];

const SEED_HOTEL_RESERVATIONS = [
  { id: 'RES-8801', guestName: 'Alice Walker', roomType: 'Susuki Pavilion', checkIn: '2026-10-15', checkOut: '2026-10-20', guests: 2, totalAmount: 14000, status: 'Confirmed', paymentStatus: 'Paid' },
  { id: 'RES-8802', guestName: 'Robert Vance', roomType: 'Hotaru Pavilion', checkIn: '2026-11-01', checkOut: '2026-11-05', guests: 2, totalAmount: 9600, status: 'Confirmed', paymentStatus: 'Paid' },
  { id: 'RES-8803', guestName: 'Sophia Reed', roomType: 'Washigamine Villa Suite', checkIn: '2026-12-24', checkOut: '2026-12-28', guests: 4, totalAmount: 15200, status: 'Confirmed', paymentStatus: 'Paid' },
  { id: 'RES-8804', guestName: 'David Miller', roomType: 'Takagamine Luxury Ryokan Room', checkIn: '2026-11-12', checkOut: '2026-11-16', guests: 2, totalAmount: 7800, status: 'Pending', paymentStatus: 'Deposit Paid' }
];

const SEED_TRANSPORT_SERVICES = [
  { 
    id: 301, 
    serviceType: 'Flight', 
    title: 'Skyways Transatlantic Jet (Flight SK-990)', 
    origin: 'New York (JFK)', 
    destination: 'London Heathrow (LHR)', 
    departureTime: '10:30 PM', 
    arrivalTime: '10:45 AM (+1)', 
    duration: '7h 15m', 
    price: 720, 
    seatsTotal: 220, 
    seatsAvailable: 64, 
    vehicleName: 'Boeing 787-9 Dreamliner Skyways', 
    imageUrl: '/destination-images/maldives.webp',
    status: 'On Schedule' 
  },
  { 
    id: 302, 
    serviceType: 'Train', 
    title: 'Kyoto Shinkansen High-Speed Express (Nozomi 104)', 
    origin: 'Tokyo Central Station', 
    destination: 'Kyoto Station', 
    departureTime: '08:00 AM', 
    arrivalTime: '10:15 AM', 
    duration: '2h 15m', 
    price: 148, 
    seatsTotal: 120, 
    seatsAvailable: 38, 
    vehicleName: 'Shinkansen N700S Bullet Train', 
    imageUrl: '/package-images/4-swiss-alps.webp',
    status: 'On Schedule' 
  },
  { 
    id: 303, 
    serviceType: 'Bus', 
    title: 'Swiss Alpine Glacier Panorama Coach', 
    origin: 'Geneva Airport Central', 
    destination: 'Interlaken Chalets', 
    departureTime: '09:30 AM', 
    arrivalTime: '12:30 PM', 
    duration: '3h 00m', 
    price: 68, 
    seatsTotal: 48, 
    seatsAvailable: 19, 
    vehicleName: 'Scania Irizar i8 Executive Coach', 
    imageUrl: '/destination-images/swiss-alps.webp',
    status: 'On Schedule' 
  },
  { 
    id: 304, 
    serviceType: 'Car', 
    title: 'Mercedes-Benz E-Class Private Chauffeur', 
    origin: 'Zurich Airport Hub', 
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
    id: 305, 
    serviceType: 'SUV', 
    title: 'Range Rover Velar Alpine 4x4 Expedition', 
    origin: 'Geneva City Center', 
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
    id: 306, 
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
  { id: 'TRP-501', passengerName: 'Alice Walker', serviceTitle: 'Skyways Transatlantic Jet (Flight SK-990)', serviceType: 'Flight', travelDate: '2026-10-14', seatNumbers: 'Suite 12A, 12B', totalAmount: 1440, status: 'Confirmed', paymentStatus: 'Paid' },
  { id: 'TRP-502', passengerName: 'Robert Vance', serviceTitle: 'Kyoto Shinkansen High-Speed Express (Nozomi 104)', serviceType: 'Train', travelDate: '2026-10-15', seatNumbers: 'Car 4 Seats 8A/8B', totalAmount: 296, status: 'Confirmed', paymentStatus: 'Paid' },
  { id: 'TRP-503', passengerName: 'Sophia Reed', serviceTitle: 'Swiss Alpine Glacier Panorama Coach', serviceType: 'Bus', travelDate: '2026-11-01', seatNumbers: 'Front View Seats 5 & 6', totalAmount: 136, status: 'Confirmed', paymentStatus: 'Paid' },
  { id: 'TRP-504', passengerName: 'David Miller', serviceTitle: 'Mercedes-Benz E-Class Private Chauffeur', serviceType: 'Car', travelDate: '2026-11-05', seatNumbers: 'VIP Rear Executive Suite', totalAmount: 240, status: 'Confirmed', paymentStatus: 'Paid' },
  { id: 'TRP-505', passengerName: 'Elena Rostova', serviceTitle: 'Range Rover Velar Alpine 4x4 Expedition', serviceType: 'SUV', travelDate: '2026-11-20', seatNumbers: 'Full Cabin (Seats 1-4)', totalAmount: 360, status: 'Pending', paymentStatus: 'Deposit Paid' }
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
  { id: 'G-703', customerName: 'Sophia Reed', phone: '+1-555-0188', tourName: 'Jungfraujoch Top of Europe Guided Trek', location: 'Jungfrau Region, Switzerland', requestDate: '2026-11-05', guests: 2, totalAmount: 680, status: 'Accepted', specialNotes: 'Private glacier exploration and Sphinx observatory visit.' },
  { id: 'G-704', customerName: 'David Miller', phone: '+1-555-0104', tourName: 'Grindelwald First Cliff & Alpine Meadow Trail', location: 'Grindelwald, Switzerland', requestDate: '2026-11-12', guests: 3, totalAmount: 540, status: 'Pending', specialNotes: 'Looking for high alpine suspension bridge crossing.' }
];

const SEED_COMPLAINTS = [
  { id: 'CMP-101', customerName: 'Robert Vance', subject: 'Flight delay notification issue', category: 'Transportation', message: 'Departure time was delayed by 2 hours without SMS alert.', status: 'Open', response: '', createdAt: '2026-09-02' },
  { id: 'CMP-102', customerName: 'Sophia Reed', subject: 'Refund request for extra baggage', category: 'Payments', message: 'Baggage fee was charged twice at check-in counter.', status: 'In Progress', response: 'Admin inspecting carrier invoice.', createdAt: '2026-09-05' },
  { id: 'CMP-103', customerName: 'Alice Walker', subject: 'Hotel room view upgrade question', category: 'Hotel Stay', message: 'Query regarding lake view upgrade option.', status: 'Resolved', response: 'Upgraded guest to Deluxe Ocean Suite free of charge.', createdAt: '2026-08-28' }
];

// Seed Contact Messages
const SEED_CONTACT_MESSAGES = [
  { 
    id: 1, 
    name: 'Sophia Laurent', 
    email: 'sophia.laurent@paris.fr', 
    subject: 'Custom Family Package Inquiry (Swiss Alps)', 
    message: 'Hello TravelSphere team, we are planning a family trip of 6 to Zermatt in December. Can we customize the ski pass inclusion and arrange private airport transfers?', 
    is_read: 0, 
    replied_at: null, 
    reply: '', 
    created_at: '2026-11-18 10:24:00' 
  },
  { 
    id: 2, 
    name: 'David Miller', 
    email: 'david.m@california.edu', 
    subject: 'Student Group Discount Question', 
    message: 'Hi, does the student discount apply for bookings of more than 4 university students for the Kyoto heritage tour?', 
    is_read: 1, 
    replied_at: '2026-11-19 14:10:00', 
    reply: 'Yes David! You can use promo coupon EXPLORE50 or contact our agent portal for group concession rates.', 
    created_at: '2026-11-19 09:15:00' 
  },
  { 
    id: 3, 
    name: 'Mei-Ling Zhou', 
    email: 'meiling.zhou@singapore.sg', 
    subject: 'Vegetarian Meals & Dietary Requirements', 
    message: 'Could you please confirm if all ryokans and day-tours in Japan have certified halal or vegetarian dining alternatives?', 
    is_read: 0, 
    replied_at: null, 
    reply: '', 
    created_at: '2026-11-20 16:45:00' 
  }
];

const SEED_AGENT_INQUIRIES = [
  { id: 'INQ-401', packageTitle: 'Kyoto Culture & Sakura Blossom Tour', customerName: 'Alice Walker', message: 'Are vegetarian Kaiseki dinners available during the Kyoto ryokan stay?', status: 'Pending', date: '2026-10-01' },
  { id: 'INQ-402', packageTitle: 'Swiss Alps Scenic Glacier Express', customerName: 'Robert Vance', message: 'Does the First Class Swiss Rail Pass cover luggage transfers between hotels?', status: 'Replied', reply: 'Yes, full doorstep luggage courier is included in your first-class package ticket.', date: '2026-09-28' }
];

const SEED_ADMIN_PROFILE = {
  name: 'System Administrator',
  email: 'admin@travelsphere.org',
  phone: '+1-555-0100',
  photoUrl: '/destination-images/swiss-alps.webp',
  role: 'SUPER_ADMIN',
  lastLogin: '2026-11-21 18:30 UTC'
};

const SEED_TRANSPORT_COMPANY = {
  companyName: 'Apex Luxury Transports & Logistics',
  licenseNumber: 'TRP-LIC-9842',
  fleetSize: '24 Vehicles & Aircraft',
  vehicleTypes: 'Flight, Train, Bus, Car, SUV, Bike',
  regions: 'Switzerland, Japan, Greece, USA',
  contactEmail: 'dispatch@apextransports.com',
  contactPhone: '+1-555-0102',
  address: 'Bahnhofstrasse 45, 8001 Zurich, Switzerland'
};

// LocalStorage Helper functions
const getStored = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    const parsed = JSON.parse(data);
    // Only migrate legacy broken external image assets if needed; never wipe user-created or user-deleted records
    if (key === 'ts_hotel_rooms' && Array.isArray(parsed) && parsed.some(r => r.roomType?.includes('Canaves') || r.roomType?.includes('Al Maha'))) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    if (key === 'ts_hotel_reservations' && Array.isArray(parsed) && parsed.some(r => r.roomType?.includes('Canaves') || r.roomType?.includes('Al Maha'))) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    if (key === 'ts_admin_destinations' && Array.isArray(parsed) && parsed.some(d => !d.image_url || d.image_url.includes('unsplash') || d.image_url.includes('images.unsplash'))) {
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

const getRegisteredUsers = () => {
  try {
    const data = JSON.parse(localStorage.getItem('travelsphere_db_users') || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const mergeAdminUsers = (storedUsers, backendUsers = []) => {
  const merged = new Map();

  for (const user of storedUsers) {
    if (user?.email) {
      merged.set(String(user.email).trim().toLowerCase(), {
        ...user,
        status: user.status || (user.is_active === false ? 'INACTIVE' : 'ACTIVE')
      });
    }
  }

  for (const user of getRegisteredUsers()) {
    if (!user?.email) continue;
    const email = String(user.email).trim().toLowerCase();
    merged.set(email, {
      id: user.id,
      name: user.name || user.fullName || '',
      email,
      phone: user.phone || '',
      country: user.country || '',
      role: String(user.role || 'CUSTOMER').toUpperCase(),
      status: user.status || (user.is_active === false ? 'INACTIVE' : 'ACTIVE'),
      created_at: user.created_at || ''
    });
  }

  for (const user of backendUsers) {
    if (!user?.email) continue;
    const email = String(user.email).trim().toLowerCase();
    const existing = merged.get(email) || {};
    merged.set(email, {
      ...existing,
      id: user.id || user.user_id || existing.id,
      name: user.name || existing.name || '',
      email,
      phone: user.phone || existing.phone || '',
      country: user.country || existing.country || '',
      role: String(user.role || existing.role || 'CUSTOMER').toUpperCase(),
      status: user.is_active === 0 || user.is_active === false
        ? 'INACTIVE'
        : (user.status || existing.status || 'ACTIVE'),
      created_at: user.created_at || existing.created_at || ''
    });
  }

  return [...merged.values()];
};

// API Service Interface for Dashboards
export const dashboardService = {
  // ---------------- ADMIN DASHBOARD ----------------
  getAdminDataSync: () => {
    const users = mergeAdminUsers(getStored('ts_admin_users', SEED_USERS));
    const packages = getStored('ts_agent_packages', SEED_AGENT_PACKAGES);
    const complaints = getStored('ts_admin_complaints', SEED_COMPLAINTS);
    const hotelReservations = getStored('ts_hotel_reservations', SEED_HOTEL_RESERVATIONS);
    const transportBookings = getStored('ts_transport_bookings', SEED_TRANSPORT_BOOKINGS);
    const bookings = [
      ...hotelReservations.map((reservation) => ({
        id: reservation.id,
        customerName: reservation.guestName,
        serviceTitle: reservation.roomType,
        schedule: `${reservation.checkIn} to ${reservation.checkOut}`,
        amount: reservation.totalAmount,
        status: reservation.status,
        paymentStatus: reservation.paymentStatus,
      })),
      ...transportBookings.map((booking) => ({
        id: booking.id,
        customerName: booking.passengerName,
        serviceTitle: booking.serviceTitle,
        schedule: booking.travelDate,
        amount: booking.totalAmount,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      })),
    ];

    const totalRevenue = hotelReservations.reduce((sum, r) => sum + r.totalAmount, 0) + 
                         transportBookings.reduce((sum, t) => sum + t.totalAmount, 0) + 
                         packages.reduce((sum, p) => sum + (p.price * p.bookedCount), 0);

    const destinations = getStored('ts_admin_destinations', [
      { id: 1, name: 'Kyoto', country: 'Japan', description: 'Ancient temples, bamboo groves, and traditional tea ceremonies.', best_time_to_visit: 'March - May (Sakura)', image_url: '/destination-images/kyoto.webp', price: 1250, is_active: true },
      { id: 2, name: 'Santorini', country: 'Greece', description: 'Whitewashed cliffside villas, blue domes, and caldera sunsets.', best_time_to_visit: 'May - October', image_url: '/destination-images/santorini.webp', price: 1450, is_active: true },
      { id: 3, name: 'Swiss Alps', country: 'Switzerland', description: 'Majestic glacier peaks, alpine lakes, and world-class ski trails.', best_time_to_visit: 'June - September / Dec - March', image_url: '/destination-images/swiss-alps.webp', price: 1680, is_active: true },
      { id: 4, name: 'Maldives', country: 'Maldives', description: 'Private overwater bungalows, coral reefs, and sunset cruises.', best_time_to_visit: 'November - April', image_url: '/destination-images/maldives.webp', price: 1850, is_active: true }
    ]);

    const coupons = getStored('ts_admin_coupons', [
      { id: 1, code: 'TRAVEL20', discount_type: 'percentage', discount_value: 20, min_amount: 100, max_uses: 500, used_count: 14, expires_at: '2027-12-31', is_active: true },
      { id: 2, code: 'EXPLORE50', discount_type: 'fixed', discount_value: 50, min_amount: 200, max_uses: 200, used_count: 8, expires_at: '2027-12-31', is_active: true }
    ]);

    const faqs = getStored('ts_admin_faqs', [
      { id: 1, question: 'What payment methods does TravelSphere accept?', answer: 'We accept Credit/Debit Cards, UPI, Net Banking with major institutions, and Digital Wallets (Apple Pay, Google Pay).', category: 'Payments', sort_order: 1, is_active: true },
      { id: 2, question: 'How do I obtain my official travel booking voucher?', answer: 'Immediately after confirming your booking or checkout, you can download a verified PDF voucher complete with official QR manifest.', category: 'Bookings', sort_order: 2, is_active: true },
      { id: 3, question: 'Can I cancel or reschedule my reservation?', answer: 'Yes, cancellations and date rescheduling can be requested via your User Dashboard under the Trips section.', category: 'Cancellations', sort_order: 3, is_active: true }
    ]);

    const reviews = getStored('ts_admin_reviews', [
      { id: 1, userName: 'Alice Walker', rating: 5, comment: 'Exceptional journey to Kyoto! The ryokan and certified guide Kenji were extraordinary.', created_at: '2026-10-18' },
      { id: 2, userName: 'Robert Vance', rating: 5, comment: 'First class Swiss Glacier Express was breathtaking from start to finish.', created_at: '2026-10-22' },
      { id: 3, userName: 'Sophia Reed', rating: 4, comment: 'Santorini villa views were unreal. Highly recommend the sunset catamaran excursion.', created_at: '2026-11-02' }
    ]);

    const contactMessages = getStored('ts_admin_contacts', SEED_CONTACT_MESSAGES);

    return {
      users,
      packages,
      complaints,
      contactMessages,
      bookings,
      destinations,
      coupons,
      faqs,
      reviews,
      stats: {
        totalRevenue,
        totalUsers: users.length,
        activePackages: packages.length,
        openComplaints: complaints.filter(c => c.status !== 'Resolved').length,
        unreadContacts: contactMessages.filter(c => !c.is_read).length
      }
    };
  },

  getAdminData: async () => {
    const syncData = dashboardService.getAdminDataSync();
    try {
      const response = await api.get('/users', { timeout: 3000 });
      if (response.data?.success && Array.isArray(response.data.users)) {
        const users = mergeAdminUsers(getStored('ts_admin_users', SEED_USERS), response.data.users);
        return {
          ...syncData,
          users,
          stats: {
            ...syncData.stats,
            totalUsers: users.length
          }
        };
      }
    } catch {
      // The local and seed data remain available when the backend is offline.
    }
    return syncData;
  },

  updateUserStatus: async (userId, newStatus) => {
    const users = getStored('ts_admin_users', SEED_USERS);
    const updated = users.map(u => u.id === userId ? { ...u, status: newStatus, is_active: newStatus === 'ACTIVE' } : u);
    setStored('ts_admin_users', updated);
    try {
      await api.put(`/users/${userId}/status`, { status: newStatus }, { timeout: 3000 });
    } catch {
      // Status remains available locally and will retry on the next dashboard load.
    }
    return { success: true };
  },

  // Contact Messages Handlers
  replyContactMessage: async (contactId, replyText) => {
    const messages = getStored('ts_admin_contacts', SEED_CONTACT_MESSAGES);
    const updated = messages.map(m => m.id === contactId ? {
      ...m,
      is_read: 1,
      replied_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      reply: replyText
    } : m);
    setStored('ts_admin_contacts', updated);
    api.post(`/contact/messages/${contactId}/reply`, { reply: replyText }).catch(() => {});
    return { success: true };
  },

  deleteContactMessage: async (contactId) => {
    const messages = getStored('ts_admin_contacts', SEED_CONTACT_MESSAGES);
    const updated = messages.filter(m => m.id !== contactId);
    setStored('ts_admin_contacts', updated);
    api.delete(`/contact/messages/${contactId}`).catch(() => {});
    return { success: true };
  },

  // FAQ Toggle Active Status
  toggleFaqActive: async (faqId) => {
    const faqs = getStored('ts_admin_faqs', []);
    const updated = faqs.map(f => f.id === faqId ? { ...f, is_active: f.is_active === false ? true : false } : f);
    setStored('ts_admin_faqs', updated);
    return { success: true };
  },

  // Automated Payment Reminder (PDF Ch. 1.5 Future Scope)
  sendPaymentReminder: async (bookingId, customerName, amount) => {
    const notifications = getStored('ts_notifications', []);
    const reminder = {
      id: Date.now(),
      title: `💳 Payment Reminder: Booking #${bookingId}`,
      message: `Dear ${customerName || 'Traveler'}, your booking #${bookingId} for $${amount} is confirmed. Please complete the remaining payment balance before departure date.`,
      is_read: 0,
      created_at: new Date().toISOString()
    };
    setStored('ts_notifications', [reminder, ...notifications]);
    return { success: true, message: `Payment reminder alert dispatched to ${customerName}!` };
  },

  approveProvider: async (userId, role = 'agent') => {
    const users = getStored('ts_admin_users', SEED_USERS);
    const updated = users.map(u => u.id === userId ? { ...u, status: 'ACTIVE' } : u);
    setStored('ts_admin_users', updated);
    try {
      await api.put(`/admin/providers/${role.toLowerCase()}/${userId}/approve`, { action: 'APPROVE' });
    } catch { /* ignore */ }
    return { success: true };
  },

  rejectProvider: async (userId, role = 'agent') => {
    const users = getStored('ts_admin_users', SEED_USERS);
    const updated = users.map(u => u.id === userId ? { ...u, status: 'REJECTED' } : u);
    setStored('ts_admin_users', updated);
    try {
      await api.put(`/admin/providers/${role.toLowerCase()}/${userId}/reject`, { action: 'REJECT' });
    } catch { /* ignore */ }
    return { success: true };
  },

  // Destination Management (Task 6)
  saveDestination: async (dest) => {
    const destinations = getStored('ts_admin_destinations', []);
    let updated;
    if (dest.id) {
      updated = destinations.map(d => d.id === dest.id ? { ...d, ...dest } : d);
      api.put(`/destinations/${dest.id}`, dest).catch(() => {});
    } else {
      const newDest = { ...dest, id: Date.now() };
      updated = [...destinations, newDest];
      api.post('/destinations', dest).catch(() => {});
    }
    setStored('ts_admin_destinations', updated);
    return { success: true };
  },

  deleteDestination: async (destId) => {
    const destinations = getStored('ts_admin_destinations', []);
    const updated = destinations.filter(d => d.id !== destId);
    setStored('ts_admin_destinations', updated);
    api.delete(`/destinations/${destId}`).catch(() => {});
    return { success: true };
  },

  // Coupon Management (Task 6)
  saveCoupon: async (coupon) => {
    const coupons = getStored('ts_admin_coupons', []);
    const newCoupon = { ...coupon, id: Date.now(), used_count: 0, is_active: true };
    setStored('ts_admin_coupons', [...coupons, newCoupon]);
    api.post('/coupons', coupon).catch(() => {});
    return { success: true };
  },

  deleteCoupon: async (couponId) => {
    const coupons = getStored('ts_admin_coupons', []);
    const updated = coupons.filter(c => c.id !== couponId);
    setStored('ts_admin_coupons', updated);
    api.delete(`/coupons/${couponId}`).catch(() => {});
    return { success: true };
  },

  // FAQ Management (Task 6)
  saveFaq: async (faq) => {
    const faqs = getStored('ts_admin_faqs', []);
    let updated;
    if (faq.id) {
      updated = faqs.map(f => f.id === faq.id ? { ...f, ...faq } : f);
    } else {
      updated = [...faqs, { ...faq, id: Date.now() }];
      api.post('/faqs', faq).catch(() => {});
    }
    setStored('ts_admin_faqs', updated);
    return { success: true };
  },

  deleteFaq: async (faqId) => {
    const faqs = getStored('ts_admin_faqs', []);
    const updated = faqs.filter(f => f.id !== faqId);
    setStored('ts_admin_faqs', updated);
    api.delete(`/faqs/${faqId}`).catch(() => {});
    return { success: true };
  },

  // Review Management (Task 6)
  deleteReview: async (reviewId) => {
    const reviews = getStored('ts_admin_reviews', []);
    const updated = reviews.filter(r => r.id !== reviewId);
    setStored('ts_admin_reviews', updated);
    api.delete(`/reviews/${reviewId}`).catch(() => {});
    return { success: true };
  },

  updatePackagePrice: async (pkgId, newPrice) => {
    const packages = getStored('ts_agent_packages', SEED_AGENT_PACKAGES);
    const updated = packages.map(p => p.id === pkgId ? { ...p, price: parseFloat(newPrice) } : p);
    setStored('ts_agent_packages', updated);
    api.put(`/packages/${pkgId}`, { price: parseFloat(newPrice) }).catch(() => {});
    return { success: true };
  },

  resolveComplaint: async (complaintId, responseText) => {
    const complaints = getStored('ts_admin_complaints', SEED_COMPLAINTS);
    const updated = complaints.map(c => c.id === complaintId ? { ...c, status: 'Resolved', response: responseText || 'Resolved by Administrator' } : c);
    setStored('ts_admin_complaints', updated);
    return { success: true };
  },

// ---------------- AGENT DASHBOARD ----------------
  getAgentDataSync: () => {
    const packages = getStored('ts_agent_packages', SEED_AGENT_PACKAGES);
    const inquiries = getStored('ts_agent_inquiries', SEED_AGENT_INQUIRIES);

    // Live customer bookings for travel agent (Task 5)
    const tripRequests = getStored('ts_trip_requests', []);
    const liveAgentBookings = tripRequests.filter(t => !t.booking_type || t.booking_type === 'package');
    const defaultBookings = [
      { id: 'BK-9901', customerName: 'Alice Walker', packageTitle: 'Kyoto Culture & Sakura Blossom Tour', schedule: '2026-10-15 to 2026-10-22', guests: 2, amount: 1910, status: 'Confirmed' },
      { id: 'BK-9902', customerName: 'Robert Vance', packageTitle: 'Swiss Alps Scenic Glacier Express', schedule: '2026-10-22 to 2026-10-30', guests: 2, amount: 3970, status: 'Confirmed' },
      { id: 'BK-9903', customerName: 'Sophia Reed', packageTitle: 'Santorini Villa & Yacht Week', schedule: '2026-11-01 to 2026-11-07', guests: 2, amount: 2484, status: 'Confirmed' },
      { id: 'BK-9904', customerName: 'David Miller', packageTitle: 'Maldives Overwater Luxury Escape', schedule: '2026-11-15 to 2026-11-20', guests: 2, amount: 2090, status: 'Confirmed' }
    ];

    const bookings = [
      ...liveAgentBookings.map(b => ({
        id: b.display_id || `BK-${b.booking_id || b.id}`,
        customerName: b.passengerName || 'Verified Customer',
        packageTitle: b.package_title || b.packageTitle || 'Curated Tour Package',
        schedule: `${b.start_date || '2026-10-15'} to ${b.end_date || '2026-10-22'}`,
        guests: b.guests || 2,
        amount: b.total_amount || b.amount || 1200,
        status: b.status || 'Confirmed'
      })),
      ...defaultBookings
    ];

    const tripPlans = getStored('ts_customer_trip_plans', []);
    return { packages, inquiries, bookings, tripPlans };
  },

  getAgentData: async () => {
    const data = dashboardService.getAgentDataSync();
    // Non-blocking background sync if backend server responds within 600ms
    api.get('/trip-plans', { timeout: 600 }).then(res => {
      if (res.data?.trip_plans && Array.isArray(res.data.trip_plans) && res.data.trip_plans.length > 0) {
        setStored('ts_customer_trip_plans', res.data.trip_plans);
      }
    }).catch(() => {});
    return data;
  },

  updateAgentBookingStatus: async (bookingId, status) => {
    const tripRequests = getStored('ts_trip_requests', []);
    const updated = tripRequests.map(b => (b.display_id === bookingId || `BK-${b.booking_id}` === bookingId) ? { ...b, status } : b);
    setStored('ts_trip_requests', updated);
    const cleanId = String(bookingId).replace(/\D/g, '') || 1;
    api.put(`/agent-bookings/${cleanId}/status`, { action: status }).catch(() => {});
    return { success: true };
  },

  saveAgentPackage: async (pkg) => {
    const packages = getStored('ts_agent_packages', SEED_AGENT_PACKAGES);
    let updated;
    let savedPkg;
    if (pkg.id) {
      updated = packages.map(p => {
        if (String(p.id) === String(pkg.id)) {
          savedPkg = { ...p, ...pkg };
          return savedPkg;
        }
        return p;
      });
      if (!savedPkg) {
        savedPkg = { ...pkg };
        updated = [...packages, savedPkg];
      }
      api.put(`/packages/${pkg.id}`, pkg).catch(() => {});
    } else {
      savedPkg = { ...pkg, id: Date.now(), bookedCount: 0, rating: 5.0 };
      updated = [...packages, savedPkg];
      api.post('/packages', pkg).catch(() => {});
    }
    setStored('ts_agent_packages', updated);
    return { success: true, package: savedPkg };
  },

  deleteAgentPackage: async (pkgId) => {
    const packages = getStored('ts_agent_packages', SEED_AGENT_PACKAGES);
    const updated = packages.filter(p => p.id !== pkgId);
    setStored('ts_agent_packages', updated);
    api.delete(`/packages/${pkgId}`).catch(() => {});
    return { success: true };
  },

  replyInquiry: async (inquiryId, replyText) => {
    const inquiries = getStored('ts_agent_inquiries', SEED_AGENT_INQUIRIES);
    const updated = inquiries.map(i => i.id === inquiryId ? { ...i, status: 'Replied', reply: replyText } : i);
    setStored('ts_agent_inquiries', updated);
    return { success: true };
  },

  // ---------------- HOTEL DASHBOARD (Task 3 & 14) ----------------
  getHotelDataSync: () => {
    const hotelInfo = getStored('ts_hotel_info', SEED_HOTEL_INFO);
    const rooms = getStored('ts_hotel_rooms', SEED_HOTEL_ROOMS);
    
    // Merge live customer hotel reservations with seed data
    const tripRequests = getStored('ts_trip_requests', []);
    const liveHotelBookings = tripRequests.filter(t => t.booking_type === 'hotel');
    const hotelRequests = getStored('ts_hotel_requests', []);
    const seedReservations = getStored('ts_hotel_reservations', SEED_HOTEL_RESERVATIONS);

    const reservations = [
      ...liveHotelBookings.map(b => ({
        id: b.display_id || `RES-${b.booking_id || b.id}`,
        guestName: b.passengerName || 'Verified Guest',
        roomType: b.package_title || 'Deluxe Pavilion Suite',
        checkIn: b.start_date || '2026-10-15',
        checkOut: b.end_date || '2026-10-20',
        guests: b.guests || 2,
        totalAmount: b.total_amount || b.amount || 2800,
        status: b.status || 'Confirmed',
        paymentStatus: 'Paid'
      })),
      ...hotelRequests.map(r => ({
        id: r.id || `RES-${Date.now()}`,
        guestName: r.guestName || 'Guest',
        roomType: r.hotel || 'Reserved Room',
        checkIn: r.checkIn || '2026-10-06',
        checkOut: r.checkOut || '2026-10-07',
        guests: Number(r.guests) || 2,
        totalAmount: 1200,
        status: r.status || 'Pending',
        paymentStatus: 'Pending'
      })),
      ...seedReservations
    ];

    return { hotelInfo, rooms, reservations };
  },

  getHotelData: async () => {
    return dashboardService.getHotelDataSync();
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
      api.post('/hotels', { name: room.roomType, pricePerNight: room.pricePerNight, imageUrl: room.imageUrl }).catch(() => {});
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
    const cleanId = String(reservationId).replace(/\D/g, '') || 1;
    api.put(`/hotel-bookings/${cleanId}/status`, { action: status }).catch(() => {});
    return { success: true };
  },

  // ---------------- TRANSPORT DASHBOARD (Task 4 & 14) ----------------
  getTransportDataSync: () => {
    const services = getStored('ts_transport_services', SEED_TRANSPORT_SERVICES);
    const tripRequests = getStored('ts_trip_requests', []);
    const liveTransportBookings = tripRequests.filter(t => ['car', 'vehicle', 'flight', 'bus', 'train'].includes(t.booking_type));
    const seedBookings = getStored('ts_transport_bookings', SEED_TRANSPORT_BOOKINGS);

    const bookings = [
      ...liveTransportBookings.map(b => ({
        id: b.display_id || `TRP-${b.booking_id || b.id}`,
        passengerName: b.passengerName || 'Verified Passenger',
        serviceTitle: b.package_title || 'Executive Fleet Chauffeur',
        serviceType: b.booking_type === 'car' ? 'Car' : (b.booking_type === 'bus' ? 'Bus' : (b.booking_type === 'train' ? 'Train' : 'Flight')),
        travelDate: b.start_date || '2026-10-15',
        seatNumbers: 'VIP Seat 1-2',
        totalAmount: b.total_amount || b.amount || 240,
        status: b.status || 'Confirmed',
        paymentStatus: 'Paid'
      })),
      ...seedBookings
    ];

    return { services, bookings };
  },

  getTransportData: async () => {
    return dashboardService.getTransportDataSync();
  },

  saveTransportService: async (service) => {
    const services = getStored('ts_transport_services', SEED_TRANSPORT_SERVICES);
    let updated;
    if (service.id) {
      updated = services.map(s => s.id === service.id ? { ...s, ...service } : s);
    } else {
      updated = [...services, { ...service, id: Date.now() }];
      api.post('/vehicles', { type: service.serviceType, model: service.title, pricePerDay: service.price, imageUrl: service.imageUrl }).catch(() => {});
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
    const cleanId = String(bookingId).replace(/\D/g, '') || 1;
    api.put(`/transport-bookings/${cleanId}/status`, { action: status }).catch(() => {});
    return { success: true };
  },

  // ---------------- GUIDE DASHBOARD (Task 10) ----------------
  getGuideDataSync: () => {
    const profile = getStored('ts_guide_profile', SEED_GUIDE_PROFILE);
    const seedRequests = getStored('ts_guide_requests', SEED_GUIDE_REQUESTS);
    
    // Connect to real customer bookings in ts_trip_requests (Task 10)
    const tripRequests = getStored('ts_trip_requests', []);
    const guideBookings = tripRequests.filter(t => t.booking_type === 'guide' || t.guideId || t.guide_id);

    const mergedLiveRequests = guideBookings.map(b => ({
      id: b.display_id || `G-${b.booking_id || b.id}`,
      customerName: b.passengerName || 'Verified Traveler',
      phone: b.phone || '+1-555-0192',
      tourName: b.package_title || 'Private Alpine Heritage Excursion',
      location: b.destination_name || 'Interlaken, Switzerland',
      requestDate: b.start_date || b.travel_date || '2026-10-25',
      guests: b.guests || 2,
      totalAmount: b.total_amount || b.amount || 650,
      status: b.status === 'confirmed' || b.status === 'Confirmed' ? 'Accepted' : (b.status === 'cancelled' || b.status === 'Cancelled' ? 'Rejected' : 'Pending'),
      specialNotes: b.notes || 'Official customer guided tour booking request.'
    }));

    const requests = [...mergedLiveRequests, ...seedRequests];
    return { profile, requests };
  },

  getGuideData: async () => {
    return dashboardService.getGuideDataSync();
  },

  saveGuideProfile: async (profileData) => {
    setStored('ts_guide_profile', profileData);
    return { success: true };
  },

  updateGuideRequestStatus: async (requestId, status) => {
    const requests = getStored('ts_guide_requests', SEED_GUIDE_REQUESTS);
    const updated = requests.map(r => r.id === requestId ? { ...r, status } : r);
    setStored('ts_guide_requests', updated);

    // Also update any matching booking in ts_trip_requests
    const tripRequests = getStored('ts_trip_requests', []);
    const mappedBookingStatus = status === 'Accepted' || status === 'Completed' ? 'Confirmed' : (status === 'Rejected' ? 'Cancelled' : status);
    const updatedTrips = tripRequests.map(t => (t.display_id === requestId || `G-${t.booking_id}` === requestId || `G-${t.id}` === requestId) ? { ...t, status: mappedBookingStatus } : t);
    setStored('ts_trip_requests', updatedTrips);

    const cleanId = String(requestId).replace(/\D/g, '') || 1;
    api.put(`/agent-bookings/${cleanId}/status`, { action: mappedBookingStatus }).catch(() => {});
    return { success: true };
  },

  getAdminProfile: async () => {
    return getStored('ts_admin_profile', SEED_ADMIN_PROFILE);
  },

  saveAdminProfile: async (profile) => {
    setStored('ts_admin_profile', profile);
    return { success: true };
  },

  toggleDestinationActive: async (destId) => {
    const destinations = getStored('ts_admin_destinations', [
      { id: 1, name: 'Kyoto', country: 'Japan', description: 'Ancient temples, bamboo groves, and traditional tea ceremonies.', best_time_to_visit: 'March - May (Sakura)', image_url: '/destination-images/kyoto.webp', price: 1250, is_active: true },
      { id: 2, name: 'Santorini', country: 'Greece', description: 'Whitewashed cliffside villas, blue domes, and caldera sunsets.', best_time_to_visit: 'May - October', image_url: '/destination-images/santorini.webp', price: 1450, is_active: true },
      { id: 3, name: 'Swiss Alps', country: 'Switzerland', description: 'Majestic glacier peaks, alpine lakes, and world-class ski trails.', best_time_to_visit: 'June - September / Dec - March', image_url: '/destination-images/swiss-alps.webp', price: 1680, is_active: true },
      { id: 4, name: 'Maldives', country: 'Maldives', description: 'Private overwater bungalows, coral reefs, and sunset cruises.', best_time_to_visit: 'November - April', image_url: '/destination-images/maldives.webp', price: 1850, is_active: true }
    ]);
    const updated = destinations.map(d => d.id === destId ? { ...d, is_active: d.is_active === false } : d);
    setStored('ts_admin_destinations', updated);
    return { success: true };
  },

  togglePackageActive: async (pkgId) => {
    const packages = getStored('ts_agent_packages', SEED_AGENT_PACKAGES);
    const updated = packages.map(p => p.id === pkgId ? { ...p, is_active: p.is_active === false, availability: p.is_active === false ? 'Available' : 'Unavailable' } : p);
    setStored('ts_agent_packages', updated);
    return { success: true };
  },

  getTransportCompany: async () => {
    return getStored('ts_transport_company_profile', SEED_TRANSPORT_COMPANY);
  },

  saveTransportCompany: async (company) => {
    setStored('ts_transport_company_profile', company);
    return { success: true };
  },

  updateTransportSchedule: async (serviceId, scheduleUpdate) => {
    const services = getStored('ts_transport_services', SEED_TRANSPORT_SERVICES);
    const updated = services.map(s => s.id === serviceId ? { ...s, ...scheduleUpdate } : s);
    setStored('ts_transport_services', updated);
    return { success: true };
  }
};

export default dashboardService;
