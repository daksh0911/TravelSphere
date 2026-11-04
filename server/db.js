import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// MySQL connection pool to travel_db (phpMyAdmin)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'travel_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ Connected to MySQL travel_db database (phpMyAdmin)');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('Make sure XAMPP/WAMP MySQL is running and travel_db exists in phpMyAdmin.');
  });

// Create a new user in the users table
export const createUser = async ({ name, email, password, phone, avatar_url = '' }) => {
  const passwordHash = bcrypt.hashSync(password, 10);
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute(
      `INSERT INTO users (name, email, password, phone, avatar_url, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [name, email.toLowerCase().trim(), passwordHash, phone || '', avatar_url || '']
    );

    const [rows] = await conn.execute(
      `SELECT user_id, user_id AS id, name, email, phone, avatar_url, is_active, created_at FROM users WHERE user_id = ?`,
      [result.insertId]
    );
    return rows[0];
  } finally {
    conn.release();
  }
};

// Find a user by email in the users table
export const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    `SELECT user_id, user_id AS id, name, email, password, phone, avatar_url, is_active, created_at FROM users WHERE email = ?`,
    [email.toLowerCase().trim()]
  );
  return rows[0] || null;
};

// Get all users from the users table
export const getAllUsers = async () => {
  const [rows] = await pool.execute(
    `SELECT user_id, user_id AS id, name, email, phone, avatar_url, is_active, created_at FROM users ORDER BY user_id DESC`
  );
  return rows;
};

// Ensure sample tour packages exist in database for browsing
export const ensurePackagesExist = async () => {
  const conn = await pool.getConnection();
  try {
    const [packages] = await conn.execute(`SELECT package_id FROM packages LIMIT 1`);
    if (packages.length === 0) {
      await conn.execute(
        `INSERT INTO packages (title, description, days, nights, price, image_url, rating, is_active)
         VALUES ('Kyoto Cherry Blossom Tour', 'Explore historic temples and blooming sakura gardens in Kyoto.', 7, 6, 1450.00, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80', 4.9, 1)`
      );
      await conn.execute(
        `INSERT INTO packages (title, description, days, nights, price, image_url, rating, is_active)
         VALUES ('Santorini Sunset Cruise & Villa', 'Luxurious caldera views and Aegean sea cruises in Greece.', 6, 5, 1780.00, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80', 4.8, 1)`
      );
      await conn.execute(
        `INSERT INTO packages (title, description, days, nights, price, image_url, rating, is_active)
         VALUES ('Bali Beach Villa & Temple Tour', 'Tropical beaches, rice terraces, and spiritual wellness in Bali.', 5, 4, 1120.00, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80', 4.7, 1)`
      );
      await conn.execute(
        `INSERT INTO packages (title, description, days, nights, price, image_url, rating, is_active)
         VALUES ('Swiss Alps Glacier & Scenic Express', 'Majestic glacier peaks and first class panoramic trains in Interlaken.', 8, 7, 2100.00, 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80', 5.0, 1)`
      );
      await conn.execute(
        `INSERT INTO packages (title, description, days, nights, price, image_url, rating, is_active)
         VALUES ('Paris Art & Seine Culinary Discovery', 'Louvre museum VIP access, Montmartre walks, and gourmet dining.', 5, 4, 1650.00, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80', 4.8, 1)`
      );
      await conn.execute(
        `INSERT INTO packages (title, description, days, nights, price, image_url, rating, is_active)
         VALUES ('Tokyo Bullet Train & Mt Fuji Quest', 'Shinkansen high-speed rail, Mt Fuji panoramas, and Michelin dining.', 6, 5, 1350.00, 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80', 4.9, 1)`
      );
    }
  } catch (err) {
    console.error('Packages setup warning:', err.message);
  } finally {
    conn.release();
  }
};

// Complete Package Details Dictionary enriched with Hotel, Guide, Transport, Itinerary & Inclusions
const PACKAGE_DETAILS_MAP = {
  1: {
    destination: 'Kyoto, Japan',
    hotel: {
      name: 'Aman Kyoto Luxury Pavilion',
      details: 'Nestled in a secret garden of moss-covered boulders and towering cedar groves at the foot of Hidari Daimonji, offering hot spring onsens and traditional kaiseki banquets.',
      address: '1 Okitayama Washimine-cho, Kita-ku, Kyoto 603-8458, Japan',
      rating: 4.9,
      amenities: ['Natural Mineral Onsen', 'Complimentary Traditional Kaiseki Breakfast', 'High-Speed Wi-Fi', 'Private Garden Terrace', '24/7 Concierge Service', 'Air Conditioning & Heated Floors'],
      imageUrl: '/hotel-images/aman-kyoto.jpg'
    },
    guide: {
      name: 'Kenji Takahashi',
      bio: 'Government Certified Heritage Guide with over 14 years of cultural storytelling, tea ceremony curation, and temple preservation leadership in Kansai.',
      languages: ['English', 'Japanese', 'French'],
      rating: 4.95,
      photoUrl: '/guide-images/arjun-sen.jpg'
    },
    transportation: {
      type: 'Private Executive Luxury Van & Shinkansen',
      model: 'Toyota Alphard Executive Lounge & Shinkansen Green Car',
      capacity: 'Up to 5 passengers with premium luggage compartment',
      details: 'All Kyoto transfers, private temple chauffeuring, luggage forwarding between stations, and reserved Green Car bullet train passes included.',
      imageUrl: '/vehicle-images/mercedes-e-class.webp'
    },
    itinerary: [
      { day: 1, title: 'Arrival & Gion Lantern Evening', desc: 'Private airport meet & greet, check-in at Aman Kyoto, followed by a quiet twilight lantern stroll through historic Gion with a welcome Kaiseki dinner.' },
      { day: 2, title: 'Fushimi Inari Torii & Kiyomizu-dera', desc: 'Early morning private entry to Fushimi Inari shrine avoiding crowds, followed by a traditional matcha ceremony at a 300-year-old tea pavilion overlooking Kiyomizu-dera.' },
      { day: 3, title: 'Arashiyama Bamboo Grove & Tenryu-ji', desc: 'Scenic rickshaw exploration along the Sagano bamboo paths, tranquil meditation walk in UNESCO Tenryu-ji Zen garden, and private boat cruise on the Hozu River.' },
      { day: 4, title: 'Kinkaku-ji Golden Pavilion & Nishiki Market', desc: 'VIP access to Kinkaku-ji, followed by a culinary masterclass exploring historic Nishiki Market with local artisan tastings.' },
      { day: 5, title: 'Nara Deer Sanctuary & Todai-ji Day Excursion', desc: 'Comfortable chauffeur transfer to Nara. Visit the Great Buddha at Todai-ji, interact with sacred deer, and experience ancient cedar trails.' },
      { day: 6, title: 'Uji Green Tea Farm & Zen Workshop', desc: 'Hands-on tea harvest experience in historic Uji, private ceramics workshop, and relaxing evening in the natural hot spring onsen.' },
      { day: 7, title: 'Farewell Tea & Chauffeur Departure', desc: 'Leisurely garden breakfast, personal souvenir wrapping service, and private transfer to Kansai International Airport.' }
    ],
    includedServices: [
      '6 nights luxury accommodation at Aman Kyoto Luxury Pavilion',
      'Daily gourmet artisan breakfast & 2 multi-course Kaiseki dinners',
      'Private air-conditioned chauffeur vehicle and Shinkansen Green Car passes',
      'Dedicated government-licensed English-speaking tour guide throughout',
      'All temple entrance fees, private garden permits & tea ceremony tickets',
      '24/7 TravelSphere concierge emergency and luggage dispatch assistance'
    ],
    excludedServices: [
      'International round-trip flights',
      'Personal travel insurance (available via add-on)',
      'Passport and visa procurement fees',
      'Discretionary tips and gratuities for chauffeur/guide',
      'Personal boutique shopping and extra alcoholic beverages'
    ],
    facilities: ['Wi-Fi Included', 'Spa / Hot Spring Access', 'Chauffeur Driven', 'English Speaking Lead', 'Vegetarian / Halal Meals Available', 'Baggage Dispatch Service'],
    images: [
      '/package-images/5-kyoto.webp',
      '/destination-images/kyoto.webp',
      '/hotel-images/aman-kyoto.jpg'
    ]
  },
  2: {
    destination: 'Santorini, Greece',
    hotel: {
      name: 'Grace Hotel Santorini, Auberge Resorts',
      details: 'Iconic cliff-top clifftop retreat carved into the caldera basin with infinity pool vistas of the Aegean Sea, minimalist Aegean architecture, and champagne sunsets.',
      address: 'Imerovigli, Santorini 84700, Greece',
      rating: 4.85,
      amenities: ['Cliffside Infinity Heated Pool', 'Private Plunge Pools', 'Santorini Sunset Champagne Bar', 'Complimentary Daily Yoga & Pilates', 'Free High-Speed Wi-Fi', '24-hour Luxury In-Villa Dining'],
      imageUrl: '/hotel-images/grace-santorini.jpg'
    },
    guide: {
      name: 'Nikos Petrakis',
      bio: 'Santorini native and certified Aegean historian specializing in ancient Akrotiri Minoan ruins, caldera geology, and volcanic viticulture.',
      languages: ['English', 'Greek', 'Italian'],
      rating: 4.9,
      photoUrl: '/guide-images/nikos-petrakis.jpg'
    },
    transportation: {
      type: 'Private Luxury Catamaran & Mercedes V-Class',
      model: 'Lagoon 520 Yacht & Mercedes-Benz V-Class Chauffeur Van',
      capacity: 'Up to 6 guests with dedicated yacht skipper and crew',
      details: 'All island airport/port transfers, private vineyard transfers, and full-day private catamaran sailing through the volcanic caldera included.',
      imageUrl: '/vehicle-images/range-rover-velar.webp'
    },
    itinerary: [
      { day: 1, title: 'Arrival & Caldera Sunset Welcome', desc: 'VIP greeting at Thira Airport, private transfer to Imerovigli, check-in to your cliffside suite with complimentary chilled Assyrtiko wine, followed by a panoramic sunset dinner.' },
      { day: 2, title: 'Private Catamaran Aegean Cruise', desc: 'Board your private luxury catamaran for a sail to the Red Beach, White Beach, and Nea Kameni volcanic hot springs, complete with barbecue on board.' },
      { day: 3, title: 'Ancient Akrotiri Ruins & Red Beach', desc: 'Guided exploration through the remarkably preserved prehistoric city of Akrotiri, followed by swimming in volcanic bay waters and seaside taverna lunch.' },
      { day: 4, title: 'Volcanic Wineries & Oia Village Stroll', desc: 'Private sommelier-led tasting at Santo Winery and Venetsanos, followed by an evening walk along the marble alleys of Oia as the sunset illuminates the white chapels.' },
      { day: 5, title: 'Pyrgos Medieval Village & Mesa Vouno', desc: 'Discover quiet stone alleys, panoramic views from the highest point of the island, and a farewell seafood dinner at Ammoudi Bay.' },
      { day: 6, title: 'Sunlit Breakfast & Port / Airport Transfer', desc: 'Champagne breakfast on your private terrace, leisurely packing, and private executive transfer to Santorini airport or ferry port.' }
    ],
    includedServices: [
      '5 nights cliffside suite stay at Grace Hotel Santorini',
      'Daily champagne breakfast overlooking the caldera',
      'Full-day private catamaran yacht charter with chef-prepared lunch',
      'Private air-conditioned Mercedes V-Class ground transfers throughout',
      'Guided Akrotiri archaeological tour & private sommelier wine tastings',
      '24/7 dedicated local island host and round-the-clock support'
    ],
    excludedServices: [
      'International flights to/from Athens or Santorini',
      'Personal travel insurance',
      'Visa fees (if applicable)',
      'Personal gratuities for boat crew and drivers',
      'Extra motorized watersports'
    ],
    facilities: ['Sea View Suite', 'Private Heated Pool', 'Yacht Cruise Included', 'Sommelier Wine Tasting', 'High-Speed Wi-Fi', '24/7 Guest Care'],
    images: [
      '/package-images/2-santorini.webp',
      '/destination-images/santorini.webp',
      '/hotel-images/grace-santorini.jpg'
    ]
  },
  3: {
    destination: 'Bali, Indonesia',
    hotel: {
      name: 'Mandapa, a Ritz-Carlton Reserve, Ubud',
      details: 'Secluded luxury sanctuary along the sacred Ayung River in Ubud, featuring private pool villas, holistic wellness healing, and verdant rice terrace views.',
      address: 'Jl. Raya Kedewatan, Banjar Kedewatan, Ubud, Bali 80571, Indonesia',
      rating: 4.8,
      amenities: ['Private Riverside Pool Villa', 'Holistic Ayurvedic Spa & Yoga Pavilion', 'Fine Dining Kubu Bamboo Pods', 'Complimentary Wi-Fi', 'Padi Butler Service', 'Fitness Center & Herb Garden'],
      imageUrl: '/hotel-images/mandapa-ubud.jpg'
    },
    guide: {
      name: 'Wayan Sudiarta',
      bio: 'Deeply knowledgeable Balinese cultural elder and accredited eco-guide, sharing sacred temple rituals, rice farming heritage, and holistic wellness philosophy.',
      languages: ['English', 'Indonesian', 'Balinese'],
      rating: 4.92,
      photoUrl: '/guide-images/wayan-sudiarta.jpg'
    },
    transportation: {
      type: 'Private Air-Conditioned SUV & Traditional Boat',
      model: 'Toyota Fortuner 4x4 / Luxury MPV',
      capacity: 'Up to 4 travelers with ample luggage space',
      details: 'Private air-conditioned vehicle with dedicated driver for all day excursions, temple visits, and scenic highland transfers.',
      imageUrl: '/vehicle-images/mercedes-e-class.webp'
    },
    itinerary: [
      { day: 1, title: 'Arrival in Denpasar & Ubud Rainforest Transfer', desc: 'Warm Balinese garland welcome at DPS Airport, private scenic transfer through artist villages to Mandapa Ubud, and evening herbal wellness dinner.' },
      { day: 2, title: 'Tirta Empul Water Purification & Rice Terraces', desc: 'Participate in a traditional Melukat water blessing ceremony at Tirta Empul, followed by walking through the emerald Tegalalang rice terraces with local farmers.' },
      { day: 3, title: 'Mount Batur Sunrise & Hot Springs', desc: 'Early 4WD or gentle scenic viewpoint trek for sunrise over Mount Batur volcano, followed by soaking in natural lakeside thermal hot springs.' },
      { day: 4, title: 'Sacred Monkey Forest & Artisan Silver Workshop', desc: 'Morning visit to the Sacred Monkey Forest Sanctuary, private silver jewelry-making masterclass in Celuk, and sunset riverside dining in a private bamboo cocoon.' },
      { day: 5, title: 'Holistic Spa Ritual & Departure Transfer', desc: 'Two-hour Balinese massage and herbal bath ritual, tropical fruit tasting, and comfortable private chauffeur transfer back to the airport.' }
    ],
    includedServices: [
      '4 nights private pool villa at Mandapa, a Ritz-Carlton Reserve',
      'Daily organic farm-to-table breakfast and 2 wellness lunches',
      'Private 4x4 vehicle with dedicated English-speaking chauffeur',
      'Personal Balinese spiritual guide and all temple entrance donations',
      'Traditional Melukat holy water blessing ceremony materials',
      'Complimentary 120-minute couple spa and herbal healing session'
    ],
    excludedServices: [
      'International flights to Bali (DPS)',
      'Entry visa on arrival fee (if applicable)',
      'Travel and cancellation insurance',
      'Discretionary tips for villa butler and driver'
    ],
    facilities: ['Private Pool', 'Holistic Spa', 'Temple Blessing Included', 'Private 4x4 Chauffeur', 'High-Speed Wi-Fi', '24/7 Padi Butler'],
    images: [
      '/package-images/3-bali.webp',
      '/destination-images/bali.webp',
      '/hotel-images/mandapa-ubud.jpg'
    ]
  },
  4: {
    destination: 'Interlaken & Zermatt, Switzerland',
    hotel: {
      name: 'Victoria-Jungfrau Grand Hotel & Spa',
      details: 'Historic 5-star Swiss palace hotel at the foot of the snow-capped Jungfrau massif, featuring a 5,500 sq m Nescens Spa, grand Belle Époque ballrooms, and alpine terraces.',
      address: 'Höheweg 41, 3800 Interlaken, Switzerland',
      rating: 4.95,
      amenities: ['5,500 sq m Thermal Spa & Indoor Roman Pool', 'First-Class Glacier Railway Passes', 'Panoramic Alpine View Rooms', 'Michelin-Starred Dining', 'Complimentary High-Speed Wi-Fi', 'Ski & Mountain Bike Storage'],
      imageUrl: '/hotel-images/victoria-jungfrau.jpg'
    },
    guide: {
      name: 'Marco Zbinden',
      bio: 'Swiss Alpine Club certified mountain guide and glacier naturalist with 18 years experience guiding expeditions across Jungfraujoch, the Eiger trail, and Zermatt.',
      languages: ['English', 'German', 'French', 'Italian'],
      rating: 5.0,
      photoUrl: '/guide-images/arjun-sen.jpg'
    },
    transportation: {
      type: 'Swiss First Class Panoramic Train & Private Electric Shuttle',
      model: 'Glacier Express Excellence Class & Swiss Travel First Pass',
      capacity: 'First-Class rail with private seating and panoramic dome windows',
      details: 'All Swiss panoramic trains, cogwheel mountain railways, cable cars, and airport transfers fully covered on first-class passes.',
      imageUrl: '/vehicle-images/mercedes-e-class.webp'
    },
    itinerary: [
      { day: 1, title: 'Zurich Arrival & Scenic Rail to Interlaken', desc: 'Chauffeur greeting at Zurich Airport, scenic first-class train ride along Lake Thun to Interlaken, check-in at the Victoria-Jungfrau with Swiss chocolate welcome.' },
      { day: 2, title: 'Jungfraujoch – Top of Europe Glacier Tour', desc: 'Ascend via the Eiger Express tricable gondola to Jungfraujoch at 3,454m. Explore the Ice Palace, Sphinx Observatory, and snow plateau.' },
      { day: 3, title: 'Lauterbrunnen Valley of 72 Waterfalls & Mürren', desc: 'Scenic train into Lauterbrunnen, walk behind Staubbach Falls, cogwheel railway up to car-free alpine village Mürren, and Swiss cheese fondue tasting.' },
      { day: 4, title: 'Glacier Express Scenic Train to Zermatt', desc: 'Board the world-famous Glacier Express with panoramic dome windows traversing dramatic viaducts and mountain passes into Zermatt beneath the Matterhorn.' },
      { day: 5, title: 'Gornergrat Railway & Matterhorn Reflection', desc: 'Historic open-air cogwheel train ride to Gornergrat at 3,089m with 360-degree views of 29 four-thousand-meter peaks and the iconic Matterhorn reflection in Riffelsee.' },
      { day: 6, title: 'Lake Brienz Steamer & Harder Kulm Panorama', desc: 'Historic paddle-steamer cruise across turquoise Lake Brienz, funicular ascent to Harder Kulm for evening sunset over the two lakes.' },
      { day: 7, title: 'Alpine Wellness & Chocolate Masterclass', desc: 'Relaxing morning at the 5,500m² Nescens Spa, followed by a private Swiss chocolate-making workshop with master chocolatiers.' },
      { day: 8, title: 'First-Class Return & Departure', desc: 'Breakfast on the terrace, panoramic scenic train transfer to Zurich or Geneva Airport for homeward flight.' }
    ],
    includedServices: [
      '7 nights luxury accommodation at 5-star Victoria-Jungfrau & Zermatt partner resort',
      'Daily Swiss gourmet buffet breakfast & 3 traditional alpine dinners',
      '8-Day Swiss Travel Pass in First Class with unlimited train, boat, and bus travel',
      'All mountain excursions including Jungfraujoch and Gornergrat tickets',
      'Certified Swiss mountain guide for alpine day hikes',
      'Full access to luxury thermal spa, Roman indoor baths, and saunas'
    ],
    excludedServices: [
      'Transatlantic / international airfare',
      'Personal ski equipment rental (can be arranged on request)',
      'Travel medical insurance',
      'Personal incidentals and alcoholic drinks outside included tastings'
    ],
    facilities: ['Glacier Express 1st Class', '5,500m² Luxury Spa', 'Matterhorn Excursion', 'Swiss Chocolate Workshop', 'High-Speed Wi-Fi', 'Certified Alpine Lead'],
    images: [
      '/package-images/4-swiss-alps.webp',
      '/destination-images/swiss-alps.webp',
      '/hotel-images/victoria-jungfrau.jpg'
    ]
  }
};

// Fetch all available packages from MySQL (with offline fallback for reliability)
export const getAllPackages = async () => {
  try {
    await ensurePackagesExist();
    const [rows] = await pool.execute(`SELECT * FROM packages WHERE is_active = 1 ORDER BY package_id ASC`);
    return rows;
  } catch (err) {
    console.warn('MySQL packages query failed, using offline fallback:', err.message);
    return [
      { package_id: 1, title: 'Kyoto Cherry Blossom Tour', description: 'Explore historic temples and blooming sakura gardens in Kyoto.', days: 7, nights: 6, price: 1450.00, image_url: '/destination-images/kyoto.webp', rating: 4.9, is_active: 1 },
      { package_id: 2, title: 'Santorini Sunset Cruise & Villa', description: 'Luxurious caldera views and Aegean sea cruises in Greece.', days: 6, nights: 5, price: 1780.00, image_url: '/destination-images/santorini.webp', rating: 4.8, is_active: 1 },
      { package_id: 3, title: 'Bali Beach Villa & Temple Tour', description: 'Tropical beaches, rice terraces, and spiritual wellness in Bali.', days: 5, nights: 4, price: 1120.00, image_url: '/destination-images/bali.webp', rating: 4.7, is_active: 1 },
      { package_id: 4, title: 'Swiss Alps Glacier & Scenic Express', description: 'Majestic glacier peaks and first class panoramic trains in Interlaken.', days: 8, nights: 7, price: 2100.00, image_url: '/destination-images/swiss-alps.webp', rating: 5.0, is_active: 1 }
    ];
  }
};

// Fetch single package by ID with full hotel, guide, transport & itinerary details (with offline fallback)
export const getPackageById = async (packageId) => {
  const numId = Number(packageId);
  const enriched = PACKAGE_DETAILS_MAP[numId] || PACKAGE_DETAILS_MAP[1];
  let base = null;

  try {
    await ensurePackagesExist();
    const [rows] = await pool.execute(`SELECT * FROM packages WHERE package_id = ?`, [packageId]);
    base = rows[0] || null;
  } catch (err) {
    console.warn('MySQL query for package detail failed, using enriched catalog data:', err.message);
  }

  if (!base && !enriched) return null;

  return {
    id: base?.package_id || numId,
    package_id: base?.package_id || numId,
    title: base?.title || enriched?.title || 'Curated Tour Package',
    description: base?.description || 'Thoughtfully crafted travel journey featuring verified stays, licensed guides, and seamless transport.',
    days: base?.days || 5,
    nights: base?.nights || 4,
    price: base?.price || 1200,
    rating: base?.rating || 4.9,
    imageUrl: base?.image_url || enriched?.images?.[0] || '/destination-images/kyoto.webp',
    image: base?.image_url || enriched?.images?.[0] || '/destination-images/kyoto.webp',
    destination: enriched?.destination,
    hotel: enriched?.hotel,
    guide: enriched?.guide,
    transportation: enriched?.transportation,
    itinerary: enriched?.itinerary,
    includedServices: enriched?.includedServices,
    excludedServices: enriched?.excludedServices,
    facilities: enriched?.facilities,
    images: enriched?.images
  };
};

// Fetch complete live dashboard data for a user from MySQL
export const getUserDashboardData = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const userId = user.user_id;

  // Ensure packages table has explore items
  await ensurePackagesExist();

  // Fetch all available packages for exploration
  const packagesList = await getAllPackages();

  // Fetch live bookings with package details
  const [bookings] = await pool.execute(
    `SELECT 
        b.booking_id,
        CONCAT('BK-', b.booking_id) AS display_id,
        b.start_date,
        b.end_date,
        b.guests,
        b.total_amount,
        b.status,
        b.created_at,
        p.title AS package_title,
        p.image_url AS package_image,
        p.days,
        p.nights
     FROM bookings b
     LEFT JOIN packages p ON b.package_id = p.package_id
     WHERE b.user_id = ?
     ORDER BY b.booking_id DESC`,
    [userId]
  );

  // Fetch live wishlist with package details
  const [wishlist] = await pool.execute(
    `SELECT 
        w.wishlist_id,
        w.added_at,
        p.package_id,
        p.title,
        p.description,
        p.price,
        p.rating,
        p.image_url
     FROM wishlist w
     LEFT JOIN packages p ON w.target_id = p.package_id AND w.target_type = 'package'
     WHERE w.user_id = ?
     ORDER BY w.wishlist_id DESC`,
    [userId]
  );

  // Fetch live reviews submitted by user
  let reviews = [];
  try {
    await ensureReviewsTable();
    const [revRows] = await pool.execute(
      `SELECT review_id, user_id, booking_id, rating, comment, created_at FROM reviews WHERE user_id = ? ORDER BY review_id DESC`,
      [userId]
    );
    reviews = revRows;
  } catch (err) {
    console.warn('Reviews fetch warning:', err.message);
  }

  // Fetch live notifications for user
  let notifications = [];
  try {
    await ensureNotificationsTable();
    const [notifRows] = await pool.execute(
      `SELECT notification_id, user_id, title, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY notification_id DESC`,
      [user.user_id]
    );
    notifications = notifRows;
  } catch (err) {
    console.warn('Notifications fetch warning:', err.message);
  }

  const { password: _password, ...userProfile } = user;

  return {
    user: userProfile,
    bookings,
    wishlist,
    reviews,
    notifications,
    allPackages: packagesList,
    stats: {
      totalBookings: bookings.length,
      activeBookings: bookings.filter(b => b.status === 'confirmed').length,
      wishlistCount: wishlist.length,
      reviewsCount: reviews.length,
      unreadNotificationsCount: notifications.filter(n => !n.is_read).length
    }
  };
};

// Create a new booking in MySQL bookings table
export const createBooking = async ({ userId, packageId, startDate, endDate, guests, totalAmount }) => {
  const [result] = await pool.execute(
    `INSERT INTO bookings (user_id, package_id, start_date, end_date, guests, subtotal, discount, total_amount, status)
     VALUES (?, ?, ?, ?, ?, ?, 0.00, ?, 'confirmed')`,
    [userId, packageId, startDate || '2026-10-15', endDate || '2026-10-22', guests || 2, totalAmount, totalAmount]
  );
  return result.insertId;
};

// Add item to wishlist in MySQL wishlist table
export const addToWishlist = async ({ userId, packageId }) => {
  const [existing] = await pool.execute(
    `SELECT wishlist_id FROM wishlist WHERE user_id = ? AND target_id = ? AND target_type = 'package'`,
    [userId, packageId]
  );
  if (existing.length > 0) return existing[0].wishlist_id;

  const [result] = await pool.execute(
    `INSERT INTO wishlist (user_id, target_type, target_id) VALUES (?, 'package', ?)`,
    [userId, packageId]
  );
  return result.insertId;
};

// Remove item from wishlist in MySQL wishlist table
export const removeFromWishlist = async ({ userId, packageId }) => {
  const [result] = await pool.execute(
    `DELETE FROM wishlist WHERE user_id = ? AND target_id = ? AND target_type = 'package'`,
    [userId, packageId]
  );
  return result.affectedRows > 0;
};

// Get all wishlist items for a user
export const getWishlistByUser = async (userId) => {
  await ensurePackagesExist();
  const [rows] = await pool.execute(
    `SELECT 
        w.wishlist_id,
        w.added_at,
        p.package_id,
        p.package_id AS id,
        p.title,
        p.description,
        p.price,
        p.rating,
        p.image_url,
        p.image_url AS image,
        p.days,
        p.nights
     FROM wishlist w
     JOIN packages p ON w.target_id = p.package_id AND w.target_type = 'package'
     WHERE w.user_id = ?
     ORDER BY w.wishlist_id DESC`,
    [userId]
  );
  return rows;
};

// Update user profile in MySQL
export const updateUserProfile = async (userId, { name, phone }) => {
  await pool.execute(
    `UPDATE users SET name = ?, phone = ? WHERE user_id = ?`,
    [name, phone || '', userId]
  );
  const [rows] = await pool.execute(
    `SELECT user_id, user_id AS id, name, email, phone, avatar_url, is_active, created_at FROM users WHERE user_id = ?`,
    [userId]
  );
  return rows[0];
};

// Support tickets (table is created on first use so existing databases need no manual migration)
let ticketsReady;
const ensureTicketsTable = () => (ticketsReady ??= pool.execute(
  `CREATE TABLE IF NOT EXISTS support_tickets (
     ticket_id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(254) NOT NULL,
     topic VARCHAR(80) NOT NULL DEFAULT 'general',
     message TEXT NOT NULL,
     status VARCHAR(20) NOT NULL DEFAULT 'open',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`
).catch(err => { ticketsReady = undefined; throw err; }));

export const createSupportTicket = async ({ name, email, topic, message }) => {
  await ensureTicketsTable();
  const [result] = await pool.execute(
    `INSERT INTO support_tickets (name, email, topic, message) VALUES (?, ?, ?, ?)`,
    [name, email, topic, message]
  );
  return result.insertId;
};

export const listSupportTickets = async (limit = 100) => {
  await ensureTicketsTable();
  const [rows] = await pool.execute(
    `SELECT ticket_id, name, email, topic, message, status, created_at FROM support_tickets ORDER BY ticket_id DESC LIMIT ${Number(limit) | 0}`
  );
  return rows;
};

export const updateSupportTicketStatus = async (ticketId, status) => {
  await ensureTicketsTable();
  const [result] = await pool.execute(`UPDATE support_tickets SET status = ? WHERE ticket_id = ?`, [status, ticketId]);
  return result.affectedRows > 0;
};

// ----------------- REVIEWS (PDF Table 22 / Table 19) -----------------
let reviewsReady;
const ensureReviewsTable = () => (reviewsReady ??= pool.execute(
  `CREATE TABLE IF NOT EXISTS reviews (
     review_id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT NOT NULL,
     booking_id INT NULL,
     rating TINYINT NOT NULL,
     comment TEXT NULL,
     updated_at TIMESTAMP NULL DEFAULT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`
).catch(err => { reviewsReady = undefined; throw err; }));

export const createReview = async ({ userId, bookingId, rating, comment }) => {
  await ensureReviewsTable();
  const [result] = await pool.execute(
    `INSERT INTO reviews (user_id, booking_id, rating, comment, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [userId, bookingId || null, rating, comment || null]
  );
  return result.insertId;
};

export const updateReview = async ({ reviewId, userId, rating, comment }) => {
  await ensureReviewsTable();
  try {
    const [result] = await pool.execute(
      `UPDATE reviews SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP WHERE review_id = ? AND user_id = ?`,
      [rating, comment || null, reviewId, userId]
    );
    return result.affectedRows > 0;
  } catch {
    // If updated_at column doesn't exist in older table, fallback to rating and comment update
    const [result] = await pool.execute(
      `UPDATE reviews SET rating = ?, comment = ? WHERE review_id = ? AND user_id = ?`,
      [rating, comment || null, reviewId, userId]
    );
    return result.affectedRows > 0;
  }
};

export const getReviewsByUser = async (userId) => {
  await ensureReviewsTable();
  const [rows] = await pool.execute(
    `SELECT review_id, user_id, booking_id, rating, comment, updated_at, created_at FROM reviews WHERE user_id = ? ORDER BY review_id DESC`,
    [userId]
  );
  return rows;
};

export const getAllReviews = async () => {
  await ensureReviewsTable();
  const [rows] = await pool.execute(
    `SELECT r.review_id, r.user_id, r.booking_id, r.rating, r.comment, r.updated_at, r.created_at, u.name AS user_name, u.email AS user_email
     FROM reviews r
     LEFT JOIN users u ON r.user_id = u.user_id
     ORDER BY r.review_id DESC`
  );
  return rows;
};

// ------------- CONTACT MESSAGES (PDF Table 17 / Table 14) -------------
let contactReady;
const ensureContactTable = () => (contactReady ??= pool.execute(
  `CREATE TABLE IF NOT EXISTS contact_messages (
     contact_id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(150) NOT NULL,
     subject VARCHAR(200) NULL,
     message TEXT NOT NULL,
     is_read TINYINT(1) DEFAULT 0,
     replied_at TIMESTAMP NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`
).catch(err => { contactReady = undefined; throw err; }));

export const createContactMessage = async ({ name, email, subject, message }) => {
  await ensureContactTable();
  const [result] = await pool.execute(
    `INSERT INTO contact_messages (name, email, subject, message, is_read) VALUES (?, ?, ?, ?, 0)`,
    [name, email, subject || '', message]
  );
  return result.insertId;
};

export const listContactMessages = async (limit = 100) => {
  await ensureContactTable();
  const [rows] = await pool.execute(
    `SELECT contact_id, name, email, subject, message, is_read, replied_at, created_at FROM contact_messages ORDER BY contact_id DESC LIMIT ${Number(limit) | 0}`
  );
  return rows;
};

// ----------------- PAYMENTS (PDF Table 21 / Table 18) -----------------
let paymentsReady;
const ensurePaymentsTable = () => (paymentsReady ??= pool.execute(
  `CREATE TABLE IF NOT EXISTS payments (
     payment_id INT AUTO_INCREMENT PRIMARY KEY,
     booking_id INT NOT NULL,
     user_id INT NOT NULL,
     amount DECIMAL(10,2) NOT NULL,
     method VARCHAR(50) NOT NULL,
     status VARCHAR(50) DEFAULT 'completed',
     transaction_ref VARCHAR(200) NULL,
     paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`
).catch(err => { paymentsReady = undefined; throw err; }));

export const recordPayment = async ({ bookingId, userId, amount, method = 'card', transactionRef }) => {
  await ensurePaymentsTable();
  const ref = transactionRef || `TXN-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const [result] = await pool.execute(
    `INSERT INTO payments (booking_id, user_id, amount, method, status, transaction_ref, paid_at)
     VALUES (?, ?, ?, ?, 'completed', ?, CURRENT_TIMESTAMP)`,
    [bookingId, userId, amount, method, ref]
  );
  return { paymentId: result.insertId, transactionRef: ref };
};

// ------------------ COUPONS (PDF Table 18 / Table 15) -----------------
let couponsReady;
const ensureCouponsTable = async () => {
  if (couponsReady) return couponsReady;
  couponsReady = (async () => {
    await pool.execute(
      `CREATE TABLE IF NOT EXISTS coupons (
         coupon_id INT AUTO_INCREMENT PRIMARY KEY,
         code VARCHAR(50) UNIQUE NOT NULL,
         discount_type VARCHAR(20) NOT NULL,
         discount_value DECIMAL(10,2) NOT NULL,
         min_amount DECIMAL(10,2) DEFAULT 0.00,
         max_uses INT DEFAULT 100,
         used_count INT DEFAULT 0,
         expires_at DATE NULL,
         is_active TINYINT(1) DEFAULT 1,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       )`
    );
    // Seed initial coupon code if empty
    const [existing] = await pool.execute(`SELECT coupon_id FROM coupons LIMIT 1`);
    if (existing.length === 0) {
      await pool.execute(
        `INSERT INTO coupons (code, discount_type, discount_value, min_amount, max_uses, used_count, expires_at, is_active)
         VALUES ('TRAVEL20', 'percentage', 20.00, 100.00, 500, 0, '2027-12-31', 1),
                ('EXPLORE50', 'fixed', 50.00, 200.00, 200, 0, '2027-12-31', 1)`
      );
    }
  })().catch(err => { couponsReady = undefined; throw err; });
  return couponsReady;
};

export const validateCoupon = async (code, amount = 0) => {
  await ensureCouponsTable();
  const [rows] = await pool.execute(
    `SELECT coupon_id, code, discount_type, discount_value, min_amount, max_uses, used_count, expires_at, is_active
     FROM coupons
     WHERE UPPER(code) = UPPER(?) AND is_active = 1`,
    [code.trim()]
  );
  const coupon = rows[0];
  if (!coupon) return { valid: false, message: 'Invalid or expired coupon code.' };
  if (coupon.min_amount && Number(amount) < Number(coupon.min_amount)) {
    return { valid: false, message: `Minimum booking amount of $${coupon.min_amount} required.` };
  }
  const discount = coupon.discount_type === 'percentage'
    ? (Number(amount) * Number(coupon.discount_value)) / 100
    : Number(coupon.discount_value);
  return { valid: true, couponId: coupon.coupon_id, discount: Math.min(discount, Number(amount)), code: coupon.code };
};

// -------------- NOTIFICATIONS (PDF Table 20 / Table 17) --------------
let notificationsReady;
const ensureNotificationsTable = () => (notificationsReady ??= pool.execute(
  `CREATE TABLE IF NOT EXISTS notifications (
     notification_id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT NOT NULL,
     title VARCHAR(200) NOT NULL,
     message TEXT NULL,
     is_read TINYINT(1) DEFAULT 0,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`
).catch(err => { notificationsReady = undefined; throw err; }));

export const createNotification = async ({ userId, title, message }) => {
  await ensureNotificationsTable();
  const [result] = await pool.execute(
    `INSERT INTO notifications (user_id, title, message, is_read) VALUES (?, ?, ?, 0)`,
    [userId, title, message]
  );
  return result.insertId;
};

export const getNotificationsByUser = async (userId) => {
  await ensureNotificationsTable();
  const [rows] = await pool.execute(
    `SELECT notification_id, user_id, title, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY notification_id DESC`,
    [userId]
  );
  return rows;
};

export const markNotificationRead = async (notificationId) => {
  await ensureNotificationsTable();
  await pool.execute(`UPDATE notifications SET is_read = 1 WHERE notification_id = ?`, [notificationId]);
  return true;
};

export const markAllNotificationsRead = async (userId) => {
  await ensureNotificationsTable();
  await pool.execute(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [userId]);
  return true;
};

export default pool;
