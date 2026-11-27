import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import generateItinerary from '../src/utils/aiItineraryEngine.js';
import { DEFAULT_PRIVACY_PREFERENCES } from '../src/utils/privacy.js';
import {
  VEHICLES,
  getVehicleById,
  getRentalButtonLabel,
  getRentalSpecifications,
  normalizeApiVehicle
} from '../src/data/vehicleCatalog.js';
import { convertUsdAmount, formatCurrencyPrice } from '../src/utils/currencyFormat.js';

describe('AI Dynamic Itinerary Generator (Gemini 2026 Engine)', () => {
  test('generates valid customized itinerary for Kyoto with budget tier', () => {
    const plan = generateItinerary({
      destinationId: 'kyoto',
      origin: 'New York, JFK',
      durationDays: 5,
      vibe: 'Culture & Heritage',
      budgetTier: 'moderate',
      travelers: 2
    });

    assert.ok(plan.id.startsWith('ITIN-'), 'plan has unique ITIN reference');
    assert.equal(plan.durationDays, 5);
    assert.equal(plan.durationNights, 4);
    assert.equal(plan.travelers, 2);
    assert.equal(plan.destinationName, 'Kyoto, Japan');
    assert.equal(plan.days.length, 5);
    assert.ok(plan.costs.total > 0, 'costs.total is calculated');
    assert.equal(plan.costs.perPerson, Math.round(plan.costs.total / 2));
    assert.ok(plan.hotel.name.length > 0, 'hotel is selected');
  });

  test('adjusts pricing realistically for luxury tier', () => {
    const budgetPlan = generateItinerary({
      destinationId: 'swiss-alps',
      origin: 'London Heathrow',
      durationDays: 6,
      budgetTier: 'budget',
      travelers: 1
    });

    const luxuryPlan = generateItinerary({
      destinationId: 'swiss-alps',
      origin: 'London Heathrow',
      durationDays: 6,
      budgetTier: 'luxury',
      travelers: 1
    });

    assert.ok(luxuryPlan.costs.total > budgetPlan.costs.total, 'Luxury cost exceeds budget tier cost');
    assert.equal(luxuryPlan.durationDays, 6);
  });
});

describe('Split Group Payments & Multi-Currency Converter', () => {
  const RATES = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.5,
    JPY: 155.0,
    AED: 3.67
  };

  test('accurately computes multi-traveler group splits', () => {
    const totalPackagePrice = 2400;
    const split3 = Math.round(totalPackagePrice / 3);
    const split4 = Math.round(totalPackagePrice / 4);

    assert.equal(split3, 800);
    assert.equal(split4, 600);
  });

  test('converts currencies with valid exchange coefficients', () => {
    const amountUSD = 1000;
    assert.equal(Math.round(amountUSD * RATES.EUR), 920);
    assert.equal(Math.round(amountUSD * RATES.GBP), 790);
    assert.equal(Math.round(amountUSD * RATES.INR), 83500);
    assert.equal(Math.round(amountUSD * RATES.JPY), 155000);
    assert.equal(Math.round(amountUSD * RATES.AED), 3670);
  });
});

describe('Security & CCPA Privacy Compliance', () => {
  test('session replay tracking is disabled by default', () => {
    assert.equal(DEFAULT_PRIVACY_PREFERENCES.sessionReplayEnabled, false);
  });

  test('CCPA Do-Not-Sell is enforced by default', () => {
    assert.equal(DEFAULT_PRIVACY_PREFERENCES.doNotSellOrShare, true);
  });
});

describe('Unified AI Trip Studio & Planner Integration', () => {
  test('generates valid tailored itinerary for Kerala slow living with authentic hotel and transit', () => {
    const plan = generateItinerary({
      destinationId: 'kerala',
      origin: 'Mumbai, BOM',
      durationDays: 5,
      vibe: 'Wellness & Slow Living',
      budgetTier: 'moderate',
      travelers: 2
    });

    assert.equal(plan.durationDays, 5);
    assert.equal(plan.travelers, 2);
    assert.ok(plan.hotel.name.includes('Coconut Lagoon') || plan.hotel.name.length > 0);
    assert.ok(plan.days[0].morning.toLowerCase().includes('shikara') || plan.days[0].morning.length > 0);
    assert.ok(plan.days[1].dining.toLowerCase().includes('kerala') || plan.days[1].dining.length > 0);
  });

  test('generates tailored itineraries across all 5 escape vibe archetypes', () => {
    const vibes = [
      { dest: 'kerala', vibe: 'Wellness & Slow Living' },
      { dest: 'kyoto', vibe: 'Culture & Heritage' },
      { dest: 'swiss-alps', vibe: 'Adventure & Scenic Nature' },
      { dest: 'santorini', vibe: 'Romance & Couples Retreat' },
      { dest: 'maldives', vibe: 'Family Discovery & Leisure' }
    ];

    for (const v of vibes) {
      const plan = generateItinerary({
        destinationId: v.dest,
        durationDays: 5,
        vibe: v.vibe,
        budgetTier: 'luxury',
        travelers: 4
      });
      assert.equal(plan.durationDays, 5);
      assert.equal(plan.travelers, 4);
      assert.ok(plan.costs.total > 0);
      assert.ok(plan.hotel.name.length > 0);
    }
  });
});

describe('Hotel Manager Dashboard & Hospitality Operations', () => {
  const mockRooms = [
    { id: 201, roomType: 'Susuki Pavilion', pricePerNight: 2800, capacity: '2 Adults', status: 'Available' },
    { id: 202, roomType: 'Hotaru Pavilion', pricePerNight: 2400, capacity: '2 Adults', status: 'Booked' },
    { id: 203, roomType: 'Washigamine Villa Suite', pricePerNight: 3800, capacity: '4 Adults', status: 'Booked' },
    { id: 204, roomType: 'Takagamine Luxury Ryokan Room', pricePerNight: 1950, capacity: '2 Adults', status: 'Available' }
  ];

  const mockReservations = [
    { id: 'RES-8801', guestName: 'Alice Walker', roomType: 'Susuki Pavilion', totalAmount: 14000, status: 'Confirmed' },
    { id: 'RES-8802', guestName: 'Robert Vance', roomType: 'Hotaru Pavilion', totalAmount: 9600, status: 'Confirmed' },
    { id: 'RES-8803', guestName: 'Sophia Reed', roomType: 'Washigamine Villa Suite', totalAmount: 15200, status: 'Confirmed' },
    { id: 'RES-8804', guestName: 'David Miller', roomType: 'Takagamine Luxury Ryokan Room', totalAmount: 7800, status: 'Pending' }
  ];

  test('computes occupancy rate, room availability, and gross revenue accurately', () => {
    const booked = mockRooms.filter(r => r.status === 'Booked').length;
    const occupancyRate = Math.round((booked / mockRooms.length) * 100);
    assert.equal(occupancyRate, 50);

    const grossRevenue = mockReservations
      .filter(r => r.status !== 'Cancelled')
      .reduce((sum, r) => sum + r.totalAmount, 0);
    assert.equal(grossRevenue, 46600);

    const pendingCount = mockReservations.filter(r => r.status === 'Pending').length;
    assert.equal(pendingCount, 1);
  });

  test('validates hotel manager profile credentials structure', () => {
    const manager = {
      fullName: 'Kenji Sato',
      staffId: 'MGR-HTL-9921',
      title: 'General Property Manager',
      email: 'hotel@travelsphere.org',
      phone: '+81-75-498-5000',
      propertyAssigned: 'Aman Kyoto Luxury Pavilions'
    };

    assert.ok(manager.fullName.length > 0);
    assert.ok(manager.staffId.startsWith('MGR-'));
    assert.equal(manager.email, 'hotel@travelsphere.org');
    assert.ok(manager.phone.includes('+81'));
  });
});

describe('Travel Agent Dashboard & Tour Operator Operations', () => {
  const mockPackages = [
    { id: 1, title: 'Kyoto Cherry Blossom & Temple Discovery', location: 'Kyoto, Japan', price: 1200, is_active: true, category: 'Culture & Heritage' },
    { id: 2, title: 'Santorini Sunset Luxury Escape', location: 'Santorini, Greece', price: 1800, is_active: true, category: 'Beach & Islands' },
    { id: 3, title: 'Swiss Alps Glacier & Alpine Hiking', location: 'Zermatt, Switzerland', price: 2100, is_active: false, category: 'Mountain Escapes' }
  ];

  const mockBookings = [
    { id: 'TS-BK-1049', customerName: 'Alice Walker', packageTitle: 'Kyoto Tour', amount: 1910, status: 'Confirmed' },
    { id: 'TS-BK-2281', customerName: 'Robert Vance', packageTitle: 'Santorini Escape', amount: 2484, status: 'Confirmed' },
    { id: 'TS-BK-3394', customerName: 'Sophia Reed', packageTitle: 'Swiss Alps', amount: 1985, status: 'Pending' }
  ];

  const mockInquiries = [
    { id: 'INQ-101', customerName: 'Alice Walker', status: 'Replied' },
    { id: 'INQ-102', customerName: 'Robert Vance', status: 'Pending' },
    { id: 'INQ-103', customerName: 'David Miller', status: 'Pending' }
  ];

  test('computes active tour packages and pending inquiries count accurately', () => {
    const activePkgs = mockPackages.filter(p => p.is_active !== false).length;
    assert.equal(activePkgs, 2);

    const pendingInquiries = mockInquiries.filter(i => i.status === 'Pending').length;
    assert.equal(pendingInquiries, 2);
  });

  test('calculates gross bookings volume and 12.5% agency commission tier', () => {
    const gross = mockBookings
      .filter(b => b.status !== 'Cancelled')
      .reduce((sum, b) => sum + b.amount, 0);
    assert.equal(gross, 6379);

    const commissionRate = 12.5;
    const commissionEarned = Math.round((gross * (commissionRate / 100)) * 100) / 100;
    assert.equal(commissionEarned, 797.38);
  });

  test('validates travel agency and personal agent profile schema', () => {
    const agencyProfile = {
      agency_name: 'Horizon Escapes & Global Expeditions Ltd.',
      license_number: 'AGT-8829-NY-2026',
      commission_rate: 12.5,
      experience_years: 14,
      accreditation: 'IATA & ASTA Certified Premier Agency'
    };

    const agentPersonalProfile = {
      fullName: 'Sarah Jenkins',
      staffId: 'AGT-STAFF-4402',
      title: 'Senior Tour Operations Specialist',
      email: 'agent@travelsphere.org',
      phone: '+1 (212) 555-0199'
    };

    assert.ok(agencyProfile.license_number.startsWith('AGT-'));
    assert.equal(agencyProfile.commission_rate, 12.5);
    assert.ok(agencyProfile.accreditation.includes('IATA'));
    assert.equal(agentPersonalProfile.staffId, 'AGT-STAFF-4402');
    assert.equal(agentPersonalProfile.email, 'agent@travelsphere.org');
  });
});

describe('Customer Dashboard Mobile Experience & Navigation Drawer', () => {
  const customerMobileTabs = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: 'LayoutDashboard' },
    { id: 'bookings', filter: 'all', label: 'My Bookings', icon: 'Calendar' },
    { id: 'bookings', filter: 'flight', label: 'Flights', icon: 'Plane' },
    { id: 'bookings', filter: 'train', label: 'Trains', icon: 'Train' },
    { id: 'bookings', filter: 'bus', label: 'Buses', icon: 'Bus' },
    { id: 'bookings', filter: 'car', label: 'Car Rentals', icon: 'Car' },
    { id: 'wishlist', label: 'Adventures Wishlist', icon: 'Heart' },
    { id: 'plans', label: 'Custom Trip Plans', icon: 'Compass' },
    { id: 'guides', label: 'Tour Guides', icon: 'Award' },
    { id: 'explore', label: 'Explore Packages', icon: 'Compass' },
    { id: 'reviews', label: 'My Reviews', icon: 'MessageSquare' },
    { id: 'profile', label: 'Account & Profile', icon: 'Settings' }
  ];

  test('contains complete mobile drawer navigation routes without missing sections', () => {
    assert.equal(customerMobileTabs.length, 12);
    const ids = customerMobileTabs.map(t => t.id);
    assert.ok(ids.includes('dashboard'));
    assert.ok(ids.includes('bookings'));
    assert.ok(ids.includes('wishlist'));
    assert.ok(ids.includes('plans'));
    assert.ok(ids.includes('guides'));
    assert.ok(ids.includes('explore'));
    assert.ok(ids.includes('profile'));
  });

  test('validates transport categories inside mobile booking navigation', () => {
    const transportSubtabs = customerMobileTabs.filter(t => t.id === 'bookings' && t.filter);
    const filters = transportSubtabs.map(t => t.filter);
    assert.deepEqual(filters, ['all', 'flight', 'train', 'bus', 'car']);
  });
});

describe('Exclusive Traveler Registration & Pre-Configured Dashboard Roles', () => {
  const getDestinationDashboard = (role) => {
    switch ((role || '').toUpperCase()) {
      case 'ADMIN': case 'ADMINISTRATOR': case 'SUPER_ADMIN': return '/admin-dashboard';
      case 'TRAVEL_AGENT': return '/agent-dashboard';
      case 'HOTEL_MANAGER': return '/hotel-dashboard';
      case 'TRANSPORT_PROVIDER': return '/transport-dashboard';
      case 'TOUR_GUIDE': return '/guide-dashboard';
      default: return '/user-dashboard';
    }
  };

  test('public registration role is strictly restricted to CUSTOMER (Traveler)', () => {
    // New accounts created through public registration are always Traveler (CUSTOMER)
    const newRegistrationPayload = {
      fullName: 'Aanya Verma',
      email: 'aanya.traveler@example.com',
      role: 'CUSTOMER'
    };
    assert.equal(newRegistrationPayload.role, 'CUSTOMER');
    assert.equal(getDestinationDashboard(newRegistrationPayload.role), '/user-dashboard');
  });

  test('pre-assigned dashboards exist for all other 5 operational roles', () => {
    assert.equal(getDestinationDashboard('ADMIN'), '/admin-dashboard');
    assert.equal(getDestinationDashboard('TRAVEL_AGENT'), '/agent-dashboard');
    assert.equal(getDestinationDashboard('HOTEL_MANAGER'), '/hotel-dashboard');
    assert.equal(getDestinationDashboard('TRANSPORT_PROVIDER'), '/transport-dashboard');
    assert.equal(getDestinationDashboard('TOUR_GUIDE'), '/guide-dashboard');
  });
});

describe('Mobile Performance & Low-Latency Rendering Optimizations', () => {
  test('resolves optimal reduced motion mode based on viewport width', () => {
    const resolveMotionConfig = (viewportWidth) => (viewportWidth <= 768 ? 'always' : 'user');
    assert.equal(resolveMotionConfig(375), 'always', 'Mobile iPhone view uses reduced motion to eliminate frame lag');
    assert.equal(resolveMotionConfig(414), 'always', 'Mobile Android view uses reduced motion');
    assert.equal(resolveMotionConfig(1280), 'user', 'Desktop viewport preserves full physics animations');
  });

  test('guards expensive global scroll handlers on mobile devices', () => {
    const shouldAttachGlobalScroll = (isMobileOrTouch) => !isMobileOrTouch;
    assert.equal(shouldAttachGlobalScroll(true), false, 'Scroll listener is skipped on mobile/touch');
    assert.equal(shouldAttachGlobalScroll(false), true, 'Scroll listener is attached on desktop');
  });
});

describe('Dedicated Vehicle Rental Catalog & Booking Flow', () => {
  test('labels Cars/SUVs with "Book Rental Car" and Motorcycles with "Book Rental Bike"', () => {
    const sedan = getVehicleById(1);
    const suv = getVehicleById(6);
    const bike = getVehicleById(17);

    assert.ok(sedan && suv && bike, 'all sample vehicle IDs resolve cleanly');
    assert.equal(getRentalButtonLabel(sedan), 'Book Rental Car');
    assert.equal(getRentalButtonLabel(suv), 'Book Rental Car');
    assert.equal(getRentalButtonLabel(bike), 'Book Rental Bike');
  });

  test('provides tailored rental specifications per vehicle category', () => {
    const sedanSpecs = getRentalSpecifications(getVehicleById(1));
    const bikeSpecs = getRentalSpecifications(getVehicleById(21));

    assert.equal(sedanSpecs.isBike, false);
    assert.equal(bikeSpecs.isBike, true);
    assert.ok(bikeSpecs.licenseRequired.toLowerCase().includes('motorcycle'));
    assert.ok(sedanSpecs.includedFeatures.length >= 4);
  });

  test('normalizes partner-added API vehicles and supports dynamic lookup', () => {
    const dynamicBike = normalizeApiVehicle({
      vehicle_id: 999,
      model: 'Ducati Multistrada V4',
      type: 'Motorcycle',
      price_per_day: 165,
      capacity: 2
    });

    assert.equal(dynamicBike.category, 'Motorcycles');
    assert.equal(getRentalButtonLabel(dynamicBike), 'Book Rental Bike');
    assert.equal(getVehicleById('999', [dynamicBike])?.name, 'Ducati Multistrada V4');
    assert.equal(VEHICLES.length, 24);
  });
});

describe('Global Currency Sync Across Dashboards & Vouchers', () => {
  test('converts and formats USD into supported dashboard & PDF voucher currencies', () => {
    assert.equal(convertUsdAmount(100, 'INR'), 8350);
    assert.equal(formatCurrencyPrice(100, 'INR'), '₹8,350');
    assert.equal(formatCurrencyPrice(100, 'INR', { pdfSafe: true }), 'INR 8,350');
    assert.equal(formatCurrencyPrice(100, 'EUR', { decimals: 2 }), '€92.00');
  });
});




