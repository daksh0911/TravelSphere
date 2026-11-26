/**
 * Canonical Vehicle Fleet Catalog & Rental Specification Helpers
 * Shared across Vehicles Fleet Explorer and dedicated Vehicle Booking Page.
 */

export const VEHICLES = [
  {
    id: 1,
    name: 'Mercedes-Benz E-Class',
    category: 'Cars & Sedans',
    type: 'Executive Sedan',
    price: 120,
    seats: 4,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/mercedes-e-class.webp',
    pickup: 'Airport & City Delivery',
    tag: 'Executive Luxury',
    family: false,
    childSeats: 0,
    safety: 'Active Brake Assist, 360· Sensor Suite'
  },
  {
    id: 2,
    name: 'Toyota Corolla',
    category: 'Cars & Sedans',
    type: 'Compact Sedan',
    price: 45,
    seats: 4,
    luggage: 2,
    gear: 'Automatic',
    image: '/vehicle-images/toyota-corolla.webp',
    pickup: 'City Center Hub',
    tag: 'City Commuter',
    family: true,
    childSeats: 1,
    safety: 'Toyota Safety Sense 2.0 with ISOFIX'
  },
  {
    id: 3,
    name: 'Honda Civic',
    category: 'Cars & Sedans',
    type: 'Sport Sedan',
    price: 50,
    seats: 4,
    luggage: 2,
    gear: 'Automatic',
    image: '/vehicle-images/honda-civic.webp',
    pickup: 'City Center Hub',
    tag: 'Urban Cruiser',
    family: true,
    childSeats: 1,
    safety: 'Honda Sensing with Lane-Keeping Assist'
  },
  {
    id: 4,
    name: 'Honda Accord',
    category: 'Cars & Sedans',
    type: 'Full-Size Sedan',
    price: 68,
    seats: 5,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/honda-accord.webp',
    pickup: 'Airport & City Delivery',
    tag: 'Family Comfort',
    family: true,
    childSeats: 2,
    safety: 'Adaptive Cruise Control, Dual ISOFIX'
  },
  {
    id: 5,
    name: 'Toyota Camry',
    category: 'Cars & Sedans',
    type: 'Mid-Size Sedan',
    price: 72,
    seats: 5,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/toyota-camry.webp',
    pickup: 'Airport & City Delivery',
    tag: 'Highway Touring',
    family: true,
    childSeats: 2,
    safety: 'Pre-collision warning & Blind-spot monitor'
  },
  {
    id: 25,
    name: 'BMW 5 Series 530i',
    category: 'Cars & Sedans',
    type: 'Executive Sedan',
    price: 145,
    seats: 4,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/bmw-5-series.webp',
    pickup: 'Airport & City Delivery',
    tag: 'Executive Touring',
    family: false,
    childSeats: 0,
    safety: 'Driving Assistant Professional, Active Protection'
  },
  {
    id: 26,
    name: 'Ford Mustang GT',
    category: 'Cars & Sedans',
    type: 'Sports Coupe',
    price: 160,
    seats: 4,
    luggage: 2,
    gear: 'Automatic',
    image: '/vehicle-images/ford-mustang-gt.webp',
    pickup: 'City Center & Airport Hub',
    tag: 'American Grand Tourer',
    family: false,
    childSeats: 0,
    safety: 'Ford Co-Pilot360, AdvanceTrac stability control'
  },
  {
    id: 27,
    name: 'Audi A6',
    category: 'Cars & Sedans',
    type: 'Luxury Sedan',
    price: 138,
    seats: 4,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/audi-a6.webp',
    pickup: 'Airport & City Delivery',
    tag: 'Quattro Executive',
    family: false,
    childSeats: 0,
    safety: 'Audi pre sense, Adaptive Cruise Assist'
  },
  {
    id: 28,
    name: 'Lexus ES 350',
    category: 'Cars & Sedans',
    type: 'Premium Sedan',
    price: 125,
    seats: 4,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/lexus-es-350.webp',
    pickup: 'Airport & City Delivery',
    tag: 'Quiet Luxury',
    family: false,
    childSeats: 0,
    safety: 'Lexus Safety System+, Blind Spot Monitor'
  },
  {
    id: 6,
    name: 'Range Rover Velar',
    category: 'SUVs & 4x4',
    type: 'Luxury 4x4 SUV',
    price: 185,
    seats: 5,
    luggage: 4,
    gear: 'Automatic',
    image: '/vehicle-images/range-rover-velar.webp',
    pickup: 'VIP Chauffeur & Airport Delivery',
    tag: 'All-Terrain Luxury',
    family: false,
    childSeats: 2,
    safety: 'Terrain Response 2, 3D Surround Camera'
  },
  {
    id: 7,
    name: 'Toyota RAV4',
    category: 'SUVs & 4x4',
    type: 'Compact AWD SUV',
    price: 85,
    seats: 5,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/toyota-rav4.webp',
    pickup: 'City Center & Airport Hub',
    tag: 'Scenic Explorer',
    family: true,
    childSeats: 2,
    safety: 'Rear ISOFIX anchors, Road Sign Assist'
  },
  {
    id: 8,
    name: 'Honda CR-V',
    category: 'SUVs & 4x4',
    type: 'Mid-Size SUV',
    price: 80,
    seats: 5,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/honda-crv.webp',
    pickup: 'Airport & City Delivery',
    tag: 'Spacious Cabin',
    family: true,
    childSeats: 2,
    safety: 'Collision Mitigation Braking, Blind Spot Monitor'
  },
  {
    id: 9,
    name: 'Mazda CX-5',
    category: 'SUVs & 4x4',
    type: 'Crossover SUV',
    price: 78,
    seats: 5,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/mazda-cx5.webp',
    pickup: 'City Center Hub',
    tag: 'Agile Handler',
    family: true,
    childSeats: 2,
    safety: 'i-Activesense smart brake support'
  },
  {
    id: 10,
    name: 'Kia Sportage',
    category: 'SUVs & 4x4',
    type: 'Compact Crossover',
    price: 75,
    seats: 5,
    luggage: 3,
    gear: 'Automatic',
    image: '/vehicle-images/kia-sportage.webp',
    pickup: 'City Center Hub',
    tag: 'Modern Tourer',
    family: true,
    childSeats: 2,
    safety: 'Lane-keep assist & Safe exit warning'
  },
  {
    id: 11,
    name: 'Ford Explorer',
    category: 'SUVs & 4x4',
    type: '7-Passenger 3-Row SUV',
    price: 110,
    seats: 7,
    luggage: 4,
    gear: 'Automatic',
    image: '/vehicle-images/ford-explorer.webp',
    pickup: 'Airport & City Delivery',
    tag: 'Big Family Ready',
    family: true,
    childSeats: 3,
    safety: 'Three-row curtain airbags, Co-Pilot360'
  },
  {
    id: 12,
    name: 'Toyota Highlander',
    category: 'SUVs & 4x4',
    type: '7-Passenger 3-Row SUV',
    price: 125,
    seats: 7,
    luggage: 5,
    gear: 'Automatic',
    image: '/vehicle-images/toyota-highlander.webp',
    pickup: 'Airport & City Delivery',
    tag: 'Cross-Country SUV',
    family: true,
    childSeats: 3,
    safety: 'Toyota Safety Sense 2.5+, 8 airbags'
  },
  {
    id: 17,
    name: 'BMW R 1250 GS',
    category: 'Motorcycles',
    type: 'Adventure Touring',
    price: 92,
    seats: 2,
    luggage: 2,
    gear: 'Manual',
    image: '/vehicle-images/bmw-r1250gs.webp',
    pickup: 'Alpine Base Station',
    tag: 'Alpine Master',
    family: false,
    childSeats: 0,
    safety: 'Dynamic Traction Control, Hill Start Pro'
  },
  {
    id: 18,
    name: 'Yamaha Ténéré 700',
    category: 'Motorcycles',
    type: 'Dual-Sport Adventure',
    price: 78,
    seats: 2,
    luggage: 2,
    gear: 'Manual',
    image: '/vehicle-images/yamaha-tenere-700.webp',
    pickup: 'Adventure Trail Depot',
    tag: 'Trail Conqueror',
    family: false,
    childSeats: 0,
    safety: 'Switchable 3-mode off-road ABS'
  },
  {
    id: 19,
    name: 'Honda CB500X',
    category: 'Motorcycles',
    type: 'Lightweight Touring',
    price: 64,
    seats: 2,
    luggage: 2,
    gear: 'Manual',
    image: '/vehicle-images/honda-cb500x.webp',
    pickup: 'City & Coastal Depot',
    tag: 'Coastal Cruiser',
    family: false,
    childSeats: 0,
    safety: 'Dual-channel ABS, Slipper clutch'
  },
  {
    id: 20,
    name: 'Yamaha FZ',
    category: 'Motorcycles',
    type: 'Street Naked',
    price: 42,
    seats: 2,
    luggage: 1,
    gear: 'Manual',
    image: '/vehicle-images/yamaha-fz.webp',
    pickup: 'Urban Rental Center',
    tag: 'City Commuter',
    family: false,
    childSeats: 0,
    safety: 'Single-channel ABS, Helmet provided'
  },
  {
    id: 21,
    name: 'Royal Enfield Classic 350',
    category: 'Motorcycles',
    type: 'Heritage Cruiser',
    price: 48,
    seats: 2,
    luggage: 1,
    gear: 'Manual',
    image: '/vehicle-images/royal-enfield-classic-350.webp',
    pickup: 'Scenic Route Depot',
    tag: 'Heritage Ride',
    family: false,
    childSeats: 0,
    safety: 'Dual-channel ABS, Helmet provided'
  },
  {
    id: 22,
    name: 'Honda Africa Twin',
    category: 'Motorcycles',
    type: 'Maxi-Adventure Touring',
    price: 118,
    seats: 2,
    luggage: 3,
    gear: 'Manual',
    image: '/vehicle-images/honda-africa-twin.webp',
    pickup: 'Adventure Trail Depot',
    tag: 'Transcontinental',
    family: false,
    childSeats: 0,
    safety: '6-axis IMU, Cornering ABS & Wheelie control'
  },
  {
    id: 23,
    name: 'Suzuki V-Strom 650',
    category: 'Motorcycles',
    type: 'All-Road Cross Touring',
    price: 86,
    seats: 2,
    luggage: 3,
    gear: 'Manual',
    image: '/vehicle-images/suzuki-v-strom-650.webp',
    pickup: 'Mountain Gateway Depot',
    tag: 'High-Pass Tourer',
    family: false,
    childSeats: 0,
    safety: 'Advanced traction control, Dual discs ABS'
  },
  {
    id: 24,
    name: 'Kawasaki Versys 650',
    category: 'Motorcycles',
    type: 'Sport Adventure Touring',
    price: 82,
    seats: 2,
    luggage: 3,
    gear: 'Manual',
    image: '/vehicle-images/kawasaki-versys-650.webp',
    pickup: 'Mountain Gateway Depot',
    tag: 'Canyon Carver',
    family: false,
    childSeats: 0,
    safety: 'Kawasaki Traction Control (KTRC), Dual ABS'
  }
];

export const CATEGORIES = ['All vehicles', 'Cars & Sedans', 'SUVs & 4x4', 'Motorcycles'];

export const SHOWCASE_IDS = [1, 6, 17, 11, 22, 5, 18, 7, 24, 12];

export const COMMON_RENTAL_HUBS = [
  'Airport & City Delivery',
  'City Center Hub',
  'Zurich Airport Terminal 1',
  'Interlaken Central Hub',
  'Kyoto Station South Depot',
  'Santorini Port & Thira Hub',
  'Alpine Base Station',
  'Adventure Trail Depot',
  'Coastal Route Depot'
];

export const isMotorcycleVehicle = (vehicle) => {
  if (!vehicle) return false;
  const cat = String(vehicle.category || '').toLowerCase();
  const type = String(vehicle.type || '').toLowerCase();
  return cat.includes('motorcycle') || type.includes('motorcycle') || type.includes('touring') || type.includes('cruiser') || type.includes('naked') || type.includes('dual-sport');
};

export const getRentalButtonLabel = (vehicle) =>
  isMotorcycleVehicle(vehicle) ? 'Book Rental Bike' : 'Book Rental Car';

export const normalizeApiVehicle = (v) => {
  const rawType = String(v?.type || '');
  const lowerType = rawType.toLowerCase();
  const category = (lowerType.includes('bike') || lowerType.includes('motorcycle'))
    ? 'Motorcycles'
    : (lowerType.includes('suv') || lowerType.includes('4x4'))
      ? 'SUVs & 4x4'
      : 'Cars & Sedans';

  return {
    id: v.vehicle_id || v.id,
    name: v.model || v.name || 'TravelSphere Vehicle',
    category,
    type: rawType || 'Executive Sedan',
    price: Number(v.price_per_day || v.price) || 85,
    seats: Number(v.capacity || v.seats) || (category === 'Motorcycles' ? 2 : 4),
    luggage: category === 'Motorcycles' ? 2 : (category === 'SUVs & 4x4' ? 4 : 3),
    gear: category === 'Motorcycles' ? 'Manual' : 'Automatic',
    image: v.image_url || v.image || '/vehicle-images/mercedes-e-class.webp',
    pickup: v.pickup || 'City & Airport Delivery',
    tag: 'Partner Fleet',
    family: category !== 'Motorcycles' && Number(v.capacity || v.seats || 4) >= 4,
    childSeats: category === 'SUVs & 4x4' ? 2 : (category === 'Motorcycles' ? 0 : 1),
    safety: v.safety || 'Standard Comprehensive Safety Suite'
  };
};

export const getVehicleById = (id, extraVehicles = []) => {
  const target = String(id || '').trim();
  if (!target) return null;
  const combined = [...VEHICLES, ...extraVehicles];
  return combined.find(v => String(v.id) === target) || null;
};

export const getRentalSpecifications = (vehicle) => {
  const isBike = isMotorcycleVehicle(vehicle);
  const isSuv = vehicle?.category === 'SUVs & 4x4';

  return {
    isBike,
    mileagePolicy: 'Unlimited Kilometers Included',
    fuelPolicy: isBike ? 'Full-to-Full Fuel Tank · Unleaded Petrol' : 'Full-to-Full Fuel Policy · Eco / Hybrid Ready',
    licenseRequired: isBike ? 'Valid Motorcycle Endorsement (Class A / Intl Permit)' : 'Valid Driver’s License (Held 1+ Years) / IDP',
    minimumAge: isBike ? '21+ years rider age' : (vehicle?.price >= 130 ? '25+ years driver age' : '21+ years driver age'),
    depositPolicy: 'Refundable zero-hold card verification at pickup',
    includedFeatures: isBike
      ? [
          'Two certified DOT/ECE helmets & riding gloves included',
          'Waterproof rear tail bag & disc lock security',
          '24/7 mountain & highway roadside recovery',
          'Free cancellation up to 24 hours before pickup'
        ]
      : [
          isSuv ? 'All-weather AWD tires & spacious luggage bay' : 'Dual-zone climate control & Apple CarPlay / Android Auto',
          'Unlimited mileage with 24/7 roadside assistance',
          'Third-party liability & theft waiver protection',
          'Free cancellation up to 24 hours before pickup'
        ]
  };
};
