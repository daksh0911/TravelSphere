/**
 * AI-Powered Dynamic Travel Itinerary Generator Engine
 * Generates tailored, realistic day-by-day schedules with cost breakdowns,
 * hotel pairings, and transit logistics.
 */

const DESTINATION_KNOWLEDGE = {
  kyoto: {
    name: 'Kyoto, Japan',
    vibeTags: ['Culture', 'Temples', 'Culinary', 'Gardens'],
    currency: 'JPY',
    hotels: {
      budget: { name: 'Pocket Hotel Karasuma', price: 95 },
      moderate: { name: 'Kyoto Granbell Hotel Gion', price: 210 },
      luxury: { name: 'Aman Kyoto Forest Retreat', price: 1250 }
    },
    daysTemplates: [
      {
        morning: 'Sunrise walk at Fushimi Inari Taisha through 10,000 vermilion Torii gates before crowds arrive.',
        afternoon: 'Stroll along the Philosopher’s Path; explore Ginkaku-ji (Silver Pavilion) and zen rock gardens.',
        evening: 'Traditional kaiseki dinner in Gion lantern district with evening Geisha culture walk.',
        transit: 'Kyoto City Bus 206 & Keihan Main Line',
        food: 'Fresh matcha soba noodles & seasonal wagashi'
      },
      {
        morning: 'Arashiyama Bamboo Grove at dawn, followed by the UNESCO Tenryu-ji temple gardens.',
        afternoon: 'Cross the historic Togetsukyo Bridge; visit Iwatayama Monkey Park for sweeping valley views.',
        evening: 'Private green tea ceremony experience with a certified Urasenke master.',
        transit: 'Randen Tram Scenic Line',
        food: 'Yudofu (simmered soft tofu hotpot) at Shoraian'
      },
      {
        morning: 'Kinkaku-ji (Golden Pavilion) reflecting on the mirror pond; walk through Ryoan-ji zen dry landscape.',
        afternoon: 'Browse Nishiki Market "Kyoto\'s Kitchen" for skewers, pickled vegetables, and street eats.',
        evening: 'Sunset over Kamogawa River banks; craft cocktail tasting at Bar Rocking Chair.',
        transit: 'Hankyu Kyoto Line & City Subway',
        food: 'Yakitori & local Kyoto microbrew'
      },
      {
        morning: 'Day excursion to historic Uji: visit Byodoin Temple (featured on the 10-yen coin).',
        afternoon: 'Traditional matcha grinding workshop and riverbank boat ride.',
        evening: 'Return to Kyoto Station; admire the futuristic architectural rooftop skyway.',
        transit: 'JR Nara Line Rapid',
        food: 'Uji matcha parfait & green tea gyozas'
      },
      {
        morning: 'Kiyomizu-dera wooden stage with views over cherry blossom and maple-covered valleys.',
        afternoon: 'Wander preserved stone lanes of Ninenzaka and Sannenzaka; browse handmade Kiyomizu ceramics.',
        evening: 'Farewell celebratory dinner at Pontocho Alley overlooking the lighted river.',
        transit: 'Walking & private taxi transfer',
        food: 'A5 Wagyu sukiyaki with local sake pairing'
      }
    ]
  },
  'swiss-alps': {
    name: 'Swiss Alps & Interlaken, Switzerland',
    vibeTags: ['Adventure', 'Nature', 'Glaciers', 'Scenic Rails'],
    currency: 'CHF',
    hotels: {
      budget: { name: 'Valley Hostel Lauterbrunnen', price: 110 },
      moderate: { name: 'Hotel Bellevue des Alpes Kleine Scheidegg', price: 340 },
      luxury: { name: 'Victoria-Jungfrau Grand Hotel & Spa', price: 1470 }
    },
    daysTemplates: [
      {
        morning: 'Board the GoldenPass scenic rail from Zurich into Interlaken between Lakes Thun and Brienz.',
        afternoon: 'Ascend to Harder Kulm panoramic viewpoint overlooking the Eiger, Mönch, and Jungfrau peaks.',
        evening: 'Fondue and raclette dinner in an authentic timber chalet.',
        transit: 'SBB Swiss Federal Railways & Funicular',
        food: 'Swiss Gruyère & Emmental fondue'
      },
      {
        morning: 'Cogwheel train ride up to Jungfraujoch "Top of Europe" at 3,454m altitude.',
        afternoon: 'Explore the Ice Palace and hike the snow plateau of the Aletsch Glacier.',
        evening: 'Descend through Kleine Scheidegg; relax at an Alpine thermal spa.',
        transit: 'Jungfrau Railway Cogwheel',
        food: 'Rösti with fried farm egg and Alpine ham'
      },
      {
        morning: 'Wander through Lauterbrunnen "Valley of 72 Waterfalls"; visit subterranean Staubbach Falls.',
        afternoon: 'Cable car up to car-free cliffside village of Mürren with North Face valley vistas.',
        evening: 'Sunset drinks at Birg thrill walk suspended over 1,000m sheer vertical rock face.',
        transit: 'Schilthorn Cableway',
        food: 'Alplermagronen (Alpine macaroni with apple compote)'
      },
      {
        morning: 'Scenic cruise across turquoise Lake Brienz to the fairy-tale Giessbach Waterfalls.',
        afternoon: 'Hike the wooded lake trail and tour Brienz traditional woodcarving workshops.',
        evening: 'Fine dining overlooking the lake at Grandhotel Giessbach terrace.',
        transit: 'BLS Lake Brienz Steamer',
        food: 'Fresh mountain trout with almond butter'
      },
      {
        morning: 'Glacier canyon walk in Grindelwald; test courage on the spiderweb nets over rushing glacier torrents.',
        afternoon: 'Grindelwald-First Cliff Walk by Tissot followed by mountain cart descent.',
        evening: 'Fireside digestif with Swiss single malt and artisanal Lindt chocolate pairing.',
        transit: 'Firstbahn Eiger Gondola',
        food: 'Veal Zurichoise with buttered spätzli'
      }
    ]
  },
  santorini: {
    name: 'Santorini, Greece',
    vibeTags: ['Romance', 'Aegean Views', 'Volcano', 'Sunset'],
    currency: 'EUR',
    hotels: {
      budget: { name: 'Fira Backpackers Sanctuary', price: 80 },
      moderate: { name: 'Astra Suites Imerovigli', price: 290 },
      luxury: { name: 'Canaves Oia Suites Luxury Retreat', price: 950 }
    },
    daysTemplates: [
      {
        morning: 'Arrive at Thira; settle into cliffside caldera suites with sparkling Aegean horizons.',
        afternoon: 'Walk the caldera footpath between Fira and Firostefani; photograph the blue-domed churches.',
        evening: 'Sunset cocktail tasting in Imerovigli "Balcony to the Aegean".',
        transit: 'Private island transfer',
        food: 'Grilled octopus & Santorini fava puree'
      },
      {
        morning: 'Scenic morning hike from Imerovigli to Oia along the volcanic crater rim (10km).',
        afternoon: 'Swim at Ammoudi Bay beneath red cliffs; enjoy waterside seafood lunch.',
        evening: 'World-famous sunset view from the Byzantine Castle ruins of Oia.',
        transit: 'Coastal footpath & caldera boat',
        food: 'Tomato gefthedes & fresh red mullet'
      },
      {
        morning: 'Catamaran sailing charter to the volcanic hot springs and Palea Kameni craters.',
        afternoon: 'Anchor at the Red Beach and White Beach for snorkeling in crystal-clear waters.',
        evening: 'Sunset BBQ on board with local Assyrtiko white wine.',
        transit: 'Luxury Lagoon 450 Catamaran',
        food: 'Souvlaki skewers & Greek village salad'
      },
      {
        morning: 'Explore prehistoric Akrotiri archaeological site (the "Minoan Pompeii").',
        afternoon: 'Wine tasting at Santo Wines overlooking the entire caldera archipelago.',
        evening: 'Stroll through medieval Pyrgos village; dinner at a quiet courtyard taverna.',
        transit: 'Private open-top Suzuki Jimny',
        food: 'Santorini melitinia (sweet cheese pastries)'
      },
      {
        morning: 'Relaxing beach morning on the volcanic black sands of Perissa and Kamari.',
        afternoon: 'Shop boutique jewelry, linen, and local art in Oia marble corridors.',
        evening: 'Candlelit cliffside private terrace dinner celebrating the final night.',
        transit: 'Private driver transfer',
        food: 'Lobster pasta with Ouzo and saffron'
      }
    ]
  },
  maldives: {
    name: 'Maldives Private Atolls',
    vibeTags: ['Luxury', 'Marine Life', 'Overwater Villas', 'Wellness'],
    currency: 'USD',
    hotels: {
      budget: { name: 'Maafushi Island Guesthouse', price: 120 },
      moderate: { name: 'Kuramathi Maldives Ocean Resort', price: 420 },
      luxury: { name: 'Patina Maldives, Fari Islands', price: 1650 }
    },
    daysTemplates: [
      {
        morning: 'Scenic seaplane transfer over the North Malé Atoll turquoise lagoons.',
        afternoon: 'Check-in to overwater lagoon villa; direct snorkeling from your private sundeck.',
        evening: 'Sunset barefoot champagne toast on a private powder-white sandbank.',
        transit: 'Trans Maldivian Airways Twin Otter Seaplane',
        food: 'Catch of the day yellowfin tuna with lime and coconut'
      },
      {
        morning: 'Baa Atoll UNESCO Biosphere dive: encounter manta rays and harmless reef sharks.',
        afternoon: 'Overwater glass-floor spa treatment with organic marine algae and hot stones.',
        evening: 'Stargazing dinner prepared by private island chef under the equatorial sky.',
        transit: 'Private wooden Dhoni boat',
        food: 'Mas huni with warm roshi flatbread'
      },
      {
        morning: 'Guided coral restoration workshop and sea turtle safari with resident marine biologist.',
        afternoon: 'Stand-up paddleboarding across calm shallow lagoons to an uninhabited islet.',
        evening: 'Open-air cinema under the stars on the beach with gourmet coconut gelato.',
        transit: 'Electric island buggy & paddleboards',
        food: 'Maldivian reef fish curry with basmati rice'
      },
      {
        morning: 'Deep-sea game fishing cruise or dolphin watching cruise at sunrise.',
        afternoon: 'Afternoon tea served on a floating breakfast tray in your private plunge pool.',
        evening: 'Underwater wine cellar dinner surrounded by 360-degree living coral reefs.',
        transit: 'Twin-engine luxury yacht',
        food: 'Seared scallops with passionfruit reduction'
      },
      {
        morning: 'Sunrise yoga pavilion session overlooking the infinity horizon.',
        afternoon: 'Final dip in the coral garden; souvenir collection of eco-certified crafts.',
        evening: 'Sunset seaplane flight back to Malé International Airport.',
        transit: 'Speedboat & Seaplane',
        food: 'Fresh tropical mango, mangosteen, and tender coconut water'
      }
    ]
  }
};

// Generic fallback template for any destination
const GENERIC_DESTINATION_TEMPLATE = {
  vibeTags: ['Discovery', 'Highlights', 'Local Culture', 'Scenic Views'],
  currency: 'USD',
  hotels: {
    budget: { name: 'Heritage Boutique Inn', price: 85 },
    moderate: { name: 'Grand Horizon City Center Hotel', price: 195 },
    luxury: { name: 'The Royal Sovereign Palace & Spa', price: 680 }
  },
  daysTemplates: [
    {
      morning: 'Arrival and private transfer to curated hotel. Relax and acclimate to local surroundings.',
      afternoon: 'Orientation walking tour through the historic district and main market squares.',
      evening: 'Welcome dinner featuring celebrated regional culinary specialties at a top-rated bistro.',
      transit: 'Private executive transfer',
      food: 'Signature local cuisine & welcome aperitif'
    },
    {
      morning: 'Priority early-access visit to the destination\'s most iconic landmark before public queues.',
      afternoon: 'Guided cultural immersion tour with a certified local historian and storyteller.',
      evening: 'Scenic viewpoint sunset watch followed by an atmospheric rooftop dinner.',
      transit: 'Chartered city coach & walking route',
      food: 'Traditional lunch at a historic family-owned eatery'
    },
    {
      morning: 'Half-day nature escape or coastal excursion to explore surrounding landscapes.',
      afternoon: 'Artisanal market visit: experience local handicraft workshops and specialty tastings.',
      evening: 'Evening cultural performance or twilight boat cruise along the waterfront.',
      transit: 'Scenic rail or regional shuttle',
      food: 'Farm-to-table seasonal harvest banquet'
    },
    {
      morning: 'Off-the-beaten-path neighborhood exploration: hidden courtyards, cafes, and museums.',
      afternoon: 'Leisurely lunch followed by personalized shopping or wellness spa time.',
      evening: 'Food & cocktail crawl through vibrant culinary alleyways with a foodie guide.',
      transit: 'Electric tram & pedestrian promenades',
      food: 'Street gastronomy & signature desserts'
    },
    {
      morning: 'Sunrise photography walk at a serene scenic overlook.',
      afternoon: 'Final souvenir browsing and packing; farewell lunch with panoramic views.',
      evening: 'Private transfer to the departure airport / hub for onward journey.',
      transit: 'Executive departure limousine',
      food: 'Celebratory farewell feast'
    }
  ]
};

/**
 * Generates an end-to-end intelligent travel itinerary based on inputs.
 */
export function generateItinerary({
  destinationId = 'kyoto',
  destinationName = 'Kyoto, Japan',
  origin = 'New York, JFK',
  durationDays = 5,
  vibe = 'Culture & Heritage',
  budgetTier = 'moderate',
  travelers = 2
}) {
  const destKey = destinationId.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const destData = DESTINATION_KNOWLEDGE[destKey] || {
    ...GENERIC_DESTINATION_TEMPLATE,
    name: destinationName
  };

  const selectedHotel = destData.hotels[budgetTier] || destData.hotels.moderate;
  const numDays = Math.min(Math.max(Number(durationDays) || 5, 2), 14);

  // Build day by day
  const days = [];
  for (let i = 0; i < numDays; i++) {
    const templateIndex = i % destData.daysTemplates.length;
    const template = destData.daysTemplates[templateIndex];
    const dayNumber = i + 1;

    days.push({
      day: dayNumber,
      title: `Day ${dayNumber}: ${dayNumber === 1 ? 'Arrival & First Impressions' : dayNumber === numDays ? 'Farewell & Scenic Departures' : `Exploring ${destData.name.split(',')[0]} Highlights`}`,
      morning: template.morning,
      afternoon: template.afternoon,
      evening: template.evening,
      transit: template.transit,
      dining: template.food,
      dailyCostEst: Math.round(selectedHotel.price + 110 + (budgetTier === 'luxury' ? 240 : budgetTier === 'budget' ? 35 : 85))
    });
  }

  // Cost breakdown
  const hotelTotal = selectedHotel.price * (numDays - 1) * Math.ceil(travelers / 2);
  const transitTotal = (budgetTier === 'luxury' ? 420 : budgetTier === 'budget' ? 120 : 260) * travelers;
  const activitiesTotal = (budgetTier === 'luxury' ? 550 : budgetTier === 'budget' ? 150 : 320) * travelers;
  const diningTotal = (budgetTier === 'luxury' ? 680 : budgetTier === 'budget' ? 180 : 380) * travelers;
  const totalCost = hotelTotal + transitTotal + activitiesTotal + diningTotal;

  return {
    id: `ITIN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    destinationName: destData.name,
    origin,
    durationDays: numDays,
    durationNights: numDays - 1,
    vibe,
    budgetTier,
    travelers: Number(travelers) || 2,
    hotel: selectedHotel,
    days,
    costs: {
      accommodations: hotelTotal,
      transit: transitTotal,
      activities: activitiesTotal,
      dining: diningTotal,
      total: totalCost,
      perPerson: Math.round(totalCost / (Number(travelers) || 1))
    },
    meta: {
      generatedAt: new Date().toISOString(),
      sustainabilityScore: '94% (Eco-verified Partner)',
      vibeTags: destData.vibeTags || ['Culture', 'Adventure']
    }
  };
}

export default generateItinerary;

