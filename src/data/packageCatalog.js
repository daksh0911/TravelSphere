/**
 * Enriched Travel Packages Catalog for TravelSphere
 * Serves complete package details (Hotels, Guides, Transportation, Day-by-Day Itineraries, Inclusions, Facilities)
 * Works seamlessly with both MySQL backend API and standalone Vercel client deployment.
 */

export const PACKAGE_CATALOG = {
  1: {
    id: 1,
    title: 'Maldives Overwater Luxury Escape',
    location: 'Maldives',
    destination: 'North Malé Atoll, Maldives',
    category: 'Beach & islands',
    days: 5,
    nights: 4,
    price: 1045,
    rating: 4.9,
    description: 'Bask in turquoise crystal waters, private overwater lagoon villas, sunrise yoga, and dolphin catamaran cruises in the heart of the Indian Ocean.',
    imageUrl: '/package-images/1-maldives.webp',
    images: [
      '/package-images/1-maldives.webp',
      '/destination-images/maldives.webp',
      '/hotel-images/maldives-stay.webp'
    ],
    hotel: {
      name: 'Gili Lankanfushi Luxury Overwater Resort',
      details: 'Eco-luxury villa perched over clear sapphire lagoons, featuring direct ocean access, open-air living pavilions, and organic oceanfront dining.',
      address: 'Lankanfushi Island, North Malé Atoll 08290, Maldives',
      rating: 4.95,
      amenities: ['Private Overwater Sun Deck', 'Ayurvedic Ocean Spa', 'Seaplane Airport Transfers', '24/7 Mr. Friday Butler Service', 'Complimentary Snorkel Gear', 'High-Speed Island Wi-Fi'],
      imageUrl: '/hotel-images/maldives-stay.webp'
    },
    guide: {
      name: 'Ibrahim Rasheed',
      bio: 'PADI Master Diver and certified marine biologist with 12 years of coral conservation and dolphin tracking leadership in the Maldivian atolls.',
      languages: ['English', 'Dhivehi', 'French'],
      rating: 4.95,
      photoUrl: '/guide-avatar.svg'
    },
    transportation: {
      type: 'Private Twin-Otter Seaplane & Luxury Speedboat',
      model: 'Trans Maldivian Twin Otter Seaplane & Silvercraft 36 Speedboat',
      capacity: 'Up to 6 guests with dedicated luggage cargo',
      details: 'All scenic aerial seaplane flights between Velana International Airport (MLE) and resort lagoon jetty included.',
      imageUrl: '/vehicle-images/mercedes-e-class.webp'
    },
    itinerary: [
      { day: 1, title: 'Arrival & Scenic Seaplane Flight', desc: 'VIP meet and greet at Male International Airport, 25-minute scenic seaplane flight over coral atolls, check-in to your overwater villa, and sunset welcome drinks.' },
      { day: 2, title: 'House Reef Snorkeling & Coral Planting', desc: 'Guided morning marine safari exploring the house reef with our marine biologist, followed by an afternoon coral garden restoration workshop.' },
      { day: 3, title: 'Private Sandbank Picnic & Dolphin Cruise', desc: 'Speedboat transfer to an uninhabited sandbank for a private chef-prepared picnic lunch, followed by twilight dolphin watching on a traditional Dhoni boat.' },
      { day: 4, title: 'Ayurvedic Wellness & Sunset Paddleboarding', desc: 'Revitalizing 90-minute massage at the overwater spa, leisurely paddleboarding across the calm lagoon, and private beach dinner under the stars.' },
      { day: 5, title: 'Lagoon Breakfast & Departure Flight', desc: 'Floating sunrise breakfast in your private villa pool, leisure time for packing, and seaplane transfer back to Male Airport for onward journeys.' }
    ],
    includedServices: [
      '4 nights private overwater villa accommodation',
      'Roundtrip scenic seaplane transfers from Velana Intl Airport',
      'Daily gourmet breakfast & 3-course beachfront dinners',
      'Guided coral reef snorkeling safari with all equipment',
      'Sunset dolphin catamaran excursion with champagne',
      '24/7 dedicated personal island host (Mr./Ms. Friday)'
    ],
    excludedServices: [
      'International roundtrip flights to Male (MLE)',
      'Scuba diving certification courses',
      'Personal travel insurance',
      'Discretionary tips for villa butler and boat crew'
    ],
    facilities: ['Overwater Pool Villa', 'Seaplane Transfers', 'Lagoon Spa Included', 'Dolphin Cruise', 'High-Speed Island Wi-Fi', '24/7 Island Host']
  },

  2: {
    id: 2,
    title: 'Santorini Villa & Yacht Week',
    location: 'Santorini, Greece',
    destination: 'Santorini, Cyclades, Greece',
    category: 'Honeymoon',
    days: 6,
    nights: 5,
    price: 1242,
    rating: 4.85,
    description: 'Iconic whitewashed caldera views, cliffside heated infinity pools, sommelier volcanic wine tastings, and private Aegean catamaran sails.',
    imageUrl: '/package-images/2-santorini.webp',
    images: [
      '/package-images/2-santorini.webp',
      '/destination-images/santorini.webp',
      '/hotel-images/canaves-oia.webp'
    ],
    hotel: {
      name: 'Canaves Oia Suites & Luxury Spa',
      details: 'Iconic cliff-top retreat carved into the caldera basin with infinity pool vistas of the Aegean Sea, minimalist architecture, and champagne sunsets.',
      address: 'Main Street, Oia, Santorini 84702, Greece',
      rating: 4.9,
      amenities: ['Cliffside Infinity Heated Pool', 'Private Plunge Pools', 'Caldera Sunset Champagne Bar', 'Complimentary Daily Yoga', 'High-Speed Wi-Fi', '24-hour In-Villa Dining'],
      imageUrl: '/hotel-images/canaves-oia.webp'
    },
    guide: {
      name: 'Nikos Petrakis',
      bio: 'Santorini native and certified Aegean historian specializing in ancient Akrotiri Minoan ruins, caldera geology, and volcanic viticulture.',
      languages: ['English', 'Greek', 'Italian'],
      rating: 4.9,
      photoUrl: '/guide-avatar.svg'
    },
    transportation: {
      type: 'Private Luxury Catamaran & Mercedes V-Class',
      model: 'Lagoon 520 Yacht & Mercedes-Benz V-Class Chauffeur Van',
      capacity: 'Up to 6 guests with dedicated yacht skipper and crew',
      details: 'All island airport/port transfers, private vineyard transfers, and full-day private catamaran sailing through the volcanic caldera included.',
      imageUrl: '/vehicle-images/range-rover-velar.webp'
    },
    itinerary: [
      { day: 1, title: 'Arrival & Caldera Sunset Welcome', desc: 'VIP greeting at Thira Airport, private transfer to Oia, check-in to your cliffside suite with complimentary chilled Assyrtiko wine, followed by a panoramic sunset dinner.' },
      { day: 2, title: 'Private Catamaran Aegean Cruise', desc: 'Board your private luxury catamaran for a sail to the Red Beach, White Beach, and Nea Kameni volcanic hot springs, complete with barbecue on board.' },
      { day: 3, title: 'Ancient Akrotiri Ruins & Red Beach', desc: 'Guided exploration through the remarkably preserved prehistoric city of Akrotiri, followed by swimming in volcanic bay waters and seaside taverna lunch.' },
      { day: 4, title: 'Volcanic Wineries & Oia Village Stroll', desc: 'Private sommelier-led tasting at Santo Winery and Venetsanos, followed by an evening walk along the marble alleys of Oia as the sunset illuminates the white chapels.' },
      { day: 5, title: 'Pyrgos Medieval Village & Mesa Vouno', desc: 'Discover quiet stone alleys, panoramic views from the highest point of the island, and a farewell seafood dinner at Ammoudi Bay.' },
      { day: 6, title: 'Sunlit Breakfast & Departure Transfer', desc: 'Champagne breakfast on your private terrace, leisurely packing, and private executive transfer to Santorini airport or ferry port.' }
    ],
    includedServices: [
      '5 nights cliffside suite stay at Canaves Oia Suites',
      'Daily champagne breakfast overlooking the caldera',
      'Full-day private catamaran yacht charter with chef lunch',
      'Private air-conditioned Mercedes V-Class ground transfers',
      'Guided Akrotiri archaeological tour & private wine tastings',
      '24/7 dedicated local island host and round-the-clock support'
    ],
    excludedServices: [
      'International flights to/from Athens or Santorini',
      'Personal travel insurance',
      'Visa fees (if applicable)',
      'Personal gratuities for boat crew and drivers'
    ],
    facilities: ['Sea View Suite', 'Private Heated Pool', 'Yacht Cruise Included', 'Sommelier Wine Tasting', 'High-Speed Wi-Fi', '24/7 Guest Care']
  },

  3: {
    id: 3,
    title: 'Bali Wellness & Temple Trails',
    location: 'Bali, Indonesia',
    destination: 'Ubud & Seminyak, Bali, Indonesia',
    category: 'Wellness',
    days: 5,
    nights: 4,
    price: 636,
    rating: 4.8,
    description: 'Immerse in holistic Ayurvedic rejuvenation, sacred water blessings at Tirta Empul, emerald Tegalalang rice terraces, and private jungle pool villas.',
    imageUrl: '/package-images/3-bali.webp',
    images: [
      '/package-images/3-bali.webp',
      '/destination-images/bali.webp',
      '/hotel-images/capella-ubud.webp'
    ],
    hotel: {
      name: 'Capella Ubud Luxury Rainforest Reserve',
      details: 'Secluded luxury sanctuary nestled in the lush rainforest along the sacred Wos River in Ubud, featuring private saltwater plunge pools and holistic wellness healing.',
      address: 'Jl. Raya Dalem, Banjar Triwangsa, Tegallalang, Ubud 80561, Indonesia',
      rating: 4.9,
      amenities: ['Private Rainforest Saltwater Pool', 'Auriga Wellness & Yoga Pavilion', 'Fine Dining Forest Restaurant', 'Complimentary Wi-Fi', 'Personal Capella Culturist', 'Campfire Evening Cinema'],
      imageUrl: '/hotel-images/capella-ubud.webp'
    },
    guide: {
      name: 'Wayan Sudiarta',
      bio: 'Deeply knowledgeable Balinese cultural elder and accredited eco-guide, sharing sacred temple rituals, rice farming heritage, and holistic wellness philosophy.',
      languages: ['English', 'Indonesian', 'Balinese'],
      rating: 4.92,
      photoUrl: '/guide-avatar.svg'
    },
    transportation: {
      type: 'Private Air-Conditioned 4x4 SUV & Chauffeur',
      model: 'Toyota Fortuner 4x4 / Luxury MPV',
      capacity: 'Up to 4 travelers with ample luggage space',
      details: 'Private air-conditioned vehicle with dedicated driver for all day excursions, temple visits, and scenic highland transfers.',
      imageUrl: '/vehicle-images/mercedes-e-class.webp'
    },
    itinerary: [
      { day: 1, title: 'Arrival in Denpasar & Ubud Rainforest Transfer', desc: 'Warm Balinese garland welcome at DPS Airport, private scenic transfer through artisan villages to Capella Ubud, and evening herbal wellness dinner.' },
      { day: 2, title: 'Tirta Empul Water Purification & Rice Terraces', desc: 'Participate in a traditional Melukat water blessing ceremony at Tirta Empul, followed by walking through the emerald Tegalalang rice terraces with local farmers.' },
      { day: 3, title: 'Mount Batur Sunrise & Hot Springs', desc: 'Early gentle scenic viewpoint trek for sunrise over Mount Batur volcano, followed by soaking in natural lakeside thermal hot springs.' },
      { day: 4, title: 'Sacred Monkey Forest & Artisan Silver Workshop', desc: 'Morning visit to the Sacred Monkey Forest Sanctuary, private silver jewelry masterclass in Celuk, and sunset riverside dining.' },
      { day: 5, title: 'Holistic Spa Ritual & Departure Transfer', desc: 'Two-hour Balinese massage and herbal bath ritual, tropical fruit tasting, and comfortable private chauffeur transfer back to the airport.' }
    ],
    includedServices: [
      '4 nights private pool tented villa at Capella Ubud',
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
    facilities: ['Private Pool', 'Holistic Spa', 'Temple Blessing Included', 'Private 4x4 Chauffeur', 'High-Speed Wi-Fi', '24/7 Capella Culturist']
  },

  4: {
    id: 4,
    title: 'Swiss Alps Scenic Glacier Express',
    location: 'Interlaken, Switzerland',
    destination: 'Interlaken & Zermatt, Switzerland',
    category: 'Adventure',
    days: 8,
    nights: 7,
    price: 1985,
    rating: 5.0,
    description: 'Travel through snow-dusted summits, first-class panoramic Glacier Express carriages, Matterhorn vistas, and grand Belle Époque alpine spas.',
    imageUrl: '/package-images/4-swiss-alps.webp',
    images: [
      '/package-images/4-swiss-alps.webp',
      '/destination-images/swiss-alps.webp',
      '/hotel-images/victoria-jungfrau.jpg'
    ],
    hotel: {
      name: 'Victoria-Jungfrau Grand Hotel & Spa',
      details: 'Historic 5-star Swiss palace hotel at the foot of the snow-capped Jungfrau massif, featuring a 5,500 sq m Nescens Spa, grand ballrooms, and alpine terraces.',
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
      photoUrl: '/guide-avatar.svg'
    },
    transportation: {
      type: 'Swiss First Class Panoramic Train & Private Electric Shuttle',
      model: 'Glacier Express Excellence Class & Swiss Travel First Pass',
      capacity: 'First-Class reserved seats with panoramic dome windows',
      details: 'All Swiss rail transfers in First Class, Jungfraujoch Top of Europe cogwheel railway, and Gornergrat Matterhorn railway included.',
      imageUrl: '/vehicle-images/mercedes-e-class.webp'
    },
    itinerary: [
      { day: 1, title: 'Arrival in Zurich & Scenic Train to Interlaken', desc: 'VIP meet at Zurich Airport, First Class train through lakes to Interlaken, check-in at Victoria-Jungfrau with mountain views, and welcome fondue dinner.' },
      { day: 2, title: 'Jungfraujoch - Top of Europe Expedition', desc: 'Board the Eiger Express gondola and cogwheel train to Europe highest railway station at 3,454m. Explore the Ice Palace and Sphinx observatory.' },
      { day: 3, title: 'Lake Brienz Cruise & Giessbach Waterfalls', desc: 'Morning historic steam paddleboat cruise on turquoise Lake Brienz, funicular ride to Grandhotel Giessbach, and afternoon alpine tea.' },
      { day: 4, title: 'Glacier Express to Zermatt', desc: 'Full-day journey across 291 bridges and 91 tunnels aboard the legendary Glacier Express in Excellence Class with 5-course wine-paired lunch.' },
      { day: 5, title: 'Matterhorn & Gornergrat Sunrise', desc: 'Early mountain railway ascent to Gornergrat at 3,089m for breathtaking sunrise reflections of the Matterhorn in Lake Riffelsee.' },
      { day: 6, title: 'Alpine Village Trails & Glacier Palace', desc: 'Guided stroll through old Zermatt village with sun-darkened larch chalets, followed by Matterhorn Glacier Paradise cable car ride.' },
      { day: 7, title: 'Thermal Spa Relaxation & Farewell Banquet', desc: 'Full day of wellness in thermal alpine pools, saunas, and relaxation lounges, capped with a gourmet multi-course Swiss farewell dinner.' },
      { day: 8, title: 'Scenic Return Rail to Zurich Airport', desc: 'Buffet breakfast, First Class train back to Zurich Airport for departure flights.' }
    ],
    includedServices: [
      '7 nights luxury accommodation at Victoria-Jungfrau & Zermatt partner resort',
      'Daily Swiss gourmet buffet breakfast & 3 traditional alpine dinners',
      '8-Day Swiss Travel Pass in First Class with unlimited train and boat travel',
      'All mountain excursions including Jungfraujoch and Gornergrat tickets',
      'Certified Swiss mountain guide for alpine day hikes',
      'Full access to luxury thermal spa, Roman indoor baths, and saunas'
    ],
    excludedServices: [
      'Transatlantic / international airfare',
      'Personal ski equipment rental',
      'Travel medical insurance',
      'Personal incidentals outside included tastings'
    ],
    facilities: ['Glacier Express 1st Class', '5,500m² Luxury Spa', 'Matterhorn Excursion', 'Swiss Chocolate Workshop', 'High-Speed Wi-Fi', 'Certified Alpine Lead']
  },

  5: {
    id: 5,
    title: 'Kyoto Culture & Sakura Blossom Tour',
    location: 'Kyoto, Japan',
    destination: 'Kyoto, Kansai, Japan',
    category: 'Culture',
    days: 7,
    nights: 6,
    price: 955,
    rating: 4.95,
    description: 'Walk through silent moss gardens, ancient cedar shrines, private geisha tea ceremonies, and bamboo forests in the historic heart of Japan.',
    imageUrl: '/package-images/5-kyoto.webp',
    images: [
      '/package-images/5-kyoto.webp',
      '/destination-images/kyoto.webp',
      '/hotel-images/aman-kyoto.jpg'
    ],
    hotel: {
      name: 'Aman Kyoto Luxury Pavilion',
      details: 'Nestled in a secret garden of moss-covered boulders and towering cedar groves at the foot of Hidari Daimonji, offering hot spring onsens and traditional kaiseki banquets.',
      address: '1 Okitayama Washimine-cho, Kita-ku, Kyoto 603-8458, Japan',
      rating: 4.95,
      amenities: ['Natural Mineral Onsen', 'Complimentary Traditional Kaiseki Breakfast', 'High-Speed Wi-Fi', 'Private Garden Terrace', '24/7 Concierge Service', 'Air Conditioning & Heated Floors'],
      imageUrl: '/hotel-images/aman-kyoto.jpg'
    },
    guide: {
      name: 'Kenji Takahashi',
      bio: 'Government Certified Heritage Guide with over 14 years of cultural storytelling, tea ceremony curation, and temple preservation leadership in Kansai.',
      languages: ['English', 'Japanese', 'French'],
      rating: 4.95,
      photoUrl: '/guide-avatar.svg'
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
      'Personal travel insurance',
      'Passport and visa procurement fees',
      'Discretionary tips for chauffeur/guide'
    ],
    facilities: ['Wi-Fi Included', 'Spa / Hot Spring Access', 'Chauffeur Driven', 'English Speaking Lead', 'Vegetarian Meals Available', 'Baggage Dispatch Service']
  },

  6: {
    id: 6,
    title: 'Dubai Desert & Skyline Escape',
    location: 'Dubai, UAE',
    destination: 'Dubai & Arabian Desert, UAE',
    category: 'Luxury',
    days: 4,
    nights: 3,
    price: 450,
    rating: 4.9,
    description: 'Futuristic architectural wonders, private desert luxury tented pavilions, dune bashing safaris, and high-floor Marina dinner cruises.',
    imageUrl: '/package-images/6-dubai.webp',
    images: [
      '/package-images/6-dubai.webp',
      '/destination-images/dubai.webp',
      '/hotel-images/al-maha.webp'
    ],
    hotel: {
      name: 'Al Maha, a Luxury Collection Desert Resort & Spa',
      details: 'Nestled among the desert dunes with private temperature-controlled pools, gazelle views, and handcrafted Arabian antiques.',
      address: 'Dubai Desert Conservation Reserve, Dubai, UAE',
      rating: 4.9,
      amenities: ['Private Heated Plunge Pool', 'Timeless Spa', 'Desert Safari Excursions', 'Fine Arabian Dining', 'Complimentary Wi-Fi', '24/7 Butler Service'],
      imageUrl: '/hotel-images/al-maha.webp'
    },
    guide: {
      name: 'Tariq Al-Fahim',
      bio: 'Licensed UAE cultural ambassador and desert naturalist with deep expertise in Bedouin heritage, falconry, and modern Dubai development.',
      languages: ['English', 'Arabic', 'Russian'],
      rating: 4.9,
      photoUrl: '/guide-avatar.svg'
    },
    transportation: {
      type: 'Private Luxury 4x4 Chauffeur & Yacht Transfer',
      model: 'Range Rover Autobiography & Gulf Craft 42 Yacht',
      capacity: 'Up to 4 guests with VIP comfort',
      details: 'All airport transfers, city chauffeuring, and 4x4 desert reserve transportation included.',
      imageUrl: '/vehicle-images/range-rover-velar.webp'
    },
    itinerary: [
      { day: 1, title: 'Arrival & Downtown Skyline Views', desc: 'Private chauffeur transfer from DXB, Burj Khalifa VIP lounge access, and evening Dubai Fountain dinner.' },
      { day: 2, title: 'Dubai Desert Conservation Safari', desc: 'Transfer to Al Maha Desert Reserve, afternoon wildlife safari, falconry demonstration, and private dune dinner under the stars.' },
      { day: 3, title: 'Dubai Marina & Private Yacht Cruise', desc: 'Return to the coast for an afternoon private yacht charter around Palm Jumeirah and Ain Dubai with canapes.' },
      { day: 4, title: 'Old Souks & Airport Departure', desc: 'Morning abra ride across Dubai Creek, spice and gold souk tour, and executive chauffeur transfer to airport.' }
    ],
    includedServices: [
      '3 nights luxury accommodation (Marina + Al Maha Desert)',
      'Daily gourmet breakfast & desert dinner under the stars',
      'Private 4x4 desert safari with wildlife tracking and falconry',
      'Burj Khalifa Level 148 VIP access and lounge',
      'Private 2-hour yacht cruise along Palm Jumeirah'
    ],
    excludedServices: [
      'International flights',
      'Personal travel insurance',
      'UAE tourist visa (if applicable)',
      'Personal shopping and helicopter tours'
    ],
    facilities: ['Private Desert Pool', 'Yacht Cruise', 'Burj Khalifa VIP', '4x4 Chauffeur', 'High-Speed Wi-Fi', '24/7 Concierge']
  },

  7: {
    id: 7,
    title: 'Paris VIP Art & Seine Gastronomy',
    location: 'Paris, France',
    destination: 'Paris & Versailles, France',
    category: 'Luxury',
    days: 5,
    nights: 4,
    price: 1650,
    rating: 4.85,
    description: 'Left Bank Belle Époque elegance, after-hours Louvre access, private champagne Seine cruise, and sommelier-led Parisian bistro tastings.',
    imageUrl: '/package-images/7-paris.webp',
    images: [
      '/package-images/7-paris.webp',
      '/destination-images/paris.webp',
      '/hotel-images/lutetia-paris.webp'
    ],
    hotel: {
      name: 'Hôtel Lutetia, Saint-Germain-des-Prés',
      details: 'Legendary Left Bank palace hotel combining Belle Époque heritage and contemporary luxury, with Michelin-starred cuisine and Akasha Holistic Spa.',
      address: '45 Boulevard Raspail, 75006 Paris, France',
      rating: 4.88,
      amenities: ['Akasha Holistic Spa & Indoor Pool', 'Michelin-Starred Dining', 'Saint-Germain City Views', 'High-Speed Wi-Fi', '24/7 Concierge Clefs d\'Or'],
      imageUrl: '/hotel-images/lutetia-paris.webp'
    },
    guide: {
      name: 'Claire Beauchamp',
      bio: 'Sorbonne art historian and accredited national museum guide with over a decade curating private tours of the Louvre, Musée d\'Orsay, and Versailles.',
      languages: ['English', 'French', 'Spanish'],
      rating: 4.95,
      photoUrl: '/guide-avatar.svg'
    },
    transportation: {
      type: 'Private Mercedes-Benz E-Class Chauffeur & Private River Yacht',
      model: 'Mercedes-Benz E-Class Sedan & Venetian Riverboat',
      capacity: 'Up to 3 guests with premium luggage room',
      details: 'All Paris airport and city transfers, private excursion to Versailles, and private evening Seine cruise.',
      imageUrl: '/vehicle-images/mercedes-e-class.webp'
    },
    itinerary: [
      { day: 1, title: 'Arrival in Paris & Saint-Germain Stroll', desc: 'VIP meet at CDG airport, private transfer to Hôtel Lutetia, afternoon stroll through Saint-Germain, and evening welcome dinner.' },
      { day: 2, title: 'Louvre VIP Access & Palais-Royal', desc: 'Skip-the-line private tour of the Louvre masterworks before crowds, followed by a gourmet lunch at Le Grand Véfour.' },
      { day: 3, title: 'Versailles Palace & Grand Trianon', desc: 'Chauffeur transfer to the Palace of Versailles. Private tour of the Hall of Mirrors and private golf cart tour through the gardens.' },
      { day: 4, title: 'Montmartre Artists & Champagne Seine Cruise', desc: 'Morning visit to Montmartre with local painter studio stops, followed by a private evening champagne cruise along the Seine.' },
      { day: 5, title: 'Leisurely Breakfast & Airport Departure', desc: 'French croissant breakfast on your balcony, boutique shopping along Boulevard Saint-Germain, and private transfer to CDG airport.' }
    ],
    includedServices: [
      '4 nights luxury accommodation at Hôtel Lutetia Paris',
      'Daily artisan Parisian breakfast and 2 gourmet dinners',
      'Private Louvre and Musée d\'Orsay skip-the-line tours',
      'Private evening champagne Seine river cruise',
      'Roundtrip airport and Versailles chauffeured transfers'
    ],
    excludedServices: [
      'International flights',
      'Personal travel insurance',
      'Schengen visa fees',
      'Personal boutique shopping'
    ],
    facilities: ['Palace Hotel Stay', 'Private Seine Cruise', 'Versailles Excursion', 'Private Chauffeur', 'High-Speed Wi-Fi', 'Clefs d\'Or Concierge']
  },

  8: {
    id: 8,
    title: 'Rajasthan Royal Palaces & Desert Safari',
    location: 'Jaipur & Udaipur, Rajasthan, India',
    destination: 'Jaipur & Udaipur, Rajasthan, India',
    category: 'Culture',
    days: 6,
    nights: 5,
    price: 1280,
    rating: 4.85,
    description: 'Heritage palace stays, Amber Fort elephant views, Lake Pichola private boat cruises, and royal hospitality across the Golden Triangle.',
    imageUrl: '/package-images/8-rajasthan.webp',
    images: [
      '/package-images/8-rajasthan.webp',
      '/destination-images/rajasthan.webp',
      '/hotel-images/rambagh-palace.webp'
    ],
    hotel: {
      name: 'Rambagh Palace, Jaipur',
      details: 'Former residence of the Maharaja of Jaipur, featuring opulent marble corridors, peacock-filled royal gardens, and royal Rajasthani dining.',
      address: 'Bhawani Singh Road, Jaipur 302005, Rajasthan, India',
      rating: 4.95,
      amenities: ['Jiva Grand Spa', 'Indoor & Outdoor Royal Pools', 'Peacock Garden Terraces', 'Heritage Vintage Car Transfers', 'High-Speed Wi-Fi', '24/7 Royal Butler'],
      imageUrl: '/hotel-images/rambagh-palace.webp'
    },
    guide: {
      name: 'Vikram Singh Rathore',
      bio: 'Direct descendant of royal lineage and licensed heritage guide with 16 years leading private cultural tours across Rajasthan forts and palaces.',
      languages: ['English', 'Hindi', 'German'],
      rating: 4.95,
      photoUrl: '/guide-avatar.svg'
    },
    transportation: {
      type: 'Private Air-Conditioned Luxury Innova Crysta & Lake Boat',
      model: 'Toyota Innova Crysta / Luxury Coach & Royal Lake Barge',
      capacity: 'Up to 5 guests with luggage space',
      details: 'All intercity transfers between Jaipur and Udaipur, fort excursions, and Lake Pichola private boat cruise.',
      imageUrl: '/vehicle-images/mercedes-e-class.webp'
    },
    itinerary: [
      { day: 1, title: 'Arrival in Jaipur & Rambagh Welcome', desc: 'Traditional royal aarti and garland welcome at Jaipur airport, check-in to Rambagh Palace, and evening polo bar dinner.' },
      { day: 2, title: 'Amber Fort & City Palace Jaipur', desc: 'Morning visit to the hilltop Amber Fort and Sheesh Mahal, followed by the City Palace royal armory and Hawa Mahal photo stop.' },
      { day: 3, title: 'Scenic Drive to Udaipur & Lake Pichola', desc: 'Comfortable private chauffeur drive through the Aravalli hills to Udaipur. Check-in to lakeside heritage hotel and sunset tea.' },
      { day: 4, title: 'Udaipur City Palace & Jagmandir Island', desc: 'Private guided tour of the grand City Palace complex, followed by a private royal boat cruise on Lake Pichola to Jagmandir Island.' },
      { day: 5, title: 'Saheliyon ki Bari & Artisan Crafts', desc: 'Visit the historic Queen gardens, block-printing workshop, and evening traditional Rajasthani folk music and dance performance.' },
      { day: 6, title: 'Royal Breakfast & Udaipur Departure', desc: 'Lakeside breakfast, souvenir shopping for miniature paintings, and private transfer to Udaipur Maharana Pratap Airport.' }
    ],
    includedServices: [
      '5 nights royal palace accommodation (Jaipur & Udaipur)',
      'Daily royal buffet breakfast & 2 traditional Thali banquets',
      'Private air-conditioned chauffeur vehicle throughout Rajasthan',
      'Licensed royal heritage guide for all fort and palace tours',
      'Lake Pichola private sunset boat cruise tickets'
    ],
    excludedServices: [
      'Domestic/international flights',
      'Personal travel insurance',
      'Indian visa procurement',
      'Camera/video fees at monuments'
    ],
    facilities: ['Palace Stay', 'Lake Pichola Cruise', 'Amber Fort Guided', 'Private Chauffeur', 'High-Speed Wi-Fi', '24/7 Royal Butler']
  }
};

/**
 * Lookup helper returning full package details by numeric or string ID
 */
export function getPackageDetailById(id) {
  const numId = Number(id);
  if (PACKAGE_CATALOG[numId]) return PACKAGE_CATALOG[numId];
  
  // Dynamic fallback for any other package ID
  return {
    id: numId,
    title: `TravelSphere Curated Journey #${numId}`,
    location: 'Global Curated Destination',
    destination: 'Global Destination',
    category: 'Curated Tour',
    days: 6,
    nights: 5,
    price: 1150,
    rating: 4.8,
    description: 'Experience thoughtful travel curated with verified luxury stays, accredited local guides, and seamless private transfers.',
    imageUrl: '/destination-images/santorini.webp',
    images: ['/destination-images/santorini.webp', '/destination-images/kyoto.webp'],
    hotel: {
      name: 'TravelSphere Preferred Boutique Retreat',
      details: 'Hand-picked luxury retreat with panoramic views, personalized guest concierge, and fine culinary dining.',
      address: 'Central Scenic Avenue, Historic Quarter',
      rating: 4.85,
      amenities: ['Breakfast Included', 'High-Speed Wi-Fi', 'Concierge Service', 'Private Balcony', 'Spa Access'],
      imageUrl: '/hotel-images/canaves-oia.webp'
    },
    guide: {
      name: 'Certified Local Specialist',
      bio: 'Accredited local cultural specialist with over a decade of storytelling and private tour leadership.',
      languages: ['English', 'Local Language'],
      rating: 4.9,
      photoUrl: '/guide-avatar.svg'
    },
    transportation: {
      type: 'Private Air-Conditioned Executive Chauffeur',
      model: 'Executive Sedan / Luxury SUV',
      capacity: 'Up to 4 travelers',
      details: 'All airport transfers and excursion chauffeuring included.',
      imageUrl: '/vehicle-images/mercedes-e-class.webp'
    },
    itinerary: [
      { day: 1, title: 'Arrival & Welcome Reception', desc: 'Meet your private chauffeur at the airport, transfer to your hotel, and enjoy a curated welcome dinner.' },
      { day: 2, title: 'Historic Highlights & Heritage Tour', desc: 'Guided morning walking tour through iconic historic landmarks followed by lunch at an authentic local eatery.' },
      { day: 3, title: 'Scenic Excursions & Nature Exploration', desc: 'Explore breathtaking viewpoints and local artisan markets with your dedicated cultural guide.' },
      { day: 4, title: 'Leisure & Culinary Experiences', desc: 'Enjoy a leisurely morning, optional spa relaxation, and a private evening food and wine tasting.' },
      { day: 5, title: 'Cultural Immersion & Hidden Gems', desc: 'Discover quiet neighborhood alleys, local craft workshops, and panoramic sunset viewpoints.' },
      { day: 6, title: 'Farewell Breakfast & Chauffeur Transfer', desc: 'Enjoy breakfast at your hotel, finish packing, and take a private chauffeur transfer to the airport.' }
    ],
    includedServices: [
      '5 nights luxury hotel accommodation',
      'Daily gourmet breakfast',
      'Private air-conditioned airport and excursion transfers',
      'Dedicated certified English-speaking tour guide',
      '24/7 TravelSphere customer support guarantee'
    ],
    excludedServices: [
      'International flights',
      'Travel medical insurance',
      'Discretionary personal tips'
    ],
    facilities: ['Breakfast Included', 'Wi-Fi Included', 'Private Chauffeur', 'Certified Guide', '24/7 Guest Care']
  };
}
