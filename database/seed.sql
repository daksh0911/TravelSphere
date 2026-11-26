-- ====================================================================
-- Travel Package Management System - Complete Database Seed Data
-- Strictly matches database/schema.sql and Project_spiral.pdf (Tables 4 - 22)
-- Compatible with MySQL (WampServer / XAMPP)
-- ====================================================================

USE travel_db;

-- 1. Table: Admin (Table 4)
INSERT INTO admin (admin_id, email, name, password, phone, avatar_url, is_active) VALUES
(1, 'admin@travelsphere.org', 'Chief Travel Administrator', '$2b$10$TN4NqDfDA0acJ1GwnMLybOPI54V3AzEKSLmpDCfdPv5zZylxLrpTa', '+1 415-555-2671', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 1);

-- 2. Table: Users (Table 5) - All 6 Roles with Hashed Passwords
INSERT INTO users (user_id, email, name, password, phone, avatar_url, role, is_active) VALUES
(1, 'customer@travelsphere.org', 'Alice Walker', '$2b$10$3bM7mUfC4Udf8klOdNbJHePI5vgWYv9aPSGnUX6uXKLauZ3J0uzvq', '+91 9876543210', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', 'CUSTOMER', 1),
(2, 'traveler@travelsphere.com', 'Rahul Sharma', '$2b$10$3bM7mUfC4Udf8klOdNbJHePI5vgWYv9aPSGnUX6uXKLauZ3J0uzvq', '+91 9876543210', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'CUSTOMER', 1),
(3, 'agent@travelsphere.org', 'Sarah Jenkins', '$2b$10$8mn.k6.jIJELbB/3UXjaVuzXep/cOII/a39obiJEPmLxql8omBnyC', '+1 555-0101', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', 'TRAVEL_AGENT', 1),
(4, 'hotel@travelsphere.org', 'Kenji Sato', '$2b$10$G3tE68xh4mqt1oI/FQD1ze1OU6FCil3VFnTFA2Gx8EULL88vRWFO2', '+81 75-498-5000', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 'HOTEL_MANAGER', 1),
(5, 'transport@travelsphere.org', 'Michael Chang', '$2b$10$1.vXDdrfSqLwkDsmmLkEreDzjNbfEMIaBQss3BEShwrOU.34VVGuC', '+1 555-0102', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80', 'TRANSPORT_PROVIDER', 1),
(6, 'guide@travelsphere.org', 'Marco Rossi', '$2b$10$XSnZxHJE7xX4USBAGV4VoOxFkQJFXm6xP616WmWauQN5tf/fEi5di', '+1 555-0199', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80', 'TOUR_GUIDE', 1),
(7, 'pending.agent@mail.com', 'David Miller', '$2b$10$8mn.k6.jIJELbB/3UXjaVuzXep/cOII/a39obiJEPmLxql8omBnyC', '+1 555-0104', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', 'TRAVEL_AGENT', 1),
(8, 'pending.hotel@mail.com', 'Amira Al-Mansoor', '$2b$10$G3tE68xh4mqt1oI/FQD1ze1OU6FCil3VFnTFA2Gx8EULL88vRWFO2', '+971 4-366-8888', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', 'HOTEL_MANAGER', 1);

-- 3. Table: Destinations (Table 7)
INSERT INTO destinations (destination_id, name, location, description, image_url, price, rating, is_active) VALUES
(1, 'Kyoto Ancient Temples', 'Kyoto, Japan', 'Historic UNESCO shrines, bamboo groves, and traditional tea houses in Kyoto.', '/destination-images/kyoto.webp', 1450.00, 4.9, 1),
(2, 'Santorini Sunset Caldera', 'Oia, Greece', 'Whitewashed cliffside villas, azure domes, and Aegean Sea sunset views.', '/destination-images/santorini.webp', 1780.00, 4.8, 1),
(3, 'Bali Tropical Escapes', 'Ubud & Seminyak, Indonesia', 'Lush rice terraces, spiritual wellness spas, and sacred Hindu water temples.', '/destination-images/bali.webp', 1120.00, 4.7, 1),
(4, 'Swiss Alps Glacier Peaks', 'Interlaken, Switzerland', 'Snow-capped Alpine summits, glacier trains, and high-altitude hiking.', '/destination-images/swiss-alps.webp', 2100.00, 5.0, 1),
(5, 'Paris VIP Art & Culture', 'Paris, France', 'The Eiffel Tower, Louvre masterpieces, and Seine river gourmet cruises.', '/destination-images/paris.webp', 1650.00, 4.8, 1),
(6, 'Dubai Luxury Skyline', 'Dubai, UAE', 'Burj Khalifa views, Arabian dune safaris, and luxury marina yachting.', '/destination-images/dubai.webp', 1950.00, 4.9, 1);

-- 4. Table: Hotels (Table 8)
INSERT INTO hotels (hotel_id, destination_id, name, description, address, image_url, price_per_unit, rating, amenities, is_active) VALUES
(1, 1, 'Aman Kyoto Luxury Ryokan', 'Secluded forest retreat near Kinkaku-ji temple with natural hot spring onsens.', '1 Okitayama Washimine-cho, Kita-ku, Kyoto, Japan', '/destination-images/kyoto.webp', 450.00, 4.9, '["Free WiFi", "Private Onsen", "Fine Dining", "Tea Pavilion", "Concierge"]', 1),
(2, 2, 'Grace Hotel Santorini Auberge', 'Exclusive cliffside sanctuary in Imerovigli with infinity pool facing caldera.', 'Imerovigli, Santorini 84700, Greece', '/destination-images/santorini.webp', 520.00, 4.9, '["Caldera View", "Infinity Pool", "Champagne Lounge", "Spa Suites", "Free WiFi"]', 1),
(3, 3, 'Mandapa, a Ritz-Carlton Reserve', 'Ayung river valley luxury reserve nestled amidst Ubud rice terraces.', 'Jalan Kedewatan, Ubud, Gianyar, Bali, Indonesia', '/destination-images/bali.webp', 380.00, 4.8, '["Riverfront Villas", "Holistic Spa", "Organic Dining", "Pool", "Butler Service"]', 1),
(4, 4, 'Victoria-Jungfrau Grand Hotel & Spa', 'Historic Swiss palace hotel with panoramic mountain views of the Jungfrau.', 'Hoheweg 41, 3800 Interlaken, Switzerland', '/destination-images/swiss-alps.webp', 490.00, 4.9, '["5500m2 Spa", "Alpine Sauna", "Tennis Courts", "Gourmet Restaurant", "Ski Valet"]', 1),
(5, 5, 'Le Meurice Paris Palace', 'Dorchester Collection palace hotel adjacent to Tuileries Garden.', '228 Rue de Rivoli, 75001 Paris, France', '/destination-images/paris.webp', 650.00, 4.9, '["Alain Ducasse Restaurant", "Valmont Spa", "Butler", "Luxury Suites"]', 1);

-- 5. Table: Hotel_managers (Table 9)
INSERT INTO hotel_managers (manager_id, user_id, hotel_name, hotel_license, property_type, total_rooms, city, hotel_address, rating, contact_email, contact_phone, status) VALUES
(1, 4, 'Aman Kyoto Luxury Ryokan', 'HTL-JPN-7740', 'Luxury Ryokan', 26, 'Kyoto', '1 Okitayama Washimine-cho, Kita-ku, Kyoto, Japan', 4.92, 'hotel@travelsphere.org', '+81 75-498-5000', 'ACTIVE'),
(2, 8, 'Desert Oasis Luxury Resort', 'HTL-UAE-3398', 'Resort & Spa', 120, 'Dubai', '100 Palm Jumeirah Avenue, Dubai, UAE', 4.88, 'pending.hotel@mail.com', '+971 4-366-8888', 'PENDING');

-- 6. Table: Packages (Table 10)
INSERT INTO packages (package_id, destination_id, title, description, days, nights, price, rating, image_url, features, is_active) VALUES
(1, 1, 'Kyoto Cherry Blossom & Imperial Culture', 'Historic UNESCO temples, blooming sakura gardens, tea ceremonies, and bamboo groves.', 7, 6, 1450.00, 4.9, '/destination-images/kyoto.webp', '["✈ Flights Included", "🚆 Bullet Train Pass", "🏨 5★ Traditional Ryokan", "🍵 Tea Ceremony"]', 1),
(2, 2, 'Santorini Sunset Caldera Villa & Cruise', 'Caldera rim suite stays, private catamaran sunset cruise, and wine tasting.', 6, 5, 1780.00, 4.8, '/destination-images/santorini.webp', '["✈ Flights Included", "⛵ Private Catamaran Cruise", "🏨 Caldera Suite", "🍷 Wine Tasting"]', 1),
(3, 3, 'Bali Sacred Temples & Luxury Wellness', 'Ubud jungle suites, Tirta Empul water purification, and Seminyak beach sunsets.', 5, 4, 1120.00, 4.7, '/destination-images/bali.webp', '["✈ Flights Included", "🏨 Riverfront Villa", "🧘 Yoga & Spa Sessions", "🚗 Chauffeur"]', 1),
(4, 4, 'Swiss Alps Scenic Glacier Express', 'Matterhorn glacier excursions, First Cliff Walk, and panoramic First Class trains.', 8, 7, 2100.00, 5.0, '/destination-images/swiss-alps.webp', '["✈ Flights Included", "🚆 Glacier Express Pass", "🏨 Alpine Chalet Hotel", "🎿 Mountain Excursions"]', 1),
(5, 5, 'Paris VIP Art & Seine Culinary Discovery', 'Louvre VIP entry, Montmartre walks, Eiffel Tower champagne lounge, and Seine dining.', 5, 4, 1650.00, 4.8, '/destination-images/paris.webp', '["✈ Flights Included", "🏨 5★ Palace Hotel", "🎟 Louvre VIP Pass", "🍷 Gourmet Cruise"]', 1);

-- 7. Table: Tour_guides (Table 11) - With user_id (Task 10)
INSERT INTO tour_guides (guide_id, user_id, name, bio, photo_url, languages, rating, price_per_day, is_active) VALUES
(1, 6, 'Marco Rossi', 'Certified European Heritage guide with 10+ years leading Alpine and Italian cultural expeditions.', '/destination-images/paris.webp', '["English", "Italian", "French"]', 4.9, 140.00, 1),
(2, NULL, 'Kenji Tanaka', 'Kyoto native and licensed historian specializing in Zen gardens, Shinto shrines, and imperial cuisine.', '/destination-images/kyoto.webp', '["English", "Japanese"]', 5.0, 160.00, 1),
(3, NULL, 'Eleni Papadopoulos', 'Santorini local archaeologist with insider access to Akrotiri excavations and volcanic caldera tours.', '/destination-images/santorini.webp', '["English", "Greek"]', 4.8, 130.00, 1);

-- 8. Table: Transport_providers (Table 12)
INSERT INTO transport_providers (tprovider_id, user_id, company_name, business_license, fleet_size, vehicle_types, service_regions, rating, contact_email, contact_phone, office_address, status) VALUES
(1, 5, 'Apex Luxury Transports & Logistics', 'TPR-2026-4410', 45, '["Executive Sedan", "SUV 7-Seater", "Luxury Coach", "Express Jet"]', '["Global Hubs", "Europe", "Asia", "Americas"]', 4.90, 'transport@travelsphere.org', '+1 555-0102', '78 Fleet Way, Newark, NJ', 'ACTIVE');

-- 9. Table: Travel_agents (Table 13)
INSERT INTO travel_agents (tagent_id, user_id, agency_name, license_number, commission_rate, experience_years, destinations_covered, rating, contact_email, contact_phone, office_address, status) VALUES
(1, 3, 'Horizon Escapes & Expeditions', 'TAG-2026-9901', 12.50, 8, '["Paris", "Kyoto", "Santorini", "Bali", "Swiss Alps"]', 4.85, 'agent@travelsphere.org', '+1 555-0101', '101 Horizon Boulevard, Suite 400, San Francisco, CA', 'ACTIVE'),
(2, 7, 'Wanderlust Global Tours', 'TAG-2026-8812', 10.00, 4, '["Swiss Alps", "Havana", "Reykjavik"]', 4.50, 'pending.agent@mail.com', '+1 555-0104', '450 Ocean Drive, Miami, FL', 'PENDING');

-- 10. Table: Trip_plans (Table 14)
INSERT INTO trip_plans (tplan_id, user_id, destination_id, title, start_date, end_date, budget, itinerary, status) VALUES
(1, 1, 1, 'My Dream Kyoto Cultural Journey', '2026-11-20', '2026-11-26', 2200.00, '{"days": [{"day": 1, "title": "Arrival in Tokyo and Shinkansen to Kyoto"}, {"day": 2, "title": "Arashiyama Bamboo Grove and Kinkaku-ji Golden Pavilion"}]}', 'planned'),
(2, 2, 4, 'Swiss Alps Winter Ski & Rail Expedition', '2026-12-05', '2026-12-12', 3100.00, '{"days": [{"day": 1, "title": "Zurich arrival and scenic transfer to Interlaken"}, {"day": 2, "title": "Jungfraujoch Top of Europe rail excursion"}]}', 'planned');

-- 11. Table: Vehicles (Table 15)
INSERT INTO vehicles (vehicle_id, tprovider_id, type, model, capacity, price_per_day, image_url, is_active) VALUES
(1, 1, 'flight', 'Air France AF-104 Transatlantic Jet', 280, 420.00, '/destination-images/paris.webp', 1),
(2, 1, 'train', 'JR Central Nozomi Shinkansen', 350, 148.00, '/destination-images/kyoto.webp', 1),
(3, 1, 'bus', 'Alpine Panorama Luxury Coach', 45, 68.00, '/destination-images/swiss-alps.webp', 1),
(4, 1, 'car', 'Mercedes-Benz E-Class Executive Sedan', 4, 120.00, '/vehicle-images/mercedes-e-class.webp', 1),
(5, 1, 'car', 'Range Rover Sport Luxury SUV', 7, 185.00, '/vehicle-images/bmw-5-series.webp', 1);

-- 12. Table: Coupons (Table 18)
INSERT INTO coupons (coupon_id, code, discount_type, discount_value, min_amount, max_uses, used_count, expires_at, is_active) VALUES
(1, 'WELCOME10', 'percentage', 10.00, 100.00, 500, 12, '2027-12-31', 1),
(2, 'SUMMER50', 'fixed', 50.00, 300.00, 200, 24, '2027-08-31', 1),
(3, 'VIP100', 'fixed', 100.00, 800.00, 100, 8, '2027-12-31', 1),
(4, 'SPIRAL25', 'percentage', 25.00, 500.00, 150, 5, '2027-12-31', 1);

-- 13. Table: Bookings (Table 6)
INSERT INTO bookings (booking_id, user_id, package_id, hotel_id, vehicle_id, guide_id, coupon_id, start_date, end_date, guests, subtotal, discount, total_amount, status, notes) VALUES
(1, 1, 1, 1, 1, 1, 1, '2026-11-20', '2026-11-27', 2, 2900.00, 290.00, 2610.00, 'confirmed', 'VIP Welcome Package · Flight AF-104 & Ryokan Suite'),
(2, 1, NULL, 2, NULL, NULL, NULL, '2026-12-10', '2026-12-15', 2, 2600.00, 0.00, 2600.00, 'confirmed', 'Grace Hotel Santorini Luxury Caldera Suite'),
(3, 1, NULL, NULL, 4, NULL, NULL, '2026-11-25', '2026-11-29', 2, 480.00, 0.00, 480.00, 'confirmed', 'Mercedes-Benz E-Class Car Rental · Chauffeur Included'),
(4, 2, 4, 4, 2, NULL, 2, '2026-09-10', '2026-09-17', 2, 4200.00, 50.00, 4150.00, 'completed', 'Finished Journey · Swiss Alps Glacier Tour');

-- 14. Table: Wishlist (Table 16)
INSERT INTO wishlist (wishlist_id, user_id, target_type, target_id) VALUES
(1, 1, 'package', 2),
(2, 1, 'package', 4),
(3, 2, 'package', 1);

-- 15. Table: Contact_messages (Table 17)
INSERT INTO contact_messages (contact_id, name, email, subject, message, is_read) VALUES
(1, 'Johnathan Doe', 'jdoe@example.com', 'Custom Group Tour Inquiry', 'We are planning a corporate retreat for 20 travelers in the Swiss Alps.', 0),
(2, 'Maria Garcia', 'mgarcia@example.com', 'Visa Guidance for Japan', 'Do Indian passport holders receive expedited visas through your partner program?', 1);

-- 16. Table: Faqs (Table 19)
INSERT INTO faqs (faq_id, question, answer, category, sort_order, is_active) VALUES
(1, 'How do I book a tour package?', 'Select your preferred destination or package from the Tour Packages section, review the day-wise itinerary, select your dates, and click Reserve Package to proceed to secure checkout.', 'Booking', 1, 1),
(2, 'What payment methods do you accept?', 'TravelSphere accepts all major Credit/Debit Cards, UPI payments, Net Banking, and digital Wallets with 256-bit SSL encryption.', 'Payments', 2, 1),
(3, 'What is your cancellation and refund policy?', 'All standard verified bookings feature free cancellation up to 48 hours before departure with 100% automatic refund to your original payment method.', 'Cancellations', 3, 1),
(4, 'Can I book flights, trains, and cars separately?', 'Yes! You can reserve standalone flights, high-speed rail tickets, express buses, and private car rentals directly from the Vehicles and Dashboard portals.', 'Transport', 4, 1),
(5, 'How are tour guides assigned?', 'When booking packages or custom itineraries, licensed local guides can be selected based on spoken languages, credentials, and customer ratings.', 'Guides', 5, 1);

-- 17. Table: Notifications (Table 20)
INSERT INTO notifications (notification_id, user_id, title, message, is_read) VALUES
(1, 1, 'Booking Confirmed!', 'Your reservation for Kyoto Cherry Blossom & Imperial Culture (#TS-BK-1001) has been confirmed.', 1),
(2, 1, 'Voucher Ready', 'Your official PDF voucher and QR boarding pass are ready for download in your dashboard.', 0),
(3, 2, 'Welcome to TravelSphere', 'Welcome to the Premier Travel Package Management System!', 1);

-- 18. Table: Payments (Table 21) - Supporting Task 1
INSERT INTO payments (payment_id, booking_id, user_id, amount, method, status, transaction_ref) VALUES
(1, 1, 1, 2610.00, 'card', 'completed', 'TXN_CARD_99214710'),
(2, 2, 1, 2600.00, 'upi', 'completed', 'TXN_UPI_88201944'),
(3, 3, 1, 480.00, 'netbanking', 'completed', 'TXN_NET_55219011'),
(4, 4, 2, 4150.00, 'wallet', 'completed', 'TXN_WLT_11029481');

-- 19. Table: Reviews (Table 22)
INSERT INTO reviews (review_id, user_id, booking_id, rating, comment) VALUES
(1, 2, 4, 5, 'Unbelievable experience! The Swiss Alps glacier tour was seamless from train connections to chalet accommodations.'),
(2, 1, 1, 5, 'The Kyoto itinerary and Ryokan stay exceeded all expectations. Exceptional curation and customer support.');
