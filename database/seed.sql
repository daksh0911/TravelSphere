-- ====================================================================
-- Travel Management System - Database Seed Data
-- ====================================================================

-- 1. Insert Base Users
INSERT INTO users (id, name, email, password_hash, role, phone, status) VALUES
(1, 'Admin User', 'admin@travel.com', '$2b$10$e8N8...hash', 'ADMIN', '+1-555-0100', 'ACTIVE'),
(2, 'Sarah Jenkins', 'sarah@horizon-travel.com', '$2b$10$e8N8...hash', 'TRAVEL_AGENT', '+1-555-0101', 'ACTIVE'),
(3, 'Michael Chang', 'michael@apex-transports.com', '$2b$10$e8N8...hash', 'TRANSPORT_PROVIDER', '+1-555-0102', 'ACTIVE'),
(4, 'Elena Rostova', 'elena@grand-palace-hotel.com', '$2b$10$e8N8...hash', 'HOTEL_MANAGER', '+1-555-0103', 'ACTIVE'),
(5, 'David Miller', 'david@wanderlust-tours.com', '$2b$10$e8N8...hash', 'TRAVEL_AGENT', '+1-555-0104', 'PENDING'),
(6, 'Carlos Rodriguez', 'carlos@speedy-fleets.com', '$2b$10$e8N8...hash', 'TRANSPORT_PROVIDER', '+1-555-0105', 'ACTIVE'),
(7, 'Amira Al-Mansoor', 'amira@desert-oasis-resort.com', '$2b$10$e8N8...hash', 'HOTEL_MANAGER', '+1-555-0106', 'ACTIVE');

-- 2. Insert Travel Agents
INSERT INTO travel_agents (user_id, agency_name, license_number, commission_rate, experience_years, destinations_covered, rating, contact_email, contact_phone, office_address, status) VALUES
(2, 'Horizon Escapes & Expeditions', 'TAG-2026-9901', 12.50, 8, '["Paris", "Kyoto", "Santorini", "Bali"]', 4.85, 'sarah@horizon-travel.com', '+1-555-0101', '101 Horizon Boulevard, Suite 400, San Francisco, CA', 'ACTIVE'),
(5, 'Wanderlust Global Tours', 'TAG-2026-8812', 10.00, 4, '["Swiss Alps", "Havana", "Reykjavik"]', 4.50, 'david@wanderlust-tours.com', '+1-555-0104', '450 Ocean Drive, Miami, FL', 'PENDING');

-- 3. Insert Transport Providers
INSERT INTO transport_providers (user_id, company_name, business_license, fleet_size, vehicle_types, service_regions, rating, contact_email, contact_phone, office_address, status) VALUES
(3, 'Apex Luxury Transports & Logistics', 'TPR-2026-4410', 45, '["Executive Sedan", "SUV 7-Seater", "Mercedes Sprinter Van", "Luxury Coach"]', '["New York", "Boston", "Washington DC"]', 4.90, 'michael@apex-transports.com', '+1-555-0102', '78 Fleet Way, Newark, NJ', 'ACTIVE'),
(6, 'Speedy Fleet Express', 'TPR-2026-5521', 20, '["Standard Sedan", "Minibus", "Airport Shuttle"]', '["Miami", "Orlando", "Tampa"]', 4.65, 'carlos@speedy-fleets.com', '+1-555-0105', '120 Airport Express Highway, Miami, FL', 'ACTIVE');

-- 4. Insert Hotel Managers
INSERT INTO hotel_managers (user_id, hotel_name, hotel_license, property_type, total_rooms, city, hotel_address, rating, contact_email, contact_phone, status) VALUES
(4, 'Grand Palace Hotel & Spa', 'HTL-2026-7734', 'Luxury Hotel', 180, 'Kyoto', '45 Cherry Blossom Lane, Higashiyama, Kyoto, Japan', 4.92, 'elena@grand-palace-hotel.com', '+1-555-0103', 'ACTIVE'),
(7, 'Desert Oasis Luxury Resort', 'HTL-2026-3398', 'Resort', 120, 'Dubai', '100 Palm Jumeirah Avenue, Dubai, UAE', 4.88, 'amira@desert-oasis-resort.com', '+1-555-0106', 'ACTIVE');
